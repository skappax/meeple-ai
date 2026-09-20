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

  const getWeightColor = (w: number) => {
    if (w < 2.0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (w < 3.0) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (w < 4.0) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-2 sm:px-4 mb-2 sm:mb-3">
      <div className="bg-gradient-to-br from-[#181c28] to-[#12141c] border border-amber-500/30 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transition-all">
        {/* Header Bar */}
        <div className="px-3 py-2 sm:py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 truncate pr-2 cursor-pointer flex-1"
          >
            <span className="text-base sm:text-lg">🎲</span>
            <div className="truncate">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-100 text-xs sm:text-sm truncate">{game.title}</span>
                {game.year && (
                  <span className="text-[10px] text-slate-400">({game.year})</span>
                )}
                {game.bggRank && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 px-1 py-0.1 rounded">
                    <Trophy className="w-2.5 h-2.5" /> #{game.bggRank}
                  </span>
                )}
                <span className={`text-[9px] px-1.5 py-0.1 rounded border font-semibold ${getWeightColor(weight)}`}>
                  {game.weightLabel || 'Medio'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-400 hover:text-slate-200"
              title={isExpanded ? 'Comprimi' : 'Espandi'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-rose-400"
              title="Chiudi scheda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        {isExpanded && (
          <div className="p-3 space-y-2.5 text-xs">
            {/* 4 Stats Badges in compact 4-col/2-col */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">Voto</div>
                <div className="font-bold text-amber-400 text-xs flex items-center justify-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {game.bggRating ? game.bggRating.toFixed(1) : '8.0'}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">Peso BGG</div>
                <div className="font-bold text-emerald-400 text-xs flex items-center justify-center gap-0.5">
                  <Scale className="w-2.5 h-2.5" />
                  {weight.toFixed(1)}/5
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">Giocatori</div>
                <div className="font-bold text-purple-400 text-xs flex items-center justify-center gap-0.5 truncate">
                  <Users className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{game.players || '2-4'}</span>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">Durata</div>
                <div className="font-bold text-blue-400 text-xs flex items-center justify-center gap-0.5 truncate">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{game.duration || '60m'}</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons for mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
              <button
                onClick={() => onTriggerPrompt(`Quali sono le regole chiave e i casi limite più frequenti in ${game.title}?`, 'rules')}
                className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-all active:scale-95"
              >
                <BookOpen className="w-3 h-3" />
                <span>Regole</span>
              </button>

              <button
                onClick={() => onTriggerPrompt(`Spiegami le regole essenziali di ${game.title} in 3 minuti.`, 'explain')}
                className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all active:scale-95"
              >
                <Clock className="w-3 h-3" />
                <span>In 3 min</span>
              </button>

              <button
                onClick={() => onTriggerPrompt(`Dammi la checklist rapida di setup per ${game.title}.`, 'setup')}
                className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-medium transition-all active:scale-95"
              >
                <Package className="w-3 h-3" />
                <span>Setup</span>
              </button>

              <button
                onClick={() => onTriggerPrompt(`Quali sono i migliori consigli strategici per ${game.title}?`, 'general')}
                className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-all active:scale-95"
              >
                <Lightbulb className="w-3 h-3" />
                <span>Consigli</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
