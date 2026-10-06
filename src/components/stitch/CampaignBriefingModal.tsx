import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JudgePreset } from '../../types/mission';
import { JUDGE_PRESETS } from '../../data/presets';
import { sfx } from '../../utils/audio';

interface CampaignBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCampaign: (preset: JudgePreset) => void;
  selectedPresetId: string;
}

export const CampaignBriefingModal: React.FC<CampaignBriefingModalProps> = ({
  isOpen,
  onClose,
  onSelectCampaign,
  selectedPresetId,
}) => {
  if (!isOpen) return null;

  const campaigns = [
    {
      preset: JUDGE_PRESETS[0], // Europa
      difficulty: 'HARD',
      difficultyColor: 'text-secondary bg-secondary/15',
      narrative: 'High-radiation Jovian orbital insertion. Requires nuclear RTG power to survive outside the solar goldilocks zone, with ice-penetrating sounders.',
      challengeGoal: 'Survive 5.2 AU cruise with >75% hull integrity and downlink subsurface ocean telemetry.',
      historicalPrecedent: 'Galileo & Europa Clipper Flagship Mission',
    },
    {
      preset: JUDGE_PRESETS[1], // Artemis Moon
      difficulty: 'EASY',
      difficultyColor: 'text-telemetry-cyan bg-primary-container/15',
      narrative: 'Lunar South Pole Shackleton Crater reconnaissance. Rapid transit to detect subsurface water-ice volatiles for permanent crewed habitats.',
      challengeGoal: 'Achieve tight budget efficiency under $250M with optical imaging suite.',
      historicalPrecedent: 'Artemis Program & Lunar Reconnaissance Orbiter',
    },
    {
      preset: JUDGE_PRESETS[2], // Mars
      difficulty: 'MEDIUM',
      difficultyColor: 'text-amber-400 bg-amber-400/15',
      narrative: 'Fast-transit trajectory to the Red Planet. Utilize high-efficiency propulsion to minimize cruise radiation exposure and secure sample recovery.',
      challengeGoal: 'Delta-V margin > +0.5 km/s for aerocapture maneuvers.',
      historicalPrecedent: 'Mars 2020 & MAV Sample Return Architecture',
    },
    {
      preset: JUDGE_PRESETS[3], // Titan
      difficulty: 'EXTREME',
      difficultyColor: 'text-status-warning bg-status-warning/15',
      narrative: 'Deep-space hyperbolic injection to Saturnian super-moon Titan. Heavy dense methane atmosphere analysis requires high-gain Ka-band transmission.',
      challengeGoal: 'Complete 9.5 AU voyage and downlink >40 GB prebiotic atmospheric spectra.',
      historicalPrecedent: 'Cassini-Huygens & Dragonfly Rotorcraft',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-3xl rounded-xl bg-surface-container-high p-6 shadow-2xl text-xs font-mono overflow-hidden max-h-[90vh] flex flex-col justify-between"
        >
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-container/15 blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 shrink-0">
            <div>
              <span className="text-[10px] text-telemetry-cyan font-bold uppercase tracking-widest">
                NASA FLIGHT DIRECTORY • NARRATIVE CAMPAIGNS
              </span>
              <h2 className="font-headline text-xl font-bold text-text-bright tracking-tight mt-0.5">
                Select Space Mission Campaign
              </h2>
            </div>
            <button
              onClick={() => {
                sfx.playClick();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-text-dim hover:text-text-bright transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-text-dim leading-relaxed mb-4 shrink-0">
            Choose a story-driven NASA flight assignment with dedicated scientific objectives, budget constraints, and real-world planetary challenges.
          </p>

          {/* Campaign Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1">
            {campaigns.map((camp) => {
              const isSelected = selectedPresetId === camp.preset.id;
              return (
                <div
                  key={camp.preset.id}
                  onClick={() => {
                    sfx.playClick();
                    onSelectCampaign(camp.preset);
                    onClose();
                  }}
                  className={`p-4 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer shadow-md text-left flex flex-col justify-between gap-3 ${
                    isSelected ? 'ring-2 ring-primary-container/80 bg-surface-container' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${camp.difficultyColor}`}>
                        {camp.difficulty}
                      </span>
                      <span className="text-[10px] text-text-dim font-mono">
                        {camp.preset.config.destinationId.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-headline text-base font-bold text-text-bright">
                      {camp.preset.name}
                    </h3>
                    <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                      {camp.narrative}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="text-[10px] text-text-dim">
                      <strong className="text-telemetry-cyan font-semibold">Goal:</strong> {camp.challengeGoal}
                    </div>
                    <div className="text-[10px] text-text-dim">
                      <strong className="text-text-bright font-semibold">Precedent:</strong> {camp.historicalPrecedent}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between shrink-0 text-[10px] text-text-dim">
            <span>Selecting a campaign configures the blueprint laboratory automatically.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-surface-container text-text-bright hover:bg-surface-container-highest transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
