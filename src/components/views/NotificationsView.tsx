import React, { useState } from 'react';
import { NotificationItem } from '../../types/assistant';
import {
  Bell,
  Volume2,
  Trash2,
  CheckCircle,
  Shield,
  Filter,
  Video,
  MessageSquare,
  Download,
  PhoneCall,
  VolumeX,
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  onDeleteNotification,
}) => {
  const [filterApp, setFilterApp] = useState<string>('ALL');
  const [voiceAnnounceEnabled, setVoiceAnnounceEnabled] = useState(true);

  const apps = ['ALL', 'YouTube', 'WhatsApp', 'Instagram', 'Downloads', 'Calls'];

  const filtered = notifications.filter((n) => {
    if (filterApp === 'ALL') return true;
    return n.app === filterApp;
  });

  const handleAnnounce = (item: NotificationItem) => {
    const text = `${item.app} से notification आया है: ${item.title}. ${item.message}`;
    voiceService.speak(text, 'MAYRA');
    onMarkAsRead(item.id);
  };

  const handleAnnounceAllUnread = () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) {
      voiceService.speak('कोई नई unread notification नहीं है।', 'MAYRA');
      return;
    }
    const summary = `आपके पास ${unread.length} नई notifications हैं। पहली notification: ${unread[0].app} से, ${unread[0].title}।`;
    voiceService.speak(summary, 'MAYRA');
  };

  const getAppIcon = (app: string) => {
    switch (app) {
      case 'YouTube':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'Instagram':
        return <Video className="w-4 h-4 text-pink-400" />;
      case 'Downloads':
        return <Download className="w-4 h-4 text-cyan-400" />;
      case 'Calls':
        return <PhoneCall className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            NOTIFICATION LISTENER &amp; VOICE ANNOUNCER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time feed with smart voice filtering and privacy sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceAnnounceEnabled(!voiceAnnounceEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              voiceAnnounceEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-gray-950 border-gray-800 text-slate-500'
            }`}
          >
            {voiceAnnounceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Speech: {voiceAnnounceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleAnnounceAllUnread}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-gray-950 font-bold font-mono text-xs hover:bg-cyan-400 transition"
          >
            Announce Unread
          </button>

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 border border-gray-800 hover:border-rose-900 transition"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
        </span>
        {apps.map((a) => (
          <button
            key={a}
            onClick={() => setFilterApp(a)}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition ${
              filterApp === a
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'text-slate-400 border-gray-800 hover:text-white'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-cyan-950 bg-gray-950/60 font-mono text-xs text-slate-500">
            कोई notification नहीं मिली।
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isRead
                  ? 'border-gray-800/80 bg-gray-950/40 opacity-70'
                  : 'border-cyan-900/50 bg-gray-950/80 shadow-[0_0_12px_rgba(6,182,212,0.08)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 mt-0.5">
                  {getAppIcon(item.app)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{item.app}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    {!item.isRead && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase font-mono">
                        NEW
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleAnnounce(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-900 text-cyan-300 hover:bg-cyan-950/80 font-mono text-xs transition"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Announce
                </button>
                {!item.isRead && (
                  <button
                    onClick={() => onMarkAsRead(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/20 transition"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(item.id)}
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

      {/* Privacy note */}
      <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/60 flex items-center gap-2 text-xs font-mono text-slate-400">
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          Sensitive notifications (OTP, passwords, banking) remain strictly on-device and are never transmitted to external AI APIs.
        </span>
      </div>
    </div>
  );
};
