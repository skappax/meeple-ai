/**
 * Tabletop Tools State Management & Global Roster Persistence
 * Preserves unified players, colors, scores, dice pools, and timer settings across all tools.
 */

export interface TablePlayer {
  id: string;
  name: string;
  colorId: string;
  score: number;
  scoreHistory: number[];
  timeUsedSeconds: number;
}

export interface PaletteColor {
  id: string;
  name: string;
  bg: string;
  hex: string;
  text: string;
  border: string;
}

export const PALETTE_COLORS: PaletteColor[] = [
  { id: 'red', name: 'Rosso', bg: 'bg-red-500', hex: '#ef4444', text: 'text-red-400', border: 'border-red-500' },
  { id: 'blue', name: 'Blu', bg: 'bg-blue-500', hex: '#3b82f6', text: 'text-blue-400', border: 'border-blue-500' },
  { id: 'green', name: 'Verde', bg: 'bg-emerald-500', hex: '#10b981', text: 'text-emerald-400', border: 'border-emerald-500' },
  { id: 'yellow', name: 'Giallo', bg: 'bg-amber-400', hex: '#facc15', text: 'text-amber-300', border: 'border-amber-400' },
  { id: 'purple', name: 'Viola', bg: 'bg-purple-500', hex: '#a855f7', text: 'text-purple-400', border: 'border-purple-500' },
  { id: 'orange', name: 'Arancione', bg: 'bg-orange-500', hex: '#f97316', text: 'text-orange-400', border: 'border-orange-500' },
  { id: 'cyan', name: 'Ciano', bg: 'bg-cyan-500', hex: '#06b6d4', text: 'text-cyan-400', border: 'border-cyan-500' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-500', hex: '#ec4899', text: 'text-pink-400', border: 'border-pink-500' },
  { id: 'white', name: 'Bianco', bg: 'bg-white', hex: '#ffffff', text: 'text-slate-100', border: 'border-slate-300' },
  { id: 'wood', name: 'Legno', bg: 'bg-amber-800', hex: '#854d0e', text: 'text-amber-500', border: 'border-amber-700' },
];

export function getColorById(id: string): PaletteColor {
  return PALETTE_COLORS.find((c) => c.id === id) || PALETTE_COLORS[0];
}

export interface DiceType {
  sides: number;
  label: string;
  color: string;
}

export const AVAILABLE_DICE: DiceType[] = [
  { sides: 3, label: 'D3', color: 'text-sky-400' },
  { sides: 4, label: 'D4', color: 'text-teal-400' },
  { sides: 6, label: 'D6', color: 'text-amber-400' },
  { sides: 8, label: 'D8', color: 'text-orange-400' },
  { sides: 10, label: 'D10', color: 'text-rose-400' },
  { sides: 12, label: 'D12', color: 'text-pink-400' },
  { sides: 20, label: 'D20', color: 'text-purple-400' },
  { sides: 100, label: 'D100', color: 'text-indigo-400' },
];

export interface DicePoolItem {
  id: string;
  sides: number;
  label: string;
}

export interface DiceRollResult {
  id: string;
  timestamp: number;
  rolls: { label: string; sides: number; value: number }[];
  modifier: number;
  total: number;
}

export interface TabletopToolsState {
  players: TablePlayer[];
  timer: {
    mode: 'turn' | 'chess';
    turnDuration: number;
    turnTimeLeft: number;
    activePlayerIndex: number;
    soundEnabled: boolean;
  };
  dice: {
    pool: DicePoolItem[];
    modifier: number;
    lastResult: DiceRollResult | null;
    history: DiceRollResult[];
  };
  firstPlayer: {
    lastWinnerIndex: number | null;
  };
}

export const DEFAULT_TABLETOP_STATE: TabletopToolsState = {
  players: [
    { id: 'p_1', name: 'Giocatore 1', colorId: 'red', score: 0, scoreHistory: [], timeUsedSeconds: 0 },
    { id: 'p_2', name: 'Giocatore 2', colorId: 'blue', score: 0, scoreHistory: [], timeUsedSeconds: 0 },
    { id: 'p_3', name: 'Giocatore 3', colorId: 'green', score: 0, scoreHistory: [], timeUsedSeconds: 0 },
    { id: 'p_4', name: 'Giocatore 4', colorId: 'yellow', score: 0, scoreHistory: [], timeUsedSeconds: 0 },
  ],
  timer: {
    mode: 'turn',
    turnDuration: 60,
    turnTimeLeft: 60,
    activePlayerIndex: 0,
    soundEnabled: true,
  },
  dice: {
    pool: [
      { id: 'd_1', sides: 6, label: 'D6' }, // Default standard 1D6!
    ],
    modifier: 0,
    lastResult: null,
    history: [],
  },
  firstPlayer: {
    lastWinnerIndex: null,
  },
};

const STORAGE_KEY = 'meeple_ai_tabletop_tools_v2';

export function loadTabletopState(): TabletopToolsState {
  if (typeof window === 'undefined') return DEFAULT_TABLETOP_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure pool defaults to 1D6 if empty or malformed
      const pool = Array.isArray(parsed.dice?.pool) && parsed.dice.pool.length > 0
        ? parsed.dice.pool
        : DEFAULT_TABLETOP_STATE.dice.pool;

      return {
        ...DEFAULT_TABLETOP_STATE,
        ...parsed,
        players: Array.isArray(parsed.players) && parsed.players.length > 0 ? parsed.players : DEFAULT_TABLETOP_STATE.players,
        timer: { ...DEFAULT_TABLETOP_STATE.timer, ...(parsed.timer || {}) },
        dice: { ...DEFAULT_TABLETOP_STATE.dice, ...(parsed.dice || {}), pool },
        firstPlayer: { ...DEFAULT_TABLETOP_STATE.firstPlayer, ...(parsed.firstPlayer || {}) },
      };
    }
  } catch (err) {
    console.error('Failed to load tabletop state from localStorage:', err);
  }
  return DEFAULT_TABLETOP_STATE;
}

export function saveTabletopState(state: TabletopToolsState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save tabletop state to localStorage:', err);
  }
}

/**
 * Adjust player count globally (between 2 and 8 players), preserving existing data.
 */
export function setPlayerCount(state: TabletopToolsState, count: number): TabletopToolsState {
  const targetCount = Math.max(2, Math.min(8, count));
  const current = [...state.players];

  let newPlayers: TablePlayer[];
  if (targetCount > current.length) {
    newPlayers = [...current];
    for (let i = current.length; i < targetCount; i++) {
      const color = PALETTE_COLORS[i % PALETTE_COLORS.length];
      newPlayers.push({
        id: 'p_' + (i + 1) + '_' + Date.now().toString(36),
        name: `Giocatore ${i + 1}`,
        colorId: color.id,
        score: 0,
        scoreHistory: [],
        timeUsedSeconds: 0,
      });
    }
  } else {
    newPlayers = current.slice(0, targetCount);
  }

  const activePlayerIndex = Math.min(state.timer.activePlayerIndex, targetCount - 1);
  const lastWinnerIndex =
    state.firstPlayer.lastWinnerIndex !== null && state.firstPlayer.lastWinnerIndex < targetCount
      ? state.firstPlayer.lastWinnerIndex
      : null;

  return {
    ...state,
    players: newPlayers,
    timer: {
      ...state.timer,
      activePlayerIndex,
    },
    firstPlayer: {
      ...state.firstPlayer,
      lastWinnerIndex,
    },
  };
}

/**
 * Update player name across all tools
 */
export function updatePlayerName(state: TabletopToolsState, playerId: string, name: string): TabletopToolsState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, name } : p)),
  };
}

/**
 * Update player color across all tools
 */
export function updatePlayerColor(state: TabletopToolsState, playerId: string, colorId: string): TabletopToolsState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, colorId } : p)),
  };
}

/**
 * Update player score
 */
export function updatePlayerScore(state: TabletopToolsState, playerId: string, delta: number): TabletopToolsState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            score: p.score + delta,
            scoreHistory: [...p.scoreHistory.slice(-4), delta],
          }
        : p
    ),
  };
}

/**
 * Reset all scores to 0
 */
export function resetAllScores(state: TabletopToolsState): TabletopToolsState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, score: 0, scoreHistory: [] })),
  };
}
