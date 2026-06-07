// bracket.js — K.o.-Runden Logik

import { SZF_PAIRINGS, KO_STRUCTURE } from './data.js';
import { calcAllStandings, getBest3rds, isGroupComplete } from './standings.js';

// Leitet Teamname+Flag aus Gruppen-Paarungsschlüssel ab
// z.B. '1E' = Gruppensieger E, '2A' = Gruppenzweiter A
export function resolveGroupSlot(slot, allStandings, groupScores) {
  if (!slot || slot === '3rd') return { name: '3.', flag: '🏳️' };
  const rank  = parseInt(slot[0]) - 1;  // '1' → 0, '2' → 1
  const group = slot[1];                // 'A'–'L'
  const standing = allStandings[group];
  if (!standing || !isGroupComplete(group, groupScores)) return null;
  const team = standing[rank];
  return team ? { name: team.name, flag: team.flag } : null;
}

// Ermittelt den Sieger eines Matches
export function getWinner(koMatches, matchId) {
  const m = koMatches[matchId];
  if (!m || m.hScore === null || m.aScore === null ||
      m.hScore === '' || m.aScore === '') return null;
  const h = Number(m.hScore), a = Number(m.aScore);
  if (h > a) return { name: m.home, flag: m.homeFlag };
  if (a > h) return { name: m.away, flag: m.awayFlag };
  return null; // Unentschieden — im K.o. gibt es Verlängerung/ET
}

// Befüllt SZF-Matches aus Gruppenphase
export function populateSZF(koMatches, allStandings, groupScores) {
  const updated = { ...koMatches };

  for (const [szfId, pairing] of Object.entries(SZF_PAIRINGS)) {
    const existing = updated[szfId] || {};
    const home = resolveGroupSlot(pairing.home, allStandings, groupScores);
    const away = resolveGroupSlot(pairing.away, allStandings, groupScores);

    updated[szfId] = {
      ...existing,
      home:     home?.name ?? existing.home     ?? '',
      homeFlag: home?.flag ?? existing.homeFlag ?? '🏳️',
      away:     away?.name ?? existing.away     ?? '',
      awayFlag: away?.flag ?? existing.awayFlag ?? '🏳️',
    };
  }
  return updated;
}

// Befüllt AF/VF/HF/Finale aus Siegerfortschritt
export function propagateWinners(koMatches) {
  const updated = { ...koMatches };

  // AF aus SZF-Siegern
  for (const af of KO_STRUCTURE.af) {
    const [s1, s2] = af.szf;
    const w1 = getWinner(updated, s1);
    const w2 = getWinner(updated, s2);
    updated[af.id] = {
      ...(updated[af.id] || {}),
      home:     w1?.name ?? updated[af.id]?.home     ?? '',
      homeFlag: w1?.flag ?? updated[af.id]?.homeFlag ?? '🏳️',
      away:     w2?.name ?? updated[af.id]?.away     ?? '',
      awayFlag: w2?.flag ?? updated[af.id]?.awayFlag ?? '🏳️',
    };
  }

  // VF aus AF-Siegern
  for (const vf of KO_STRUCTURE.vf) {
    const [a1, a2] = vf.af;
    const w1 = getWinner(updated, a1);
    const w2 = getWinner(updated, a2);
    updated[vf.id] = {
      ...(updated[vf.id] || {}),
      home:     w1?.name ?? updated[vf.id]?.home     ?? '',
      homeFlag: w1?.flag ?? updated[vf.id]?.homeFlag ?? '🏳️',
      away:     w2?.name ?? updated[vf.id]?.away     ?? '',
      awayFlag: w2?.flag ?? updated[vf.id]?.awayFlag ?? '🏳️',
    };
  }

  // HF aus VF-Siegern
  for (const hf of KO_STRUCTURE.hf) {
    const [v1, v2] = hf.vf;
    const w1 = getWinner(updated, v1);
    const w2 = getWinner(updated, v2);
    updated[hf.id] = {
      ...(updated[hf.id] || {}),
      home:     w1?.name ?? updated[hf.id]?.home     ?? '',
      homeFlag: w1?.flag ?? updated[hf.id]?.homeFlag ?? '🏳️',
      away:     w2?.name ?? updated[hf.id]?.away     ?? '',
      awayFlag: w2?.flag ?? updated[hf.id]?.awayFlag ?? '🏳️',
    };
  }

  // Finale aus HF-Siegern
  const wHF1 = getWinner(updated, 'hf1');
  const wHF2 = getWinner(updated, 'hf2');
  updated['finale'] = {
    ...(updated['finale'] || {}),
    home:     wHF1?.name ?? updated['finale']?.home     ?? '',
    homeFlag: wHF1?.flag ?? updated['finale']?.homeFlag ?? '🏳️',
    away:     wHF2?.name ?? updated['finale']?.away     ?? '',
    awayFlag: wHF2?.flag ?? updated['finale']?.awayFlag ?? '🏳️',
  };

  // Platz 3: Verlierer der HF
  const getLoser = (matchId) => {
    const m = updated[matchId];
    if (!m || m.hScore === null || m.hScore === '' ||
        m.aScore === null || m.aScore === '') return null;
    const h = Number(m.hScore), a = Number(m.aScore);
    if (h > a) return { name: m.away, flag: m.awayFlag };
    if (a > h) return { name: m.home, flag: m.homeFlag };
    return null;
  };
  const lHF1 = getLoser('hf1');
  const lHF2 = getLoser('hf2');
  updated['platz3'] = {
    ...(updated['platz3'] || {}),
    home:     lHF1?.name ?? updated['platz3']?.home     ?? '',
    homeFlag: lHF1?.flag ?? updated['platz3']?.homeFlag ?? '🏳️',
    away:     lHF2?.name ?? updated['platz3']?.away     ?? '',
    awayFlag: lHF2?.flag ?? updated['platz3']?.awayFlag ?? '🏳️',
  };

  return updated;
}
