const FEEDS = [
  { source: "ESPN FC", url: "https://www.espn.com/espn/rss/soccer/news" },
  { source: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" }
];

function withTimeout(ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

function decodeXml(text = "") {
  return String(text || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeXml(match ? match[1].trim() : "");
}

function pickAttr(block, tag, attr) {
  const match = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, "i"));
  return decodeXml(match ? match[1].trim() : "");
}

function pickImage(block, description) {
  return (
    pickAttr(block, "media:content", "url") ||
    pickAttr(block, "media:thumbnail", "url") ||
    (decodeXml(description).match(/<img[^>]+src="([^"]+)"/i)?.[1] || "")
  );
}

async function loadFeed(feed) {
  const { controller, clear } = withTimeout(12000);
  try {
    const resp = await fetch(feed.url, {
      method: "GET",
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: controller.signal
    });

    if (!resp.ok) return [];
    const xml = await resp.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

    return items.slice(0, 12).map((block) => {
      const description = pickTag(block, "description");
      const title = pickTag(block, "title");
      return {
        title,
        url: pickTag(block, "link"),
        publishedAt: pickTag(block, "pubDate") || pickTag(block, "dc:date"),
        source: feed.source,
        competition: "Football News",
        thumbnail: pickImage(block, description) || `https://placehold.co/960x540/111318/f7f8fb?text=${encodeURIComponent(title || "Football News")}`
      };
    }).filter((item) => item.title && item.url);
  } finally {
    clear();
  }
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
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const feeds = await Promise.all(FEEDS.map((feed) => loadFeed(feed).catch(() => [])));
    const seen = new Set();
    const items = feeds.flat().filter((item) => {
      const key = `${item.title}::${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 18);

    res.status(200).json({ ok: true, items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || "Football news failed" });
  }
};