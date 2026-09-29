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
import { Mic, Send, Wifi, Bluetooth, Radio, BatteryCharging } from 'lucide-react';

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

export const AndroidIslandLayout: React.FC<LayoutProps> = ({
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
      {/* Android Dynamic Pill / Island Header */}
      <div className="mx-auto max-w-2xl p-3 px-5 rounded-full border border-cyan-500/30 bg-gray-900/80 backdrop-blur-xl flex items-center justify-between shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3">
          <AIOrb
            state={orbState}
            styleId={orbStyleId}
            size="sm"
            audioLevel={audioLevel}
            onClick={onOrbClick}
            showReticule={false}
          />
          <div>
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <span>MAYRA DYNAMIC ISLAND</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] text-cyan-300 font-mono">
              {isListening ? 'Listening...' : 'Always Ready • Hindi/English'}
            </div>
          </div>
        </div>

        {/* Quick Android Status Icons */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">5G Wi-Fi</span>
          </div>
          <div className="flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>{telemetry.batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Floating Prompt Bar */}
      <form onSubmit={onSubmitInput} className="max-w-2xl mx-auto relative flex items-center">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Ask MAYRA anything... (Hindi/Hinglish)"
          className="w-full bg-gray-900/90 border border-cyan-600/40 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 pr-24 shadow-lg"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl transition ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-cyan-500/20 text-cyan-300'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!currentInput.trim()}
            className="p-2 rounded-xl bg-cyan-500 text-gray-950 font-bold hover:bg-cyan-400 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Actions Matrix */}
      <QuickActionsWidget
        onExecutePrompt={onExecutePrompt}
        torchOn={torchOn}
        onToggleTorch={onToggleTorch}
        onOpenScreenUnderstand={onOpenScreenUnderstand}
      />

      {/* Android Widget Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClockWidget />
        <BatteryWidget telemetry={telemetry} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeatherWidget />
        <TelemetryGauges telemetry={telemetry} />
      </div>

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

      <TerminalWidget logs={terminalLogs} onClear={onClearTerminal} maxHeight="max-h-60" />
    </div>
  );
};
