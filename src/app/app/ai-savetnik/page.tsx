'use client';

/**
 * Botislav AI Savetnik — Chat Interface
 *
 * Real-time chat with Botislav for:
 * - Document creation (Akt o proceni rizika)
 * - BZR questions and guidance
 * - Compliance help
 *
 * Uses backend API: POST /api/ai/chat
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { refreshCachedToken } from '@/lib/trpc';
import {
  Send, Bot, User, Loader2, FileText, HelpCircle,
  Shield, Sparkles, RotateCcw, X, ChevronDown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationMeta {
  conversationId: number | null;
  mode: 'sales' | 'document_creation' | 'help';
  messageCount: number;
}

const MODE_CONFIG = {
  document_creation: {
    label: 'Kreiranje dokumenta',
    description: 'Akt o proceni rizika, obrasci, evidencije',
    icon: FileText,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    greeting: 'Здраво! Ја сам Ботислав, ваш AI саветник за безбедност и здравље на раду.\n\nСпреман сам да вам помогнем да креирате Акт о процени ризика. Процес је једноставан — ја ћу вам постављати питања једно по једно, а ви само одговарајте.\n\nХајде да почнемо! Који је пун назив ваше компаније?',
  },
  help: {
    label: 'Pomoć i pitanja',
    description: 'BZR propisi, objašnjenja, uputstva',
    icon: HelpCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    greeting: 'Здраво! Ја сам Ботислав. Питајте ме било шта о безбедности и здрављу на раду — прописи, обрасци, обавезе, рокови... Ту сам да помогнем!',
  },
  sales: {
    label: 'Upoznaj platformu',
    description: 'Šta je BZR Savetnik i kako vam pomaže',
    icon: Sparkles,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    greeting: 'Здраво! Ја сам Ботислав са BZR Savetnik платформе.\n\nМогу да вам помогнем да разумете шта све наша платформа ради — од аутоматског креирања Акта о процени ризика до праћења свих законских рокова.\n\nШта вас занима?',
  },
};

export default function AiSavetnikPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [meta, setMeta] = useState<ConversationMeta>({
    conversationId: null,
    mode: 'help',
    messageCount: 0,
  });
  const [modeSelected, setModeSelected] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll position for "scroll down" button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  function selectMode(mode: 'sales' | 'document_creation' | 'help') {
    const config = MODE_CONFIG[mode];
    setMeta({ conversationId: null, mode, messageCount: 0 });
    setMessages([{
      id: 'greeting',
      role: 'assistant',
      content: config.greeting,
      timestamp: new Date(),
    }]);
    setModeSelected(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const token = await refreshCachedToken();

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Session-Id': `web-${Date.now()}`,
        },
        body: JSON.stringify({
          conversationId: meta.conversationId || undefined,
          message: text,
          mode: meta.mode,
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMsg]);
        setMeta(prev => ({
          ...prev,
          conversationId: data.data.conversationId,
          messageCount: prev.messageCount + 1,
        }));
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Извините, дошло је до грешке. Покушајте поново.',
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Не могу да се повежем са сервером. Проверите интернет конекцију.',
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function resetChat() {
    setMessages([]);
    setMeta({ conversationId: null, mode: 'help', messageCount: 0 });
    setModeSelected(false);
  }

  // Mode selection screen
  if (!modeSelected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Botislav AI Savetnik</h1>
          <p className="text-muted-foreground mt-1">Izaberite kako vam mogu pomoci</p>
        </div>

        <div className="grid gap-4 w-full max-w-lg">
          {(Object.entries(MODE_CONFIG) as [string, typeof MODE_CONFIG.help][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => selectMode(key as any)}
                className={`p-5 rounded-xl border-2 text-left hover:shadow-md transition-all ${config.bg}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{config.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Chat interface
  const currentConfig = MODE_CONFIG[meta.mode];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Botislav</h2>
            <p className="text-xs text-muted-foreground">{currentConfig.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {meta.conversationId && (
            <span className="text-xs text-muted-foreground">#{meta.conversationId}</span>
          )}
          <button
            onClick={resetChat}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Novi razgovor"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50 relative"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-white border shadow-sm rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1.5 ${
                msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
              }`}>
                {msg.timestamp.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollDown && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={scrollToBottom}
            className="p-2 rounded-full bg-white border shadow-lg hover:bg-muted transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t bg-card rounded-b-xl">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Unesite poruku..."
            rows={1}
            className="flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-32 min-h-[42px]"
            style={{ height: 'auto', overflow: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="h-[42px] w-[42px] rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Botislav v2.0 — AI savetnik za bezbednost i zdravlje na radu
        </p>
      </div>
    </div>
  );
}
