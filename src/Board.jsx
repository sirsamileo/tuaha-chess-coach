import { useState } from "react";
import { Chess } from "chess.js";

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const FILES = "abcdefgh";

function sqXY(sq, flip) {
  const f = FILES.indexOf(sq[0]);
  const r = 8 - Number(sq[1]);
  return flip ? [7 - f + 0.5, 7 - r + 0.5] : [f + 0.5, r + 0.5];
}

export default function Board({ fen, flip = false, onMove, arrows = [], marks = {}, size }) {
  const [sel, setSel] = useState(null);
  const game = new Chess(fen);
  const board = game.board();
  const legal = sel ? game.moves({ square: sel, verbose: true }).map((m) => m.to) : [];

  function click(sq) {
    if (!onMove) return;
    const p = game.get(sq);
    if (sel && legal.includes(sq)) {
      onMove(sel, sq);
      setSel(null);
      return;
    }
    if (p && p.color === game.turn()) setSel(sq === sel ? null : sq);
    else setSel(null);
  }

  const rows = [...Array(8).keys()];
  const cells = [];
  for (const ri of rows) {
    for (const fi of rows) {
      const r = flip ? 7 - ri : ri;
      const f = flip ? 7 - fi : fi;
      const sq = FILES[f] + (8 - r);
      const piece = board[r][f];
      const dark = (r + f) % 2 === 1;
      const mark = marks[sq];
      cells.push(
        <button
          key={sq}
          type="button"
          className={`sq ${dark ? "d" : "l"} ${sel === sq ? "sel" : ""} ${mark ? "m-" + mark : ""}`}
          onClick={() => click(sq)}
          aria-label={sq + (piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : "")}
          tabIndex={onMove ? 0 : -1}
        >
          {fi === 0 && <span className="coord r">{8 - r}</span>}
          {ri === 7 && <span className="coord f">{FILES[f]}</span>}
          {legal.includes(sq) && <span className={piece ? "hint cap" : "hint"} />}
          {piece && <span className={`pc ${piece.color}`}>{GLYPH[piece.type]}{"︎"}</span>}
        </button>
      );
    }
  }

  return (
    <div className="board" style={size ? { width: size } : undefined}>
      <div className="grid">{cells}</div>
      <svg className="arrows" viewBox="0 0 8 8" aria-hidden="true">
        <defs>
          {["red", "green", "blue"].map((c) => (
            <marker key={c} id={"ah-" + c} markerWidth="3" markerHeight="3" refX="1.6" refY="1.5" orient="auto">
              <path d="M0,0 L3,1.5 L0,3 z" className={"ah " + c} />
            </marker>
          ))}
        </defs>
        {arrows.map((a, i) => {
          const [x1, y1] = sqXY(a.from, flip);
          const [x2, y2] = sqXY(a.to, flip);
          const len = Math.hypot(x2 - x1, y2 - y1);
          const k = (len - 0.35) / len;
          return (
            <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k}
              className={"arrow " + a.color} markerEnd={`url(#ah-${a.color})`} />
          );
        })}
      </svg>
    </div>
  );
}

export function uciArrow(uci, color) {
  return uci ? { from: uci.slice(0, 2), to: uci.slice(2, 4), color } : null;
}
