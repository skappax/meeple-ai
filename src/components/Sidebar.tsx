'use client';

import React, { useState } from 'react';
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
  isOpen?: boolean;
  onClose?: () => void;
}

export const MODES: { id: ChatMode; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: 'rules', label: 'Arbitro Regole', icon: <Scale className="w-4 h-4" />, desc: 'Verdetti su casi limite', color: 'text-emerald-400' },
  { id: 'explain', label: 'Spiega in 3 Min', icon: <Clock className="w-4 h-4" />, desc: 'Riassunto per novizi', color: 'text-blue-400' },
  { id: 'setup', label: 'Setup Rapido', icon: <Package className="w-4 h-4" />, desc: 'Checklist apparecchiatura', color: 'text-orange-400' },
  { id: 'recommend', label: 'Cosa Giochiamo?', icon: <Dices className="w-4 h-4" />, desc: 'Consigli per stasera', color: 'text-purple-400' },
  { id: 'general', label: 'Tavolo Libero', icon: <Bot className="w-4 h-4" />, desc: 'Chiacchierata & curiosità', color: 'text-amber-400' },
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
}: SidebarProps) {
  const [showHistoryFlyout, setShowHistoryFlyout] = useState(false);

  return (
    <>
      {/* Permanent Icon Column (Rail) - Compact 48px on mobile, 56px on desktop */}
      <aside className="w-12 sm:w-14 bg-[#12141c] border-r border-slate-800/80 flex flex-col items-center py-2.5 shrink-0 z-20 select-none">
        {/* Top Brand Logo */}
        <button 
          onClick={() => onNewConversation('general')}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm shadow-md shadow-amber-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-all mb-2"
          title="MeepleAI - Nuova partita"
        >
          🎲
        </button>

        {/* Nuova Chat (+) Button */}
        <button
          onClick={() => onNewConversation(currentMode)}
          className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center shadow-sm transition-all active:scale-90 mb-2"
          title="Nuova partita (+)"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="w-6 h-[1px] bg-slate-800/80 my-1" />

        {/* Modes Icon Stack (Vertical Column) */}
        <div className="flex flex-col items-center gap-1.5 my-1">
          {MODES.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all relative group ${
                  isSelected
                    ? 'bg-slate-800/90 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={`${m.label}: ${m.desc}`}
              >
                <span className={isSelected ? 'text-amber-400' : m.color}>
                  {m.icon}
                </span>
                {isSelected && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Bottom Utilities: History & Settings */}
        <div className="w-6 h-[1px] bg-slate-800/80 my-1.5" />

        <div className="flex flex-col items-center gap-1.5">
          {/* History Button with Count Badge */}
          <button
            onClick={() => setShowHistoryFlyout(!showHistoryFlyout)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all relative ${
              showHistoryFlyout
                ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Cronologia partite"
          >
            <MessageSquare className="w-4 h-4" />
            {conversations.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 flex items-center justify-center transition-all"
            title="Impostazioni"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Flyout Panel for Chat History (Opens next to rail when clicked) */}
      {showHistoryFlyout && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30"
            onClick={() => setShowHistoryFlyout(false)}
          />
          <div className="fixed top-0 left-12 sm:left-14 bottom-0 w-64 bg-[#141722] border-r border-slate-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Cronologia Partite</span>
              </div>
              <button
                onClick={() => setShowHistoryFlyout(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nessuna partita salvata.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        setShowHistoryFlyout(false);
                      }}
                      className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-slate-100 font-medium'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate flex-1 pr-2">{conv.title}</span>
                      <button
                        onClick={(e) => onDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                        title="Elimina"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
