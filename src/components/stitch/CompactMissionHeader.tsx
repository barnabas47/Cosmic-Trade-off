import React from 'react';
import { JudgePreset } from '../../types/mission';
import { JUDGE_PRESETS } from '../../data/presets';
import { sfx } from '../../utils/audio';

interface CompactMissionHeaderProps {
  activeTab: 'blueprint-lab' | 'flight-director';
  onTabChange: (tab: 'blueprint-lab' | 'flight-director') => void;
  selectedPresetId: string;
  onSelectPreset: (preset: JudgePreset) => void;
  playerXp: number;
  playerRank: string;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenCampaigns?: () => void;
}

export const CompactMissionHeader: React.FC<CompactMissionHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedPresetId,
  onSelectPreset,
  playerXp,
  playerRank,
  audioEnabled,
  onToggleAudio,
  onOpenCampaigns,
}) => {
  return (
    <header className="h-14 w-full bg-surface-container-lowest/90 backdrop-blur-2xl shadow-md shrink-0 z-50 px-4 flex items-center justify-between gap-3">
      {/* Brand & JPL badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_10px_rgba(0,242,254,0.8)] animate-pulse" />
          <span className="font-headline text-base uppercase tracking-wider text-text-bright font-bold">
            Cosmic Trade-Off
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-primary-container/10 text-telemetry-cyan font-mono text-[10px] tracking-widest uppercase font-semibold">
          NASA JPL
        </span>
      </div>

      {/* Preset Missions Pills & Campaign Selector */}
      <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-surface-container/70 backdrop-blur-md">
        {onOpenCampaigns && (
          <button
            onClick={() => {
              sfx.playClick();
              onOpenCampaigns();
            }}
            className="px-2.5 py-1 rounded-full font-mono text-xs uppercase flex items-center gap-1 bg-primary-container/15 text-telemetry-cyan font-bold hover:bg-primary-container/25 transition-all shadow-[0_0_10px_rgba(0,242,254,0.2)]"
            title="Open Narrative NASA Flight Campaigns"
          >
            <span className="material-symbols-outlined text-[13px]">explore</span>
            <span>Campaigns</span>
          </button>
        )}
        {JUDGE_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                sfx.playClick();
                onSelectPreset(preset);
              }}
              className={`px-3 py-1 rounded-full font-mono text-xs uppercase transition-all ${
                isSelected
                  ? 'bg-surface-container-high text-telemetry-cyan font-semibold shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Rank XP, Audio, Mode Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Gamified Rank & XP Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-high/80 text-xs font-mono">
          <span className="material-symbols-outlined text-amber-400 text-[14px]">military_tech</span>
          <span className="text-text-bright font-semibold">{playerRank}</span>
          <span className="text-telemetry-cyan text-[11px] font-bold">{playerXp} XP</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleAudio}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            audioEnabled
              ? 'bg-primary-container/20 text-telemetry-cyan hover:bg-primary-container/30'
              : 'bg-surface-container-high text-text-dim hover:text-text-bright'
          }`}
          title={audioEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
        >
          <span className="material-symbols-outlined text-[15px]">
            {audioEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Mode Switcher Nav */}
        <nav className="flex items-center p-0.5 rounded-full bg-surface-container-high/90">
          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('blueprint-lab');
            }}
            className={`px-3 py-1 rounded-full font-mono text-xs tracking-wider uppercase transition-all ${
              activeTab === 'blueprint-lab'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(0,242,254,0.35)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Blueprint Lab
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              onTabChange('flight-director');
            }}
            className={`px-3 py-1 rounded-full font-mono text-xs tracking-wider uppercase transition-all ${
              activeTab === 'flight-director'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(0,242,254,0.35)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Flight Director
          </button>
        </nav>
      </div>
    </header>
  );
};

