import React, { useState } from 'react';
import { ReminderItem, AlarmItem } from '../../types/assistant';
import {
  Bell,
  AlarmClock,
  Plus,
  Volume2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Repeat,
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface RemindersViewProps {
  reminders: ReminderItem[];
  alarms: AlarmItem[];
  onAddReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt'>) => void;
  onToggleReminderComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddAlarm: (alarm: Omit<AlarmItem, 'id'>) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  onTestAlarmSound: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  alarms,
  onAddReminder,
  onToggleReminderComplete,
  onDeleteReminder,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onTestAlarmSound,
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'alarms'>('reminders');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRepeat, setNewRepeat] = useState<'none' | 'daily' | 'weekly'>('none');
  const [newCategory, setNewCategory] = useState<
    'general' | 'youtube' | 'shorts' | 'reels' | 'stories' | 'call'
  >('general');

  const [newAlarmLabel, setNewAlarmLabel] = useState('Morning Wake Up');
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      time: newTime,
      date: newDate,
      repeat: newRepeat,
      category: newCategory,
      isSpoken: false,
      isCompleted: false,
    });

    voiceService.speak(`Reminder सेट हो गया: ${newTitle}, समय ${newTime}`, 'MAYRA');
    setNewTitle('');
    setShowAddReminderModal(false);
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlarm({
      label: newAlarmLabel || 'Alarm',
      time: newAlarmTime,
      enabled: true,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });
    voiceService.speak(`अलार्म सेट कर दिया है सुबह ${newAlarmTime} बजे के लिए।`, 'MAYRA');
    setShowAddAlarmModal(false);
  };

  const handleSpeak = (r: ReminderItem) => {
    voiceService.speak(`याद दिला रही हूँ: ${r.title}. समय है ${r.time}.`, 'MAYRA');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Tab Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            CHRONO REMINDERS &amp; AUDIO ALARMS
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            MAYRA speaks your reminders automatically and sounds active alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-950 p-1 rounded-lg border border-cyan-950">
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
                activeTab === 'reminders'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reminders ({reminders.length})
            </button>
            <button
              onClick={() => setActiveTab('alarms')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
                activeTab === 'alarms'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alarms ({alarms.length})
            </button>
          </div>

          {activeTab === 'reminders' ? (
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-gray-950 font-mono text-xs font-bold hover:bg-cyan-400 transition"
            >
              <Plus className="w-4 h-4" /> Add Reminder
            </button>
          ) : (
            <button
              onClick={() => setShowAddAlarmModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-gray-950 font-mono text-xs font-bold hover:bg-cyan-400 transition"
            >
              <Plus className="w-4 h-4" /> Add Alarm
            </button>
          )}
        </div>
      </div>

      {/* Reminders Tab Content */}
      {activeTab === 'reminders' && (
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-cyan-950 bg-gray-950/60 font-mono text-xs text-slate-500">
              कोई active reminder नहीं है। &quot;Add Reminder&quot; दबाएँ या बोलें &quot;कल शाम 7 बजे YouTube upload याद दिलाना&quot;।
            </div>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  r.isCompleted
                    ? 'border-gray-800 bg-gray-950/40 opacity-60'
                    : 'border-cyan-900/50 bg-gray-950/80 hover:border-cyan-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleReminderComplete(r.id)}
                    className={`mt-0.5 text-slate-500 hover:text-cyan-400 transition ${
                      r.isCompleted ? 'text-emerald-400' : ''
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        r.isCompleted ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {r.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Clock className="w-3.5 h-3.5" /> {r.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {r.date}
                      </span>
                      {r.repeat !== 'none' && (
                        <span className="flex items-center gap-1 text-purple-400 uppercase font-semibold">
                          <Repeat className="w-3 h-3" /> {r.repeat}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-900 text-cyan-400 uppercase text-[10px]">
                        {r.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleSpeak(r)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-cyan-900 text-cyan-300 hover:bg-cyan-950/80 font-mono text-xs transition"
                    title="Speak aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>
                  <button
                    onClick={() => onDeleteReminder(r.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Alarms Tab Content */}
      {activeTab === 'alarms' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={onTestAlarmSound}
              className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio Ringtone Chime</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alarms.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-cyan-900/50 bg-gray-950/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
                    <AlarmClock className="w-6 h-6 text-cyan-400" />
                    {a.time}
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">{a.label}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {a.repeatDays.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleAlarm(a.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      a.enabled ? 'bg-cyan-500' : 'bg-gray-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        a.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => onDeleteAlarm(a.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateReminder}
            className="w-full max-w-md p-6 rounded-2xl border border-cyan-500/30 bg-gray-950 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              NEW TACTICAL REMINDER
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Reminder Title / Note (Hindi/English)
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. YouTube video upload, दवाई लेना, meeting..."
                className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Repeat</label>
                <select
                  value={newRepeat}
                  onChange={(e) => setNewRepeat(e.target.value as any)}
                  className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="none">Once (None)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="general">General</option>
                  <option value="youtube">YouTube Long</option>
                  <option value="shorts">YouTube Shorts</option>
                  <option value="reels">Instagram Reels</option>
                  <option value="call">Call Contact</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-cyan-950">
              <button
                type="button"
                onClick={() => setShowAddReminderModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-800 text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 font-bold hover:bg-cyan-400 text-xs font-mono"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Alarm Modal */}
      {showAddAlarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateAlarm}
            className="w-full max-w-md p-6 rounded-2xl border border-cyan-500/30 bg-gray-950 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <AlarmClock className="w-4 h-4 text-cyan-400" />
              NEW AUDIO ALARM
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Alarm Label</label>
              <input
                type="text"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                placeholder="Morning Routine, Study, Workout..."
                className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Time</label>
              <input
                type="time"
                required
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="w-full bg-gray-900 border border-cyan-900 text-sm text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-cyan-950">
              <button
                type="button"
                onClick={() => setShowAddAlarmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-800 text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 font-bold hover:bg-cyan-400 text-xs font-mono"
              >
                Set Alarm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
