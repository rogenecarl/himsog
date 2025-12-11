"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, MessageSquare, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const MAX_MESSAGE_LENGTH = 500;

const QUICK_ACTIONS = [
  "What is Himsog?",
  "Who created this project?",
  "How do I book an appointment?",
  "Find healthcare providers",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! 👋 Welcome to Himsog!\n\nI'm your healthcare assistant. Ask me anything about Himsog and I'll be happy to help!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const charactersRemaining = MAX_MESSAGE_LENGTH - input.length;
  const isOverLimit = charactersRemaining < 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Check character limit
    if (textToSend.length > MAX_MESSAGE_LENGTH) {
      setRateLimitError(`Message exceeds ${MAX_MESSAGE_LENGTH} character limit`);
      return;
    }

    // Clear any previous rate limit error
    setRateLimitError(null);

    const userMessage: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      // Handle rate limit error
      if (response.status === 429) {
        setRateLimitError(data.message || "Too many requests. Please wait a moment.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `⚠️ ${data.message || "You're sending messages too quickly. Please wait a moment and try again."}`,
          },
        ]);
        return;
      }

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.message || "Sorry, I encountered an error. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white rounded-full p-4 shadow-2xl shadow-slate-900/20 dark:shadow-cyan-500/20 transition-all duration-300 z-50 group"
            aria-label="Open healthcare chat"
          >
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[calc(100%-3rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-[#0B0F19] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 dark:border-white/10"
          >
            {/* Header */}
            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
                  <Bot className="w-6 h-6 text-cyan-700 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight flex items-center gap-2">
                    Himsog AI
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Online & Ready</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full p-2 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-[#0B0F19] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
              <div className="text-center text-xs text-slate-400 dark:text-slate-500 my-4 font-medium uppercase tracking-wider">
                Today
              </div>

              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[85%] ${msg.role === "assistant" ? "gap-3" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
                      </div>
                    )}

                    <div
                      className={`p-4 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                          ? "bg-slate-900 dark:bg-cyan-600 text-white rounded-2xl rounded-tr-none"
                          : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-none"
                        }`}
                    >
                      <div className="whitespace-pre-wrap space-y-2">
                        {msg.text.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {paragraph.split('\n').map((line, lineIdx) => {
                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <span key={lineIdx}>
                                  {parts.map((part, partIdx) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={partIdx} className="font-bold">{part.slice(2, -2)}</strong>;
                                    }
                                    return <span key={partIdx}>{part}</span>;
                                  })}
                                  {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                </span>
                              );
                            })}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
                  </div>
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  </div>
                </div>
              )}

              {showQuickActions && messages.length === 1 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 px-2"
                >
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider px-1">Suggested Actions</p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_ACTIONS.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(action)}
                        className="text-left px-4 py-3 bg-white dark:bg-white/5 hover:bg-cyan-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-cyan-200 dark:hover:border-cyan-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 transition-all duration-200 shadow-sm hover:shadow group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-cyan-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                          {action}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-white/10">
              {/* Rate limit error message */}
              {rateLimitError && (
                <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">{rateLimitError}</p>
                </div>
              )}

              <div className={`relative flex items-end gap-2 bg-slate-50 dark:bg-white/5 border rounded-3xl p-1.5 focus-within:ring-2 transition-all ${
                isOverLimit
                  ? "border-red-400 dark:border-red-600 focus-within:ring-red-100 dark:focus-within:ring-red-900/30 focus-within:border-red-400"
                  : "border-slate-200 dark:border-white/10 focus-within:ring-cyan-100 dark:focus-within:ring-cyan-900/30 focus-within:border-cyan-400 dark:focus-within:border-cyan-700"
              }`}>
                <input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (rateLimitError) setRateLimitError(null);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health query..."
                  maxLength={MAX_MESSAGE_LENGTH + 50} // Allow slight overflow for user to see they went over
                  className="flex-1 bg-transparent px-4 py-2.5 min-h-11 max-h-32 focus:outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim() || isOverLimit}
                  className="bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 mb-0.5 mr-0.5"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 translate-x-0.5" />
                </button>
              </div>

              {/* Character counter and powered by */}
              <div className="flex items-center justify-between mt-2 px-1">
                <span className={`text-[10px] font-medium transition-colors ${
                  isOverLimit
                    ? "text-red-500 dark:text-red-400"
                    : charactersRemaining <= 50
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-slate-400 dark:text-slate-600"
                }`}>
                  {charactersRemaining >= 0 ? `${charactersRemaining} characters remaining` : `${Math.abs(charactersRemaining)} characters over limit`}
                </span>
                <div className="text-[10px] text-slate-400 dark:text-slate-600 font-medium flex items-center gap-1">
                  Powered by <span className="text-cyan-600 dark:text-cyan-500">Gemini AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}