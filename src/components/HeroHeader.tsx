import React from 'react';
import { JudgePreset } from '../types/mission';
import { JUDGE_PRESETS } from '../data/presets';
import { Sparkles, Sliders, Play, Rocket, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroHeaderProps {
  activeTab: 'configurator' | 'simulator';
  onTabChange: (tab: 'configurator' | 'simulator') => void;
  onSelectPreset: (preset: JudgePreset) => void;
  activeDestinationName: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  activeTab,
  onTabChange,
  onSelectPreset,
  activeDestinationName,
}) => {
  return (
    <div className="relative w-full overflow-hidden pt-8 pb-10 border-b border-white/[0.08]">
      {/* Living Aurora Gradient Mesh in Header */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: ['-10%', '15%', '-10%'],
            y: ['-5%', '10%', '-5%'],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 left-1/3 h-[380px] w-[650px] rounded-full bg-gradient-to-r from-cyan-600/25 via-blue-700/20 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{
            x: ['15%', '-15%', '15%'],
            y: ['5%', '-10%', '5%'],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 right-1/4 h-[350px] w-[550px] rounded-full bg-gradient-to-l from-purple-600/25 via-pink-600/15 to-transparent blur-[110px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-xs uppercase tracking-wider backdrop-blur-md">
              <Rocket className="h-3.5 w-3.5" /> NASA Space Apps Challenge
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 font-mono text-xs backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Grounded Physics Engine
            </span>
          </div>

          <div className="text-xs font-mono text-neutral-400">
            Current Target: <strong className="text-white">{activeDestinationName}</strong>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
            COSMIC <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">TRADE-OFF</span>
          </h1>
          <p className="mt-2 text-base sm:text-lg text-neutral-400 max-w-2xl font-light">
            Interactive NASA Space Mission Design & Real-Time Flight Simulator. Master competing engineering trade-offs: mass, budget, power, and Tsiolkovsky Delta-V.
          </p>
        </div>

        {/* 1-Click Judge Presets Row */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              1-Click Judge Scenarios (Instant Gratification Demo):
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {JUDGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-neutral-300 backdrop-blur-md transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-950/30 hover:text-white"
                  title={preset.description}
                >
                  <span className="text-sm">{preset.icon}</span>
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center gap-1 bg-white/[0.05] p-1.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-end">
            <button
              onClick={() => onTabChange('configurator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'configurator'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Blueprint & Configurator
            </button>
            <button
              onClick={() => onTabChange('simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              Live Flight Director
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

