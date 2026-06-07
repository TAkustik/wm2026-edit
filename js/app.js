// app.js — Hauptanwendung

import { GROUPS, GROUP_MATCHES, KO_STRUCTURE } from './data.js';
import { loadState, saveState, resetState } from './state.js';
import { calcAllStandings, isGroupComplete } from './standings.js';
import { populateSZF, propagateWinners, getWinner } from './bracket.js';

// ── Zustand ───────────────────────────────────────────────────
let state = loadState();

function save() {
  // Aktualisiere K.o.-Baum vor dem Speichern
  const allStandings = calcAllStandings(state.groupScores);
  state.koMatches = populateSZF(state.koMatches, allStandings, state.groupScores);
  state.koMatches = propagateWinners(state.koMatches);
  saveState(state);
}


// Anstoßzeiten der Gruppenspiele (MESZ) für Farbmarkierung
const MATCH_TIMES = {
  A_0:'2026-06-11T21:00', A_1:'2026-06-12T04:00', A_2:'2026-06-18T18:00',
  A_3:'2026-06-19T03:00', A_4:'2026-06-25T03:00', A_5:'2026-06-25T03:00',
  B_0:'2026-06-12T21:00', B_1:'2026-06-13T21:00', B_2:'2026-06-18T21:00',
  B_3:'2026-06-19T00:00', B_4:'2026-06-24T21:00', B_5:'2026-06-24T21:00',
  C_0:'2026-06-14T00:00', C_1:'2026-06-14T03:00', C_2:'2026-06-20T00:00',
  C_3:'2026-06-20T03:00', C_4:'2026-06-25T00:00', C_5:'2026-06-25T00:00',
  D_0:'2026-06-13T03:00', D_1:'2026-06-13T06:00', D_2:'2026-06-19T21:00',
  D_3:'2026-06-20T06:00', D_4:'2026-06-26T04:00', D_5:'2026-06-26T04:00',
  E_0:'2026-06-14T19:00', E_1:'2026-06-15T01:00', E_2:'2026-06-20T22:00',
  E_3:'2026-06-21T02:00', E_4:'2026-06-25T22:00', E_5:'2026-06-25T22:00',
  F_0:'2026-06-14T22:00', F_1:'2026-06-15T04:00', F_2:'2026-06-20T19:00',
  F_3:'2026-06-21T06:00', F_4:'2026-06-26T01:00', F_5:'2026-06-26T01:00',
  G_0:'2026-06-15T21:00', G_1:'2026-06-16T03:00', G_2:'2026-06-22T00:00',
  G_3:'2026-06-22T03:00', G_4:'2026-06-27T05:00', G_5:'2026-06-27T05:00',
  H_0:'2026-06-15T18:00', H_1:'2026-06-16T00:00', H_2:'2026-06-21T18:00',
  H_3:'2026-06-22T00:00', H_4:'2026-06-27T02:00', H_5:'2026-06-27T02:00',
  I_0:'2026-06-16T21:00', I_1:'2026-06-17T00:00', I_2:'2026-06-22T23:00',
  I_3:'2026-06-23T02:00', I_4:'2026-06-26T21:00', I_5:'2026-06-26T21:00',
  J_0:'2026-06-17T03:00', J_1:'2026-06-16T06:00', J_2:'2026-06-22T19:00',
  J_3:'2026-06-23T05:00', J_4:'2026-06-28T04:00', J_5:'2026-06-28T04:00',
  K_0:'2026-06-17T19:00', K_1:'2026-06-18T04:00', K_2:'2026-06-23T19:00',
  K_3:'2026-06-24T04:00', K_4:'2026-06-28T01:30', K_5:'2026-06-28T01:30',
  L_0:'2026-06-17T22:00', L_1:'2026-06-18T01:00', L_2:'2026-06-23T22:00',
  L_3:'2026-06-24T01:00', L_4:'2026-06-27T23:00', L_5:'2026-06-27T23:00',
};

function getMatchStatus(key) {
  const t = MATCH_TIMES[key];
  if (!t) return 'future';
  const now    = new Date();
  const start  = new Date(t + ':00+02:00'); // MESZ
  const end    = new Date(start.getTime() + 110 * 60000);
  if (now >= start && now <= end) return 'live';
  if (now > end) return 'past';
  return 'future';
}

// ── Render Gruppen ────────────────────────────────────────────
function renderGroups() {
  const allStandings = calcAllStandings(state.groupScores);
  const container    = document.getElementById('groups-section');
  if (!container) return;

  container.innerHTML = Object.entries(GROUPS).map(([letter, { teams, flags }]) => {
    const matches  = GROUP_MATCHES[letter];
    const standing = allStandings[letter];
    const complete = isGroupComplete(letter, state.groupScores);

    const matchRows = matches.map(([t1, t2], mIdx) => {
      const key = `${letter}_${mIdx}`;
      const sc  = state.groupScores[key] || { h: '', a: '' };
      return `
        <div class="match-row">
          <span class="match-team home">${flags[t1]} ${teams[t1]}</span>
          <div class="score-inputs">
            <input type="number" min="0" max="99" value="${sc.h ?? ''}"
              data-key="${key}" data-side="h" class="score-input" placeholder="–">
            <span class="score-sep">:</span>
            <input type="number" min="0" max="99" value="${sc.a ?? ''}"
              data-key="${key}" data-side="a" class="score-input" placeholder="–">
          </div>
          <span class="match-team away">${teams[t2]} ${flags[t2]}</span>
        </div>`;
    }).join('');

    const tableRows = standing.map((s, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      const cls   = i < 2 ? 'qualified' : i === 2 ? 'third' : '';
      return `
        <tr class="${cls}">
          <td class="pos">${medal || (i+1)}</td>
          <td class="team-name"><span class="flag">${s.flag}</span>${s.name}</td>
          <td>${s.played}</td>
          <td>${s.won}</td>
          <td>${s.drawn}</td>
          <td>${s.lost}</td>
          <td>${s.gf}:${s.ga}</td>
          <td class="pts">${s.pts}</td>
        </tr>`;
    }).join('');

    return `
      <div class="group-card${complete ? ' complete' : ''}">
        <div class="group-header">
          <span class="group-letter">GRUPPE ${letter}</span>
          ${complete ? '<span class="badge-complete">✓ Abgeschlossen</span>' : ''}
        </div>
        <div class="group-body">
          <div class="matches-col">
            <div class="col-label">Spiele</div>
            ${matchRows}
          </div>
          <div class="table-col">
            <div class="col-label">Tabelle</div>
            <table class="standing-table">
              <thead><tr>
                <th>#</th><th>Team</th>
                <th title="Spiele">Sp</th>
                <th title="Siege">S</th>
                <th title="Unentschieden">U</th>
                <th title="Niederlagen">N</th>
                <th title="Tore">T</th>
                <th title="Punkte">Pkt</th>
              </tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }).join('');

  // Event Listener für Score-Inputs
  container.querySelectorAll('.score-input').forEach(inp => {
    inp.addEventListener('change', onScoreInput);
    inp.addEventListener('input', onScoreInput);
  });
}

function onScoreInput(e) {
  const { key, side } = e.target.dataset;
  const val = e.target.value.trim();
  if (!state.groupScores[key]) state.groupScores[key] = { h: null, a: null };
  state.groupScores[key][side] = val === '' ? null : parseInt(val, 10);
  save();
  renderGroups();
  renderBracket();
}

// ── Render Bracket ────────────────────────────────────────────
const BOX_W = 128, BOX_H = 70, COL_GAP = 26, COL_W = BOX_W + COL_GAP;
const HEADER_H = 30, FIN_W = 144;

function bracketMatchY(count, i) {
  const totalH = 8 * (BOX_H + 12);
  const slotH  = totalH / count;
  return i * slotH + (slotH - BOX_H) / 2;
}

function bracketTotalH() { return 8 * (BOX_H + 12) + HEADER_H + 20; }

function matchBox(matchId, x, y, width, isFinale) {
  const m     = state.koMatches[matchId] || {};
  const home  = m.home     || '';
  const hFlag = m.homeFlag || '🏳️';
  const away  = m.away     || '';
  const aFlag = m.awayFlag || '🏳️';
  const hSc   = m.hScore ?? '';
  const aSc   = m.aScore ?? '';

  const winner = getWinner(state.koMatches, matchId);
  const hWin   = winner && winner.name === home;
  const aWin   = winner && winner.name === away;

  const w = width || BOX_W;
  return `
    <div class="ko-box${isFinale ? ' finale-box' : ''}" style="left:${x}px;top:${y}px;width:${w}px;" data-match="${matchId}">
      <div class="ko-team${hWin?' winner':''}">
        <span class="ko-flag">${hFlag}</span>
        <span class="ko-name">${home || '–'}</span>
        <input type="number" min="0" max="99" value="${hSc}"
          class="ko-score" data-match="${matchId}" data-side="h" placeholder="–">
      </div>
      <div class="ko-team${aWin?' winner':''}">
        <span class="ko-flag">${aFlag}</span>
        <span class="ko-name">${away || '–'}</span>
        <input type="number" min="0" max="99" value="${aSc}"
          class="ko-score" data-match="${matchId}" data-side="a" placeholder="–">
      </div>
      <div class="ko-date">${getMatchLabel(matchId)}</div>
    </div>`;
}

function getMatchLabel(id) {
  const labels = {
    szf1:'28.06',szf2:'29.06',szf3:'29.06',szf4:'30.06',
    szf5:'30.06',szf6:'01.07',szf7:'01.07',szf8:'02.07',
    szf9:'02.07',szf10:'03.07',szf11:'03.07',szf12:'04.07',
    szf13:'04.07',szf14:'05.07',szf15:'05.07',szf16:'06.07',
    af1:'07.07',af2:'07.07',af3:'08.07',af4:'08.07',
    af5:'09.07',af6:'09.07',af7:'10.07',af8:'10.07',
    vf1:'11.07',vf2:'12.07',vf3:'12.07',vf4:'13.07',
    hf1:'14.07',hf2:'15.07',
    platz3:'18.07 · Platz 3',
    finale:'🏆 19.07 · New York',
  };
  return labels[id] || '';
}

function renderHalf(rounds, startX, goRight, svgLines, boxes) {
  rounds.forEach((round, rIdx) => {
    const x = startX + rIdx * COL_W;
    const roundLabel = { r32:'1/16', r16:'1/8', qf:'Viertelfinale', sf:'Halbfinale' }[round.key] || round.key;

    boxes.push(`<div class="round-label" style="position:absolute;left:${x}px;top:0;width:${BOX_W}px;text-align:center;">${roundLabel}</div>`);

    round.ids.forEach((matchId, i) => {
      const y = HEADER_H + bracketMatchY(round.count, i);
      boxes.push(matchBox(matchId, x, y));

      if (goRight && rIdx < rounds.length - 1) {
        const nextRound = rounds[rIdx + 1];
        const nextI = Math.floor(i / 2);
        const y1 = HEADER_H + bracketMatchY(round.count, i) + BOX_H / 2;
        const y2 = HEADER_H + bracketMatchY(nextRound.count, nextI) + BOX_H / 2;
        const x1 = x + BOX_W, x2 = startX + (rIdx + 1) * COL_W, midX = x1 + COL_GAP / 2;
        const hasWin = !!getWinner(state.koMatches, matchId);
        svgLines.push(`<path d="M${x1},${y1} H${midX} V${y2} H${x2}" fill="none" stroke="${hasWin?'#e8c84a':'#1e3050'}" stroke-width="1.5" stroke-linecap="round"/>`);
      } else if (!goRight && rIdx > 0) {
        const prevRound = rounds[rIdx - 1];
        const prevI = Math.floor(i / 2);
        const y1 = HEADER_H + bracketMatchY(round.count, i) + BOX_H / 2;
        const y2 = HEADER_H + bracketMatchY(prevRound.count, prevI) + BOX_H / 2;
        const x1 = x, x2 = startX + (rIdx - 1) * COL_W + BOX_W, midX = x1 - COL_GAP / 2;
        const hasWin = !!getWinner(state.koMatches, matchId);
        svgLines.push(`<path d="M${x1},${y1} H${midX} V${y2} H${x2}" fill="none" stroke="${hasWin?'#e8c84a':'#1e3050'}" stroke-width="1.5" stroke-linecap="round"/>`);
      }
    });
  });
}

function renderBracket() {
  const container = document.getElementById('bracket-section');
  if (!container) return;

  // K.o.-Baum aktualisieren
  const allStandings = calcAllStandings(state.groupScores);
  state.koMatches    = populateSZF(state.koMatches, allStandings, state.groupScores);
  state.koMatches    = propagateWinners(state.koMatches);

  const LEFT_ROUNDS = [
    { key:'r32', count:8, ids:['szf1','szf2','szf3','szf4','szf5','szf6','szf7','szf8'] },
    { key:'r16', count:4, ids:['af1','af2','af3','af4'] },
    { key:'qf',  count:2, ids:['vf1','vf2'] },
    { key:'sf',  count:1, ids:['hf1'] },
  ];
  const RIGHT_ROUNDS = [
    { key:'sf',  count:1, ids:['hf2'] },
    { key:'qf',  count:2, ids:['vf4','vf3'] },
    { key:'r16', count:4, ids:['af8','af7','af6','af5'] },
    { key:'r32', count:8, ids:['szf16','szf15','szf14','szf13','szf12','szf11','szf10','szf9'] },
  ];

  const totalH   = bracketTotalH();
  const totalW   = LEFT_ROUNDS.length * COL_W + FIN_W + RIGHT_ROUNDS.length * COL_W + 20;
  const leftStart  = 10;
  const finaleX    = leftStart + LEFT_ROUNDS.length * COL_W;
  const rightStart = finaleX + FIN_W + COL_GAP;

  const svgLines = [], boxes = [];
  renderHalf(LEFT_ROUNDS,  leftStart,  true,  svgLines, boxes);
  renderHalf(RIGHT_ROUNDS, rightStart, false, svgLines, boxes);

  // HF Verbindungslinien zu Finale
  const sfY      = HEADER_H + bracketMatchY(1, 0) + BOX_H / 2;
  const sfLeftX  = leftStart + (LEFT_ROUNDS.length - 1) * COL_W + BOX_W;
  const hf1Win   = !!getWinner(state.koMatches, 'hf1');
  const hf2Win   = !!getWinner(state.koMatches, 'hf2');
  svgLines.push(`<path d="M${sfLeftX},${sfY} H${finaleX}" fill="none" stroke="${hf1Win?'#e8c84a':'#1e3050'}" stroke-width="1.5" stroke-linecap="round"/>`);
  svgLines.push(`<path d="M${finaleX+FIN_W},${sfY} H${rightStart}" fill="none" stroke="${hf2Win?'#e8c84a':'#1e3050'}" stroke-width="1.5" stroke-linecap="round"/>`);

  // Finale + Platz3
  const finY  = HEADER_H + bracketMatchY(1, 0);
  const p3Y   = finY + BOX_H + 52;
  const p3MidX = finaleX + FIN_W / 2;
  const hfBottomY = finY + BOX_H;

  // Gestrichelte Linien zu Platz 3
  const hfLeftMidX  = finaleX - COL_W + COL_W / 2;
  const hfRightMidX = rightStart + BOX_W / 2;
  svgLines.push(`<path d="M${hfLeftMidX},${hfBottomY} V${p3Y-6} H${p3MidX} V${p3Y}" fill="none" stroke="#334455" stroke-width="1" stroke-dasharray="5,3"/>`);
  svgLines.push(`<path d="M${hfRightMidX},${hfBottomY} V${p3Y-6} H${p3MidX}" fill="none" stroke="#334455" stroke-width="1" stroke-dasharray="5,3"/>`);

  boxes.push(`<div class="round-label" style="position:absolute;left:${finaleX}px;top:0;width:${FIN_W}px;text-align:center;color:#e8c84a;">FINALE</div>`);
  boxes.push(matchBox('finale', finaleX, finY, FIN_W, true));
  boxes.push(matchBox('platz3', finaleX + (FIN_W - BOX_W) / 2, p3Y, BOX_W, false));

  const fullH = Math.max(totalH, p3Y + BOX_H + 40);

  container.innerHTML = `
    <div class="bracket-wrap">
      <div class="bracket-inner" style="width:${totalW}px;height:${fullH}px;position:relative;">
        <svg style="position:absolute;top:0;left:0;width:${totalW}px;height:${fullH}px;pointer-events:none;">
          ${svgLines.join('')}
        </svg>
        ${boxes.join('')}
      </div>
    </div>`;

  container.querySelectorAll('.ko-score').forEach(inp => {
    inp.addEventListener('change', onKOScoreInput);
  });
}

function onKOScoreInput(e) {
  const { match: matchId, side } = e.target.dataset;
  const val = e.target.value.trim();
  if (!state.koMatches[matchId]) state.koMatches[matchId] = {};
  state.koMatches[matchId][side === 'h' ? 'hScore' : 'aScore'] = val === '' ? null : parseInt(val, 10);
  save();
  renderBracket();
}

// ── Tabs ──────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// ── Reset ─────────────────────────────────────────────────────
document.getElementById('btn-reset')?.addEventListener('click', () => {
  if (!confirm('Alle Eingaben zurücksetzen?')) return;
  state = resetState();
  renderGroups();
  renderBracket();
});

// ── Export PDF ────────────────────────────────────────────────
const exportBtn  = document.getElementById('btn-export');
const exportMenu = document.getElementById('export-menu');

exportBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  exportMenu.classList.toggle('open');
});

document.addEventListener('click', () => exportMenu?.classList.remove('open'));

async function exportPDF(allPages) {
  const opt = {
    margin:      [8, 8, 8, 8],
    filename:    'WM2026-Poster.pdf',
    image:       { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#080f1e' },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'landscape' },
  };

  exportMenu.classList.remove('open');
  exportBtn.textContent = '⏳ Wird erstellt...';
  exportBtn.disabled = true;

  try {
    if (!allPages) {
      // Aktuelle Seite
      const active = document.querySelector('.tab-panel.active');
      await html2pdf().set(opt).from(active).save();
    } else {
      // Alle Seiten: Gruppen + Bracket nacheinander
      const panels = [
        document.getElementById('tab-groups'),
        document.getElementById('tab-bracket'),
      ];
      // Zeige alle kurz an für Rendering
      let pdf = html2pdf().set(opt);
      for (let i = 0; i < panels.length; i++) {
        panels[i].style.display = 'block';
      }
      // Multi-page: Gruppen als erste Seite, Bracket als zweite
      const groupsEl  = document.getElementById('tab-groups');
      const bracketEl = document.getElementById('tab-bracket');
      const worker = html2pdf().set({...opt, filename:'WM2026-Poster-Alle.pdf'})
        .from(groupsEl)
        .toContainer()
        .toCanvas()
        .toPdf()
        .get('pdf')
        .then(pdfObj => {
          pdfObj.addPage();
        })
        .from(bracketEl)
        .toContainer()
        .toCanvas()
        .toPdf()
        .save();

      await worker;

      // Nur aktive Tab wieder sichtbar
      panels.forEach(p => p.style.display = '');
      document.querySelector('.tab-panel.active').style.display = 'block';
    }
  } catch(err) {
    console.error('PDF Fehler:', err);
    alert('PDF-Export fehlgeschlagen. Bitte versuche "Aktuelle Seite".');
  }

  exportBtn.textContent = '⬇ PDF Export';
  exportBtn.disabled = false;
}

document.getElementById('exp-current')?.addEventListener('click', () => exportPDF(false));
document.getElementById('exp-all')?.addEventListener('click',     () => exportPDF(true));

// ── Init ──────────────────────────────────────────────────────
initTabs();
renderGroups();
renderBracket();
