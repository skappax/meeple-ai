'use client';

import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Dices, 
  Scale, 
  Clock, 
  Package, 
  Bot,
  Sparkles,
  X
} from 'lucide-react';
import { Conversation, ChatMode } from '@/types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: (mode?: ChatMode) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  currentMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
  onOpenSettings: () => void;
  activeModel: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MODES: { id: ChatMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'general', label: 'Tavolo Libero', icon: <Bot className="w-4 h-4 text-amber-400" />, desc: 'Chiacchierata & curiosità' },
  { id: 'rules', label: 'Arbitro Regole', icon: <Scale className="w-4 h-4 text-emerald-400" />, desc: 'Verdetti su casi limite' },
  { id: 'explain', label: 'Spiega in 3 Min', icon: <Clock className="w-4 h-4 text-blue-400" />, desc: 'Riassunto per novizi' },
  { id: 'recommend', label: 'Cosa Giochiamo?', icon: <Dices className="w-4 h-4 text-purple-400" />, desc: 'Consigli per stasera' },
  { id: 'setup', label: 'Setup Rapido', icon: <Package className="w-4 h-4 text-orange-400" />, desc: 'Checklist apparecchiatura' },
];

export function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  currentMode,
  onSelectMode,
  onOpenSettings,
  activeModel,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-50
        w-72 bg-[#141721] border-r border-slate-800/80 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-xl">
              🎲
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 tracking-tight text-base">MeepleAI</span>
                <span className="px-1.5 py-0.2 text-[10px] uppercase tracking-wider font-semibold rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Board Games
                </span>
              </div>
              <p className="text-[11px] text-slate-400">L&apos;arbitro dei giochi da tavolo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nuova Chat Button */}
        <div className="p-3">
          <button
            onClick={() => onNewConversation(currentMode)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-sm shadow-md shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuova Domanda / Partita</span>
          </button>
        </div>

        {/* Modalità Specializzate */}
        <div className="px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Modalità di Gioco</span>
          </div>
          <div className="space-y-1">
            {MODES.map((m) => {
              const isSelected = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMode(m.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cronologia Chat */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center justify-between">
            <span>Cronologia Partite</span>
            <span className="text-[10px] text-slate-400">{conversations.length}</span>
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-400">
              Nessuna chat salvata. Inizia chiedendo un dubbio su una regola o un consiglio!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-slate-100 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{conv.title || 'Nuova conversazione'}</span>
                  </div>
                  <button
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 hover:bg-slate-700/60 rounded transition-opacity"
                    title="Elimina chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Model & Settings */}
        <div className="p-3 border-t border-slate-800/80 bg-[#10121a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="text-[11px] font-medium text-slate-300 truncate">{activeModel}</p>
                <p className="text-[10px] text-emerald-400">Gemini Online</p>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Impostazioni"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
