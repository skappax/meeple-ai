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
  VolumeX 
} from 'lucide-react';

export type GameToolType = 'timer' | 'dice' | 'first-player' | 'score';

interface GameToolsProps {
  activeTool: GameToolType | null;
  onClose: () => void;
}

// Suono sintetizzato con Web Audio API (0 dipendenze esterne)
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
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // Web Audio non disponibile o bloccato dal browser
  }
}

/* ==========================================================================
   1. TOOL TIMER & CLOCK (Antidoto all'Analysis Paralysis)
   ========================================================================== */
function TimerTool() {
  const PRESETS = [30, 60, 90, 120, 180];
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const resetTimer = useCallback((newDuration?: number) => {
    setIsRunning(false);
    const d = newDuration !== undefined ? newDuration : duration;
    setTimeLeft(d);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (soundEnabled) playBeep(true);
            return 0;
          }
          if (soundEnabled && prev <= 4) {
            playBeep(false); // Beep per gli ultimi 3 secondi
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  const selectPreset = (secs: number) => {
    setDuration(secs);
    resetTimer(secs);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;
  const isUrgent = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              duration === p
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {p >= 60 ? `${p / 60}m` : `${p}s`}
          </button>
        ))}
      </div>

      {/* Timer Circular Display */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-slate-800/60"
          />
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
              isUrgent
                ? 'text-red-500 animate-pulse'
                : timeLeft === 0
                ? 'text-slate-600'
                : 'text-amber-400'
            }`}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tight tabular-nums ${
            isUrgent ? 'text-red-400' : timeLeft === 0 ? 'text-slate-500' : 'text-slate-100'
          }`}>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            {timeLeft === 0 ? 'Tempo Scaduto!' : isRunning ? 'In corso' : 'In pausa'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2.5 rounded-xl border transition-all ${
            soundEnabled 
              ? 'bg-slate-800 border-slate-700 text-amber-400' 
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={soundEnabled ? 'Suono attivo' : 'Suono disattivato'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pausa' : 'Avvia'}</span>
        </button>

        <button
          onClick={() => resetTimer()}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
          title="Resetta timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. TOOL LANCIA DADI (Dice Roller)
   ========================================================================== */
function DiceTool() {
  const DICE_TYPES = [
    { label: 'D6', sides: 6 },
    { label: '2D6', sides: 6, count: 2 },
    { label: 'D20', sides: 20 },
    { label: 'D10', sides: 10 },
    { label: 'D100', sides: 100 },
  ];

  const [selectedDice, setSelectedDice] = useState(DICE_TYPES[0]);
  const [results, setResults] = useState<number[]>([3]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ dice: string; values: number[]; total: number }[]>([]);

  const rollDice = () => {
    setIsRolling(true);
    playBeep(false);

    // Animazione di rotolamento rapida
    setTimeout(() => {
      const count = selectedDice.count || 1;
      const newValues = Array.from({ length: count }, () => Math.floor(Math.random() * selectedDice.sides) + 1);
      const total = newValues.reduce((a, b) => a + b, 0);

      setResults(newValues);
      setIsRolling(false);
      setHistory((prev) => [{ dice: selectedDice.label, values: newValues, total }, ...prev.slice(0, 4)]);
    }, 280);
  };

  const total = results.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Dice Type Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {DICE_TYPES.map((d) => (
          <button
            key={d.label}
            onClick={() => setSelectedDice(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedDice.label === d.label
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Main Dice Visual Result */}
      <div className="flex items-center justify-center gap-3 my-2 min-h-[100px]">
        {results.map((val, idx) => (
          <div
            key={idx}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/60 shadow-lg shadow-purple-500/10 flex flex-col items-center justify-center transition-all ${
              isRolling ? 'rotate-12 scale-95 opacity-60' : 'scale-100'
            }`}
          >
            <span className="text-3xl font-black text-purple-300 tabular-nums">
              {isRolling ? '?' : val}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              d{selectedDice.sides}
            </span>
          </div>
        ))}
      </div>

      {results.length > 1 && !isRolling && (
        <div className="text-xs font-medium text-slate-400">
          Totale: <span className="text-purple-300 font-bold text-sm">{total}</span>
        </div>
      )}

      {/* Roll Button */}
      <button
        onClick={rollDice}
        disabled={isRolling}
        className="px-8 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>Lancia Dado</span>
      </button>

      {/* Recent Rolls History */}
      {history.length > 0 && (
        <div className="w-full max-w-[260px] pt-3 border-t border-slate-800/80 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Ultimi Lanci
          </span>
          <div className="flex justify-center gap-2 text-xs">
            {history.map((h, i) => (
              <span key={i} className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                {h.total}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. TOOL CHI INIZIA? (First Player Selector)
   ========================================================================== */
const PLAYER_COLORS = [
  { name: 'Rosso', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/50' },
  { name: 'Blu', bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/50' },
  { name: 'Verde', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  { name: 'Giallo', bg: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-400/50' },
  { name: 'Viola', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/50' },
  { name: 'Bianco', bg: 'bg-slate-100', text: 'text-slate-200', border: 'border-slate-300/50' },
  { name: 'Nero', bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-500/50' },
  { name: 'Arancione', bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/50' },
];

function FirstPlayerTool() {
  const [playerCount, setPlayerCount] = useState(4);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pickFirstPlayer = () => {
    setIsSpinning(true);
    setWinnerIdx(null);
    playBeep(false);

    let count = 0;
    const maxCycles = 16;
    const interval = setInterval(() => {
      setWinnerIdx(Math.floor(Math.random() * playerCount));
      count++;
      if (count >= maxCycles) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * playerCount);
        setWinnerIdx(finalIdx);
        setIsSpinning(false);
        playBeep(true);
      }
    }, 80);
  };

  const activePlayers = PLAYER_COLORS.slice(0, playerCount);
  const winner = winnerIdx !== null ? activePlayers[winnerIdx] : null;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Player Count Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Giocatori al tavolo:</span>
        <div className="flex items-center gap-1">
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              onClick={() => {
                setPlayerCount(n);
                setWinnerIdx(null);
              }}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                playerCount === n
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Players Meeple Grid */}
      <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
        {activePlayers.map((p, idx) => {
          const isCurrentPick = winnerIdx === idx;
          return (
            <div
              key={p.name}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                isCurrentPick
                  ? `${p.border} bg-slate-800 scale-110 shadow-lg`
                  : 'border-slate-800 bg-slate-900/60 opacity-60'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${p.bg}`} />
              <span className={`text-xs font-semibold ${p.text}`}>
                P{idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Winner Display Box */}
      <div className="w-full max-w-[260px] h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
        {winner ? (
          <div className="flex items-center gap-2 animate-bounce">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-slate-100">
              Inizia: <span className={`${winner.text} font-black`}>Giocatore {winnerIdx! + 1} ({winner.name})</span>
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Premi per estrarre chi inizia</span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        onClick={pickFirstPlayer}
        disabled={isSpinning}
        className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
      >
        <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        <span>Estrai Primo Giocatore</span>
      </button>
    </div>
  );
}

/* ==========================================================================
   4. TOOL SEGNAPUNTI RAPIDO (Score & VP Counter)
   ========================================================================== */
interface PlayerScore {
  id: number;
  name: string;
  score: number;
  color: typeof PLAYER_COLORS[0];
}

function ScoreTool() {
  const [players, setPlayers] = useState<PlayerScore[]>([
    { id: 1, name: 'Giocatore 1', score: 0, color: PLAYER_COLORS[0] },
    { id: 2, name: 'Giocatore 2', score: 0, color: PLAYER_COLORS[1] },
  ]);

  const addPlayer = () => {
    if (players.length >= 8) return;
    const nextId = players.length + 1;
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    setPlayers((prev) => [...prev, { id: nextId, name: `Giocatore ${nextId}`, score: 0, color }]);
  };

  const removePlayer = (id: number) => {
    if (players.length <= 1) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const updateScore = (id: number, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p))
    );
  };

  const resetAllScores = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  };

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400">
          Giocatori: {players.length}
        </span>
        <div className="flex items-center gap-2">
          {players.length < 8 && (
            <button
              onClick={addPlayer}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition-all"
            >
              <Plus className="w-3 h-3" /> Aggiungi
            </button>
          )}
          <button
            onClick={resetAllScores}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all"
            title="Azzera tutti i punteggi"
          >
            <RotateCcw className="w-3 h-3" /> Azzera
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl gap-2"
          >
            {/* Player Info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-3.5 h-3.5 rounded-full ${p.color.bg} shrink-0`} />
              <input
                type="text"
                value={p.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setPlayers((prev) =>
                    prev.map((pl) => (pl.id === p.id ? { ...pl, name: val } : pl))
                  );
                }}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none focus:border-b border-amber-500 w-full truncate"
              />
            </div>

            {/* Score & Counter Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateScore(p.id, -5)}
                className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-[10px] font-bold"
                title="-5"
              >
                -5
              </button>
              <button
                onClick={() => updateScore(p.id, -1)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all"
                title="-1"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-10 text-center font-black text-sm tabular-nums text-slate-100">
                {p.score}
              </span>

              <button
                onClick={() => updateScore(p.id, 1)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 flex items-center justify-center transition-all"
                title="+1"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateScore(p.id, 5)}
                className="px-1.5 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 text-[10px] font-bold"
                title="+5"
              >
                +5
              </button>

              {players.length > 1 && (
                <button
                  onClick={() => removePlayer(p.id)}
                  className="p-1 rounded text-slate-600 hover:text-red-400 ml-1 transition-all"
                  title="Rimuovi giocatore"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT DIALOG
   ========================================================================== */
export function GameTools({ activeTool, onClose }: GameToolsProps) {
  if (!activeTool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-2xl bg-[#141722] border border-slate-800 shadow-2xl p-5 text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {activeTool === 'timer' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Timer Turno & Clessidra</h3>
                  <p className="text-[10px] text-slate-400">Scandisci il tempo per ogni giocatore</p>
                </div>
              </>
            )}

            {activeTool === 'dice' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Dices className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Lancia Dadi Virtuale</h3>
                  <p className="text-[10px] text-slate-400">D6, 2D6, D20 per spareggi o tiri rapidi</p>
                </div>
              </>
            )}

            {activeTool === 'first-player' && (
              <>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Chi Inizia?</h3>
                  <p className="text-[10px] text-slate-400">Estrai casualmente il primo giocatore</p>
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
                  <p className="text-[10px] text-slate-400">Tieni traccia di PV, vite o monete</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tool Content */}
        {activeTool === 'timer' && <TimerTool />}
        {activeTool === 'dice' && <DiceTool />}
        {activeTool === 'first-player' && <FirstPlayerTool />}
        {activeTool === 'score' && <ScoreTool />}
      </div>
    </div>
  );
}
