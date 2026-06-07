// data.js — WM 2026 Tipp-Poster Datenbasis

export const GROUPS = {
  A: { teams: ['Mexiko','Südkorea','Südafrika','Tschechien'], flags: ['🇲🇽','🇰🇷','🇿🇦','🇨🇿'] },
  B: { teams: ['Kanada','Bosnien','Katar','Schweiz'],         flags: ['🇨🇦','🇧🇦','🇶🇦','🇨🇭'] },
  C: { teams: ['Brasilien','Marokko','Haiti','Schottland'],   flags: ['🇧🇷','🇲🇦','🇭🇹','🏴󠁧󠁢󠁳󠁣󠁴󠁿'] },
  D: { teams: ['USA','Paraguay','Australien','Türkei'],       flags: ['🇺🇸','🇵🇾','🇦🇺','🇹🇷'] },
  E: { teams: ['Deutschland','Curaçao','Elfenbeinküste','Ecuador'], flags: ['🇩🇪','🇨🇼','🇨🇮','🇪🇨'] },
  F: { teams: ['Niederlande','Japan','Schweden','Tunesien'],  flags: ['🇳🇱','🇯🇵','🇸🇪','🇹🇳'] },
  G: { teams: ['Belgien','Ägypten','Iran','Neuseeland'],      flags: ['🇧🇪','🇪🇬','🇮🇷','🇳🇿'] },
  H: { teams: ['Spanien','Kap Verde','Saudi-Arabien','Uruguay'], flags: ['🇪🇸','🇨🇻','🇸🇦','🇺🇾'] },
  I: { teams: ['Frankreich','Senegal','Irak','Norwegen'],     flags: ['🇫🇷','🇸🇳','🇮🇶','🇳🇴'] },
  J: { teams: ['Argentinien','Algerien','Österreich','Jordanien'], flags: ['🇦🇷','🇩🇿','🇦🇹','🇯🇴'] },
  K: { teams: ['Portugal','DR Kongo','Usbekistan','Kolumbien'], flags: ['🇵🇹','🇨🇩','🇺🇿','🇨🇴'] },
  L: { teams: ['England','Kroatien','Ghana','Panama'],        flags: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇭🇷','🇬🇭','🇵🇦'] },
};

// Gruppenspiele: [teamIndex1, teamIndex2, spieltag]
export const GROUP_MATCHES = {
  A: [[0,2,1],[1,3,1],[0,1,2],[2,3,2],[2,1,3],[3,0,3]],
  B: [[0,1,1],[2,3,1],[3,0,2],[1,2,2],[3,1,3],[0,2,3]],
  C: [[0,1,1],[2,3,1],[0,2,2],[1,3,2],[1,0,3],[3,2,3]],
  D: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  E: [[0,1,1],[2,3,1],[0,2,2],[1,3,2],[1,0,3],[3,2,3]],
  F: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  G: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  H: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  I: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  J: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  K: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
  L: [[0,1,1],[2,3,1],[0,2,2],[3,1,2],[3,0,3],[1,2,3]],
};

// K.o.-Runde: 16 SZF → 8 AF → 4 VF → 2 HF → Finale + Platz3
// Jedes Match: { id, round, label }
export const KO_STRUCTURE = {
  // SZF = Sechzehntelfinale
  szf: [
    { id: 'szf1',  label: 'SZF 1'  }, { id: 'szf2',  label: 'SZF 2'  },
    { id: 'szf3',  label: 'SZF 3'  }, { id: 'szf4',  label: 'SZF 4'  },
    { id: 'szf5',  label: 'SZF 5'  }, { id: 'szf6',  label: 'SZF 6'  },
    { id: 'szf7',  label: 'SZF 7'  }, { id: 'szf8',  label: 'SZF 8'  },
    { id: 'szf9',  label: 'SZF 9'  }, { id: 'szf10', label: 'SZF 10' },
    { id: 'szf11', label: 'SZF 11' }, { id: 'szf12', label: 'SZF 12' },
    { id: 'szf13', label: 'SZF 13' }, { id: 'szf14', label: 'SZF 14' },
    { id: 'szf15', label: 'SZF 15' }, { id: 'szf16', label: 'SZF 16' },
  ],
  // AF = Achtelfinale: af(n) = Sieger szf(2n-1) vs szf(2n)
  af: [
    { id: 'af1', szf: ['szf1','szf2']   }, { id: 'af2', szf: ['szf3','szf4']   },
    { id: 'af3', szf: ['szf5','szf6']   }, { id: 'af4', szf: ['szf7','szf8']   },
    { id: 'af5', szf: ['szf9','szf10']  }, { id: 'af6', szf: ['szf11','szf12'] },
    { id: 'af7', szf: ['szf13','szf14'] }, { id: 'af8', szf: ['szf15','szf16'] },
  ],
  // VF = Viertelfinale
  vf: [
    { id: 'vf1', af: ['af1','af2'] }, { id: 'vf2', af: ['af3','af4'] },
    { id: 'vf3', af: ['af5','af6'] }, { id: 'vf4', af: ['af7','af8'] },
  ],
  // HF = Halbfinale
  hf: [
    { id: 'hf1', vf: ['vf1','vf2'] },
    { id: 'hf2', vf: ['vf3','vf4'] },
  ],
  finale:  { id: 'finale', hf: ['hf1','hf2'] },
  platz3:  { id: 'platz3', hf: ['hf1','hf2'], losers: true },
};

// FIFA SZF-Paarungen (Gruppensieger/Zweite)
export const SZF_PAIRINGS = {
  szf1:  { home: '2A', away: '2B'  },
  szf2:  { home: '1E', away: '3rd' },
  szf3:  { home: '1F', away: '2C'  },
  szf4:  { home: '1C', away: '2F'  },
  szf5:  { home: '1I', away: '3rd' },
  szf6:  { home: '2E', away: '2I'  },
  szf7:  { home: '1A', away: '3rd' },
  szf8:  { home: '1L', away: '3rd' },
  szf9:  { home: '1D', away: '3rd' },
  szf10: { home: '1G', away: '3rd' },
  szf11: { home: '2K', away: '2L'  },
  szf12: { home: '1H', away: '2J'  },
  szf13: { home: '1B', away: '3rd' },
  szf14: { home: '1J', away: '2H'  },
  szf15: { home: '1K', away: '3rd' },
  szf16: { home: '2D', away: '2G'  },
};
