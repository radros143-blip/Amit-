import React from 'react';
import { Bell, Volume2, CheckCircle2, Clock, Plus } from 'lucide-react';
import { ReminderItem } from '../../types/assistant';
import { voiceService } from '../../services/voiceService';

interface RemindersWidgetProps {
  reminders: ReminderItem[];
  onToggleComplete: (id: string) => void;
  onOpenAddModal?: () => void;
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({
  reminders,
  onToggleComplete,
  onOpenAddModal,
}) => {
  const handleSpeakReminder = (reminder: ReminderItem) => {
    const text = `याद दिला रही हूँ: ${reminder.title}, समय है ${reminder.time}`;
    voiceService.speak(text, 'MAYRA');
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'youtube':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'shorts':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'reels':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  const activeReminders = reminders.slice(0, 4);

  return (
    <div className="relative p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-3">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          Tactical Reminders
        </span>
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/60 transition"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {activeReminders.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 font-mono">
          कोई active reminder नहीं है।
        </div>
      ) : (
        <div className="space-y-2">
          {activeReminders.map((r) => (
            <div
              key={r.id}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                r.isCompleted
                  ? 'border-gray-800 bg-gray-950/40 opacity-50'
                  : 'border-cyan-900/40 bg-gray-950/60 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                <button
                  onClick={() => onToggleComplete(r.id)}
                  className={`flex-shrink-0 text-slate-500 hover:text-cyan-400 transition ${
                    r.isCompleted ? 'text-emerald-400' : ''
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="truncate">
                  <div
                    className={`text-xs font-medium truncate ${
                      r.isCompleted ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {r.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{r.time}</span>
                    {r.repeat !== 'none' && (
                      <span className="text-cyan-400 uppercase font-semibold">
                        • {r.repeat}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono ${getCategoryBadge(
                    r.category
                  )}`}
                >
                  {r.category}
                </span>
                <button
                  onClick={() => handleSpeakReminder(r)}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition"
                  title="Speak reminder"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
