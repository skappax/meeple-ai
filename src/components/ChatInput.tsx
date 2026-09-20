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
  const [showGameInput, setShowGameInput] = React.useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
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
    switch (mode) {
      case 'rules':
        return 'Chiedi un dubbio sulle regole (es. In Catan se tiro un 7...)...';
      case 'explain':
        return 'Quale gioco vuoi che ti spieghi in 3 minuti?...';
      case 'recommend':
        return 'Quanti siete e che tipo di gioco cercate per stasera?...';
      case 'setup':
        return 'Di quale gioco vuoi la checklist di setup rapido?...';
      default:
        return 'Chiedi un dubbio sulle regole, setup o consigli di gioco... (Invio per inviare)';
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4">
      {/* Game Context Bar / Tag */}
      <div className="flex items-center gap-2 mb-2">
        {gameContext ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-medium">
            <Gamepad2 className="w-3.5 h-3.5" />
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
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-2 text-xs shadow-lg animate-in fade-in">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-lg">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="text"
                placeholder="Scrivi nome gioco e premi Invio..."
                className="bg-transparent border-none text-slate-100 text-xs focus:outline-none w-52 placeholder-slate-400"
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
            {/* Quick popular board games */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <span className="text-[10px] text-slate-400">Popolari:</span>
              {['Catan', 'Wingspan', 'Carcassonne', 'Terraforming Mars', 'Dune: Imperium', 'Azul'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGameContext(g);
                    setShowGameInput(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGameInput(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowGameInput(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Specifica Gioco (Scheda BGG)</span>
          </button>
        )}
      </div>

      {/* Main Input Container */}
      <div className="relative rounded-2xl bg-[#161923] border border-slate-700/80 shadow-xl focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm px-4 py-3.5 pr-14 resize-none focus:outline-none max-h-48"
        />

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all ${
            input.trim() && !isLoading
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95'
              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
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

      <p className="text-center text-[11px] text-slate-400 mt-2">
        MeepleAI usa Google Gemini con prompt specializzati. Verifica sempre i regolamenti ufficiali per i tornei.
      </p>
    </div>
  );
}
