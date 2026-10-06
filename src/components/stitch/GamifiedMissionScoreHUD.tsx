import React, { useState } from 'react';
import { MissionEngineeringMetrics, Destination } from '../../types/mission';
import { sfx } from '../../utils/audio';

interface GamifiedMissionScoreHUDProps {
  metrics: MissionEngineeringMetrics;
  destination: Destination;
}

export const GamifiedMissionScoreHUD: React.FC<GamifiedMissionScoreHUDProps> = ({
  metrics,
  destination,
}) => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Compute live gamified score prediction
  let liveScore = 50;
  if (metrics.deltaVSufficient) liveScore += 18;
  if (metrics.powerSufficient) liveScore += 14;
  if (metrics.budgetWithinLimit) liveScore += 12;
  liveScore += Math.min(20, metrics.totalScienceValue * 0.18);
  liveScore = Math.min(99, Math.max(15, Math.round(liveScore)));

  let predictedGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
  if (liveScore >= 90 && metrics.validationErrors.length === 0) predictedGrade = 'A+';
  else if (liveScore >= 80 && metrics.validationErrors.length === 0) predictedGrade = 'A';
  else if (liveScore >= 68) predictedGrade = 'B';
  else if (liveScore >= 52) predictedGrade = 'C';
  else if (liveScore >= 35) predictedGrade = 'D';
  else predictedGrade = 'F';

  // Badges & Achievements unlocked in real-time
  const achievements = [
    {
      id: 'architect',
      name: 'Orbital Architect',
      unlocked: metrics.deltaVSufficient && metrics.deltaVMarginKmS >= 0.3,
      desc: 'Sufficient Delta-V for stable orbit capture',
    },
    {
      id: 'nuclear',
      name: 'Jovian Power Reserve',
      unlocked: metrics.powerSufficient && metrics.netPowerMarginW >= 50,
      desc: '+50W electrical surplus generated',
    },
    {
      id: 'fiscal',
      name: 'Fiscal Discipline',
      unlocked: metrics.budgetWithinLimit && metrics.budgetMarginM >= 50,
      desc: '+$50M under NASA budget ceiling',
    },
    {
      id: 'discovery',
      name: 'Flagship Discovery Suite',
      unlocked: metrics.totalScienceValue >= 80,
      desc: '80+ Science points installed',
    },
  ];

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    sfx.enabled = next;
    if (next) sfx.playClick();
  };

  const gradeGlowMap: Record<string, string> = {
    'A+': 'text-primary-container shadow-[0_0_24px_rgba(0,242,254,0.45)] bg-primary-container/10',
    A: 'text-telemetry-cyan shadow-[0_0_20px_rgba(0,242,254,0.35)] bg-primary-container/10',
    B: 'text-secondary shadow-[0_0_16px_rgba(224,182,255,0.25)] bg-secondary/10',
    C: 'text-amber-400 bg-amber-500/10',
    D: 'text-status-warning bg-status-warning/10',
    F: 'text-error bg-error/10',
  };

  return (
    <div className="p-2.5 rounded-lg bg-surface-container shadow-md shrink-0 flex items-center justify-between gap-3 w-full select-none">
      {/* Left: Predicted NASA Grade & Success Meter */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-base transition-all duration-300 ${
            gradeGlowMap[predictedGrade] || gradeGlowMap['B']
          }`}
        >
          <span>{predictedGrade}</span>
          <span className="text-[7px] font-sans text-text-dim -mt-1 uppercase">GRADE</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline text-xs font-semibold text-text-bright">
              Readiness: {liveScore}%
            </span>
            <span
              className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full ${
                metrics.validationErrors.length === 0
                  ? 'bg-primary-container/15 text-telemetry-cyan font-semibold'
                  : 'bg-status-warning/15 text-status-warning font-semibold'
              }`}
            >
              {metrics.validationErrors.length === 0 ? 'NOMINAL' : `${metrics.validationErrors.length} DEFICITS`}
            </span>
          </div>
          <div className="w-28 bg-surface-container-highest rounded-full h-1 mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                liveScore >= 80 ? 'bg-primary-container' : liveScore >= 60 ? 'bg-secondary' : 'bg-status-warning'
              }`}
              style={{ width: `${liveScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Unlocked Milestone Ribbons */}
      <div className="flex flex-wrap items-center gap-1.5 justify-end">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            title={ach.desc}
            className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase flex items-center gap-1 transition-all ${
              ach.unlocked
                ? 'bg-surface-container-high text-telemetry-cyan font-semibold shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                : 'bg-surface-container-low text-text-dim opacity-40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${ach.unlocked ? 'bg-primary-container animate-pulse' : 'bg-text-dim'}`} />
            <span>{ach.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

