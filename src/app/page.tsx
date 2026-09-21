'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  RotateCcw, 
  ChevronDown, 
  Scale, 
  Clock, 
  FileText, 
  Package, 
  Dices,
  X
} from 'lucide-react';
import { Sidebar, MODES } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { PromptStarters } from '@/components/PromptStarters';
import { ChatInput } from '@/components/ChatInput';
import { GameCard } from '@/components/GameCard';
import { SettingsModal } from '@/components/SettingsModal';
import { GameTools, GameToolType } from '@/components/GameTools';
import { ChatMessage as ChatMessageType, ChatMode, Attachment } from '@/types/chat';
import { GameInfo } from '@/types/game';
import { detectModeFromQuery, MODE_CONFIGS } from '@/lib/mode-helper';

const SETTINGS_KEY = 'meeple_ai_settings';

export default function Home() {
  // Sessione Effimera (la chat si azzera al refresh o con Pulisci Chat)
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('general');
  const [gameContext, setGameContext] = useState('');

  // Settings & Modals
  const [activeModel, setActiveModel] = useState('gemini-3.6-flash');
  const [customApiKey, setCustomApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<GameToolType | null>(null);
  const [loaded, setLoaded] = useState(false);

  // BGG Game Info Cache
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentTheme = MODE_CONFIGS[currentMode] || MODE_CONFIGS.general;

  // Caricamento info BGG quando cambia il contesto del gioco
  useEffect(() => {
    if (!gameContext.trim()) {
      setGameInfo(null);
      return;
    }
    let isMounted = true;
    fetch(`/api/game-info?game=${encodeURIComponent(gameContext.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.game) {
          setGameInfo(data.game);
        }
      })
      .catch((err) => console.error('Failed to load game info:', err));

    return () => {
      isMounted = false;
    };
  }, [gameContext]);

  // Caricamento impostazioni da localStorage on mount (solo modello e API key)
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.model) setActiveModel(parsed.model);
        if (parsed.apiKey) setCustomApiKey(parsed.apiKey);
      }
    } catch (e) {
      console.error('Failed to load settings from local storage', e);
    }
    setLoaded(true);
  }, []);

  // Salvataggio impostazioni
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ model: activeModel, apiKey: customApiKey })
      );
    } catch (e) {
      console.error('Failed to save settings to local storage', e);
    }
  }, [activeModel, customApiKey, loaded]);

  // Auto-scroll all'ultimo messaggio
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Pulisci Chat (Azzera la sessione corrente in un lampo)
  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  };

  const handleClearGameContext = () => {
    setGameContext('');
    setGameInfo(null);
  };

  // Invio messaggio
  const handleSendMessage = async (
    promptOverride?: string,
    modeOverride?: ChatMode,
    attachment?: Attachment,
    wasVoice?: boolean
  ) => {
    const textToSend = (promptOverride || input).trim();
    if ((!textToSend && !attachment) || isLoading) return;

    // Rilevamento automatico intento (es. domanda di setup da regole)
    const detectedMode = detectModeFromQuery(textToSend, currentMode);
    const modeToUse = modeOverride || detectedMode;
    if (modeToUse !== currentMode) {
      setCurrentMode(modeToUse);
    }

    const userMessage: ChatMessageType = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend || (attachment ? `Analisi di: ${attachment.name}` : ''),
      timestamp: Date.now(),
      attachment,
      wasVoice,
      mode: modeToUse,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachment: m.attachment,
          })),
          mode: modeToUse,
          model: activeModel,
          apiKey: customApiKey || undefined,
          gameContext: gameContext || undefined,
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Errore nella risposta dal server.';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch {
          // Errore generico
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const assistantMessage: ChatMessageType = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
        wasVoice,
        mode: modeToUse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Si è verificato un errore.';
      const errorMessage: ChatMessageType = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: `⚠️ **Errore:** ${errorText}\n\nVerifica la connessione o controlla la tua chiave API Google Gemini nelle impostazioni ⚙️.`,
        timestamp: Date.now(),
        mode: modeToUse,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0c10] text-slate-100 overflow-hidden font-sans select-text">
      {/* Tabletop Tools Left Rail */}
      <Sidebar
        activeTool={activeTool}
        onOpenTool={(tool) => setActiveTool(tool)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeModel={activeModel}
      />

      {/* Main Content Area with Dynamic Mode Colored Frame */}
      <div className={`flex-1 flex flex-col h-full relative overflow-hidden bg-[#0d0f15] border-t-2 ${currentTheme.borderSubtle} transition-all duration-300`}>
        {/* Top Mode Line with Glowing Ambient Accent */}
        <div 
          className="h-[3px] w-full transition-all duration-500 shrink-0" 
          style={{ backgroundColor: currentTheme.accentHex, boxShadow: `0 0 12px ${currentTheme.accentHex}` }}
        />

        {/* Top Navbar */}
        <header className="h-12 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between bg-[#12141c]/90 backdrop-blur-md z-10 shrink-0">
          {/* Left Brand & Game Context */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-wide text-slate-100 flex items-center gap-1.5">
              <span>MeepleAI</span>
            </span>

            {gameContext && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full shadow-sm">
                <Gamepad2 className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{gameContext}</span>
                <button
                  onClick={handleClearGameContext}
                  className="hover:text-amber-100 p-0.5 rounded transition-colors ml-0.5"
                  title="Rimuovi gioco attivo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Controls: Pulisci Chat + Selettore Modalità */}
          <div className="flex items-center gap-2">
            {/* Pulisci Chat Button (Visibile quando ci sono messaggi) */}
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-500/20 border border-slate-700/80 hover:border-red-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Azzera e pulisci la chat corrente"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] sm:text-xs">Pulisci</span>
              </button>
            )}

            {/* Interactive Mode Dropdown Selector with Distinct Colored Frame */}
            <div className="relative">
              <button
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentTheme.bgBadge} border ${currentTheme.border} ${currentTheme.textBadge} text-xs transition-all active:scale-95 cursor-pointer shadow-sm ${currentTheme.glow}`}
                title="Tocca per cambiare modalità di gioco"
              >
                {currentMode === 'rules' && <Scale className="w-3.5 h-3.5 text-emerald-400" />}
                {currentMode === 'explain' && <Clock className="w-3.5 h-3.5 text-blue-400" />}
                {currentMode === 'summary' && <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                {currentMode === 'setup' && <Package className="w-3.5 h-3.5 text-orange-400" />}
                {currentMode === 'recommend' && <Dices className="w-3.5 h-3.5 text-purple-400" />}
                {currentMode === 'general' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                
                <span className="font-semibold text-[11px] sm:text-xs">
                  {currentTheme.shortLabel}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isModeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsModeDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141722] border border-slate-800 shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Modalità di Risposta
                      </span>
                    </div>

                    {MODES.map((m) => {
                      const isSelected = currentMode === m.id;
                      const modeTheme = MODE_CONFIGS[m.id];
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setCurrentMode(m.id);
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors ${
                            isSelected 
                              ? `${modeTheme.bgBadge} ${modeTheme.textBadge}` 
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <span className={`mt-0.5 ${isSelected ? modeTheme.textBadge : m.color}`}>
                            {m.icon}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold leading-tight">
                              {m.label}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                              {m.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Widget BGG se presente un gioco attivo */}
            {gameInfo && (
              <GameCard
                game={gameInfo}
                onClose={handleClearGameContext}
                onTriggerPrompt={(prompt, mode) => handleSendMessage(prompt, mode)}
              />
            )}

            {/* Schermata iniziale se non ci sono messaggi */}
            {messages.length === 0 ? (
              <PromptStarters />
            ) : (
              messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  autoSpeak={msg.wasVoice}
                />
              ))
            )}

            {/* Indicatore "Digitazione" mentre Gemini calcola la risposta */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-4 bg-[#161923]/60 rounded-xl w-fit border border-slate-800 animate-pulse">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>MeepleAI sta consultando le regole...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={(attachment, wasVoice) => handleSendMessage(undefined, undefined, attachment, wasVoice)}
          isLoading={isLoading}
          mode={currentMode}
          gameContext={gameContext}
          setGameContext={setGameContext}
        />
      </div>

      {/* Tabletop Tools Dialog */}
      <GameTools
        activeTool={activeTool}
        onClose={() => setActiveTool(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={activeModel}
        onSelectModel={setActiveModel}
        apiKey={customApiKey}
        onSaveApiKey={setCustomApiKey}
        onClearAllChats={handleClearChat}
      />
    </div>
  );
}
