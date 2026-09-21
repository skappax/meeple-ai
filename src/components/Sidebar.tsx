'use client';

import React from 'react';
import { 
  Settings, 
  Timer, 
  Dices, 
  Crown, 
  Calculator,
  Scale, 
  Clock, 
  Package, 
  Bot,
  FileText
} from 'lucide-react';
import { ChatMode } from '@/types/chat';
import { GameToolType } from './GameTools';

interface SidebarProps {
  activeTool: GameToolType | null;
  onOpenTool: (tool: GameToolType) => void;
  onOpenSettings: () => void;
  activeModel: string;
}

// Mantenuto per compatibilità con il dropdown modalità nell'header
export const MODES: { id: ChatMode; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: 'rules', label: 'Arbitro Regole', icon: <Scale className="w-4 h-4" />, desc: 'Verdetti su casi limite', color: 'text-emerald-400' },
  { id: 'explain', label: 'Spiega in 3 Min', icon: <Clock className="w-4 h-4" />, desc: 'Riassunto per novizi', color: 'text-blue-400' },
  { id: 'summary', label: 'Scheda Gioco', icon: <FileText className="w-4 h-4" />, desc: 'Metriche BGG e scheda riassuntiva', color: 'text-cyan-400' },
  { id: 'setup', label: 'Setup Rapido', icon: <Package className="w-4 h-4" />, desc: 'Checklist apparecchiatura', color: 'text-orange-400' },
  { id: 'recommend', label: 'Cosa Giochiamo?', icon: <Dices className="w-4 h-4" />, desc: 'Consigli per stasera', color: 'text-purple-400' },
  { id: 'general', label: 'Tavolo Libero', icon: <Bot className="w-4 h-4" />, desc: 'Chiacchierata & curiosità', color: 'text-amber-400' },
];

export function Sidebar({
  activeTool,
  onOpenTool,
  onOpenSettings,
}: SidebarProps) {
  const TOOLS: { id: GameToolType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { 
      id: 'timer', 
      label: 'Timer Turno', 
      icon: <Timer className="w-4 h-4" />, 
      color: 'text-amber-400',
      bg: 'hover:bg-amber-500/15'
    },
    { 
      id: 'dice', 
      label: 'Lancia Dadi', 
      icon: <Dices className="w-4 h-4" />, 
      color: 'text-purple-400',
      bg: 'hover:bg-purple-500/15'
    },
    { 
      id: 'first-player', 
      label: 'Chi Inizia?', 
      icon: <Crown className="w-4 h-4" />, 
      color: 'text-yellow-400',
      bg: 'hover:bg-yellow-500/15'
    },
    { 
      id: 'score', 
      label: 'Segnapunti', 
      icon: <Calculator className="w-4 h-4" />, 
      color: 'text-emerald-400',
      bg: 'hover:bg-emerald-500/15'
    },
  ];

  return (
    <aside className="w-12 sm:w-14 bg-[#12141c] border-r border-slate-800/80 flex flex-col items-center py-3 shrink-0 z-20 select-none">
      {/* Brand Logo Header */}
      <div 
        className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm shadow-md shadow-amber-500/20 mb-3 border border-amber-400/30 select-none cursor-default"
        title="MeepleAI — L'Esperto dei Giochi da Tavolo"
      >
        🎲
      </div>

      <div className="w-6 h-[1px] bg-slate-800/80 mb-2" />

      {/* Game Tabletop Tools Stack */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest my-0.5">
          Tools
        </span>
        {TOOLS.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onOpenTool(t.id)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border border-amber-500/50 shadow-md shadow-amber-500/10 scale-105'
                  : `text-slate-400 hover:text-slate-100 bg-slate-900/60 ${t.bg} border border-slate-800/80 hover:border-slate-700`
              }`}
              title={t.label}
            >
              <span className={isActive ? 'text-amber-400' : t.color}>
                {t.icon}
              </span>
              {isActive && (
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Bottom Settings Button */}
      <div className="w-6 h-[1px] bg-slate-800/80 my-2" />

      <button
        onClick={onOpenSettings}
        className="w-9 h-9 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 flex items-center justify-center transition-all border border-slate-800/60 hover:border-slate-700 cursor-pointer"
        title="Impostazioni (Modello & API Key)"
      >
        <Settings className="w-4 h-4" />
      </button>
    </aside>
  );
}
