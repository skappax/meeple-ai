'use client';

import React from 'react';
import { Scale, Clock, Dices, Package, Swords, Users } from 'lucide-react';
import { ChatMode } from '@/types/chat';

interface PromptStartersProps {
  onSelectPrompt: (prompt: string, mode?: ChatMode) => void;
}

const STARTERS = [
  {
    icon: <Scale className="w-5 h-5 text-emerald-400" />,
    title: 'Dubbio su una regola',
    desc: 'Catan: cosa succede con il 7 se ho più di 7 carte?',
    prompt: 'In Catan, spiegami esattamente cosa succede quando viene tirato un 7 sui dadi e quali sono le regole per chi ha più di 7 carte in mano e per il brigante.',
    mode: 'rules' as ChatMode,
  },
  {
    icon: <Clock className="w-5 h-5 text-blue-400" />,
    title: 'Spiega in 3 minuti',
    desc: 'Spiegami Wingspan prima di iniziare la partita',
    prompt: 'Spiegami le regole essenziali di Wingspan in 3 minuti per iniziare subito a giocare senza leggere l\'intero regolamento.',
    mode: 'explain' as ChatMode,
  },
  {
    icon: <Dices className="w-5 h-5 text-purple-400" />,
    title: 'Cosa giochiamo stasera?',
    desc: '4 giocatori, 60-90 min, strategico ma accessibile',
    prompt: 'Siamo in 4 giocatori stasera, abbiamo circa 60-90 minuti e cerchiamo un gioco da tavolo moderno, avvincente e con un po\' di strategia ma facile da spiegare. Cosa ci consigli?',
    mode: 'recommend' as ChatMode,
  },
  {
    icon: <Package className="w-5 h-5 text-orange-400" />,
    title: 'Setup Rapido',
    desc: 'Checklist di preparazione per Terraforming Mars',
    prompt: 'Dammi una checklist ordinata e rapida per apparecchiare il tavolo per una partita a Terraforming Mars (plancia, risorse, mazzi, tessere).',
    mode: 'setup' as ChatMode,
  },
  {
    icon: <Swords className="w-5 h-5 text-rose-400" />,
    title: 'Caso limite / Duello',
    desc: 'Dune: Imperium e conflitti',
    prompt: 'In Dune: Imperium, quali sono le regole per la ritirata e la risoluzione della fase di combattimento se c\'è un pareggio per il primo posto?',
    mode: 'rules' as ChatMode,
  },
  {
    icon: <Users className="w-5 h-5 text-amber-400" />,
    title: 'Top Giochi per 2',
    desc: 'I migliori titoli per 2 giocatori (coppia o rivalità)',
    prompt: 'Consigliami i migliori giochi da tavolo pensati specificamente per 2 giocatori (sia competitivi che collaborativi), spaziando tra giochi rapidi e giochi più profondi.',
    mode: 'recommend' as ChatMode,
  },
];

export function PromptStarters({ onSelectPrompt }: PromptStartersProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-xl shadow-amber-500/20 text-3xl mb-4 border border-amber-400/30">
          🎲
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-2">
          Benvenuto su <span className="text-amber-400">MeepleAI</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          L&apos;arbitro virtuale e compagno per i tuoi giochi da tavolo. Chiedimi qualsiasi dubbio sul regolamento, spiegazioni veloci o consigli su cosa intavolare!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STARTERS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(s.prompt, s.mode)}
            className="flex flex-col items-start p-4 rounded-xl bg-[#161923] border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-800/40 text-left transition-all hover:scale-[1.01] group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-amber-500/10 transition-colors mb-3">
              {s.icon}
            </div>
            <h3 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors mb-1">
              {s.title}
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              {s.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
