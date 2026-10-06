import React from 'react';
import { JudgePreset } from '../../types/mission';
import { JUDGE_PRESETS } from '../../data/presets';

interface StitchHeaderProps {
  activeTab: 'blueprint-lab' | 'flight-director';
  onTabChange: (tab: 'blueprint-lab' | 'flight-director') => void;
  selectedPresetId: string;
  onSelectPreset: (preset: JudgePreset) => void;
}

export const StitchHeader: React.FC<StitchHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-space-lg flex items-center justify-between gap-space-md max-w-[1720px] mx-auto">
        {/* Brand Mark */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_12px_rgba(0,242,254,0.7)] animate-pulse" />
            <span className="font-headline text-lg uppercase tracking-wider text-text-bright font-semibold">
              Cosmic Trade-Off
            </span>
          </div>
          <span className="px-space-sm py-space-xs rounded-full bg-primary-container/10 text-telemetry-cyan font-mono text-[11px] tracking-widest uppercase">
            NASA JPL SPEC • 2026
          </span>
        </div>

        {/* 1-Click Judge Presets */}
        <div className="hidden xl:flex items-center gap-space-xs p-space-xs rounded-full bg-surface-container/70 backdrop-blur-md">
          {JUDGE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`px-space-md py-space-xs rounded-full font-mono text-xs uppercase transition-all ${
                  isSelected
                    ? 'bg-surface-container-high text-telemetry-cyan font-semibold shadow-[0_0_16px_rgba(0,242,254,0.25)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Nav Tabs & Profile */}
        <div className="flex items-center gap-space-md shrink-0">
          <nav className="flex items-center p-space-xs rounded-full bg-surface-container-high/80 backdrop-blur-md">
            <button
              onClick={() => onTabChange('blueprint-lab')}
              className={`px-space-md py-space-xs rounded-full font-mono text-xs tracking-wider uppercase transition-all ${
                activeTab === 'blueprint-lab'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_20px_rgba(0,242,254,0.35)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Blueprint Lab
            </button>
            <button
              onClick={() => onTabChange('flight-director')}
              className={`px-space-md py-space-xs rounded-full font-mono text-xs tracking-wider uppercase transition-all ${
                activeTab === 'flight-director'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_20px_rgba(0,242,254,0.35)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Flight Director
            </button>
          </nav>

          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-telemetry-cyan font-mono text-xs font-bold">
            JPL
          </div>
        </div>
      </div>
    </header>
  );
};
