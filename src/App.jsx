import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import Board, { uciArrow } from "./Board.jsx";
import snapshot from "./data/snapshot.json";
import { PLAYER, COURSE, GLOSSARY, OPENINGS, ROADMAP, DAILY } from "./content.js";
import { fetchLive, analyzeGame } from "./live.js";

const TABS = [
  ["report", "Report"],
  ["games", "My games"],
  ["practice", "Practice"],
  ["openings", "Openings"],
  ["course", "Course"],
  ["roadmap", "Road to 900"],
];

const KIND = {
  protect: "Save your piece", punish: "Take the gift", capture: "Free capture",
  find: "Best move", mate: "Checkmate", new: "From a new game",
};

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("coach:" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("coach:" + k, JSON.stringify(v)); } catch { /* ignore */ } },
};

function usePersist(key, init) {
  const [v, setV] = useState(() => store.get(key, init));
  useEffect(() => store.set(key, v), [key, v]);
  return [v, setV];
}

const fmtDate = (t) => new Date(t * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const pct = (a, b) => Math.round((100 * a) / b);

export default function App() {
  const [tab, setTab] = useState(() => (location.hash.slice(1) || "report"));
  const [live, setLive] = useState({ status: "loading" });
  const [extra, setExtra] = usePersist("extra", { games: [], puzzles: [] });
  const [jump, setJump] = useState(null);

  useEffect(() => { location.hash = tab; window.scrollTo(0, 0); }, [tab]);

  const lastEnd = Math.max(...snapshot.games.map((g) => g.end), ...extra.games.map((g) => g.end), 0);
  useEffect(() => {
    const since = Number(new URLSearchParams(location.search).get("since")) || lastEnd;
    fetchLive(PLAYER.username, since)
      .then((d) => setLive({ status: "ok", ...d }))
      .catch((e) => setLive({ status: "error", error: e.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const games = useMemo(() => {
    const seen = new Set();
    return [...extra.games, ...snapshot.games].filter((g) => !seen.has(g.url) && seen.add(g.url)).sort((a, b) => b.end - a.end);
  }, [extra]);
  const puzzles = useMemo(() => [...extra.puzzles, ...snapshot.puzzles], [extra]);

  async function analyzeNew(setProg) {
    const fresh = live.fresh || [];
    const add = { games: [...extra.games], puzzles: [...extra.puzzles] };
    for (let i = 0; i < fresh.length; i++) {
      const r = await analyzeGame(fresh[i], PLAYER.username, (p) => setProg((i + p) / fresh.length));
      add.games.push(r.game);
      add.puzzles.push(...r.puzzles);
    }
    setExtra(add);
    setLive((l) => ({ ...l, fresh: [] }));
  }

  const go = (t, j) => { setJump(j || null); setTab(t); };

  return (
    <div className="app">
      <header className="top">
        <a className="brand" href="#report" onClick={() => go("report")}>
          <span className="brand-mark" aria-hidden="true">{"♞︎"}</span>
          <span>{PLAYER.name}'s chess coach</span>
        </a>
        <nav className="tabs" aria-label="Sections">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)} aria-current={tab === id ? "page" : undefined}>{label}</button>
          ))}
        </nav>
      </header>
      <LiveBar live={live} onAnalyze={analyzeNew} />
      <main>
        {tab === "report" && <Report games={games} live={live} go={go} />}
        {tab === "games" && <Games games={games} jump={jump} />}
        {tab === "practice" && <Practice puzzles={puzzles} />}
        {tab === "openings" && <Openings />}
        {tab === "course" && <Course go={go} />}
        {tab === "roadmap" && <Roadmap live={live} />}
      </main>
      <footer className="foot">
        Data from the chess.com public API, puzzles from Lichess, analysis by Stockfish. Built for {PLAYER.username}.
      </footer>
    </div>
  );
}

function LiveBar({ live, onAnalyze }) {
  const [prog, setProg] = useState(null);
  if (live.status === "loading") return <div className="livebar">Checking chess.com for new games…</div>;
  if (live.status === "error") return <div className="livebar warn">Could not reach chess.com ({live.error}). Showing the saved analysis.</div>;
  const r = live.stats?.chess_rapid?.last?.rating;
  const n = live.fresh?.length || 0;
  return (
    <div className="livebar">
      <span className="dot" aria-hidden="true" /> Live rapid rating <strong>{r ?? "—"}</strong>
      {n > 0 && prog === null && (
        <button className="btn small" onClick={() => { setProg(0); onAnalyze(setProg).then(() => setProg(null)); }}>
          Analyze {n} new game{n > 1 ? "s" : ""}
        </button>
      )}
      {prog !== null && <span className="prog">Analyzing… {Math.round(prog * 100)}%</span>}
      {n === 0 && prog === null && <span className="muted">All games analyzed</span>}
    </div>
  );
}

/* ---------------- Report ---------------- */
function Report({ games, live, go }) {
  const s = snapshot.summary;
  const bigMistakes = s.totals.mistake + s.totals.blunder;
  const hungTotal = Object.values(s.hung).reduce((a, b) => a + b, 0);
  const hero = snapshot.puzzles.find((p) => p.hung === "queen") || snapshot.puzzles[0];
  const heroPlayed = useMemo(() => {
    const g = snapshot.games.find((x) => x.url === hero.url);
    const m = g?.moves.find((mm) => mm.f === hero.fen && mm.m);
    return m?.u;
  }, [hero]);
  const flip = hero.fen.split(" ")[1] === "b";
  const rapid = [...games].filter((g) => g.cls === "rapid").sort((a, b) => a.end - b.end);
  const rec = games.reduce((a, g) => ({ ...a, [g.outcome]: (a[g.outcome] || 0) + 1 }), {});
  const liveRating = live.stats?.chess_rapid?.last?.rating;
  const best = live.stats?.chess_rapid?.best?.rating ?? 440;

  const findings = [
    { n: `${hungTotal} of ${bigMistakes}`, title: "Pieces left unguarded", body: `Most big mistakes leave a piece that can simply be taken. The queen was lost this way ${s.hung.queen} times.`, unit: 2 },
    { n: `${Math.round(s.time.middlegame)} sec`, title: "Per move in a 10-minute game", body: `Games end with about 6 minutes unused. ${s.fast_blunders} blunders were played in under 5 seconds.`, unit: 8 },
    { n: `${s.phase_err.opening}`, title: "Mistakes in the first 10 moves", body: `The opening is where most games go wrong. Castled in only ${s.castled} of ${s.games} games, on average at move ${Math.round(s.castle_ply_avg / 2)}.`, unit: 3 },
    { n: `${s.missed_punish} of ${s.opp_blunders}`, title: "Gifts not taken", body: "Opponents at this level blunder a lot too. Taking their free pieces is the fastest way to win more.", unit: 4 },
    { n: `${s.endings["L:checkmated"] || 0}`, title: "Losses by checkmate", body: `Plus ${s.missed_mates} times a forced mate was missed. Learning 5 mating patterns protects and wins games.`, unit: 6 },
  ];

  return (
    <div className="report">
      <section className="hero">
        <div className="hero-text">
          <p className="kicker">Game report for {PLAYER.username} · {s.games} games checked by Stockfish</p>
          <h1>Tuaha loses games by giving pieces away for free.</h1>
          <p className="lede">
            In {hungTotal} of his {bigMistakes} biggest mistakes, a piece was left where the opponent could just take it.
            Fix this one habit and the rating climbs. Everything below — the practice puzzles, the course, the road to {PLAYER.target} — starts there.
          </p>
          <div className="hero-cta">
            <button className="btn" onClick={() => go("practice")}>Practice my mistakes</button>
            <button className="btn ghost" onClick={() => go("roadmap")}>See the road to {PLAYER.target}</button>
          </div>
        </div>
        <figure className="hero-board">
          <Board fen={hero.fen} flip={flip} arrows={[uciArrow(heroPlayed, "red"), uciArrow(hero.solution, "green")].filter(Boolean)} />
          <figcaption>
            <span className="key red" /> Played <strong>{hero.played}</strong>, losing the {hero.hung || "piece"}.
            <span className="key green" /> Better was <strong>{hero.best}</strong>.{" "}
            <a href={hero.url} target="_blank" rel="noreferrer">Open game</a>
          </figcaption>
        </figure>
      </section>

      <section className="stats">
        <Stat label="Rapid rating now" value={liveRating ?? rapid.at(-1)?.rating} />
        <Stat label="Best rapid rating" value={best} />
        <Stat label="Record (W / L / D)" value={`${rec.W || 0} / ${rec.L || 0} / ${rec.D || 0}`} />
        <Stat label="Blunders per game" value={s.per_game.blunders.toFixed(1)} note="Goal: under 0.3" />
      </section>

      <section className="block">
        <h2>Rating over time</h2>
        <RatingChart games={rapid} target={PLAYER.target} />
      </section>

      <section className="block">
        <h2>Where the points go</h2>
        <ol className="findings">
          {findings.map((f) => (
            <li key={f.title}>
              <div className="fnum">{f.n}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <button className="link" onClick={() => go("course")}>Week {f.unit} of the course fixes this</button>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="block two">
        <div>
          <h2>When mistakes happen</h2>
          <Bars data={[["Opening (moves 1–10)", s.phase_err.opening], ["Middlegame", s.phase_err.middlegame], ["Endgame", s.phase_err.endgame]]} />
        </div>
        <div>
          <h2>Which pieces got lost</h2>
          <Bars data={["queen", "rook", "bishop", "knight", "pawn"].map((k) => [k[0].toUpperCase() + k.slice(1), s.hung[k] || 0])} />
        </div>
      </section>

      <section className="block">
        <h2>How games end</h2>
        <Bars data={Object.entries(s.endings).sort((a, b) => b[1] - a[1]).map(([k, v]) => [endLabel(k), v])} />
      </section>
    </div>
  );
}

function endLabel(k) {
  const [o, r] = k.split(":");
  if (o === "W") return { checkmated: "Won by checkmate", abandoned: "Won — opponent left", timeout: "Won — opponent ran out of time", resigned: "Won — opponent resigned" }[r] || "Won";
  const word = { L: "Lost", D: "Draw" }[o];
  const how = { checkmated: "by checkmate", abandoned: "by abandoning", timeout: "on time", resigned: "by resignation", stalemate: "by stalemate", repetition: "by repetition", agreed: "by agreement", insufficient: "insufficient material" }[r] || r;
  return `${word} ${how}`;
}

function Stat({ label, value, note }) {
  return (
    <div className="stat">
      <div className="sv">{value}</div>
      <div className="sl">{label}</div>
      {note && <div className="sn">{note}</div>}
    </div>
  );
}

function Bars({ data }) {
  const max = Math.max(...data.map((d) => d[1]), 1);
  return (
    <ul className="bars">
      {data.map(([l, v]) => (
        <li key={l}>
          <span className="bl">{l}</span>
          <span className="bt"><span className="bf" style={{ width: `${(100 * v) / max}%` }} /></span>
          <span className="bv">{v}</span>
        </li>
      ))}
    </ul>
  );
}

function RatingChart({ games, target }) {
  const W = 720, H = 220, P = 30;
  if (games.length < 2) return null;
  const ys = games.map((g) => g.rating);
  const max = target + 50, min = 0;
  const x = (i) => P + (i * (W - 2 * P)) / (games.length - 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min);
  const path = ys.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg className="rchart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Rating from ${ys[0]} to ${ys.at(-1)}, target ${target}`}>
      {[0, 300, 600, 900].map((v) => (
        <g key={v}><line x1={P} x2={W - P} y1={y(v)} y2={y(v)} className="gl" /><text x={4} y={y(v) + 4} className="gt">{v}</text></g>
      ))}
      <line x1={P} x2={W - P} y1={y(target)} y2={y(target)} className="target" />
      <text x={W - P} y={y(target) - 6} textAnchor="end" className="tt">Goal {target}</text>
      <path d={path} className="rl" />
      {games.map((g, i) => (
        <circle key={g.url} cx={x(i)} cy={y(g.rating)} r="3" className={"rd " + g.outcome}><title>{`${fmtDate(g.end)}: ${g.rating} (${g.outcome})`}</title></circle>
      ))}
    </svg>
  );
}

/* ---------------- Games ---------------- */
function Games({ games }) {
  const [sel, setSel] = useState(games[0]?.url);
  const g = games.find((x) => x.url === sel) || games[0];
  return (
    <div className="games">
      <aside className="glist" aria-label="Games">
        {games.map((x) => (
          <button key={x.url} className={`gitem ${x.url === g.url ? "on" : ""}`} onClick={() => setSel(x.url)}>
            <span className={"res " + x.outcome}>{x.outcome}</span>
            <span className="gmeta">
              <span>vs {x.opp} ({x.opp_rating})</span>
              <span className="muted">{fmtDate(x.end)} · {x.color === "white" ? "White" : "Black"}</span>
            </span>
            <span className="gerr" title="Blunders / mistakes">
              {x.blunders > 0 && <b className="cb">{x.blunders}</b>}
              {x.mistakes > 0 && <b className="cm">{x.mistakes}</b>}
            </span>
          </button>
        ))}
      </aside>
      {g && <GameView key={g.url} g={g} />}
    </div>
  );
}

function GameView({ g }) {
  const worstIdx = g.moves.findIndex((m) => m.m && m.s === g.worst?.san && m.f === g.worst?.fen);
  const [i, setI] = useState(worstIdx >= 0 ? worstIdx : 0);
  const m = g.moves[i];
  const fenAfter = useMemo(() => {
    const c = new Chess(m.f);
    try { c.move(m.s); } catch { /* ignore */ }
    return c.fen();
  }, [m]);
  const [showBefore, setShowBefore] = useState(true);
  const fen = showBefore ? m.f : fenAfter;
  const arrows = showBefore ? [uciArrow(m.u, m.c === "good" ? "blue" : "red"), m.c !== "good" ? uciArrow(m.bu, "green") : null].filter(Boolean) : [];

  useEffect(() => {
    const k = (e) => {
      if (e.key === "ArrowRight") setI((v) => Math.min(g.moves.length - 1, v + 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [g]);

  const verdict = {
    blunder: "Blunder — this lost a lot.", mistake: "Mistake — this gave away part of the advantage.",
    inaccuracy: "Inaccuracy — a better move was there.", good: "Fine move.",
  }[m.c];

  return (
    <section className="gview">
      <div className="ghead">
        <h2>{g.outcome === "W" ? "Won" : g.outcome === "L" ? "Lost" : "Drew"} vs {g.opp}</h2>
        <p className="muted">{fmtDate(g.end)} · {g.eco} · <a href={g.url} target="_blank" rel="noreferrer">chess.com</a></p>
      </div>
      <div className="gbody">
        <div>
          <Board fen={fen} flip={g.color === "black"} arrows={arrows} />
          <div className="ctrl">
            <button className="btn ghost small" onClick={() => setI(0)} aria-label="First move">|◀</button>
            <button className="btn ghost small" onClick={() => setI(Math.max(0, i - 1))} aria-label="Previous move">◀</button>
            <button className="btn ghost small" onClick={() => setShowBefore(!showBefore)}>{showBefore ? "Show after move" : "Show before move"}</button>
            <button className="btn ghost small" onClick={() => setI(Math.min(g.moves.length - 1, i + 1))} aria-label="Next move">▶</button>
            {worstIdx >= 0 && <button className="btn small" onClick={() => setI(worstIdx)}>Worst move</button>}
          </div>
        </div>
        <div className="gside">
          <div className={"verdict " + m.c}>
            <p className="vmove">{Math.floor(i / 2) + 1}{i % 2 ? "..." : "."} {m.s} <span className="muted">{m.m ? "(Tuaha)" : "(opponent)"}</span></p>
            <p>{verdict}</p>
            {m.c !== "good" && m.b && <p>Better: <strong>{m.b}</strong> <span className="key green" /></p>}
          </div>
          <EvalGraph evals={g.evals} i={i} onPick={setI} flip={g.color === "black"} />
          <ol className="mlist">
            {g.moves.map((mm, k) => (
              <li key={k} className={`${mm.c} ${k === i ? "on" : ""} ${mm.m ? "me" : ""}`}>
                <button onClick={() => setI(k)}>{k % 2 === 0 && <span className="mn">{k / 2 + 1}.</span>}{mm.s}</button>
              </li>
            ))}
          </ol>
          <p className="legend"><span className="cb">Blunder</span> <span className="cm">Mistake</span> <span className="ci">Inaccuracy</span> · arrow keys step through moves</p>
        </div>
      </div>
    </section>
  );
}

function EvalGraph({ evals, i, onPick, flip }) {
  const W = 400, H = 90;
  if (!evals?.length) return null;
  const n = evals.length;
  const x = (k) => (k * W) / Math.max(1, n - 1);
  const y = (v) => H / 2 - ((flip ? -v : v) / 1500) * (H / 2 - 4);
  const area = `M0,${H / 2} ` + evals.map((v, k) => `L${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(" ") + ` L${W},${H / 2} Z`;
  return (
    <svg className="egraph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Who was better during the game. Above the line means Tuaha was better."
      onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onPick(Math.round(((e.clientX - r.left) / r.width) * (n - 1))); }}>
      <rect width={W} height={H} className="eg-bg" />
      <path d={area} className="eg-area" />
      <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="eg-mid" />
      <line x1={x(i)} x2={x(i)} y1="0" y2={H} className="eg-cur" />
      <text x="6" y="14" className="eg-t">Tuaha better</text>
      <text x="6" y={H - 6} className="eg-t">Opponent better</text>
    </svg>
  );
}

/* ---------------- Practice ---------------- */
function Practice({ puzzles }) {
  const [mode, setMode] = useState("mine");
  return (
    <div className="practice">
      <div className="ptabs" role="tablist">
        <button role="tab" aria-selected={mode === "mine"} className={mode === "mine" ? "on" : ""} onClick={() => setMode("mine")}>My mistakes</button>
        <button role="tab" aria-selected={mode === "live"} className={mode === "live" ? "on" : ""} onClick={() => setMode("live")}>Live themed puzzles</button>
      </div>
      {mode === "mine" ? <MyPuzzles puzzles={puzzles} /> : <LivePuzzles />}
    </div>
  );
}

function MyPuzzles({ puzzles }) {
  const [kind, setKind] = useState("all");
  const [solved, setSolved] = usePersist("solved", []);
  const list = puzzles.filter((p) => kind === "all" || p.kind === kind);
  const unsolved = list.filter((p) => !solved.includes(p.fen));
  const [idx, setIdx] = useState(0);
  const [curFen, setCurFen] = useState(null);
  const pool = unsolved.length ? unsolved : list;
  const p = list.find((x) => x.fen === curFen) || pool[idx % Math.max(1, pool.length)];
  useEffect(() => { if (p && p.fen !== curFen) setCurFen(p.fen); }, [p, curFen]);
  const kinds = ["all", ...Object.keys(KIND).filter((k) => puzzles.some((p) => p.kind === k))];
  const done = list.filter((p) => solved.includes(p.fen)).length;

  return (
    <section className="pz">
      <div className="pzhead">
        <div className="chips" role="group" aria-label="Puzzle type">
          {kinds.map((k) => (
            <button key={k} className={kind === k ? "on" : ""} onClick={() => { setKind(k); setIdx(0); setCurFen(null); }}>
              {k === "all" ? "All" : KIND[k]} <span className="muted">{k === "all" ? puzzles.length : puzzles.filter((p) => p.kind === k).length}</span>
            </button>
          ))}
        </div>
        <p className="muted">{done} of {list.length} solved</p>
      </div>
      {p ? (
        <PuzzleBoard key={p.fen + idx}
          fen={p.fen} solution={[p.solution]}
          prompt={p.kind === "punish" ? "Your opponent just blundered. Find the move that wins." : `In this game you played ${p.played}. Find a better move.`}
          tag={KIND[p.kind]} answer={p.best} link={p.url}
          onSolved={() => setSolved((s) => (s.includes(p.fen) ? s : [...s, p.fen]))}
          onNext={() => { setCurFen(null); setIdx(solved.includes(p.fen) ? idx : idx + 1); }} />
      ) : <p>No puzzles of this type yet.</p>}
    </section>
  );
}

function PuzzleBoard({ fen, solution, prompt, tag, answer, link, onSolved, onNext, flipFor }) {
  const [pos, setPos] = useState(fen);
  const [step, setStep] = useState(0);
  const [state, setState] = useState("play"); // play | wrong | done | shown
  const side = new Chess(fen).turn();
  const flip = (flipFor ?? side) === "b";

  function move(from, to) {
    const want = solution[step];
    const c = new Chess(pos);
    let mv;
    try { mv = c.move({ from, to, promotion: "q" }); } catch { return; }
    if (!mv) return;
    const ok = from + to === want.slice(0, 4) || c.isCheckmate();
    if (!ok) { setState("wrong"); return; }
    let next = step + 1;
    if (next < solution.length) {
      const r = solution[next];
      c.move({ from: r.slice(0, 2), to: r.slice(2, 4), promotion: r[4] || "q" });
      next += 1;
    }
    setPos(c.fen());
    setStep(next);
    if (next >= solution.length || c.isCheckmate()) { setState("done"); onSolved?.(); }
    else setState("play");
  }

  const hint = state === "shown" ? [uciArrow(solution[step], "green")] : [];
  return (
    <div className="pzbody">
      <Board fen={pos} flip={flip} onMove={state === "done" ? undefined : move} arrows={hint} />
      <div className="pzside">
        {tag && <span className="tag">{tag}</span>}
        <p className="pzturn">{side === "w" ? "White" : "Black"} to move</p>
        <p>{prompt}</p>
        {state === "wrong" && <p className="fb bad">Not that one. Look for checks, captures and threats first.</p>}
        {state === "done" && <p className="fb good">Correct{answer ? ` — ${answer}` : ""}.</p>}
        {state === "shown" && <p className="fb">The green arrow shows the move{answer && step === 0 ? `: ${answer}` : ""}.</p>}
        <div className="row">
          {state !== "done" && <button className="btn ghost" onClick={() => setState("shown")}>Show answer</button>}
          {state === "wrong" && <button className="btn ghost" onClick={() => setState("play")}>Try again</button>}
          <button className="btn" onClick={onNext}>Next puzzle</button>
        </div>
        {link && <a className="small-link" href={link} target="_blank" rel="noreferrer">Open the original game</a>}
      </div>
    </div>
  );
}

const LIVE_THEMES = [
  ["hangingPiece", "Hanging pieces"], ["mateIn1", "Mate in 1"], ["fork", "Forks"], ["pin", "Pins"],
  ["mateIn2", "Mate in 2"], ["backRankMate", "Back-rank mate"], ["skewer", "Skewers"],
  ["discoveredAttack", "Discovered attacks"], ["endgame", "Endgames"], ["mix", "Mixed"],
];

function LivePuzzles() {
  const [theme, setTheme] = useState("hangingPiece");
  const [pz, setPz] = useState(null);
  const [err, setErr] = useState(null);
  const [n, setN] = useState(0);
  const [count, setCount] = usePersist("liveSolved", 0);

  useEffect(() => {
    let off = false;
    setPz(null); setErr(null);
    fetch(`/api/puzzle?theme=${theme}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("The puzzle service did not answer"))))
      .then((d) => {
        let fen = d.puzzle.fen;
        if (!fen) {
          const c = new Chess();
          for (const t of d.game.pgn.split(/\s+/)) if (t && !/^\d+\.+$/.test(t)) c.move(t);
          fen = c.fen();
        }
        if (!off) setPz({ fen, solution: d.puzzle.solution, id: d.puzzle.id, rating: d.puzzle.rating });
      })
      .catch((e) => !off && setErr(e.message));
    return () => { off = true; };
  }, [theme, n]);

  return (
    <section className="pz">
      <div className="pzhead">
        <div className="chips" role="group" aria-label="Theme">
          {LIVE_THEMES.map(([k, l]) => <button key={k} className={theme === k ? "on" : ""} onClick={() => setTheme(k)}>{l}</button>)}
        </div>
        <p className="muted">{count} live puzzles solved</p>
      </div>
      {err && <p className="fb bad">{err}. Live puzzles work once the app is deployed on Vercel. Until then, use My mistakes.</p>}
      {!pz && !err && <p className="muted">Loading a fresh puzzle…</p>}
      {pz && (
        <PuzzleBoard key={pz.id} fen={pz.fen} solution={pz.solution}
          prompt={`Find the best move. Puzzle rating ${pz.rating}.`} tag={LIVE_THEMES.find((t) => t[0] === theme)[1]}
          link={`https://lichess.org/training/${pz.id}`} onSolved={() => setCount((c) => c + 1)} onNext={() => setN(n + 1)} />
      )}
    </section>
  );
}

/* ---------------- Openings ---------------- */
function Openings() {
  const s = snapshot.summary;
  const [id, setId] = useState(OPENINGS[0].id);
  const o = OPENINGS.find((x) => x.id === id);
  const [k, setK] = useState(0);
  const pos = useMemo(() => {
    const c = new Chess();
    for (let j = 0; j < k; j++) c.move(o.moves[j]);
    return { fen: c.fen(), last: c.history({ verbose: true }).at(-1) };
  }, [o, k]);
  const note = o.notes[k];

  return (
    <div className="openings">
      <section className="block">
        <h2>What Tuaha plays now</h2>
        <div className="two">
          <div>
            <h3>As White, first two moves</h3>
            <Bars data={s.first_moves.white.map(([m, n]) => [m, n])} />
          </div>
          <div>
            <h3>As Black, first two moves</h3>
            <Bars data={s.first_moves.black.map(([m, n]) => [m, n])} />
          </div>
        </div>
        <p className="note">Moves like g3 or g4 early, or bringing the queen out early, lead to quick losses. The setups below are simple and the same every game.</p>
      </section>
      <section className="block">
        <h2>Your repertoire</h2>
        <div className="chips">
          {OPENINGS.map((x) => <button key={x.id} className={id === x.id ? "on" : ""} onClick={() => { setId(x.id); setK(0); }}>{x.name}</button>)}
        </div>
        <div className="obody">
          <Board fen={pos.fen} flip={o.side === "black"} arrows={pos.last ? [{ from: pos.last.from, to: pos.last.to, color: "blue" }] : []} />
          <div className="oside">
            <p>{o.why}</p>
            <ol className="oline">
              {o.moves.map((m, j) => (
                <li key={j} className={j < k ? "past" : j === k - 1 ? "on" : ""}>
                  <button onClick={() => setK(j + 1)} className={j === k - 1 ? "on" : ""}>{j % 2 === 0 ? `${j / 2 + 1}. ` : ""}{m}</button>
                </li>
              ))}
            </ol>
            <p className="onote">{note || (k === 0 ? "Press Next to play through the moves." : " ")}</p>
            <div className="row">
              <button className="btn ghost" onClick={() => setK(Math.max(0, k - 1))}>Back</button>
              <button className="btn" onClick={() => setK(Math.min(o.moves.length, k + 1))} disabled={k >= o.moves.length}>Next move</button>
            </div>
            <p className="ur">{o.ur}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Course ---------------- */
function Course() {
  const [done, setDone] = usePersist("weeks", []);
  const [open, setOpen] = useState(2);
  const [q, setQ] = useState("");
  const terms = GLOSSARY.filter((t) => (t.term + t.means).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="course">
      <section className="block">
        <h2>8-week beginner course</h2>
        <p className="note">One unit per week, in order. Each one is built around a problem found in Tuaha's games. Mark a week done when the practice task is finished.</p>
        <ol className="units">
          {COURSE.map((u) => (
            <li key={u.week} className={done.includes(u.week) ? "done" : ""}>
              <button className="uhead" aria-expanded={open === u.week} onClick={() => setOpen(open === u.week ? null : u.week)}>
                <span className="uw">Week {u.week}</span>
                <span className="ut">{u.title}</span>
                <span className="ug muted">{u.goal}</span>
              </button>
              {open === u.week && (
                <div className="ubody">
                  <p className="why"><strong>Why this matters for Tuaha:</strong> {u.why}</p>
                  <ul>{u.ideas.map((x) => <li key={x}>{x}</li>)}</ul>
                  <p className="ur">{u.ur}</p>
                  <p><strong>Practice:</strong> {u.practice.text}</p>
                  <p className="muted">New words: {u.terms.join(", ")}</p>
                  <label className="check">
                    <input type="checkbox" checked={done.includes(u.week)} onChange={(e) => setDone(e.target.checked ? [...done, u.week] : done.filter((w) => w !== u.week))} />
                    Week {u.week} done
                  </label>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
      <section className="block">
        <h2>Chess words, explained</h2>
        <input className="search" type="search" placeholder="Search a word, e.g. fork" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search glossary" />
        <dl className="gloss">
          {terms.map((t) => (
            <div key={t.term}><dt>{t.term}</dt><dd>{t.means}<span className="ur">{t.ur}</span></dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/* ---------------- Roadmap ---------------- */
function Roadmap({ live }) {
  const [ticks, setTicks] = usePersist("tasks", {});
  const now = live.stats?.chess_rapid?.last?.rating ?? snapshot.games.at(-1)?.rating ?? 214;
  const start = 214;
  const progress = Math.max(0, Math.min(100, pct(now - start, PLAYER.target - start)));
  return (
    <div className="roadmap">
      <section className="block">
        <h2>Road to {PLAYER.target}</h2>
        <div className="track" role="img" aria-label={`Rating ${now}, ${progress}% of the way from ${start} to ${PLAYER.target}`}>
          <div className="track-fill" style={{ width: `${progress}%` }} />
          {ROADMAP.map((p) => <span key={p.phase} className="track-stop" style={{ left: `${pct(p.range[1] - start, PLAYER.target - start)}%` }}>{p.range[1]}</span>)}
        </div>
        <p className="note">Now <strong>{now}</strong>. About 6 months at 30–45 minutes a day. The rating will go up and down — follow the habits, not the number.</p>
      </section>
      <ol className="phases">
        {ROADMAP.map((p) => {
          const active = now >= p.range[0] && now < p.range[1];
          return (
            <li key={p.phase} className={active ? "active" : now >= p.range[1] ? "past" : ""}>
              <div className="ph-head">
                <span className="ph-range">{p.range[0]} → {p.range[1]}</span>
                <h3>{p.title}</h3>
                <span className="muted">{p.weeks}{active ? " · you are here" : ""}</span>
              </div>
              <p><strong>Focus:</strong> {p.focus}</p>
              <p><strong>Done when:</strong> {p.target}</p>
              <ul className="tasks">
                {p.tasks.map((t) => {
                  const key = p.phase + ":" + t;
                  return (
                    <li key={t}><label className="check">
                      <input type="checkbox" checked={!!ticks[key]} onChange={(e) => setTicks({ ...ticks, [key]: e.target.checked })} /> {t}
                    </label></li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
      <section className="block">
        <h2>Every day, 45 minutes</h2>
        <ol className="daily">
          {DAILY.map((d) => <li key={d.what}><span className="dm">{d.min} min</span>{d.what}</li>)}
        </ol>
        <p className="ur">Roz thora, lekin roz. 20 tez games se behtar hai 1 game jis mein poora waqt socha ho.</p>
      </section>
    </div>
  );
}
