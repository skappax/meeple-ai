'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Timer, 
  Dices, 
  Crown, 
  Calculator, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Shuffle, 
  Volume2, 
  VolumeX,
  Trash2,
  SkipForward,
  Check
} from 'lucide-react';
import { 
  TablePlayer, 
  PALETTE_COLORS, 
  getColorById, 
  AVAILABLE_DICE, 
  DicePoolItem, 
  TabletopToolsState, 
  loadTabletopState, 
  saveTabletopState 
} from '@/lib/tabletop-store';

export type GameToolType = 'timer' | 'dice' | 'first-player' | 'score';

interface GameToolsProps {
  activeTool: GameToolType | null;
  onClose: () => void;
}

// Sintesi acustica con Web Audio API (0 dipendenze esterne)
function playBeep(isEnd = false) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isEnd) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch {
    // Non supportato o bloccato dalle policy del browser
  }
}

/* ==========================================================================
   COLOR PICKER POPOVER
   ========================================================================== */
interface ColorPickerProps {
  currentColorId: string;
  onSelectColor: (colorId: string) => void;
  onClose: () => void;
}

function ColorPickerPopover({ currentColorId, onSelectColor, onClose }: ColorPickerProps) {
  return (
    <div className="absolute left-0 top-8 z-50 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-150">
      {PALETTE_COLORS.map((c) => (
        <button
          key={c.id}
          onClick={() => {
            onSelectColor(c.id);
            onClose();
          }}
          className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm ${
            currentColorId === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
          }`}
          title={c.name}
        >
          {currentColorId === c.id && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
        </button>
      ))}
    </div>
  );
}

/* ==========================================================================
   1. TOOL TIMER GIOCHI DA TAVOLO (Countdown Turno & Passa Turno Multi-Giocatore)
   ========================================================================== */
interface TimerToolProps {
  state: TabletopToolsState;
  onChange: (updater: (prev: TabletopToolsState) => TabletopToolsState) => void;
}

function TimerTool({ state, onChange }: TimerToolProps) {
  const PRESETS = [30, 45, 60, 90, 120, 180];
  const [isRunning, setIsRunning] = useState(false);
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  const activeIdx = state.timer.activePlayerIndex % (state.players.length || 1);
  const activePlayer = state.players[activeIdx] || state.players[0];
  const activeColor = getColorById(activePlayer.colorId);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && state.timer.turnTimeLeft > 0) {
      interval = setInterval(() => {
        onChange((prev) => {
          if (prev.timer.turnTimeLeft <= 1) {
            if (prev.timer.soundEnabled) playBeep(true);
            setIsRunning(false);
            return {
              ...prev,
              timer: { ...prev.timer, turnTimeLeft: 0 },
            };
          }
          if (prev.timer.soundEnabled && prev.timer.turnTimeLeft <= 4) {
            playBeep(false); // Tick avviso negli ultimi 3 secondi
          }

          // Aggiunge 1 secondo al tempo usato dal giocatore attivo
          const updatedPlayers = prev.players.map((p, idx) =>
            idx === activeIdx ? { ...p, timeUsedSeconds: p.timeUsedSeconds + 1 } : p
          );

          return {
            ...prev,
            players: updatedPlayers,
            timer: { ...prev.timer, turnTimeLeft: prev.timer.turnTimeLeft - 1 },
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, state.timer.turnTimeLeft, activeIdx, onChange]);

  const selectPreset = (secs: number) => {
    setIsRunning(false);
    onChange((prev) => ({
      ...prev,
      timer: { ...prev.timer, turnDuration: secs, turnTimeLeft: secs },
    }));
  };

  const resetCurrentTurn = () => {
    setIsRunning(false);
    onChange((prev) => ({
      ...prev,
      timer: { ...prev.timer, turnTimeLeft: prev.timer.turnDuration },
    }));
  };

  const passTurn = () => {
    playBeep(false);
    onChange((prev) => {
      const nextIdx = (prev.timer.activePlayerIndex + 1) % prev.players.length;
      return {
        ...prev,
        timer: {
          ...prev.timer,
          activePlayerIndex: nextIdx,
          turnTimeLeft: prev.timer.turnDuration,
        },
      };
    });
  };

  const toggleSound = () => {
    onChange((prev) => ({
      ...prev,
      timer: { ...prev.timer, soundEnabled: !prev.timer.soundEnabled },
    }));
  };

  const minutes = Math.floor(state.timer.turnTimeLeft / 60);
  const seconds = state.timer.turnTimeLeft % 60;
  const progress = state.timer.turnDuration > 0 ? (state.timer.turnTimeLeft / state.timer.turnDuration) * 100 : 0;
  const isUrgent = state.timer.turnTimeLeft <= 5 && state.timer.turnTimeLeft > 0;

  return (
    <div className="flex flex-col items-center gap-4 py-1">
      {/* Preset Duration Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              state.timer.turnDuration === p
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {p >= 60 ? `${p / 60}m` : `${p}s`}
          </button>
        ))}
      </div>

      {/* Active Player Banner */}
      <div className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between transition-all ${activeColor.border} bg-slate-900/90 shadow-lg`}>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setEditingColorIdx(editingColorIdx === activeIdx ? null : activeIdx)}
            className={`w-5 h-5 rounded-full ${activeColor.bg} border border-white/30 shadow-sm transition-transform hover:scale-110`}
            title="Cambia colore giocatore"
          />
          {editingColorIdx === activeIdx && (
            <ColorPickerPopover
              currentColorId={activePlayer.colorId}
              onSelectColor={(colId) => {
                onChange((prev) => ({
                  ...prev,
                  players: prev.players.map((p, idx) => (idx === activeIdx ? { ...p, colorId: colId } : p)),
                }));
              }}
              onClose={() => setEditingColorIdx(null)}
            />
          )}
          <span className="text-xs font-bold text-slate-100">
            Turno di: <span className={`${activeColor.text} text-sm font-black`}>{activePlayer.name}</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Totale: {Math.floor(activePlayer.timeUsedSeconds / 60)}m {activePlayer.timeUsedSeconds % 60}s
        </div>
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-800/60" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * progress) / 100}
            strokeLinecap="round"
            className={`transition-all duration-500 ${
              isUrgent ? 'text-red-500 animate-pulse' : state.timer.turnTimeLeft === 0 ? 'text-slate-600' : activeColor.text
            }`}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tight tabular-nums ${
            isUrgent ? 'text-red-400' : state.timer.turnTimeLeft === 0 ? 'text-slate-500' : 'text-slate-100'
          }`}>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            {state.timer.turnTimeLeft === 0 ? 'Tempo Scaduto!' : isRunning ? 'In corso' : 'In pausa'}
          </span>
        </div>
      </div>

      {/* Primary Action Buttons: Start/Pause + PASSA TURNO */}
      <div className="flex items-center gap-2.5 w-full justify-center">
        <button
          onClick={toggleSound}
          className={`p-2.5 rounded-xl border transition-all ${
            state.timer.soundEnabled ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={state.timer.soundEnabled ? 'Suono attivo' : 'Muto'}
        >
          {state.timer.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
            isRunning ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pausa' : 'Avvia'}</span>
        </button>

        {/* Big PASSA TURNO Button */}
        <button
          onClick={passTurn}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          title="Conclude il turno e passa al prossimo giocatore"
        >
          <SkipForward className="w-4 h-4" />
          <span>Passa Turno</span>
        </button>

        <button
          onClick={resetCurrentTurn}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
          title="Resetta tempo turno"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. TOOL LANCIA DADI MULTIPLI & CUSTOM POOL BUILDER
   ========================================================================== */
interface DiceToolProps {
  state: TabletopToolsState;
  onChange: (updater: (prev: TabletopToolsState) => TabletopToolsState) => void;
}

function DiceTool({ state, onChange }: DiceToolProps) {
  const [isRolling, setIsRolling] = useState(false);

  const addDieToPool = (sides: number, label: string) => {
    if (state.dice.pool.length >= 12) return;
    const newDie: DicePoolItem = {
      id: 'die_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sides,
      label,
    };
    onChange((prev) => ({
      ...prev,
      dice: { ...prev.dice, pool: [...prev.dice.pool, newDie] },
    }));
  };

  const removeDieFromPool = (id: string) => {
    onChange((prev) => ({
      ...prev,
      dice: { ...prev.dice, pool: prev.dice.pool.filter((d) => d.id !== id) },
    }));
  };

  const clearPool = () => {
    onChange((prev) => ({
      ...prev,
      dice: { ...prev.dice, pool: [] },
    }));
  };

  const setPreset = (preset: { sides: number; label: string }[]) => {
    const newPool = preset.map((d, i) => ({
      id: `p_${i}_${Date.now()}`,
      sides: d.sides,
      label: d.label,
    }));
    onChange((prev) => ({
      ...prev,
      dice: { ...prev.dice, pool: newPool },
    }));
  };

  const rollAllDice = () => {
    if (state.dice.pool.length === 0) return;
    setIsRolling(true);
    playBeep(false);

    setTimeout(() => {
      const rolls = state.dice.pool.map((die) => ({
        label: die.label,
        sides: die.sides,
        value: Math.floor(Math.random() * die.sides) + 1,
      }));

      const diceSum = rolls.reduce((sum, r) => sum + r.value, 0);
      const total = diceSum + state.dice.modifier;

      const newResult = {
        id: 'res_' + Date.now(),
        timestamp: Date.now(),
        rolls,
        modifier: state.dice.modifier,
        total,
      };

      onChange((prev) => ({
        ...prev,
        dice: {
          ...prev.dice,
          lastResult: newResult,
          history: [newResult, ...prev.dice.history.slice(0, 4)],
        },
      }));
      setIsRolling(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Quick Add Bar */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Aggiungi dadi al vassoio:
        </span>
        <div className="flex flex-wrap gap-1">
          {AVAILABLE_DICE.map((d) => (
            <button
              key={d.label}
              onClick={() => addDieToPool(d.sides, d.label)}
              className="px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span className={d.color}>+{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Presets Chips */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-500 uppercase">Preset:</span>
        <button onClick={() => setPreset([{ sides: 6, label: 'D6' }])} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700">1D6</button>
        <button onClick={() => setPreset([{ sides: 6, label: 'D6' }, { sides: 6, label: 'D6' }])} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700">2D6</button>
        <button onClick={() => setPreset([{ sides: 6, label: 'D6' }, { sides: 6, label: 'D6' }, { sides: 6, label: 'D6' }])} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700">3D6</button>
        <button onClick={() => setPreset([{ sides: 20, label: 'D20' }])} className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 hover:bg-slate-700">1D20</button>
        <button onClick={() => setPreset([{ sides: 3, label: 'D3' }, { sides: 6, label: 'D6' }])} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 hover:bg-slate-700">D3+D6</button>
        <button onClick={() => setPreset([{ sides: 100, label: 'D100' }])} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700">D100%</button>
      </div>

      {/* Current Dice Pool (Tray) */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-400">
            Dadi nel vassoio ({state.dice.pool.length}):
          </span>
          {state.dice.pool.length > 0 && (
            <button onClick={clearPool} className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-0.5">
              <Trash2 className="w-3 h-3" /> Svuota
            </button>
          )}
        </div>

        {state.dice.pool.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2 text-center">
            Vassoio vuoto. Seleziona i dadi sopra per comporre il tuo lancio!
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
            {state.dice.pool.map((die) => (
              <span
                key={die.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
              >
                {die.label}
                <button onClick={() => removeDieFromPool(die.id)} className="text-slate-400 hover:text-red-400 p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Modifier */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Modificatore Bonus / Malus:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChange((p) => ({ ...p, dice: { ...p.dice, modifier: p.dice.modifier - 1 } }))}
              className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
            >
              -
            </button>
            <span className="w-6 text-center font-mono font-bold text-amber-300">
              {state.dice.modifier >= 0 ? `+${state.dice.modifier}` : state.dice.modifier}
            </span>
            <button
              onClick={() => onChange((p) => ({ ...p, dice: { ...p.dice, modifier: p.dice.modifier + 1 } }))}
              className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Roll Button */}
      <button
        onClick={rollAllDice}
        disabled={isRolling || state.dice.pool.length === 0}
        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>LANCIA TUTTI I DADI ({state.dice.pool.length})</span>
      </button>

      {/* Results Display */}
      {state.dice.lastResult && (
        <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/40 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Esito Lancio:</span>
            <span className="text-2xl font-black text-amber-300 tabular-nums font-mono">
              {state.dice.lastResult.total}
            </span>
          </div>

          {/* Dice Results Pills */}
          <div className="flex flex-wrap gap-1.5">
            {state.dice.lastResult.rolls.map((r, i) => (
              <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200">
                <span className="text-[10px] text-purple-400 mr-1">{r.label}:</span>
                <span className="text-white font-black">{r.value}</span>
              </span>
            ))}
            {state.dice.lastResult.modifier !== 0 && (
              <span className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-amber-400">
                Bonus: {state.dice.lastResult.modifier >= 0 ? `+${state.dice.lastResult.modifier}` : state.dice.lastResult.modifier}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. TOOL CHI INIZIA? (First Player Roulette tra i Giocatori del Tavolo)
   ========================================================================== */
interface FirstPlayerToolProps {
  state: TabletopToolsState;
  onChange: (updater: (prev: TabletopToolsState) => TabletopToolsState) => void;
}

function FirstPlayerTool({ state, onChange }: FirstPlayerToolProps) {
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  const players = state.players;

  const pickFirstPlayer = () => {
    if (players.length < 2) return;
    setIsSpinning(true);
    setHighlightIdx(null);
    playBeep(false);

    let count = 0;
    const maxCycles = 18;
    const interval = setInterval(() => {
      setHighlightIdx(Math.floor(Math.random() * players.length));
      count++;
      if (count >= maxCycles) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * players.length);
        setHighlightIdx(finalIdx);
        onChange((prev) => ({
          ...prev,
          firstPlayer: { lastWinnerIndex: finalIdx },
        }));
        setIsSpinning(false);
        playBeep(true);
      }
    }, 75);
  };

  const winnerIdx = state.firstPlayer.lastWinnerIndex;
  const winner = winnerIdx !== null && winnerIdx < players.length ? players[winnerIdx] : null;
  const winnerColor = winner ? getColorById(winner.colorId) : null;

  return (
    <div className="flex flex-col items-center gap-4 py-1">
      <span className="text-xs text-slate-400 font-medium text-center">
        Estrae a sorte chi inizia tra i {players.length} giocatori al tavolo:
      </span>

      {/* Players Color Grid */}
      <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
        {players.map((p, idx) => {
          const color = getColorById(p.colorId);
          const isHighlighted = highlightIdx === idx;
          const isWinner = winnerIdx === idx && !isSpinning;
          return (
            <div key={p.id} className="relative">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isHighlighted || isWinner
                    ? `${color.border} bg-slate-800 scale-105 shadow-md shadow-amber-500/10`
                    : 'border-slate-800 bg-slate-900/60 opacity-70'
                }`}
              >
                <button
                  onClick={() => setEditingColorIdx(editingColorIdx === idx ? null : idx)}
                  className={`w-3.5 h-3.5 rounded-full ${color.bg} shrink-0 hover:scale-110`}
                  title="Cambia colore"
                />
                <span className={`text-xs font-bold ${color.text} max-w-[80px] truncate`}>
                  {p.name}
                </span>
              </div>

              {editingColorIdx === idx && (
                <ColorPickerPopover
                  currentColorId={p.colorId}
                  onSelectColor={(colId) => {
                    onChange((prev) => ({
                      ...prev,
                      players: prev.players.map((pl, i) => (i === idx ? { ...pl, colorId: colId } : pl)),
                    }));
                  }}
                  onClose={() => setEditingColorIdx(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Winner Display Box */}
      <div className="w-full h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
        {winner && winnerColor ? (
          <div className="flex items-center gap-2 animate-bounce">
            <Crown className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-sm font-bold text-slate-100">
              Inizia: <span className={`${winnerColor.text} font-black text-base`}>{winner.name}</span>
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Tocca per estrarre chi parte</span>
        )}
      </div>

      {/* Spin Button */}
      <button
        onClick={pickFirstPlayer}
        disabled={isSpinning || players.length < 2}
        className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      >
        <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        <span>Estrai Primo Giocatore</span>
      </button>
    </div>
  );
}

/* ==========================================================================
   4. TOOL SEGNAPUNTI RAPIDO CON CUSTOM NUMBER INPUT
   ========================================================================== */
interface ScoreToolProps {
  state: TabletopToolsState;
  onChange: (updater: (prev: TabletopToolsState) => TabletopToolsState) => void;
}

function ScoreTool({ state, onChange }: ScoreToolProps) {
  const [customDelta, setCustomDelta] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(state.players[0]?.id || '');
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  const addPlayer = () => {
    if (state.players.length >= 8) return;
    const nextIdx = state.players.length;
    const defaultColor = PALETTE_COLORS[nextIdx % PALETTE_COLORS.length];
    const newPlayer: TablePlayer = {
      id: 'p_' + Date.now(),
      name: `Giocatore ${nextIdx + 1}`,
      colorId: defaultColor.id,
      score: 0,
      scoreHistory: [],
      timeUsedSeconds: 0,
    };
    onChange((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  };

  const removePlayer = (id: string) => {
    if (state.players.length <= 1) return;
    onChange((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }));
  };

  const updateScore = (id: string, delta: number) => {
    onChange((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === id
          ? {
              ...p,
              score: p.score + delta,
              scoreHistory: [...p.scoreHistory.slice(-4), delta],
            }
          : p
      ),
    }));
  };

  const applyCustomScore = (isAdd: boolean) => {
    const val = parseInt(customDelta, 10);
    if (isNaN(val) || val === 0) return;
    const delta = isAdd ? Math.abs(val) : -Math.abs(val);
    updateScore(selectedPlayerId, delta);
    setCustomDelta('');
  };

  const resetAllScores = () => {
    onChange((prev) => ({
      ...prev,
      players: prev.players.map((p) => ({ ...p, score: 0, scoreHistory: [] })),
    }));
  };

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400">
          Giocatori al tavolo: {state.players.length}
        </span>
        <div className="flex items-center gap-2">
          {state.players.length < 8 && (
            <button
              onClick={addPlayer}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-all"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          )}
          <button
            onClick={resetAllScores}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all"
            title="Azzera punteggi"
          >
            <RotateCcw className="w-3 h-3" /> Azzera
          </button>
        </div>
      </div>

      {/* Players List with Quick +/- and Colors */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {state.players.map((p, idx) => {
          const color = getColorById(p.colorId);
          const isSelectedForCustom = selectedPlayerId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlayerId(p.id)}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                isSelectedForCustom ? 'bg-slate-800/90 border-amber-500/50' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Player Color Dot & Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingColorIdx(editingColorIdx === idx ? null : idx);
                  }}
                  className={`w-4 h-4 rounded-full ${color.bg} shrink-0 hover:scale-110`}
                  title="Cambia colore"
                />
                {editingColorIdx === idx && (
                  <ColorPickerPopover
                    currentColorId={p.colorId}
                    onSelectColor={(colId) => {
                      onChange((prev) => ({
                        ...prev,
                        players: prev.players.map((pl, i) => (i === idx ? { ...pl, colorId: colId } : pl)),
                      }));
                    }}
                    onClose={() => setEditingColorIdx(null)}
                  />
                )}

                <input
                  type="text"
                  value={p.name}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      players: prev.players.map((pl) => (pl.id === p.id ? { ...pl, name: val } : pl)),
                    }));
                  }}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none focus:border-b border-amber-500 w-full truncate"
                />
              </div>

              {/* Quick Score Buttons */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => updateScore(p.id, -5)}
                  className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold"
                  title="-5"
                >
                  -5
                </button>
                <button
                  onClick={() => updateScore(p.id, -1)}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold text-xs"
                  title="-1"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <span className={`w-9 text-center font-black text-sm tabular-nums font-mono ${color.text}`}>
                  {p.score}
                </span>

                <button
                  onClick={() => updateScore(p.id, 1)}
                  className="w-6 h-6 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 flex items-center justify-center font-bold text-xs"
                  title="+1"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => updateScore(p.id, 5)}
                  className="px-1.5 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 text-[10px] font-bold"
                  title="+5"
                >
                  +5
                </button>

                {state.players.length > 1 && (
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="p-1 rounded text-slate-600 hover:text-red-400 ml-1"
                    title="Rimuovi giocatore"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Score Addition Form */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700">
          <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">Somma custom:</span>
          <input
            type="number"
            placeholder="es. 23"
            value={customDelta}
            onChange={(e) => setCustomDelta(e.target.value)}
            className="w-full bg-transparent text-xs text-white font-mono font-bold focus:outline-none placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={() => applyCustomScore(false)}
          disabled={!customDelta}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-slate-700 hover:border-red-500/40 disabled:opacity-40 transition-all active:scale-95"
          title="Sottrai valore custom"
        >
          -
        </button>
        <button
          onClick={() => applyCustomScore(true)}
          disabled={!customDelta}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-amber-500/20"
          title="Aggiungi valore custom"
        >
          + Aggiungi
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT DIALOG WITH LOCALSTORAGE PERSISTENCE
   ========================================================================== */
export function GameTools({ activeTool, onClose }: GameToolsProps) {
  const [state, setState] = useState<TabletopToolsState>(loadTabletopState);

  // Auto-salvataggio ad ogni modifica di stato
  const updateState = useCallback((updater: (prev: TabletopToolsState) => TabletopToolsState) => {
    setState((prev) => {
      const updated = updater(prev);
      saveTabletopState(updated);
      return updated;
    });
  }, []);

  if (!activeTool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-2xl bg-[#141722] border border-slate-800 shadow-2xl p-4 sm:p-5 text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {activeTool === 'timer' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Timer Turno & Clessidra</h3>
                  <p className="text-[10px] text-slate-400">Countdown con Passa Turno e rintocco</p>
                </div>
              </>
            )}

            {activeTool === 'dice' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Dices className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Lancia Dadi Multipli</h3>
                  <p className="text-[10px] text-slate-400">Pool personalizzato (D3, D6, D20, D100)</p>
                </div>
              </>
            )}

            {activeTool === 'first-player' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Chi Inizia?</h3>
                  <p className="text-[10px] text-slate-400">Estrai tra i giocatori del tavolo</p>
                </div>
              </>
            )}

            {activeTool === 'score' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Segnapunti Rapido</h3>
                  <p className="text-[10px] text-slate-400">Contatore PV con custom input e colori</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {activeTool === 'timer' && <TimerTool state={state} onChange={updateState} />}
        {activeTool === 'dice' && <DiceTool state={state} onChange={updateState} />}
        {activeTool === 'first-player' && <FirstPlayerTool state={state} onChange={updateState} />}
        {activeTool === 'score' && <ScoreTool state={state} onChange={updateState} />}
      </div>
    </div>
  );
}
