import React from 'react';
import { AIOrb } from '../orb/AIOrb';
import { OrbState, OrbStyleId, VoiceProfileId } from '../../types/assistant';
import { Mic, MicOff, Volume2, Radio, Sparkles, Check, PhoneCall, Video, Flame } from 'lucide-react';

interface VoiceCockpitViewProps {
  orbState: OrbState;
  orbStyleId: OrbStyleId;
  audioLevel: number;
  isListening: boolean;
  transcript: string;
  lastReply: string;
  onToggleListening: () => void;
  voiceProfile: VoiceProfileId;
  wakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  clapEnabled: boolean;
  onToggleClap: () => void;
  onExecutePrompt: (prompt: string) => void;
}

export const VoiceCockpitView: React.FC<VoiceCockpitViewProps> = ({
  orbState,
  orbStyleId,
  audioLevel,
  isListening,
  transcript,
  lastReply,
  onToggleListening,
  voiceProfile,
  wakeWordEnabled,
  onToggleWakeWord,
  clapEnabled,
  onToggleClap,
  onExecutePrompt,
}) => {
  const suggestions = [
    'Mayra, YouTube खोलो',
    'Google Drive खोलो',
    'Battery कितनी है?',
    'Brightness 70 percent कर दो',
    'कल सुबह 7 बजे मुझे उठाना',
    'शाम 7 बजे YouTube upload याद दिलाना',
    'India की capital क्या है?',
    'Torch on करो',
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-140px)] p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-center relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
      {/* Background Hologram Waves */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.25)_0%,transparent_70%)]" />

      {/* Top Status Bar */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400 border-b border-cyan-950 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>VOICE COCKPIT &bull; {voiceProfile}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleWakeWord}
            className={`px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
              wakeWordEnabled
                ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300'
                : 'border-gray-800 text-slate-500'
            }`}
          >
            <span>Wake Word: &quot;Hey Mayra&quot;</span>
            {wakeWordEnabled && <Check className="w-3 h-3 text-cyan-400" />}
          </button>

          <button
            onClick={onToggleClap}
            className={`px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
              clapEnabled
                ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300'
                : 'border-gray-800 text-slate-500'
            }`}
          >
            <span>3x Clap: {clapEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Center Giant AI Orb */}
      <div className="my-auto flex flex-col items-center justify-center py-6">
        <div className="scale-110 sm:scale-125 mb-4">
          <AIOrb
            state={orbState}
            styleId={orbStyleId}
            size="xl"
            audioLevel={audioLevel}
            onClick={onToggleListening}
            statusLabel={isListening ? 'LISTENING TO HINDI/ENGLISH' : 'TAP ORB TO SPEAK'}
          />
        </div>

        {/* Live Transcript / Speech Feedback */}
        <div className="mt-8 max-w-xl w-full px-4">
          {isListening ? (
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-gray-950/80 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse space-y-2">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Listening to user voice (Hindi/English)...
              </div>
              <div className="text-base font-medium text-white italic">
                {transcript || 'बोलिए, Mayra सुन रही है...'}
              </div>
              {transcript && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      onExecutePrompt(transcript);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-gray-950 text-xs font-mono font-bold hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
                  >
                    <span>Send to MAYRA / पूछें</span> &rarr;
                  </button>
                </div>
              )}
            </div>
          ) : lastReply ? (
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/80 backdrop-blur-md text-left space-y-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>MAYRA LATEST RESPONSE</span>
                <button
                  onClick={() => onExecutePrompt(lastReply)}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  title="Re-speak"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Re-hear
                </button>
              </div>
              <div className="text-sm text-slate-200">{lastReply}</div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500">
              बोलने के लिए orb दबाएँ या कहें: &quot;Hey Mayra&quot;
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls & Suggestion Chips */}
      <div className="w-full pt-4 border-t border-cyan-950 space-y-4">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onExecutePrompt(s)}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-cyan-900/50 bg-gray-900/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Big Mic Push Button */}
        <div className="flex justify-center">
          <button
            onClick={onToggleListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-mono text-sm font-bold transition-all shadow-lg ${
              isListening
                ? 'bg-rose-500 text-white shadow-[0_0_25px_#ef4444]'
                : 'bg-cyan-500 text-gray-950 hover:bg-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 animate-pulse" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Start Speaking (Hindi / Hinglish)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
