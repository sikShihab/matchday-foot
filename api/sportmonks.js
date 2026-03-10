const SPORTMONKS_BASE = "https://api.sportmonks.com/v3/football";
const THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/123";

const FEATURED_COMPETITIONS = [
  { id: "4480", name: "UEFA Champions League", category: "Top Leagues" },
  { id: "4328", name: "Premier League", category: "Top Leagues" },
  { id: "4335", name: "LaLiga", category: "Top Leagues" },
  { id: "4332", name: "Serie A", category: "Top Leagues" },
  { id: "4331", name: "Bundesliga", category: "Top Leagues" },
  { id: "4334", name: "Ligue 1", category: "Top Leagues" },
  { id: "4370", name: "FA Cup", category: "Top Leagues" },
  { id: "4481", name: "UEFA Europa League", category: "Top Leagues" },
  { id: "4396", name: "Copa del Rey", category: "Top Leagues" },
  { id: "4487", name: "AFC Champions League", category: "Top Leagues" },
  { id: "4829", name: "Bangladesh Premier League", category: "Top Leagues" }
];

const LEAGUE_META_CACHE = new Map();
function toIsoDate(d = new Date()) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(isoDate, offset) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return toIsoDate(d);
}

function withTimeout(ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

async function sportmonksFetch(path, query = {}) {
  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    throw new Error("Live match service not configured");
  }

  const url = new URL(`${SPORTMONKS_BASE}${path}`);
  url.searchParams.set("api_token", token);
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const { controller, clear } = withTimeout(12000);
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Live match service error (${resp.status})`);
    }

    return await resp.json();
  } finally {
    clear();
  }
}

function pickParticipant(fixture, side) {
  const participants = Array.isArray(fixture?.participants) ? fixture.participants : [];
  return participants.find((p) => String(p?.meta?.location || "").toLowerCase() === side) || null;
}

function pickScoreForParticipant(fixture, participantId) {
  const scores = Array.isArray(fixture?.scores) ? fixture.scores : [];
  if (!participantId) return null;

  const forTeam = scores.filter((s) => String(s?.participant_id) === String(participantId));
  if (!forTeam.length) return null;

  const preferred = [
    forTeam.find((s) => String(s?.description || "").toLowerCase().includes("current")),
    forTeam.find((s) => String(s?.description || "").toLowerCase().includes("2nd half")),
    forTeam.find((s) => String(s?.description || "").toLowerCase().includes("1st half")),
    forTeam.find((s) => String(s?.description || "").toLowerCase().includes("fulltime")),
    forTeam[0]
  ].find(Boolean);

  return Number.isFinite(Number(preferred?.score?.goals))
    ? Number(preferred.score.goals)
    : (Number.isFinite(Number(preferred?.score)) ? Number(preferred.score) : null);
}

function mapFixture(fixture = {}) {
  const home = pickParticipant(fixture, "home");
  const away = pickParticipant(fixture, "away");

  const kickoffIso = fixture?.starting_at || "";
  const kickoffDate = kickoffIso ? new Date(kickoffIso) : null;
  const date = kickoffDate && !Number.isNaN(kickoffDate.getTime())
    ? kickoffDate.toISOString().slice(0, 10)
    : "";
  const time = kickoffDate && !Number.isNaN(kickoffDate.getTime())
    ? kickoffDate.toISOString().slice(11, 16)
    : "";

  const homeScore = pickScoreForParticipant(fixture, home?.id);
  const awayScore = pickScoreForParticipant(fixture, away?.id);

  return {
    id: String(fixture?.id || ""),
    leagueId: String(fixture?.league_id || fixture?.league?.id || ""),
    league: fixture?.league?.name || "Competition",
    leagueLogo: fixture?.league?.image_path || "",
    season: fixture?.season?.name || String(fixture?.season_id || ""),
    round: fixture?.round?.name || String(fixture?.round_id || ""),
    venue: fixture?.venue?.name || "",
    venueCity: fixture?.venue?.city_name || "",
    status: fixture?.state?.name || fixture?.state?.short_name || "Scheduled",
    statusCode: fixture?.state?.state || "",
    date,
    time,
    kickoffIso,
    stamp: kickoffDate && !Number.isNaN(kickoffDate.getTime())
      ? kickoffDate.getTime()
      : Number.MAX_SAFE_INTEGER,
    home: home?.name || "Home",
    away: away?.name || "Away",
    homeTeamId: String(home?.id || ""),
    awayTeamId: String(away?.id || ""),
    homeBadge: home?.image_path || "",
    awayBadge: away?.image_path || "",
    homeScore,
    awayScore
  };
}

function fixturePriority(fixture = {}) {
  const stateName = String(
    fixture?.state?.developer_name ||
    fixture?.state?.short_name ||
    fixture?.state?.name ||
    ""
  ).toLowerCase();

  if (
    stateName.includes("live") ||
    stateName.includes("inplay") ||
    stateName.includes("in play") ||
    stateName.includes("half")
  ) return 3;

  if (
    stateName.includes("finished") ||
    stateName.includes("ft") ||
    stateName.includes("aet") ||
    stateName.includes("pen")
  ) return 2;

  return 1;
}

function extractTextValue(value = "") {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return String(value.display_name || value.common_name || value.name || value.label || value.code || "").trim();
  }
  return String(value).trim();
}

function parseLineupPlayer(row = {}) {
  const details = Array.isArray(row?.details) ? row.details : [];
  const detail = details.find((entry) => entry?.player) || details[0] || {};
  const player = row?.player || detail?.player || {};
  const number = detail?.jersey_number ?? row?.jersey_number ?? row?.shirt_number ?? row?.number ?? "";
  const formationOrder = Number(row?.formation_position ?? row?.formation_position_number ?? detail?.formation_position ?? Number.MAX_SAFE_INTEGER);

  return {
    id: String(player?.id || row?.player_id || ""),
    name: extractTextValue(player) || extractTextValue(row?.player_name) || "",
    position: extractTextValue(detail?.position || row?.position || row?.type || row?.lineup_position),
    number: extractTextValue(number),
    sort: Number.isFinite(formationOrder) ? formationOrder : Number.MAX_SAFE_INTEGER
  };
}

function lineupRowsForParticipant(lineups = [], participantId = "", participantName = "") {
  const targetId = String(participantId || "");
  const targetName = extractTextValue(participantName).toLowerCase();

  return lineups
    .filter((row) => {
      const rowId = String(row?.team_id || row?.participant_id || row?.team?.id || row?.participant?.id || "");
      const rowName = extractTextValue(row?.team?.name || row?.participant?.name || row?.team_name || row?.participant_name).toLowerCase();
      return (targetId && rowId === targetId) || (targetName && rowName === targetName);
    })
    .map(parseLineupPlayer)
    .filter((player) => player.name)
    .sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      return a.name.localeCompare(b.name);
    })
    .map(({ sort, ...player }) => player);
}

function hasLineupData(lineup = null) {
  return Boolean(
    lineup && (
      (Array.isArray(lineup.home) && lineup.home.length) ||
      (Array.isArray(lineup.away) && lineup.away.length)
    )
  );
}

function parseLineups(fixture = {}) {
  const participants = Array.isArray(fixture?.participants) ? fixture.participants : [];
  const lineups = Array.isArray(fixture?.lineups) ? fixture.lineups : [];

  const home = participants.find((p) => String(p?.meta?.location || "").toLowerCase() === "home");
  const away = participants.find((p) => String(p?.meta?.location || "").toLowerCase() === "away");

  return {
    homeTeam: home?.name || "Home",
    awayTeam: away?.name || "Away",
    home: lineupRowsForParticipant(lineups, home?.id, home?.name),
    away: lineupRowsForParticipant(lineups, away?.id, away?.name)
  };
}

function parseEvents(fixture = {}) {
  const events = Array.isArray(fixture?.events) ? fixture.events : [];
  return events
    .map((ev) => ({
      id: String(ev?.id || ""),
      minute: Number.isFinite(Number(ev?.minute)) ? Number(ev.minute) : 0,
      extraMinute: Number.isFinite(Number(ev?.extra_minute)) ? Number(ev.extra_minute) : null,
      teamId: String(ev?.participant_id || ""),
      player: ev?.player_name || "",
      relatedPlayer: ev?.related_player_name || "",
      type: ev?.type?.name || ev?.type?.developer_name || "Event",
      typeCode: ev?.type?.code || "",
      addition: ev?.addition || "",
      info: ev?.info || "",
      result: ev?.result || "",
      sortOrder: Number.isFinite(Number(ev?.sort_order)) ? Number(ev.sort_order) : 999
    }))
    .filter((ev) => ev.id)
    .sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      if ((a.extraMinute || 0) !== (b.extraMinute || 0)) return (a.extraMinute || 0) - (b.extraMinute || 0);
      return a.sortOrder - b.sortOrder;
    });
}

function extractStatValue(value) {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry !== null && entry !== undefined && entry !== "");
    return extractStatValue(first);
  }
  if (typeof value === "object") {
    const preferred = [value.total, value.percentage, value.current, value.value, value.stat, value.amount];
    const first = preferred.find((entry) => entry !== null && entry !== undefined && entry !== "")
      ?? Object.values(value).find((entry) => entry !== null && entry !== undefined && entry !== "");
    return extractStatValue(first);
  }
  return value;
}

function parseStatistics(fixture = {}) {
  const stats = Array.isArray(fixture?.statistics) ? fixture.statistics : [];
  const participants = Array.isArray(fixture?.participants) ? fixture.participants : [];

  const home = participants.find((p) => String(p?.meta?.location || "").toLowerCase() === "home");
  const away = participants.find((p) => String(p?.meta?.location || "").toLowerCase() === "away");

  const byType = new Map();
  stats.forEach((row) => {
    const typeName = row?.type?.name || row?.type?.developer_name || "Stat";
    const entry = byType.get(typeName) || { name: typeName, home: null, away: null };
    const participantId = String(row?.participant_id || row?.team_id || row?.participant?.id || "");
    const side = String(row?.location || row?.participant?.meta?.location || row?.team_side || "").toLowerCase();
    const value = extractStatValue(row?.data?.value ?? row?.value ?? row?.data ?? null);
    if ((participantId && String(home?.id || "") === participantId) || side === "home") entry.home = value;
    if ((participantId && String(away?.id || "") === participantId) || side === "away") entry.away = value;
    byType.set(typeName, entry);
  });

  return Array.from(byType.values())
    .filter((entry) => entry.home !== null || entry.away !== null)
    .slice(0, 40);
}

function mergeFixtureDetail(primary = {}, fallback = {}) {
  return {
    ...primary,
    resultInfo: primary?.resultInfo || fallback?.resultInfo || "",
    weather: primary?.weather || fallback?.weather || null,
    lineups: hasLineupData(primary?.lineups) ? primary.lineups : (fallback?.lineups || primary?.lineups),
    events: Array.isArray(primary?.events) && primary.events.length ? primary.events : (fallback?.events || []),
    statistics: Array.isArray(primary?.statistics) && primary.statistics.length ? primary.statistics : (fallback?.statistics || []),
    sidelined: Array.isArray(primary?.sidelined) && primary.sidelined.length ? primary.sidelined : (fallback?.sidelined || [])
  };
}

function parseFixtureDetail(fixture = {}) {
  const base = mapFixture(fixture);
  const lineups = parseLineups(fixture);
  const events = parseEvents(fixture);
  const statistics = parseStatistics(fixture);
  const weather = fixture?.weatherreport || fixture?.weatherReport || null;
  const sidelines = Array.isArray(fixture?.sidelined?.sideline) ? fixture.sidelined.sideline : [];

  return {
    ...base,
    resultInfo: fixture?.result_info || "",
    weather: weather ? {
      description: weather?.description || weather?.condition || "",
      temperature: weather?.temperature || weather?.temp || "",
      humidity: weather?.humidity || "",
      wind: weather?.wind || weather?.wind_speed || ""
    } : null,
    lineups,
    events,
    statistics,
    sidelined: sidelines.slice(0, 30).map((s) => ({
      teamId: String(s?.participant_id || s?.team_id || ""),
      player: s?.player?.display_name || s?.player?.name || "",
      reason: s?.type?.name || s?.type?.developer_name || "",
      startDate: s?.start_date || "",
      endDate: s?.end_date || ""
    }))
  };
}

async function theSportsDbFetch(endpoint, query = {}) {
  const url = new URL(`${THESPORTSDB_BASE}/${endpoint}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const { controller, clear } = withTimeout(12000);
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    if (!resp.ok) {
      throw new Error(`Fallback football service error (${resp.status})`);
    }

    return await resp.json();
  } finally {
    clear();
  }
}

function normalizeSportsDbTime(raw = "") {
  const text = String(raw || "").trim();
  return text ? text.slice(0, 5) : "";
}

function mapSportsDbEvent(ev = {}) {
  const date = String(ev?.dateEvent || ev?.dateEventLocal || "");
  const time = normalizeSportsDbTime(ev?.strTimeLocal || ev?.strTime || "");
  const kickoffIso = date ? `${date}T${time || "00:00"}:00Z` : "";
  const stamp = kickoffIso && !Number.isNaN(Date.parse(kickoffIso)) ? Date.parse(kickoffIso) : Number.MAX_SAFE_INTEGER;

  return {
    id: String(ev?.idEvent || ""),
    leagueId: String(ev?.idLeague || ""),
    league: ev?.strLeague || ev?.strLeagueAlternate || "Competition",
    leagueLogo: ev?.strLeagueBadge || "",
    season: ev?.strSeason || "",
    round: ev?.intRound ? `Round ${ev.intRound}` : "",
    venue: ev?.strVenue || "",
    venueCity: ev?.strCountry || "",
    status: ev?.strStatus || "Scheduled",
    statusCode: ev?.strStatus || "",
    date,
    time,
    kickoffIso,
    stamp,
    home: ev?.strHomeTeam || "Home",
    away: ev?.strAwayTeam || "Away",
    homeTeamId: String(ev?.idHomeTeam || ""),
    awayTeamId: String(ev?.idAwayTeam || ""),
    homeBadge: ev?.strHomeTeamBadge || "",
    awayBadge: ev?.strAwayTeamBadge || "",
    homeScore: Number.isFinite(Number(ev?.intHomeScore)) ? Number(ev.intHomeScore) : null,
    awayScore: Number.isFinite(Number(ev?.intAwayScore)) ? Number(ev.intAwayScore) : null
  };
}

async function enrichCompetitionMeta(competition = {}) {
  const key = String(competition?.id || "");
  if (!key) return competition;
  if (LEAGUE_META_CACHE.has(key)) return { ...competition, ...LEAGUE_META_CACHE.get(key) };

  try {
    const payload = await theSportsDbFetch("lookupleague.php", { id: key });
    const league = Array.isArray(payload?.leagues) ? payload.leagues[0] : null;
    const meta = {
      id: key,
      name: league?.strLeague || competition?.name || "Competition",
      logo: league?.strBadge || league?.strLogo || league?.strFanart1 || "",
      category: competition?.category || "Top Leagues"
    };
    LEAGUE_META_CACHE.set(key, meta);
    return meta;
  } catch {
    const fallback = {
      id: key,
      name: competition?.name || "Competition",
      logo: competition?.logo || "",
      category: competition?.category || "Top Leagues"
    };
    LEAGUE_META_CACHE.set(key, fallback);
    return fallback;
  }
}

function mapFeaturedCompetitionEvent(ev = {}, competition = {}) {
  const mapped = mapSportsDbEvent(ev);
  return {
    ...mapped,
    leagueId: String(competition?.id || mapped.leagueId || ""),
    league: competition?.name || mapped.league,
    leagueLogo: competition?.logo || mapped.leagueLogo || "",
    category: competition?.category || "Top Leagues"
  };
}

async function fetchFeaturedCompetitionFixtures(date) {
  const competitions = await Promise.all(FEATURED_COMPETITIONS.map((competition) => enrichCompetitionMeta(competition)));
  const bundles = await Promise.all(competitions.map(async (competition) => {
    try {
      const [dayPayload, upcomingPayload] = await Promise.all([
        theSportsDbFetch("eventsday.php", { d: date, id: competition.id }).catch(() => ({ events: [] })),
        theSportsDbFetch("eventsnextleague.php", { id: competition.id }).catch(() => ({ events: [] }))
      ]);

      const dayEvents = Array.isArray(dayPayload?.events) ? dayPayload.events : [];
      const upcomingEvents = Array.isArray(upcomingPayload?.events) ? upcomingPayload.events : [];
      return [...dayEvents, ...upcomingEvents].map((event) => mapFeaturedCompetitionEvent(event, competition));
    } catch {
      return [];
    }
  }));

  const deduped = new Map();
  bundles.flat().forEach((fixture) => {
    if (!fixture?.id) return;
    if (!deduped.has(fixture.id)) deduped.set(fixture.id, fixture);
  });
  return Array.from(deduped.values());
}

function mapSportsDbStats(ev = {}) {
  const pairs = [
    ["Shots", ev?.intHomeShots, ev?.intAwayShots],
    ["Yellow Cards", ev?.intHomeYellowCards, ev?.intAwayYellowCards],
    ["Red Cards", ev?.intHomeRedCards, ev?.intAwayRedCards],
    ["Corners", ev?.intHomeCorners, ev?.intAwayCorners],
    ["Fouls", ev?.intHomeFouls, ev?.intAwayFouls],
    ["Possession", ev?.strHomePossession, ev?.strAwayPossession]
  ];

  return pairs
    .filter(([, home, away]) => home !== undefined || away !== undefined)
    .map(([name, home, away]) => ({ name, home: home ?? "-", away: away ?? "-" }));
}

function parseSportsDbDetail(ev = {}) {
  const base = mapSportsDbEvent(ev);
  return {
    ...base,
    resultInfo: ev?.strStatus || "",
    weather: null,
    lineups: {
      homeTeam: base.home,
      awayTeam: base.away,
      home: [],
      away: []
    },
    events: [],
    statistics: mapSportsDbStats(ev),
    sidelined: []
  };
}

async function fallbackFixtures(date) {
  const loadEvents = async (d) => {
    const payload = await theSportsDbFetch("eventsday.php", { d, s: "Soccer" });
    const events = Array.isArray(payload?.events) ? payload.events : [];
    return events.map(mapSportsDbEvent).filter((item) => item.id);
  };

  const [featured, prev, today, next] = await Promise.all([
    fetchFeaturedCompetitionFixtures(date).catch(() => []),
    loadEvents(addDays(date, -1)).catch(() => []),
    loadEvents(date).catch(() => []),
    loadEvents(addDays(date, 1)).catch(() => [])
  ]);

  const merged = [...featured, ...prev, ...today, ...next];
  const map = new Map();
  merged.forEach((fixture) => {
    if (!fixture?.id) return;
    const current = map.get(fixture.id);
    if (!current) {
      map.set(fixture.id, fixture);
      return;
    }

    map.set(fixture.id, {
      ...current,
      ...fixture,
      leagueLogo: current.leagueLogo || fixture.leagueLogo || "",
      homeBadge: current.homeBadge || fixture.homeBadge || "",
      awayBadge: current.awayBadge || fixture.awayBadge || ""
    });
  });

  return Array.from(map.values())
    .sort((a, b) => a.stamp - b.stamp)
    .slice(0, 300);
}

async function fallbackDetail(fixtureId) {
  const payload = await theSportsDbFetch("lookupevent.php", { id: fixtureId });
  const ev = Array.isArray(payload?.events) ? payload.events[0] : null;
  if (!ev) throw new Error("Could not load match center.");
  return parseSportsDbDetail(ev);
}

async function fallbackLineups(fixtureId) {
  const detail = await fallbackDetail(fixtureId);
  return detail.lineups;
}
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const type = String(req.query.type || "fixtures").toLowerCase();

  try {
    if (type === "detail") {
      const fixtureId = String(req.query.fixtureId || "");
      if (!fixtureId) {
        res.status(400).json({ error: "fixtureId is required" });
        return;
      }

      try {
        const include = "participants;league;venue;state;scores;season;round;events.type;events.player;events.period;statistics.type;sidelined.sideline.player;sidelined.sideline.type;weatherReport;lineups.player;lineups.details.player";
        const payload = await sportmonksFetch(`/fixtures/${fixtureId}`, { include });
        const fixture = payload?.data || {};
        let detail = parseFixtureDetail(fixture);

        if (!detail.statistics.length || !detail.events.length || !hasLineupData(detail.lineups)) {
          try {
            const fallback = await fallbackDetail(fixtureId);
            detail = mergeFixtureDetail(detail, fallback);
          } catch {}
        }

        res.status(200).json({ ok: true, detail });
      } catch {
        const detail = await fallbackDetail(fixtureId);
        res.status(200).json({ ok: true, detail });
      }
      return;
    }

    if (type === "lineups") {
      const fixtureId = String(req.query.fixtureId || "");
      if (!fixtureId) {
        res.status(400).json({ error: "fixtureId is required" });
        return;
      }

      try {
        const include = "participants;lineups.player;lineups.details.player";
        const payload = await sportmonksFetch(`/fixtures/${fixtureId}`, { include });
        const fixture = payload?.data || {};
        let lineup = parseLineups(fixture);

        if (!hasLineupData(lineup)) {
          try {
            const detail = await fallbackDetail(fixtureId);
            lineup = hasLineupData(detail?.lineups) ? detail.lineups : lineup;
          } catch {}
        }

        res.status(200).json({ ok: true, lineup });
      } catch {
        const lineup = await fallbackLineups(fixtureId);
        res.status(200).json({ ok: true, lineup });
      }
      return;
    }

    const include = "participants;league;venue;state;scores;season;round";
    const date = String(req.query.date || toIsoDate());
    const featuredCompetitions = await Promise.all(FEATURED_COMPETITIONS.map((competition) => enrichCompetitionMeta(competition)));

    try {
      const [livePayload, ...dayPayloads] = await Promise.all([
        sportmonksFetch("/fixtures/live", { include }).catch(() => ({ data: [] })),
        sportmonksFetch(`/fixtures/date/${addDays(date, -1)}`, { include }).catch(() => ({ data: [] })),
        sportmonksFetch(`/fixtures/date/${date}`, { include }).catch(() => ({ data: [] })),
        sportmonksFetch(`/fixtures/date/${addDays(date, 1)}`, { include }).catch(() => ({ data: [] }))
      ]);

      const merged = []
        .concat(...dayPayloads.map((p) => (Array.isArray(p?.data) ? p.data : [])))
        .concat(Array.isArray(livePayload?.data) ? livePayload.data : []);

      const map = new Map();
      merged.forEach((fx) => {
        const mapped = mapFixture(fx);
        if (!mapped.id) return;

        const current = map.get(mapped.id);
        const nextPriority = fixturePriority(fx);
        const currentPriority = current ? Number(current._priority || 0) : 0;
        const nextStamp = Number(mapped.stamp || 0);
        const currentStamp = current ? Number(current.stamp || 0) : 0;

        if (!current || nextPriority > currentPriority || (nextPriority === currentPriority && nextStamp >= currentStamp)) {
          map.set(mapped.id, { ...mapped, _priority: nextPriority });
        }
      });

      let fixtures = Array.from(map.values())
        .map(({ _priority, ...fixture }) => fixture)
        .sort((a, b) => a.stamp - b.stamp)
        .slice(0, 300);

      const featuredFixtures = await fetchFeaturedCompetitionFixtures(date).catch(() => []);
      if (featuredFixtures.length) {
        const supplemented = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
        featuredFixtures.forEach((fixture) => {
          if (!fixture?.id) return;
          const current = supplemented.get(fixture.id);
          if (!current) {
            supplemented.set(fixture.id, fixture);
            return;
          }

          supplemented.set(fixture.id, {
            ...fixture,
            ...current,
            leagueLogo: current.leagueLogo || fixture.leagueLogo || "",
            homeBadge: current.homeBadge || fixture.homeBadge || "",
            awayBadge: current.awayBadge || fixture.awayBadge || ""
          });
        });
        fixtures = Array.from(supplemented.values())
          .sort((a, b) => a.stamp - b.stamp)
          .slice(0, 300);
      }

      if (!fixtures.length) {
        fixtures = await fallbackFixtures(date);
      }

      res.status(200).json({ ok: true, fixtures, competitions: featuredCompetitions });
    } catch {
      const fixtures = await fallbackFixtures(date);
      res.status(200).json({ ok: true, fixtures, competitions: featuredCompetitions });
    }
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err?.message || "Live match service failed"
    });
  }
};