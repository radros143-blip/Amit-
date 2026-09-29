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
import { Mic, Send, Video, Sparkles, Activity, Radio, BarChart3 } from 'lucide-react';

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

export const TelemetryMonitorLayout: React.FC<LayoutProps> = ({
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
      {/* Creator & System Telemetry Header Deck */}
      <div className="p-4 sm:p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Diagnostic Stats */}
          <div className="flex-1 space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-mono text-cyan-400">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>CREATOR &amp; HARDWARE TELEMETRY DECK</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-white">
              SYSTEM DIAGNOSTICS &amp; UPLOAD RADAR
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Real-time monitoring: CPU 32°C • Storage 46GB / 128GB • YouTube Pipeline Ready
            </p>

            {/* Simulated Live Audio / CPU Spectrum Bar */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-1">
              {[40, 65, 30, 85, 95, 50, 75, 60, 45, 90, 70, 55, 80, 65, 45, 95, 35, 75].map(
                (h, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(6, Math.min(36, (h * (1 + (audioLevel || 0) * 1.5)) / 2.5))}px`,
                    }}
                  />
                )
              )}
            </div>
          </div>

          {/* AI Orb Diagnostics */}
          <div className="flex-shrink-0">
            <AIOrb
              state={orbState}
              styleId={orbStyleId}
              size="md"
              audioLevel={audioLevel}
              onClick={onOrbClick}
              statusLabel={isListening ? 'MIC ACTIVE' : 'ORB READY'}
            />
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={onSubmitInput} className="mt-4 relative flex items-center">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Command: 'Mayra, कल शाम 7 बजे YouTube Short upload याद दिलाना'..."
            className="w-full bg-gray-950/80 border border-cyan-700/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 pr-20 font-mono"
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

      {/* Quick Actions */}
      <QuickActionsWidget
        onExecutePrompt={onExecutePrompt}
        torchOn={torchOn}
        onToggleTorch={onToggleTorch}
        onOpenScreenUnderstand={onOpenScreenUnderstand}
      />

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ClockWidget />
        <BatteryWidget telemetry={telemetry} />
        <WeatherWidget />
        <TelemetryGauges telemetry={telemetry} />
      </div>

      {/* Reminders & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      <TerminalWidget logs={terminalLogs} onClear={onClearTerminal} maxHeight="max-h-72" />
    </div>
  );
};
