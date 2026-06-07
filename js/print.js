// print.js — Generiert eine druckoptimierte Seite mit hellem Design

import { GROUPS, GROUP_MATCHES } from './data.js';
import { calcAllStandings } from './standings.js';
import { getWinner } from './bracket.js';

const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700&family=Noto+Color+Emoji&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Barlow', 'Noto Color Emoji', sans-serif;
    background: #ffffff;
    color: #1a2035;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Gruppen-Seiten ── */
  .print-page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    page-break-after: always;
    background: #fff;
  }
  .print-page:last-child { page-break-after: avoid; }

  .print-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6mm;
    border-bottom: 2px solid #1a2035;
    margin-bottom: 6mm;
  }
  .print-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #1a2035;
  }
  .print-subtitle {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    color: #667;
    text-transform: uppercase;
  }

  .groups-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5mm;
  }

  .group-card {
    border: 1px solid #cdd;
    border-radius: 5px;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .group-header {
    background: #1a2035;
    color: #e8c84a;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 12px;
    letter-spacing: 3px;
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge-complete { font-size: 8px; color: #aef; }

  .group-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .matches-col {
    border-right: 1px solid #dde;
    padding: 3px 0;
  }

  .match-row {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-bottom: 0.5px solid #eef;
    font-size: 9px;
  }
  .match-row:last-child { border-bottom: none; }

  .match-team { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .match-team.away { text-align: right; }

  .score-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 12px;
    color: #1a2035;
    min-width: 28px;
    text-align: center;
    flex-shrink: 0;
  }
  .score-empty { color: #aab; }

  .table-col { padding: 3px 0; }

  .standing-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5px;
  }
  .standing-table th {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 7px;
    letter-spacing: 1px;
    color: #889;
    padding: 2px 3px;
    text-align: center;
    border-bottom: 0.5px solid #dde;
  }
  .standing-table th:nth-child(2) { text-align: left; }
  .standing-table td {
    padding: 2px 3px;
    text-align: center;
    border-bottom: 0.5px solid #eef;
  }
  .standing-table td:nth-child(2) { text-align: left; }
  .standing-table tr:last-child td { border-bottom: none; }
  .standing-table .pts { font-weight: 700; color: #1a2035; }
  .standing-table .team-name { display: flex; align-items: center; gap: 3px; }
  .standing-table tr.qualified { background: rgba(46,204,113,0.08); }
  .standing-table tr.third     { background: rgba(232,200,74,0.08); }

  /* ── Bracket-Seite ── */
  .bracket-page {
    width: 297mm;
    min-height: 210mm;
    padding: 8mm;
    background: #fff;
    page-break-after: always;
  }

  .bracket-page .print-header { border-bottom-color: #1a2035; }

  .ko-box-print {
    position: absolute;
    border: 1px solid #cdd;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
  }
  .ko-box-print.finale { border-color: #e8c84a; border-width: 1.5px; }

  .ko-team-print {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 5px;
    border-bottom: 0.5px solid #eef;
    font-size: 8px;
    min-height: 22px;
  }
  .ko-team-print:last-of-type { border-bottom: none; }
  .ko-team-print.winner { background: rgba(232,200,74,0.15); font-weight: 600; }

  .ko-name-print { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ko-score-print {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 11px;
    color: #1a2035;
    min-width: 14px;
    text-align: right;
    flex-shrink: 0;
  }
  .ko-date-print {
    font-size: 6.5px;
    color: #889;
    text-align: center;
    padding: 2px;
    background: #f5f7fa;
    border-top: 0.5px solid #eef;
  }

  .round-label-print {
    position: absolute;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 8px;
    letter-spacing: 1.5px;
    color: #667;
    text-align: center;
    text-transform: uppercase;
  }

  @page groups { size: A4 portrait; margin: 0; }
  @page bracket { size: A4 landscape; margin: 0; }
  @media print {
    .bracket-page { page: bracket; }
    .print-page   { page: groups; }
  }
`;

function groupsHTML(state) {
  const allStandings = calcAllStandings(state.groupScores);

  const cards = Object.entries(GROUPS).map(([letter, { teams, flags }]) => {
    const matches  = GROUP_MATCHES[letter];
    const standing = allStandings[letter];

    const matchRows = matches.map(([t1, t2], mIdx) => {
      const key = `${letter}_${mIdx}`;
      const sc  = state.groupScores[key] || {};
      const hasScore = sc.h !== null && sc.h !== undefined && sc.h !== '';
      const scoreStr = hasScore
        ? `<span class="score-val">${sc.h} : ${sc.a}</span>`
        : `<span class="score-val score-empty">– : –</span>`;
      return `<div class="match-row">
        <span class="match-team">${flags[t1]} ${teams[t1]}</span>
        ${scoreStr}
        <span class="match-team away">${teams[t2]} ${flags[t2]}</span>
      </div>`;
    }).join('');

    const tableRows = standing.map((s, i) => {
      const cls = i < 2 ? 'qualified' : i === 2 ? 'third' : '';
      return `<tr class="${cls}">
        <td>${i+1}</td>
        <td class="team-name"><span>${s.flag}</span>${s.name}</td>
        <td>${s.played}</td><td>${s.won}</td><td>${s.drawn}</td>
        <td>${s.lost}</td><td>${s.gf}:${s.ga}</td>
        <td class="pts">${s.pts}</td>
      </tr>`;
    }).join('');

    return `<div class="group-card">
      <div class="group-header">GRUPPE ${letter}</div>
      <div class="group-body">
        <div class="matches-col">${matchRows}</div>
        <div class="table-col">
          <table class="standing-table">
            <thead><tr>
              <th>#</th><th>Team</th>
              <th>Sp</th><th>S</th><th>U</th><th>N</th><th>T</th><th>Pkt</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  });

  // 6 Gruppen pro Seite (2 Seiten à 6)
  const page1 = cards.slice(0, 6).join('');
  const page2 = cards.slice(6).join('');

  return `
    <div class="print-page">
      <div class="print-header">
        <div>
          <div class="print-title">⚽ WM 2026 POSTER</div>
          <div class="print-subtitle">USA · Kanada · Mexiko · 11. Juni – 19. Juli 2026 &nbsp;·&nbsp; Gruppen A–F</div>
        </div>
      </div>
      <div class="groups-grid">${page1}</div>
    </div>
    <div class="print-page">
      <div class="print-header">
        <div>
          <div class="print-title">⚽ WM 2026 POSTER</div>
          <div class="print-subtitle">Gruppen G–L</div>
        </div>
      </div>
      <div class="groups-grid">${page2}</div>
    </div>`;
}

function bracketHTML(state) {
  // Querformat: 297mm × 210mm bei 96dpi ≈ 1122 × 793px
  const SCALE  = 3.74; // 1mm = 3.74px
  const PW     = 281 * SCALE, PH = 194 * SCALE;
  const BOX_W  = 25 * SCALE, BOX_H = 18 * SCALE;
  const COL_GAP= 6  * SCALE, COL_W = BOX_W + COL_GAP;
  const HDR_H  = 8  * SCALE, FIN_W = 32 * SCALE;

  function matchY(count, i) {
    const totalH = 8 * (BOX_H + 3 * SCALE);
    const slotH  = totalH / count;
    return i * slotH + (slotH - BOX_H) / 2;
  }

  function koBox(matchId, x, y, w, isFinale) {
    const m     = state.koMatches[matchId] || {};
    const home  = m.home     || '–';
    const hFlag = m.homeFlag || '🏳️';
    const away  = m.away     || '–';
    const aFlag = m.awayFlag || '🏳️';
    const hSc   = m.hScore !== null && m.hScore !== undefined && m.hScore !== '' ? m.hScore : '';
    const aSc   = m.aScore !== null && m.aScore !== undefined && m.aScore !== '' ? m.aScore : '';
    const winner = getWinner(state.koMatches, matchId);
    const hWin   = winner?.name === home && home !== '–';
    const aWin   = winner?.name === away && away !== '–';
    const bw     = w || BOX_W;

    const labels = {
      szf1:'28.06',szf2:'29.06',szf3:'29.06',szf4:'30.06',
      szf5:'30.06',szf6:'01.07',szf7:'01.07',szf8:'02.07',
      szf9:'02.07',szf10:'03.07',szf11:'03.07',szf12:'04.07',
      szf13:'04.07',szf14:'05.07',szf15:'05.07',szf16:'06.07',
      af1:'07.07',af2:'07.07',af3:'08.07',af4:'08.07',
      af5:'09.07',af6:'09.07',af7:'10.07',af8:'10.07',
      vf1:'11.07',vf2:'12.07',vf3:'12.07',vf4:'13.07',
      hf1:'14.07',hf2:'15.07',
      platz3:'🥉 18.07',finale:'🏆 19.07',
    };

    return `<div class="ko-box-print${isFinale?' finale':''}"
      style="left:${x}px;top:${y}px;width:${bw}px;">
      <div class="ko-team-print${hWin?' winner':''}">
        <span>${hFlag}</span>
        <span class="ko-name-print">${home}</span>
        <span class="ko-score-print">${hSc}</span>
      </div>
      <div class="ko-team-print${aWin?' winner':''}">
        <span>${aFlag}</span>
        <span class="ko-name-print">${away}</span>
        <span class="ko-score-print">${aSc}</span>
      </div>
      <div class="ko-date-print">${labels[matchId]||''}</div>
    </div>`;
  }

  const leftStart  = 5 * SCALE;
  const finaleX    = leftStart + 4 * COL_W;
  const rightStart = finaleX + FIN_W + COL_GAP;

  const LEFT = [
    { key:'r32', count:8, ids:['szf1','szf2','szf3','szf4','szf5','szf6','szf7','szf8'] },
    { key:'r16', count:4, ids:['af1','af2','af3','af4'] },
    { key:'qf',  count:2, ids:['vf1','vf2'] },
    { key:'sf',  count:1, ids:['hf1'] },
  ];
  const RIGHT = [
    { key:'sf',  count:1, ids:['hf2'] },
    { key:'qf',  count:2, ids:['vf4','vf3'] },
    { key:'r16', count:4, ids:['af8','af7','af6','af5'] },
    { key:'r32', count:8, ids:['szf16','szf15','szf14','szf13','szf12','szf11','szf10','szf9'] },
  ];

  const LABELS = { r32:'1/16', r16:'1/8', qf:'Viertelfinale', sf:'Halbfinale' };

  let boxes = '', lines = '';

  function renderHalf(rounds, startX, goRight) {
    rounds.forEach((round, rIdx) => {
      const x = startX + rIdx * COL_W;
      boxes += `<div class="round-label-print" style="left:${x}px;top:0;width:${BOX_W}px;">${LABELS[round.key]||round.key}</div>`;

      round.ids.forEach((id, i) => {
        const y = HDR_H + matchY(round.count, i);
        boxes += koBox(id, x, y);

        if (goRight && rIdx < rounds.length - 1) {
          const nr = rounds[rIdx+1], ni = Math.floor(i/2);
          const y1 = HDR_H + matchY(round.count, i) + BOX_H/2;
          const y2 = HDR_H + matchY(nr.count, ni) + BOX_H/2;
          const x1 = x+BOX_W, x2 = startX+(rIdx+1)*COL_W, mx = x1+COL_GAP/2;
          lines += `<path d="M${x1},${y1} H${mx} V${y2} H${x2}" fill="none" stroke="#cdd" stroke-width="1"/>`;
        } else if (!goRight && rIdx > 0) {
          const pr = rounds[rIdx-1], pi = Math.floor(i/2);
          const y1 = HDR_H + matchY(round.count, i) + BOX_H/2;
          const y2 = HDR_H + matchY(pr.count, pi) + BOX_H/2;
          const x1 = x, x2 = startX+(rIdx-1)*COL_W+BOX_W, mx = x1-COL_GAP/2;
          lines += `<path d="M${x1},${y1} H${mx} V${y2} H${x2}" fill="none" stroke="#cdd" stroke-width="1"/>`;
        }
      });
    });
  }

  renderHalf(LEFT,  leftStart,  true);
  renderHalf(RIGHT, rightStart, false);

  const sfY    = HDR_H + matchY(1,0) + BOX_H/2;
  const sfLX   = leftStart + 3*COL_W + BOX_W;
  const finY   = HDR_H + matchY(1,0);
  const p3Y    = finY + BOX_H + 10*SCALE;
  const p3MidX = finaleX + FIN_W/2;
  const hfLMX  = finaleX - COL_W + COL_W/2;
  const hfRMX  = rightStart + BOX_W/2;

  lines += `<path d="M${sfLX},${sfY} H${finaleX}" fill="none" stroke="#cdd" stroke-width="1"/>`;
  lines += `<path d="M${finaleX+FIN_W},${sfY} H${rightStart}" fill="none" stroke="#cdd" stroke-width="1"/>`;
  lines += `<path d="M${hfLMX},${finY+BOX_H} V${p3Y-4} H${p3MidX} V${p3Y}" fill="none" stroke="#dde" stroke-width="0.8" stroke-dasharray="3,2"/>`;
  lines += `<path d="M${hfRMX},${finY+BOX_H} V${p3Y-4} H${p3MidX}" fill="none" stroke="#dde" stroke-width="0.8" stroke-dasharray="3,2"/>`;

  boxes += `<div class="round-label-print" style="left:${finaleX}px;top:0;width:${FIN_W}px;color:#c9a20a;">FINALE</div>`;
  boxes += koBox('finale', finaleX, finY, FIN_W, true);
  boxes += koBox('platz3', finaleX+(FIN_W-BOX_W)/2, p3Y, BOX_W, false);

  const totalW = 4*COL_W + FIN_W + 4*COL_W + leftStart + 5*SCALE;
  const fullH  = Math.max(8*(BOX_H+3*SCALE)+HDR_H+20, p3Y+BOX_H+20*SCALE);

  return `<div class="bracket-page">
    <div class="print-header">
      <div>
        <div class="print-title">⚽ WM 2026 POSTER</div>
        <div class="print-subtitle">Turnierbaum · K.o.-Runde</div>
      </div>
    </div>
    <div style="position:relative;width:${totalW}px;height:${fullH}px;overflow:visible;">
      <svg style="position:absolute;top:0;left:0;width:${totalW}px;height:${fullH}px;pointer-events:none;">
        ${lines}
      </svg>
      ${boxes}
    </div>
  </div>`;
}

export function openPrint(state, mode) {
  // mode: 'groups' | 'bracket' | 'all'
  let body = '';
  if (mode === 'groups' || mode === 'all') body += groupsHTML(state);
  if (mode === 'bracket'|| mode === 'all') body += bracketHTML(state);

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>WM 2026 Poster</title>
  <style>${PRINT_CSS}</style>
</head>
<body>${body}
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 800);
  };
<\/script>
</body></html>`);
  win.document.close();
}
