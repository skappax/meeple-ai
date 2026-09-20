'use client';

import React from 'react';
import { Scale, Clock, Package, Dices } from 'lucide-react';

const EXAMPLES = [
  {
    icon: <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />,
    text: '“In Catan posso costruire una strada attraverso una colonia nemica?”',
    tag: 'Dubbio regole',
  },
  {
    icon: <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />,
    text: '“Spiegami il flusso del turno e le regole base di Wingspan in 3 minuti”',
    tag: 'Spiegazione lampo',
  },
  {
    icon: <Package className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />,
    text: '“Qual è la checklist corretta per apparecchiare il tavolo di Carcassonne?”',
    tag: 'Setup rapido',
  },
  {
    icon: <Dices className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />,
    text: '“Cosa ci consigli per 4 giocatori amanti della strategia che dura un\'ora?”',
    tag: 'Consiglio gioco',
  },
];

export function PromptStarters() {
  return (
    <div className="max-w-md mx-auto py-4 px-3 flex flex-col items-center justify-center min-h-[calc(100dvh-170px)] text-center">
      {/* Brand Hero */}
      <div className="mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 text-2xl mb-2 border border-amber-400/30">
          🎲
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Meeple<span className="text-amber-400">AI</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
          L&apos;arbitro dei giochi da tavolo sempre al tuo fianco al tavolo
        </p>
      </div>

      {/* Non-clickable Examples in Top Page */}
      <div className="w-full space-y-2 pointer-events-none select-none text-left">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center mb-2.5">
          Esempi di cosa puoi chiedere:
        </div>

        {EXAMPLES.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs shadow-sm"
          >
            {item.icon}
            <div className="min-w-0 flex-1">
              <p className="text-slate-300 italic leading-snug">
                {item.text}
              </p>
              <span className="inline-block mt-1 text-[10px] text-slate-500 font-medium not-italic">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
