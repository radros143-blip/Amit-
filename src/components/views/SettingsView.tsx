import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Zap,
  Mic,
  Volume2,
  Globe,
  Bell,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface SettingsViewProps {
  assistantName: string;
  setAssistantName: (val: string) => void;
  wakeWordEnabled: boolean;
  setWakeWordEnabled: (val: boolean) => void;
  clapEnabled: boolean;
  setClapEnabled: (val: boolean) => void;
  language: string;
  setLanguage: (val: string) => void;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  assistantName,
  setAssistantName,
  wakeWordEnabled,
  setWakeWordEnabled,
  clapEnabled,
  setClapEnabled,
  language,
  setLanguage,
  privacyMode,
  setPrivacyMode,
}) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            CORE SYSTEM SETTINGS &amp; AUTOMATION
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Personalize MAYRA&apos;s identity, wake word triggers, acoustic clap sensors, and privacy modes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-gray-950 font-mono text-xs font-bold hover:bg-cyan-400 transition"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Identity & Language Section */}
      <div className="p-5 rounded-2xl border border-cyan-900/50 bg-gray-950/80 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          ASSISTANT IDENTITY &amp; LANGUAGE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Assistant Name
            </label>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Primary Language Profile
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="Hinglish">Hindi / Hinglish (Default • हिंदी)</option>
              <option value="Hindi">Pure Hindi (शुद्ध हिंदी)</option>
              <option value="English">Indian English (en-IN)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wake Word & Sensors */}
      <div className="p-5 rounded-2xl border border-cyan-900/50 bg-gray-950/80 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-cyan-400" />
          WAKE WORDS &amp; ACOUSTIC SENSORS
        </h3>

        <div className="space-y-3">
          {/* Wake word toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-gray-900/40">
            <div>
              <div className="text-xs font-bold text-white font-mono">
                Continuous Wake Word Detection
              </div>
              <div className="text-[11px] text-slate-400">
                Trigger MAYRA hands-free by saying &quot;Hey Mayra&quot; or &quot;Mayra&quot;.
              </div>
            </div>
            <button
              onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                wakeWordEnabled ? 'bg-cyan-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  wakeWordEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Triple clap toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-gray-900/40">
            <div>
              <div className="text-xs font-bold text-white font-mono">
                Triple Clap Activation (3x Clap)
              </div>
              <div className="text-[11px] text-slate-400">
                Detect 3 quick claps using Web Audio Analyser to wake MAYRA instantly.
              </div>
            </div>
            <button
              onClick={() => setClapEnabled(!clapEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                clapEnabled ? 'bg-emerald-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  clapEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy and Data */}
      <div className="p-5 rounded-2xl border border-cyan-900/50 bg-gray-950/80 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          PRIVACY-FIRST ARCHITECTURE
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-gray-900/40">
          <div>
            <div className="text-xs font-bold text-white font-mono">
              Strict Local Privacy Sandbox
            </div>
            <div className="text-[11px] text-slate-400">
              Never send device clipboard, OTP passwords, or private message texts to external AI servers.
            </div>
          </div>
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              privacyMode ? 'bg-emerald-500' : 'bg-gray-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                privacyMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
