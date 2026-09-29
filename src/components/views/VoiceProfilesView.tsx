import React, { useState } from 'react';
import { VoiceProfileId } from '../../types/assistant';
import { Volume2, Mic, Play, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface VoiceProfilesViewProps {
  currentProfile: VoiceProfileId;
  onSelectProfile: (id: VoiceProfileId) => void;
}

export const VoiceProfilesView: React.FC<VoiceProfilesViewProps> = ({
  currentProfile,
  onSelectProfile,
}) => {
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.1);

  const profiles = [
    {
      id: 'MAYRA' as VoiceProfileId,
      name: 'MAYRA Core',
      lang: 'Hindi / Hinglish (hi-IN, en-IN)',
      desc: 'Warm, smart, respectful and friendly personal AI assistant with natural light humor.',
      accent: 'Natural Indian Accent',
      color: 'border-cyan-500/50 bg-cyan-950/30',
      sample: 'नमस्ते! मैं Mayra हूँ, आपकी AI पर्सनल असिस्टेंट। बताइए आज क्या काम करना है?',
    },
    {
      id: 'JARVIS' as VoiceProfileId,
      name: 'JARVIS Protocol',
      lang: 'British English (en-GB)',
      desc: 'Sophisticated tactical assistant inspired by Stark Industries with deep baritone confidence.',
      accent: 'British Formal / Tactical',
      color: 'border-blue-500/50 bg-blue-950/30',
      sample: 'At your service, sir. All defense systems and satellite links are running at optimal capacity.',
    },
    {
      id: 'NATASHA' as VoiceProfileId,
      name: 'NATASHA Operative',
      lang: 'Sharp English / Tactical (en-US)',
      desc: 'Fast, precise, no-nonsense tactical voice engineered for rapid execution.',
      accent: 'Tactical Precision',
      color: 'border-purple-500/50 bg-purple-950/30',
      sample: 'Target locked and verified. Awaiting your confirmation for deployment.',
    },
    {
      id: 'FRIDAY' as VoiceProfileId,
      name: 'F.R.I.D.A.Y. Cyber Deck',
      lang: 'Irish / Global High-Tech (en-IE)',
      desc: 'Helpful, cheerful high-tech engineering interface with friendly cadence.',
      accent: 'Irish High-Tech',
      color: 'border-emerald-500/50 bg-emerald-950/30',
      sample: 'Boss, diagnostics are clean. We have plenty of battery remaining for flight.',
    },
  ];

  const handleTestVoice = (profileId: VoiceProfileId, sampleText: string) => {
    voiceService.speak(sampleText, profileId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md">
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          VOICE SYNTHESIS &amp; AUDITORY PERSONAS
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Select MAYRA&apos;s primary speaking persona and fine-tune pitch, cadence, and Indian voice synthesis.
        </p>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectProfile(p.id)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
              currentProfile === p.id
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'border-gray-800 bg-gray-950/80 hover:border-cyan-500/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold font-mono text-white">{p.name}</h3>
                {currentProfile === p.id && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-gray-950 font-bold uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-cyan-300">{p.lang}</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
            </div>

            <div className="pt-3 border-t border-gray-900 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">{p.accent}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTestVoice(p.id, p.sample);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono hover:bg-cyan-500/30 transition"
              >
                <Play className="w-3 h-3" /> Test Voice
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Voice Modulation Sliders */}
      <div className="p-5 rounded-2xl border border-cyan-900/50 bg-gray-950/80 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          VOICE SPEED &amp; PITCH MODULATION
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>Speaking Speed Rate</span>
              <span>{voiceRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>Vocal Pitch</span>
              <span>{voicePitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={voicePitch}
              onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Optional ElevenLabs API Custom Voice */}
      <div className="p-5 rounded-2xl border border-gray-800 bg-gray-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            OPTIONAL: CUSTOM ELEVENLABS TTS API KEY
          </h3>
          <span className="text-[10px] font-mono text-slate-500">OPTIONAL</span>
        </div>
        <p className="text-xs text-slate-400">
          Enter an ElevenLabs API key if you wish to route voice audio through custom ultra-realistic neural voice models.
        </p>
        <input
          type="password"
          value={elevenLabsKey}
          onChange={(e) => setElevenLabsKey(e.target.value)}
          placeholder="xi-api-key-..."
          className="w-full bg-gray-900 border border-gray-800 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-cyan-400"
        />
      </div>
    </div>
  );
};
