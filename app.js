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
  collectionGroup,
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
const BKASH_QR_IMAGE_URL = "https://quickchart.io/qr?text=bKash%2001623729249&size=240";
const CONTACT_PHONE = "01304204769";
const CONTACT_EMAIL = "ikshihab2002@gmail.com";
const CONTACT_FACEBOOK = "https://www.facebook.com/shihabb.zz/";
const MAX_TOTAL_SLOTS_PER_USER = 4;

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
  myBookingsUnsub: null,
  playerPage: "liveScoreSection",
  fixturesData: [],
  fixtureMode: "all",
  fixtureLeague: "all",
  highlightsData: [],
  fixturesRefreshTimer: null,
  fixturesLastLoadedAt: 0
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
  heroQtyMinus: $("heroQtyMinus"),
  heroSlotQty: $("heroSlotQty"),
  heroQtyPlus: $("heroQtyPlus"),
  heroPaymentSelect: $("heroPaymentSelect"),
  heroPaymentSwitch: $("heroPaymentSwitch"),
  heroFeePreview: $("heroFeePreview"),
  heroPaymentNotice: $("heroPaymentNotice"),
  heroDownloadBtn: $("heroDownloadBtn"),
  bkashModal: $("bkashModal"),
  closeBkashModal: $("closeBkashModal"),
  bkashContinueBtn: $("bkashContinueBtn"),
  bkashPayableText: $("bkashPayableText"),
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
  adminActivitySummary: $("adminActivitySummary"),
  adminActivityUsers: $("adminActivityUsers"),

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
  fixturesLeagueRail: $("fixturesLeagueRail"),
  refreshFixturesBtn: $("refreshFixturesBtn"),
  highlightsList: $("highlightsList"),
  highlightsLead: $("highlightsLead"),
  highlightsTrending: $("highlightsTrending"),
  highlightsSearchInput: $("highlightsSearchInput"),
  highlightsSearchBtn: $("highlightsSearchBtn"),
  highlightsMeta: $("highlightsMeta"),
  fixtureTabLive: $("fixtureTabLive"),
  fixtureTabUpcoming: $("fixtureTabUpcoming"),
  fixtureTabResults: $("fixtureTabResults"),
  fixtureTabAll: $("fixtureTabAll"),
  myBookingsList: $("myBookingsList"),
  myBookingsMeta: $("myBookingsMeta"),
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
  fixtureDetailModal: $("fixtureDetailModal"),
  closeFixtureDetailModal: $("closeFixtureDetailModal"),
  fixtureDetailTitle: $("fixtureDetailTitle"),
  fixtureDetailMeta: $("fixtureDetailMeta"),
  fixtureDetailBody: $("fixtureDetailBody"),
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
const LINEUP_CACHE = new Map();
const FIXTURE_DETAIL_CACHE = new Map();
const SPORTMONKS_PROXY_URL = "/api/sportmonks";
const FOOTBALL_NEWS_URL = "/api/football-news";
const FOOTBALL_NEWS_FEEDS = [
  { source: "ESPN FC", url: "https://www.espn.com/espn/rss/soccer/news" },
  { source: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" }
];
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
    if (isActive) {
      section.classList.remove("route-shift");
      void section.offsetWidth;
      section.classList.add("route-shift");
    }
  });

  markActivePlayerMenu(next);
  if (updateHash) window.history.replaceState(null, "", `#${next}`);
  if (next === "fixturesSection") loadDailyFixtures({ silent: true });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}

function setButtonLoading(btn, loading, loadingText = "Loading...") {
  if (!btn) return;
  if (loading) {
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent || "";
    btn.textContent = loadingText;
    btn.disabled = true;
    btn.classList.add("loading-state");
  } else {
    if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
    btn.disabled = false;
    btn.classList.remove("loading-state");
  }
}

function animateListEntrance(container, selector) {
  if (!container) return;
  const items = container.querySelectorAll(selector);
  items.forEach((item, idx) => {
    item.classList.remove("stagger-in");
    item.style.animationDelay = String(Math.min(idx * 50, 360)) + "ms";
    item.classList.add("stagger-in");
  });
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
function initStaticUi() {
  const toPhoneDigits = (value) => String(value || "").replace(/\D/g, "");
  const toWhatsAppUrl = (value) => {
    const digits = toPhoneDigits(value);
    return digits ? "https://wa.me/" + digits : "#";
  };

  const phoneDigits = toPhoneDigits(CONTACT_PHONE);
  const whatsappUrl = toWhatsAppUrl(CONTACT_PHONE);
  const phoneUrl = phoneDigits ? "tel:+" + phoneDigits : "#";
  const emailUrl = CONTACT_EMAIL ? "mailto:" + CONTACT_EMAIL : "#";
  const facebookUrl = CONTACT_FACEBOOK || "#";

  [els.contactWhatsappLink, els.contactWhatsappLinkPlayer].forEach((link) => {
    if (!link) return;
    link.href = whatsappUrl;
  });

  [els.contactPhoneLink].forEach((link) => {
    if (!link) return;
    link.href = phoneUrl;
  });

  [els.contactEmailLink, els.contactEmailLinkPlayer].forEach((link) => {
    if (!link) return;
    link.href = emailUrl;
  });

  [els.contactFacebookLink, els.contactFacebookLinkPlayer].forEach((link) => {
    if (!link) return;
    link.href = facebookUrl;
  });

  if (els.bkashQrImage) {
    els.bkashQrImage.src = BKASH_QR_IMAGE_URL;
  }

  if (els.bkashNumberText) {
    els.bkashNumberText.textContent = BKASH_PAYMENT_NUMBER;
  }

  if (els.bkashNumberLink) {
    els.bkashNumberLink.href = toWhatsAppUrl(BKASH_PAYMENT_NUMBER);
  }
}
function getUiIconSvg(name = "dot") {
  const icons = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="8" r="4"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    score: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14v14H5z"/><path d="M9 9h6M9 15h6"/></svg>',
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h13a3 3 0 0 1 3 3v9H7a3 3 0 0 1-3-3V6z"/><path d="M8 10h8M8 14h5"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a2 2 0 0 0 0 6v3h16v-3a2 2 0 0 0 0-6V6H4v3z"/><path d="M12 6v12"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><path d="M12 7h.01"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
    google: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12.2c0-.6-.05-1.17-.15-1.7H12v3.2h4.5a3.9 3.9 0 0 1-1.67 2.55v2.12H17.5c1.58-1.46 2.5-3.62 2.5-6.19Z"/><path d="M12 21c2.25 0 4.13-.75 5.5-2.03l-2.67-2.12c-.74.5-1.68.8-2.83.8-2.18 0-4.03-1.47-4.68-3.45H4.56v2.17A9 9 0 0 0 12 21Z"/><path d="M7.32 14.2A5.4 5.4 0 0 1 7 12c0-.76.12-1.5.32-2.2V7.63H4.56A9 9 0 0 0 3 12c0 1.45.35 2.82.98 4.03l3.34-1.83Z"/><path d="M12 6.35c1.22 0 2.3.42 3.16 1.23l2.37-2.37C16.12 3.9 14.25 3 12 3a9 9 0 0 0-7.44 4.37l2.76 2.17c.65-1.98 2.5-3.19 4.68-3.19Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.35-4.35"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0 2 5.3"/><path d="M20 4v7h-7"/></svg>',
    reserve: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    cancel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 20h14"/></svg>',
    location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-4.8 7-11a7 7 0 1 0-14 0c0 6.2 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h8"/><path d="M9 14h6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    lineup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="12" cy="16" r="2.5"/><path d="M7 9.5v3M17 9.5v3M12 13.5v-3"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z"/><path d="m4 8 8 5 8-5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 3h3l1.2 4.2-1.8 1.8a15 15 0 0 0 6 6l1.8-1.8L21 14.4v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-5.5A8.5 8.5 0 1 1 21 11.5Z"/></svg>'
  };

  return icons[name] || icons.info;
}

function applyInlineIcon(el, iconName, options = {}) {
  if (!el) return;
  const { mode = "prepend", wrapClass = "btn-with-icon" } = options;

  if (mode === "replace") {
    if (el.dataset.iconApplied === iconName) return;
    el.innerHTML = getUiIconSvg(iconName);
    el.dataset.iconApplied = iconName;
    return;
  }

  if (el.querySelector(`.ui-icon[data-icon="${iconName}"]`)) return;
  const icon = document.createElement("span");
  icon.className = `ui-icon ui-icon-${mode}`;
  icon.dataset.icon = iconName;
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = getUiIconSvg(iconName);

  if (wrapClass) el.classList.add(wrapClass);
  if (mode === "append") el.append(icon);
  else el.prepend(icon);
}

function injectUiIcons(root = document) {
  const add = (selector, iconName, options = {}) => {
    root.querySelectorAll(selector).forEach((el) => applyInlineIcon(el, iconName, options));
  };

  add('#profileBtn', 'user');
  add('#logoutBtn', 'logout');
  add('#moreMenuBtn', 'menu', { mode: 'replace', wrapClass: '' });
  add('#authSubmitBtn', 'mail');
  add('#googleBtn', 'google');
  add('#heroBookBtn', 'reserve');
  add('#heroCancelBtn', 'cancel');
  add('#heroDownloadBtn', 'download');
  add('#refreshFixturesBtn', 'refresh');
  add('#highlightsSearchBtn', 'search');
  add('#openMapPickerBtn', 'location');
  add('#mapSearchBtn', 'search');
  add('#confirmMapPickerBtn', 'location');
  add('#bkashContinueBtn', 'save');
  add('#downloadReceiptBtn', 'download');
  add('#closeProfileModal, #closeMapPickerModal, #closeBkashModal, #closeReceiptModal, #closeFixtureDetailModal', 'close');
  add('#contactWhatsappLinkPlayer', 'chat');
  add('#contactEmailLinkPlayer', 'mail');
  add('#contactFacebookLinkPlayer', 'info');
  add('.fixture-detail-btn', 'score');
  add('.fixture-lineup-btn', 'lineup');
  add('.toggle-match-btn', 'refresh');
  add('.edit-announcement-btn', 'edit');
  add('.delete-announcement-btn', 'cancel');

  root.querySelectorAll('.more-menu-item').forEach((btn) => {
    const target = String(btn.dataset.target || '');
    const iconName = {
      liveScoreSection: 'home',
      fixturesSection: 'score',
      highlightsSection: 'news',
      bookingsSection: 'ticket',
      profileSection: 'edit',
      aboutSection: 'info',
      quickContactSection: 'help'
    }[target] || 'info';

    const iconWrap = btn.querySelector('.menu-item-icon');
    if (iconWrap && iconWrap.dataset.iconApplied !== iconName) {
      iconWrap.innerHTML = getUiIconSvg(iconName);
      iconWrap.dataset.iconApplied = iconName;
    }
  });
}

function stopFixturesAutoRefresh() {
  if (state.fixturesRefreshTimer) {
    clearInterval(state.fixturesRefreshTimer);
    state.fixturesRefreshTimer = null;
  }
}

function startFixturesAutoRefresh() {
  stopFixturesAutoRefresh();
  state.fixturesRefreshTimer = setInterval(() => {
    const playerVisible = !els.playerView?.classList.contains("hidden");
    if (!playerVisible) return;
    loadDailyFixtures({ silent: true });
  }, 45000);
}

function stopLiveListeners() {
  state.featuredUnsub?.();
  state.bookingsUnsub?.();
  state.announcementsUnsub?.();
  state.adminMatchesUnsub?.();
  state.activityUnsub?.();
  state.myBookingsUnsub?.();

  state.featuredUnsub = null;
  state.bookingsUnsub = null;
  state.announcementsUnsub = null;
  state.adminMatchesUnsub = null;
  state.activityUnsub = null;
  state.myBookingsUnsub = null;

  stopFixturesAutoRefresh();
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

  document.addEventListener("pointerdown", (event) => {
    const target = event.target.closest("button, .chip-tab, .more-menu-item");
    if (!target) return;
    target.classList.add("is-pressing");
  });

  document.addEventListener("pointerup", () => {
    document.querySelectorAll(".is-pressing").forEach((el) => el.classList.remove("is-pressing"));
  });

  document.querySelectorAll(".panel-card, .hero-match-card, .fixture-group").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      if (window.matchMedia("(max-width: 820px)").matches) return;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 4;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -4;
      card.style.transform = `translateY(-2px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
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
  if (els.moreMenuPanel && els.moreMenuPanel.parentElement !== document.body) {
    document.body.appendChild(els.moreMenuPanel);
  }

  on(els.moreMenuBtn, "click", (e) => {
    e.preventDefault();
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
    if (e.key === "Escape") {
      closeMoreMenu();
      closeFixtureDetailModal();
    }
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
function formatMatchDate(dateStr, timeStr) {
  if (!dateStr && !timeStr) return "TBD";
  if (!dateStr) return String(timeStr || "TBD");
  if (!timeStr) return String(dateStr);

  const dt = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(dt.getTime())) return `${dateStr} ${timeStr}`;

  return dt.toLocaleString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char] || char));
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
  const inputMax = Number(els.heroSlotQty?.max || MAX_TOTAL_SLOTS_PER_USER);
  const clamped = Math.max(1, Math.min(Number.isFinite(inputMax) ? inputMax : MAX_TOTAL_SLOTS_PER_USER, normalized));
  if (els.heroSlotQty) els.heroSlotQty.value = String(clamped);
  return clamped;
}

function syncSlotStepper() {
  const qty = getRequestedSlots();
  const min = Math.max(Number(els.heroSlotQty?.min || 1), 1);
  const max = Math.max(Number(els.heroSlotQty?.max || 4), min);
  if (els.heroQtyMinus) els.heroQtyMinus.disabled = qty <= min;
  if (els.heroQtyPlus) els.heroQtyPlus.disabled = qty >= max;
}

function nudgeSlotQty(delta = 0) {
  if (!els.heroSlotQty) return;
  const qty = getRequestedSlots();
  const min = Math.max(Number(els.heroSlotQty.min || 1), 1);
  const max = Math.max(Number(els.heroSlotQty.max || 4), min);
  const next = Math.max(min, Math.min(max, qty + delta));
  els.heroSlotQty.value = String(next);
  refreshBookingPreview();
}
function getPaymentDetails(paymentMethod, totalFee, options = {}) {
  const method = String(paymentMethod || "On-spot");
  const total = Math.max(Number(totalFee || 0), 0);
  const normalizedMethod = method.toLowerCase();
  const normalizedStatus = String(options.paymentStatus || "").toLowerCase();
  const isOnSpot = normalizedMethod === "on-spot";
  const isBkash = normalizedMethod === "bkash";
  const isPaid = normalizedStatus === "paid" || options.confirmed === true;

  if (isOnSpot) {
    return {
      method,
      status: "Due",
      dueAmount: total,
      paidAmount: 0,
      methodLabel: "On-spot"
    };
  }

  if (isBkash) {
    return {
      method,
      status: isPaid ? "Paid" : "Pending",
      dueAmount: isPaid ? 0 : total,
      paidAmount: isPaid ? total : 0,
      methodLabel: "bKash"
    };
  }

  return {
    method,
    status: isPaid ? "Paid" : "Pending",
    dueAmount: isPaid ? 0 : total,
    paidAmount: isPaid ? total : 0,
    methodLabel: method || "Payment"
  };
}
function getStoredPaymentDetails(item = {}) {
  const total = Math.max(Number(item.totalFee || 0), 0);
  const base = getPaymentDetails(item.paymentMethod || "On-spot", total, {
    paymentStatus: item.paymentStatus || ""
  });
  const hasDue = Number.isFinite(Number(item.dueAmount));
  const hasPaid = Number.isFinite(Number(item.paidAmount));
  return {
    ...base,
    totalFee: total,
    dueAmount: hasDue ? Math.max(Number(item.dueAmount), 0) : base.dueAmount,
    paidAmount: hasPaid ? Math.max(Number(item.paidAmount), 0) : base.paidAmount
  };
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
  const existingInputs = Array.from(els.extraPlayersList.querySelectorAll(".extra-player-input"));
  const previousValues = existingInputs
    .map((input) => String(input.value || "").trim());

  els.extraNamesWrap.classList.toggle("hidden", requiredOthers <= 0);
  if (requiredOthers <= 0) {
    els.extraPlayersList.innerHTML = "";
    return;
  }

  if (els.bookerPrimaryName) {
    els.bookerPrimaryName.value = getBookerDisplayName();
  }

  if (existingInputs.length === requiredOthers) {
    return;
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

function renderPaymentSwitch() {
  if (!els.heroPaymentSwitch || !els.heroPaymentSelect) return;
  const current = String(els.heroPaymentSelect.value || "On-spot");
  els.heroPaymentSwitch.querySelectorAll(".payment-switch-btn").forEach((btn) => {
    const active = String(btn.dataset.payment || "") === current;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function initPaymentSwitch() {
  if (!els.heroPaymentSwitch || !els.heroPaymentSelect) return;
  els.heroPaymentSwitch.querySelectorAll(".payment-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = String(btn.dataset.payment || "On-spot");
      els.heroPaymentSelect.value = next;
      renderPaymentSwitch();
      refreshBookingPreview();
    });
  });
  renderPaymentSwitch();
}

function refreshBookingPreview() {
  toggleExtraNamesInput();
  if (!els.heroFeePreview) return;
  const qty = getRequestedSlots();
  const fee = Number(state.featuredMatch?.slotFee || 0);
  const total = fee * qty;
  const feeText = Number.isFinite(fee) ? `BDT ${total}` : "Set by admin";
  const paymentMethod = String(els.heroPaymentSelect?.value || "On-spot");
  renderPaymentSwitch();
  syncSlotStepper();
  const pay = getPaymentDetails(paymentMethod, total, {
    paymentStatus: paymentMethod.toLowerCase() === "bkash" ? "pending" : "due"
  });
  const othersRequired = Math.max(qty - 1, 0);
  const namesText = othersRequired > 0
    ? ` | Add ${othersRequired} additional player name${othersRequired > 1 ? "s" : ""}`
    : "";
  els.heroFeePreview.textContent = `${qty} slot${qty > 1 ? "s" : ""} selected | Total: ${feeText}${namesText} | Status: ${pay.status}`;
  if (els.heroPaymentNotice) {
    els.heroPaymentNotice.textContent = paymentMethod.toLowerCase() === "bkash" ? `bKash stays pending until you confirm payment with your last 3 digits. Payable now: BDT ${total}.` : `Pay now: BDT ${pay.paidAmount} | Due: BDT ${pay.dueAmount} | Amount may change if slots/payment method change.`;
  }
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
    const res = await fetch("https://www.thesportsdb.com/api/v1/json/123/all_leagues.php");
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
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupleague.php?id=${league.id}`);
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
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupteam.php?id=${id}`);
      const data = await res.json();
      const team = Array.isArray(data?.teams) ? data.teams[0] : null;
      if (team?.strBadge) TEAM_BADGE_CACHE.set(String(id), team.strBadge);
    } catch {}
  }));
}

async function fetchBangladeshTeamFixtures() {
  try {
    const teamsRes = await fetch("https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=Bangladesh");
    const teamsData = await teamsRes.json();
    const teams = (Array.isArray(teamsData?.teams) ? teamsData.teams : []).slice(0, 6);

    const all = await Promise.all(teams.map(async (team) => {
      if (!team?.idTeam) return [];
      try {
        const evRes = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${team.idTeam}`);
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
function mapSportsDbEventToFixture(ev = {}, category = "Global Football") {
  const homeScore = Number.isFinite(Number(ev?.intHomeScore)) ? Number(ev.intHomeScore) : null;
  const awayScore = Number.isFinite(Number(ev?.intAwayScore)) ? Number(ev.intAwayScore) : null;
  const stamp = Date.parse(`${ev?.dateEvent || "1970-01-01"}T${ev?.strTime || "00:00:00"}Z`);

  return {
    id: String(ev?.idEvent || `${ev?.idLeague || "league"}-${ev?.dateEvent || "date"}-${ev?.strHomeTeam || "home"}-${ev?.strAwayTeam || "away"}`),
    leagueId: String(ev?.idLeague || ""),
    category,
    league: ev?.strLeague || "Competition",
    season: ev?.strSeason || "",
    round: ev?.intRound || ev?.strRound || "",
    home: ev?.strHomeTeam || "Home",
    away: ev?.strAwayTeam || "Away",
    homeTeamId: String(ev?.idHomeTeam || ""),
    awayTeamId: String(ev?.idAwayTeam || ""),
    homeBadge: "",
    awayBadge: "",
    leagueLogo: LEAGUE_LOGO_CACHE.get(String(ev?.idLeague || "")) || "",
    venue: ev?.strVenue || "",
    venueCity: "",
    status: ev?.strStatus || ((homeScore !== null || awayScore !== null) ? "FT" : "Scheduled"),
    statusCode: "",
    date: ev?.dateEvent || "",
    time: ev?.strTime || "",
    kickoff: formatKickoff(ev?.dateEvent || "", ev?.strTime || ""),
    stamp: Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER,
    homeScore,
    awayScore
  };
}

async function fetchCompetitionFixturesForDate(competition, isoDate) {
  if (!competition?.id) return [];

  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${encodeURIComponent(isoDate)}&id=${encodeURIComponent(String(competition.id))}`);
    const data = await res.json();
    const events = Array.isArray(data?.events) ? data.events : [];
    return events.map((ev) => mapSportsDbEventToFixture(ev, competition.category || "Global Football"));
  } catch {
    return [];
  }
}

async function loadClientFixtureFallback(isoDate) {
  const competitions = await resolveCompetitions();
  await preloadLeagueLogos(competitions);

  const competitionFixtures = await Promise.all(
    competitions.slice(0, 12).map((competition) => fetchCompetitionFixturesForDate(competition, isoDate))
  );

  const bangladeshFixtures = await fetchBangladeshTeamFixtures();
  const seen = new Set();
  const deduped = [...competitionFixtures.flat(), ...bangladeshFixtures].filter((item) => {
    const key = `${item.id}::${item.home}::${item.away}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await preloadTeamBadges(deduped);
  return deduped.map((item) => ({
    ...item,
    leagueLogo: item.leagueLogo || LEAGUE_LOGO_CACHE.get(String(item.leagueId || "")) || "",
    homeBadge: item.homeBadge || TEAM_BADGE_CACHE.get(String(item.homeTeamId || "")) || "",
    awayBadge: item.awayBadge || TEAM_BADGE_CACHE.get(String(item.awayTeamId || "")) || ""
  }));
}

function buildLocalNewsFallback() {
  const topics = [
    "Premier League news",
    "Champions League news",
    "La Liga news",
    "Transfer news football",
    "Bangladesh football news",
    "Women's football news"
  ];

  return topics.map((topic) => ({
    title: topic,
    competition: "Football News",
    source: "Google News",
    publishedAt: "",
    thumbnail: `https://placehold.co/960x540/111318/f7f8fb?text=${encodeURIComponent(topic)}`,
    url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`
  }));
}

async function loadBrowserNewsFallback() {
  const feedLists = await Promise.all(FOOTBALL_NEWS_FEEDS.map(async (feed) => {
    try {
      const resp = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const payload = await resp.json();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      return items.slice(0, 10).map((item) => ({
        title: item.title || "Football story",
        competition: "Football News",
        source: feed.source,
        publishedAt: item.pubDate ? new Date(item.pubDate).toLocaleString() : "",
        thumbnail: item.thumbnail || item.enclosure?.link || "https://placehold.co/960x540/111318/f7f8fb?text=Football+News",
        url: item.link || "#"
      })).filter((item) => item.url && item.url !== "#");
    } catch {
      return [];
    }
  }));

  const seen = new Set();
  const merged = feedLists.flat().filter((item) => {
    const key = `${item.title}::${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged.length ? merged.slice(0, 18) : buildLocalNewsFallback();
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
  const dueAmount = Math.max(Number(data.dueAmount || 0), 0);
  const paidAmount = Math.max(Number(data.paidAmount || 0), 0);
  const rows = [
    `Venue: ${data.venue}`,
    `Date: ${data.when}`,
    `Slots: ${data.slots}`,
    `Per slot: BDT ${data.unitFee}`,
    `Total fee: BDT ${data.totalFee}`,
    `Payment: ${paymentText}`,
    `Paid: BDT ${paidAmount}`,
    `Due: BDT ${dueAmount}`
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
function normalizeFixtureStatus(item = {}) {
  const status = String(item.status || "").toLowerCase();
  const code = String(item.statusCode || "").toLowerCase();

  if (
    status.includes("live") || status.includes("in play") || status.includes("1st") || status.includes("2nd") || status.includes("ht") ||
    code.includes("live") || code.includes("inplay")
  ) return "live";

  if (
    status.includes("ft") || status.includes("finished") || status.includes("after") || status.includes("aet") || status.includes("pen") ||
    code.includes("finished") || code === "ft"
  ) return "results";

  const stamp = Number(item.stamp || Number.MAX_SAFE_INTEGER);
  const now = Date.now();
  if (stamp < now - (2 * 60 * 60 * 1000)) return "results";
  if (Math.abs(stamp - now) <= (2 * 60 * 60 * 1000)) return "live";
  return "upcoming";
}

function renderFixtureTabs() {
  const map = { live: els.fixtureTabLive, upcoming: els.fixtureTabUpcoming, results: els.fixtureTabResults, all: els.fixtureTabAll };
  Object.entries(map).forEach(([mode, btn]) => {
    if (!btn) return;
    btn.classList.toggle("active", state.fixtureMode === mode);
  });
}

function filterFixturesByMode(fixtures = []) {
  if (state.fixtureMode === "all") return fixtures;
  return fixtures.filter((item) => normalizeFixtureStatus(item) === state.fixtureMode);
}

function getFixtureLeagueKey(item = {}) {
  return `${item.leagueId || "x"}::${item.league || "Competition"}`;
}

function getFixtureLeagueOptions(fixtures = []) {
  const map = new Map();
  fixtures.forEach((item) => {
    const key = getFixtureLeagueKey(item);
    const current = map.get(key) || { key, count: 0, item };
    current.count += 1;
    current.item = current.item || item;
    map.set(key, current);
  });

  return Array.from(map.values())
    .sort((a, b) => {
      const priorityDiff = leaguePriority(a.item?.league || "") - leaguePriority(b.item?.league || "");
      if (priorityDiff !== 0) return priorityDiff;
      if (b.count !== a.count) return b.count - a.count;
      return String(a.item?.league || "").localeCompare(String(b.item?.league || ""));
    })
    .slice(0, 12);
}

function renderFixtureLeagueRail(fixtures = []) {
  if (!els.fixturesLeagueRail) return;

  const options = getFixtureLeagueOptions(fixtures);
  if (state.fixtureLeague !== "all" && !options.some((option) => option.key === state.fixtureLeague)) {
    state.fixtureLeague = "all";
  }

  const allButton = `
    <button class="league-rail-btn${state.fixtureLeague === "all" ? " active" : ""}" type="button" data-leaguekey="all">
      <span class="league-rail-icon">All</span>
      <span class="league-rail-copy">
        <strong>All leagues</strong>
        <small>${fixtures.length} matches</small>
      </span>
    </button>
  `;

  const items = options.map(({ key, count, item }) => {
    const meta = getCompetitionMeta(item?.league, item?.leagueId, item?.category);
    const active = state.fixtureLeague === key;
    return `
      <button class="league-rail-btn${active ? " active" : ""}" type="button" data-leaguekey="${escapeHtml(key)}">
        <img class="league-rail-logo" src="${escapeHtml(meta.logo)}" alt="${escapeHtml(meta.name)} logo" />
        <span class="league-rail-copy">
          <strong>${escapeHtml(meta.name)}</strong>
          <small>${count} fixture${count > 1 ? "s" : ""}</small>
        </span>
      </button>
    `;
  }).join("");

  els.fixturesLeagueRail.innerHTML = allButton + items;
  els.fixturesLeagueRail.querySelectorAll(".league-rail-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.fixtureLeague = String(btn.dataset.leaguekey || "all");
      renderFixtures(state.fixturesData || []);
    });
  });
}

function filterFixturesByLeague(fixtures = []) {
  if (state.fixtureLeague === "all") return fixtures;
  return fixtures.filter((item) => getFixtureLeagueKey(item) === state.fixtureLeague);
}

function setFixtureMode(mode) {
  const allowed = new Set(["live", "upcoming", "results", "all"]);
  state.fixtureMode = allowed.has(mode) ? mode : "all";
  renderFixtureTabs();
  renderFixtures(state.fixturesData || []);
}

function initFixtureTabs() {
  on(els.fixtureTabLive, "click", () => setFixtureMode("live"));
  on(els.fixtureTabUpcoming, "click", () => setFixtureMode("upcoming"));
  on(els.fixtureTabResults, "click", () => setFixtureMode("results"));
  on(els.fixtureTabAll, "click", () => setFixtureMode("all"));
}
function renderFixtures(fixtures = []) {
  if (!els.fixturesList) return;
  state.fixturesData = Array.isArray(fixtures) ? fixtures : [];
  renderFixtureTabs();
  renderFixtureLeagueRail(state.fixturesData);

  const scoped = filterFixturesByLeague(filterFixturesByMode(state.fixturesData));
  let displayFixtures = scoped;
  let fallbackNotice = "";

  if (!displayFixtures.length && state.fixtureMode === "live") {
    const scheduled = filterFixturesByLeague(state.fixturesData);
    if (scheduled.length) {
      displayFixtures = scheduled;
      fallbackNotice = "No live matches right now. Showing the latest schedule instead.";
    }
  }

  if (!displayFixtures.length) {
    const label = state.fixtureMode === "all" ? "matches" : state.fixtureMode;
    els.fixturesList.innerHTML = `<div class="empty-box">No ${label} matches are available from the live match service right now.</div>`;
    return;
  }

  const groupedByLeague = displayFixtures.reduce((acc, item) => {
    const key = getFixtureLeagueKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const orderedGroups = Object.values(groupedByLeague).sort((a, b) => {
    const leagueDiff = leaguePriority(a[0]?.league || "") - leaguePriority(b[0]?.league || "");
    if (leagueDiff !== 0) return leagueDiff;
    return String(a[0]?.league || "").localeCompare(String(b[0]?.league || ""));
  });

  const html = orderedGroups.map((list) => {
    const first = list[0] || {};
    if (first.leagueLogo && first.leagueId) LEAGUE_LOGO_CACHE.set(String(first.leagueId), first.leagueLogo);
    const meta = getCompetitionMeta(first.league, first.leagueId, first.category);

    const rows = list.map((item) => {
      const kind = normalizeFixtureStatus(item);
      const score = (Number.isFinite(Number(item.homeScore)) && Number.isFinite(Number(item.awayScore)))
        ? `${item.homeScore} - ${item.awayScore}`
        : (kind === "live" ? "LIVE" : "vs");
      const statusChipClass = kind === "upcoming" ? "upcoming" : kind;
      const statusChip = kind === "live" ? (item.status || "LIVE") : (kind === "results" ? (item.status || "FT") : "UPCOMING");
      const note = kind === "results" ? (item.status || "FT") : (item.kickoff || "TBD");
      const detail = [item.round || item.season, item.venue].filter(Boolean).join(" | ");
      const noteText = detail ? `${note} | ${detail}` : note;
      const homeBadge = escapeHtml(item.homeBadge || `https://placehold.co/56x56/111827/f8fafc?text=${encodeURIComponent((item.home || "H").slice(0, 2).toUpperCase())}`);
      const awayBadge = escapeHtml(item.awayBadge || `https://placehold.co/56x56/111827/f8fafc?text=${encodeURIComponent((item.away || "A").slice(0, 2).toUpperCase())}`);

      return `
        <article class="sofa-row editorial-row ${kind}">
          <div class="editorial-row-top">
            <span class="match-state-pill ${statusChipClass}">${escapeHtml(statusChip)}</span>
            <span class="editorial-row-note">${escapeHtml(noteText)}</span>
          </div>
          <div class="editorial-match-grid">
            <div class="sofa-team">
              <img src="${homeBadge}" alt="${escapeHtml(item.home)}" />
              <span>${escapeHtml(item.home)}</span>
            </div>
            <div class="sofa-score-wrap">
              <div class="sofa-score">${escapeHtml(String(score))}</div>
            </div>
            <div class="sofa-team align-right">
              <span>${escapeHtml(item.away)}</span>
              <img src="${awayBadge}" alt="${escapeHtml(item.away)}" />
            </div>
          </div>
          <div class="fixture-actions-row fixture-actions-inline">
            <button class="secondary-btn fixture-detail-btn" type="button" data-fixtureid="${escapeHtml(String(item.id || ""))}">Match center</button>
            <button class="secondary-btn fixture-lineup-btn" type="button" data-fixtureid="${escapeHtml(String(item.id || ""))}">Lineups</button>
          </div>
          <div class="fixture-lineup-box hidden" id="lineup-${escapeHtml(String(item.id || ""))}"></div>
        </article>
      `;
    }).join("");

    return `
      <section class="fixture-group sofa-league-group editorial-league-group">
        <div class="fixture-group-head editorial-group-head">
          <div class="editorial-group-title">
            <img class="fixture-league-logo" src="${escapeHtml(meta.logo)}" alt="${escapeHtml(meta.name)} logo" />
            <div>
              <h4>${escapeHtml(meta.name)}</h4>
              <div class="muted">${list.length} fixture${list.length > 1 ? "s" : ""}</div>
            </div>
          </div>
        </div>
        <div class="sofa-list editorial-sofa-list">${rows}</div>
      </section>
    `;
  }).join("");

  els.fixturesList.innerHTML = fallbackNotice ? `<div class="fixture-mode-note">${escapeHtml(fallbackNotice)}</div>${html}` : html;
  els.fixturesList.querySelectorAll(".fixture-detail-btn").forEach((btn) => {
    btn.addEventListener("click", () => openFixtureDetail(String(btn.dataset.fixtureid || ""), btn));
  });
  els.fixturesList.querySelectorAll(".fixture-lineup-btn").forEach((btn) => {
    btn.addEventListener("click", () => loadFixtureLineup(String(btn.dataset.fixtureid || ""), btn));
  });
  injectUiIcons(els.fixturesList);
  animateListEntrance(els.fixturesList, ".sofa-row");
}
async function loadFixtureLineup(fixtureId, triggerBtn) {
  if (!fixtureId) return;

  const box = document.getElementById(`lineup-${fixtureId}`);
  if (!box) return;

  if (!box.classList.contains("hidden")) {
    box.classList.add("hidden");
    if (triggerBtn) triggerBtn.textContent = "View lineups";
    return;
  }

  box.classList.remove("hidden");
  box.innerHTML = `<div class="muted">Loading lineups...</div>`;
  if (triggerBtn) triggerBtn.textContent = "Hide lineups";

  try {
    let lineup = LINEUP_CACHE.get(fixtureId);
    if (!lineup) {
      const resp = await fetch(`${SPORTMONKS_PROXY_URL}?type=lineups&fixtureId=${encodeURIComponent(fixtureId)}`);
      const data = await resp.json();
      lineup = data?.lineup || null;
      if (lineup) LINEUP_CACHE.set(fixtureId, lineup);
    }

    const renderSide = (teamName, rows) => {
      const list = Array.isArray(rows) ? rows : [];
      if (!list.length) return `<div class="muted">${escapeHtml(teamName || "Team")} lineup not available yet.</div>`;
      return `
        <strong>${escapeHtml(teamName || "Team")}</strong>
        <ol class="lineup-list">
          ${list.map((p) => `<li>${escapeHtml([p.number, p.name].filter(Boolean).join(". "))}</li>`).join("")}
        </ol>
      `;
    };

    box.innerHTML = `
      <div class="lineup-grid">
        <div>${renderSide(lineup?.homeTeam, lineup?.home)}</div>
        <div>${renderSide(lineup?.awayTeam, lineup?.away)}</div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    box.innerHTML = `<div class="muted">Could not load lineup now.</div>`;
  }
}
function formatEventMinute(row = {}) {
  const min = Number.isFinite(Number(row.minute)) ? Number(row.minute) : 0;
  const extra = Number.isFinite(Number(row.extraMinute)) ? Number(row.extraMinute) : null;
  if (extra && extra > 0) return `${min}+${extra}'`;
  return `${min}'`;
}

function renderFixtureDetail(detail = {}) {
  const home = escapeHtml(detail.home || "Home");
  const away = escapeHtml(detail.away || "Away");
  const homeBadge = escapeHtml(detail.homeBadge || `https://placehold.co/72x72/0f1d3a/e9f2ff?text=${encodeURIComponent((detail.home || "H").slice(0, 2).toUpperCase())}`);
  const awayBadge = escapeHtml(detail.awayBadge || `https://placehold.co/72x72/0f1d3a/e9f2ff?text=${encodeURIComponent((detail.away || "A").slice(0, 2).toUpperCase())}`);
  const score = (Number.isFinite(Number(detail.homeScore)) && Number.isFinite(Number(detail.awayScore)))
    ? `${detail.homeScore} - ${detail.awayScore}`
    : "vs";

  const statRows = Array.isArray(detail.statistics) ? detail.statistics.slice(0, 14) : [];
  const statHtml = statRows.length
    ? `<div class="fixture-stat-grid">${statRows.map((s) => `<div class="fixture-stat-row"><span>${escapeHtml(String(s.home ?? "-"))}</span><strong>${escapeHtml(s.name || "Stat")}</strong><span>${escapeHtml(String(s.away ?? "-"))}</span></div>`).join("")}</div>`
    : `<div class="empty-box">No stats available yet.</div>`;

  const events = Array.isArray(detail.events) ? detail.events.slice(-16).reverse() : [];
  const eventHtml = events.length
    ? `<div class="fixture-event-list">${events.map((ev) => `
      <article class="fixture-event-item">
        <div class="fixture-event-minute">${escapeHtml(formatEventMinute(ev))}</div>
        <div>
          <strong>${escapeHtml(ev.type || "Event")}</strong>
          <div class="muted">${escapeHtml([ev.player, ev.relatedPlayer && `for ${ev.relatedPlayer}`, ev.addition || ev.info || ev.result].filter(Boolean).join(" | "))}</div>
        </div>
      </article>
    `).join("")}</div>`
    : `<div class="empty-box">No timeline events yet.</div>`;

  const lineupSide = (teamName, rows) => {
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) return `<div class="empty-box">${escapeHtml(teamName || "Team")} lineup not published.</div>`;
    return `<div class="fixture-lineup-side"><h5>${escapeHtml(teamName || "Team")}</h5><ol>${list.slice(0, 15).map((p) => `<li>${escapeHtml([p.number, p.name].filter(Boolean).join('. '))}</li>`).join("")}</ol></div>`;
  };

  const weatherText = detail.weather
    ? [detail.weather.description, detail.weather.temperature && `Temp ${detail.weather.temperature}`, detail.weather.humidity && `Humidity ${detail.weather.humidity}`, detail.weather.wind && `Wind ${detail.weather.wind}`].filter(Boolean).join(" | ")
    : "Weather not available";

  const sidelined = Array.isArray(detail.sidelined) ? detail.sidelined.slice(0, 10) : [];

  return `
    <section class="fixture-center-head">
      <div class="fixture-center-team"><img src="${homeBadge}" alt="${home}" /><span>${home}</span></div>
      <div class="fixture-center-score">${escapeHtml(score)}</div>
      <div class="fixture-center-team right"><span>${away}</span><img src="${awayBadge}" alt="${away}" /></div>
    </section>

    <section class="fixture-center-panels">
      <article class="fixture-center-panel">
        <h4>Match Facts</h4>
        <div class="muted">${escapeHtml(detail.status || "Scheduled")} | ${escapeHtml(detail.resultInfo || detail.kickoff || "")}</div>
        <div class="muted">Venue: ${escapeHtml([detail.venue, detail.venueCity].filter(Boolean).join(', ') || 'TBD')}</div>
        <div class="muted">Weather: ${escapeHtml(weatherText)}</div>
      </article>
      <article class="fixture-center-panel">
        <h4>Statistics</h4>
        ${statHtml}
      </article>
      <article class="fixture-center-panel full">
        <h4>Timeline</h4>
        ${eventHtml}
      </article>
      <article class="fixture-center-panel full">
        <h4>Lineups</h4>
        <div class="fixture-lineup-grid">
          ${lineupSide(detail?.lineups?.homeTeam || detail.home, detail?.lineups?.home)}
          ${lineupSide(detail?.lineups?.awayTeam || detail.away, detail?.lineups?.away)}
        </div>
      </article>
      <article class="fixture-center-panel full">
        <h4>Unavailable / Sidelined</h4>
        ${sidelined.length ? `<ul class="fixture-sidelined-list">${sidelined.map((s) => `<li>${escapeHtml([s.player, s.reason, s.startDate && `from ${s.startDate}`, s.endDate && `to ${s.endDate}`].filter(Boolean).join(' | '))}</li>`).join("")}</ul>` : '<div class="muted">No sidelined data.</div>'}
      </article>
    </section>
  `;
}

function openFixtureDetailModal(title, meta, bodyHtml) {
  if (!els.fixtureDetailModal || !els.fixtureDetailBody) return;
  if (els.fixtureDetailTitle) els.fixtureDetailTitle.textContent = title || "Match Center";
  if (els.fixtureDetailMeta) els.fixtureDetailMeta.textContent = meta || "";
  els.fixtureDetailBody.innerHTML = bodyHtml || "<div class=\"empty-box\">No data available.</div>";
  els.fixtureDetailModal.classList.remove("hidden");
}

function closeFixtureDetailModal() {
  els.fixtureDetailModal?.classList.add("hidden");
}

async function openFixtureDetail(fixtureId, triggerBtn = null) {
  if (!fixtureId) return;
  const fixture = (state.fixturesData || []).find((f) => String(f.id) === String(fixtureId));
  const title = fixture ? `${fixture.home} vs ${fixture.away}` : "Match Center";
  const meta = fixture ? `${fixture.league || "Competition"} | ${fixture.kickoff || "TBD"}` : "";

  setButtonLoading(triggerBtn, true, "Loading...");
  openFixtureDetailModal(title, meta, '<div class="empty-box">Loading match center...</div>');

  try {
    let detail = FIXTURE_DETAIL_CACHE.get(String(fixtureId));
    if (!detail) {
      const resp = await fetch(`${SPORTMONKS_PROXY_URL}?type=detail&fixtureId=${encodeURIComponent(String(fixtureId))}`);
      const payload = await resp.json();
      if (!resp.ok || !payload?.ok || !payload?.detail) throw new Error(payload?.error || "Could not load match center.");
      detail = payload.detail;
      FIXTURE_DETAIL_CACHE.set(String(fixtureId), detail);
    }

    openFixtureDetailModal(title, meta, renderFixtureDetail(detail));
  } catch (err) {
    console.error(err);
    openFixtureDetailModal(title, meta, `<div class="empty-box">${escapeHtml(err?.message || "Could not load match details right now.")}</div>`);
  } finally {
    setButtonLoading(triggerBtn, false);
  }
}
function renderHighlights(items = [], query = "") {
  if (!els.highlightsList) return;

  if (!items.length) {
    const q = query ? ` for "${escapeHtml(query)}"` : "";
    if (els.highlightsLead) {
      els.highlightsLead.innerHTML = `<div class="empty-box">No football stories found${q}.</div>`;
    }
    if (els.highlightsTrending) {
      els.highlightsTrending.innerHTML = "";
    }
    els.highlightsList.innerHTML = `<div class="empty-box">No football stories found${q}.</div>`;
    if (els.highlightsMeta) els.highlightsMeta.textContent = "";
    return;
  }

  if (els.highlightsMeta) {
    const q = query ? ` for "${query}"` : "";
    els.highlightsMeta.textContent = `${items.length} football stories loaded${q}.`;
  }

  const lead = items[0];
  const trending = items.slice(1, 5);
  const grid = items.slice(5, 17);

  if (els.highlightsLead) {
    els.highlightsLead.innerHTML = `
      <article class="news-lead-article">
        <a href="${escapeHtml(lead.url)}" target="_blank" rel="noopener noreferrer" class="news-lead-media">
          <img src="${escapeHtml(lead.thumbnail)}" alt="${escapeHtml(lead.title)}" class="news-lead-image" />
        </a>
        <div class="news-lead-copy">
          <div class="news-kicker">${escapeHtml(lead.competition || "Football")}</div>
          <a href="${escapeHtml(lead.url)}" target="_blank" rel="noopener noreferrer" class="news-lead-title">${escapeHtml(lead.title)}</a>
          <div class="muted news-lead-meta">${escapeHtml([lead.source, lead.publishedAt].filter(Boolean).join(" | "))}</div>
        </div>
      </article>
    `;
  }

  if (els.highlightsTrending) {
    els.highlightsTrending.innerHTML = trending.map((item, index) => `
      <article class="trending-story">
        <span class="trending-rank">${index + 1}</span>
        <div class="trending-copy">
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="trending-title">${escapeHtml(item.title)}</a>
          <div class="muted">${escapeHtml([item.source, item.publishedAt].filter(Boolean).join(" | "))}</div>
        </div>
        <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" class="trending-thumb" />
      </article>
    `).join("");
  }

  const cards = (grid.length ? grid : items.slice(1, 9)).map((item) => `
    <article class="video-card news-card">
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="news-card-media">
        <img class="video-thumb news-card-thumb" src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" />
      </a>
      <div class="video-meta news-card-meta">
        <div class="news-kicker">${escapeHtml(item.competition || "Football")}</div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="news-card-title">${escapeHtml(item.title)}</a>
        <div class="muted">${escapeHtml([item.source, item.publishedAt].filter(Boolean).join(" | "))}</div>
      </div>
    </article>
  `).join("");

  els.highlightsList.innerHTML = cards;
  animateListEntrance(els.highlightsList, ".video-card");
}

function buildHighlightFallbacks(queryText = "") {
  const rawQuery = String(queryText || "").trim();
  const topics = rawQuery
    ? [rawQuery]
    : [
      "premier league highlights",
      "uefa champions league highlights",
      "la liga highlights",
      "serie a highlights",
      "bundesliga highlights",
      "copa america highlights"
    ];

  return topics.map((topic) => ({
    title: `Search highlights: ${topic}`,
    competition: "YouTube search",
    source: "YouTube",
    publishedAt: "",
    thumbnail: `https://placehold.co/960x540/06161b/e8fff3?text=${encodeURIComponent(topic)}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`
  }));
}

async function loadDailyFixtures(options = {}) {
  if (!els.fixturesList) return;

  const { silent = false } = options || {};
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  if (els.fixturesDate) {
    const lastSuccess = state.fixturesLastLoadedAt ? ` | Last success: ${new Date(state.fixturesLastLoadedAt).toLocaleTimeString()}` : "";
    els.fixturesDate.textContent = `Updated: ${now.toLocaleString()}${lastSuccess} | Auto refresh: 45s`;
  }
  if (!silent) {
    els.fixturesList.innerHTML = `<div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>`;
  }

  setButtonLoading(els.refreshFixturesBtn, true, "Refreshing...");
  try {
    let mapped = [];
    let sourceLabel = "Service";

    try {
      const resp = await fetch(`${SPORTMONKS_PROXY_URL}?type=fixtures&date=${encodeURIComponent(isoDate)}`);
      const payload = await resp.json();
      if (!resp.ok || !payload?.ok) {
        throw new Error(payload?.error || "Live match service error.");
      }

      mapped = (Array.isArray(payload.fixtures) ? payload.fixtures : []).map((item) => ({
        ...item,
        category: item.category || "Global Football",
        kickoff: formatKickoff(item.date, item.time)
      }));
    } catch (serviceErr) {
      mapped = await loadClientFixtureFallback(isoDate);
      if (!mapped.length) throw serviceErr;
      sourceLabel = "Browser fallback";
    }

    mapped.forEach((item) => {
      if (item.leagueId && item.leagueLogo) LEAGUE_LOGO_CACHE.set(String(item.leagueId), item.leagueLogo);
      if (item.homeTeamId && item.homeBadge) TEAM_BADGE_CACHE.set(String(item.homeTeamId), item.homeBadge);
      if (item.awayTeamId && item.awayBadge) TEAM_BADGE_CACHE.set(String(item.awayTeamId), item.awayBadge);
    });

    state.fixturesLastLoadedAt = Date.now();
    if (els.fixturesDate) {
      els.fixturesDate.textContent = `Updated: ${now.toLocaleString()} | Source: ${sourceLabel} | Auto refresh: 45s`;
    }
    renderFixtures(mapped);
  } catch (err) {
    console.error(err);
    const message = String(err?.message || "").includes("not configured")
      ? "Live match service is not configured yet."
      : "Could not load the live match service right now.";
    els.fixturesList.innerHTML = `<div class="empty-box">${escapeHtml(message)}</div>`;
  } finally {
    setButtonLoading(els.refreshFixturesBtn, false);
  }
}
async function loadFootballNews() {
  try {
    const resp = await fetch(FOOTBALL_NEWS_URL);
    const payload = await resp.json();
    if (!resp.ok || payload?.ok === false) throw new Error(payload?.error || "Football news failed");
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const mapped = items.map((item) => ({
      title: item.title || "Football story",
      competition: item.competition || "Football News",
      source: item.source || "Football News",
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "",
      thumbnail: item.thumbnail || "https://placehold.co/960x540/111318/f7f8fb?text=Football+News",
      url: item.url || "#"
    })).filter((item) => item.url && item.url !== "#");

    if (mapped.length) return mapped;
    throw new Error("No football news returned");
  } catch {
    return await loadBrowserNewsFallback();
  }
}
async function loadSportsDbHighlights() {
  const leagues = ["4328", "4335", "4331", "4332", "4334"]; // EPL, La Liga, Bundesliga, Serie A, Ligue 1
  const out = [];

  await Promise.all(leagues.map(async (leagueId) => {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=${leagueId}`);
      const data = await res.json();
      const events = Array.isArray(data?.events) ? data.events : [];
      events.slice(0, 12).forEach((ev) => {
        const video = String(ev?.strVideo || "").trim();
        if (!video) return;
        out.push({
          title: ev?.strEvent || `${ev?.strHomeTeam || "Home"} vs ${ev?.strAwayTeam || "Away"}`,
          competition: ev?.strLeague || "Football",
          source: "TheSportsDB",
          publishedAt: ev?.dateEvent || "",
          thumbnail: ev?.strThumb || ev?.strBanner || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
          url: video
        });
      });
    } catch {}
  }));

  return out;
}

async function loadHighlights(queryText = "") {
  if (!els.highlightsList) return;

  const query = String(queryText || "").trim().toLowerCase();
  const matchesQuery = (item) => {
    if (!query) return true;
    const hay = `${item.title} ${item.competition} ${item.source} ${item.kind || ""}`.toLowerCase();
    return hay.includes(query);
  };
  const dedupeItems = (items = []) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = `${item.title}::${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const mergeStories = (newsItems = [], highlightItems = [], maxItems = 36) => {
    const merged = [];
    const max = Math.max(newsItems.length, highlightItems.length);
    for (let i = 0; i < max && merged.length < maxItems; i += 1) {
      if (newsItems[i]) merged.push(newsItems[i]);
      if (highlightItems[i] && merged.length < maxItems) merged.push(highlightItems[i]);
    }
    return merged;
  };

  setButtonLoading(els.highlightsSearchBtn, true, "Searching...");
  if (els.highlightsLead) {
    els.highlightsLead.innerHTML = '<div class="empty-box">Loading football stories...</div>';
  }
  if (els.highlightsTrending) {
    els.highlightsTrending.innerHTML = '';
  }
  els.highlightsList.innerHTML = `<div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>`;

  try {
    const [newsItems, scorebatItems, sportsDbItems] = await Promise.all([
      loadFootballNews(),
      (async () => {
        try {
          const response = await fetch("https://www.scorebat.com/video-api/v3/");
          const payload = await response.json();
          const raw = Array.isArray(payload?.response) ? payload.response : [];

          return raw.map((item) => {
            const firstVideo = Array.isArray(item.videos) ? item.videos[0] : null;
            const url = extractEmbedSrc(firstVideo?.embed || "") || item.matchviewUrl || item.url || "#";
            return {
              title: item.title || "Match highlight",
              competition: item.competition || "Football Highlights",
              source: "ScoreBat",
              publishedAt: item.date ? new Date(item.date).toLocaleString() : "",
              thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
              url,
              kind: "highlight"
            };
          }).filter((item) => item.url && item.url !== "#");
        } catch {
          return [];
        }
      })(),
      loadSportsDbHighlights()
    ]);

    const normalizedNews = newsItems.map((item) => ({ ...item, kind: "news" }));
    const normalizedHighlights = [...scorebatItems, ...sportsDbItems].map((item) => ({
      ...item,
      competition: item.competition || "Football Highlights",
      kind: item.kind || "highlight"
    }));

    const filteredNews = dedupeItems(normalizedNews.filter(matchesQuery));
    const filteredHighlights = dedupeItems(normalizedHighlights.filter(matchesQuery));
    const shortlist = mergeStories(filteredNews, filteredHighlights, query ? 48 : 36);

    state.highlightsData = shortlist;

    if (!shortlist.length) {
      renderHighlights(buildHighlightFallbacks(queryText), queryText);
      if (els.highlightsMeta) els.highlightsMeta.textContent = "Showing fallback football stories.";
      return;
    }

    renderHighlights(shortlist, queryText);
    if (els.highlightsMeta) {
      const q = query ? ` for "${queryText.trim()}"` : "";
      els.highlightsMeta.textContent = `${filteredNews.length} news stories and ${filteredHighlights.length} highlights loaded${q}.`;
    }
  } catch (err) {
    console.error(err);
    renderHighlights(buildHighlightFallbacks(queryText), queryText);
    if (els.highlightsMeta) els.highlightsMeta.textContent = "Football story service unavailable. Showing fallback stories.";
  } finally {
    setButtonLoading(els.highlightsSearchBtn, false);
  }
}
function runHighlightsSearch() {
  const query = String(els.highlightsSearchInput?.value || "").trim();
  loadHighlights(query);
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
  const qty = getRequestedSlots();
  const fee = Number(state.featuredMatch?.slotFee || 0);
  const total = Math.max(Number(fee * qty), 0);
  if (els.bkashPayableText) els.bkashPayableText.textContent = `Payable now: BDT ${total} (amount may change if slots update)`;
  if (els.bkashQrImage) els.bkashQrImage.src = BKASH_QR_IMAGE_URL;
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
  if (action === "login") return "Login";
  return action || "Updated";
}

function formatTrackerMatchMeta(entry = {}) {
  const when = entry.matchDate ? formatMatchDate(entry.matchDate, entry.matchTime || "") : (entry.whenText || "");
  return [entry.matchLabel || "Match", when, entry.matchLocation || "Venue"].filter(Boolean).join(" | ");
}

function getAdminTrackerFilterOptions(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item.matchId || "unknown");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterAdminTrackerEntries(items = []) {
  if (state.adminTrackerFilter === "all") return items;
  return items.filter((item) => String(item.matchId || "") === String(state.adminTrackerFilter || ""));
}

function renderAdminTrackerFilters(items = []) {
  if (!els.adminTrackerFilters) return;

  const options = getAdminTrackerFilterOptions(items);
  if (state.adminTrackerFilter !== "all" && !options.some((item) => String(item.matchId || "") === String(state.adminTrackerFilter))) {
    state.adminTrackerFilter = "all";
  }

  const allCount = items.length;
  const html = [
    `<button class="tracker-filter-btn${state.adminTrackerFilter === "all" ? " active" : ""}" type="button" data-matchfilter="all">All bookings <span>${allCount}</span></button>`,
    ...options.map((item) => {
      const key = String(item.matchId || "");
      const count = items.filter((row) => String(row.matchId || "") === key).length;
      const label = escapeHtml(formatTrackerMatchMeta(item));
      const active = state.adminTrackerFilter === key ? " active" : "";
      return `<button class="tracker-filter-btn${active}" type="button" data-matchfilter="${escapeHtml(key)}">${label} <span>${count}</span></button>`;
    })
  ].join("");

  els.adminTrackerFilters.innerHTML = html;
  els.adminTrackerFilters.querySelectorAll('.tracker-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.adminTrackerFilter = String(btn.dataset.matchfilter || 'all');
      renderAdminTrackerDashboard(state.adminTrackerEntries || []);
    });
  });
}

function renderAdminActivitySummary(items = []) {
  if (!els.adminActivitySummary) return;

  const filtered = filterAdminTrackerEntries(items);
  const totals = filtered.reduce((acc, item) => {
    const pay = getStoredPaymentDetails(item);
    acc.players += 1;
    acc.slots += Math.max(Number(item.slotsAdded || item.slots || 0), 0);
    if ((item.paymentMethod || "").toLowerCase() === "bkash") acc.bkash += 1;
    else acc.onSpot += 1;
    acc.paid += pay.paidAmount;
    acc.due += pay.dueAmount;
    return acc;
  }, { players: 0, slots: 0, bkash: 0, onSpot: 0, paid: 0, due: 0 });

  els.adminActivitySummary.innerHTML = `
    <article class="analytics-card"><div class="panel-label">Players booked</div><strong>${totals.players}</strong></article>
    <article class="analytics-card"><div class="panel-label">Slots reserved</div><strong>${totals.slots}</strong></article>
    <article class="analytics-card"><div class="panel-label">bKash chosen</div><strong>${totals.bkash}</strong></article>
    <article class="analytics-card"><div class="panel-label">On-spot chosen</div><strong>${totals.onSpot}</strong></article>
    <article class="analytics-card"><div class="panel-label">Paid total</div><strong>BDT ${totals.paid}</strong></article>
    <article class="analytics-card"><div class="panel-label">Due total</div><strong>BDT ${totals.due}</strong></article>
  `;
}

function renderAdminUserStats(items = []) {
  if (!els.adminActivityUsers) return;

  const filtered = filterAdminTrackerEntries(items);
  if (!filtered.length) {
    els.adminActivityUsers.innerHTML = `<div class="empty-box">No player bookings for this match yet.</div>`;
    return;
  }

  const rows = [...filtered].sort((a, b) => {
    const dueDiff = Math.max(Number(b.dueAmount || 0), 0) - Math.max(Number(a.dueAmount || 0), 0);
    if (dueDiff !== 0) return dueDiff;
    return (b.createdAt?.toDate?.()?.getTime?.() || 0) - (a.createdAt?.toDate?.()?.getTime?.() || 0);
  });

  els.adminActivityUsers.innerHTML = `
    <div class="stats-table-wrap">
      <table class="stats-table">
        <thead>
          <tr><th>Player</th><th>Match</th><th>Booked players</th><th>Slots</th><th>Payment</th><th>Status</th><th>Paid</th><th>Due</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${rows.map((item) => {
            const pay = getStoredPaymentDetails(item);
            const names = [item.targetName || item.actorName || "Player", ...(Array.isArray(item.extraPlayerNames) ? item.extraPlayerNames : [])].filter(Boolean);
            const actionLabel = pay.status.toLowerCase() === 'paid' ? 'Mark due' : 'Mark paid';
            const nextStatus = pay.status.toLowerCase() === 'paid' ? 'due' : 'paid';
            return `
              <tr>
                <td><strong>${escapeHtml(item.targetName || item.actorName || "Player")}</strong><div class="muted">${escapeHtml(item.targetEmail || item.actorEmail || "")}</div></td>
                <td>${escapeHtml(formatTrackerMatchMeta(item))}</td>
                <td>${escapeHtml(names.join(', ') || 'Player')}</td>
                <td>${Math.max(Number(item.slotsAdded || item.slots || 0), 0)}</td>
                <td>${escapeHtml(pay.methodLabel)}</td>
                <td>${escapeHtml(pay.status)}</td>
                <td>${pay.paidAmount}</td>
                <td>${pay.dueAmount}</td>
                <td><button class="secondary-btn compact-btn booking-status-btn" type="button" data-matchid="${escapeHtml(item.matchId || '')}" data-userid="${escapeHtml(item.targetUserId || '')}" data-status="${escapeHtml(nextStatus)}">${actionLabel}</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminActivityList(items = [], options = {}) {
  if (!els.adminActivityList) return;

  const filtered = filterAdminTrackerEntries(items);
  const dueRows = filtered.filter((item) => Math.max(Number(item.dueAmount || 0), 0) > 0);
  const { message = "" } = options || {};
  const note = message ? `<div class="empty-box">${escapeHtml(message)}</div>` : "";

  if (!dueRows.length) {
    els.adminActivityList.innerHTML = note || `<div class="empty-box">No due payments right now.</div>`;
    return;
  }

  els.adminActivityList.innerHTML = note + dueRows.map((item) => {
    const pay = getStoredPaymentDetails(item);
    const name = escapeHtml(item.targetName || item.actorName || "Player");
    const email = escapeHtml(item.targetEmail || item.actorEmail || "");
    const matchText = escapeHtml(formatTrackerMatchMeta(item));
    const slots = Math.max(Number(item.slotsAdded || item.slots || 0), 0);
    return `
      <div class="announcement-card activity-card">
        <div class="activity-head">
          <strong>${name}</strong>
          <button class="secondary-btn compact-btn booking-status-btn" type="button" data-matchid="${escapeHtml(item.matchId || '')}" data-userid="${escapeHtml(item.targetUserId || '')}" data-status="paid">Mark paid</button>
        </div>
        <div class="muted">${email}</div>
        <div class="muted">${matchText}</div>
        <div class="muted">Slots: ${slots}</div>
        <div class="muted">Payment: ${escapeHtml(pay.methodLabel)} | ${escapeHtml(pay.status)} | Due BDT ${pay.dueAmount}</div>
      </div>
    `;
  }).join('');
}

function bindAdminTrackerActions() {
  document.querySelectorAll('.booking-status-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await updateBookingPaymentState(String(btn.dataset.matchid || ''), String(btn.dataset.userid || ''), String(btn.dataset.status || 'paid'));
    });
  });
}

function mapBookingToTrackerEntry(matchId, matchData = {}, booking = {}) {
  return {
    action: 'booked',
    matchId,
    matchLabel: booking.matchLabel || matchData.label || 'Match',
    matchLocation: booking.matchLocation || booking.venue || booking.location || matchData.location || `Match ${matchId || 'session'}`,
    matchDate: matchData.date || '',
    matchTime: matchData.time || '',
    actorUserId: booking.userId || '',
    actorName: booking.name || booking.email?.split('@')[0] || 'User',
    actorEmail: booking.email || '',
    targetUserId: booking.userId || '',
    targetName: booking.name || '',
    targetEmail: booking.email || '',
    paymentMethod: booking.paymentMethod || 'On-spot',
    paymentStatus: booking.paymentStatus || '',
    dueAmount: Number(booking.dueAmount || 0),
    paidAmount: Number(booking.paidAmount || 0),
    slotFee: Number(booking.slotFee || matchData.slotFee || 0),
    slotsAdded: Math.max(Number(booking.slots || 0), 0),
    totalSlotsForUser: Math.max(Number(booking.slots || 0), 0),
    totalFee: Number(booking.totalFee || 0),
    extraPlayerNames: Array.isArray(booking.extraPlayerNames) ? booking.extraPlayerNames : [],
    createdAt: booking.updatedAt || booking.createdAt || null,
    whenText: booking.updatedAt?.toDate?.() ? booking.updatedAt.toDate().toLocaleString() : 'Current booking'
  };
}

async function loadAdminBookingTracker() {
  const matchesSnap = await getDocs(collection(db, 'matches'));
  const matchRows = matchesSnap.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() || {} }));
  const nested = await Promise.all(matchRows.map(async (row) => {
    const bookingsSnap = await getDocs(collection(db, 'matches', row.id, 'bookings'));
    return bookingsSnap.docs.map((docSnap) => mapBookingToTrackerEntry(row.id, row.data, docSnap.data() || {}));
  }));

  return nested.flat().sort((a, b) => (b.createdAt?.toDate?.()?.getTime?.() || 0) - (a.createdAt?.toDate?.()?.getTime?.() || 0));
}

function renderAdminTrackerDashboard(items = []) {
  state.adminTrackerEntries = Array.isArray(items) ? items : [];
  renderAdminTrackerFilters(state.adminTrackerEntries);
  renderAdminActivitySummary(state.adminTrackerEntries);
  renderAdminUserStats(state.adminTrackerEntries);
  renderAdminActivityList(state.adminTrackerEntries);
  bindAdminTrackerActions();
}

async function updateBookingPaymentState(matchId, userId, nextStatus = 'paid') {
  if (!matchId || !userId) return;
  try {
    const entry = (state.adminTrackerEntries || []).find((item) => String(item.matchId) === String(matchId) && String(item.targetUserId) === String(userId));
    if (!entry) {
      showToast('Booking not found.');
      return;
    }
    const totalFee = Math.max(Number(entry.totalFee || 0), 0);
    const normalized = String(nextStatus || 'paid').toLowerCase() === 'paid' ? 'paid' : 'due';
    await updateDoc(doc(db, 'matches', matchId, 'bookings', userId), {
      paymentStatus: normalized,
      paidAmount: normalized === 'paid' ? totalFee : 0,
      dueAmount: normalized === 'paid' ? 0 : totalFee,
      updatedAt: serverTimestamp()
    });
    showToast(normalized === 'paid' ? 'Payment marked as paid.' : 'Payment marked as due.');
    const entries = await loadAdminBookingTracker();
    renderAdminTrackerDashboard(entries);
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Could not update payment status.');
  }
}

function listenAdminActivity() {
  state.activityUnsub?.();

  const run = async () => {
    try {
      const entries = await loadAdminBookingTracker();
      renderAdminTrackerDashboard(entries);
    } catch (err) {
      console.error(err);
      if (els.adminActivitySummary) els.adminActivitySummary.innerHTML = `<div class="empty-box">Could not load booking summary.</div>`;
      if (els.adminActivityUsers) els.adminActivityUsers.innerHTML = `<div class="empty-box">Could not load player payment list.</div>`;
      if (els.adminActivityList) els.adminActivityList.innerHTML = `<div class="empty-box">Could not load due payment list.</div>`;
    }
  };

  run();
  const timer = setInterval(run, 10000);
  state.activityUnsub = () => clearInterval(timer);
}
function ensureLoginActivityLogged(user) {
  if (!user) return;
  try {
    const key = `matchday-login-logged-${user.uid}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    logActivity("login", { id: "", location: "Auth", label: "Login" }, {
      targetUserId: user.uid,
      targetName: state.userProfile?.name || user.displayName || "",
      targetEmail: user.email || ""
    });
  } catch {
    // ignore sessionStorage failures
  }
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
    state.featuredMatch = null;
    closeMoreMenu();
    closeProfileModal();
    closeBkashModal();
    closeReceiptModal();
    closeFixtureDetailModal();
    closeMapPicker();
    els.logoutBtn.classList.add("hidden");
    els.profileBtn.classList.add("hidden");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
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
  ensureLoginActivityLogged(user);

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
    listenMyBookings(user.uid);
    startFixturesAutoRefresh();
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
    closeMoreMenu();
    stopLiveListeners();
    await signOut(auth);
    setView(els.authView);
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

  const expandedPlayers = [];
  bookings.forEach((b) => {
    const ownerName = String(b.name || b.email || "Player").trim();
    const slots = Math.max(Number(b.slots || 1), 1);
    const extras = Array.isArray(b.extraPlayerNames) ? b.extraPlayerNames.map((n) => String(n || "").trim()).filter(Boolean) : [];
    const names = [ownerName, ...extras].slice(0, slots);

    while (names.length < slots) {
      names.push(`Player ${names.length + 1}`);
    }

    names.forEach((n, idx) => {
      expandedPlayers.push({
        displayName: n,
        ownerName,
        userId: String(b.userId || ""),
        isPrimary: idx === 0,
        slots,
        paymentMethod: String(b.paymentMethod || "N/A"),
        totalFee: Number(b.totalFee || (Number(state.featuredMatch?.slotFee || b.slotFee || 0) * slots))
      });
    });
  });

  els.playersList.innerHTML = expandedPlayers.map((p, index) => {
    const name = escapeHtml(p.displayName || "Player");
    const owner = escapeHtml(p.ownerName || "Player");
    const payment = escapeHtml(p.paymentMethod || "N/A");
    const fee = Number.isFinite(Number(p.totalFee)) ? Number(p.totalFee) : 0;
    const detailLine = p.isPrimary
      ? (isAdmin
        ? `<div>${payment} | ${p.slots} slot(s) | BDT ${fee}</div>`
        : `<div>${p.slots} slot(s)</div>`)
      : `<div>Booked by ${owner}</div>`;

    return `
      <div class="player-chip">
        <div class="player-chip-main">
          <span class="player-order">${index + 1}</span>
          <div>
            <strong>${name}</strong>
            ${detailLine}
          </div>
        </div>
        ${isAdmin && p.isPrimary ? `<button class="kick-btn" data-userid="${p.userId}">Kick</button>` : ""}
      </div>
    `;
  }).join("");

  animateListEntrance(els.playersList, ".player-chip");

  if (isAdmin) {
    els.playersList.querySelectorAll(".kick-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await kickPlayerDirect(state.featuredMatch.id, btn.dataset.userid);
      });
    });
  }
}

function renderMyBookings(items = []) {
  if (!els.myBookingsList || !els.myBookingsMeta) return;

  els.myBookingsMeta.textContent = items.length ? `${items.length} entries` : "No history";
  if (!items.length) {
    els.myBookingsList.innerHTML = `<div class="empty-box">No previous bookings yet.</div>`;
    return;
  }

  els.myBookingsList.innerHTML = items.map((item) => {
    const when = formatMatchDate(item.date, item.time);
    const venue = escapeHtml(item.location || item.venue || "Venue");
    const status = escapeHtml(String(item.matchStatus || item.status || "booked").toUpperCase());
    const slots = Math.max(Number(item.slots || 1), 1);
    const totalFee = Number(item.totalFee || 0);
    const pay = getStoredPaymentDetails(item);
    return `
      <div class="announcement-card">
        <strong>${venue}</strong>
        <div class="muted">${escapeHtml(when)} | ${status}</div>
        <div class="muted">${slots} slot(s) | ${escapeHtml(pay.methodLabel)} | ${escapeHtml(pay.status)} | Total BDT ${totalFee} | Paid BDT ${pay.paidAmount} | Due BDT ${pay.dueAmount}</div>
      </div>
    `;
  }).join("");

  animateListEntrance(els.myBookingsList, ".announcement-card");
}
async function fetchMyBookingsFallback(userId) {
  const matchesSnap = await getDocs(collection(db, "matches"));
  const rows = [];

  for (const matchDoc of matchesSnap.docs) {
    const match = matchDoc.data() || {};
    const bookingSnap = await getDoc(doc(db, "matches", matchDoc.id, "bookings", userId));
    if (!bookingSnap.exists()) continue;
    rows.push({
      id: `${matchDoc.id}-${userId}`,
      ...bookingSnap.data(),
      location: match.location || "Venue",
      date: match.date || "",
      time: match.time || "",
      matchStatus: match.status || "open"
    });
  }

  return rows
    .sort((a, b) => {
      const at = Date.parse(`${a.date || "1970-01-01"}T${a.time || "00:00:00"}`) || 0;
      const bt = Date.parse(`${b.date || "1970-01-01"}T${b.time || "00:00:00"}`) || 0;
      return bt - at;
    })
    .slice(0, 20);
}

function listenMyBookings(userId) {
  if (!userId || !els.myBookingsList) return;
  state.myBookingsUnsub?.();

  state.myBookingsUnsub = onSnapshot(
    collection(db, "matches"),
    async () => {
      try {
        const rows = await fetchMyBookingsFallback(userId);
        renderMyBookings(rows);
      } catch (err) {
        console.error(err);
        if (els.myBookingsList) els.myBookingsList.innerHTML = `<div class="empty-box">Could not load booking history.</div>`;
      }
    },
    async (err) => {
      console.error(err);
      try {
        const rows = await fetchMyBookingsFallback(userId);
        renderMyBookings(rows);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        if (els.myBookingsList) els.myBookingsList.innerHTML = `<div class="empty-box">Could not load booking history.</div>`;
      }
    }
  );
}
function updateHero(match, bookings) {
  const total = Number(match.totalSlots || 0);
  const booked = getBookedSlots(bookings);
  const left = Math.max(total - booked, 0);
  const percent = total ? Math.round((booked / total) * 100) : 0;
  const myBooking = state.user ? bookings.find((b) => b.userId === state.user.uid) : null;
  const mySlots = Math.max(Number(myBooking?.slots || 0), 0);
  const canTakeMoreForUser = Math.max(MAX_TOTAL_SLOTS_PER_USER - mySlots, 0);
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
  injectUiIcons();
}

function listenBookingsForMatch(matchId) {
  if (els.playersList) els.playersList.innerHTML = `<div class="empty-box loading-state">Loading players list...</div>`;
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
  state.featuredUnsub = onSnapshot(collection(db, "matches"), (snap) => {
    const docs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const as = (a.status || "").toLowerCase() === "open" ? 0 : 1;
        const bs = (b.status || "").toLowerCase() === "open" ? 0 : 1;
        if (as !== bs) return as - bs;
        const at = Date.parse(`${a.date || "1970-01-01"}T${a.time || "00:00:00"}`) || 0;
        const bt = Date.parse(`${b.date || "1970-01-01"}T${b.time || "00:00:00"}`) || 0;
        return bt - at;
      });

    const top = docs[0];
    if (!top) {
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
  injectUiIcons();
      return;
    }

    state.featuredMatch = top;
    listenBookingsForMatch(top.id);
  }, (err) => {
    console.error(err);
    if (els.playersList) els.playersList.innerHTML = `<div class="empty-box">Could not load match right now.</div>`;
  });
}

function listenAnnouncements(target, isAdmin = false) {
  state.announcementsUnsub?.();
  state.announcementsUnsub = onSnapshot(
    collection(db, "announcements"),
    (snap) => {
      if (snap.empty) {
        target.innerHTML = `<div class="empty-box">No announcements yet.</div>`;
        return;
      }

      const ordered = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const at = a.createdAt?.toDate?.()?.getTime?.() || 0;
          const bt = b.createdAt?.toDate?.()?.getTime?.() || 0;
          return bt - at;
        });

      target.innerHTML = ordered.map((a) => {
        const date = a.createdAt?.toDate?.() ? a.createdAt.toDate().toLocaleString() : "";

        if (!isAdmin) {
          return `<div class="announcement-card"><strong>${escapeHtml(a.text || "")}</strong><div class="muted">${date}</div></div>`;
        }

        return `<div class="announcement-card"><strong>${escapeHtml(a.text || "")}</strong><div class="muted">${date}</div><div class="admin-actions top-space"><button class="secondary-btn edit-announcement-btn" data-id="${a.id}">Edit</button><button class="ghost-btn delete-announcement-btn" data-id="${a.id}">Delete</button></div></div>`;
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
      target.innerHTML = `<div class="empty-box">Could not load announcements right now.</div>`;
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

    if (requestedSlots > MAX_TOTAL_SLOTS_PER_USER) {
      showToast(`One player can hold maximum ${MAX_TOTAL_SLOTS_PER_USER} total slots.`);
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
    if (newSlots > MAX_TOTAL_SLOTS_PER_USER) {
      showToast(`One player can hold maximum ${MAX_TOTAL_SLOTS_PER_USER} total slots.`);
      return;
    }

    const previousNames = Array.isArray(existingData?.extraPlayerNames) ? existingData.extraPlayerNames : [];
    const combinedExtraNames = [...previousNames, ...extraNames].slice(0, MAX_TOTAL_SLOTS_PER_USER - 1);
    const unitFee = Number(match.slotFee || 0);
    const totalFee = unitFee * newSlots;
    const p = state.userProfile || {};
    const bkashPaid = selectedPayment === "bKash" && bkashConfirmed && /^\d{3}$/.test(String(bkashLast3 || ""));
    const paymentStatus = selectedPayment === "On-spot" ? "due" : (bkashPaid ? "paid" : "pending");
    const dueAmount = paymentStatus === "paid" ? 0 : totalFee;
    const paidAmount = paymentStatus === "paid" ? totalFee : 0;

    await setDoc(bookingRef, {
      userId: user.uid,
      email: user.email || "",
      name: p.name || user.displayName || user.email?.split("@")[0] || "Player",
      paymentMethod: selectedPayment,
      paymentStatus,
      dueAmount,
      paidAmount,
      matchLabel: match.label || "Match",
      matchLocation: match.location || "Venue",
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
      paymentStatus,
      dueAmount,
      paidAmount,
      matchLabel: match.label || "Match",
      matchLocation: match.location || "Venue",
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
  injectUiIcons();
    openReceiptModal({
      venue: match.location || "Venue",
      when: formatMatchDate(match.date, match.time),
      slots: newSlots,
      unitFee,
      totalFee,
      payment: selectedPayment,
      last3: selectedPayment === "bKash" ? String(bkashLast3 || "") : "",
      paidAmount,
      dueAmount
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
    if (!bookingSnap.exists()) {
      showToast("No active booking found.");
      return;
    }

    const booking = bookingSnap.data() || {};
    const confirmed = window.confirm(`Cancel your booking for ${match.location || "this match"}? This cannot be undone.`);
    if (!confirmed) return;

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
    collection(db, "matches"),
    async (snap) => {
      if (snap.empty) {
        els.adminMatchesList.innerHTML = `<div class="empty-box">No matches yet.</div>`;
        return;
      }

      const orderedDocs = snap.docs
        .map((d) => ({ id: d.id, data: d.data() }))
        .sort((a, b) => {
          const at = a.data.createdAt?.toDate?.()?.getTime?.() || 0;
          const bt = b.data.createdAt?.toDate?.()?.getTime?.() || 0;
          return bt - at;
        });

      const cards = [];
      for (const row of orderedDocs) {
        const d = { id: row.id };
        const m = row.data;
        const bookingDocs = await getDocs(collection(db, "matches", d.id, "bookings"));
        const bookings = bookingDocs.docs.map((b) => b.data() || {});
        const booked = getBookedSlots(bookings);
        const bookingRows = bookings.length ? bookings.map((booking) => {
          const entry = mapBookingToTrackerEntry(d.id, m, booking);
          const pay = getStoredPaymentDetails(entry);
          const names = [entry.targetName || entry.actorName || 'Player', ...(Array.isArray(entry.extraPlayerNames) ? entry.extraPlayerNames : [])].filter(Boolean).join(', ');
          const nextStatus = pay.status.toLowerCase() === 'paid' ? 'due' : 'paid';
          const actionLabel = pay.status.toLowerCase() === 'paid' ? 'Mark due' : 'Mark paid';
          return `
            <div class="admin-booking-row">
              <div class="admin-booking-copy">
                <strong>${escapeHtml(entry.targetName || entry.actorName || 'Player')}</strong>
                <div class="muted">${escapeHtml(entry.targetEmail || entry.actorEmail || '')}</div>
                <div class="muted">Players: ${escapeHtml(names || 'Player')}</div>
                <div class="muted">${Math.max(Number(entry.slotsAdded || 0), 0)} slot(s) | ${escapeHtml(pay.methodLabel)} | ${escapeHtml(pay.status)} | Paid BDT ${pay.paidAmount} | Due BDT ${pay.dueAmount}</div>
              </div>
              <div class="admin-booking-actions">
                <button class="secondary-btn compact-btn booking-status-btn" type="button" data-matchid="${escapeHtml(d.id)}" data-userid="${escapeHtml(entry.targetUserId || '')}" data-status="${escapeHtml(nextStatus)}">${actionLabel}</button>
                <button class="ghost-btn compact-btn kick-btn" type="button" data-matchid="${escapeHtml(d.id)}" data-userid="${escapeHtml(entry.targetUserId || '')}">Remove</button>
              </div>
            </div>
          `;
        }).join('') : `<div class="empty-box">No players booked yet.</div>`;

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
            <div class="admin-booking-list">${bookingRows}</div>
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

      els.adminMatchesList.querySelectorAll('.booking-status-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await updateBookingPaymentState(String(btn.dataset.matchid || ''), String(btn.dataset.userid || ''), String(btn.dataset.status || 'paid'));
        });
      });

      els.adminMatchesList.querySelectorAll('.kick-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await kickPlayerDirect(String(btn.dataset.matchid || ''), String(btn.dataset.userid || ''));
        });
      });
    },
    (err) => {
      console.error(err);
      if (els.adminMatchesList) els.adminMatchesList.innerHTML = `<div class="empty-box">Could not load matches right now.</div>`;
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
on(els.highlightsSearchBtn, "click", runHighlightsSearch);
on(els.closeMapPickerModal, "click", closeMapPicker);
on(els.confirmMapPickerBtn, "click", confirmMapPicker);
on(els.closeBkashModal, "click", closeBkashModal);
on(els.bkashContinueBtn, "click", continueBkashBooking);
on(els.profileForm, "submit", saveProfile);
on(els.heroBookBtn, "click", startBookingFlow);
on(els.heroCancelBtn, "click", cancelBookingDirect);
on(els.heroQtyMinus, "click", () => nudgeSlotQty(-1));
on(els.heroQtyPlus, "click", () => nudgeSlotQty(1));
on(els.heroDownloadBtn, "click", downloadPoster);
on(els.heroSlotQty, "input", refreshBookingPreview);
on(els.extraPlayersList, "input", refreshBookingPreview);
on(els.extraPlayerNames, "input", refreshBookingPreview);
on(els.heroPaymentSelect, "change", refreshBookingPreview);
on(els.closeReceiptModal, "click", closeReceiptModal);
on(els.closeFixtureDetailModal, "click", closeFixtureDetailModal);
on(els.downloadReceiptBtn, "click", downloadReceipt);
on(els.adminMatchForm, "submit", createMatch);
on(els.announcementForm, "submit", postAnnouncement);

on(els.highlightsSearchInput, "keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    runHighlightsSearch();
  }
});
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

document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (els.playerView?.classList.contains("hidden")) return;
  loadDailyFixtures({ silent: true });
});

initStaticUi();
initMotionUi();
initMoreMenu();
initFixtureTabs();
initPaymentSwitch();
authUiMode("login");
refreshBookingPreview();
  injectUiIcons();

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
















