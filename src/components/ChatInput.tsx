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
  hideGameTag?: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  mode,
  gameContext,
  setGameContext,
  hideGameTag = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showGameInput, setShowGameInput] = React.useState(false);

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
      {/* Game Context Bar / Tag (Shown if game is active, or if in chat mode and not hidden) */}
      {(gameContext || (!hideGameTag && showGameInput) || !hideGameTag) && (
        <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
          {gameContext ? (
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
          ) : showGameInput ? (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-1 text-xs shadow-lg w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded-lg flex-1 sm:flex-initial">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cerca gioco (es. Wingspan)..."
                  className="bg-transparent border-none text-slate-100 text-xs focus:outline-none w-full sm:w-48 placeholder-slate-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) setGameContext(val);
                      setShowGameInput(false);
                    } else if (e.key === 'Escape') {
                      setShowGameInput(false);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => setShowGameInput(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowGameInput(true)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-lg transition-colors"
            >
              <Gamepad2 className="w-3 h-3 text-amber-400" />
              <span>+ Specifica Gioco</span>
            </button>
          )}
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
