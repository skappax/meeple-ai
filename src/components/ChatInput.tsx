'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Gamepad2, X } from 'lucide-react';
import { ChatMode } from '@/types/chat';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  mode: ChatMode;
  gameContext: string;
  setGameContext: (game: string) => void;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  mode,
  gameContext,
  setGameContext,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  const getPlaceholder = () => {
    if (gameContext) {
      return `Dubbio su ${gameContext}? Chiedi qui...`;
    }
    switch (mode) {
      case 'rules':
        return 'Chiedi un dubbio sulle regole...';
      case 'explain':
        return 'Quale gioco vuoi che ti spieghi in 3 min?...';
      case 'summary':
        return 'Scrivi il nome di un gioco per la scheda tecnica BGG...';
      case 'recommend':
        return 'Quanti siete e cosa cercate stasera?...';
      case 'setup':
        return 'Di quale gioco vuoi il setup rapido?...';
      default:
        return 'Scrivi un dubbio su una regola, setup o gioco...';
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-2.5 sm:px-4 pb-2 sm:pb-4 shrink-0">
      {/* Game Context Tag (Shown only when a game is actively selected) */}
      {gameContext && (
        <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-medium">
            <Gamepad2 className="w-3 h-3" />
            <span>Gioco: <strong>{gameContext}</strong></span>
            <button
              onClick={() => setGameContext('')}
              className="p-0.5 hover:bg-amber-500/20 rounded text-amber-300/80 hover:text-amber-200"
              title="Rimuovi gioco"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative rounded-2xl bg-[#161923] border border-slate-700/80 shadow-xl focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base sm:text-sm px-3.5 py-3 pr-12 resize-none focus:outline-none max-h-36 leading-normal"
        />

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${
            input.trim() && !isLoading
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
          }`}
          title="Invia messaggio"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
}
