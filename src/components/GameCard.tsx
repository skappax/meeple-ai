'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Scale, 
  Star, 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  X, 
  BookOpen,
  Package,
  Lightbulb
} from 'lucide-react';
import { GameInfo } from '@/types/game';
import { ChatMode } from '@/types/chat';

interface GameCardProps {
  game: GameInfo;
  onClose: () => void;
  onTriggerPrompt: (prompt: string, mode: ChatMode) => void;
}

export function GameCard({ game, onClose, onTriggerPrompt }: GameCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const weight = game.bggWeight || 2.5;
  // Weight percentage for progress bar (1.0 to 5.0 -> 0% to 100%)
  const weightPercent = Math.min(Math.max(((weight - 1) / 4) * 100, 10), 100);

  const getWeightColor = (w: number) => {
    if (w < 2.0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (w < 3.0) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (w < 4.0) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 mb-4">
      <div className="bg-gradient-to-br from-[#181c28] to-[#12141c] border border-amber-500/30 rounded-2xl shadow-xl overflow-hidden transition-all duration-200">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shrink-0">
              🎲
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm truncate">{game.title}</h3>
                {game.year && (
                  <span className="text-[11px] text-slate-400">({game.year})</span>
                )}
                {game.bggRank && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded">
                    <Trophy className="w-2.5 h-2.5" /> #{game.bggRank} BGG
                  </span>
                )}
              </div>
              {game.designer && (
                <p className="text-[11px] text-slate-400 truncate">Autore: {game.designer}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Comprimi scheda' : 'Espandi scheda'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Rimuovi gioco attivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        {isExpanded && (
          <div className="p-4 space-y-3.5">
            {/* Stats Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Voto BGG */}
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Voto BGG</div>
                  <div className="font-bold text-slate-200">{game.bggRating ? game.bggRating.toFixed(1) : '8.0'} <span className="text-[10px] text-slate-400">/10</span></div>
                </div>
              </div>

              {/* Complessità / Peso */}
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Peso BGG</div>
                  <div className="font-bold text-slate-200">
                    {weight.toFixed(2)} <span className="text-[10px] text-slate-400">/5</span>
                  </div>
                </div>
              </div>

              {/* Giocatori */}
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Giocatori</div>
                  <div className="font-bold text-slate-200 truncate">{game.players || '2-4'}</div>
                </div>
              </div>

              {/* Durata */}
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Durata</div>
                  <div className="font-bold text-slate-200 truncate">{game.duration || '60 min'}</div>
                </div>
              </div>
            </div>

            {/* Extra Info: Best Players & Weight Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Ideale community:</span>
                <span className="font-semibold text-amber-300">
                  {game.bestPlayers ? `${game.bestPlayers} giocatori` : 'Tutti i conteggi'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getWeightColor(weight)}`}>
                  {game.weightLabel || 'Medio'}
                </span>
                <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${weightPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mechanics Tags */}
            {game.mechanics && game.mechanics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {game.mechanics.map((m, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {/* Summary */}
            {game.summary && (
              <p className="text-[11px] text-slate-300 italic bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed">
                &ldquo;{game.summary}&rdquo;
              </p>
            )}

            {/* 4 Quick Actions for this Game */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              <button
                onClick={() => onTriggerPrompt(`Quali sono le regole chiave e i casi limite più frequenti in ${game.title}?`, 'rules')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                <span>Dubbio Regole</span>
              </button>

              <button
                onClick={() => onTriggerPrompt(`Spiegami le regole essenziali di ${game.title} in 3 minuti per iniziare subito a giocare.`, 'explain')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-colors"
              >
                <Clock className="w-3 h-3" />
                <span>Spiega in 3 min</span>
              </button>

              <button
                onClick={() => onTriggerPrompt(`Dammi la checklist passo-passo per il setup rapido del tavolo per ${game.title}.`, 'setup')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-medium transition-colors"
              >
                <Package className="w-3 h-3" />
                <span>Setup Rapido</span>
              </button>

              <button
                onClick={() => onTriggerPrompt(`Quali sono i 3 consigli strategici fondamentali per vincere a ${game.title}?`, 'general')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Consigli & Trucchi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
