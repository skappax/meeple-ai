/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Volume2, Square, FileText } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '@/lib/speech';

import { MODE_CONFIGS } from '@/lib/mode-helper';

interface ChatMessageProps {
  message: ChatMessageType;
  autoSpeak?: boolean;
}

export function ChatMessage({ message, autoSpeak = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const msgMode = message.mode || 'general';
  const theme = MODE_CONFIGS[msgMode] || MODE_CONFIGS.general;

  // Auto-play per comandi vocali se abilitato
  useEffect(() => {
    if (!isUser && (message.wasVoice || autoSpeak) && isSpeechSynthesisSupported()) {
      const started = speakText(
        message.content,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
      if (started) {
        setIsPlayingAudio(true);
      }
    }
    return () => {
      stopSpeaking();
    };
  }, [message.id, isUser, message.wasVoice, autoSpeak, message.content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const started = speakText(
        message.content,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
      if (started) {
        setIsPlayingAudio(true);
      }
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex gap-3 max-w-[85%] lg:max-w-[75%] items-start">
          <div className="bg-amber-600/90 text-slate-50 px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-800 selection:text-white">
            {/* User Attached Media (Image or PDF) */}
            {message.attachment && (
              <div className="mb-2.5">
                {message.attachment.type === 'image' ? (
                  <img
                    src={message.attachment.data}
                    alt="Foto tabellone/carta"
                    className="max-h-56 max-w-full rounded-xl object-contain border border-amber-300/40 shadow-sm bg-black/20"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-700/80 border border-amber-400/40 text-xs">
                    <FileText className="w-4 h-4 text-amber-200 shrink-0" />
                    <span className="truncate font-medium">{message.attachment.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* User Message Text */}
            {message.content && <div>{message.content}</div>}
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

        {/* Bubble with Distinct Mode Colored Frame */}
        <div className={`relative group bg-[#161923] border ${theme.borderSubtle} border-l-4 ${theme.border} px-5 py-4 rounded-2xl rounded-tl-sm ${theme.glow} shadow-lg text-slate-200 text-sm w-full transition-all`}>
          {/* Header Bar inside assistant message */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400 text-xs tracking-wide">MeepleAI</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${theme.bgBadge} ${theme.textBadge} border ${theme.borderSubtle}`}>
                {theme.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Text-to-Speech Button */}
              {isSpeechSynthesisSupported() && (
                <button
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors ${
                    isPlayingAudio
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-amber-300 bg-slate-800/60 hover:bg-slate-800'
                  }`}
                  title={isPlayingAudio ? 'Ferma lettura a voce' : 'Ascolta verdetto a voce alta'}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-3 h-3 fill-amber-300 text-amber-300 animate-pulse" />
                      <span className="text-amber-300">Ferma</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Ascolta</span>
                    </>
                  )}
                </button>
              )}

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
