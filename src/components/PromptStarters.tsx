'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Clock, 
  Package, 
  Dices, 
  ChevronLeft, 
  ChevronRight,
  Lightbulb
} from 'lucide-react';

const SCROLLING_EXAMPLES = [
  {
    icon: <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    text: '“In Catan posso costruire una strada attraverso una colonia nemica?”',
    tag: 'Catan · Regole',
  },
  {
    icon: <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
    text: '“Spiegami il flusso del turno e le regole base di Wingspan in 3 minuti”',
    tag: 'Wingspan · Spiegazione',
  },
  {
    icon: <Package className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
    text: '“Qual è la checklist corretta per apparecchiare il tavolo di Carcassonne?”',
    tag: 'Carcassonne · Setup',
  },
  {
    icon: <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    text: '“In Carcassonne come si calcolano i punti dei contadini a fine partita?”',
    tag: 'Carcassonne · Punteggio',
  },
  {
    icon: <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    text: '“In Terraforming Mars posso piazzare una foresta non adiacente alle mie tessere?”',
    tag: 'Terraforming Mars · Regole',
  },
  {
    icon: <Dices className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
    text: '“Consigliaci un gioco strategico cooperativo da 60 minuti per 4 persone”',
    tag: 'Matchmaker · Consigli',
  },
  {
    icon: <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    text: '“In Dune: Imperium posso mandare un agente su uno spazio già occupato?”',
    tag: 'Dune · Regole',
  },
  {
    icon: <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
    text: '“Spiegami come funziona il conteggio dei punti della riga del pavimento in Azul”',
    tag: 'Azul · Regole',
  },
  {
    icon: <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    text: '“In 7 Wonders posso costruire due edifici commerciali con lo stesso nome?”',
    tag: '7 Wonders · Regole',
  },
  {
    icon: <Package className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
    text: '“Come si preparano i mazzi incontro e combattimento nel setup di Scythe?”',
    tag: 'Scythe · Setup',
  },
];

export function PromptStarters() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scrolling timer (every 4s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCROLLING_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = SCROLLING_EXAMPLES[index];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + SCROLLING_EXAMPLES.length) % SCROLLING_EXAMPLES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % SCROLLING_EXAMPLES.length);
  };

  return (
    <div className="max-w-md mx-auto py-3 px-2 sm:px-4 flex flex-col items-center justify-center min-h-[calc(100dvh-170px)] text-center">
      {/* Brand Hero - Ultra Compact */}
      <div className="mb-4 sm:mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 text-xl mb-1.5 border border-amber-400/30">
          🎲
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          Meeple<span className="text-amber-400">AI</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          L&apos;esperto dei giochi da tavolo sempre al tuo fianco
        </p>
      </div>

      {/* Single Compact Scrolling Examples Box */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 p-2.5 sm:p-3 shadow-md transition-all select-none text-left"
      >
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
          <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Esempi di cosa puoi chiedere:</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-mono text-[10px]">
              {index + 1}/{SCROLLING_EXAMPLES.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Precedente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Successivo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 min-h-[42px] pt-0.5">
          <div className="mt-0.5 p-1 rounded-md bg-slate-800/80 shrink-0">
            {current.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-xs sm:text-sm italic leading-snug line-clamp-2 transition-all">
              {current.text}
            </p>
            <div className="text-[10px] text-slate-400 font-medium not-italic mt-0.5">
              {current.tag}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
