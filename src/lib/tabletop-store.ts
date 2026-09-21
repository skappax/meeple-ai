/**
 * Tabletop Tools State Management & Persistence
 * Preserves players, colors, scores, dice pools, and timer settings across modal open/close and page reloads.
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
  { id: 'yellow', name: 'Giallo', bg: 'bg-amber-400', hex: '#fbbf24', text: 'text-amber-400', border: 'border-amber-400' },
  { id: 'purple', name: 'Viola', bg: 'bg-purple-500', hex: '#a855f7', text: 'text-purple-400', border: 'border-purple-500' },
  { id: 'orange', name: 'Arancione', bg: 'bg-orange-500', hex: '#f97316', text: 'text-orange-400', border: 'border-orange-500' },
  { id: 'cyan', name: 'Ciano', bg: 'bg-cyan-500', hex: '#06b6d4', text: 'text-cyan-400', border: 'border-cyan-500' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-500', hex: '#ec4899', text: 'text-pink-400', border: 'border-pink-500' },
  { id: 'white', name: 'Bianco', bg: 'bg-slate-200', hex: '#e2e8f0', text: 'text-slate-100', border: 'border-slate-300' },
  { id: 'black', name: 'Nero', bg: 'bg-slate-700', hex: '#334155', text: 'text-slate-300', border: 'border-slate-600' },
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
      { id: 'd_1', sides: 6, label: 'D6' },
      { id: 'd_2', sides: 6, label: 'D6' },
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
      return {
        ...DEFAULT_TABLETOP_STATE,
        ...parsed,
        players: Array.isArray(parsed.players) && parsed.players.length > 0 ? parsed.players : DEFAULT_TABLETOP_STATE.players,
        timer: { ...DEFAULT_TABLETOP_STATE.timer, ...(parsed.timer || {}) },
        dice: { ...DEFAULT_TABLETOP_STATE.dice, ...(parsed.dice || {}) },
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
