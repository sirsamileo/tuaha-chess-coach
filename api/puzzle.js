// Live puzzles from Lichess, filtered by theme (fork, pin, hangingPiece, mateIn1 ...).
// Usage: /api/puzzle?theme=fork
const THEMES = new Set([
  "mateIn1", "mateIn2", "fork", "pin", "skewer", "hangingPiece", "discoveredAttack",
  "backRankMate", "short", "opening", "endgame", "defensiveMove", "trappedPiece", "mix",
]);

export default async function handler(req, res) {
  const theme = THEMES.has(req.query.theme) ? req.query.theme : "mix";
  const headers = { Accept: "application/json", "User-Agent": "chess-coach-app" };
  try {
    let r = await fetch(`https://lichess.org/api/puzzle/next?angle=${theme}&difficulty=easiest`, { headers });
    if (!r.ok) r = await fetch("https://lichess.org/api/puzzle/daily", { headers });
    const data = await r.json();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ theme, game: { pgn: data.game?.pgn }, puzzle: data.puzzle });
  } catch (e) {
    res.status(502).json({ error: "Lichess is not reachable right now" });
  }
}
