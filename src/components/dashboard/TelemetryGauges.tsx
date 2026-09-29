import React from 'react';
import { Cpu, HardDrive, Gauge } from 'lucide-react';
import { DeviceTelemetry } from '../../types/assistant';

interface TelemetryGaugesProps {
  telemetry: DeviceTelemetry;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({ telemetry }) => {
  const { ramUsagePercent, storageUsedGB, storageTotalGB, cpuTemp } = telemetry;
  const storagePercent = Math.round((storageUsedGB / storageTotalGB) * 100);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* RAM Gauge */}
      <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            RAM Buffer
          </span>
          <span className="text-white font-bold">{ramUsagePercent}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-cyan-900/40 mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${ramUsagePercent}%` }}
          />
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex justify-between">
          <span>Active: {((8 * ramUsagePercent) / 100).toFixed(1)} GB</span>
          <span>Total: 8.0 GB</span>
        </div>
      </div>

      {/* Storage Gauge */}
      <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1.5">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            Flash Storage
          </span>
          <span className="text-white font-bold">{storagePercent}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-cyan-900/40 mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex justify-between">
          <span>Used: {storageUsedGB} GB</span>
          <span>Free: {storageTotalGB - storageUsedGB} GB</span>
        </div>
      </div>
    </div>
  );
};
