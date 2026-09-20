'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, Trash2, CheckCircle2 } from 'lucide-react';
import { AVAILABLE_MODELS } from '@/lib/gemini';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onSelectModel: (model: string) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearAllChats: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentModel,
  onSelectModel,
  apiKey,
  onSaveApiKey,
  onClearAllChats,
}: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161923] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="font-bold text-slate-100 text-sm">Impostazioni MeepleAI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-300">
          {/* Model Selection */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-200 mb-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Modello Google Gemini</span>
            </label>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    currentModel === m.id
                      ? 'border-amber-500/60 bg-amber-500/10 text-slate-100'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium text-xs mb-0.5">
                    <span className={currentModel === m.id ? 'text-amber-300 font-semibold' : ''}>
                      {m.name}
                    </span>
                    {currentModel === m.id && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                        Attivo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Key Override */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Chiave API Gemini (Opzionale / Override)</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Il server ha già una chiave configurata in `.env.local`. Se desideri usare un&apos;altra chiave personale da browser, inseriscila qui.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Lascia vuoto per usare la chiave del server"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (confirm('Sei sicuro di voler cancellare tutta la cronologia delle chat?')) {
                  onClearAllChats();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-medium hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancella tutte le chat salvate</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#12141c] flex items-center justify-end gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium mr-auto">
              <CheckCircle2 className="w-4 h-4" /> Impostazioni salvate!
            </span>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium"
          >
            Chiudi
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            Salva modifiche
          </button>
        </div>
      </div>
    </div>
  );
}
