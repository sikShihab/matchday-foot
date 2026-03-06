const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const ADMIN_EMAIL = 'ikshihab2002@gmail.com';

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please log in first.');
  }
  return request.auth;
}

function requireAdmin(request) {
  const auth = requireAuth(request);
  if ((auth.token.email || '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new HttpsError('permission-denied', 'Admin access required.');
  }
  return auth;
}

exports.bookMatch = onCall({ region: 'us-central1' }, async request => {
  const auth = requireAuth(request);
  const { matchId, paymentMethod } = request.data || {};
  if (!matchId) throw new HttpsError('invalid-argument', 'matchId is required.');
  const safePayment = paymentMethod === 'bkash' ? 'bkash' : 'onsite';

  const matchRef = db.collection('matches').doc(matchId);
  const bookingRef = matchRef.collection('bookings').doc(auth.uid);
  const userRef = db.collection('users').doc(auth.uid);

  await db.runTransaction(async tx => {
    const [matchSnap, bookingSnap, userSnap] = await Promise.all([
      tx.get(matchRef),
      tx.get(bookingRef),
      tx.get(userRef)
    ]);

    if (!matchSnap.exists) throw new HttpsError('not-found', 'Match not found.');

    const match = matchSnap.data();
    const bookedCount = Number(match.bookedCount || 0);
    const totalSlots = Number(match.totalSlots || 0);
    if (match.status !== 'open') throw new HttpsError('failed-precondition', 'This match is closed.');
    if (bookingSnap.exists) throw new HttpsError('already-exists', 'You already booked this match.');
    if (bookedCount >= totalSlots) throw new HttpsError('failed-precondition', 'Match is full.');

    const profile = userSnap.exists ? userSnap.data() : {};
    tx.set(bookingRef, {
      userId: auth.uid,
      name: profile.name || auth.token.name || 'Player',
      email: auth.token.email || '',
      photoURL: profile.photoURL || '',
      phone: profile.phone || '',
      paymentMethod: safePayment,
      createdAt: FieldValue.serverTimestamp()
    });

    const nextBooked = bookedCount + 1;
    tx.update(matchRef, {
      bookedCount: nextBooked,
      status: nextBooked >= totalSlots ? 'closed' : 'open',
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  return { ok: true };
});

exports.cancelBooking = onCall({ region: 'us-central1' }, async request => {
  const auth = requireAuth(request);
  const { matchId } = request.data || {};
  if (!matchId) throw new HttpsError('invalid-argument', 'matchId is required.');

  const matchRef = db.collection('matches').doc(matchId);
  const bookingRef = matchRef.collection('bookings').doc(auth.uid);

  await db.runTransaction(async tx => {
    const [matchSnap, bookingSnap] = await Promise.all([tx.get(matchRef), tx.get(bookingRef)]);
    if (!matchSnap.exists) throw new HttpsError('not-found', 'Match not found.');
    if (!bookingSnap.exists) throw new HttpsError('not-found', 'Booking not found.');

    const match = matchSnap.data();
    const totalSlots = Number(match.totalSlots || 0);
    const bookedCount = Math.max(Number(match.bookedCount || 0) - 1, 0);

    tx.delete(bookingRef);
    tx.update(matchRef, {
      bookedCount,
      status: bookedCount < totalSlots ? 'open' : match.status,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  return { ok: true };
});

exports.kickPlayer = onCall({ region: 'us-central1' }, async request => {
  requireAdmin(request);
  const { matchId, userId } = request.data || {};
  if (!matchId || !userId) throw new HttpsError('invalid-argument', 'matchId and userId are required.');

  const matchRef = db.collection('matches').doc(matchId);
  const bookingRef = matchRef.collection('bookings').doc(userId);

  await db.runTransaction(async tx => {
    const [matchSnap, bookingSnap] = await Promise.all([tx.get(matchRef), tx.get(bookingRef)]);
    if (!matchSnap.exists) throw new HttpsError('not-found', 'Match not found.');
    if (!bookingSnap.exists) throw new HttpsError('not-found', 'Player booking not found.');

    const match = matchSnap.data();
    const totalSlots = Number(match.totalSlots || 0);
    const bookedCount = Math.max(Number(match.bookedCount || 0) - 1, 0);

    tx.delete(bookingRef);
    tx.update(matchRef, {
      bookedCount,
      status: bookedCount < totalSlots ? 'open' : match.status,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  return { ok: true };
});

exports.closePastMatches = onSchedule({ schedule: 'every 60 minutes', region: 'us-central1' }, async () => {
  const now = new Date();
  const snapshot = await db.collection('matches').where('status', '==', 'open').get();
  const batch = db.batch();
  let changed = 0;

  snapshot.forEach(docSnap => {
    const match = docSnap.data();
    if (!match.date || !match.time) return;
    const start = new Date(`${match.date}T${match.time}:00`);
    if (!Number.isNaN(start.getTime()) && start < now) {
      batch.update(docSnap.ref, {
        status: 'closed',
        updatedAt: FieldValue.serverTimestamp()
      });
      changed += 1;
    }
  });

  if (changed > 0) {
    await batch.commit();
  }
  logger.info(`Closed ${changed} past matches`);
});
