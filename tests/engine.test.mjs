import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import {
  NATIONS,
  GROUPS,
  roundRobinPairings,
  createStandings,
  applyMatchResult,
  rankGroup,
  getQualifiers,
  knockoutFixtures,
  chooseBotMove,
  playAutomatedGame,
  shuffleGroups,
  resetGroups,
} from '../engine.js';

describe('nations and groups', () => {
  it('has exactly 16 nations with iso codes', () => {
    assert.equal(NATIONS.length, 16);
    for (const n of NATIONS) {
      assert.ok(n.id);
      assert.ok(n.name);
      assert.ok(n.iso);
      assert.ok(typeof n.depth === 'number');
    }
  });

  it('places each nation in exactly one of four groups of four', () => {
    const ids = new Set();
    for (const letter of ['A', 'B', 'C', 'D']) {
      assert.equal(GROUPS[letter].length, 4);
      for (const id of GROUPS[letter]) {
        assert.ok(!ids.has(id), `duplicate ${id}`);
        ids.add(id);
      }
    }
    assert.equal(ids.size, 16);
  });
});

describe('roundRobinPairings', () => {
  it('returns 6 unique games for a group of 4', () => {
    const teams = GROUPS.A;
    const games = roundRobinPairings(teams);
    assert.equal(games.length, 6);
    const keys = new Set();
    for (const g of games) {
      assert.ok(teams.includes(g.white));
      assert.ok(teams.includes(g.black));
      assert.notEqual(g.white, g.black);
      const key = [g.white, g.black].sort().join('-');
      assert.ok(!keys.has(key), `duplicate pairing ${key}`);
      keys.add(key);
    }
  });
});

describe('standings and points', () => {
  it('awards 3/1/0 for win/draw/loss', () => {
    const standings = createStandings(['bra', 'arg', 'fra', 'ger']);
    applyMatchResult(standings, 'bra', 'arg', '1-0');
    applyMatchResult(standings, 'fra', 'ger', '1/2-1/2');
    applyMatchResult(standings, 'bra', 'fra', '0-1');

    assert.equal(standings.bra.played, 2);
    assert.equal(standings.bra.won, 1);
    assert.equal(standings.bra.drawn, 0);
    assert.equal(standings.bra.lost, 1);
    assert.equal(standings.bra.points, 3);

    assert.equal(standings.arg.points, 0);
    assert.equal(standings.fra.points, 4);
    assert.equal(standings.ger.points, 1);
  });

  it('ranks by points then head-to-head then Sonneborn-Berger then alphabetical', () => {
    const ids = ['bra', 'arg', 'fra', 'ger'];
    const standings = createStandings(ids);
    const results = [];

    function play(w, b, r) {
      applyMatchResult(standings, w, b, r);
      results.push({ white: w, black: b, result: r });
    }

    play('bra', 'arg', '1-0');
    play('fra', 'ger', '1-0');
    play('bra', 'fra', '1/2-1/2');
    play('arg', 'ger', '1-0');
    play('bra', 'ger', '1-0');
    play('arg', 'fra', '1/2-1/2');

    const ranked = rankGroup(standings, results);
    assert.equal(ranked[0].id, 'bra');
    assert.equal(ranked[0].points, 7);
    assert.equal(ranked[1].id, 'fra');
    assert.equal(ranked[1].points, 5);
    assert.equal(ranked[2].id, 'arg');
    assert.equal(ranked[2].points, 4);
    assert.equal(ranked[3].id, 'ger');
  });

  it('breaks equal points with head-to-head', () => {
    const ids = ['aaa', 'bbb', 'ccc', 'ddd'];
    const standings = createStandings(ids);
    const results = [];
    function play(w, b, r) {
      applyMatchResult(standings, w, b, r);
      results.push({ white: w, black: b, result: r });
    }
    play('aaa', 'bbb', '1-0');
    play('aaa', 'ccc', '1-0');
    play('aaa', 'ddd', '1/2-1/2');
    play('bbb', 'ddd', '1-0');
    play('ccc', 'ddd', '1-0');
    play('bbb', 'ccc', '0-1');

    assert.equal(standings.aaa.points, 7);
    assert.equal(standings.ccc.points, 6);
    assert.equal(standings.bbb.points, 3);
    assert.equal(standings.ddd.points, 1);

    const ranked = rankGroup(standings, results);
    assert.equal(ranked[0].id, 'aaa');
    assert.equal(ranked[1].id, 'ccc');
    assert.equal(ranked[2].id, 'bbb');
    assert.equal(ranked[3].id, 'ddd');
  });

  it('uses head-to-head when points are tied', () => {
    const ids = ['aaa', 'bbb', 'ccc', 'ddd'];
    const standings = createStandings(ids);
    const results = [];
    function play(w, b, r) {
      applyMatchResult(standings, w, b, r);
      results.push({ white: w, black: b, result: r });
    }
    play('aaa', 'ddd', '1-0');
    play('bbb', 'ddd', '1-0');
    play('ccc', 'ddd', '1/2-1/2');
    play('aaa', 'bbb', '1/2-1/2');
    play('aaa', 'ccc', '1-0');
    play('bbb', 'ccc', '0-1');

    assert.equal(standings.aaa.points, 7);
    assert.equal(standings.bbb.points, 4);
    assert.equal(standings.ccc.points, 4);
    assert.equal(standings.ddd.points, 1);

    const ranked = rankGroup(standings, results);
    assert.equal(ranked[0].id, 'aaa');
    assert.equal(ranked[1].id, 'ccc');
    assert.equal(ranked[2].id, 'bbb');
  });
});

describe('qualifiers and knockout', () => {
  it('takes top 2 from each group', () => {
    const groupResults = {};
    for (const letter of ['A', 'B', 'C', 'D']) {
      const ids = GROUPS[letter];
      const standings = createStandings(ids);
      const results = [];
      const games = roundRobinPairings(ids);
      games.forEach((g, i) => {
        const result = i % 3 === 0 ? '1/2-1/2' : i % 2 === 0 ? '1-0' : '0-1';
        applyMatchResult(standings, g.white, g.black, result);
        results.push({ ...g, result });
      });
      groupResults[letter] = { standings, results, ranked: rankGroup(standings, results) };
    }
    const q = getQualifiers(groupResults);
    assert.equal(Object.keys(q).length, 8);
    assert.ok(q.A1 && q.A2 && q.B1 && q.B2 && q.C1 && q.C2 && q.D1 && q.D2);
  });

  it('seeds knockout as A1vB2, B1vA2, C1vD2, D1vC2', () => {
    const q = {
      A1: 'bra', A2: 'arg',
      B1: 'fra', B2: 'ger',
      C1: 'esp', C2: 'gbr',
      D1: 'ita', D2: 'usa',
    };
    const fixtures = knockoutFixtures(q);
    assert.deepEqual(fixtures, [
      { round: 'QF', white: 'bra', black: 'ger', label: 'A1 vs B2' },
      { round: 'QF', white: 'fra', black: 'arg', label: 'B1 vs A2' },
      { round: 'QF', white: 'esp', black: 'usa', label: 'C1 vs D2' },
      { round: 'QF', white: 'ita', black: 'gbr', label: 'D1 vs C2' },
    ]);
  });
});

describe('bot', () => {
  it('returns a legal SAN from the starting position', () => {
    const chess = new Chess();
    const move = chooseBotMove(chess, 2, () => 0.5);
    assert.ok(move);
    assert.ok(typeof move.san === 'string');
    const probe = new Chess();
    const applied = probe.move(move.san);
    assert.ok(applied);
  });

  it('finds mate in one when depth allows', () => {
    const chess = new Chess('6k1/3R4/6K1/8/8/8/8/8 w - - 0 1');
    const move = chooseBotMove(chess, 1, () => 0.1);
    assert.ok(move);
    chess.move(move);
    assert.equal(chess.in_checkmate(), true);
  });

  it('playAutomatedGame finishes with a valid result', () => {
    globalThis.Chess = Chess;
    const result = playAutomatedGame(
      { id: 'bra', depth: 1 },
      { id: 'arg', depth: 1 },
      { maxPlies: 80, rng: () => 0.42, Chess }
    );
    assert.ok(['1-0', '0-1', '1/2-1/2'].includes(result.result));
    assert.ok(Array.isArray(result.moves));
    assert.ok(result.moves.length > 0);
  });
});

describe('shuffleGroups', () => {
  it('reshuffles all 16 nations into four groups of four', () => {
    resetGroups();
    const before = GROUPS.A.join(',');
    let changed = false;
    for (let i = 0; i < 20; i++) {
      shuffleGroups(Math.random);
      if (GROUPS.A.join(',') !== before) {
        changed = true;
        break;
      }
    }
    assert.equal(changed, true);
    const ids = new Set();
    for (const letter of ['A', 'B', 'C', 'D']) {
      assert.equal(GROUPS[letter].length, 4);
      for (const id of GROUPS[letter]) ids.add(id);
    }
    assert.equal(ids.size, 16);
    assert.equal(ids.size, NATIONS.length);
    resetGroups();
  });
});
