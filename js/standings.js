// standings.js — Tabellenberechnung aus eingetragenen Ergebnissen

import { GROUPS, GROUP_MATCHES } from './data.js';

export function calcStandings(group, groupScores) {
  const { teams, flags } = GROUPS[group];
  const matches = GROUP_MATCHES[group];

  // Initialisiere Statistiken
  const stats = teams.map((name, i) => ({
    name, flag: flags[i], idx: i,
    played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, pts: 0,
  }));

  matches.forEach(([ t1, t2 ], mIdx) => {
    const key  = `${group}_${mIdx}`;
    const sc   = groupScores[key];
    if (!sc || sc.h === null || sc.a === null) return;

    const h = Number(sc.h), a = Number(sc.a);
    const s1 = stats[t1], s2 = stats[t2];

    s1.played++; s2.played++;
    s1.gf += h;  s1.ga += a;
    s2.gf += a;  s2.ga += h;

    if (h > a)      { s1.won++;   s1.pts += 3; s2.lost++;              }
    else if (h < a) { s2.won++;   s2.pts += 3; s1.lost++;              }
    else            { s1.drawn++; s1.pts += 1; s2.drawn++; s2.pts += 1; }
  });

  stats.forEach(s => s.gd = s.gf - s.ga);

  // Sortierung: Punkte → Tordifferenz → Tore → alphabetisch
  return stats.sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf ||
    a.name.localeCompare(b.name)
  );
}

export function calcAllStandings(groupScores) {
  const result = {};
  for (const g of Object.keys(GROUPS)) {
    result[g] = calcStandings(g, groupScores);
  }
  return result;
}

export function isGroupComplete(group, groupScores) {
  const matches = GROUP_MATCHES[group];
  return matches.every((_, i) => {
    const sc = groupScores[`${group}_${i}`];
    return sc && sc.h !== null && sc.h !== '' && sc.a !== null && sc.a !== '';
  });
}

export function getBest3rds(allStandings, groupScores) {
  const thirds = [];
  for (const [g, standing] of Object.entries(allStandings)) {
    if (!isGroupComplete(g, groupScores)) continue;
    const t = standing[2];
    thirds.push({ group: g, ...t });
  }
  return thirds
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group))
    .slice(0, 8);
}
