import React from 'react';
import {
  Sparkles,
  Video,
  MessageSquare,
  Flashlight,
  Sun,
  Battery,
  Calculator,
  ScanEye,
  Camera,
  Layers,
} from 'lucide-react';

interface QuickActionsWidgetProps {
  onExecutePrompt: (prompt: string) => void;
  torchOn: boolean;
  onToggleTorch: () => void;
  onOpenScreenUnderstand: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  onExecutePrompt,
  torchOn,
  onToggleTorch,
  onOpenScreenUnderstand,
}) => {
  const quickActions = [
    {
      label: 'YouTube खोलो',
      icon: <Video className="w-3.5 h-3.5 text-red-400" />,
      prompt: 'YouTube खोलो',
      accent: 'hover:border-red-500/50',
    },
    {
      label: 'WhatsApp खोलो',
      icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />,
      prompt: 'WhatsApp खोलो',
      accent: 'hover:border-emerald-500/50',
    },
    {
      label: 'Battery कितनी है?',
      icon: <Battery className="w-3.5 h-3.5 text-cyan-400" />,
      prompt: 'Mayra, battery कितनी है?',
      accent: 'hover:border-cyan-500/50',
    },
    {
      label: 'Brightness 50%',
      icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
      prompt: 'Brightness 50 percent कर दो',
      accent: 'hover:border-amber-500/50',
    },
    {
      label: 'Calculator खोलो',
      icon: <Calculator className="w-3.5 h-3.5 text-purple-400" />,
      prompt: 'Calculator खोलो',
      accent: 'hover:border-purple-500/50',
    },
    {
      label: 'India Capital?',
      icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
      prompt: 'Mayra, India की capital क्या है?',
      accent: 'hover:border-blue-500/50',
    },
    {
      label: 'Mood खराब है',
      icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />,
      prompt: 'Mayra, आज मेरा mood खराब है।',
      accent: 'hover:border-pink-500/50',
    },
    {
      label: 'YouTube Grow?',
      icon: <Video className="w-3.5 h-3.5 text-red-400" />,
      prompt: 'Mayra, मुझे YouTube पर grow करना है।',
      accent: 'hover:border-red-500/50',
    },
  ];

  return (
    <div className="relative p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2.5">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Rapid Automation Matrix
        </span>
        <span className="text-[10px] text-slate-400 font-mono">1-Tap Voice Commands</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Real Hardware Torch Toggle Button */}
        <button
          onClick={onToggleTorch}
          className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono transition-all ${
            torchOn
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'bg-gray-950/60 border-cyan-950 text-slate-300 hover:border-cyan-500/40'
          }`}
        >
          <Flashlight className={`w-3.5 h-3.5 ${torchOn ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="truncate">{torchOn ? 'Torch: ON' : 'Torch: OFF'}</span>
        </button>

        {/* Screen Understand */}
        <button
          onClick={onOpenScreenUnderstand}
          className="flex items-center gap-2 p-2 rounded-lg border border-cyan-950 bg-gray-950/60 text-xs font-mono text-cyan-300 hover:border-cyan-400/50 transition-all shadow-[0_0_8px_rgba(6,182,212,0.1)]"
        >
          <ScanEye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="truncate">Screen OCR AI</span>
        </button>

        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => onExecutePrompt(action.prompt)}
            className={`flex items-center gap-2 p-2 rounded-lg border border-cyan-950 bg-gray-950/60 text-xs font-mono text-slate-200 transition-all ${action.accent} hover:bg-gray-900/80 hover:text-white`}
          >
            {action.icon}
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
