'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Gamepad2, RotateCcw, ChevronDown, Scale, Clock, FileText, Package, Dices } from 'lucide-react';
import { Sidebar, MODES } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { PromptStarters } from '@/components/PromptStarters';
import { ChatInput } from '@/components/ChatInput';
import { GameCard } from '@/components/GameCard';
import { SettingsModal } from '@/components/SettingsModal';
import { Conversation, ChatMessage as ChatMessageType, ChatMode } from '@/types/chat';
import { GameInfo } from '@/types/game';

const STORAGE_KEY = 'meeple_ai_conversations';
const SETTINGS_KEY = 'meeple_ai_settings';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('general');
  const [gameContext, setGameContext] = useState('');
  const [activeModel, setActiveModel] = useState('gemini-3.6-flash');
  const [customApiKey, setCustomApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch BGG Game Info when gameContext changes
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedConvs = localStorage.getItem(STORAGE_KEY);
      if (savedConvs) {
        const parsed = JSON.parse(savedConvs);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
          setCurrentMode(parsed[0].mode || 'general');
          setGameContext(parsed[0].gameContext || '');
        }
      }

      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.model) setActiveModel(parsed.model);
        if (parsed.apiKey) setCustomApiKey(parsed.apiKey);
      }
    } catch (e) {
      console.error('Failed to load local storage', e);
    }
    setLoaded(true);
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to local storage', e);
    }
  }, [conversations, loaded]);

  // Save settings to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ model: activeModel, apiKey: customApiKey })
      );
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [activeModel, customApiKey, loaded]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewConversation = (mode: ChatMode = currentMode) => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now(),
      title: 'Nuova partita',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      mode,
      gameContext: '',
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setCurrentMode(mode);
    setGameContext('');
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentMode(conv.mode || 'general');
      setGameContext(conv.gameContext || '');
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleClearAllChats = () => {
    setConversations([]);
    setActiveId(null);
    setGameContext('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSendMessage = async (promptOverride?: string, modeOverride?: ChatMode) => {
    const textToSend = (promptOverride || input).trim();
    if (!textToSend || isLoading) return;

    const modeToUse = modeOverride || currentMode;
    if (modeOverride) setCurrentMode(modeOverride);

    // Prepare current conversation
    let convId = activeId;
    let currentConv = conversations.find((c) => c.id === convId);

    const userMessage: ChatMessageType = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    if (!currentConv) {
      // Auto-generate title
      const title = textToSend.length > 30 ? textToSend.slice(0, 30) + '...' : textToSend;
      const newConv: Conversation = {
        id: 'conv_' + Date.now(),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage],
        mode: modeToUse,
        gameContext,
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
      convId = newConv.id;
      currentConv = newConv;
    } else {
      // If it was the first message or titled "Nuova partita", update title
      const isFirst = currentConv.messages.length === 0;
      const updatedTitle = isFirst
        ? textToSend.length > 30
          ? textToSend.slice(0, 30) + '...'
          : textToSend
        : currentConv.title;

      const updatedConv: Conversation = {
        ...currentConv,
        title: updatedTitle,
        updatedAt: Date.now(),
        messages: [...currentConv.messages, userMessage],
        mode: modeToUse,
        gameContext,
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? updatedConv : c))
      );
    }

    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = (currentConv ? currentConv.messages : []).concat(userMessage);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi.map((m) => ({ role: m.role, content: m.content })),
          mode: modeToUse,
          model: activeModel,
          apiKey: customApiKey || undefined,
          gameContext: gameContext || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Errore nella generazione della risposta.');
      }

      const assistantMessage: ChatMessageType = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...c.messages, assistantMessage],
              }
            : c
        )
      );
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Si è verificato un problema di connessione con Gemini. Verifica la chiave API o riprova.';
      const errorMessage: ChatMessageType = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Errore:** ${errorMsg}`,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, errorMessage],
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#0f1117] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          if (activeId) {
            setConversations((prev) =>
              prev.map((c) => (c.id === activeId ? { ...c, mode } : c))
            );
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeModel={activeModel}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0d0f15]">
        {/* Top Navbar */}
        <header className="h-12 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between bg-[#12141c]/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[180px] sm:max-w-none">
              {activeConversation?.title || 'MeepleAI Chat'}
            </span>
            {gameContext && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                <Gamepad2 className="w-3 h-3" />
                {gameContext}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={() => handleNewConversation(currentMode)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                title="Nuova chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuova chat</span>
              </button>
            )}

            {/* Interactive Mode Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-slate-200 text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Tocca per cambiare modalità di gioco"
              >
                {currentMode === 'rules' && <Scale className="w-3.5 h-3.5 text-emerald-400" />}
                {currentMode === 'explain' && <Clock className="w-3.5 h-3.5 text-blue-400" />}
                {currentMode === 'summary' && <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                {currentMode === 'setup' && <Package className="w-3.5 h-3.5 text-orange-400" />}
                {currentMode === 'recommend' && <Dices className="w-3.5 h-3.5 text-purple-400" />}
                {currentMode === 'general' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                
                <span className="font-medium text-[11px] sm:text-xs">
                  {currentMode === 'general' && 'Libero'}
                  {currentMode === 'rules' && 'Arbitro'}
                  {currentMode === 'explain' && 'Spiega 3m'}
                  {currentMode === 'summary' && 'Scheda'}
                  {currentMode === 'setup' && 'Setup'}
                  {currentMode === 'recommend' && 'Consigli'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isModeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsModeDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 top-9 w-52 py-1.5 bg-[#141722] border border-slate-700/90 rounded-xl shadow-2xl z-40 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[10px] uppercase font-semibold tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                      Modalità MeepleAI
                    </div>
                    {MODES.map((m) => {
                      const isSelected = currentMode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setCurrentMode(m.id);
                            if (activeId) {
                              setConversations((prev) =>
                                prev.map((c) => (c.id === activeId ? { ...c, mode: m.id } : c))
                              );
                            }
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/15 text-amber-300 font-medium' 
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={isSelected ? 'text-amber-400' : m.color}>{m.icon}</span>
                            <span>{m.label}</span>
                          </div>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Active BGG Game Info Card - Only shown during active chat (home view has integrated game card) */}
        {gameInfo && messages.length > 0 && (
          <div className="pt-1 pb-0.5 border-b border-slate-800/40 bg-[#10121a]/60 shrink-0">
            <GameCard
              game={gameInfo}
              onClose={() => {
                setGameContext('');
                setGameInfo(null);
              }}
              onTriggerPrompt={(prompt, mode) => handleSendMessage(prompt, mode)}
              defaultExpanded={false}
            />
          </div>
        )}

        {/* Chat / Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-6">
          {messages.length === 0 ? (
            <PromptStarters />
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <div className="flex justify-start mb-6 animate-pulse">
                  <div className="flex gap-3 max-w-[85%] items-center">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 text-base">
                      🎲
                    </div>
                    <div className="bg-[#161923] border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm text-slate-400 text-xs flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-slate-400">MeepleAI sta consultando i regolamenti...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          isLoading={isLoading}
          mode={currentMode}
          gameContext={gameContext}
          setGameContext={(game) => {
            setGameContext(game);
            if (activeId) {
              setConversations((prev) =>
                prev.map((c) => (c.id === activeId ? { ...c, gameContext: game } : c))
              );
            }
          }}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={activeModel}
        onSelectModel={setActiveModel}
        apiKey={customApiKey}
        onSaveApiKey={setCustomApiKey}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
}
