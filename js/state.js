// state.js — Zustandsverwaltung via localStorage

const STORAGE_KEY = 'wm2026_tipp';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createEmptyState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function createEmptyState() {
  return {
    // Gruppenspiele: { 'A_0': {h:null, a:null}, ... }
    // Key: Gruppe_MatchIndex
    groupScores: {},
    // K.o.-Spiele: { 'szf1': {home:'',away:'',hScore:null,aScore:null}, ... }
    koMatches: {},
  };
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return createEmptyState();
}
