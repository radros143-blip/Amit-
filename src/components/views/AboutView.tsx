import React from 'react';
import { Bot, ShieldCheck, Sparkles, Cpu, Radio, Heart } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-gray-950 to-black text-center space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-400 mx-auto flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] animate-pulse">
          <Bot className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
          MAYRA <span className="text-cyan-400 font-light">AI</span>
        </h2>
        <p className="text-xs font-mono text-cyan-300">
          Futuristic Android Personal AI Assistant • Version 4.8.0
        </p>

        <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
          MAYRA is a friendly personal AI assistant inspired by JARVIS, engineered with its own warm personality,
          fluent in conversational Hindi and Hinglish with light friendly humor, intelligent question answering,
          Android device control, creator scheduling, and holographic telemetry.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gray-950/70 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-900 text-cyan-400 w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold font-mono text-white">Hindi &amp; Hinglish Native</h4>
          <p className="text-xs text-slate-400">
            Natural speech recognition and Indian speech synthesis with respectful, contextual light humor.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gray-950/70 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-900 text-cyan-400 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold font-mono text-white">Gemini 3.8 AI Brain</h4>
          <p className="text-xs text-slate-400">
            Powered by modern server-side Google GenAI with context memory and safe structured action protocols.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gray-950/70 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-900 text-cyan-400 w-fit">
            <Radio className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold font-mono text-white">Acoustic Sensors</h4>
          <p className="text-xs text-slate-400">
            &quot;Hey Mayra&quot; wake word and Web Audio Triple-Clap detection for immediate hands-free wake.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gray-950/70 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-900 text-cyan-400 w-fit">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold font-mono text-white">Safe Action Registry</h4>
          <p className="text-xs text-slate-400">
            Never executes arbitrary code. Predefined safe intent launchers and confirmation for irreversible actions.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gray-950/70 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-900 text-cyan-400 w-fit">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <h4 className="text-sm font-bold font-mono text-white">Creator Assistant</h4>
          <p className="text-xs text-slate-400">
            Built for YouTube &amp; Instagram creators with speaking upload reminders, viral topic ideas, and pipeline tracking.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-900/40 bg-gray-950/70 space-y-2">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-900 text-cyan-400 w-fit">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <h4 className="text-sm font-bold font-mono text-white">32+ HUD Orb Styles</h4>
          <p className="text-xs text-slate-400">
            Fully customizable cybernetic cores including Arc Reactor Mk 85, Quantum Pulse, and Tachyon Shields.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/50 text-center text-xs font-mono text-slate-500">
        MAYRA AI Systems &bull; Built with Google AI Studio &bull; All Rights Reserved
      </div>
    </div>
  );
};
