'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex gap-3 max-w-[85%] lg:max-w-[75%] items-start">
          <div className="bg-amber-600/90 text-slate-50 px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-800 selection:text-white">
            {message.content}
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex gap-3 max-w-[95%] lg:max-w-[88%] items-start">
        {/* Meeple Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 text-base select-none">
          🎲
        </div>

        {/* Bubble */}
        <div className="relative group bg-[#161923] border border-slate-800/80 px-5 py-4 rounded-2xl rounded-tl-sm shadow-lg text-slate-200 text-sm w-full">
          {/* Header Bar inside assistant message */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400 text-xs tracking-wide">MeepleAI</span>
              <span className="text-[10px] text-slate-400">Arbitro & Regole</span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
              title="Copia risposta"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copiato</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copia</span>
                </>
              )}
            </button>
          </div>

          {/* Markdown Content */}
          <div className="prose-chat text-slate-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
