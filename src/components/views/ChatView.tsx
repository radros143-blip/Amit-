import React, { useRef, useEffect } from 'react';
import { ChatMessage, OrbState } from '../../types/assistant';
import {
  Send,
  Mic,
  Volume2,
  Trash2,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface ChatViewProps {
  messages: ChatMessage[];
  currentInput: string;
  setCurrentInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isListening: boolean;
  onToggleVoice: () => void;
  onClearHistory: () => void;
  orbState: OrbState;
  onExecutePrompt: (prompt: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  currentInput,
  setCurrentInput,
  onSubmit,
  isListening,
  onToggleVoice,
  onClearHistory,
  orbState,
  onExecutePrompt,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSpeak = (text: string) => {
    voiceService.speak(text, 'MAYRA');
  };

  const samplePrompts = [
    'Mayra, India की capital क्या है?',
    'Mayra, आज मेरा mood खराब है।',
    'Mayra, तुम क्या कर रही हो?',
    'Mayra, मुझे YouTube पर grow करना है।',
    'YouTube खोलो',
    'Google Drive खोलो',
    'Battery कितनी है?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto rounded-2xl border border-cyan-500/20 bg-gray-950/90 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.08)] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-cyan-950 flex items-center justify-between bg-gray-900/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-950" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              MAYRA AI CONVERSATION
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                STATE: {orbState}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Hindi / Hinglish / English • Context Memory Active
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-gray-800 hover:border-rose-900/50 transition font-mono"
          title="Clear Context & Chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-8 h-8 animate-spin-slow" />
            </div>
            <h4 className="text-base font-bold font-mono text-white">
              MAYRA AI से बातचीत शुरू करें
            </h4>
            <p className="text-xs text-slate-400 max-w-md font-mono">
              MAYRA सिर्फ chatbot नहीं है—यह आपकी दोस्त, फोन automation साथी, और creator assistant है। नीचे दिए गए prompts आज़माएं:
            </p>

            {/* Prompt Chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onExecutePrompt(p)}
                  className="text-xs font-mono px-3 py-1.5 rounded-full border border-cyan-900/60 bg-gray-900/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role !== 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm font-sans ${
                  m.role === 'user'
                    ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-50 rounded-tr-none'
                    : 'bg-gray-900/90 border border-gray-800 text-slate-100 rounded-tl-none shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-slate-400">
                  <span className="font-semibold text-cyan-400">
                    {m.role === 'user' ? 'YOU' : 'MAYRA'}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {m.content}
                </div>

                {/* Action Chip if present */}
                {m.actionExecuted && (
                  <div className="mt-2.5 p-2 rounded-lg bg-gray-950 border border-cyan-900/60 text-xs font-mono text-cyan-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      ACTION: {m.actionExecuted.type}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                      EXECUTED
                    </span>
                  </div>
                )}

                {/* Voice Speak Button for Assistant Messages */}
                {m.role !== 'user' && (
                  <div className="mt-2 pt-2 border-t border-gray-800/80 flex justify-end">
                    <button
                      onClick={() => handleSpeak(m.content)}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-200"
                      title="Speak aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Speak
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={onSubmit} className="p-3 border-t border-cyan-950 bg-gray-900/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type in Hindi, Hinglish, or English (e.g. 'कल का मौसम कैसा होगा?')..."
            className="w-full bg-gray-950 border border-cyan-600/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 pr-24"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleVoice}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_#ef4444] animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!currentInput.trim()}
              className="p-2 rounded-lg bg-cyan-500 text-gray-950 font-bold hover:bg-cyan-400 disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
