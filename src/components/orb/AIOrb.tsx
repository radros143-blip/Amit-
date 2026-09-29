import React, { useMemo } from 'react';
import { OrbPosition, OrbSize, OrbState, OrbStyleId } from '../../types/assistant';
import { ORB_STYLES_CATALOG } from './orbStyles';

interface AIOrbProps {
  state: OrbState;
  styleId?: OrbStyleId;
  size?: OrbSize;
  position?: OrbPosition;
  audioLevel?: number; // 0.0 to 1.0 from mic or voice synthesis
  interactive?: boolean;
  onClick?: () => void;
  statusLabel?: string;
  showReticule?: boolean;
}

export const AIOrb: React.FC<AIOrbProps> = ({
  state,
  styleId = 'arc_reactor',
  size = 'lg',
  position = 'center',
  audioLevel = 0,
  interactive = true,
  onClick,
  statusLabel,
  showReticule = true,
}) => {
  const currentStyle = useMemo(() => {
    return ORB_STYLES_CATALOG.find((s) => s.id === styleId) || ORB_STYLES_CATALOG[0];
  }, [styleId]);

  // Size mapping in pixels
  const dimensionPx = useMemo(() => {
    switch (size) {
      case 'sm':
        return 96;
      case 'md':
        return 160;
      case 'lg':
        return 240;
      case 'xl':
        return 320;
      default:
        return 240;
    }
  }, [size]);

  // State colors and dynamic pulse dynamics
  const stateColor = useMemo(() => {
    switch (state) {
      case 'IDLE':
        return currentStyle.glowColor;
      case 'LISTENING':
        return '#00f5d4'; // bright electric teal
      case 'THINKING':
        return '#8b5cf6'; // intense purple
      case 'SPEAKING':
        return '#38bdf8'; // energetic sky blue
      case 'EXECUTING':
        return '#f59e0b'; // amber gold
      case 'SUCCESS':
        return '#10b981'; // emerald green
      case 'ERROR':
        return '#ef4444'; // laser red
      default:
        return currentStyle.glowColor;
    }
  }, [state, currentStyle]);

  // State animation speed factor
  const speedClass = useMemo(() => {
    switch (state) {
      case 'THINKING':
      case 'EXECUTING':
        return 'animate-spin-fast';
      case 'LISTENING':
        return 'animate-spin-medium';
      case 'SPEAKING':
        return 'animate-pulse';
      case 'ERROR':
        return 'animate-ping';
      default:
        return 'animate-spin-slow';
    }
  }, [state]);

  const scaleBoost = 1 + (audioLevel || 0) * 0.28;

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative flex flex-col items-center justify-center transition-all duration-300 select-none ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      }`}
      style={{
        width: dimensionPx,
        height: dimensionPx,
      }}
      title={`MAYRA Orb: ${state} (${currentStyle.name})`}
    >
      {/* Background Volumetric Glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-500 pointer-events-none"
        style={{
          backgroundColor: stateColor,
          transform: `scale(${scaleBoost * 1.15})`,
        }}
      />

      {/* Outer Tactical Reticle with Cardinal Ticks */}
      {showReticule && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60 animate-[spin_60s_linear_infinite]"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={stateColor}
            strokeWidth="0.75"
            strokeDasharray="2, 6"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={stateColor}
            strokeWidth="0.5"
            strokeDasharray="1, 8"
            opacity="0.3"
          />
          {/* Degree markers */}
          <line x1="50" y1="1" x2="50" y2="5" stroke={stateColor} strokeWidth="1.5" />
          <line x1="99" y1="50" x2="95" y2="50" stroke={stateColor} strokeWidth="1.5" />
          <line x1="50" y1="99" x2="50" y2="95" stroke={stateColor} strokeWidth="1.5" />
          <line x1="1" y1="50" x2="5" y2="50" stroke={stateColor} strokeWidth="1.5" />
        </svg>
      )}

      {/* Counter-rotating Gyroscopic Segmented Rings */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `scale(${scaleBoost})`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Ring 1 - Outer clockwise segments */}
        <g className={speedClass} style={{ transformOrigin: '50px 50px' }}>
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={stateColor}
            strokeWidth="1.5"
            strokeDasharray="24, 8, 4, 8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke={currentStyle.accentColor}
            strokeWidth="1"
            strokeDasharray="12, 16"
            opacity="0.6"
          />
        </g>

        {/* Ring 2 - Counter-clockwise internal segments */}
        <g
          className="animate-[spin_12s_linear_infinite_reverse]"
          style={{ transformOrigin: '50px 50px' }}
        >
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke={stateColor}
            strokeWidth="2"
            strokeDasharray="18, 6, 2, 6"
            opacity="0.75"
          />
          <polygon
            points="50,22 53,27 47,27"
            fill={stateColor}
            opacity="0.8"
          />
          <polygon
            points="50,78 53,73 47,73"
            fill={stateColor}
            opacity="0.8"
          />
        </g>

        {/* Ring 3 - Audio Reactive Dynamic Waveform Ring */}
        <circle
          cx="50"
          cy="50"
          r={20 + (audioLevel || 0) * 8}
          fill="none"
          stroke={stateColor}
          strokeWidth={1.5 + (audioLevel || 0) * 2}
          strokeDasharray="4, 4"
          opacity="0.9"
        />
      </svg>

      {/* Center Quantum / Arc Reactor Core */}
      <div
        className="relative rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
        style={{
          width: dimensionPx * 0.38,
          height: dimensionPx * 0.38,
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${stateColor} 45%, #030712 90%)`,
          boxShadow: `0 0 25px ${stateColor}, inset 0 0 15px rgba(255,255,255,0.7)`,
          transform: `scale(${scaleBoost})`,
        }}
      >
        {/* Core Geometry Icon / Glyph */}
        <div className="w-1/2 h-1/2 rounded-full border border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>
      </div>

      {/* Floating State Badge / Audio Waveform Bars when speaking or listening */}
      {(state === 'LISTENING' || state === 'SPEAKING') && (
        <div className="absolute -bottom-7 flex items-center gap-1 bg-gray-900/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40 backdrop-blur-md">
          <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-5 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-bounce" />
          <span className="w-1.5 h-6 bg-cyan-200 rounded-full animate-bounce [animation-delay:0.1s]" />
          <span className="w-1.5 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.25s]" />
          <span className="text-[10px] font-mono tracking-wider font-semibold text-cyan-300 ml-1 uppercase">
            {state}
          </span>
        </div>
      )}

      {/* Optional Status Label */}
      {statusLabel && state !== 'LISTENING' && state !== 'SPEAKING' && (
        <div className="absolute -bottom-6 text-[10px] font-mono font-medium tracking-widest text-cyan-300/80 uppercase px-2 py-0.5 rounded bg-gray-900/70 border border-cyan-900/50">
          {statusLabel}
        </div>
      )}
    </div>
  );
};
