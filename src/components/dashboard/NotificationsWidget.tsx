import React from 'react';
import {
  Bell,
  Volume2,
  Trash2,
  MessageSquare,
  Video,
  Download,
  PhoneCall,
  CheckCircle,
} from 'lucide-react';
import { NotificationItem } from '../../types/assistant';
import { voiceService } from '../../services/voiceService';

interface NotificationsWidgetProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const handleAnnounce = (item: NotificationItem) => {
    const text = `${item.app} से notification: ${item.title}. ${item.message}`;
    voiceService.speak(text, 'MAYRA');
    onMarkAsRead(item.id);
  };

  const getAppIcon = (app: string) => {
    switch (app) {
      case 'YouTube':
        return <Video className="w-3.5 h-3.5 text-red-400" />;
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Instagram':
        return <Video className="w-3.5 h-3.5 text-pink-400" />;
      case 'Downloads':
        return <Download className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Calls':
        return <PhoneCall className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="relative p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-3">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          Live Telemetry Feed
          {notifications.some((n) => !n.isRead) && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
        </span>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 font-mono">
          कोई नई notification नहीं है।
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-2.5 rounded-lg border transition-all ${
                n.isRead
                  ? 'border-gray-800/80 bg-gray-950/40 opacity-70'
                  : 'border-cyan-900/50 bg-gray-950/80 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {getAppIcon(n.app)}
                  <span className="text-xs font-semibold text-white font-mono">{n.app}</span>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>

              <div className="text-xs text-slate-200 font-medium">{n.title}</div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {n.message}
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 pt-1 border-t border-gray-900 text-xs">
                <button
                  onClick={() => handleAnnounce(n)}
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-200"
                >
                  <Volume2 className="w-3 h-3" /> Announce
                </button>
                {!n.isRead && (
                  <button
                    onClick={() => onMarkAsRead(n.id)}
                    className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    <CheckCircle className="w-3 h-3" /> Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
