/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Loader2, Gamepad2, X, Mic, MicOff, Camera, FileText } from 'lucide-react';
import { ChatMode, Attachment } from '@/types/chat';
import { processSelectedFile } from '@/lib/file-helper';
import { isSpeechRecognitionSupported } from '@/lib/speech';
import { MODE_CONFIGS } from '@/lib/mode-helper';

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (attachment?: Attachment, wasVoice?: boolean) => void;
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
  const theme = MODE_CONFIGS[mode] || MODE_CONFIGS.general;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  // Gestione Speech Recognition (Microfono)
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Il riconoscimento vocale non è supportato da questo browser. Usa Chrome, Safari o Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognitionConstructor =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        alert('Riconoscimento vocale non disponibile.');
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'it-IT';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setWasVoiceInput(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i] && event.results[i][0]) {
            transcript += event.results[i][0].transcript;
          }
        }
        setInput(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || attachment)) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    const currentAttachment = attachment || undefined;
    const currentVoice = wasVoiceInput;
    setAttachment(null);
    setWasVoiceInput(false);
    onSend(currentAttachment, currentVoice);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setIsProcessingFile(true);
    try {
      const processed = await processSelectedFile(file);
      setAttachment(processed);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Errore nel caricamento del file');
    } finally {
      setIsProcessingFile(false);
      // Reset input value così da poter selezionare lo stesso file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getPlaceholder = () => {
    if (isListening) {
      return 'Ti ascolto... parla pure al microfono!';
    }
    if (gameContext) {
      return `Dubbio su ${gameContext}? Chiedi qui...`;
    }
    switch (mode) {
      case 'rules':
        return 'Chiedi un dubbio sulle regole o carica una foto...';
      case 'explain':
        return 'Quale gioco vuoi che ti spieghi in 3 min?...';
      case 'summary':
        return 'Scrivi il nome di un gioco per la scheda tecnica BGG...';
      case 'recommend':
        return 'Quanti siete e cosa cercate stasera?...';
      case 'setup':
        return 'Di quale gioco vuoi il setup rapido?...';
      default:
        return 'Scrivi un dubbio, parla al microfono o carica foto/PDF...';
    }
  };

  const canSend = (input.trim().length > 0 || attachment !== null) && !isLoading;

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

      {/* Attachment Preview (Image or PDF) */}
      {attachment && (
        <div className="mb-2 p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {attachment.type === 'image' ? (
              <img
                src={attachment.data}
                alt="Anteprima foto"
                className="w-10 h-10 rounded-lg object-cover border border-amber-500/40 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div className="overflow-hidden text-xs">
              <p className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">{attachment.name}</p>
              <p className="text-[10px] text-slate-400">
                {attachment.type === 'image' ? 'Foto tabellone/carte' : 'Regolamento PDF'}
                {attachment.size ? ` • ${Math.round(attachment.size / 1024)} KB` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAttachment(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors shrink-0"
            title="Rimuovi allegato"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File Loading or Error feedback */}
      {isProcessingFile && (
        <div className="mb-1.5 px-2 text-xs text-amber-400 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Elaborazione e compressione immagine in corso...</span>
        </div>
      )}
      {fileError && (
        <div className="mb-1.5 px-2 text-xs text-red-400 flex items-center gap-1.5">
          <span>⚠️ {fileError}</span>
        </div>
      )}

      {/* Hidden File Input (Camera / Gallery / PDF) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Input Container with Mode Frame */}
      <div className={`relative rounded-2xl bg-[#161923] border transition-all ${
        isListening
          ? 'border-red-500/80 ring-2 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          : `${theme.borderSubtle} focus-within:${theme.border} ${theme.glow} focus-within:ring-1`
      }`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base sm:text-sm pl-11 pr-24 py-3 resize-none focus:outline-none max-h-36 leading-normal"
        />

        {/* Left Action: Camera / File Attach Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isProcessingFile}
          className="absolute left-2.5 bottom-2.5 p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors"
          title="Scatta foto al tabellone o carica regolamento PDF"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Right Actions: Microphone + Send Button */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-400/50'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/80'
            }`}
            title={isListening ? 'Ferma ascolto' : 'Parla al microfono'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send Button with Dynamic Mode Color Accent */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              backgroundColor: canSend ? theme.accentHex : undefined,
            }}
            className={`p-2 rounded-xl transition-all ${
              canSend
                ? `text-slate-950 shadow-md ${theme.glow} active:scale-95 brightness-100 hover:brightness-110`
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
    </div>
  );
}
