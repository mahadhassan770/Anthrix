"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Loader2, Bot, Minimize2, Maximize2,
  Sparkles, MessageSquare, Zap, HelpCircle, RotateCcw,
} from "lucide-react";
import MarkdownMessage from "./markdown-message";

// ─── Types ──────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

// ─── Quick Prompt Chips ─────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: "What services do you offer?", icon: Sparkles },
  { label: "I have a project in mind", icon: Zap },
  { label: "How much does it cost?", icon: HelpCircle },
  { label: "I want to get in touch", icon: MessageSquare },
];

// ─── Waveform Animation ─────────────────────────────────────────────────────

function Waveform({ active }: { active: boolean }) {
  const bars = 5;
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-[3px] rounded-full bg-[#F55036] transition-all"
          style={{
            height: active ? `${8 + Math.sin(i * 1.2) * 6}px` : "4px",
            animation: active ? `wave ${0.8 + i * 0.15}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          from { height: 4px; opacity: 0.5; }
          to { height: 16px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-[#F55036]" />
      </div>
      <div className="bg-white/[0.04] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Copilot Component ─────────────────────────────────────────────────

export default function AnthrixCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1); // teaser badge
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const defaultGreeting: Message = {
    id: "greeting",
    role: "assistant",
    text: "Hey there! 👋 I'm **A-OS**, the Anthrix AI Copilot.\n\nI can answer questions about our services, capabilities, and solutions — or help you get in touch with our team.\n\n*What's on your mind?*",
  };

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("anthrix_copilot_chat_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([defaultGreeting]);
        }
      } else {
        setMessages([defaultGreeting]);
      }
    } catch {
      setMessages([defaultGreeting]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save chat history to localStorage on change (capped at last 25 messages for ultra-light footprint)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (messages.length > 0) {
        const capped = messages.slice(-25);
        localStorage.setItem("anthrix_copilot_chat_v1", JSON.stringify(capped));
      }
    } catch (err) {
      console.error("Failed to save copilot chat history:", err);
    }
  }, [messages, isLoaded]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  // Reset unread badge on open
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const clearChat = () => {
    const freshGreeting: Message = {
      id: "greeting-" + Date.now(),
      role: "assistant",
      text: "Hey there! 👋 I'm **A-OS**, the Anthrix AI Copilot.\n\nI can answer questions about our services, capabilities, and solutions — or help you get in touch with our team.\n\n*What's on your mind?*",
    };
    setMessages([freshGreeting]);
    try {
      localStorage.setItem("anthrix_copilot_chat_v1", JSON.stringify([freshGreeting]));
    } catch {}
  };

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.text || "I'm here to help!",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I had a connectivity issue. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [messages, isThinking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* ── Floating Trigger Capsule ────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-full bg-[#080B12] border border-[#F55036]/30 shadow-[0_0_30px_rgba(245,80,54,0.25)] hover:shadow-[0_0_45px_rgba(245,80,54,0.4)] transition-all duration-300 hover:scale-[1.03]"
          aria-label="Open Anthrix AI Copilot"
        >
          {/* Animated energy ring */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#F55036]/20 animate-ping" style={{ animationDuration: "2.5s" }} />
            <div className="relative w-8 h-8 rounded-full bg-[#F55036]/10 border border-[#F55036]/40 flex items-center justify-center">
              <Bot size={16} className="text-[#F55036]" />
            </div>
          </div>

          {/* Label */}
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-white font-[family-name:var(--font-orbitron)]">
              A-OS
            </span>
            <span className="text-[9px] text-white/40 leading-none">Anthrix Copilot</span>
          </div>

          {/* Waveform */}
          <Waveform active={false} />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#F55036] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(245,80,54,0.8)]">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── HUD Window ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          data-lenis-prevent="true"
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-white/10 bg-[#080B12] shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_40px_rgba(245,80,54,0.1)] transition-all duration-300 overflow-hidden ${
            isMinimized ? "w-80 h-14" : "w-[380px] h-[580px] sm:w-[420px]"
          }`}
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0D1117]">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div className="relative w-8 h-8 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-[#F55036]/15 animate-pulse" style={{ animationDuration: "3s" }} />
                <div className="relative w-8 h-8 rounded-full bg-[#F55036]/10 border border-[#F55036]/30 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Anthrix" className="w-5 h-5 object-contain" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold tracking-[0.15em] uppercase text-white font-[family-name:var(--font-orbitron)]">
                    A-OS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_6px_rgba(245,80,54,0.8)] animate-pulse" />
                </div>
                <span className="text-[10px] text-white/30">Anthrix Autonomous Copilot</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Waveform active={isThinking} />
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={clearChat}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                title="New conversation (Clear chat)"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#F55036]/15 flex items-center justify-center text-white/40 hover:text-[#F55036] transition-all"
                title="Close"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* ── Body (hidden when minimized) ──────────────────────────────── */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                data-lenis-prevent="true"
                className="copilot-scroll flex-1 min-h-0 px-4 py-4 space-y-1"
              >
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 mb-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-[#F55036]" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {/* Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#F55036]/15 border border-[#F55036]/25 text-white rounded-br-sm whitespace-pre-wrap"
                            : "bg-white/[0.04] border border-white/8 text-white/85 rounded-bl-sm"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <MarkdownMessage content={msg.text} />
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isThinking && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts (show only when just greeting or no messages) */}
              {messages.length <= 1 && !isThinking && (
                <div className="flex-shrink-0 px-4 pb-3 flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        onClick={() => sendMessage(chip.label)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:border-[#F55036]/40 hover:bg-[#F55036]/10 text-white/80 hover:text-white text-[11px] font-medium transition-all shadow-sm"
                      >
                        <Icon size={12} className="text-[#F55036] transition-transform group-hover:scale-110" />
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Input ─────────────────────────────────────────────────── */}
              <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/[0.06]">
                <div className="flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#F55036]/40 transition-colors">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about Anthrix..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none resize-none leading-relaxed"
                    style={{ maxHeight: "80px" }}
                    disabled={isThinking}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isThinking}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#F55036] hover:bg-[#E04025] disabled:bg-white/10 disabled:text-white/20 flex items-center justify-center text-white transition-all disabled:cursor-not-allowed shadow-[0_0_12px_rgba(245,80,54,0.4)]"
                  >
                    {isThinking ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-white/20 text-center mt-2">
                  Powered by Anthrix LLM Engine · Autonomous AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
