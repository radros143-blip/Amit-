import React, { useState } from 'react';
import { CreatorTask } from '../../types/assistant';
import {
  Video,
  Sparkles,
  Plus,
  Clock,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Flame,
  Lightbulb,
  Youtube,
  Instagram,
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { deviceService } from '../../services/deviceService';

interface CreatorAssistantViewProps {
  tasks: CreatorTask[];
  onAddTask: (task: Omit<CreatorTask, 'id'>) => void;
  onUpdateStatus: (id: string, status: 'pending' | 'ready' | 'uploaded') => void;
  onExecutePrompt: (prompt: string) => void;
}

export const CreatorAssistantView: React.FC<CreatorAssistantViewProps> = ({
  tasks,
  onAddTask,
  onUpdateStatus,
  onExecutePrompt,
}) => {
  const [platform, setPlatform] = useState<'youtube' | 'shorts' | 'reels' | 'stories'>('youtube');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('19:00');
  const [category, setCategory] = useState('Tech / AI');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      platform,
      title: title.trim(),
      scheduledTime: time,
      status: 'pending',
    });

    voiceService.speak(`Creator task add हो गया: ${title}, समय ${time} बजे।`, 'MAYRA');
    setTitle('');
  };

  const sampleIdeas = [
    {
      topic: 'Top 5 AI Tools in 2026 That Will Shock You',
      platform: 'YouTube Long',
      hook: 'दोस्तों, 2026 में ये 5 AI tools आपका 80% काम चुटकियों में कर देंगे!',
    },
    {
      topic: 'Android 16 Secret Feature Nobody Knows',
      platform: 'YouTube Shorts',
      hook: 'अपने Android फोन में अभी ये एक सेटिंग बदल लो, battery 2 दिन चलेगी!',
    },
    {
      topic: 'How I Built My Own JARVIS in 1 Day',
      platform: 'Instagram Reels',
      hook: 'क्या Iron Man का JARVIS सच में मुमकिन है? आज हमने खुद बनाया!',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-red-950/40 via-gray-950 to-pink-950/40 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
              <Flame className="w-4 h-4 text-red-400 animate-bounce" />
              <span>CONTENT CREATOR COMMAND DECK</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-white">
              YOUTUBE &amp; INSTAGRAM CREATOR RADAR
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Schedule uploads, generate viral hooks in Hindi, and never miss upload deadlines.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => deviceService.launchAndroidApp('youtube')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition shadow-lg"
            >
              <Youtube className="w-4 h-4" /> YouTube Studio
            </button>
            <button
              onClick={() => deviceService.launchAndroidApp('instagram')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-mono text-xs font-bold transition shadow-lg"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </button>
          </div>
        </div>
      </div>

      {/* Upload Schedule Creator */}
      <form
        onSubmit={handleCreateTask}
        className="p-5 rounded-2xl border border-cyan-900/50 bg-gray-950/80 space-y-4"
      >
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          SCHEDULE NEW CREATOR UPLOAD
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">Video / Reel Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gemini AI vs ChatGPT Live Test..."
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Format</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="youtube">YouTube Long (16:9)</option>
              <option value="shorts">YouTube Shorts (9:16)</option>
              <option value="reels">Instagram Reels</option>
              <option value="stories">Instagram Story</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Upload Time</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-cyan-500 text-gray-950 font-bold font-mono text-xs hover:bg-cyan-400 transition"
          >
            Add to Creator Radar
          </button>
        </div>
      </form>

      {/* Active Creator Pipeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          ACTIVE UPLOAD PIPELINE
        </h3>

        {tasks.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-cyan-950 bg-gray-950/60 font-mono text-xs text-slate-500">
            कोई pending upload task नहीं है। नया task जोड़ें।
          </div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-cyan-900/40 bg-gray-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    t.platform === 'youtube' || t.platform === 'shorts'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                  }`}
                >
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                    <span className="uppercase text-cyan-400">{t.platform}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {t.scheduledTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={t.status}
                  onChange={(e) => onUpdateStatus(t.id, e.target.value as any)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border bg-gray-900 ${
                    t.status === 'uploaded'
                      ? 'border-emerald-500 text-emerald-400'
                      : t.status === 'ready'
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-amber-500 text-amber-400'
                  }`}
                >
                  <option value="pending">Pending Script</option>
                  <option value="ready">Ready to Post</option>
                  <option value="uploaded">Uploaded ✓</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Viral Ideation Generator */}
      <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gray-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            AI VIRAL TOPIC &amp; HOOK IDEAS (HINGLISH)
          </h3>
          <button
            onClick={() => onExecutePrompt('Mayra, मुझे YouTube के लिए 3 viral video topics बताओ।')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-200"
          >
            Ask MAYRA for More Ideas &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {sampleIdeas.map((idea, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-cyan-950 bg-gray-900/60 flex flex-col justify-between space-y-2 hover:border-cyan-500/40 transition"
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900 uppercase">
                  {idea.platform}
                </span>
                <h5 className="text-xs font-bold text-white mt-1.5">{idea.topic}</h5>
                <p className="text-[11px] text-slate-400 italic mt-1">&quot;{idea.hook}&quot;</p>
              </div>
              <button
                onClick={() => setTitle(idea.topic)}
                className="text-[10px] font-mono text-cyan-400 hover:text-white pt-2 border-t border-gray-800 text-left"
              >
                + Use This Title
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
