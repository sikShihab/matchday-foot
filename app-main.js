import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
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
const BKASH_PAYMENT_NUMBER = "01623729249";
const BKASH_QR_IMAGE_URL = "assets/bkash-qr.png";
const CONTACT_PHONE = "01304204769";
const CONTACT_EMAIL = "ikshihab2002@gmail.com";
const CONTACT_FACEBOOK = "https://www.facebook.com/shihabb.zz/";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const state = {
  user: null,
  userProfile: null,
  featuredMatch: null,
  featuredUnsub: null,
  bookingsUnsub: null,
  announcementsUnsub: null,
  adminMatchesUnsub: null,
  activityUnsub: null,
  playerPage: "liveScoreSection"
};

const $ = (id) => document.getElementById(id);
const on = (el, eventName, handler) => el?.addEventListener(eventName, handler);

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
  forgotPasswordBtn: $("forgotPasswordBtn"),
  emailInput: $("email"),
  passwordInput: $("password"),

  playerProfileName: $("playerProfileName"),
  playerProfileEmail: $("playerProfileEmail"),
  playerProfilePhone: $("playerProfilePhone"),
  playerAvatar: $("playerAvatar"),
  liveScoreSection: $("liveScoreSection"),
  bookingsSection: $("bookingsSection"),
  fixturesSection: $("fixturesSection"),
  highlightsSection: $("highlightsSection"),
  aboutSection: $("aboutSection"),
  quickContactSection: $("quickContactSection"),

  announcementList: $("announcementList"),

  heroBadge: $("heroBadge"),
  heroVenue: $("heroVenue"),
  heroFieldImage: $("heroFieldImage"),
  heroMapWrap: $("heroMapWrap"),
  heroMapFrame: $("heroMapFrame"),
  heroMapLink: $("heroMapLink"),
  heroPhotoStrip: $("heroPhotoStrip"),
  heroDate: $("heroDate"),
  heroPlayers: $("heroPlayers"),
  heroPayment: $("heroPayment"),
  heroSlotsText: $("heroSlotsText"),
  heroPercent: $("heroPercent"),
  heroProgress: $("heroProgress"),
  heroBookBtn: $("heroBookBtn"),
  heroCancelBtn: $("heroCancelBtn"),
  heroSlotQty: $("heroSlotQty"),
  heroPaymentSelect: $("heroPaymentSelect"),
  heroFeePreview: $("heroFeePreview"),
  heroDownloadBtn: $("heroDownloadBtn"),
  bkashModal: $("bkashModal"),
  closeBkashModal: $("closeBkashModal"),
  bkashContinueBtn: $("bkashContinueBtn"),
  bkashQrImage: $("bkashQrImage"),
  bkashNumberText: $("bkashNumberText"),
  bkashNumberLink: $("bkashNumberLink"),
  bkashLast3Input: $("bkashLast3Input"),
  playersList: $("playersList"),
  playersMeta: $("playersMeta"),

  adminMatchForm: $("adminMatchForm"),
  adminVenue: $("adminVenue"),
  adminDate: $("adminDate"),
  adminTime: $("adminTime"),
  adminSlots: $("adminSlots"),
  adminFee: $("adminFee"),
  adminLabel: $("adminLabel"),
  adminPhotos: $("adminPhotos"),
  openMapPickerBtn: $("openMapPickerBtn"),
  adminLat: $("adminLat"),
  adminLng: $("adminLng"),
  adminMapImage: $("adminMapImage"),
  adminMapPreviewWrap: $("adminMapPreviewWrap"),
  adminMapPreview: $("adminMapPreview"),
  adminMapCoords: $("adminMapCoords"),
  adminMatchesList: $("adminMatchesList"),

  announcementForm: $("announcementForm"),
  announcementText: $("announcementText"),
  adminAnnouncementList: $("adminAnnouncementList"),
  adminActivityList: $("adminActivityList"),

  profileForm: $("profileForm"),
  profileName: $("profileName"),
  profilePhone: $("profilePhone"),
  profilePhotoUrl: $("profilePhotoUrl"),
  closeProfileModal: $("closeProfileModal"),
  mapPickerModal: $("mapPickerModal"),
  closeMapPickerModal: $("closeMapPickerModal"),
  confirmMapPickerBtn: $("confirmMapPickerBtn"),
  adminMapCanvas: $("adminMapCanvas"),
  mapPickInfo: $("mapPickInfo"),
  mapSearchInput: $("mapSearchInput"),
  mapSearchBtn: $("mapSearchBtn"),
  mapSearchResults: $("mapSearchResults"),
  fixturesDate: $("fixturesDate"),
  fixturesList: $("fixturesList"),
  refreshFixturesBtn: $("refreshFixturesBtn"),
  highlightsList: $("highlightsList"),
  contactWhatsappLink: $("contactWhatsappLink"),
  contactPhoneLink: $("contactPhoneLink"),
  contactEmailLink: $("contactEmailLink"),
  contactFacebookLink: $("contactFacebookLink"),
  contactWhatsappLinkPlayer: $("contactWhatsappLinkPlayer"),
  contactEmailLinkPlayer: $("contactEmailLinkPlayer"),
  contactFacebookLinkPlayer: $("contactFacebookLinkPlayer"),
  moreMenuBtn: $("moreMenuBtn"),
  moreMenuPanel: $("moreMenuPanel"),
  moreMenuBackdrop: $("moreMenuBackdrop"),
  receiptModal: $("receiptModal"),
  closeReceiptModal: $("closeReceiptModal"),
  receiptBody: $("receiptBody"),
  downloadReceiptBtn: $("downloadReceiptBtn"),
  extraNamesWrap: $("extraNamesWrap"),
  bookerPrimaryName: $("bookerPrimaryName"),
  extraPlayersList: $("extraPlayersList"),
  extraPlayerNames: $("extraPlayerNames")
};

let authMode = "login";
let adminMap = null;
let adminMapMarker = null;
const DEFAULT_MAP_POINT = { lat: 23.8103, lng: 90.4125 };
const COMPETITION_CATALOG = [
  { category: "Major International & Club Tournaments", name: "FIFA World Cup" },
  { category: "Major International & Club Tournaments", name: "UEFA Champions League" },
  { category: "Major International & Club Tournaments", name: "Copa Libertadores" },
  { category: "Major International & Club Tournaments", name: "UEFA Europa League" },
  { category: "Major International & Club Tournaments", name: "UEFA European Championship" },
  { category: "Major International & Club Tournaments", name: "Copa America" },
  { category: "Major International & Club Tournaments", name: "AFC Champions League" },
  { category: "Major International & Club Tournaments", name: "Concacaf Champions Cup" },
  { category: "Cup Competitions", name: "FA Cup" },
  { category: "Cup Competitions", name: "English League Cup" },
  { category: "Cup Competitions", name: "Copa del Rey" },
  { category: "Women's Football", name: "Women's Super League" },
  { category: "Women's Football", name: "National Women's Soccer League" },
  { category: "Women's Football", name: "UEFA Women's Champions League" },
  { category: "Bangladesh Football", name: "Bangladesh Premier League" }
];

const FALLBACK_COMPETITIONS = [
  { id: "4391", name: "FIFA World Cup", category: "Major International & Club Tournaments" },
  { id: "4480", name: "UEFA Champions League", category: "Major International & Club Tournaments" },
  { id: "4346", name: "Copa Libertadores", category: "Major International & Club Tournaments" },
  { id: "4481", name: "UEFA Europa League", category: "Major International & Club Tournaments" },
  { id: "4756", name: "UEFA European Championship", category: "Major International & Club Tournaments" },
  { id: "4429", name: "Copa America", category: "Major International & Club Tournaments" },
  { id: "4370", name: "FA Cup", category: "Cup Competitions" },
  { id: "4396", name: "Copa del Rey", category: "Cup Competitions" },
  { id: "4444", name: "Women's Super League", category: "Women's Football" },
  { id: "4474", name: "National Women's Soccer League", category: "Women's Football" },
  { id: "4657", name: "UEFA Women's Champions League", category: "Women's Football" },
  { id: "4829", name: "Bangladesh Premier League", category: "Bangladesh Football" }
];

const TOP_RANKED_COUNTRIES = new Set([
  "Argentina", "France", "Spain", "England", "Brazil", "Portugal", "Netherlands",
  "Belgium", "Italy", "Germany", "Croatia", "Uruguay", "Colombia", "Japan",
  "Morocco", "USA", "Mexico", "Switzerland", "Denmark", "Senegal", "Bangladesh"
]);

const INTERNATIONAL_KEYWORDS = [
  "world cup", "euro", "european championship", "copa america", "nations league",
  "international", "afc asian cup", "concacaf gold cup"
];

const TEAM_BADGE_CACHE = new Map();
const LEAGUE_LOGO_CACHE = new Map();
let RESOLVED_COMPETITIONS = null;

const POPULAR_LEAGUE_KEYWORDS = [
  "premier league", "champions league", "la liga", "serie a", "bundesliga", "ligue 1",
  "europa league", "copa libertadores", "fifa world cup", "euro", "copa america",
  "women", "fa cup", "copa del rey", "afc champions"
];

const PLAYER_PAGE_IDS = [
  "liveScoreSection",
  "bookingsSection",
  "fixturesSection",
  "highlightsSection",
  "aboutSection",
  "quickContactSection"
];

function getPlayerPageFromHash() {
  const raw = (window.location.hash || "").replace(/^#/, "");
  return PLAYER_PAGE_IDS.includes(raw) ? raw : null;
}

function markActivePlayerMenu(pageId) {
  document.querySelectorAll(".more-menu-item").forEach((btn) => {
    const targetId = btn.dataset.target;
    const active = targetId === pageId;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
}

function setPlayerPage(targetId, options = {}) {
  const { updateHash = true } = options;
  const next = PLAYER_PAGE_IDS.includes(targetId) ? targetId : PLAYER_PAGE_IDS[0];
  state.playerPage = next;

  PLAYER_PAGE_IDS.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const isActive = id === next;
    section.classList.toggle("hidden", !isActive);
    section.classList.toggle("view-enter", isActive);
  });

  markActivePlayerMenu(next);
  if (updateHash) window.history.replaceState(null, "", `#${next}`);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}

function setView(view) {
  [els.authView, els.playerView, els.adminView].forEach((v) => {
    v.classList.add("hidden");
    v.classList.remove("view-enter");
  });

  const moreMenuWrap = els.moreMenuBtn?.closest(".more-menu-wrap");
  if (moreMenuWrap) {
    const showPlayerMenu = view === els.playerView;
    moreMenuWrap.classList.toggle("hidden", !showPlayerMenu);
    if (!showPlayerMenu) closeMoreMenu();
  }

  view.classList.remove("hidden");
  requestAnimationFrame(() => {
    view.classList.add("view-enter");
    if (view === els.playerView) {
      const pageFromHash = getPlayerPageFromHash();
      setPlayerPage(pageFromHash || state.playerPage, { updateHash: !pageFromHash });
    }
  });
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

function stopLiveListeners() {
  state.featuredUnsub?.();
  state.bookingsUnsub?.();
  state.announcementsUnsub?.();
  state.adminMatchesUnsub?.();
  state.featuredUnsub = null;
  state.bookingsUnsub = null;
  state.announcementsUnsub = null;
  state.adminMatchesUnsub = null;
  state.activityUnsub = null;
}

function getMapSnapshotUrl(lat, lng) {
  const latNum = Number(lat).toFixed(6);
  const lngNum = Number(lng).toFixed(6);
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latNum},${lngNum}&zoom=17&size=900x460&markers=${latNum},${lngNum},red-pushpin`;
}

function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function getGoogleMapsEmbedUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
}

function parsePhotoUrls(raw) {
  return String(raw || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => /^https?:\/\//i.test(item));
}

function renderVenuePhotos(photoUrls = []) {
  if (!els.heroPhotoStrip) return;
  if (!photoUrls.length) {
    els.heroPhotoStrip.innerHTML = "";
    els.heroPhotoStrip.classList.add("hidden");
    return;
  }

  els.heroPhotoStrip.innerHTML = photoUrls.map((url) => {
    const safe = escapeHtml(url);
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="hero-photo-link"><img src="${safe}" alt="Venue photo" class="hero-photo-thumb" /></a>`;
  }).join("");
  els.heroPhotoStrip.classList.remove("hidden");
}
function setMapSelection(lat, lng, shouldPan = true) {
  const latNum = Number(Number(lat).toFixed(6));
  const lngNum = Number(Number(lng).toFixed(6));
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return;

  if (els.adminLat) els.adminLat.value = String(latNum);
  if (els.adminLng) els.adminLng.value = String(lngNum);

  const snapshot = getMapSnapshotUrl(latNum, lngNum);
  if (els.adminMapImage) els.adminMapImage.value = snapshot;
  if (els.adminMapPreview) els.adminMapPreview.src = snapshot;
  els.adminMapPreviewWrap?.classList.remove("hidden");
  if (els.adminMapCoords) els.adminMapCoords.textContent = `Lat ${latNum}, Lng ${lngNum}`;
  if (els.mapPickInfo) els.mapPickInfo.textContent = `Selected point: ${latNum}, ${lngNum}`;

  if (adminMap) {
    if (!adminMapMarker) {
      adminMapMarker = window.L.marker([latNum, lngNum]).addTo(adminMap);
    } else {
      adminMapMarker.setLatLng([latNum, lngNum]);
    }

    if (shouldPan) {
      adminMap.setView([latNum, lngNum], 17);
    }
  }
}

function initAdminMap() {
  if (!window.L || !els.adminMapCanvas) {
    showToast("Map could not be loaded.");
    return;
  }

  if (adminMap) {
    adminMap.invalidateSize();
    return;
  }

  adminMap = window.L.map(els.adminMapCanvas, { zoomControl: true }).setView([DEFAULT_MAP_POINT.lat, DEFAULT_MAP_POINT.lng], 13);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(adminMap);

  adminMap.on("click", (event) => {
    setMapSelection(event.latlng.lat, event.latlng.lng, false);
  });
}

function openMapPicker() {
  if (!els.mapPickerModal || !els.adminLat || !els.adminLng) return;
  els.mapPickerModal.classList.remove("hidden");
  if (els.mapSearchInput) els.mapSearchInput.value = "";
  if (els.mapSearchResults) els.mapSearchResults.innerHTML = "";

  setTimeout(() => {
    initAdminMap();

    const savedLat = Number(els.adminLat.value);
    const savedLng = Number(els.adminLng.value);
    const lat = Number.isFinite(savedLat) ? savedLat : DEFAULT_MAP_POINT.lat;
    const lng = Number.isFinite(savedLng) ? savedLng : DEFAULT_MAP_POINT.lng;

    setMapSelection(lat, lng, true);
    adminMap?.invalidateSize();
  }, 40);
}

function closeMapPicker() {
  els.mapPickerModal?.classList.add("hidden");
  if (els.mapSearchResults) els.mapSearchResults.innerHTML = "";
}
function confirmMapPicker() {
  if (!els.adminLat || !els.adminLng) return;
  const lat = Number(els.adminLat.value);
  const lng = Number(els.adminLng.value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    showToast("Select a field point on the map first.");
    return;
  }

  closeMapPicker();
  showToast("Field location saved.");
}
function toWhatsAppUrl(localPhone) {
  const digits = (localPhone || "").replace(/\D/g, "");
  const international = digits.startsWith("0") ? `88${digits}` : digits;
  return `https://wa.me/${international}`;
}

function initStaticUi() {
  const bkashQrFallbackUrl = `https://quickchart.io/qr?text=${encodeURIComponent(BKASH_PAYMENT_NUMBER)}&size=420`;
  if (els.bkashQrImage) {
    els.bkashQrImage.src = BKASH_QR_IMAGE_URL;
    els.bkashQrImage.onerror = () => {
      els.bkashQrImage.src = bkashQrFallbackUrl;
    };
  }
  if (els.bkashNumberText) els.bkashNumberText.textContent = BKASH_PAYMENT_NUMBER;
  if (els.bkashNumberLink) els.bkashNumberLink.href = toWhatsAppUrl(BKASH_PAYMENT_NUMBER);

  if (els.contactWhatsappLink) els.contactWhatsappLink.href = toWhatsAppUrl(CONTACT_PHONE);
  if (els.contactEmailLink) els.contactEmailLink.href = `mailto:${CONTACT_EMAIL}`;
  if (els.contactFacebookLink) els.contactFacebookLink.href = CONTACT_FACEBOOK;
  if (els.contactWhatsappLinkPlayer) els.contactWhatsappLinkPlayer.href = toWhatsAppUrl(CONTACT_PHONE);
  if (els.contactEmailLinkPlayer) els.contactEmailLinkPlayer.href = `mailto:${CONTACT_EMAIL}`;
  if (els.contactFacebookLinkPlayer) els.contactFacebookLinkPlayer.href = CONTACT_FACEBOOK;
}

function initMotionUi() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, .tab, .contact-link");
    if (!target) return;
    if (target.matches("button:disabled")) return;

    target.classList.remove("btn-pop");
    void target.offsetWidth;
    target.classList.add("btn-pop");
    setTimeout(() => target.classList.remove("btn-pop"), 200);
  });
}
function toggleMoreMenu(forceOpen = null) {
  if (!els.moreMenuPanel) return;
  const shouldOpen = forceOpen === null ? els.moreMenuPanel.classList.contains("hidden") : forceOpen;
  els.moreMenuPanel.classList.toggle("hidden", !shouldOpen);
  els.moreMenuBackdrop?.classList.toggle("hidden", !shouldOpen);
  document.body.classList.toggle("menu-open", shouldOpen);
  els.moreMenuBtn?.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function closeMoreMenu() {
  toggleMoreMenu(false);
}

function initMoreMenu() {
  els.moreMenuBtn?.setAttribute("aria-expanded", "false");

  on(els.moreMenuBtn, "click", (e) => {
    e.stopPropagation();
    toggleMoreMenu();
  });

  on(els.moreMenuBackdrop, "click", closeMoreMenu);

  document.addEventListener("click", (e) => {
    const isInsidePanel = e.target.closest("#moreMenuPanel");
    const isMenuTrigger = e.target.closest(".more-menu-wrap");
    if (!isInsidePanel && !isMenuTrigger) closeMoreMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMoreMenu();
  });

  document.querySelectorAll(".more-menu-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      closeMoreMenu();
      if (targetId === "profileSection") {
        openProfileModal();
        return;
      }
      if (els.playerView?.classList.contains("hidden")) return;
      setPlayerPage(targetId);
    });
  });
}

function isPopularCompetition(name = "") {
  const lower = String(name).toLowerCase();
  return POPULAR_LEAGUE_KEYWORDS.some((key) => lower.includes(key));
}

function leaguePriority(name = "") {
  const lower = String(name).toLowerCase();
  if (lower.includes("champions league")) return 0;
  if (lower.includes("europa league")) return 1;
  if (lower.includes("premier league") || lower.includes("la liga") || lower.includes("serie a") || lower.includes("bundesliga") || lower.includes("ligue 1")) return 2;
  if (lower.includes("world cup") || lower.includes("euro") || lower.includes("copa america") || lower.includes("nations league")) return 3;
  return 4;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatKickoff(eventDate, eventTime) {
  if (!eventDate) return "TBD";
  if (!eventTime) return eventDate;

  const dt = new Date(`${eventDate}T${eventTime}Z`);
  if (Number.isNaN(dt.getTime())) return `${eventDate} ${eventTime}`;
  return dt.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit"
  });
}

function extractEmbedSrc(embedHtml = "") {
  const match = String(embedHtml).match(/src=['\"]([^'\"]+)['\"]/i);
  return match ? match[1] : "";
}

function getBookedSlots(bookings = []) {
  return bookings.reduce((sum, item) => sum + Math.max(Number(item?.slots || 1), 0), 0);
}

function getRequestedSlots() {
  const qty = Number(els.heroSlotQty?.value || 1);
  const normalized = Number.isFinite(qty) ? Math.floor(qty) : 1;
  const clamped = Math.max(1, Math.min(4, normalized));
  if (els.heroSlotQty) els.heroSlotQty.value = String(clamped);
  return clamped;
}

function getBookerDisplayName() {
  const profile = state.userProfile || {};
  return String(
    profile.name || state.user?.displayName || state.user?.email?.split("@")?.[0] || "Player"
  ).trim();
}

function renderExtraPlayerFields() {
  if (!els.extraNamesWrap || !els.extraPlayersList) return;

  const qty = getRequestedSlots();
  const requiredOthers = Math.max(qty - 1, 0);
  const previousValues = Array.from(els.extraPlayersList.querySelectorAll("input"))
    .map((input) => String(input.value || "").trim());

  els.extraNamesWrap.classList.toggle("hidden", requiredOthers <= 0);
  if (requiredOthers <= 0) {
    els.extraPlayersList.innerHTML = "";
    return;
  }

  if (els.bookerPrimaryName) {
    els.bookerPrimaryName.value = getBookerDisplayName();
  }

  const fields = Array.from({ length: requiredOthers }, (_, index) => {
    const num = index + 2;
    const value = escapeHtml(previousValues[index] || "");
    return `
      <div class="form-group extra-name-item">
        <label for="extraPlayerName${num}">Player ${num} name</label>
        <input id="extraPlayerName${num}" class="extra-player-input" type="text" maxlength="40" placeholder="Enter player ${num} full name" value="${value}" autocomplete="off" />
      </div>
    `;
  }).join("");

  els.extraPlayersList.innerHTML = fields;
}

function parseExtraPlayerNames() {
  if (els.extraPlayersList) {
    return Array.from(els.extraPlayersList.querySelectorAll(".extra-player-input"))
      .map((input) => String(input.value || "").trim())
      .filter(Boolean);
  }

  const raw = String(els.extraPlayerNames?.value || "");
  return raw.split(/\r?\n|,/).map((v) => v.trim()).filter(Boolean);
}

function toggleExtraNamesInput() {
  renderExtraPlayerFields();
}
function playBookingAnimation() {
  const card = document.querySelector(".hero-match-card");
  if (!card) return;
  card.classList.remove("booking-success");
  void card.offsetWidth;
  card.classList.add("booking-success");
  setTimeout(() => card.classList.remove("booking-success"), 700);
}

function refreshBookingPreview() {
  toggleExtraNamesInput();
  if (!els.heroFeePreview) return;
  const qty = getRequestedSlots();
  const fee = Number(state.featuredMatch?.slotFee || 0);
  const total = fee * qty;
  const feeText = Number.isFinite(fee) ? `BDT ${total}` : "Set by admin";
  const othersRequired = Math.max(qty - 1, 0);
  const namesText = othersRequired > 0
    ? ` | Add ${othersRequired} additional player name${othersRequired > 1 ? "s" : ""}`
    : "";
  els.heroFeePreview.textContent = `${qty} slot${qty > 1 ? "s" : ""} selected | Total: ${feeText}${namesText}`;
}

function getCompetitionMeta(leagueName = "", leagueId = "", category = "") {
  const fallbackText = encodeURIComponent((leagueName || "League").slice(0, 3).toUpperCase());
  const fallbackLogo = `https://placehold.co/72x72/0b2d26/e8fff3?text=${fallbackText}`;
  const cached = LEAGUE_LOGO_CACHE.get(String(leagueId));
  return { name: leagueName || "Competition", logo: cached || fallbackLogo, category: category || "Top Fixtures" };
}

function normalizeCompetitionName(name = "") {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isInternationalCompetition(name = "") {
  const lower = normalizeCompetitionName(name);
  return INTERNATIONAL_KEYWORDS.some((key) => lower.includes(key));
}

function isTopCountryMatch(home = "", away = "") {
  return TOP_RANKED_COUNTRIES.has(home) || TOP_RANKED_COUNTRIES.has(away);
}

async function resolveCompetitions() {
  if (Array.isArray(RESOLVED_COMPETITIONS) && RESOLVED_COMPETITIONS.length) {
    return RESOLVED_COMPETITIONS;
  }

  try {
    const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/all_leagues.php");
    const data = await res.json();
    const leagues = Array.isArray(data?.leagues) ? data.leagues : [];

    const mapped = COMPETITION_CATALOG.map((wanted) => {
      const target = normalizeCompetitionName(wanted.name);
      const found = leagues.find((l) => {
        const n = normalizeCompetitionName(l.strLeague || "");
        return n === target || n.includes(target) || target.includes(n);
      });
      return found ? {
        id: String(found.idLeague),
        name: found.strLeague || wanted.name,
        category: wanted.category
      } : null;
    }).filter(Boolean);

    RESOLVED_COMPETITIONS = mapped.length ? mapped : FALLBACK_COMPETITIONS;
  } catch {
    RESOLVED_COMPETITIONS = FALLBACK_COMPETITIONS;
  }

  return RESOLVED_COMPETITIONS;
}

async function preloadLeagueLogos(competitions = []) {
  const pending = competitions.filter((l) => l?.id && !LEAGUE_LOGO_CACHE.has(String(l.id)));
  await Promise.all(pending.map(async (league) => {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${league.id}`);
      const data = await res.json();
      const item = Array.isArray(data?.leagues) ? data.leagues[0] : null;
      const logo = item?.strBadge || item?.strLogo || item?.strFanart1 || "";
      if (logo) LEAGUE_LOGO_CACHE.set(String(league.id), logo);
    } catch {}
  }));
}

async function preloadTeamBadges(fixtures = []) {
  const teamIds = new Set();
  fixtures.forEach((f) => {
    if (f.homeTeamId && !TEAM_BADGE_CACHE.has(String(f.homeTeamId))) teamIds.add(String(f.homeTeamId));
    if (f.awayTeamId && !TEAM_BADGE_CACHE.has(String(f.awayTeamId))) teamIds.add(String(f.awayTeamId));
  });

  await Promise.all(Array.from(teamIds).slice(0, 100).map(async (id) => {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupteam.php?id=${id}`);
      const data = await res.json();
      const team = Array.isArray(data?.teams) ? data.teams[0] : null;
      if (team?.strBadge) TEAM_BADGE_CACHE.set(String(id), team.strBadge);
    } catch {}
  }));
}

async function fetchBangladeshTeamFixtures() {
  try {
    const teamsRes = await fetch("https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Bangladesh");
    const teamsData = await teamsRes.json();
    const teams = (Array.isArray(teamsData?.teams) ? teamsData.teams : []).slice(0, 6);

    const all = await Promise.all(teams.map(async (team) => {
      if (!team?.idTeam) return [];
      try {
        const evRes = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${team.idTeam}`);
        const evData = await evRes.json();
        const events = Array.isArray(evData?.events) ? evData.events : [];
        return events.map((ev) => ({
          leagueId: ev.idLeague || "bd-team",
          category: "Bangladesh Football",
          league: ev.strLeague || "Bangladesh Team Fixtures",
          season: ev.strSeason || "",
          round: ev.intRound || ev.strRound || "",
          home: ev.strHomeTeam || "Home",
          away: ev.strAwayTeam || "Away",
          homeTeamId: ev.idHomeTeam || "",
          awayTeamId: ev.idAwayTeam || "",
          homeBadge: "",
          awayBadge: "",
          venue: ev.strVenue || "",
          status: ev.strStatus || "Scheduled",
          date: ev.dateEvent || "",
          time: ev.strTime || "",
          kickoff: formatKickoff(ev.dateEvent, ev.strTime),
          stamp: Date.parse(`${ev.dateEvent || "1970-01-01"}T${ev.strTime || "00:00:00"}Z`) || Number.MAX_SAFE_INTEGER
        }));
      } catch {
        return [];
      }
    }));

    return all.flat();
  } catch {
    return [];
  }
}
function buildReceiptImage(data) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const g = ctx.createLinearGradient(0, 0, 1200, 760);
  g.addColorStop(0, "#001d1f");
  g.addColorStop(1, "#035247");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(56, 56, 1088, 648);

  ctx.fillStyle = "#e9fff6";
  ctx.font = "700 54px Plus Jakarta Sans, Arial";
  ctx.fillText("MATCHDAY RECEIPT", 96, 140);

  ctx.font = "500 32px Plus Jakarta Sans, Arial";
  const paymentText = data.last3 ? `${data.payment} (${data.last3})` : data.payment;
  const rows = [
    `Venue: ${data.venue}`,
    `Date: ${data.when}`,
    `Slots: ${data.slots}`,
    `Per slot: BDT ${data.unitFee}`,
    `Total fee: BDT ${data.totalFee}`,
    `Payment: ${paymentText}`
  ];
  rows.forEach((row, idx) => ctx.fillText(row, 96, 220 + (idx * 72)));

  ctx.font = "600 24px Plus Jakarta Sans, Arial";
  ctx.fillStyle = "#9deccf";
  ctx.fillText(`Receipt ID: ${Date.now()}`, 96, 660);

  return canvas.toDataURL("image/jpeg", 0.92);
}

function openReceiptModal(data) {
  if (!els.receiptModal || !els.receiptBody) return;
  const imageUrl = buildReceiptImage(data);
  const safeVenue = escapeHtml(data.venue || "Venue");
  const safeWhen = escapeHtml(data.when || "TBD");
  const safePayment = escapeHtml(data.payment || "On-spot");
  els.receiptBody.innerHTML = `
    <div class="receipt-preview-wrap">
      <img src="${imageUrl}" class="receipt-preview-img" alt="Booking receipt" />
      <div class="receipt-caption">${safeVenue} | ${safeWhen} | ${safePayment}</div>
    </div>
  `;
  if (els.downloadReceiptBtn) {
    els.downloadReceiptBtn.dataset.receipt = JSON.stringify(data);
    els.downloadReceiptBtn.dataset.receiptImage = imageUrl;
  }
  els.receiptModal.classList.remove("hidden");
}

function closeReceiptModal() {
  els.receiptModal?.classList.add("hidden");
}

function downloadReceipt() {
  const imageUrl = els.downloadReceiptBtn?.dataset?.receiptImage || "";
  if (!imageUrl) return;
  const a = document.createElement("a");
  a.href = imageUrl;
  a.download = `matchday-receipt-${Date.now()}.jpg`;
  a.click();
}
function renderFixtures(fixtures = []) {
  if (!els.fixturesList) return;

  if (!fixtures.length) {
    els.fixturesList.innerHTML = `<div class="empty-box">No major upcoming fixtures found right now.</div>`;
    return;
  }

  const byCategory = fixtures.reduce((acc, item) => {
    const key = item.category || "Top Fixtures";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const categoryHtml = Object.entries(byCategory).map(([category, categoryItems]) => {
    const grouped = categoryItems.reduce((acc, item) => {
      const key = `${item.leagueId || "x"}::${item.league || "Competition"}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const groupsHtml = Object.values(grouped).map((list) => {
      const first = list[0] || {};
      const meta = getCompetitionMeta(first.league, first.leagueId, first.category);
      const matchesHtml = list.map((item) => {
        const homeBadge = escapeHtml(item.homeBadge || `https://placehold.co/56x56/0b2d26/e8fff3?text=${encodeURIComponent((item.home || "H").slice(0,2).toUpperCase())}`);
        const awayBadge = escapeHtml(item.awayBadge || `https://placehold.co/56x56/0b2d26/e8fff3?text=${encodeURIComponent((item.away || "A").slice(0,2).toUpperCase())}`);
        return `
          <article class="fixture-match">
            <div class="fixture-teams">
              <div class="fixture-team"><img src="${homeBadge}" alt="${escapeHtml(item.home)}" /><span>${escapeHtml(item.home)}</span></div>
              <div class="fixture-vs">vs</div>
              <div class="fixture-team"><img src="${awayBadge}" alt="${escapeHtml(item.away)}" /><span>${escapeHtml(item.away)}</span></div>
            </div>
            <div class="fixture-meta-line">${escapeHtml(item.kickoff)}</div>
            <details class="fixture-details">
              <summary>Match details</summary>
              <div class="fixture-detail-grid">
                <div><span class="muted">Season</span><strong>${escapeHtml(item.season || "-")}</strong></div>
                <div><span class="muted">Round</span><strong>${escapeHtml(item.round || "-")}</strong></div>
                <div><span class="muted">Venue</span><strong>${escapeHtml(item.venue || "TBA")}</strong></div>
                <div><span class="muted">Status</span><strong>${escapeHtml(item.status || "Scheduled")}</strong></div>
              </div>
            </details>
          </article>
        `;
      }).join("");

      return `
        <section class="fixture-group">
          <div class="fixture-group-head">
            <img class="fixture-league-logo" src="${escapeHtml(meta.logo)}" alt="${escapeHtml(meta.name)} logo" />
            <h4>${escapeHtml(meta.name)}</h4>
          </div>
          <div class="fixture-group-list">${matchesHtml}</div>
        </section>
      `;
    }).join("");

    return `
      <section class="fixture-category">
        <h3 class="fixture-category-title">${escapeHtml(category)}</h3>
        ${groupsHtml}
      </section>
    `;
  }).join("");

  els.fixturesList.innerHTML = categoryHtml;
}
function renderHighlights(items = []) {
  if (!els.highlightsList) return;

  if (!items.length) {
    els.highlightsList.innerHTML = `<div class="empty-box">No fresh highlight videos right now.</div>`;
    return;
  }

  els.highlightsList.innerHTML = items.map((item) => `
    <article class="video-card">
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="video-thumb-wrap">
        <img class="video-thumb" src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" />
      </a>
      <div class="video-meta">
        <strong>${escapeHtml(item.title)}</strong>
        <div class="muted">${escapeHtml(item.competition)}</div>
      </div>
    </article>
  `).join("");
}

async function loadDailyFixtures() {
  if (!els.fixturesList) return;

  els.fixturesDate.textContent = `Updated: ${new Date().toLocaleString()}`;
  els.fixturesList.innerHTML = `<div class="empty-box">Loading important upcoming fixtures...</div>`;

  try {
    const competitions = await resolveCompetitions();
    await preloadLeagueLogos(competitions);

    const responses = await Promise.all(competitions.map(async (competition) => {
      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${competition.id}`);
        const data = await res.json();
        const events = Array.isArray(data?.events) ? data.events : [];
        return events.map((ev) => ({
          leagueId: competition.id,
          category: competition.category,
          league: ev.strLeague || competition.name,
          season: ev.strSeason || "",
          round: ev.intRound || ev.strRound || "",
          home: ev.strHomeTeam || "Home",
          away: ev.strAwayTeam || "Away",
          homeTeamId: ev.idHomeTeam || "",
          awayTeamId: ev.idAwayTeam || "",
          homeBadge: ev.strHomeTeamBadge || "",
          awayBadge: ev.strAwayTeamBadge || "",
          venue: ev.strVenue || "",
          status: ev.strStatus || "Scheduled",
          date: ev.dateEvent || "",
          time: ev.strTime || "",
          kickoff: formatKickoff(ev.dateEvent, ev.strTime),
          stamp: Date.parse(`${ev.dateEvent || "1970-01-01"}T${ev.strTime || "00:00:00"}Z`) || Number.MAX_SAFE_INTEGER
        }));
      } catch {
        return [];
      }
    }));

    const bangladeshFixtures = await fetchBangladeshTeamFixtures();

    const merged = responses.flat()
      .concat(bangladeshFixtures)
      .filter((item) => {
        if (!isInternationalCompetition(item.league || "")) return true;
        return isTopCountryMatch(item.home, item.away);
      })
      .sort((a, b) => (leaguePriority(a.league) - leaguePriority(b.league)) || (a.stamp - b.stamp))
      .slice(0, 72);

    await preloadTeamBadges(merged);
    const withBadges = merged.map((item) => ({
      ...item,
      homeBadge: item.homeBadge || TEAM_BADGE_CACHE.get(String(item.homeTeamId)) || "",
      awayBadge: item.awayBadge || TEAM_BADGE_CACHE.get(String(item.awayTeamId)) || ""
    }));

    renderFixtures(withBadges);
  } catch (err) {
    console.error(err);
    els.fixturesList.innerHTML = `<div class="empty-box">Could not load fixtures right now.</div>`;
  }
}
async function loadHighlights() {
  if (!els.highlightsList) return;

  els.highlightsList.innerHTML = `<div class="empty-box">Loading highlight videos...</div>`;

  try {
    const response = await fetch("https://www.scorebat.com/video-api/v3/");
    const payload = await response.json();
    const raw = Array.isArray(payload?.response) ? payload.response : [];

    const items = raw
      .filter((item) => isPopularCompetition(item.competition || ""))
      .map((item) => {
        const firstVideo = Array.isArray(item.videos) ? item.videos[0] : null;
        const url = extractEmbedSrc(firstVideo?.embed || "") || item.matchviewUrl || item.url || "#";
        return {
          title: item.title || "Match highlight",
          competition: item.competition || "Top Competition",
          thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
          url
        };
      })
      .filter((item) => item.url && item.url !== "#")
      .slice(0, 6);

    renderHighlights(items);
  } catch (err) {
    console.error(err);
    els.highlightsList.innerHTML = `<div class="empty-box">Could not load videos right now.</div>`;
  }
}

function renderMapSearchResults(results = []) {
  if (!els.mapSearchResults) return;

  if (!results.length) {
    els.mapSearchResults.innerHTML = "";
    return;
  }

  els.mapSearchResults.innerHTML = results.map((item) => `
    <button class="map-result-btn" type="button" data-lat="${escapeHtml(String(item.lat))}" data-lng="${escapeHtml(String(item.lng))}">
      ${escapeHtml(item.label || "Location")}
    </button>
  `).join("");

  els.mapSearchResults.querySelectorAll(".map-result-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lat = Number(btn.dataset.lat);
      const lng = Number(btn.dataset.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      setMapSelection(lat, lng, true);
      adminMap?.setView([lat, lng], 17);
      els.mapSearchResults.innerHTML = "";
    });
  });
}

async function searchMapLocation() {
  if (!els.mapSearchInput) return;

  const queryText = els.mapSearchInput.value.trim();
  if (!queryText) {
    renderMapSearchResults([]);
    return;
  }

  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryText + ", Bangladesh")}&limit=8&lang=en`;
    const photonResp = await fetch(photonUrl, { headers: { Accept: "application/json" } });
    const photonData = await photonResp.json();
    const features = Array.isArray(photonData?.features) ? photonData.features : [];

    const mapped = features.map((f) => {
      const coords = f?.geometry?.coordinates || [];
      const lon = Number(coords[0]);
      const lat = Number(coords[1]);
      const p = f?.properties || {};
      const label = [p.name, p.city, p.district, p.state, p.country].filter(Boolean).join(", ");
      return {
        lat,
        lng: lon,
        label
      };
    }).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

    if (mapped.length) {
      renderMapSearchResults(mapped);
      return;
    }

    const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=bd&limit=8&q=${encodeURIComponent(queryText)}`;
    const fallbackResp = await fetch(fallbackUrl, { headers: { Accept: "application/json" } });
    const fallbackData = await fallbackResp.json();
    const fallbackMapped = (Array.isArray(fallbackData) ? fallbackData : []).map((item) => ({
      lat: Number(item.lat),
      lng: Number(item.lon),
      label: item.display_name || "Location"
    })).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

    renderMapSearchResults(fallbackMapped);
  } catch (err) {
    console.error(err);
    showToast("Location search failed. Try another keyword.");
  }
}
function openBkashModal() {
  els.bkashModal?.classList.remove("hidden");
}

function closeBkashModal() {
  els.bkashModal?.classList.add("hidden");
  if (els.bkashLast3Input) els.bkashLast3Input.value = "";

}
function startBookingFlow() {
  const qty = getRequestedSlots();
  if (els.heroSlotQty) els.heroSlotQty.value = String(qty);

  if (els.heroPaymentSelect.value === "bKash") {
    openBkashModal();
    return;
  }

  bookMatchDirect({ bkashConfirmed: false, bkashLast3: "" });
}

function continueBkashBooking() {
  const last3 = String(els.bkashLast3Input?.value || "").trim();
  if (!/^\d{3}$/.test(last3)) {
    showToast("Enter last 3 digits of your bKash number.");
    return;
  }
  closeBkashModal();
  bookMatchDirect({ bkashConfirmed: true, bkashLast3: last3 });
}

async function logActivity(action, match, details = {}) {
  try {
    const actor = auth.currentUser;
    if (!actor) return;

    await addDoc(collection(db, "activityLogs"), {
      action,
      matchId: match?.id || "",
      matchLabel: match?.label || "Match",
      matchLocation: match?.location || "Venue",
      actorUserId: actor.uid,
      actorName: state.userProfile?.name || actor.displayName || actor.email?.split("@")[0] || "User",
      actorEmail: actor.email || "",
      ...details,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Activity log failed:", err);
  }
}

function renderActivityAction(action) {
  if (action === "booked") return "Booked";
  if (action === "cancelled") return "Cancelled";
  if (action === "removed_by_admin") return "Removed by admin";
  return action || "Updated";
}

function listenAdminActivity() {
  state.activityUnsub?.();
  state.activityUnsub = onSnapshot(
    query(collection(db, "activityLogs"), orderBy("createdAt", "desc"), limit(100)),
    (snap) => {
      if (!els.adminActivityList) return;

      if (snap.empty) {
        els.adminActivityList.innerHTML = `<div class="empty-box">No slot activity yet.</div>`;
        return;
      }

      els.adminActivityList.innerHTML = snap.docs.map((d) => {
        const item = d.data();
        const when = item.createdAt?.toDate?.() ? item.createdAt.toDate().toLocaleString() : "";
        const actor = escapeHtml(item.actorName || item.actorEmail || "User");
        const target = escapeHtml(item.targetName || item.targetEmail || "");
        const payment = escapeHtml(item.paymentMethod || "");
        const venue = escapeHtml(item.matchLocation || "Venue");

        return `
          <div class="announcement-card activity-card">
            <div class="activity-head">
              <strong>${renderActivityAction(item.action)}</strong>
              <span class="muted">${when}</span>
            </div>
            <div class="muted">Match: ${venue}</div>
            <div class="muted">By: ${actor}</div>
            ${target ? `<div class="muted">Player: ${target}</div>` : ""}
            ${payment ? `<div class="muted">Payment: ${payment}</div>` : ""}
          </div>
        `;
      }).join("");
    },
    (err) => {
      console.error(err);
      showToast("Could not load activity timeline.");
    }
  );
}
function authUiMode(mode) {
  authMode = mode;
  const isLogin = mode === "login";
  els.loginTab.classList.toggle("active", isLogin);
  els.signupTab.classList.toggle("active", !isLogin);
  els.authTitle.textContent = isLogin ? "Welcome back" : "Create your account";
  els.authSubmitBtn.textContent = isLogin ? "Sign in" : "Create account";
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


async function routeAfterLogin(user) {
  if (!user) {
    state.user = null;
    state.userProfile = null;
    els.logoutBtn.classList.add("hidden");
    els.profileBtn.classList.add("hidden");
    setView(els.authView);
    return;
  }

  state.user = user;
  try {
    await ensureUserProfile(user);
  } catch (err) {
    console.error("Profile bootstrap failed:", err);
    state.userProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split("@")[0] || "Player",
      email: user.email || "",
      phone: "",
      photoURL: user.photoURL || "",
      role: user.email === ADMIN_EMAIL ? "admin" : "player"
    };
    showToast("Logged in. Profile sync will retry in background.");
  }

  els.logoutBtn.classList.remove("hidden");

  if (user.email === ADMIN_EMAIL) {
    els.profileBtn.classList.add("hidden");
    setView(els.adminView);
    listenAdminMatches();
    listenAnnouncements(els.adminAnnouncementList, true);
    listenAdminActivity();
  } else {
    els.profileBtn.classList.remove("hidden");
    setView(els.playerView);
    renderProfileCard(user);
    renderExtraPlayerFields();
    els.heroDownloadBtn.classList.add("hidden");
    listenFeaturedMatches();
    listenAnnouncements(els.announcementList, false);
    loadDailyFixtures();
    loadHighlights();
  }
}
function renderProfileCard(user) {
  const p = state.userProfile || {};
  const letter = (p.name || user.email || "P").charAt(0).toUpperCase();

  els.playerProfileName.textContent = p.name || "Player";
  els.playerProfileEmail.textContent = p.email || user.email || "";
  els.playerProfilePhone.textContent = p.phone || "No phone saved";

  if (p.photoURL) {
    els.playerAvatar.innerHTML = `<img src="${p.photoURL}" alt="Profile" />`;
  } else {
    els.playerAvatar.textContent = letter;
  }
}

function openProfileModal() {
  const p = state.userProfile || {};
  els.profileName.value = p.name || "";
  els.profilePhone.value = p.phone || "";
  els.profilePhotoUrl.value = p.photoURL || "";
  els.profileModal.classList.remove("hidden");
}

function closeProfileModal() {
  els.profileModal.classList.add("hidden");
}

async function saveProfile(e) {
  e.preventDefault();
  try {
    const user = auth.currentUser;
    if (!user) return;

    const payload = {
      name: els.profileName.value.trim() || "Player",
      phone: els.profilePhone.value.trim(),
      photoURL: els.profilePhotoUrl.value.trim()
    };

    await updateDoc(doc(db, "users", user.uid), payload);
    await updateProfile(user, {
      displayName: payload.name,
      photoURL: payload.photoURL || null
    });

    await ensureUserProfile(user);
    renderProfileCard(user);
    renderExtraPlayerFields();
    closeProfileModal();
    showToast("Profile updated.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Profile update failed.");
  }
}

async function handleAuthSubmit() {
  const email = els.emailInput.value.trim();
  const password = els.passwordInput.value;

  if (!email || !password) {
    showToast("Enter email and password.");
    return;
  }

  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Welcome back.");
      await routeAfterLogin(auth.currentUser);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      showToast("Your account is ready.");
      await routeAfterLogin(auth.currentUser);
    }
  } catch (err) {
    console.error(err);

    if (authMode === "login" && err.code === "auth/invalid-credential") {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast("No account found. New account created and signed in.");
        await routeAfterLogin(auth.currentUser);
        return;
      } catch (createErr) {
        console.error(createErr);
        if (createErr.code === "auth/email-already-in-use") {
          showToast("Email or password is incorrect.");
        } else {
          showToast(createErr.message || "Could not sign you in.");
        }
        return;
      }
    }

    if (err.code === "auth/email-already-in-use") showToast("This email is already registered.");
    else if (err.code === "auth/invalid-credential") showToast("Email or password is incorrect.");
    else showToast(err.message || "Could not sign you in.");
  }
}

async function handleGoogleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
    showToast("Logged in with Google.");
    await routeAfterLogin(auth.currentUser);
  } catch (err) {
    console.error(err);
    showToast(err.message || "Google sign-in failed.");
  }
}

async function handleForgotPassword() {
  const email = els.emailInput.value.trim();

  if (!email) {
    showToast("Enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Reset link sent to your email.");
  } catch (err) {
    console.error(err);
    if (err.code === "auth/invalid-email") showToast("Enter a valid email address.");
    else if (err.code === "auth/user-not-found") showToast("No account found with this email.");
    else showToast(err.message || "Could not send reset email.");
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

function renderPlayers(bookings) {
  if (!state.featuredMatch) return;

  const total = Number(state.featuredMatch.totalSlots || 0);
  const booked = getBookedSlots(bookings);
  const left = Math.max(total - booked, 0);

  els.playersMeta.textContent = `${booked} booked | ${left} open`;

  if (!bookings.length) {
    els.playersList.innerHTML = `<div class="empty-box">No one has booked yet.</div>`;
    return;
  }

  const isAdmin = state.user?.email === ADMIN_EMAIL;

  els.playersList.innerHTML = bookings.map((b) => {
    const name = escapeHtml(b.name || b.email || "Player");
    const payment = escapeHtml(b.paymentMethod || "N/A");
    const slots = Math.max(Number(b.slots || 1), 1);
    const unitFee = Number(state.featuredMatch?.slotFee || b.slotFee || 0);
    const totalFee = Number(b.totalFee || (unitFee * slots));
    const others = Array.isArray(b.extraPlayerNames) && b.extraPlayerNames.length ? ` | ${escapeHtml(b.extraPlayerNames.join(", "))}` : "";
    const detailLine = isAdmin ? `<div>${payment} | ${slots} slot(s) | BDT ${totalFee}${others}</div>` : `<div>${slots} slot(s)${others}</div>`;
    return `
      <div class="player-chip">
        <div>
          <strong>${name}</strong>
          ${detailLine}
        </div>
        ${isAdmin ? `<button class="kick-btn" data-userid="${b.userId}">Kick</button>` : ""}
      </div>
    `;
  }).join("");

  if (isAdmin) {
    els.playersList.querySelectorAll(".kick-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await kickPlayerDirect(state.featuredMatch.id, btn.dataset.userid);
      });
    });
  }
}

function updateHero(match, bookings) {
  const total = Number(match.totalSlots || 0);
  const booked = getBookedSlots(bookings);
  const left = Math.max(total - booked, 0);
  const percent = total ? Math.round((booked / total) * 100) : 0;
  const myBooking = state.user ? bookings.find((b) => b.userId === state.user.uid) : null;
  const mySlots = Math.max(Number(myBooking?.slots || 0), 0);
  const canTakeMoreForUser = Math.max(4 - mySlots, 0);
  const isClosed = match.status === "closed" || left <= 0 || canTakeMoreForUser <= 0;

  const lat = Number(match.latitude);
  const lng = Number(match.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const photoUrls = Array.isArray(match.photoUrls) ? match.photoUrls.filter(Boolean) : [];

  els.heroBadge.textContent = match.label || "Match";
  els.heroVenue.textContent = match.location || "Venue";

  if (photoUrls.length) {
    els.heroFieldImage.src = photoUrls[0];
    els.heroFieldImage.classList.remove("hidden");
  } else if (match.mapImage) {
    els.heroFieldImage.src = match.mapImage;
    els.heroFieldImage.classList.remove("hidden");
  } else {
    els.heroFieldImage.classList.add("hidden");
  }

  if (hasCoords && els.heroMapWrap && els.heroMapFrame && els.heroMapLink) {
    els.heroMapFrame.src = getGoogleMapsEmbedUrl(lat, lng);
    els.heroMapLink.href = getGoogleMapsUrl(lat, lng);
    els.heroMapWrap.classList.remove("hidden");
  } else {
    els.heroMapWrap?.classList.add("hidden");
  }

  renderVenuePhotos(photoUrls);

  els.heroDate.textContent = formatMatchDate(match.date, match.time);
  els.heroPlayers.textContent = `${booked} / ${total}`;
  const feeText = Number.isFinite(Number(match.slotFee)) ? `BDT ${Number(match.slotFee)}` : "Set by admin";
  els.heroPayment.textContent = feeText;
  els.heroSlotsText.textContent = left > 0 ? `${left} SLOTS LEFT` : "MATCH FULL";
  els.heroSlotsText.classList.toggle("full", left <= 0);
  els.heroPercent.textContent = `${percent}%`;
  els.heroProgress.style.width = `${percent}%`;
  els.heroBookBtn.disabled = isClosed;
  els.heroDownloadBtn.disabled = true;
  els.heroCancelBtn.disabled = !myBooking;

  if (els.heroSlotQty) {
    const maxCanBook = Math.max(Math.min(left, canTakeMoreForUser), 1);
    els.heroSlotQty.max = String(maxCanBook);
    if (Number(els.heroSlotQty.value) > maxCanBook) els.heroSlotQty.value = String(maxCanBook);
    if (Number(els.heroSlotQty.value) < 1) els.heroSlotQty.value = "1";
  }
  refreshBookingPreview();
}

function listenBookingsForMatch(matchId) {
  state.bookingsUnsub?.();
  state.bookingsUnsub = onSnapshot(
    collection(db, "matches", matchId, "bookings"),
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

function listenFeaturedMatches() {
  state.featuredUnsub?.();
  const q = query(
    collection(db, "matches"),
    where("status", "==", "open"),
    limit(1)
  );

  state.featuredUnsub = onSnapshot(q, (snap) => {
    if (snap.empty) {
      state.featuredMatch = null;
      els.heroBadge.textContent = "No match";
      els.heroVenue.textContent = "No match scheduled";
      els.heroFieldImage.classList.add("hidden");
      els.heroMapWrap?.classList.add("hidden");
      renderVenuePhotos([]);
      els.heroDate.textContent = "No match is scheduled right now.";
      els.heroPlayers.textContent = "0 / 0";
      els.heroPayment.textContent = "Set by admin";
      els.heroSlotsText.textContent = "NO MATCH";
      els.heroSlotsText.classList.remove("full");
      els.heroPercent.textContent = "0%";
      els.heroProgress.style.width = "0%";
      els.playersMeta.textContent = "";
      els.playersList.innerHTML = `<div class="empty-box">No match is scheduled right now.</div>`;
      els.heroBookBtn.disabled = true;
      els.heroDownloadBtn.disabled = true;
      els.heroCancelBtn.disabled = true;
      if (els.heroSlotQty) els.heroSlotQty.value = "1";
      refreshBookingPreview();
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

function listenAnnouncements(target, isAdmin = false) {
  state.announcementsUnsub?.();
  state.announcementsUnsub = onSnapshot(
    query(collection(db, "announcements"), orderBy("createdAt", "desc")),
    (snap) => {
      if (snap.empty) {
        target.innerHTML = `<div class="empty-box">No announcements yet.</div>`;
        return;
      }

      target.innerHTML = snap.docs.map((d) => {
        const a = d.data();
        const date = a.createdAt?.toDate?.() ? a.createdAt.toDate().toLocaleString() : "";

        if (!isAdmin) {
          return `<div class="announcement-card"><strong>${escapeHtml(a.text || "")}</strong><div class="muted">${date}</div></div>`;
        }

        return `<div class="announcement-card"><strong>${escapeHtml(a.text || "")}</strong><div class="muted">${date}</div><div class="admin-actions top-space"><button class="secondary-btn edit-announcement-btn" data-id="${d.id}">Edit</button><button class="ghost-btn delete-announcement-btn" data-id="${d.id}">Delete</button></div></div>`;
      }).join("");

      if (isAdmin) {
        target.querySelectorAll(".edit-announcement-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await editAnnouncement(btn.dataset.id);
          });
        });

        target.querySelectorAll(".delete-announcement-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await deleteAnnouncement(btn.dataset.id);
          });
        });
      }
    },
    (err) => {
      console.error(err);
      showToast("Could not load announcements.");
    }
  );
}
async function bookMatchDirect({ bkashConfirmed = false, bkashLast3 = "" } = {}) {
  try {
    const user = auth.currentUser;
    const match = state.featuredMatch;
    if (!user) {
      showToast("Please log in first.");
      return;
    }

    if (!match) {
      showToast("No match is scheduled right now.");
      return;
    }

    const selectedPayment = els.heroPaymentSelect.value;
    const requestedSlots = getRequestedSlots();
    const extraNames = parseExtraPlayerNames();

    if (requestedSlots > 4) {
      showToast("Maximum 4 slots per booking.");
      return;
    }

    if (requestedSlots > 1 && extraNames.length !== requestedSlots - 1) {
      showToast(`Please add exactly ${requestedSlots - 1} other player name(s).`);
      return;
    }

    const normalizedExtraNames = extraNames.map((name) => name.toLowerCase());
    if (new Set(normalizedExtraNames).size !== normalizedExtraNames.length) {
      showToast("Duplicate player names are not allowed.");
      return;
    }

    const bookerName = getBookerDisplayName().toLowerCase();
    if (normalizedExtraNames.some((name) => name === bookerName)) {
      showToast("Do not repeat your own name in additional players.");
      return;
    }

    if (selectedPayment === "bKash" && !bkashConfirmed) {
      openBkashModal();
      return;
    }

    if (selectedPayment === "bKash" && !/^\d{3}$/.test(String(bkashLast3 || ""))) {
      showToast("Enter last 3 digits of your bKash number.");
      return;
    }

    const bookingRef = doc(db, "matches", match.id, "bookings", user.uid);
    const existingBooking = await getDoc(bookingRef);
    const existingData = existingBooking.exists() ? existingBooking.data() : {};

    const bookingsSnap = await getDocs(collection(db, "matches", match.id, "bookings"));
    const allBookings = bookingsSnap.docs.map((d) => d.data());
    const bookedCount = getBookedSlots(allBookings);
    const existingSlots = Math.max(Number(existingData?.slots || 0), 0);
    const left = Math.max(Number(match.totalSlots || 0) - bookedCount, 0);

    if (requestedSlots > left) {
      showToast(left > 0 ? `${left} slot(s) left only.` : "Match full.");
      return;
    }

    const newSlots = existingSlots + requestedSlots;
    if (newSlots > 4) {
      showToast("One player can hold maximum 4 slots.");
      return;
    }

    const previousNames = Array.isArray(existingData?.extraPlayerNames) ? existingData.extraPlayerNames : [];
    const combinedExtraNames = [...previousNames, ...extraNames].slice(0, 3);
    const unitFee = Number(match.slotFee || 0);
    const totalFee = unitFee * newSlots;
    const p = state.userProfile || {};

    await setDoc(bookingRef, {
      userId: user.uid,
      email: user.email || "",
      name: p.name || user.displayName || user.email?.split("@")[0] || "Player",
      paymentMethod: selectedPayment,
      bkashLast3: selectedPayment === "bKash" ? String(bkashLast3 || existingData?.bkashLast3 || "") : "",
      slotFee: unitFee,
      slots: newSlots,
      extraPlayerNames: combinedExtraNames,
      totalFee,
      createdAt: existingData?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    await logActivity("booked", match, {
      targetUserId: user.uid,
      targetName: p.name || user.displayName || "",
      targetEmail: user.email || "",
      paymentMethod: selectedPayment,
      slotFee: unitFee,
      slotsAdded: requestedSlots,
      totalSlotsForUser: newSlots,
      totalFee
    });

    playBookingAnimation();
    showToast(`Reserved ${requestedSlots} slot(s).`);
    if (!els.playerView?.classList.contains("hidden")) {
      setPlayerPage("bookingsSection");
    }
    if (els.heroSlotQty) els.heroSlotQty.value = "1";
    renderExtraPlayerFields();
    refreshBookingPreview();
    openReceiptModal({
      venue: match.location || "Venue",
      when: formatMatchDate(match.date, match.time),
      slots: newSlots,
      unitFee,
      totalFee,
      payment: selectedPayment,
      last3: selectedPayment === "bKash" ? String(bkashLast3 || "") : ""
    });
  } catch (err) {
    console.error(err);
    showToast(err.message || "Booking failed.");
  }
}

async function cancelBookingDirect() {
  try {
    const user = auth.currentUser;
    const match = state.featuredMatch;
    if (!user) {
      showToast("Please log in first.");
      return;
    }

    if (!match) {
      showToast("No match is scheduled right now.");
      return;
    }
    const bookingRef = doc(db, "matches", match.id, "bookings", user.uid);
    const bookingSnap = await getDoc(bookingRef);
    const booking = bookingSnap.exists() ? bookingSnap.data() : {};

    await deleteDoc(bookingRef);

    await logActivity("cancelled", match, {
      targetUserId: user.uid,
      targetName: booking.name || state.userProfile?.name || user.displayName || "",
      targetEmail: booking.email || user.email || "",
      paymentMethod: booking.paymentMethod || ""
    });
    showToast("Your slot has been cancelled.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Cancel failed.");
  }
}

async function kickPlayerDirect(matchId, userId) {
  try {
    const bookingRef = doc(db, "matches", matchId, "bookings", userId);
    const bookingSnap = await getDoc(bookingRef);
    const booking = bookingSnap.exists() ? bookingSnap.data() : {};

    await deleteDoc(bookingRef);

    await logActivity("removed_by_admin", state.featuredMatch || { id: matchId }, {
      targetUserId: userId,
      targetName: booking.name || "",
      targetEmail: booking.email || "",
      paymentMethod: booking.paymentMethod || ""
    });
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
    const slotFee = Number(els.adminFee.value);
    const latitude = Number(els.adminLat.value);
    const longitude = Number(els.adminLng.value);
    const mapImage = els.adminMapImage.value.trim();
    const label = els.adminLabel.value.trim() || "Match";
    const photoUrls = parsePhotoUrls(els.adminPhotos?.value);

    if (!location || !date || !time || !totalSlots || Number.isNaN(slotFee) || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !mapImage) {
      showToast("Please complete all match details.");
      return;
    }

    await addDoc(collection(db, "matches"), {
      location,
      date,
      time,
      totalSlots,
      slotFee,
      latitude,
      longitude,
      mapImage,
      label,
      photoUrls,
      status: "open",
      createdAt: serverTimestamp()
    });

    els.adminMatchForm.reset();
    els.adminMapPreviewWrap.classList.add("hidden");
    if (els.adminMapImage) els.adminMapImage.value = "";
    els.adminMapCoords.textContent = "";
    showToast("Match session published.");
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

      const cards = [];
      for (const d of snap.docs) {
        const m = d.data();
        const bookingsSnap = await getDocs(collection(db, "matches", d.id, "bookings"));
        const booked = getBookedSlots(bookingsSnap.docs.map((b) => b.data()));

        cards.push(`
          <div class="admin-match-card">
            <div>
              <strong>${escapeHtml(m.location || "Venue")}</strong>
              <div class="muted">${escapeHtml(formatMatchDate(m.date, m.time))}</div>
              <div class="muted">${booked} / ${m.totalSlots} booked | ${m.status}</div>
              <div class="muted">Fee: BDT ${Number(m.slotFee || 0)}</div>
              ${m.mapImage ? `<img class="admin-map-thumb" src="${escapeHtml(m.mapImage)}" alt="Map preview" />` : ""}
            </div>
            <div class="admin-actions">
              <button class="secondary-btn toggle-match-btn" data-id="${d.id}" data-status="${m.status}">
                ${m.status === "open" ? "Close" : "Reopen"}
              </button>
            </div>
          </div>
        `);
      }

      els.adminMatchesList.innerHTML = cards.join("");

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

async function editAnnouncement(id) {
  try {
    const nextText = window.prompt("Edit announcement:");
    if (nextText === null) return;
    const text = nextText.trim();
    if (!text) {
      showToast("Announcement cannot be empty.");
      return;
    }

    await updateDoc(doc(db, "announcements", id), {
      text,
      updatedAt: serverTimestamp()
    });
    showToast("Announcement updated.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not update announcement.");
  }
}

async function deleteAnnouncement(id) {
  try {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "announcements", id));
    showToast("Announcement deleted.");
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not delete announcement.");
  }
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

  ctx.font = "bold 54px Arial";
  ctx.fillText(`TOTAL PLAYERS: ${Number(match.totalSlots || 0)}`, 90, 610);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `matchday-${match.location || "poster"}.png`;
  a.click();
}

on(els.loginTab, "click", () => authUiMode("login"));
on(els.signupTab, "click", () => authUiMode("signup"));
on(els.authSubmitBtn, "click", handleAuthSubmit);
on(els.googleBtn, "click", handleGoogleLogin);
on(els.forgotPasswordBtn, "click", handleForgotPassword);
on(els.logoutBtn, "click", logout);
on(els.profileBtn, "click", openProfileModal);
on(els.closeProfileModal, "click", closeProfileModal);
on(els.openMapPickerBtn, "click", openMapPicker);
on(els.mapSearchBtn, "click", searchMapLocation);
on(els.refreshFixturesBtn, "click", loadDailyFixtures);
on(els.closeMapPickerModal, "click", closeMapPicker);
on(els.confirmMapPickerBtn, "click", confirmMapPicker);
on(els.closeBkashModal, "click", closeBkashModal);
on(els.bkashContinueBtn, "click", continueBkashBooking);
on(els.profileForm, "submit", saveProfile);
on(els.heroBookBtn, "click", startBookingFlow);
on(els.heroCancelBtn, "click", cancelBookingDirect);
on(els.heroDownloadBtn, "click", downloadPoster);
on(els.heroSlotQty, "input", refreshBookingPreview);
on(els.extraPlayersList, "input", refreshBookingPreview);
on(els.extraPlayerNames, "input", refreshBookingPreview);
on(els.heroPaymentSelect, "change", refreshBookingPreview);
on(els.closeReceiptModal, "click", closeReceiptModal);
on(els.downloadReceiptBtn, "click", downloadReceipt);
on(els.adminMatchForm, "submit", createMatch);
on(els.announcementForm, "submit", postAnnouncement);

on(els.mapSearchInput, "keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchMapLocation();
  }
});

window.addEventListener("hashchange", () => {
  if (els.playerView?.classList.contains("hidden")) return;
  const pageFromHash = getPlayerPageFromHash();
  if (pageFromHash) setPlayerPage(pageFromHash, { updateHash: false });
});

initStaticUi();
initMotionUi();
initMoreMenu();
authUiMode("login");
refreshBookingPreview();

onAuthStateChanged(auth, async (user) => {
  stopLiveListeners();

  setTimeout(() => {
    els.splash.classList.add("hidden");
  }, 400);

  try {
    await routeAfterLogin(user);
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed after login.");
    setView(els.authView);
  }
});
































































