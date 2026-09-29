import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24Hour,
  });

  const dayEnglish = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dayHindi = now.toLocaleDateString('hi-IN', { weekday: 'long' });
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => setIs24Hour(!is24Hour)}
      className="cursor-pointer group relative p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
      title="Click to toggle 12h/24h time format"
    >
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          Quantum Chrono
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
          {is24Hour ? '24H' : '12H'}
        </span>
      </div>

      <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
        {timeFormatted}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-cyan-950">
        <span className="flex items-center gap-1 text-slate-200">
          <Calendar className="w-3 h-3 text-cyan-400" />
          {dateFormatted}
        </span>
        <span className="text-cyan-300 font-medium">
          {dayHindi} ({dayEnglish})
        </span>
      </div>
    </div>
  );
};
