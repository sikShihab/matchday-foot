const SPORTMONKS_BASE = "https://api.sportmonks.com/v3/football";

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
    throw new Error("Missing SPORTMONKS_API_TOKEN");
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
      throw new Error(`Sportmonks ${resp.status}: ${body.slice(0, 300)}`);
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

function parseLineups(fixture = {}) {
  const participants = Array.isArray(fixture?.participants) ? fixture.participants : [];
  const lineups = Array.isArray(fixture?.lineups) ? fixture.lineups : [];

  const home = participants.find((p) => String(p?.meta?.location || "").toLowerCase() === "home");
  const away = participants.find((p) => String(p?.meta?.location || "").toLowerCase() === "away");

  const mapSide = (participantId) => {
    const rows = lineups.filter((l) => String(l?.team_id || l?.participant_id) === String(participantId));
    return rows.map((row) => {
      const details = Array.isArray(row?.details) ? row.details : [];
      const detail = details.find((d) => d?.player) || details[0] || {};
      const p = detail.player || {};
      return {
        id: String(p.id || row.player_id || ""),
        name: p.display_name || p.common_name || p.name || "Unknown",
        position: detail.position || row.position || "",
        number: detail.jersey_number || row.shirt_number || ""
      };
    }).filter((p) => p.name && p.name !== "Unknown");
  };

  return {
    homeTeam: home?.name || "Home",
    awayTeam: away?.name || "Away",
    home: mapSide(home?.id),
    away: mapSide(away?.id)
  };
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
    if (type === "lineups") {
      const fixtureId = String(req.query.fixtureId || "");
      if (!fixtureId) {
        res.status(400).json({ error: "fixtureId is required" });
        return;
      }

      const include = "participants;lineups.details.player";
      const payload = await sportmonksFetch(`/fixtures/${fixtureId}`, { include });
      const fixture = payload?.data || {};

      res.status(200).json({ ok: true, lineup: parseLineups(fixture) });
      return;
    }

    const include = "participants;league;venue;state;scores;season;round";
    const date = String(req.query.date || toIsoDate());

    const [livePayload, ...dayPayloads] = await Promise.all([
      sportmonksFetch("/fixtures/live", { include }).catch(() => ({ data: [] })),
      sportmonksFetch(`/fixtures/date/${addDays(date, -1)}`, { include }).catch(() => ({ data: [] })),
      sportmonksFetch(`/fixtures/date/${date}`, { include }).catch(() => ({ data: [] })),
      sportmonksFetch(`/fixtures/date/${addDays(date, 1)}`, { include }).catch(() => ({ data: [] }))
    ]);

    const merged = []
      .concat(Array.isArray(livePayload?.data) ? livePayload.data : [])
      .concat(...dayPayloads.map((p) => (Array.isArray(p?.data) ? p.data : [])));

    const map = new Map();
    merged.forEach((fx) => {
      const mapped = mapFixture(fx);
      if (!mapped.id) return;
      map.set(mapped.id, mapped);
    });

    const fixtures = Array.from(map.values())
      .sort((a, b) => a.stamp - b.stamp)
      .slice(0, 300);

    res.status(200).json({ ok: true, fixtures });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err?.message || "Sportmonks proxy failed"
    });
  }
};
