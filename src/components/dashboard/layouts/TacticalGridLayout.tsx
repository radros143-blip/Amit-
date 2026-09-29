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
import { Mic, Send, ShieldAlert, Cpu, Terminal as TerminalIcon } from 'lucide-react';

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

export const TacticalGridLayout: React.FC<LayoutProps> = ({
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
    <div className="space-y-4">
      {/* Top Tactical Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-cyan-500/30 bg-gray-950/80 font-mono text-xs">
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu className="w-4 h-4 animate-spin-slow" />
          <span className="font-bold">JARVIS MATRIX v4.8</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">DEFENSE GRID: SECURED</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>LATENCY: 14ms</span>
          <span>UPTIME: 99.98%</span>
          <span className="text-cyan-400">KERNEL: LINUX_ANDROID_SE</span>
        </div>
      </div>

      {/* Main Grid: Left Orb Cockpit & Input, Right Terminal Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: AI Orb & Voice (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
            <span>TACTICAL CORE [MK-85]</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              STATE: {orbState}
            </span>
          </div>

          <div className="my-auto py-4 flex justify-center">
            <AIOrb
              state={orbState}
              styleId={orbStyleId}
              size="md"
              audioLevel={audioLevel}
              onClick={onOrbClick}
              statusLabel={isListening ? 'VOICE INTERCEPT ON' : 'TAP TO TRANSMIT'}
            />
          </div>

          <form onSubmit={onSubmitInput} className="mt-4 relative flex items-center">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Tactical command stream..."
              className="w-full bg-gray-950 border border-cyan-600/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 pr-20 font-mono"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleVoice}
                className={`p-1.5 rounded-lg ${
                  isListening ? 'bg-rose-500 text-white' : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                disabled={!currentInput.trim()}
                className="p-1.5 rounded-lg bg-cyan-500 text-gray-950 font-bold hover:bg-cyan-400 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Command Terminal (7 cols) */}
        <div className="lg:col-span-7">
          <TerminalWidget logs={terminalLogs} onClear={onClearTerminal} maxHeight="max-h-80" />
        </div>
      </div>

      {/* Quick Actions Matrix */}
      <QuickActionsWidget
        onExecutePrompt={onExecutePrompt}
        torchOn={torchOn}
        onToggleTorch={onToggleTorch}
        onOpenScreenUnderstand={onOpenScreenUnderstand}
      />

      {/* 4-Column Tactical Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ClockWidget />
        <BatteryWidget telemetry={telemetry} />
        <WeatherWidget />
        <TelemetryGauges telemetry={telemetry} />
      </div>

      {/* Bottom Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};
