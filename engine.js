const NATIONS = [
  { id: 'bra', name: 'Brazil', iso: 'br', depth: 3 },
  { id: 'arg', name: 'Argentina', iso: 'ar', depth: 2 },
  { id: 'fra', name: 'France', iso: 'fr', depth: 3 },
  { id: 'ger', name: 'Germany', iso: 'de', depth: 3 },
  { id: 'esp', name: 'Spain', iso: 'es', depth: 2 },
  { id: 'gbr', name: 'United Kingdom', iso: 'gb', depth: 2 },
  { id: 'ita', name: 'Italy', iso: 'it', depth: 2 },
  { id: 'usa', name: 'USA', iso: 'us', depth: 2 },
  { id: 'jpn', name: 'Japan', iso: 'jp', depth: 2 },
  { id: 'ind', name: 'India', iso: 'in', depth: 3 },
  { id: 'kor', name: 'South Korea', iso: 'kr', depth: 2 },
  { id: 'nga', name: 'Nigeria', iso: 'ng', depth: 2 },
  { id: 'mex', name: 'Mexico', iso: 'mx', depth: 2 },
  { id: 'aus', name: 'Australia', iso: 'au', depth: 2 },
  { id: 'nld', name: 'Netherlands', iso: 'nl', depth: 2 },
  { id: 'can', name: 'Canada', iso: 'ca', depth: 2 },
];

const DEFAULT_GROUPS = {
  A: ['bra', 'ger', 'jpn', 'nga'],
  B: ['arg', 'fra', 'ind', 'mex'],
  C: ['esp', 'usa', 'kor', 'aus'],
  D: ['gbr', 'ita', 'nld', 'can'],
};

const GROUPS = {
  A: [...DEFAULT_GROUPS.A],
  B: [...DEFAULT_GROUPS.B],
  C: [...DEFAULT_GROUPS.C],
  D: [...DEFAULT_GROUPS.D],
};

function shuffleArray(items, rng = Math.random) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function applyGroups(next) {
  for (const letter of ['A', 'B', 'C', 'D']) {
    GROUPS[letter] = next[letter].slice();
  }
  return GROUPS;
}

function resetGroups() {
  return applyGroups(DEFAULT_GROUPS);
}

/** Fisher–Yates shuffle of all 16 nations into groups A–D (4 each). */
function shuffleGroups(rng = Math.random) {
  const ids = shuffleArray(NATIONS.map((n) => n.id), rng);
  return applyGroups({
    A: ids.slice(0, 4),
    B: ids.slice(4, 8),
    C: ids.slice(8, 12),
    D: ids.slice(12, 16),
  });
}

const PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

function nationById(id) {
  return NATIONS.find((n) => n.id === id);
}

function roundRobinPairings(teams) {
  const games = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const swap = (i + j) % 2 === 0;
      games.push({
        white: swap ? teams[j] : teams[i],
        black: swap ? teams[i] : teams[j],
      });
    }
  }
  return games;
}

function createStandings(ids) {
  const standings = {};
  for (const id of ids) {
    standings[id] = {
      id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      gf: 0,
      ga: 0,
    };
  }
  return standings;
}

function applyMatchResult(standings, white, black, result) {
  const w = standings[white];
  const b = standings[black];
  w.played += 1;
  b.played += 1;
  if (result === '1-0') {
    w.won += 1;
    w.points += 3;
    b.lost += 1;
    w.gf += 1;
    b.ga += 1;
  } else if (result === '0-1') {
    b.won += 1;
    b.points += 3;
    w.lost += 1;
    b.gf += 1;
    w.ga += 1;
  } else {
    w.drawn += 1;
    b.drawn += 1;
    w.points += 1;
    b.points += 1;
  }
}

function headToHeadPoints(a, b, results) {
  let pts = 0;
  for (const r of results) {
    if (
      (r.white === a && r.black === b) ||
      (r.white === b && r.black === a)
    ) {
      if (r.result === '1/2-1/2') pts += 1;
      else if (r.result === '1-0' && r.white === a) pts += 3;
      else if (r.result === '0-1' && r.black === a) pts += 3;
    }
  }
  return pts;
}

function sonnebornBerger(id, standings, results) {
  let sb = 0;
  for (const r of results) {
    let opponent = null;
    let score = 0;
    if (r.white === id) {
      opponent = r.black;
      if (r.result === '1-0') score = 1;
      else if (r.result === '1/2-1/2') score = 0.5;
    } else if (r.black === id) {
      opponent = r.white;
      if (r.result === '0-1') score = 1;
      else if (r.result === '1/2-1/2') score = 0.5;
    }
    if (opponent) sb += score * standings[opponent].points;
  }
  return sb;
}

function rankGroup(standings, results) {
  const rows = Object.values(standings).map((row) => ({
    ...row,
    sb: sonnebornBerger(row.id, standings, results),
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const h2h =
      headToHeadPoints(b.id, a.id, results) -
      headToHeadPoints(a.id, b.id, results);
    if (h2h !== 0) return h2h;
    if (b.sb !== a.sb) return b.sb - a.sb;
    return a.id.localeCompare(b.id);
  });

  return rows;
}

function getQualifiers(groupResults) {
  const q = {};
  for (const letter of ['A', 'B', 'C', 'D']) {
    const ranked = groupResults[letter].ranked;
    q[`${letter}1`] = ranked[0].id;
    q[`${letter}2`] = ranked[1].id;
  }
  return q;
}

function knockoutFixtures(q) {
  return [
    { round: 'QF', white: q.A1, black: q.B2, label: 'A1 vs B2' },
    { round: 'QF', white: q.B1, black: q.A2, label: 'B1 vs A2' },
    { round: 'QF', white: q.C1, black: q.D2, label: 'C1 vs D2' },
    { round: 'QF', white: q.D1, black: q.C2, label: 'D1 vs C2' },
  ];
}

function nextKnockoutRound(winners, roundName) {
  const fixtures = [];
  for (let i = 0; i < winners.length; i += 2) {
    fixtures.push({
      round: roundName,
      white: winners[i],
      black: winners[i + 1],
      label: `${roundName} ${i / 2 + 1}`,
    });
  }
  return fixtures;
}

function squareIndex(square, color) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const idx = (7 - rank) * 8 + file;
  return color === 'w' ? idx : 63 - idx;
}

function evaluateBoard(chess) {
  const board = chess.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const sq = String.fromCharCode(97 + f) + (8 - r);
      const base = PIECE_VALUE[piece.type] || 0;
      const table = PST[piece.type] || PST.p;
      const pst = table[squareIndex(sq, piece.color)];
      const value = base + pst;
      score += piece.color === 'w' ? value : -value;
    }
  }
  return score;
}

function orderMoves(moves) {
  return moves.slice().sort((a, b) => {
    const ac = a.captured ? PIECE_VALUE[a.captured] : 0;
    const bc = b.captured ? PIECE_VALUE[b.captured] : 0;
    return bc - ac;
  });
}

function isCheckmate(chess) {
  return typeof chess.isCheckmate === 'function'
    ? chess.isCheckmate()
    : chess.in_checkmate();
}

function isDraw(chess) {
  return typeof chess.isDraw === 'function' ? chess.isDraw() : chess.in_draw();
}

function isGameOver(chess) {
  return typeof chess.isGameOver === 'function'
    ? chess.isGameOver()
    : chess.game_over();
}

function isCheck(chess) {
  return typeof chess.isCheck === 'function' ? chess.isCheck() : chess.in_check();
}

function minimax(chess, depth, alpha, beta, maximizing, deadline) {
  if (Date.now() > deadline) {
    return evaluateBoard(chess);
  }
  if (depth === 0) return evaluateBoard(chess);
  if (isCheckmate(chess)) return maximizing ? -100000 - depth : 100000 + depth;
  if (isDraw(chess)) return 0;

  const moves = orderMoves(chess.moves({ verbose: true }));
  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const val = minimax(chess, depth - 1, alpha, beta, false, deadline);
      chess.undo();
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const move of moves) {
    chess.move(move);
    const val = minimax(chess, depth - 1, alpha, beta, true, deadline);
    chess.undo();
    if (val < best) best = val;
    if (val < beta) beta = val;
    if (beta <= alpha) break;
  }
  return best;
}

function chooseBotMove(chess, depth = 2, rng = Math.random) {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const deadline = Date.now() + 80;
  const maximizing = chess.turn() === 'w';
  let bestScore = maximizing ? -Infinity : Infinity;
  const candidates = [];

  for (const move of orderMoves(moves)) {
    chess.move(move);
    let score;
    if (isCheckmate(chess)) {
      score = maximizing ? 100000 : -100000;
    } else if (isDraw(chess)) {
      score = 0;
    } else {
      score = minimax(chess, Math.max(0, depth - 1), -Infinity, Infinity, !maximizing, deadline);
    }
    chess.undo();
    score += (rng() - 0.5) * 8;

    const better = maximizing ? score > bestScore : score < bestScore;
    if (better) {
      bestScore = score;
      candidates.length = 0;
      candidates.push(move);
    } else if (Math.abs(score - bestScore) < 0.01) {
      candidates.push(move);
    }
  }

  const pick = candidates[Math.floor(rng() * candidates.length)] || moves[0];
  return pick;
}

function resolveChessCtor(options = {}) {
  if (options.Chess) return options.Chess;
  if (typeof globalThis.Chess === 'function') return globalThis.Chess;
  throw new Error('Chess constructor not available');
}

function gameResult(chess) {
  if (isCheckmate(chess)) return chess.turn() === 'w' ? '0-1' : '1-0';
  if (isDraw(chess) || isGameOver(chess)) return '1/2-1/2';
  return null;
}

function playAutomatedGame(whiteNation, blackNation, options = {}) {
  const ChessCtor = resolveChessCtor(options);
  const chess = new ChessCtor();
  const rng = options.rng || Math.random;
  const maxPlies = options.maxPlies || 200;
  const moves = [];
  let plies = 0;

  while (!isGameOver(chess) && plies < maxPlies) {
    const depth = chess.turn() === 'w' ? whiteNation.depth : blackNation.depth;
    const move = chooseBotMove(chess, depth, rng);
    if (!move) break;
    const played = chess.move(move);
    moves.push({
      san: played.san,
      from: played.from,
      to: played.to,
      color: played.color,
      flags: played.flags,
      captured: played.captured || null,
      promotion: played.promotion || null,
    });
    plies += 1;
  }

  let result = gameResult(chess);
  if (!result) result = '1/2-1/2';

  return {
    result,
    moves,
    fen: chess.fen(),
    white: whiteNation.id,
    black: blackNation.id,
  };
}

function buildGroupSchedule() {
  const schedule = [];
  for (const letter of ['A', 'B', 'C', 'D']) {
    const pairings = roundRobinPairings(GROUPS[letter]);
    for (const p of pairings) {
      schedule.push({
        stage: 'group',
        group: letter,
        white: p.white,
        black: p.black,
        label: `GROUP ${letter}`,
      });
    }
  }
  return schedule;
}

function winnerOf(result, white, black) {
  if (result === '1-0') return white;
  if (result === '0-1') return black;
  return null;
}

const FlagCupEngine = {
  NATIONS,
  GROUPS,
  DEFAULT_GROUPS,
  nationById,
  roundRobinPairings,
  createStandings,
  applyMatchResult,
  rankGroup,
  getQualifiers,
  knockoutFixtures,
  nextKnockoutRound,
  chooseBotMove,
  playAutomatedGame,
  buildGroupSchedule,
  shuffleGroups,
  resetGroups,
  shuffleArray,
  winnerOf,
  gameResult,
  evaluateBoard,
  isCheckmate,
  isDraw,
  isGameOver,
  isCheck,
};

export {
  NATIONS,
  GROUPS,
  DEFAULT_GROUPS,
  nationById,
  roundRobinPairings,
  createStandings,
  applyMatchResult,
  rankGroup,
  getQualifiers,
  knockoutFixtures,
  nextKnockoutRound,
  chooseBotMove,
  playAutomatedGame,
  buildGroupSchedule,
  shuffleGroups,
  resetGroups,
  shuffleArray,
  winnerOf,
  gameResult,
  evaluateBoard,
  isCheckmate,
  isDraw,
  isGameOver,
  isCheck,
};

if (typeof globalThis !== 'undefined') {
  globalThis.FlagCupEngine = FlagCupEngine;
}
