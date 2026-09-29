import React from 'react';
import { BatteryCharging, Zap, ShieldCheck } from 'lucide-react';
import { DeviceTelemetry } from '../../types/assistant';

interface BatteryWidgetProps {
  telemetry: DeviceTelemetry;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({ telemetry }) => {
  const { batteryLevel, isCharging, batterySaver } = telemetry;

  const getStatusColor = () => {
    if (isCharging) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (batteryLevel <= 20) return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    if (batteryLevel <= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
  };

  const getBarColor = () => {
    if (isCharging) return 'bg-emerald-400 shadow-[0_0_10px_#10b981]';
    if (batteryLevel <= 20) return 'bg-rose-500 shadow-[0_0_10px_#ef4444]';
    if (batteryLevel <= 50) return 'bg-amber-400 shadow-[0_0_10px_#f59e0b]';
    return 'bg-cyan-400 shadow-[0_0_10px_#06b6d4]';
  };

  return (
    <div className="relative p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Power Core
        </span>
        <span
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor()}`}
        >
          {isCharging ? (
            <>
              <BatteryCharging className="w-3 h-3 animate-pulse" /> Charging
            </>
          ) : (
            'Discharging'
          )}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <div className="text-3xl font-black font-mono text-white tracking-tight">
          {batteryLevel}%
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          {batterySaver ? 'Power Saver Active' : 'Optimal Health'}
        </div>
      </div>

      {/* Futuristic segmented battery bar */}
      <div className="w-full bg-gray-800/80 rounded-full h-3 p-0.5 overflow-hidden border border-cyan-900/60">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
          style={{ width: `${Math.min(100, Math.max(5, batteryLevel))}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Voltage: 4.12V</span>
        <span>Temp: 32.4°C</span>
      </div>
    </div>
  );
};
