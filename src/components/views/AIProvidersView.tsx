import React, { useState } from 'react';
import { AIProviderConfig, AIProviderId } from '../../types/assistant';
import {
  Cpu,
  Key,
  Shield,
  CheckCircle2,
  Server,
  Zap,
  Globe,
  Sliders,
} from 'lucide-react';

interface AIProvidersViewProps {
  currentConfig: AIProviderConfig;
  onUpdateConfig: (config: AIProviderConfig) => void;
}

export const AIProvidersView: React.FC<AIProvidersViewProps> = ({
  currentConfig,
  onUpdateConfig,
}) => {
  const [selectedId, setSelectedId] = useState<AIProviderId>(currentConfig.id);
  const [customKey, setCustomKey] = useState(currentConfig.apiKey || '');
  const [customEndpoint, setCustomEndpoint] = useState(currentConfig.customEndpoint || '');
  const [selectedModel, setSelectedModel] = useState(currentConfig.model || 'gemini-3.8-flash');
  const [temperature, setTemperature] = useState(currentConfig.temperature || 0.75);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const providers = [
    {
      id: 'gemini_built_in' as AIProviderId,
      name: 'Gemini AI (Built-in Server Proxy)',
      desc: 'High-speed, zero-config server integration using Gemini 3.8 Flash. Default & Recommended.',
      models: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
      requiresKey: false,
      badge: 'RECOMMENDED',
    },
    {
      id: 'gemini_custom' as AIProviderId,
      name: 'Custom Gemini API Key',
      desc: 'Use your own dedicated Google AI Studio Gemini API key directly with custom quota.',
      models: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
      requiresKey: true,
      badge: 'CUSTOM QUOTA',
    },
    {
      id: 'groq' as AIProviderId,
      name: 'Groq LPU Acceleration',
      desc: 'Ultra-low latency sub-second inference using open models like Llama 3.3 70B.',
      models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
      requiresKey: true,
      badge: 'ULTRA FAST',
    },
    {
      id: 'openrouter' as AIProviderId,
      name: 'OpenRouter Unified Gateway',
      desc: 'Unified gateway providing access to Claude 3.5, DeepSeek R1, GPT-4o, and Mistral.',
      models: ['anthropic/claude-3.5-sonnet', 'deepseek/deepseek-r1'],
      requiresKey: true,
      badge: 'MULTI-MODEL',
    },
    {
      id: 'custom' as AIProviderId,
      name: 'Custom OpenAI-Compatible Provider',
      desc: 'Connect to self-hosted Ollama, vLLM, or proprietary enterprise endpoints.',
      models: ['default-model'],
      requiresKey: true,
      badge: 'SELF-HOSTED',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const providerObj = providers.find((p) => p.id === selectedId);
    onUpdateConfig({
      id: selectedId,
      name: providerObj?.name || 'Gemini AI',
      model: selectedModel,
      apiKey: customKey.trim(),
      customEndpoint: customEndpoint.trim(),
      temperature,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md">
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          AI BRAIN &amp; MULTI-PROVIDER ARCHITECTURE
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Select MAYRA&apos;s cognitive brain. Never exposes API keys in chat or logs; stored securely on-device.
        </p>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {providers.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setSelectedId(p.id);
              setSelectedModel(p.models[0]);
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
              selectedId === p.id
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'border-gray-800 bg-gray-950/70 hover:border-cyan-500/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-cyan-400 font-semibold">
                  {p.badge}
                </span>
                {selectedId === p.id && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <h4 className="text-sm font-bold font-mono text-white">{p.name}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Configuration Form */}
      <form
        onSubmit={handleSave}
        className="p-5 rounded-2xl border border-cyan-900/50 bg-gray-950/80 space-y-4"
      >
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          PROVIDER PARAMETERS &amp; CREDENTIALS
        </h3>

        {/* Model Picker */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Active Reasoning Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
          >
            {providers
              .find((p) => p.id === selectedId)
              ?.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
          </select>
        </div>

        {/* API Key field if needed */}
        {selectedId !== 'gemini_built_in' && (
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>API Key / Secret Token</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                <Shield className="w-3 h-3" /> Encrypted Storage
              </span>
            </label>
            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Enter provider API key..."
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        )}

        {/* Custom Endpoint if selected */}
        {selectedId === 'custom' && (
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Custom Base URL Endpoint
            </label>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://your-ollama-host/v1"
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        )}

        {/* Temperature */}
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Model Creativity Temperature: {temperature}</span>
            <span>(0.0 Strict &bull; 1.0 Creative)</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-cyan-950">
          {savedSuccess ? (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Provider Settings Saved!
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500">
              API Keys are never shared or logged in chat history.
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-cyan-500 text-gray-950 font-bold font-mono text-xs hover:bg-cyan-400 transition"
          >
            Apply AI Provider
          </button>
        </div>
      </form>
    </div>
  );
};
