'use client';

import React from 'react';
import { Scale, Clock, Dices, Package, ChevronRight, Gamepad2 } from 'lucide-react';
import { ChatMode } from '@/types/chat';

interface PromptStartersProps {
  onSelectPrompt: (prompt: string, mode?: ChatMode) => void;
  onSelectGame?: (game: string) => void;
}

const QUICK_ACTIONS = [
  {
    icon: <Scale className="w-5 h-5 text-emerald-400 shrink-0" />,
    title: 'Arbitro Regole',
    subtitle: 'Risolvi dubbi e contestazioni al tavolo',
    prompt: 'Ho un dubbio sulle regole durante la partita. Puoi aiutarmi a risolverlo rapidamente?',
    mode: 'rules' as ChatMode,
    color: 'border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5',
  },
  {
    icon: <Clock className="w-5 h-5 text-blue-400 shrink-0" />,
    title: 'Spiega in 3 Min',
    subtitle: 'Regole essenziali senza leggere il manuale',
    prompt: 'Spiegami le regole essenziali di questo gioco in 3 minuti per iniziare subito la partita.',
    mode: 'explain' as ChatMode,
    color: 'border-blue-500/20 hover:border-blue-500/50 bg-blue-500/5',
  },
  {
    icon: <Dices className="w-5 h-5 text-purple-400 shrink-0" />,
    title: 'Cosa Giochiamo?',
    subtitle: 'Trova il gioco perfetto per stasera',
    prompt: 'Cosa ci consigli di giocare stasera? Considera numero di giocatori e tempo a disposizione.',
    mode: 'recommend' as ChatMode,
    color: 'border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5',
  },
  {
    icon: <Package className="w-5 h-5 text-orange-400 shrink-0" />,
    title: 'Setup Rapido',
    subtitle: 'Checklist passo-passo per apparecchiare',
    prompt: 'Dammi la checklist rapida e ordinata per apparecchiare il tavolo e iniziare subito a giocare.',
    mode: 'setup' as ChatMode,
    color: 'border-orange-500/20 hover:border-orange-500/50 bg-orange-500/5',
  },
];

const POPULAR_GAMES = [
  'Catan',
  'Wingspan',
  'Carcassonne',
  'Terraforming Mars',
  'Dune: Imperium',
  'Azul',
  'Nemesis',
  'Scythe',
  'Ticket to Ride',
];

export function PromptStarters({ onSelectPrompt, onSelectGame }: PromptStartersProps) {
  return (
    <div className="max-w-xl mx-auto py-2 sm:py-6 px-2 sm:px-4 flex flex-col justify-center min-h-full">
      {/* Compact Mobile Hero */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 text-2xl mb-2 border border-amber-400/30">
          🎲
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          Meeple<span className="text-amber-400">AI</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          L&apos;arbitro dei giochi da tavolo sempre al tuo fianco
        </p>
      </div>

      {/* 4 Thumb-friendly Action Buttons (2 columns on mobile) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {QUICK_ACTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt, item.mode)}
            className={`flex flex-col items-start p-3 sm:p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${item.color} shadow-sm group`}
          >
            <div className="mb-2 p-1.5 rounded-lg bg-slate-900/60">
              {item.icon}
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                {item.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
              {item.subtitle}
            </p>
          </button>
        ))}
      </div>

      {/* Quick Game Selector Pills Carousel */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#141721] border border-slate-800/80">
        <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tocca un gioco per aprire la scheda BGG:</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {POPULAR_GAMES.map((g) => (
            <button
              key={g}
              onClick={() => {
                if (onSelectGame) {
                  onSelectGame(g);
                } else {
                  onSelectPrompt(`Spiegami le regole essenziali di ${g} in 3 minuti.`, 'explain');
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 text-slate-200 text-xs font-medium whitespace-nowrap transition-all active:scale-95 shrink-0"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
