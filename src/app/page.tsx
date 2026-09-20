'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, Sparkles, Gamepad2, RotateCcw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentMode(conv.mode || 'general');
      setGameContext(conv.gameContext || '');
    }
    setIsSidebarOpen(false);
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
    <div className="flex h-screen bg-[#0f1117] text-slate-100 overflow-hidden font-sans">
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
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0d0f15]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-[#12141c]/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">
                {activeConversation?.title || 'MeepleAI Chat'}
              </span>
              {gameContext && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                  <Gamepad2 className="w-3 h-3" />
                  {gameContext}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => handleNewConversation(currentMode)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                title="Ricomincia chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nuova chat</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="font-medium capitalize">
                {currentMode === 'general' && 'Libero'}
                {currentMode === 'rules' && 'Arbitro'}
                {currentMode === 'explain' && 'Spiega 3 min'}
                {currentMode === 'recommend' && 'Consigli'}
                {currentMode === 'setup' && 'Setup'}
              </span>
            </div>
          </div>
        </header>

        {/* Active BGG Game Info Card */}
        {gameInfo && (
          <div className="pt-3 pb-1 border-b border-slate-800/40 bg-[#10121a]/60">
            <GameCard
              game={gameInfo}
              onClose={() => {
                setGameContext('');
                setGameInfo(null);
              }}
              onTriggerPrompt={(prompt, mode) => handleSendMessage(prompt, mode)}
            />
          </div>
        )}

        {/* Chat / Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <PromptStarters
              onSelectPrompt={(prompt, mode) => handleSendMessage(prompt, mode)}
            />
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
