import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  collection,
  query,
  where,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const state = {
  user: null,
  userProfile: null,
  matches: [],
  featuredMatch: null,
  featuredUnsub: null,
  bookingsUnsub: null,
  announcementsUnsub: null,
  adminMatchesUnsub: null
};

const $ = (id) => document.getElementById(id);

const els = {
  splash: $("splash"),
  authView: $("authView"),
  playerView: $("playerView"),
  adminView: $("adminView"),
  profileModal: $("profileModal"),
  logoutBtn: $("logoutBtn"),
  profileBtn: $("profileBtn"),
  toast: $("toast"),

  loginTab: $("loginTab"),
  signupTab: $("signupTab"),
  authTitle: $("authTitle"),
  authSubmitBtn: $("authSubmitBtn"),
  googleBtn: $("googleBtn"),
  emailInput: $("email"),
  passwordInput: $("password"),

  playerProfileName: $("playerProfileName"),
  playerProfileEmail: $("playerProfileEmail"),
  playerProfilePhone: $("playerProfilePhone"),
  playerAvatar: $("playerAvatar"),

  announcementList: $("announcementList"),

  heroBadge: $("heroBadge"),
  heroVenue: $("heroVenue"),
  heroDate: $("heroDate"),
  heroPlayers: $("heroPlayers"),
  heroPayment: $("heroPayment"),
  heroSlotsText: $("heroSlotsText"),
  heroProgress: $("heroProgress"),
  heroBookBtn: $("heroBookBtn"),
  heroCancelBtn: $("heroCancelBtn"),
  heroPaymentSelect: $("heroPaymentSelect"),
  heroDownloadBtn: $("heroDownloadBtn"),
  playersList: $("playersList"),
  playersMeta: $("playersMeta"),

  adminMatchForm: $("adminMatchForm"),
  adminVenue: $("adminVenue"),
  adminDate: $("adminDate"),
  adminTime: $("adminTime"),
  adminSlots: $("adminSlots"),
  adminLabel: $("adminLabel"),
  adminMatchesList: $("adminMatchesList"),

  announcementForm: $("announcementForm"),
  announcementText: $("announcementText"),
  adminAnnouncementList: $("adminAnnouncementList"),

  profileForm: $("profileForm"),
  profileName: $("profileName"),
  profilePhone: $("profilePhone"),
  profilePhotoUrl: $("profilePhotoUrl"),
  profilePhotoFile: $("profilePhotoFile"),
  closeProfileModal: $("closeProfileModal")
};

let authMode = "login";

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}

function setView(view) {
  [els.authView, els.playerView, els.adminView].forEach((v) => v?.classList.add("hidden"));
  view?.classList.remove("hidden");
}

function formatMatchDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "TBD";
  const d = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(d)) return `${dateStr} ${timeStr}`;
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

async function ensureUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const role = user.email === ADMIN_EMAIL ? "admin" : "player";
    const name = user.displayName || user.email?.split("@")[0] || "Player";

    await setDoc(userRef, {
      uid: user.uid,
      name,
      email: user.email || "",
      phone: "",
      photoURL: user.photoURL || "",
      role,
      createdAt: serverTimestamp()
    });
  }

  const updated = await getDoc(userRef);
  state.userProfile = updated.data();
}

function openProfileModal() {
  els.profileModal?.classList.remove("hidden");
  const p = state.userProfile || {};
  els.profileName.value = p.name || "";
  els.profilePhone.value = p.phone || "";
  els.profilePhotoUrl.value = p.photoURL || "";
}

function closeProfileModal() {
  els.profileModal?.classList.add("hidden");
}

async function saveProfile(e) {
  e.preventDefault();
  try {
    const user = auth.currentUser;
    if (!user) return;

    let photoURL = els.profilePhotoUrl.value.trim();

    if (els.profilePhotoFile.files[0]) {
      const file = els.profilePhotoFile.files[0];
      const storageRef = ref(storage, `profile-photos/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    const payload = {
      name: els.profileName.value.trim() || "Player",
      phone: els.profilePhone.value.trim(),
      photoURL
    };

    await updateDoc(doc(db, "users", user.uid), payload);
    await updateProfile(user, {
      displayName: payload.name,
      photoURL: payload.photoURL || null
    });

    await ensureUserProfile(user);
    renderProfileCard(user);
    closeProfileModal();
    showToast("Profile updated.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Profile update failed.");
  }
}

function renderProfileCard(user) {
  const p = state.userProfile || {};
  const letter = (p.name || user.email || "P").charAt(0).toUpperCase();

  if (els.playerProfileName) els.playerProfileName.textContent = p.name || "Player";
  if (els.playerProfileEmail) els.playerProfileEmail.textContent = p.email || user.email || "";
  if (els.playerProfilePhone) els.playerProfilePhone.textContent = p.phone || "No phone added";

  if (els.playerAvatar) {
    if (p.photoURL) {
      els.playerAvatar.innerHTML = `<img src="${p.photoURL}" alt="Profile" />`;
    } else {
      els.playerAvatar.textContent = letter;
    }
  }
}

function authUiMode(mode) {
  authMode = mode;
  const isLogin = mode === "login";
  els.loginTab?.classList.toggle("active", isLogin);
  els.signupTab?.classList.toggle("active", !isLogin);
  if (els.authTitle) els.authTitle.textContent = isLogin ? "Welcome" : "Create account";
  if (els.authSubmitBtn) els.authSubmitBtn.textContent = isLogin ? "Login" : "Sign up";
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = els.emailInput.value.trim();
  const password = els.passwordInput.value;

  if (!email || !password) {
    showToast("Enter email and password.");
    return;
  }

  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Logged in.");
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      showToast("Account created.");
    }
  } catch (err) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") showToast("Email already in use.");
    else if (err.code === "auth/invalid-credential") showToast("Wrong email or password.");
    else showToast(err.message || "Authentication failed.");
  }
}

async function handleGoogleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
    showToast("Logged in with Google.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Google sign-in failed.");
  }
}

async function logout() {
  try {
    await signOut(auth);
    showToast("Logged out.");
  } catch (err) {
    console.error(err);
    showToast("Logout failed.");
  }
}

function stopLiveListeners() {
  state.featuredUnsub?.();
  state.bookingsUnsub?.();
  state.announcementsUnsub?.();
  state.adminMatchesUnsub?.();
  state.featuredUnsub = null;
  state.bookingsUnsub = null;
  state.announcementsUnsub = null;
  state.adminMatchesUnsub = null;
}

function renderPlayers(bookings) {
  if (!els.playersList || !els.playersMeta || !state.featuredMatch) return;

  const total = Number(state.featuredMatch.totalSlots || 0);
  const booked = bookings.length;
  const left = Math.max(total - booked, 0);

  els.playersMeta.textContent = `${booked} booked • ${left} left`;

  if (!bookings.length) {
    els.playersList.innerHTML = `<div class="empty-box">No one has booked yet.</div>`;
    return;
  }

  els.playersList.innerHTML = bookings.map((b) => {
    const name = escapeHtml(b.name || b.email || "Player");
    const payment = escapeHtml(b.paymentMethod || "N/A");
    const canKick = state.user?.email === ADMIN_EMAIL;
    return `
      <div class="player-chip">
        <div>
          <strong>${name}</strong>
          <div>${payment}</div>
        </div>
        ${canKick ? `<button class="kick-btn" data-userid="${b.userId}">Kick</button>` : ""}
      </div>
    `;
  }).join("");

  els.playersList.querySelectorAll(".kick-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await kickPlayerDirect(state.featuredMatch.id, btn.dataset.userid);
    });
  });
}

function updateHero(match, bookings) {
  if (!match) return;

  const total = Number(match.totalSlots || 0);
  const booked = bookings.length;
  const left = Math.max(total - booked, 0);
  const percent = total ? Math.round((booked / total) * 100) : 0;
  const myBooking = state.user ? bookings.find((b) => b.userId === state.user.uid) : null;
  const isClosed = match.status === "closed" || left <= 0;

  els.heroBadge.textContent = match.label || "Match";
  els.heroVenue.textContent = match.location || "Venue";
  els.heroDate.textContent = formatMatchDate(match.date, match.time);
  els.heroPlayers.textContent = `${booked} / ${total}`;
  els.heroPayment.textContent = myBooking ? myBooking.paymentMethod : "Choose on booking";
  els.heroSlotsText.textContent = left > 0 ? `${left} SLOTS LEFT` : "MATCH FULL";
  els.heroSlotsText.classList.toggle("full", left <= 0);
  els.heroProgress.style.width = `${percent}%`;

  els.heroBookBtn.disabled = !!myBooking || isClosed;
  els.heroCancelBtn.disabled = !myBooking;
}

function listenFeaturedMatches() {
  state.featuredUnsub?.();
  const q = query(
    collection(db, "matches"),
    where("status", "==", "open"),
    orderBy("date"),
    limit(1)
  );

  state.featuredUnsub = onSnapshot(q, (snap) => {
    if (snap.empty) {
      state.featuredMatch = null;
      els.heroVenue.textContent = "No active match";
      els.heroDate.textContent = "Admin has not created one yet";
      els.heroPlayers.textContent = "0 / 0";
      els.heroPayment.textContent = "Choose on booking";
      els.heroSlotsText.textContent = "NO MATCH";
      els.heroProgress.style.width = "0%";
      els.playersList.innerHTML = `<div class="empty-box">No active match available.</div>`;
      els.playersMeta.textContent = "";
      return;
    }

    const d = snap.docs[0];
    state.featuredMatch = { id: d.id, ...d.data() };
    listenBookingsForMatch(d.id);
  }, (err) => {
    console.error(err);
    showToast("Could not load match.");
  });
}

function listenBookingsForMatch(matchId) {
  state.bookingsUnsub?.();
  state.bookingsUnsub = onSnapshot(
    query(collection(db, "matches", matchId, "bookings"), orderBy("createdAt")),
    (snap) => {
      const bookings = snap.docs.map((docSnap) => docSnap.data());
      renderPlayers(bookings);
      updateHero(state.featuredMatch, bookings);
    },
    (err) => {
      console.error(err);
      showToast("Could not load bookings.");
    }
  );
}

function listenAnnouncements(target) {
  state.announcementsUnsub?.();
  state.announcementsUnsub = onSnapshot(
    query(collection(db, "announcements"), orderBy("createdAt", "desc")),
    (snap) => {
      if (!target) return;
      if (snap.empty) {
        target.innerHTML = `<div class="empty-box">No announcements yet.</div>`;
        return;
      }

      target.innerHTML = snap.docs.map((d) => {
        const a = d.data();
        const date = a.createdAt?.toDate?.()
          ? a.createdAt.toDate().toLocaleString()
          : "";
        return `
          <div class="announcement-card">
            <strong>${escapeHtml(a.text || "")}</strong>
            <div>${date}</div>
          </div>
        `;
      }).join("");
    },
    (err) => {
      console.error(err);
      showToast("Could not load announcements.");
    }
  );
}

async function bookMatchDirect() {
  try {
    const user = auth.currentUser;
    const match = state.featuredMatch;
    if (!user || !match) return;

    const paymentMethod = els.heroPaymentSelect.value;
    const bookingRef = doc(db, "matches", match.id, "bookings", user.uid);
    const existingBooking = await getDoc(bookingRef);

    if (existingBooking.exists()) {
      showToast("You already booked this match.");
      return;
    }

    const bookingsSnap = await getDocs(collection(db, "matches", match.id, "bookings"));
    const bookedCount = bookingsSnap.size;

    if (bookedCount >= Number(match.totalSlots)) {
      showToast("Match full.");
      return;
    }

    const p = state.userProfile || {};
    await setDoc(bookingRef, {
      userId: user.uid,
      email: user.email || "",
      name: p.name || user.displayName || user.email?.split("@")[0] || "Player",
      paymentMethod,
      createdAt: serverTimestamp()
    });

    showToast("Booked successfully.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Booking failed.");
  }
}

async function cancelBookingDirect() {
  try {
    const user = auth.currentUser;
    const match = state.featuredMatch;
    if (!user || !match) return;

    await deleteDoc(doc(db, "matches", match.id, "bookings", user.uid));
    showToast("Booking cancelled.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Cancel failed.");
  }
}

async function kickPlayerDirect(matchId, userId) {
  try {
    await deleteDoc(doc(db, "matches", matchId, "bookings", userId));
    showToast("Player removed.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not remove player.");
  }
}

async function createMatch(e) {
  e.preventDefault();
  try {
    const location = els.adminVenue.value.trim();
    const date = els.adminDate.value;
    const time = els.adminTime.value;
    const totalSlots = Number(els.adminSlots.value);
    const label = els.adminLabel.value.trim() || "Match";

    if (!location || !date || !time || !totalSlots) {
      showToast("Fill all match fields.");
      return;
    }

    await addDoc(collection(db, "matches"), {
      location,
      date,
      time,
      totalSlots,
      label,
      status: "open",
      createdAt: serverTimestamp()
    });

    els.adminMatchForm.reset();
    showToast("Match created.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not create match.");
  }
}

function listenAdminMatches() {
  state.adminMatchesUnsub?.();
  state.adminMatchesUnsub = onSnapshot(
    query(collection(db, "matches"), orderBy("createdAt", "desc")),
    async (snap) => {
      if (snap.empty) {
        els.adminMatchesList.innerHTML = `<div class="empty-box">No matches yet.</div>`;
        return;
      }

      const htmlParts = [];
      for (const d of snap.docs) {
        const m = d.data();
        const bookingsSnap = await getDocs(collection(db, "matches", d.id, "bookings"));
        const booked = bookingsSnap.size;

        htmlParts.push(`
          <div class="admin-match-card">
            <div>
              <strong>${escapeHtml(m.location || "Venue")}</strong>
              <div>${escapeHtml(formatMatchDate(m.date, m.time))}</div>
              <div>${booked} / ${m.totalSlots} booked • ${m.status}</div>
            </div>
            <div class="admin-actions">
              <button class="toggle-match-btn" data-id="${d.id}" data-status="${m.status}">
                ${m.status === "open" ? "Close" : "Reopen"}
              </button>
            </div>
          </div>
        `);
      }

      els.adminMatchesList.innerHTML = htmlParts.join("");

      els.adminMatchesList.querySelectorAll(".toggle-match-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const nextStatus = btn.dataset.status === "open" ? "closed" : "open";
          await updateDoc(doc(db, "matches", id), { status: nextStatus });
          showToast(`Match ${nextStatus}.`);
        });
      });
    },
    (err) => {
      console.error(err);
      showToast("Could not load admin matches.");
    }
  );
}

async function postAnnouncement(e) {
  e.preventDefault();
  try {
    const text = els.announcementText.value.trim();
    if (!text) {
      showToast("Write an announcement.");
      return;
    }

    await addDoc(collection(db, "announcements"), {
      text,
      createdAt: serverTimestamp()
    });

    els.announcementForm.reset();
    showToast("Announcement posted.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not post announcement.");
  }
}

function downloadPoster() {
  const match = state.featuredMatch;
  if (!match) {
    showToast("No match available.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#03190f");
  gradient.addColorStop(1, "#1d6b2f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(60, 60, 960, 1230);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 110px Arial";
  ctx.fillText("MATCHDAY", 90, 260);

  ctx.font = "bold 64px Arial";
  ctx.fillText((match.location || "Venue").toUpperCase(), 90, 360);

  ctx.font = "42px Arial";
  ctx.fillText(formatMatchDate(match.date, match.time), 90, 470);

  const total = Number(match.totalSlots || 0);
  ctx.font = "bold 54px Arial";
  ctx.fillText(`TOTAL PLAYERS: ${total}`, 90, 610);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `matchday-${match.location || "poster"}.png`;
  a.click();
}

els.loginTab?.addEventListener("click", () => authUiMode("login"));
els.signupTab?.addEventListener("click", () => authUiMode("signup"));
els.authSubmitBtn?.addEventListener("click", handleAuthSubmit);
els.googleBtn?.addEventListener("click", handleGoogleLogin);
els.logoutBtn?.addEventListener("click", logout);
els.profileBtn?.addEventListener("click", openProfileModal);
els.closeProfileModal?.addEventListener("click", closeProfileModal);
els.profileForm?.addEventListener("submit", saveProfile);
els.heroBookBtn?.addEventListener("click", bookMatchDirect);
els.heroCancelBtn?.addEventListener("click", cancelBookingDirect);
els.heroDownloadBtn?.addEventListener("click", downloadPoster);
els.adminMatchForm?.addEventListener("submit", createMatch);
els.announcementForm?.addEventListener("submit", postAnnouncement);

authUiMode("login");

onAuthStateChanged(auth, async (user) => {
  stopLiveListeners();

  if (els.splash) {
    setTimeout(() => els.splash.classList.add("hidden"), 400);
  }

  try {
    if (!user) {
      state.user = null;
      state.userProfile = null;
      els.logoutBtn?.classList.add("hidden");
      els.profileBtn?.classList.add("hidden");
      setView(els.authView);
      return;
    }

    state.user = user;
    await ensureUserProfile(user);

    els.logoutBtn?.classList.remove("hidden");

    if (user.email === ADMIN_EMAIL) {
      els.profileBtn?.classList.add("hidden");
      setView(els.adminView);
      listenAdminMatches();
      listenAnnouncements(els.adminAnnouncementList);
    } else {
      els.profileBtn?.classList.remove("hidden");
      setView(els.playerView);
      renderProfileCard(user);
      listenFeaturedMatches();
      listenAnnouncements(els.announcementList);
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed after login.");
    setView(els.authView);
  }
});
