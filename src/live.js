// Live data: chess.com fetches (through /api proxy, with direct fallback) and
// in-browser Stockfish analysis of games that are newer than the built-in snapshot.
import { Chess } from "chess.js";

export async function chesscom(path) {
  try {
    const r = await fetch(`/api/chesscom?path=${encodeURIComponent(path)}`);
    if (r.ok && (r.headers.get("content-type") || "").includes("json")) return await r.json();
  } catch { /* fall through */ }
  const r = await fetch(`https://api.chess.com/pub/${path}`);
  if (!r.ok) throw new Error(`chess.com returned ${r.status}`);
  return r.json();
}

export async function fetchLive(username, sinceEnd) {
  const [profile, stats, arch] = await Promise.all([
    chesscom(`player/${username}`),
    chesscom(`player/${username}/stats`),
    chesscom(`player/${username}/games/archives`),
  ]);
  const months = (arch.archives || []).slice(-2);
  const games = [];
  for (const m of months) {
    const p = m.split("/pub/")[1];
    const d = await chesscom(p);
    games.push(...(d.games || []));
  }
  const fresh = games.filter((g) => g.end_time > sinceEnd && g.rules === "chess" && g.pgn);
  return { profile, stats, fresh };
}

// ---------- engine ----------
let worker = null;
function getWorker() {
  if (!worker) {
    worker = new Worker("/engine/stockfish.js");
    worker.postMessage("uci");
  }
  return worker;
}

function evalFen(fen, depth = 10) {
  return new Promise((resolve) => {
    const w = getWorker();
    let score = 0, mate = null, best = null;
    const on = (e) => {
      const line = String(e.data);
      const m = line.match(/score (cp|mate) (-?\d+)/);
      if (m && line.includes(" pv ")) {
        if (m[1] === "cp") { score = Number(m[2]); mate = null; } else mate = Number(m[2]);
      }
      if (line.startsWith("bestmove")) {
        best = line.split(" ")[1];
        w.removeEventListener("message", on);
        const turnWhite = fen.split(" ")[1] === "w";
        let cp = mate !== null ? (mate > 0 ? 10000 : -10000) : score;
        if (!turnWhite) cp = -cp; // normalise to White's point of view
        resolve({ cp, best: best === "(none)" ? null : best });
      }
    };
    w.addEventListener("message", on);
    w.postMessage("position fen " + fen);
    w.postMessage("go depth " + depth);
  });
}

const winpct = (cp) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
const clamp = (x) => Math.max(-3000, Math.min(3000, x));

export async function analyzeGame(g, username, onProgress) {
  const chess = new Chess();
  chess.loadPgn(g.pgn);
  const history = chess.history({ verbose: true });
  const meWhite = g.white.username.toLowerCase() === username.toLowerCase();
  const side = meWhite ? "white" : "black";
  const opp = meWhite ? "black" : "white";
  const b = new Chess();
  let prev = await evalFen(b.fen());
  const moves = [];
  const puzzles = [];
  const evals = [];
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    const fenBefore = b.fen();
    const mine = (b.turn() === "w") === meWhite;
    b.move(h.san);
    let cur;
    if (b.isCheckmate()) cur = { cp: b.turn() === "w" ? -10000 : 10000, best: null };
    else if (b.isGameOver()) cur = { cp: 0, best: null };
    else cur = await evalFen(b.fen());
    evals.push(Math.max(-1500, Math.min(1500, cur.cp)));
    const sgn = i % 2 === 0 ? 1 : -1;
    const loss = Math.max(0, winpct(sgn * clamp(prev.cp)) - winpct(sgn * clamp(cur.cp)));
    const c = loss >= 30 ? "blunder" : loss >= 20 ? "mistake" : loss >= 10 ? "inaccuracy" : "good";
    let bestSan = null;
    if (prev.best) {
      const t = new Chess(fenBefore);
      try { bestSan = t.move({ from: prev.best.slice(0, 2), to: prev.best.slice(2, 4), promotion: prev.best[4] || "q" }).san; } catch { /* ignore */ }
    }
    moves.push({ s: h.san, c, b: bestSan, m: mine, f: fenBefore, u: h.from + h.to, bu: prev.best, l: Math.round(loss) });
    if (mine && (c === "mistake" || c === "blunder") && prev.best) {
      puzzles.push({ kind: "new", fen: fenBefore, solution: prev.best, best: bestSan, line: bestSan, played: h.san,
        loss: Math.round(loss), url: g.url, ply: i + 1, phase: i < 20 ? "opening" : "middlegame", date: g.end_time });
    }
    prev = cur;
    onProgress?.((i + 1) / history.length);
  }
  const my = moves.filter((m) => m.m);
  const count = (k) => my.filter((m) => m.c === k).length;
  const worst = my.reduce((a, m) => (!a || m.l > a.l ? m : a), null);
  const res = g[side].result;
  const outcome = res === "win" ? "W" : ["agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"].includes(res) ? "D" : "L";
  return {
    game: {
      url: g.url, end: g.end_time, tc: g.time_control, cls: g.time_class, color: side, rating: g[side].rating,
      opp: g[opp].username, opp_rating: g[opp].rating, result: res, opp_result: g[opp].result, outcome,
      eco: (g.eco || "").split("/").pop().replace(/-/g, " ") || "Unknown", moves_n: my.length,
      blunders: count("blunder"), mistakes: count("mistake"), inaccuracies: count("inaccuracy"),
      worst: worst ? { san: worst.s, best: worst.b, loss: worst.l, fen: worst.f, uci: worst.u, best_uci: worst.bu } : null,
      evals, moves, live: true,
    },
    puzzles,
  };
}
