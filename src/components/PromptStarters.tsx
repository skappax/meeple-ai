'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Clock, 
  Dices, 
  Package, 
  Gamepad2, 
  X, 
  Search, 
  Lightbulb, 
  Star 
} from 'lucide-react';
import { ChatMode } from '@/types/chat';
import { GameInfo } from '@/types/game';

interface PromptStartersProps {
  onSelectPrompt: (prompt: string, mode?: ChatMode) => void;
  onSelectGame: (game: string) => void;
  activeGame?: string;
  gameInfo?: GameInfo | null;
  onClearGame?: () => void;
}

const POPULAR_GAMES = [
  { name: 'Catan', emoji: '🌾' },
  { name: 'Wingspan', emoji: '🪶' },
  { name: 'Carcassonne', emoji: '🏰' },
  { name: 'Terraforming Mars', emoji: '🚀' },
  { name: 'Dune: Imperium', emoji: '🪐' },
  { name: 'Azul', emoji: '🎨' },
  { name: 'Nemesis', emoji: '👽' },
  { name: 'Ticket to Ride', emoji: '🚂' },
  { name: '7 Wonders', emoji: '🏛️' },
  { name: 'Scythe', emoji: '⚙️' },
];

export function PromptStarters({
  onSelectPrompt,
  onSelectGame,
  activeGame,
  gameInfo,
  onClearGame,
}: PromptStartersProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSelectGame(searchQuery.trim());
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const actions = activeGame
    ? [
        {
          icon: <Scale className="w-4 h-4 text-emerald-400 shrink-0" />,
          title: 'Arbitro Regole',
          desc: `Dubbi su ${activeGame}`,
          prompt: `Ho un dubbio sulle regole durante la nostra partita a ${activeGame}. Puoi aiutarmi a risolverlo rapidamente e con precisione?`,
          mode: 'rules' as ChatMode,
          bg: 'border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5 active:bg-emerald-500/15',
        },
        {
          icon: <Clock className="w-4 h-4 text-blue-400 shrink-0" />,
          title: 'Spiega in 3 Min',
          desc: 'Regole essenziali lampo',
          prompt: `Spiegami le regole essenziali di ${activeGame} in 3 minuti per iniziare subito la partita.`,
          mode: 'explain' as ChatMode,
          bg: 'border-blue-500/20 hover:border-blue-500/50 bg-blue-500/5 active:bg-blue-500/15',
        },
        {
          icon: <Package className="w-4 h-4 text-orange-400 shrink-0" />,
          title: 'Setup Rapido',
          desc: 'Checklist apparecchiata',
          prompt: `Dammi la checklist rapida passo-passo per apparecchiare il tavolo e preparare la partita a ${activeGame}.`,
          mode: 'setup' as ChatMode,
          bg: 'border-orange-500/20 hover:border-orange-500/50 bg-orange-500/5 active:bg-orange-500/15',
        },
        {
          icon: <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />,
          title: 'Tattiche & Consigli',
          desc: 'Strategie per vincere',
          prompt: `Quali sono le strategie di apertura o i consigli chiave per giocare bene a ${activeGame}?`,
          mode: 'recommend' as ChatMode,
          bg: 'border-amber-500/20 hover:border-amber-500/50 bg-amber-500/5 active:bg-amber-500/15',
        },
      ]
    : [
        {
          icon: <Scale className="w-4 h-4 text-emerald-400 shrink-0" />,
          title: 'Arbitro Regole',
          desc: 'Risolvi dubbi e dispute',
          prompt: 'Ho un dubbio sulle regole durante la partita. Puoi aiutarmi a risolverlo rapidamente?',
          mode: 'rules' as ChatMode,
          bg: 'border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5 active:bg-emerald-500/15',
        },
        {
          icon: <Clock className="w-4 h-4 text-blue-400 shrink-0" />,
          title: 'Spiega in 3 Min',
          desc: 'Regole senza manuale',
          prompt: 'Spiegami le regole essenziali di un gioco in 3 minuti per iniziare subito la partita.',
          mode: 'explain' as ChatMode,
          bg: 'border-blue-500/20 hover:border-blue-500/50 bg-blue-500/5 active:bg-blue-500/15',
        },
        {
          icon: <Package className="w-4 h-4 text-orange-400 shrink-0" />,
          title: 'Setup Rapido',
          desc: 'Checklist passo-passo',
          prompt: 'Dammi la checklist rapida e ordinata per apparecchiare il tavolo e iniziare subito a giocare.',
          mode: 'setup' as ChatMode,
          bg: 'border-orange-500/20 hover:border-orange-500/50 bg-orange-500/5 active:bg-orange-500/15',
        },
        {
          icon: <Dices className="w-4 h-4 text-purple-400 shrink-0" />,
          title: 'Cosa Giochiamo?',
          desc: 'Consigli per stasera',
          prompt: 'Cosa ci consigli di giocare stasera? Considera numero di giocatori e tempo a disposizione.',
          mode: 'recommend' as ChatMode,
          bg: 'border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5 active:bg-purple-500/15',
        },
      ];

  return (
    <div className="max-w-md mx-auto py-2 px-2 sm:px-4 flex flex-col justify-center min-h-[calc(100dvh-170px)]">
      {/* Brand Hero - Ultra Compact for Smartphone */}
      <div className="text-center mb-3 sm:mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 text-xl mb-1.5 border border-amber-400/30">
          🎲
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-slate-100 tracking-tight">
          Meeple<span className="text-amber-400">AI</span>
        </h1>
        <p className="text-slate-400 text-[11px] sm:text-xs">
          L&apos;arbitro dei giochi da tavolo sempre al tavolo con te
        </p>
      </div>

      {/* Active Game Banner OR Game Selector Carousel */}
      <div className="mb-3 sm:mb-4">
        {activeGame ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-slate-900/90 border border-amber-500/40 shadow-sm">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-base shrink-0">🎲</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-amber-300 truncate">
                    {activeGame}
                  </span>
                  {gameInfo?.year && (
                    <span className="text-[10px] text-slate-400">({gameInfo.year})</span>
                  )}
                </div>
                {gameInfo ? (
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
                    {gameInfo.bggRating && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {gameInfo.bggRating.toFixed(1)}
                      </span>
                    )}
                    {gameInfo.weightLabel && (
                      <span className="text-emerald-400">
                        · {gameInfo.weightLabel}
                      </span>
                    )}
                    {gameInfo.duration && (
                      <span className="text-slate-400">
                        · ⏱️ {gameInfo.duration}
                      </span>
                    )}
                    {gameInfo.players && (
                      <span className="text-slate-400">
                        · 👥 {gameInfo.players}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400">Caricamento scheda BGG...</span>
                )}
              </div>
            </div>
            {onClearGame && (
              <button
                onClick={onClearGame}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-[11px] transition-colors shrink-0"
                title="Cambia gioco"
              >
                <X className="w-3 h-3" />
                <span className="hidden xs:inline">Cambia</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#141722]/90 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400 font-medium px-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                <span>A cosa state giocando?</span>
              </span>
              {!isSearching && (
                <button
                  onClick={() => setIsSearching(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                >
                  <Search className="w-2.5 h-2.5" />
                  <span>Cerca altro</span>
                </button>
              )}
            </div>

            {isSearching ? (
              <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nome gioco (Root, 7 Wonders...)"
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 text-xs font-semibold shrink-0"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearching(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar">
                {POPULAR_GAMES.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => onSelectGame(g.name)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 text-slate-200 text-xs font-medium whitespace-nowrap transition-all active:scale-95 shrink-0"
                  >
                    <span>{g.emoji}</span>
                    <span>{g.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 Thumb-Friendly Action Buttons (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {actions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt, item.mode)}
            className={`flex items-center gap-2 sm:gap-2.5 p-2.5 rounded-xl border text-left transition-all active:scale-[0.97] ${item.bg} shadow-sm group`}
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                {item.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
