import React, { useState } from 'react';
import { TerminalLog } from '../../types/assistant';
import { Terminal, Trash2, Download, Copy, Check } from 'lucide-react';
import { deviceService } from '../../services/deviceService';

interface TerminalViewProps {
  logs: TerminalLog[];
  onClear: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ logs, onClear }) => {
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'MAYRA' | 'SYSTEM'>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((l) => {
    if (filterRole === 'ALL') return true;
    return l.role === filterRole;
  });

  const handleCopyLogs = () => {
    const formatted = logs
      .map((l) => `[${l.timestamp}] ${l.role}: ${l.message} (Status: ${l.status || 'N/A'})`)
      .join('\n');
    deviceService.copyToClipboard(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            MAYRA KERNEL COMMAND TERMINAL
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Full diagnostic telemetry stream of user prompts, AI replies, and hardware action engine execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Export Logs'}</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 text-xs font-mono text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5">
        {(['ALL', 'USER', 'MAYRA', 'SYSTEM'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
              filterRole === r
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'text-slate-400 border-gray-800 bg-gray-950/60 hover:text-white'
            }`}
          >
            {r} Logs ({logs.filter((l) => r === 'ALL' || l.role === r).length})
          </button>
        ))}
      </div>

      {/* Terminal Viewport */}
      <div className="p-4 rounded-2xl border border-cyan-500/30 bg-black/90 font-mono text-xs space-y-2 min-h-[450px] max-h-[600px] overflow-y-auto shadow-inner">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-slate-600 italic">
            No terminal signals logged yet. Try speaking or issuing a command.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 p-2 rounded bg-gray-950/80 border border-gray-900/80 hover:border-cyan-950 transition"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                <span
                  className={`font-bold flex-shrink-0 ${
                    log.role === 'USER'
                      ? 'text-cyan-400'
                      : log.role === 'MAYRA'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {log.role} &gt;
                </span>
                <span className="text-slate-200 break-words flex-1 leading-relaxed">
                  {log.message}
                </span>
              </div>

              {log.status && (
                <span
                  className={`text-[9px] uppercase px-2 py-0.5 rounded border flex-shrink-0 font-semibold ${getStatusBadge(
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
    </div>
  );
};
