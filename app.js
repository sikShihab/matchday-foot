import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkzD-_MAZscUk1OTCTdI9tZHZfL4J_u-0",
  authDomain: "matchday-44a3c.firebaseapp.com",
  projectId: "matchday-44a3c",
  storageBucket: "matchday-44a3c.firebasestorage.app",
  messagingSenderId: "810548681671",
  appId: "1:810548681671:web:1483c2f2b0baa9b49cd7e2",
  measurementId: "G-R5M5NVBY92"
};
const ADMIN_EMAIL = "ikshihab2002@gmail.com";
const DEFAULT_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="24" fill="#143321"/><text x="60" y="72" fill="#dff8e7" font-family="Arial" font-size="40" text-anchor="middle">M</text></svg>`);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, "us-central1");
const bookMatchFn = httpsCallable(functions, "bookMatch");
const cancelBookingFn = httpsCallable(functions, "cancelBooking");
const kickPlayerFn = httpsCallable(functions, "kickPlayer");
enableIndexedDbPersistence(db).catch(() => {});

const els = {
  splash: document.getElementById("splash"),
  appShell: document.getElementById("appShell"),
  authView: document.getElementById("authView"),
  playerView: document.getElementById("playerView"),
  adminView: document.getElementById("adminView"),
  profileBtn: document.getElementById("profileBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  toast: document.getElementById("toast"),
  tabs: [...document.querySelectorAll(".tab")],
  signupOnly: [...document.querySelectorAll(".signup-only")],
  authForm: document.getElementById("authForm"),
  authSubmitBtn: document.getElementById("authSubmitBtn"),
  authHint: document.getElementById("authHint"),
  googleBtn: document.getElementById("googleBtn"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),
  nameInput: document.getElementById("nameInput"),
  phoneInput: document.getElementById("phoneInput"),
  featuredMatch: document.getElementById("featuredMatch"),
  bookingList: document.getElementById("bookingList"),
  bookingMeta: document.getElementById("bookingMeta"),
  announcementList: document.getElementById("announcementList"),
  adminAnnouncementList: document.getElementById("adminAnnouncementList"),
  profileCard: document.getElementById("profileCard"),
  profileDialog: document.getElementById("profileDialog"),
  closeProfileBtn: document.getElementById("closeProfileBtn"),
  profileForm: document.getElementById("profileForm"),
  profileName: document.getElementById("profileName"),
  profilePhone: document.getElementById("profilePhone"),
  profilePhotoUrl: document.getElementById("profilePhotoUrl"),
  profilePhotoFile: document.getElementById("profilePhotoFile"),
  createMatchForm: document.getElementById("createMatchForm"),
  matchLocation: document.getElementById("matchLocation"),
  matchDate: document.getElementById("matchDate"),
  matchTime: document.getElementById("matchTime"),
  matchSlots: document.getElementById("matchSlots"),
  matchStatus: document.getElementById("matchStatus"),
  matchHeadline: document.getElementById("matchHeadline"),
  adminMatchList: document.getElementById("adminMatchList"),
  announcementForm: document.getElementById("announcementForm"),
  announcementInput: document.getElementById("announcementInput"),
  statPlayers: document.getElementById("statPlayers"),
  statMatches: document.getElementById("statMatches"),
  statOpenMatches: document.getElementById("statOpenMatches"),
  statBookings: document.getElementById("statBookings")
};

let authMode = "login";
let currentUserProfile = null;
let currentMatchUnsub = null;
let bookingsUnsub = null;
let announcementsUnsub = null;
let adminMatchesUnsub = null;
let analyticsUsersUnsub = null;
let analyticsMatchesUnsub = null;

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => els.toast.classList.add("hidden"), 2600);
}

function setView(view) {
  [els.authView, els.playerView, els.adminView].forEach(v => v.classList.add("hidden"));
  view.classList.remove("hidden");
}

function formatDate(dateStr, timeStr) {
  if (!dateStr) return "TBD";
  const date = new Date(`${dateStr}T${timeStr || "00:00"}`);
  if (Number.isNaN(date.getTime())) return `${dateStr} ${timeStr || ""}`.trim();
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': '&quot;', "'": '&#39;' }[m]));
}

function profileFromUser(user) {
  return {
    name: user.displayName || currentUserProfile?.name || "Player",
    email: user.email || "",
    phone: currentUserProfile?.phone || "",
    photoURL: user.photoURL || currentUserProfile?.photoURL || DEFAULT_AVATAR,
    role: user.email === ADMIN_EMAIL ? "admin" : "player"
  };
}

function renderProfileCard(user) {
  const p = profileFromUser(user);
  els.profileCard.innerHTML = `
    <div class="profile-mini">
      <img class="avatar" src="${p.photoURL || DEFAULT_AVATAR}" alt="${escapeHtml(p.name)}" />
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <div class="muted">${escapeHtml(p.email)}</div>
        <div class="muted">${escapeHtml(p.phone || "No phone added")}</div>
      </div>
    </div>
  `;
}

async function ensureUserProfile(user, extra = {}) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const base = {
    name: extra.name || user.displayName || snap.data()?.name || "Player",
    email: user.email || "",
    phone: extra.phone ?? snap.data()?.phone ?? "",
    photoURL: extra.photoURL || user.photoURL || snap.data()?.photoURL || DEFAULT_AVATAR,
    role: user.email === ADMIN_EMAIL ? "admin" : "player",
    updatedAt: serverTimestamp()
  };
  if (!snap.exists()) base.createdAt = serverTimestamp();
  await setDoc(userRef, base, { merge: true });
  const fresh = await getDoc(userRef);
  currentUserProfile = fresh.data();
}

function switchAuthMode(mode) {
  authMode = mode;
  els.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === mode));
  els.signupOnly.forEach(el => el.classList.toggle("hidden", mode !== "signup"));
  els.authSubmitBtn.textContent = mode === "login" ? "Login" : "Create account";
  els.authHint.textContent = mode === "login" ? "Login to continue." : "Create your player account.";
}

function matchPosterHtml(match, bookedCount, currentUserBooked) {
  const total = match.totalSlots || 0;
  const left = Math.max(total - bookedCount, 0);
  const percent = total ? Math.min((bookedCount / total) * 100, 100) : 0;
  const statusClass = left > 0 && match.status === "open" ? "status-green" : "status-red";
  const statusText = match.status !== "open" ? "MATCH CLOSED" : left > 0 ? `${left} SLOTS LEFT` : "MATCH FULL";
  const paymentSelect = currentUserBooked ? "" : `
    <select id="paymentMethod" class="select-inline">
      <option value="bkash">bKash</option>
      <option value="onsite">On-spot</option>
    </select>`;
  return `
    <div class="poster-card__content">
      <span class="pill">${escapeHtml(match.headline || "Featured match")}</span>
      <h2 class="poster-card__title">MATCHDAY</h2>
      <p class="poster-card__venue">${escapeHtml(match.location)}</p>
      <div class="poster-meta">
        <div class="poster-stat">Date & time<strong>${escapeHtml(formatDate(match.date, match.time))}</strong></div>
        <div class="poster-stat">Players<strong>${bookedCount} / ${total}</strong></div>
        <div class="poster-stat">Payment<strong>${currentUserBooked?.paymentMethod || "Choose on booking"}</strong></div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Slot progress</span><span>${Math.round(percent)}%</span></div>
        <div class="progress-bar"><span style="width:${percent}%"></span></div>
      </div>
      <div class="status-banner ${statusClass}">${statusText}</div>
      <div class="poster-actions">
        ${currentUserBooked ? `<button class="secondary-btn" id="cancelBookingBtn">Cancel my booking</button>` : `<button class="primary-btn" id="bookBtn" ${left === 0 || match.status !== "open" ? "disabled" : ""}>Book this match</button>${paymentSelect}`}
        <button class="ghost-btn" id="downloadPosterBtn">Download poster</button>
      </div>
    </div>`;
}

async function downloadPoster(match, bookedCount) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
  grad.addColorStop(0, "#07140d");
  grad.addColorStop(1, "#123322");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(34,197,94,.12)";
  ctx.fillRect(70, 70, 940, 1210);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 104px Arial";
  ctx.fillText("MATCHDAY", 90, 210);
  ctx.font = "700 62px Arial";
  ctx.fillText(match.location, 90, 320);
  ctx.font = "500 42px Arial";
  ctx.fillStyle = "#d7f5df";
  ctx.fillText(formatDate(match.date, match.time), 90, 410);
  ctx.font = "700 52px Arial";
  ctx.fillStyle = "#86efac";
  ctx.fillText(`${bookedCount} / ${match.totalSlots} Players`, 90, 500);
  const left = Math.max(match.totalSlots - bookedCount, 0);
  ctx.fillStyle = left > 0 && match.status === "open" ? "#86efac" : "#fca5a5";
  ctx.fillText(match.status !== "open" ? "MATCH CLOSED" : left > 0 ? `${left} SLOTS LEFT` : "MATCH FULL", 90, 585);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `matchday-${match.location.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.click();
}

async function bookMatch(matchId) {
  try {
    const paymentMethod = document.getElementById("paymentMethod")?.value || "onsite";
    await bookMatchFn({ matchId, paymentMethod });
    showToast("Booking confirmed.");
  } catch (err) {
    showToast(err.message || err?.details || "Booking failed.");
  }
}

async function cancelBooking(matchId) {
  try {
    await cancelBookingFn({ matchId });
    showToast("Booking cancelled.");
  } catch (err) {
    showToast(err.message || err?.details || "Could not cancel booking.");
  }
}

function listenAnnouncements(targetEl) {
  if (announcementsUnsub) announcementsUnsub();
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(10));
  announcementsUnsub = onSnapshot(q, snap => {
    if (snap.empty) {
      targetEl.innerHTML = '<div class="empty-state">No announcements yet.</div>';
      return;
    }
    targetEl.innerHTML = snap.docs.map(d => {
      const a = d.data();
      return `<div class="announcement-item"><strong>${escapeHtml(a.text)}</strong><div class="muted small">${a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : "Just now"}</div></div>`;
    }).join("");
  });
}

function listenFeaturedMatches() {
  if (currentMatchUnsub) currentMatchUnsub();
  if (bookingsUnsub) bookingsUnsub();
  const q = query(collection(db, "matches"), orderBy("date", "asc"), orderBy("time", "asc"));
  currentMatchUnsub = onSnapshot(q, snap => {
    if (snap.empty) {
      els.featuredMatch.innerHTML = '<div class="poster-card__content"><span class="pill">No matches</span><h2 class="poster-card__title">MATCHDAY</h2><p class="poster-card__venue">Admin has not created a match yet.</p></div>';
      els.bookingList.innerHTML = '<div class="empty-state">No match available.</div>';
      els.bookingMeta.textContent = "No match available";
      return;
    }
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const active = docs.find(m => m.status === "open") || docs[0];
    if (bookingsUnsub) bookingsUnsub();
    bookingsUnsub = onSnapshot(query(collection(db, "matches", active.id, "bookings"), orderBy("createdAt", "asc")), bsnap => {
      const bookedCount = bsnap.size;
      const currentUserBooked = bsnap.docs.find(d => d.id === auth.currentUser?.uid)?.data();
      els.featuredMatch.innerHTML = matchPosterHtml(active, bookedCount, currentUserBooked);
      const players = bsnap.docs.map(d => d.data());
      els.bookingMeta.textContent = `${bookedCount} booked • ${Math.max(active.totalSlots - bookedCount, 0)} left`;
      els.bookingList.innerHTML = players.length ? players.map((p, idx) => `
        <div class="booking-card">
          <strong>${idx + 1}. ${escapeHtml(p.name || "Player")}</strong>
          <div class="muted">${escapeHtml(p.paymentMethod || "onsite")}</div>
          <div class="muted small">${escapeHtml(p.phone || "No contact")}</div>
        </div>`).join("") : '<div class="empty-state">No one has booked yet.</div>';
      document.getElementById("bookBtn")?.addEventListener("click", () => bookMatch(active.id));
      document.getElementById("cancelBookingBtn")?.addEventListener("click", () => cancelBooking(active.id));
      document.getElementById("downloadPosterBtn")?.addEventListener("click", () => downloadPoster(active, bookedCount));
    });
  });
}

function listenAdminMatches() {
  if (adminMatchesUnsub) adminMatchesUnsub();
  const q = query(collection(db, "matches"), orderBy("createdAt", "desc"));
  adminMatchesUnsub = onSnapshot(q, snap => {
    if (snap.empty) {
      els.adminMatchList.innerHTML = '<div class="empty-state">No matches created yet.</div>';
      return;
    }
    els.adminMatchList.innerHTML = snap.docs.map(d => `<div class="match-admin-card" data-match-id="${d.id}"><div class="muted">Loading match...</div></div>`).join("");
    snap.docs.forEach(d => {
      const match = { id: d.id, ...d.data() };
      onSnapshot(collection(db, "matches", match.id, "bookings"), bsnap => {
        const booked = bsnap.size;
        const players = bsnap.docs.map(p => ({ id: p.id, ...p.data() }));
        const host = els.adminMatchList.querySelector(`[data-match-id="${match.id}"]`);
        if (!host) return;
        host.innerHTML = `
          <div class="row"><strong>${escapeHtml(match.location)}</strong><span class="pill">${escapeHtml(formatDate(match.date, match.time))}</span></div>
          <div class="row"><span class="muted">${booked} / ${match.totalSlots} booked</span><span class="muted">Status: ${match.status}</span></div>
          <div class="row inline-actions">
            <button class="ghost-btn" data-action="toggle">${match.status === "open" ? "Close" : "Reopen"}</button>
            <button class="ghost-btn" data-action="poster">Download poster</button>
          </div>
          <div class="row booking-grid">${players.length ? players.map(p => `
            <div class="booking-card">
              <strong>${escapeHtml(p.name || "Player")}</strong>
              <div class="muted small">${escapeHtml(p.paymentMethod || "onsite")}</div>
              <button class="danger-btn" data-kick="${p.id}">Kick player</button>
            </div>`).join("") : '<div class="empty-state">No bookings yet.</div>'}</div>
        `;
        host.querySelector('[data-action="toggle"]').onclick = async () => {
          await updateDoc(doc(db, "matches", match.id), { status: match.status === "open" ? "closed" : "open" });
          showToast(match.status === "open" ? "Match closed." : "Match reopened.");
        };
        host.querySelector('[data-action="poster"]').onclick = () => downloadPoster(match, booked);
        host.querySelectorAll("[data-kick]").forEach(btn => {
          btn.onclick = async () => {
            try {
              await kickPlayerFn({ matchId: match.id, userId: btn.dataset.kick });
              showToast("Player removed.");
            } catch (err) {
              showToast(err.message || err?.details || "Could not remove player.");
            }
          };
        });
      });
    });
  });
}

function listenAdminAnalytics() {
  analyticsUsersUnsub?.();
  analyticsMatchesUnsub?.();
  analyticsUsersUnsub = onSnapshot(collection(db, "users"), usersSnap => {
    els.statPlayers.textContent = String(usersSnap.docs.filter(d => d.data().role !== "admin").length);
  });
  analyticsMatchesUnsub = onSnapshot(collection(db, "matches"), matchesSnap => {
    const matches = matchesSnap.docs.map(d => d.data());
    els.statMatches.textContent = String(matches.length);
    els.statOpenMatches.textContent = String(matches.filter(m => m.status === "open").length);
    els.statBookings.textContent = String(matches.reduce((sum, m) => sum + Number(m.bookedCount || 0), 0));
  });
}

els.tabs.forEach(tab => tab.addEventListener("click", () => switchAuthMode(tab.dataset.tab)));

els.authForm.addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const email = els.emailInput.value.trim();
    const password = els.passwordInput.value.trim();
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Logged in.");
    } else {
      const name = els.nameInput.value.trim();
      const phone = els.phoneInput.value.trim();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await ensureUserProfile(cred.user, { name, phone });
      showToast("Account created.");
    }
  } catch (err) {
    showToast(err.message || "Authentication failed.");
  }
});

els.googleBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await ensureUserProfile(cred.user);
    showToast("Signed in with Google.");
  } catch (err) {
    showToast(err.message || "Google sign-in failed.");
  }
});

els.logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  showToast("Logged out.");
});

els.profileBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return;
  const p = profileFromUser(user);
  els.profileName.value = p.name;
  els.profilePhone.value = p.phone;
  els.profilePhotoUrl.value = p.photoURL.startsWith("data:") ? "" : p.photoURL;
  els.profilePhotoFile.value = "";
  els.profileDialog.showModal();
});
els.closeProfileBtn.addEventListener("click", () => els.profileDialog.close());

els.profileForm.addEventListener("submit", async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  try {
    let photoURL = els.profilePhotoUrl.value.trim();
    const file = els.profilePhotoFile.files?.[0];
    if (file) {
      const fileRef = ref(storage, `profilePhotos/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      photoURL = await getDownloadURL(fileRef);
    }
    const name = els.profileName.value.trim() || "Player";
    const phone = els.profilePhone.value.trim();
    await updateProfile(user, { displayName: name, photoURL: photoURL || user.photoURL || DEFAULT_AVATAR });
    await ensureUserProfile(user, { name, phone, photoURL: photoURL || user.photoURL || DEFAULT_AVATAR });
    renderProfileCard(user);
    els.profileDialog.close();
    showToast("Profile updated.");
  } catch (err) {
    showToast(err.message || "Could not update profile.");
  }
});

els.createMatchForm?.addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "matches"), {
      location: els.matchLocation.value.trim(),
      date: els.matchDate.value,
      time: els.matchTime.value,
      totalSlots: Number(els.matchSlots.value),
      bookedCount: 0,
      status: els.matchStatus.value,
      headline: els.matchHeadline.value.trim() || "Featured match",
      createdAt: serverTimestamp()
    });
    els.createMatchForm.reset();
    els.matchSlots.value = 14;
    els.matchStatus.value = "open";
    showToast("Match created.");
  } catch (err) {
    showToast(err.message || "Could not create match.");
  }
});

els.announcementForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const text = els.announcementInput.value.trim();
  if (!text) return;
  try {
    await addDoc(collection(db, "announcements"), { text, createdAt: serverTimestamp() });
    els.announcementInput.value = "";
    showToast("Announcement posted.");
  } catch (err) {
    showToast(err.message || "Could not post announcement.");
  }
});

onAuthStateChanged(auth, async user => {
  els.splash.classList.add("is-hidden");
  els.appShell.classList.remove("hidden");
  if (!user) {
    els.profileBtn.classList.add("hidden");
    els.logoutBtn.classList.add("hidden");
    setView(els.authView);
    return;
  }
  await ensureUserProfile(user);
  els.logoutBtn.classList.remove("hidden");
  if (user.email === ADMIN_EMAIL) {
    els.profileBtn.classList.add("hidden");
    setView(els.adminView);
    listenAdminMatches();
    listenAnnouncements(els.adminAnnouncementList);
    listenAdminAnalytics();
  } else {
    els.profileBtn.classList.remove("hidden");
    setView(els.playerView);
    renderProfileCard(user);
    listenFeaturedMatches();
    listenAnnouncements(els.announcementList);
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
