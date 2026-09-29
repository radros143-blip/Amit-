import React, { useState } from 'react';
import { Terminal, Trash2, Filter } from 'lucide-react';
import { TerminalLog } from '../../types/assistant';

interface TerminalWidgetProps {
  logs: TerminalLog[];
  onClear: () => void;
  maxHeight?: string;
}

export const TerminalWidget: React.FC<TerminalWidgetProps> = ({
  logs,
  onClear,
  maxHeight = 'max-h-60',
}) => {
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'MAYRA' | 'SYSTEM'>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (filterRole === 'ALL') return true;
    return l.role === filterRole;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'LISTENING':
        return 'text-cyan-400 border-cyan-800 bg-cyan-950/60';
      case 'THINKING':
        return 'text-purple-400 border-purple-800 bg-purple-950/60';
      case 'EXECUTING':
        return 'text-amber-400 border-amber-800 bg-amber-950/60';
      case 'COMPLETED':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
      case 'FAILED':
        return 'text-rose-400 border-rose-800 bg-rose-950/60';
      default:
        return 'text-slate-400 border-slate-800 bg-slate-900/60';
    }
  };

  const getRolePrefix = (role: 'USER' | 'MAYRA' | 'SYSTEM') => {
    switch (role) {
      case 'USER':
        return <span className="text-cyan-400 font-bold">USER &gt;</span>;
      case 'MAYRA':
        return <span className="text-emerald-400 font-bold">MAYRA &gt;</span>;
      case 'SYSTEM':
        return <span className="text-amber-400 font-bold">SYS_KERN &gt;</span>;
    }
  };

  return (
    <div className="relative p-4 rounded-xl border border-cyan-500/20 bg-gray-950/80 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.08)]">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2 pb-2 border-b border-cyan-950">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase tracking-wider font-semibold">Command Terminal Stream</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pills */}
          <div className="flex items-center gap-1 text-[10px]">
            {(['ALL', 'USER', 'MAYRA', 'SYSTEM'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-1.5 py-0.5 rounded transition ${
                  filterRole === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
            title="Clear Terminal Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className={`space-y-1.5 overflow-y-auto ${maxHeight} font-mono text-[11px] pr-1`}>
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic py-4 text-center">
            No active terminal signals recorded.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-2 p-1.5 rounded bg-gray-900/40 border border-gray-900 hover:border-cyan-950/80 transition"
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                <span className="flex-shrink-0">{getRolePrefix(log.role)}</span>
                <span className="text-slate-200 break-words flex-1">{log.message}</span>
              </div>

              {log.status && (
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded border flex-shrink-0 font-semibold ${getStatusBadge(
                    log.status
                  )}`}
                >
                  {log.status}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-cyan-950/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LOG_LEVEL: VERBOSE
        </span>
        <span>SECURITY: ENCRYPTED_ON_DEVICE</span>
      </div>
    </div>
  );
};
