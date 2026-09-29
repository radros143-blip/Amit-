import React, { useState } from 'react';
import { AIOrb } from '../orb/AIOrb';
import { ORB_STYLES_CATALOG } from '../orb/orbStyles';
import { OrbPosition, OrbSize, OrbState, OrbStyleId } from '../../types/assistant';
import { Sparkles, Sliders, Volume2, CheckCircle2, Play, Eye } from 'lucide-react';

interface OrbLabViewProps {
  currentStyleId: OrbStyleId;
  onSelectStyle: (id: OrbStyleId) => void;
  currentSize: OrbSize;
  onSelectSize: (size: OrbSize) => void;
  currentPosition: OrbPosition;
  onSelectPosition: (pos: OrbPosition) => void;
  audioLevel: number;
}

export const OrbLabView: React.FC<OrbLabViewProps> = ({
  currentStyleId,
  onSelectStyle,
  currentSize,
  onSelectSize,
  currentPosition,
  onSelectPosition,
  audioLevel,
}) => {
  const [testState, setTestState] = useState<OrbState>('IDLE');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [simulatedLevel, setSimulatedLevel] = useState<number>(0.4);

  const categories = ['ALL', 'HUD', 'Reactor', 'Cosmic', 'Neural', 'Tactical'];

  const filteredStyles = ORB_STYLES_CATALOG.filter((s) => {
    if (filterCategory === 'ALL') return true;
    return s.category === filterCategory;
  });

  const states: OrbState[] = [
    'IDLE',
    'LISTENING',
    'THINKING',
    'SPEAKING',
    'EXECUTING',
    'SUCCESS',
    'ERROR',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Interactive Studio */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        {/* Left: Live Orb Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl bg-gray-950/60 border border-cyan-950/80 w-full">
          <div className="text-xs font-mono text-cyan-400 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>LIVE ORB HUD RENDERER</span>
          </div>

          <div className="py-4">
            <AIOrb
              state={testState}
              styleId={currentStyleId}
              size={currentSize}
              audioLevel={testState === 'SPEAKING' || testState === 'LISTENING' ? simulatedLevel : audioLevel}
              statusLabel={`STYLE: ${currentStyleId.toUpperCase()}`}
            />
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold font-mono text-white">
              {ORB_STYLES_CATALOG.find((s) => s.id === currentStyleId)?.name}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm font-mono mt-1">
              {ORB_STYLES_CATALOG.find((s) => s.id === currentStyleId)?.description}
            </p>
          </div>
        </div>

        {/* Right: State & Geometry Tuning Controls */}
        <div className="flex-1 w-full space-y-5">
          <div>
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> 1. Test Artificial Neural States
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {states.map((st) => (
                <button
                  key={st}
                  onClick={() => setTestState(st)}
                  className={`p-2 rounded-lg border text-xs font-mono transition-all ${
                    testState === st
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-gray-950/60 border-cyan-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Size controls */}
          <div>
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              2. Dimension Scale
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {(['sm', 'md', 'lg', 'xl'] as OrbSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onSelectSize(sz)}
                  className={`p-2 rounded-lg border text-xs font-mono uppercase transition ${
                    currentSize === sz
                      ? 'bg-cyan-500 text-gray-950 font-bold border-cyan-400'
                      : 'bg-gray-950/60 border-cyan-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Reactivity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
              <span>Audio Reactivity Modulation</span>
              <span>{Math.round(simulatedLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={simulatedLevel}
              onChange={(e) => setSimulatedLevel(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Catalog of 32+ Styles Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-950 pb-3">
          <div>
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              HUD ARCHITECTURE CATALOG (32+ PRESETS)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Select any Stark-inspired or cosmic holographic core for MAYRA.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-xs font-mono px-3 py-1 rounded-full border transition ${
                  filterCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'text-slate-400 border-gray-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                currentStyleId === style.id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'border-cyan-900/40 bg-gray-950/70 hover:border-cyan-500/40 hover:bg-gray-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-slate-400">
                    {style.category}
                  </span>
                  {currentStyleId === style.id && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> ACTIVE
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold font-mono text-white mb-1 group-hover:text-cyan-300 transition">
                  {style.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {style.description}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-900 flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-1 text-slate-500">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: style.glowColor }}
                  />
                  Glow Hex
                </span>
                <span className="text-cyan-400">SELECT &gt;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
