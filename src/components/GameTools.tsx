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
  Check,
  Trophy
} from 'lucide-react';
import { 
  PALETTE_COLORS, 
  getColorById, 
  AVAILABLE_DICE, 
  DicePoolItem, 
  TabletopToolsState, 
  loadTabletopState, 
  saveTabletopState,
  setPlayerCount,
  updatePlayerName,
  updatePlayerColor,
  updatePlayerScore,
  resetAllScores
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
    // Non supportato o silenziato
  }
}

/* ==========================================================================
   UNIFIED COMPONENT: SELETTORE NUMERO GIOCATORI AL TAVOLO
   ========================================================================== */
interface PlayerCountBarProps {
  count: number;
  onSelect: (count: number) => void;
}

function PlayerCountBar({ count, onSelect }: PlayerCountBarProps) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Giocatori al tavolo:
      </span>
      <div className="flex items-center gap-1">
        {[2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`w-6 h-6 rounded-lg text-xs font-black transition-all ${
              count === n
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-110 ring-1 ring-amber-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={`Imposta ${n} giocatori per tutti i tool`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   HIGH-CONTRAST COLOR PICKER POPOVER (PERFETTO PER DARK MODE)
   ========================================================================== */
interface ColorPickerProps {
  currentColorId: string;
  onSelectColor: (colorId: string) => void;
  onClose: () => void;
}

function ColorPickerPopover({ currentColorId, onSelectColor, onClose }: ColorPickerProps) {
  return (
    <div className="absolute left-0 top-9 z-50 p-3 rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150 w-64">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          Scegli Colore Pedina
        </span>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {PALETTE_COLORS.map((c) => {
          const isSelected = currentColorId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelectColor(c.id);
                onClose();
              }}
              className="flex flex-col items-center gap-1 group transition-transform hover:scale-105 active:scale-95"
              title={c.name}
            >
              <div
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md ${
                  c.id === 'white' ? 'border-2 border-slate-400 ring-1 ring-slate-300' : 'border border-white/20'
                } ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:ring-1 hover:ring-white/60'
                }`}
              >
                {isSelected && (
                  <Check className={`w-4 h-4 stroke-[3] ${c.id === 'white' ? 'text-slate-950' : 'text-white'}`} />
                )}
              </div>
              <span className="text-[9px] font-semibold text-slate-400 group-hover:text-slate-200 truncate w-full text-center">
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   1. TOOL TIMER GIOCHI DA TAVOLO (Countdown Turno, Passa Turno & Roster Unificato)
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

  // Countdown timer
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
            playBeep(false);
          }

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
    <div className="flex flex-col gap-3 py-1">
      {/* Selettore Globale Giocatori */}
      <PlayerCountBar
        count={state.players.length}
        onSelect={(n) => onChange((prev) => setPlayerCount(prev, n))}
      />

      {/* Preset Durata */}
      <div className="flex items-center justify-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              state.timer.turnDuration === p
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {p >= 60 ? `${p / 60}m` : `${p}s`}
          </button>
        ))}
      </div>

      {/* Banner Giocatore Attivo */}
      <div 
        style={{ borderColor: activeColor.hex }}
        className="w-full py-2 px-3 rounded-xl border bg-slate-900/95 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setEditingColorIdx(editingColorIdx === activeIdx ? null : activeIdx)}
            style={{ backgroundColor: activeColor.hex }}
            className="w-5 h-5 rounded-full border border-white/40 shadow-sm transition-transform hover:scale-110 cursor-pointer"
            title="Cambia colore giocatore"
          />
          {editingColorIdx === activeIdx && (
            <ColorPickerPopover
              currentColorId={activePlayer.colorId}
              onSelectColor={(colId) => onChange((prev) => updatePlayerColor(prev, activePlayer.id, colId))}
              onClose={() => setEditingColorIdx(null)}
            />
          )}
          <span className="text-xs font-bold text-slate-100">
            Turno di: <span style={{ color: activeColor.hex }} className="text-sm font-black">{activePlayer.name}</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Totale: {Math.floor(activePlayer.timeUsedSeconds / 60)}m {activePlayer.timeUsedSeconds % 60}s
        </div>
      </div>

      {/* Anello Progresso Circolare SVG */}
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-800/80" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke={isUrgent ? '#ef4444' : activeColor.hex}
            strokeWidth="6"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black tracking-tight tabular-nums font-mono ${
            isUrgent ? 'text-red-400 animate-pulse' : state.timer.turnTimeLeft === 0 ? 'text-slate-500' : 'text-slate-100'
          }`}>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            {state.timer.turnTimeLeft === 0 ? 'Tempo Scaduto!' : isRunning ? 'In corso' : 'In pausa'}
          </span>
        </div>
      </div>

      {/* Pulsanti Azione Principale: PASSA TURNO & START/PAUSE */}
      <div className="flex items-center gap-2 w-full justify-center">
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
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
            isRunning ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pausa' : 'Avvia'}</span>
        </button>

        {/* Pulsante Principale PASSA TURNO */}
        <button
          onClick={passTurn}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          title="Passa il turno al prossimo giocatore"
        >
          <SkipForward className="w-4 h-4 stroke-[3]" />
          <span>Passa Turno</span>
        </button>

        <button
          onClick={resetCurrentTurn}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
          title="Resetta countdown"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. TOOL LANCIA DADI (Preset Standard 1D6 & Multi-Dadi Personalizzabile)
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

  const resetToStandard = () => {
    onChange((prev) => ({
      ...prev,
      dice: {
        ...prev.dice,
        pool: [{ id: 'd_1_' + Date.now(), sides: 6, label: 'D6' }],
        modifier: 0,
      },
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
          history: [newResult, ...prev.dice.history.slice(0, 3)],
        },
      }));
      setIsRolling(false);
    }, 280);
  };

  const isStandard1D6 = state.dice.pool.length === 1 && state.dice.pool[0].sides === 6;

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Preset Rapidi (Standard 1D6 in evidenza) */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Preset di Lancio:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setPreset([{ sides: 6, label: 'D6' }])}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              isStandard1D6
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            🎲 1D6 (Standard)
          </button>
          <button
            type="button"
            onClick={() => setPreset([{ sides: 6, label: 'D6' }, { sides: 6, label: 'D6' }])}
            className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 text-xs font-bold"
          >
            2D6
          </button>
          <button
            type="button"
            onClick={() => setPreset([{ sides: 6, label: 'D6' }, { sides: 6, label: 'D6' }, { sides: 6, label: 'D6' }])}
            className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 text-xs font-bold"
          >
            3D6
          </button>
          <button
            type="button"
            onClick={() => setPreset([{ sides: 20, label: 'D20' }])}
            className="px-2 py-1 rounded-lg bg-slate-800 text-purple-300 hover:bg-slate-700 text-xs font-bold"
          >
            1D20
          </button>
          <button
            type="button"
            onClick={() => setPreset([{ sides: 100, label: 'D100' }])}
            className="px-2 py-1 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700 text-xs font-bold"
          >
            D100%
          </button>
        </div>
      </div>

      {/* Componi Dadi Multipli (+ Dadi) */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Aggiungi dadi al vassoio:
        </span>
        <div className="flex flex-wrap gap-1">
          {AVAILABLE_DICE.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => addDieToPool(d.sides, d.label)}
              className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60 transition-transform active:scale-95 flex items-center gap-1"
            >
              <span className={d.color}>+{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vassoio Dadi Attuale */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-300">
            Dadi nel vassoio ({state.dice.pool.length}):
          </span>
          <div className="flex items-center gap-2">
            {!isStandard1D6 && (
              <button 
                onClick={resetToStandard} 
                className="text-amber-400 hover:text-amber-300 text-[10px] font-semibold"
              >
                Ripristina 1D6
              </button>
            )}
            {state.dice.pool.length > 0 && (
              <button onClick={clearPool} className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-0.5">
                <Trash2 className="w-3 h-3" /> Svuota
              </button>
            )}
          </div>
        </div>

        {state.dice.pool.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-xs text-slate-400 mb-1">Vassoio vuoto.</p>
            <button 
              onClick={resetToStandard}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-sm"
            >
              Metti 1D6 Standard
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
            {state.dice.pool.map((die) => (
              <span
                key={die.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100"
              >
                {die.label}
                <button 
                  type="button"
                  onClick={() => removeDieFromPool(die.id)} 
                  className="text-slate-400 hover:text-red-400 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Modificatore Bonus / Malus */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium">Modificatore:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChange((p) => ({ ...p, dice: { ...p.dice, modifier: p.dice.modifier - 1 } }))}
              className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-amber-300">
              {state.dice.modifier >= 0 ? `+${state.dice.modifier}` : state.dice.modifier}
            </span>
            <button
              type="button"
              onClick={() => onChange((p) => ({ ...p, dice: { ...p.dice, modifier: p.dice.modifier + 1 } }))}
              className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Pulsante Lancio */}
      <button
        onClick={rollAllDice}
        disabled={isRolling || state.dice.pool.length === 0}
        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>LANCIA {state.dice.pool.length > 0 ? `${state.dice.pool.length} DAD${state.dice.pool.length === 1 ? 'O' : 'I'}` : ''}</span>
      </button>

      {/* Esito del Lancio */}
      {state.dice.lastResult && (
        <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/40 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Risultato:</span>
            <span className="text-2xl font-black text-amber-300 tabular-nums font-mono">
              {state.dice.lastResult.total}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {state.dice.lastResult.rolls.map((r, i) => (
              <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200">
                <span className="text-[10px] text-purple-400 mr-1">{r.label}:</span>
                <span className="text-white font-black text-sm">{r.value}</span>
              </span>
            ))}
            {state.dice.lastResult.modifier !== 0 && (
              <span className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-amber-400">
                Mod: {state.dice.lastResult.modifier >= 0 ? `+${state.dice.lastResult.modifier}` : state.dice.lastResult.modifier}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. TOOL CHI INIZIA? (Selettore Giocatori Immediato & Roster Unificato)
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
          timer: { ...prev.timer, activePlayerIndex: finalIdx } // Sincronizza anche il primo turno del timer!
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
    <div className="flex flex-col gap-3 py-1">
      {/* Selettore Globale Giocatori */}
      <PlayerCountBar
        count={players.length}
        onSelect={(n) => onChange((prev) => setPlayerCount(prev, n))}
      />

      {/* Griglia Giocatori con Colori e Nomi Modificabili */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Giocatori in gara (tocca colore per cambiarlo):
        </span>

        <div className="grid grid-cols-2 gap-2">
          {players.map((p, idx) => {
            const color = getColorById(p.colorId);
            const isHighlighted = highlightIdx === idx;
            const isWinner = winnerIdx === idx && !isSpinning;
            return (
              <div key={p.id} className="relative">
                <div
                  style={{
                    borderColor: isHighlighted || isWinner ? color.hex : '#334155',
                    backgroundColor: isHighlighted || isWinner ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.6)'
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                    isHighlighted || isWinner ? 'scale-105 shadow-md shadow-amber-500/20' : 'opacity-80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setEditingColorIdx(editingColorIdx === idx ? null : idx)}
                    style={{ backgroundColor: color.hex }}
                    className="w-4 h-4 rounded-full border border-white/30 shrink-0 hover:scale-110 cursor-pointer"
                    title="Cambia colore"
                  />
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => onChange((prev) => updatePlayerName(prev, p.id, e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none focus:border-b border-amber-500 w-full truncate"
                  />
                </div>

                {editingColorIdx === idx && (
                  <ColorPickerPopover
                    currentColorId={p.colorId}
                    onSelectColor={(colId) => onChange((prev) => updatePlayerColor(prev, p.id, colId))}
                    onClose={() => setEditingColorIdx(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Riquadro Vincitore Celebrativo */}
      <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner">
        {winner && winnerColor ? (
          <div className="flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
            <Crown className="w-6 h-6 text-amber-400 shrink-0 animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-semibold">Inizia la partita:</span>
              <span style={{ color: winnerColor.hex }} className="text-base font-black">
                {winner.name}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Premi il pulsante per estrarre a sorte</span>
        )}
      </div>

      {/* Pulsante Estrazione */}
      <button
        type="button"
        onClick={pickFirstPlayer}
        disabled={isSpinning || players.length < 2}
        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      >
        <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        <span>ESTRAI PRIMO GIOCATORE</span>
      </button>
    </div>
  );
}

/* ==========================================================================
   4. TOOL SEGNAPUNTI RAPIDO (Con Custom Input, Roster Condiviso & Classifica)
   ========================================================================== */
interface ScoreToolProps {
  state: TabletopToolsState;
  onChange: (updater: (prev: TabletopToolsState) => TabletopToolsState) => void;
}

function ScoreTool({ state, onChange }: ScoreToolProps) {
  const [customDelta, setCustomDelta] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(state.players[0]?.id || '');
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  // Trova punteggio più alto per la medaglia del leader
  const highestScore = Math.max(...state.players.map((p) => p.score));
  const hasLeader = state.players.some((p) => p.score > 0);

  const applyCustomScore = (isAdd: boolean) => {
    const val = parseInt(customDelta, 10);
    if (isNaN(val) || val === 0) return;
    const delta = isAdd ? Math.abs(val) : -Math.abs(val);
    onChange((prev) => updatePlayerScore(prev, selectedPlayerId, delta));
    setCustomDelta('');
  };

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Selettore Globale Giocatori */}
      <div className="flex flex-col gap-1.5">
        <PlayerCountBar
          count={state.players.length}
          onSelect={(n) => onChange((prev) => setPlayerCount(prev, n))}
        />
        <div className="flex justify-end pr-1">
          <button
            onClick={() => onChange(resetAllScores)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Azzera tutti i punteggi a 0"
          >
            <RotateCcw className="w-3 h-3" /> Azzera tutti i punti
          </button>
        </div>
      </div>

      {/* Lista Giocatori con Punteggio e Pulsanti Rapidi */}
      <div className="flex flex-col gap-2 max-h-[210px] overflow-y-auto pr-1">
        {state.players.map((p, idx) => {
          const color = getColorById(p.colorId);
          const isSelected = selectedPlayerId === p.id;
          const isLeader = hasLeader && p.score === highestScore && p.score > 0;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlayerId(p.id)}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                isSelected ? 'bg-slate-800/90 border-amber-500/60 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Pedina Colore & Nome Giocatore */}
              <div className="flex items-center gap-2 min-w-0 flex-1 relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingColorIdx(editingColorIdx === idx ? null : idx);
                  }}
                  style={{ backgroundColor: color.hex }}
                  className="w-4 h-4 rounded-full border border-white/30 shrink-0 hover:scale-110 cursor-pointer"
                  title="Cambia colore"
                />
                {editingColorIdx === idx && (
                  <ColorPickerPopover
                    currentColorId={p.colorId}
                    onSelectColor={(colId) => onChange((prev) => updatePlayerColor(prev, p.id, colId))}
                    onClose={() => setEditingColorIdx(null)}
                  />
                )}

                <input
                  type="text"
                  value={p.name}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange((prev) => updatePlayerName(prev, p.id, e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none focus:border-b border-amber-500 w-full truncate"
                />

                {isLeader && (
                  <span title="Al comando!">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}
              </div>

              {/* Pulsanti Rapidi e Punteggio */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onChange((prev) => updatePlayerScore(prev, p.id, -5))}
                  className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold"
                  title="-5 punti"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => onChange((prev) => updatePlayerScore(prev, p.id, -1))}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold text-xs"
                  title="-1 punto"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <span 
                  style={{ color: color.hex }}
                  className="w-10 text-center font-black text-base tabular-nums font-mono"
                >
                  {p.score}
                </span>

                <button
                  type="button"
                  onClick={() => onChange((prev) => updatePlayerScore(prev, p.id, 1))}
                  className="w-6 h-6 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 flex items-center justify-center font-bold text-xs"
                  title="+1 punto"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange((prev) => updatePlayerScore(prev, p.id, 5))}
                  className="px-1.5 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 text-[10px] font-bold"
                  title="+5 punti"
                >
                  +5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Somma Custom (per punteggi come +23, -15, ecc.) */}
      <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Somma personalizzata per:</span>
          <span className="font-bold text-amber-300">
            {state.players.find((p) => p.id === selectedPlayerId)?.name || state.players[0]?.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="es. 25"
            value={customDelta}
            onChange={(e) => setCustomDelta(e.target.value)}
            className="flex-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
          />

          <button
            type="button"
            onClick={() => applyCustomScore(false)}
            disabled={!customDelta}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-slate-700 hover:border-red-500/40 disabled:opacity-40 transition-all active:scale-95"
            title="Sottrai valore"
          >
            - Sottrai
          </button>
          <button
            type="button"
            onClick={() => applyCustomScore(true)}
            disabled={!customDelta}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            title="Aggiungi valore"
          >
            + Aggiungi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODALE PRINCIPALE TOOL TAVOLO CON PERSISTENZA LOCALSTORAGE
   ========================================================================== */
export function GameTools({ activeTool, onClose }: GameToolsProps) {
  const [state, setState] = useState<TabletopToolsState>(loadTabletopState);

  // Auto-salvataggio persistente ad ogni modifica di stato
  const updateState = useCallback((updater: (prev: TabletopToolsState) => TabletopToolsState) => {
    setState((prev) => {
      const updated = updater(prev);
      saveTabletopState(updated);
      return updated;
    });
  }, []);

  if (!activeTool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-sm rounded-2xl bg-[#141722] border border-slate-800 shadow-2xl p-4 sm:p-5 text-slate-200 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {activeTool === 'timer' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Timer Giochi da Tavolo</h3>
                  <p className="text-[10px] text-slate-400">Countdown turno e Passa Turno</p>
                </div>
              </>
            )}

            {activeTool === 'dice' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Dices className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Lancia Dadi</h3>
                  <p className="text-[10px] text-slate-400">Standard 1D6 & Multi-Dadi</p>
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
                  <p className="text-[10px] text-slate-400">Estrai a sorte tra i giocatori</p>
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
                  <p className="text-[10px] text-slate-400">Punteggi, custom delta e colori</p>
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

        {/* Corpo Modale */}
        {activeTool === 'timer' && <TimerTool state={state} onChange={updateState} />}
        {activeTool === 'dice' && <DiceTool state={state} onChange={updateState} />}
        {activeTool === 'first-player' && <FirstPlayerTool state={state} onChange={updateState} />}
        {activeTool === 'score' && <ScoreTool state={state} onChange={updateState} />}
      </div>
    </div>
  );
}
