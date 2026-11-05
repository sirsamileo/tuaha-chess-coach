// All teaching content: course units, glossary, opening repertoire and the road to 900.
// Written for a complete beginner. "ur" lines are Roman Urdu reminders.

export const PLAYER = { username: "tuahaat7", name: "Tuaha", target: 900 };

export const GLOSSARY = [
  { term: "Rank", means: "A row across the board (1 to 8).", ur: "Board ki horizontal line." },
  { term: "File", means: "A column up the board (a to h).", ur: "Board ki vertical line." },
  { term: "Diagonal", means: "A slanted line of same-coloured squares. Bishops and the queen move on these.", ur: "Tirchhi line." },
  { term: "Check", means: "The king is being attacked. You must deal with it on your very next move.", ur: "Badshah par hamla — foran bachao." },
  { term: "Checkmate", means: "The king is in check and has no way out. The game ends.", ur: "Badshah ke paas koi rasta nahi — game khatam." },
  { term: "Stalemate", means: "The player to move is not in check but has no legal move. It is a draw, even if one side is far ahead.", ur: "Jeeta hua game bhi draw ho jata hai — dhyan se." },
  { term: "Hanging piece", means: "A piece that can be captured and nobody is protecting it. Free material for the opponent.", ur: "Bina guard ka piece — muft mein chala jata hai." },
  { term: "Defended", means: "Another of your pieces could recapture if this piece is taken.", ur: "Agar wo le, to tum wapas le sakte ho." },
  { term: "Blunder", means: "A very bad move that loses a lot, often a piece or the game.", ur: "Bari ghalti." },
  { term: "Material", means: "The total value of your pieces: pawn 1, knight 3, bishop 3, rook 5, queen 9.", ur: "Pieces ki total value." },
  { term: "Trade", means: "You capture a piece and they capture one back of similar value.", ur: "Barabar ka len-den." },
  { term: "Development", means: "Moving your knights and bishops off the back row so they can join the game.", ur: "Pieces ko bahar nikalna." },
  { term: "Castling", means: "One special move: the king goes two squares toward a rook and the rook jumps over. Keeps the king safe.", ur: "Badshah ko kone mein mehfooz karna." },
  { term: "Center", means: "The four middle squares (d4, e4, d5, e5). Pieces there control more of the board.", ur: "Beech ke chaar khane." },
  { term: "Tempo", means: "One move of time. Wasting tempo = making moves that do nothing.", ur: "Ek move ka waqt." },
  { term: "Tactic", means: "A short sequence of moves that wins something by force.", ur: "Chhoti chaal jo kuch jita de." },
  { term: "Fork", means: "One piece attacks two pieces at the same time. Knights are great at this.", ur: "Ek piece, do shikaar." },
  { term: "Pin", means: "A piece cannot move because a more valuable piece is behind it.", ur: "Piece hil nahi sakta, peeche bara piece hai." },
  { term: "Skewer", means: "Like a pin but backwards: the valuable piece is in front, it moves, and the one behind is taken.", ur: "Ulta pin." },
  { term: "Discovered attack", means: "Moving one piece uncovers an attack by another piece behind it.", ur: "Ek piece hata, peeche wala hamla kare." },
  { term: "Back-rank mate", means: "Checkmate on the last row when the king is trapped behind its own pawns.", ur: "Apne pawns ke peeche phansa badshah." },
  { term: "Promotion", means: "A pawn that reaches the last row becomes a queen (or another piece).", ur: "Pawn aakhri line par pohnch kar queen ban jata hai." },
  { term: "Opposition", means: "In king-and-pawn endings, kings facing each other with one square between. Whoever does NOT have to move usually wins the fight.", ur: "Badshah aamne saamne." },
  { term: "Blunder check", means: "Before every move: Checks? Captures? Threats? Is everything I own guarded?", ur: "Har move se pehle 3 sawal." },
  { term: "Eval / evaluation", means: "The engine's score. +1 means White is about a pawn better, −3 means Black is about a piece better.", ur: "Engine ka score." },
  { term: "Engine", means: "A chess computer (here: Stockfish) that finds the best moves.", ur: "Chess ka computer." },
  { term: "Opening", means: "The first ~10 moves, when you develop pieces and castle.", ur: "Shuru ke moves." },
  { term: "Middlegame", means: "After development, when pieces fight and attacks happen.", ur: "Beech ka game." },
  { term: "Endgame", means: "When most pieces are gone. Kings become strong fighters.", ur: "Aakhri hissa — badshah ko istemal karo." },
];

export const COURSE = [
  {
    week: 1, title: "Know your pieces",
    goal: "Know what every piece is worth and how the game ends.",
    why: "Many lost games came from trading a big piece for a small one without noticing.",
    ideas: [
      "Values: pawn 1, knight 3, bishop 3, rook 5, queen 9. The king can never be traded.",
      "Only take a piece if what you get is worth at least what you might lose back.",
      "Learn the difference between checkmate (win) and stalemate (draw).",
    ],
    ur: "Queen 9 hai, knight 3 — queen de kar knight lena 6 point ka nuksan hai.",
    practice: { text: "Play 3 rapid games and before each capture say out loud what you win and what you could lose back.", theme: "short" },
    terms: ["Rank", "File", "Diagonal", "Material", "Trade", "Check", "Checkmate", "Stalemate"],
  },
  {
    week: 2, title: "Stop giving pieces away",
    goal: "Cut hung pieces in half. This one habit is worth hundreds of rating points.",
    why: "In 78 of Tuaha's 117 big mistakes, a piece was left unguarded. The queen was lost this way 21 times.",
    ideas: [
      "Before every move ask three questions: Can they check me? Can they capture something? What are they threatening?",
      "After you pick a move, look at the square you are moving to. Can it be taken? Who protects it?",
      "Look at what your move leaves behind. Did that piece protect something?",
    ],
    ur: "Move karne se pehle 5 second ruko: kya mera koi piece muft mein ja sakta hai?",
    practice: { text: "Solve every 'Protect' puzzle from your own games, then 15 hanging-piece puzzles.", theme: "hangingPiece" },
    terms: ["Hanging piece", "Defended", "Blunder", "Blunder check"],
  },
  {
    week: 3, title: "A safe opening plan",
    goal: "Reach move 10 with pieces out and the king castled, every game.",
    why: "Most of Tuaha's mistakes happen in the first 10 moves. He castled in only 11 of 55 games, usually around move 14.",
    ideas: [
      "Move 1: put a pawn in the center (e4 as White, e5 against e4).",
      "Bring out knights before bishops. Do not move the same piece twice without a reason.",
      "Keep the queen at home until your knights and bishops are out.",
      "Castle by move 8–10.",
    ],
    ur: "Center, pieces bahar, castle — phir attack ka socho.",
    practice: { text: "Learn the 3 lines in the Openings tab. Play them in your next 10 games.", theme: "opening" },
    terms: ["Opening", "Development", "Castling", "Center", "Tempo"],
  },
  {
    week: 4, title: "Tactics I: fork, pin, skewer",
    goal: "Spot one-move tricks for you and against you.",
    why: "Opponents left pieces hanging 55 times; 25 of those gifts were not taken.",
    ideas: [
      "Fork: look for a square where your knight attacks two things at once.",
      "Pin: line up a bishop or rook with two enemy pieces on the same line.",
      "Always check: is there a free piece to take right now?",
    ],
    ur: "Har move par dekho — kya koi piece muft mein mil raha hai?",
    practice: { text: "20 fork puzzles and 20 pin puzzles. Then your own 'Punish' puzzles.", theme: "fork" },
    terms: ["Tactic", "Fork", "Pin", "Skewer"],
  },
  {
    week: 5, title: "Tactics II: hidden attacks",
    goal: "See attacks that come from moving another piece.",
    why: "Several losses started with a discovered attack against the queen.",
    ideas: [
      "Discovered attack: when a piece moves, check what it uncovers behind it.",
      "Remove the defender: capture the piece that guards their piece.",
      "Look at every enemy piece that points at your king or queen.",
    ],
    ur: "Jo piece hatta hai, us ke peeche kya khulta hai?",
    practice: { text: "20 discovered-attack puzzles, 10 mixed puzzles a day.", theme: "discoveredAttack" },
    terms: ["Discovered attack"],
  },
  {
    week: 6, title: "Checkmate patterns",
    goal: "Know the 5 most common mates so you can give them and avoid them.",
    why: "24 of Tuaha's losses ended in checkmate, and he missed a forced mate 6 times.",
    ideas: [
      "Back-rank mate: make a small escape square (luft) for your king, like h3 or h6.",
      "Queen-and-king mate: bring the king to support the queen.",
      "Two rooks ladder mate: rooks take turns pushing the king to the edge.",
      "Stop the 4-move mate: after 1.e4 e5 2.Bc4 Nc6 3.Qh5, play 3...g6.",
    ],
    ur: "Badshah ke liye ek khidki (escape square) bana kar rakho.",
    practice: { text: "30 mate-in-1, then 15 mate-in-2 puzzles. Do the back-rank set.", theme: "mateIn1" },
    terms: ["Back-rank mate"],
  },
  {
    week: 7, title: "Simple endgames",
    goal: "Win when you are ahead. Never stalemate a won game.",
    why: "One game with a big lead ended in stalemate. Winning positions must become wins.",
    ideas: [
      "King + queen vs king: push the king to the edge, then mate. Always leave it a square to move.",
      "King + rook vs king: same idea, use your king to help.",
      "Push a passed pawn and walk your king in front of it.",
    ],
    ur: "Aakhir mein badshah ko bhi lara do. Aur stalemate se bacho.",
    practice: { text: "Practice K+Q vs K and K+R vs K against the computer until you mate in under 20 moves.", theme: "endgame" },
    terms: ["Endgame", "Promotion", "Opposition"],
  },
  {
    week: 8, title: "Use your clock and review",
    goal: "Spend your time. Learn from every loss.",
    why: "Tuaha spends about 10 seconds per move in 10-minute games and finishes with around 6 minutes unused. 16 blunders came in under 5 seconds.",
    ideas: [
      "In a 10-minute game you have about 20 seconds per move. Use them on important moves.",
      "Slow down when the opponent captures or checks — that is when blunders happen.",
      "After each game, open it in the My games tab and find your worst move.",
    ],
    ur: "Jaldi nahi hai. Har important move par 20 second socho.",
    practice: { text: "Play 15+10 games this week. After each loss, review it here.", theme: "mix" },
    terms: ["Eval / evaluation", "Engine", "Middlegame"],
  },
];

export const OPENINGS = [
  {
    id: "white", side: "white", name: "As White: the Italian Game",
    why: "Simple, natural moves. Center pawn, knights and bishops out, castle early.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3", "d6", "O-O", "O-O"],
    notes: {
      1: "Take the center.", 3: "Knight out, attacks e5.", 5: "Bishop aims at f7, Black's weak spot.",
      7: "Prepares d4 later.", 9: "Protects e4.", 11: "King is safe. Now make a plan.",
    },
    ur: "e4, Nf3, Bc4, c3, d3, castle — yaad kar lo.",
  },
  {
    id: "black-e4", side: "black", name: "As Black against 1.e4",
    why: "Copy the center, develop and castle. Same ideas as the Italian.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "d3", "Be7", "O-O", "O-O"],
    notes: {
      2: "Answer the center.", 4: "Protect e5.", 6: "Develop and attack e4.",
      8: "Quiet bishop, gets ready to castle.", 10: "Castled. Safe king.",
    },
    ur: "e5, Nc6, Nf6, Be7, castle.",
  },
  {
    id: "black-qh5", side: "black", name: "Stop the early-queen trick",
    why: "Players at this level often try a 4-move mate with Qh5 and Bc4.",
    moves: ["e4", "e5", "Bc4", "Nc6", "Qh5", "g6", "Qf3", "Nf6", "Ne2", "Bg7"],
    notes: {
      5: "Threat: Qxf7 checkmate!", 6: "Block with g6 — the queen is attacked.", 7: "Again threatens f7.",
      8: "Knight covers f7 and develops.", 10: "Bishop out, castle next. White's queen wasted time.",
    },
    ur: "Qh5 aaye to g6, phir Nf6. Muft mein mate mat khao.",
  },
  {
    id: "black-d4", side: "black", name: "As Black against 1.d4",
    why: "A solid setup that is the same almost every game.",
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4", "e6", "e3", "Bd6", "Bd3", "O-O"],
    notes: { 2: "Meet the center.", 4: "Develop.", 6: "Opens a path for the bishop.", 8: "Challenge White's bishop.", 10: "Castled." },
    ur: "d5, Nf6, e6, Bd6, castle.",
  },
];

export const ROADMAP = [
  {
    phase: 1, range: [214, 400], weeks: "Weeks 1–4", title: "Stop the bleeding",
    focus: "No more free pieces.",
    target: "Under 0.5 blunders per game (now: 1.0).",
    tasks: [
      "Do the 3-question blunder check before every move",
      "Solve all of your own Protect puzzles twice",
      "15 hanging-piece puzzles every day",
      "Only play 10-minute rapid (no blitz, no bullet)",
      "Never abandon a game — play it out and learn",
    ],
  },
  {
    phase: 2, range: [400, 600], weeks: "Weeks 5–10", title: "Good starts, sharp eyes",
    focus: "Same opening every game, castle by move 10, basic tactics.",
    target: "Castle before move 10 in 8 of 10 games.",
    tasks: [
      "Play the Italian as White and e5 / d5 setups as Black",
      "20 fork / pin / skewer puzzles a day",
      "30 mate-in-1 and 15 mate-in-2 puzzles",
      "Take every free piece the opponent leaves",
    ],
  },
  {
    phase: 3, range: [600, 750], weeks: "Weeks 11–18", title: "Convert and punish",
    focus: "Turn winning positions into wins.",
    target: "Win 7 of 10 games where you are a piece up.",
    tasks: [
      "Master K+Q vs K and K+R vs K mates",
      "Switch to 15+10 games to think longer",
      "Review every loss in the My games tab",
      "Solve your Punish puzzles until they are easy",
    ],
  },
  {
    phase: 4, range: [750, 900], weeks: "Weeks 19–26", title: "Think in plans",
    focus: "Ask 'what does my opponent want?' every move.",
    target: "Rapid rating 900 and puzzle rating around 1200.",
    tasks: [
      "Before each move, name the opponent's threat",
      "Play 3–4 serious games a week, not 20 fast ones",
      "Learn 2 more lines in each opening",
      "Analyze one master game a week (slow, with notes)",
    ],
  },
];

export const DAILY = [
  { min: 10, what: "Your own mistakes (Practice → My mistakes)" },
  { min: 10, what: "Themed live puzzles for this week's unit" },
  { min: 20, what: "One 10-minute rapid game, using all your time" },
  { min: 5, what: "Review that game here and find the worst move" },
];
