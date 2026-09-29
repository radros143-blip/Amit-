import React from 'react';
import { AIOrb } from '../../orb/AIOrb';
import { ClockWidget } from '../ClockWidget';
import { BatteryWidget } from '../BatteryWidget';
import { TelemetryGauges } from '../TelemetryGauges';
import { WeatherWidget } from '../WeatherWidget';
import { RemindersWidget } from '../RemindersWidget';
import { NotificationsWidget } from '../NotificationsWidget';
import { TerminalWidget } from '../TerminalWidget';
import { QuickActionsWidget } from '../QuickActionsWidget';
import {
  DeviceTelemetry,
  NotificationItem,
  OrbState,
  OrbStyleId,
  ReminderItem,
  TerminalLog,
} from '../../../types/assistant';
import { Mic, Send, Sparkles } from 'lucide-react';

interface LayoutProps {
  orbState: OrbState;
  orbStyleId: OrbStyleId;
  audioLevel: number;
  onOrbClick: () => void;
  telemetry: DeviceTelemetry;
  reminders: ReminderItem[];
  notifications: NotificationItem[];
  terminalLogs: TerminalLog[];
  onToggleReminder: (id: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onClearTerminal: () => void;
  onExecutePrompt: (prompt: string) => void;
  torchOn: boolean;
  onToggleTorch: () => void;
  onOpenScreenUnderstand: () => void;
  currentInput: string;
  setCurrentInput: (val: string) => void;
  onSubmitInput: (e: React.FormEvent) => void;
  isListening: boolean;
  onToggleVoice: () => void;
}

export const HoloCoreLayout: React.FC<LayoutProps> = ({
  orbState,
  orbStyleId,
  audioLevel,
  onOrbClick,
  telemetry,
  reminders,
  notifications,
  terminalLogs,
  onToggleReminder,
  onMarkNotificationRead,
  onClearNotifications,
  onClearTerminal,
  onExecutePrompt,
  torchOn,
  onToggleTorch,
  onOpenScreenUnderstand,
  currentInput,
  setCurrentInput,
  onSubmitInput,
  isListening,
  onToggleVoice,
}) => {
  return (
    <div className="space-y-6">
      {/* Central Holographic Core Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-gray-900/90 via-gray-950/95 to-black p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Header Status Bar */}
          <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI NEURAL CORE ONLINE</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">JARVIS PROTOCOL ACTIVE</span>
          </div>

          {/* Centered Futuristic AI Orb */}
          <div className="my-2">
            <AIOrb
              state={orbState}
              styleId={orbStyleId}
              size="lg"
              audioLevel={audioLevel}
              onClick={onOrbClick}
              statusLabel={isListening ? 'LISTENING TO VOICE' : 'TAP ORB TO SPEAK'}
            />
          </div>

          <h2 className="mt-4 text-xl sm:text-2xl font-bold font-mono tracking-wider text-white">
            MAYRA <span className="text-cyan-400 font-light">SYSTEMS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md font-mono">
            &quot;Mayra, YouTube खोलो&quot; • &quot;Battery कितनी है?&quot; • &quot;आज का weather बताओ&quot;
          </p>

          {/* Hands-Free Voice Prompt Bar */}
          <form
            onSubmit={onSubmitInput}
            className="w-full max-w-xl mt-6 relative flex items-center shadow-lg"
          >
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Mayra से कुछ भी पूछें या command दें (Hindi/English)..."
              className="w-full bg-gray-900/90 border border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 pr-24 shadow-inner"
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
          </form>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <QuickActionsWidget
        onExecutePrompt={onExecutePrompt}
        torchOn={torchOn}
        onToggleTorch={onToggleTorch}
        onOpenScreenUnderstand={onOpenScreenUnderstand}
      />

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ClockWidget />
        <BatteryWidget telemetry={telemetry} />
        <WeatherWidget />
      </div>

      {/* Secondary Telemetry: Gauges, Reminders, Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TelemetryGauges telemetry={telemetry} />
        <RemindersWidget
          reminders={reminders}
          onToggleComplete={onToggleReminder}
        />
        <NotificationsWidget
          notifications={notifications}
          onMarkAsRead={onMarkNotificationRead}
          onClearAll={onClearNotifications}
        />
      </div>

      {/* Full-width Terminal Log */}
      <TerminalWidget logs={terminalLogs} onClear={onClearTerminal} maxHeight="max-h-72" />
    </div>
  );
};
