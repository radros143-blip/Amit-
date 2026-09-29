import React from 'react';
import { AppPermission } from '../../types/assistant';
import {
  ShieldCheck,
  Mic,
  Bell,
  Sliders,
  Users,
  Phone,
  Folder,
  MapPin,
  Bluetooth,
  Activity,
  AlarmClock,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { deviceService } from '../../services/deviceService';
import { voiceService } from '../../services/voiceService';

interface PermissionsViewProps {
  permissions: AppPermission[];
  onTogglePermission: (id: string) => void;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({
  permissions,
  onTogglePermission,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mic':
        return <Mic className="w-5 h-5 text-cyan-400" />;
      case 'Bell':
        return <Bell className="w-5 h-5 text-amber-400" />;
      case 'Accessibility':
        return <Sliders className="w-5 h-5 text-purple-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-emerald-400" />;
      case 'Phone':
        return <Phone className="w-5 h-5 text-blue-400" />;
      case 'Folder':
        return <Folder className="w-5 h-5 text-yellow-400" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-rose-400" />;
      case 'Bluetooth':
        return <Bluetooth className="w-5 h-5 text-blue-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-teal-400" />;
      default:
        return <AlarmClock className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleOpenSettings = (perm: AppPermission) => {
    voiceService.speak(`Android ${perm.name} settings खोली जा रही हैं।`, 'MAYRA');
    deviceService.launchAndroidApp('settings');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md">
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ANDROID PERMISSION MANAGER &amp; SECURITY PROTOCOLS
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Explicit permissions required for genuine voice commands, screen actions, and background automation.
        </p>
      </div>

      {/* Permissions List */}
      <div className="space-y-3">
        {permissions.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              p.granted
                ? 'border-cyan-900/40 bg-gray-950/70 shadow-sm'
                : 'border-rose-900/30 bg-gray-950/40 opacity-80'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800">
                {getIcon(p.icon)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-mono text-white">{p.name}</h4>
                  {p.isCritical && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      CORE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{p.description}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  <strong>Why needed:</strong> {p.whyNeeded}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => onTogglePermission(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition ${
                  p.granted
                    ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300'
                    : 'border-gray-800 bg-gray-900 text-slate-400 hover:text-white'
                }`}
              >
                {p.granted ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Disabled</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleOpenSettings(p)}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 px-2 py-1.5 rounded hover:bg-cyan-950/30 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
