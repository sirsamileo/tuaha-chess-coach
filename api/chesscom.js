// Proxy for the chess.com public API (avoids CORS / rate-limit surprises in the browser).
// Usage: /api/chesscom?path=player/tuahaat7/stats
export default async function handler(req, res) {
  const path = String(req.query.path || "");
  if (!/^player\/[A-Za-z0-9_-]{2,40}(\/(stats|games\/archives|games\/\d{4}\/\d{2}))?$/.test(path)) {
    res.status(400).json({ error: "Path not allowed" });
    return;
  }
  try {
    const r = await fetch(`https://api.chess.com/pub/${path}`, {
      headers: { "User-Agent": "chess-coach-app (personal training tool)" },
    });
    const body = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: "chess.com is not reachable right now" });
  }
}
