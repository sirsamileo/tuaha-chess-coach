# Tuaha's Chess Coach

A personal coaching app for chess.com player **tuahaat7**: game report, every mistake replayed with the engine's better move, practice puzzles built from his own blunders, live themed puzzles from Lichess, an 8-week beginner course with a glossary, and a road map from 214 to 900.

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Vite** (auto-detected). Click **Deploy**.
3. Done. The `/api` folder becomes serverless functions automatically.

Or with the CLI: `npm i -g vercel` then `vercel` inside this folder.

## Run locally
```
npm install
npm run dev
```
Live Lichess puzzles need the `/api` functions, so they only work on Vercel (or with `vercel dev`).

## What is live
- On every visit the app fetches the current rating and recent games from chess.com.
- Games newer than the built-in snapshot show an **Analyze new games** button. Stockfish runs in the browser, and new mistakes are added to the practice puzzles (saved in the browser).
- Live themed puzzles come from Lichess via `/api/puzzle?theme=…`.
- Progress (solved puzzles, course weeks, road-map tasks) is saved in the browser.

## Use it for another player
Change `username` in `src/content.js`. The built-in snapshot (`src/data/snapshot.json`) is Tuaha's; for another player, the live analyzer adds their new games (add `?since=0` to the URL to analyze their last two months).

## Files
- `src/App.jsx` – all screens
- `src/content.js` – course, glossary, openings, road map (edit text here)
- `src/live.js` – chess.com fetch + in-browser Stockfish
- `src/data/snapshot.json` – Stockfish (depth 11) analysis of 55 games, Nov 2026
- `api/chesscom.js`, `api/puzzle.js` – Vercel functions
- `public/engine/` – Stockfish 10 (GPL)
