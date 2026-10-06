import React, { useState, useEffect } from 'react';
import {
  SpacecraftConfiguration,
  MissionEngineeringMetrics,
  Destination,
  FlightPhase,
  FlightAnomaly,
  MissionScorecard,
} from '../../types/mission';
import { FLIGHT_ANOMALIES } from '../../data/anomalies';
import { OrbitalVisualizer } from '../OrbitalVisualizer';
import { FlightAnomalyModal } from './FlightAnomalyModal';
import { ManeuverBurnMinigame } from './ManeuverBurnMinigame';
import { MaxQAscentMinigame } from './MaxQAscentMinigame';
import { SolarArrayGimbalMinigame } from './minigames/SolarArrayGimbalMinigame';
import { DsnPhaseLockMinigame } from './minigames/DsnPhaseLockMinigame';
import { ReactionWheelDesatMinigame } from './minigames/ReactionWheelDesatMinigame';
import { SlingshotEntryVectorMinigame } from './minigames/SlingshotEntryVectorMinigame';
import { sfx } from '../../utils/audio';

interface StitchFlightDirectorViewProps {
  config: SpacecraftConfiguration;
  metrics: MissionEngineeringMetrics;
  destination: Destination;
  onMissionCompleted: (scorecard: MissionScorecard) => void;
  onBackToLab: () => void;
  onAddXp?: (xp: number) => void;
}

export const StitchFlightDirectorView: React.FC<StitchFlightDirectorViewProps> = ({
  config,
  metrics,
  destination,
  onMissionCompleted,
  onBackToLab,
  onAddXp,
}) => {
  const [phase, setPhase] = useState<FlightPhase>('ASCENT');
  const [progress, setProgress] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [elapsedDays, setElapsedDays] = useState<number>(0);
  const [propellantKg, setPropellantKg] = useState<number>(metrics.propellantMassKg);
  const [hullIntegrity, setHullIntegrity] = useState<number>(100);
  const [scienceTransmittedGb, setScienceTransmittedGb] = useState<number>(0);
  const [activeAnomaly, setActiveAnomaly] = useState<FlightAnomaly | null>(null);
  const [resolvedPhases, setResolvedPhases] = useState<Record<string, boolean>>({});
  const [anomaliesResolvedCount, setAnomaliesResolvedCount] = useState<number>(0);
  const [safeModeActive, setSafeModeActive] = useState<boolean>(false);
  const [isBurnMinigameOpen, setIsBurnMinigameOpen] = useState<boolean>(false);
  const [isMaxQOpen, setIsMaxQOpen] = useState<boolean>(false);
  const [maxQResolved, setMaxQResolved] = useState<boolean>(false);
  const [isSolarMinigameOpen, setIsSolarMinigameOpen] = useState<boolean>(false);
  const [isDsnMinigameOpen, setIsDsnMinigameOpen] = useState<boolean>(false);
  const [isRcsMinigameOpen, setIsRcsMinigameOpen] = useState<boolean>(false);
  const [isSlingshotMinigameOpen, setIsSlingshotMinigameOpen] = useState<boolean>(false);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  const [flightLogs, setFlightLogs] = useState<
    { time: string; msg: string; type: 'info' | 'warn' | 'alert' | 'ok' }[]
  >([
    {
      time: 'T-00:00:00',
      msg: `Main Engine Cut-Off (MECO) and Trans-Planetary Injection burn successful towards ${destination.name}.`,
      type: 'ok',
    },
  ]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'alert' | 'ok' = 'info') => {
    const timeStr = `T+${Math.floor(elapsedDays)}d`;
    setFlightLogs((prev) => [{ time: timeStr, msg, type }, ...prev.slice(0, 25)]);
  };

  const nextPhaseMap: Record<FlightPhase, FlightPhase> = {
    PRE_LAUNCH: 'ASCENT',
    ASCENT: 'CRUISE',
    CRUISE: 'ARRIVAL',
    ARRIVAL: 'SCIENCE',
    SCIENCE: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  };

  const finishMission = () => {
    setIsSimulating(false);
    setPhase('COMPLETED');
    addLog(`All flight objectives executed at ${destination.name}. Compiling NASA Mission Scorecard...`, 'ok');

    const baseScience = metrics.totalScienceValue;
    const scienceRatio = Math.min(1.2, (scienceTransmittedGb / 120) * (baseScience / 60));
    const scienceScore = Math.min(100, Math.round(scienceRatio * 85));

    const propellantEfficiency = propellantKg / Math.max(1, metrics.propellantMassKg);
    const engineeringScore = Math.min(
      100,
      Math.round(hullIntegrity * 0.5 + propellantEfficiency * 30 + metrics.reliabilityRating * 0.2)
    );

    const budgetScore = Math.max(
      40,
      Math.min(100, Math.round(100 - (metrics.totalCostM / metrics.budgetCapM) * 30))
    );

    const riskScore = Math.round((hullIntegrity / 100) * 90 + anomaliesResolvedCount * 5);
    const overallScore = Math.round(scienceScore * 0.4 + engineeringScore * 0.3 + budgetScore * 0.15 + riskScore * 0.15);

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (overallScore >= 92 && hullIntegrity > 80) grade = 'A+';
    else if (overallScore >= 82) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 55) grade = 'C';
    else if (hullIntegrity < 40) grade = 'F';

    if (onAddXp) onAddXp(250);

    const scorecard: MissionScorecard = {
      grade,
      overallScore,
      scienceScore,
      engineeringScore,
      budgetScore,
      riskScore,
      summaryTitle: grade === 'A+' || grade === 'A' ? 'Grand Exploration Success' : 'Nominal Mission Completion',
      summaryAnalysis: `Spacecraft reached ${destination.name} with ${hullIntegrity}% structural integrity. Returned ${scienceTransmittedGb.toFixed(1)} GB telemetry and resolved ${anomaliesResolvedCount} hazards.`,
      breakdown: [
        {
          category: 'Scientific Yield & Discovery',
          points: scienceScore,
          maxPoints: 100,
          status: scienceScore >= 80 ? 'optimal' : 'acceptable',
          comment: `${scienceTransmittedGb.toFixed(1)} GB science downlinked from ${destination.name}.`,
        },
        {
          category: 'Propulsion Margins',
          points: Math.round(propellantEfficiency * 100),
          maxPoints: 100,
          status: propellantKg > 100 ? 'optimal' : 'warning',
          comment: `Remaining propellant: ${propellantKg.toFixed(0)} kg. Delta-V margins held across all burn nodes.`,
        },
        {
          category: 'Spacecraft Bus & Hull',
          points: hullIntegrity,
          maxPoints: 100,
          status: hullIntegrity > 75 ? 'optimal' : 'warning',
          comment: `Bus integrity at ${hullIntegrity}%. Shielding remained intact.`,
        },
        {
          category: 'Fiscal Cost Efficiency',
          points: budgetScore,
          maxPoints: 100,
          status: metrics.budgetWithinLimit ? 'optimal' : 'failed',
          comment: `Final mission cost: $${metrics.totalCostM}M vs NASA cap of $${metrics.budgetCapM}M.`,
        },
      ],
    };

    onMissionCompleted(scorecard);
  };

  useEffect(() => {
    if (!isSimulating || activeAnomaly || phase === 'COMPLETED' || phase === 'FAILED') {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const step = 2.0 * speedMultiplier;
        const newProgress = prevProgress + step;

        setElapsedDays((d) => {
          let dayInc = 0.5 * speedMultiplier;
          if (phase === 'CRUISE') dayInc = ((destination.distanceAU * 35) / 50) * speedMultiplier;
          return d + dayInc;
        });

        // Trigger Max-Q ascent minigame once during Ascent
        if (phase === 'ASCENT' && newProgress >= 22 && !maxQResolved && !isMaxQOpen) {
          setIsSimulating(false);
          setIsMaxQOpen(true);
          setMaxQResolved(true);
          addLog('TRANSONIC MAX-Q: Aerodynamic pressure climbing! Throttle engine.', 'alert');
          return 24;
        }

        // Trigger anomaly once per phase at 45% progress
        if (newProgress >= 45 && !resolvedPhases[phase] && !activeAnomaly) {
          const candidate = FLIGHT_ANOMALIES.find((a) => a.phase === phase);
          if (candidate) {
            setResolvedPhases((prev) => ({ ...prev, [phase]: true }));
            setActiveAnomaly(candidate);
            setIsSimulating(false);
            addLog(`CRITICAL ANOMALY: ${candidate.title}`, 'alert');
            return 48;
          }
        }

        // Random mid-flight contingency minigame between 72% and 80% in Cruise or Science
        if (newProgress >= 72 && newProgress <= 82 && !randomEventTriggered[phase]) {
          setRandomEventTriggered((prev) => ({ ...prev, [phase]: true }));
          setIsSimulating(false);
          if (phase === 'CRUISE') {
            setIsRcsMinigameOpen(true);
            addLog('INTERPLANETARY TURBULENCE: Gyroscope momentum drift. Execute RCS desat!', 'alert');
          } else if (phase === 'SCIENCE') {
            setIsDsnMinigameOpen(true);
            addLog('DEEP SPACE NETWORK WINDOW: Optimal SNR alignment. Fine-tune carrier wave!', 'ok');
          } else if (phase === 'ARRIVAL') {
            setIsSlingshotMinigameOpen(true);
            addLog('GRAVITY ENCOUNTER: Hyperbolic corridor open. Target periapsis altitude!', 'ok');
          }
          return newProgress + 2;
        }

        if (phase === 'SCIENCE') {
          setScienceTransmittedGb((s) => s + metrics.totalScienceValue * 0.12 * speedMultiplier);
        }

        if (newProgress >= 100) {
          const next = nextPhaseMap[phase];
          if (next === 'COMPLETED') {
            finishMission();
            return 100;
          } else {
            setPhase(next);
            addLog(`Phase complete: Transitioned to ${next} operations.`, 'ok');
            return 0;
          }
        }

        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isSimulating, activeAnomaly, phase, speedMultiplier, destination, metrics, resolvedPhases]);

  // Random in-flight opportunities (triggers between 68% and 78% in CRUISE or ARRIVAL)
  const [randomEventTriggered, setRandomEventTriggered] = useState<Record<string, boolean>>({});

  const handleResolveAnomaly = (choiceIdx: number) => {
    if (!activeAnomaly) return;
    const choice = activeAnomaly.choices[choiceIdx];

    if (choice.propellantCostKg > 0) {
      setPropellantKg((prev) => Math.max(0, prev - choice.propellantCostKg));
    }

    setAnomaliesResolvedCount((c) => c + 1);
    setResolvedPhases((prev) => ({ ...prev, [phase]: true }));
    setProgress((p) => Math.max(54, p + 4));
    setActiveAnomaly(null);

    // If choice triggers an interactive minigame directly:
    if (choice.minigameTrigger) {
      setIsSimulating(false);
      if (choice.minigameTrigger === 'solar') setIsSolarMinigameOpen(true);
      else if (choice.minigameTrigger === 'dsn') setIsDsnMinigameOpen(true);
      else if (choice.minigameTrigger === 'rcs') setIsRcsMinigameOpen(true);
      else if (choice.minigameTrigger === 'slingshot') setIsSlingshotMinigameOpen(true);
      else if (choice.minigameTrigger === 'burn') setIsBurnMinigameOpen(true);
      else if (choice.minigameTrigger === 'maxq') setIsMaxQOpen(true);
      return;
    }

    const isSuccess = Math.random() <= choice.successRate;
    if (isSuccess) {
      addLog(`Directive success: ${choice.label}.`, 'ok');
      setScienceTransmittedGb((s) => Math.max(0, s + choice.scienceModifier));
      if (onAddXp) onAddXp(75);
    } else {
      const damage = Math.round(15 + Math.random() * 20);
      setHullIntegrity((h) => Math.max(10, h - damage));
      addLog(`Subsystem stress: Hull integrity -${damage}%`, 'alert');
    }

    setIsSimulating(true);
  };

  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);
  };

  const handleMaxQSuccess = (xp: number) => {
    setIsMaxQOpen(false);
    setIsSimulating(true);
    addLog('Max-Q throttled nominally. Transonic barrier cleared with zero structural damage.', 'ok');
    if (onAddXp) onAddXp(xp);
    triggerScreenShake();
  };

  const handleMaxQFailure = (damage: number) => {
    setIsMaxQOpen(false);
    setIsSimulating(true);
    setHullIntegrity((h) => Math.max(15, h - damage));
    addLog(`Max-Q dynamic pressure exceedance: Fairing strain damaged hull -${damage}%`, 'alert');
    triggerScreenShake();
  };

  const handleBurnExecuted = (bonusPercent: number) => {
    setIsBurnMinigameOpen(false);
    triggerScreenShake();
    setPropellantKg((p) => Math.max(0, p - 30));
    addLog(`RCS Burn executed with +${bonusPercent}% delta-V injection efficiency bonus!`, 'ok');
    if (onAddXp) onAddXp(bonusPercent > 0 ? 75 : 25);
  };

  const calculatedVelocity =
    phase === 'ASCENT' ? 7.8 + (progress / 100) * 3.4 :
    phase === 'CRUISE' ? 11.2 - (progress / 100) * 2.1 :
    phase === 'ARRIVAL' ? 8.9 - (progress / 100) * 4.2 :
    3.8;

  const propellantPercent =
    metrics.propellantMassKg > 0 ? (propellantKg / metrics.propellantMassKg) * 100 : 0;

  return (
    <div
      className={`h-full min-h-0 flex flex-col gap-2 overflow-hidden select-none relative transition-all duration-300 ${
        activeAnomaly ? 'shadow-[inset_0_0_140px_rgba(220,38,38,0.45)]' : ''
      } ${isScreenShaking ? 'animate-shake' : ''}`}
    >
      {/* Flight Deck Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Orbital Canvas, Stage Tracker & Instruments */}
        <div className="lg:col-span-8 flex flex-col gap-2 h-full min-h-0">
          {/* Flight Stage Progression Stepper */}
          <div className="p-2 rounded-lg bg-surface-container shadow-md flex items-center justify-between gap-2 shrink-0 font-mono text-xs select-none">
            <div className="flex items-center gap-1.5 w-full">
              {[
                { id: 'ASCENT', label: '1. Launch & MECO' },
                { id: 'CRUISE', label: '2. Cruise' },
                { id: 'ARRIVAL', label: '3. Orbit Insertion' },
                { id: 'SCIENCE', label: '4. Science Ops' },
              ].map((s, idx) => {
                const isCurrent = phase === s.id;
                const order = ['ASCENT', 'CRUISE', 'ARRIVAL', 'SCIENCE', 'COMPLETED'];
                const isPassed = order.indexOf(phase) > order.indexOf(s.id as any);
                return (
                  <React.Fragment key={s.id}>
                    <div
                      className={`flex-1 py-1 px-2 rounded flex items-center justify-between text-[11px] transition-all ${
                        isCurrent
                          ? 'bg-primary-container/20 text-telemetry-cyan font-bold shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                          : isPassed
                          ? 'bg-surface-container-high text-primary-fixed opacity-75'
                          : 'bg-surface-container-low text-text-dim opacity-40'
                      }`}
                    >
                      <span className="truncate">{s.label}</span>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse shrink-0 ml-1" />}
                      {isPassed && <span className="material-symbols-outlined text-[13px] text-telemetry-cyan shrink-0 ml-1">check</span>}
                    </div>
                    {idx < 3 && <span className="text-text-dim text-[10px]">→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Dynamic Full-Height Astrodynamics Canvas Container */}
          <div className="flex-1 min-h-0 rounded-lg overflow-hidden relative shadow-lg">
            <OrbitalVisualizer
              destinationId={config.destinationId}
              flightPhase={phase}
              phaseProgress={progress}
              velocityKmS={calculatedVelocity}
              propellantPercent={propellantPercent}
            />
          </div>

          {/* Spacecraft Avionics & Instrument Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-lg bg-surface-container shadow-sm font-mono text-xs shrink-0 select-none">
            <div className="flex flex-col bg-surface-container-low p-1.5 rounded">
              <span className="text-[10px] text-text-dim">DELTA-V BURNED</span>
              <span className="text-telemetry-cyan font-bold text-xs mt-0.5">
                {((1 - propellantPercent / 100) * metrics.deltaVRequiredKmS * 1000).toFixed(0)} m/s
              </span>
            </div>
            <div className="flex flex-col bg-surface-container-low p-1.5 rounded">
              <span className="text-[10px] text-text-dim">SPECIFIC IMPULSE</span>
              <span className="text-text-bright font-bold text-xs mt-0.5">320s</span>
            </div>
            <div className="flex flex-col bg-surface-container-low p-1.5 rounded">
              <span className="text-[10px] text-text-dim">COMM CARRIER LOCK</span>
              <span className="text-primary font-bold text-xs mt-0.5">X-BAND (128 kbps)</span>
            </div>
            <div className="flex flex-col bg-surface-container-low p-1.5 rounded">
              <span className="text-[10px] text-text-dim">THERMAL BUS</span>
              <span className="text-primary-fixed font-bold text-xs mt-0.5">NOMINAL (292 K)</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-2.5 rounded-lg bg-surface-container shadow-md flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsSimulating(!isSimulating);
                }}
                className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase transition-all ${
                  isSimulating
                    ? 'bg-status-warning text-white'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {isSimulating ? 'Pause Stream' : 'Resume Flight'}
              </button>

              <button
                onClick={onBackToLab}
                className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-bright font-mono text-xs text-text-dim hover:text-text-bright transition-colors"
              >
                Return to Lab
              </button>
            </div>

            {/* Warp Speeds */}
            <div className="flex items-center gap-1 font-mono text-xs text-text-dim">
              <span>WARP:</span>
              {[1, 2, 5].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    sfx.playClick();
                    setSpeedMultiplier(w);
                  }}
                  className={`px-2 py-0.5 rounded ${
                    speedMultiplier === w
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'bg-surface-container-high text-text-bright'
                  }`}
                >
                  {w}X
                </button>
              ))}
            </div>

            {/* Phase & MET */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-text-dim">STAGE:</span>
              <span className="text-telemetry-cyan font-bold">{phase} ({progress.toFixed(0)}%)</span>
              <span className="text-text-dim">MET:</span>
              <span className="text-text-bright">{Math.floor(elapsedDays)} Days</span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Dials & Mission Commands */}
        <div className="lg:col-span-4 flex flex-col gap-2 h-full min-h-0 overflow-y-auto pr-1">
          {/* Telemetry Dials (4 cards) */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <div className="p-2.5 rounded-lg bg-surface-container-low shadow-sm">
              <div className="font-mono text-[10px] text-text-dim uppercase">RCS / MAIN FUEL</div>
              <div className="font-mono text-sm text-text-bright font-bold mt-0.5">
                {propellantKg.toFixed(0)} kg
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1 mt-1 overflow-hidden">
                <div className="bg-primary-container h-full" style={{ width: `${Math.min(100, propellantPercent)}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low shadow-sm">
              <div className="font-mono text-[10px] text-text-dim uppercase">HULL INTEGRITY</div>
              <div className="font-mono text-sm text-text-bright font-bold mt-0.5">
                {hullIntegrity}%
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1 mt-1 overflow-hidden">
                <div className="bg-telemetry-cyan h-full" style={{ width: `${hullIntegrity}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low shadow-sm">
              <div className="font-mono text-[10px] text-text-dim uppercase">POWER BUS</div>
              <div className="font-mono text-sm text-text-bright font-bold mt-0.5">
                {metrics.powerGeneratedW} W
              </div>
              <div className="text-[10px] font-mono text-text-dim mt-0.5">
                {safeModeActive ? 'Safe Mode' : 'Nominal Power'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low shadow-sm">
              <div className="font-mono text-[10px] text-text-dim uppercase">DOWNLINK SCIENCE</div>
              <div className="font-mono text-sm text-telemetry-cyan font-bold mt-0.5">
                {scienceTransmittedGb.toFixed(1)} GB
              </div>
              <div className="text-[10px] font-mono text-text-dim mt-0.5">
                DSN Carrier Lock
              </div>
            </div>
          </div>

          {/* Direct Commands & Interactive Subsystem Challenges */}
          <div className="p-3 rounded-lg bg-surface-container shadow-sm flex flex-col gap-1.5 shrink-0">
            <span className="font-mono text-[11px] text-text-dim uppercase tracking-wider mb-0.5 font-semibold flex items-center justify-between">
              <span>Flight Directives & Interventions</span>
              <span className="text-[10px] text-telemetry-cyan font-normal">Active telemetry</span>
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsSolarMinigameOpen(true);
                }}
                className="p-2 rounded-lg font-mono text-xs flex items-center justify-between bg-surface-container-low text-text-bright hover:bg-surface-container-high transition-colors"
                title="Align solar arrays towards the Sun for power bonus"
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[11px]">Solar Gimbal</span>
                  <span className="text-[10px] text-text-dim">+650W Bus Power</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-status-warning">solar_power</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setIsDsnMinigameOpen(true);
                }}
                className="p-2 rounded-lg font-mono text-xs flex items-center justify-between bg-surface-container-low text-text-bright hover:bg-surface-container-high transition-colors"
                title="Tune DSN carrier phase lock & SNR for science downlink"
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[11px]">DSN Phase Lock</span>
                  <span className="text-[10px] text-text-dim">+18.5 GB Science</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-telemetry-cyan">podcasts</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setIsRcsMinigameOpen(true);
                }}
                className="p-2 rounded-lg font-mono text-xs flex items-center justify-between bg-surface-container-low text-text-bright hover:bg-surface-container-high transition-colors"
                title="Desaturate spinning reaction wheels with cold gas RCS pulses"
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[11px]">RCS Momentum</span>
                  <span className="text-[10px] text-text-dim">Desat Gyros (RPM)</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-primary">rotate_right</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setIsSlingshotMinigameOpen(true);
                }}
                className="p-2 rounded-lg font-mono text-xs flex items-center justify-between bg-surface-container-low text-text-bright hover:bg-surface-container-high transition-colors"
                title="Hyperbolic gravity assist periapsis targeting"
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[11px]">Gravity Assist</span>
                  <span className="text-[10px] text-text-dim">+1.8 km/s Delta-V</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
              </button>
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsBurnMinigameOpen(true);
                }}
                className="flex-1 p-2 rounded-lg font-mono text-xs flex items-center justify-between bg-surface-container-low text-text-bright hover:bg-surface-container-high transition-colors"
              >
                <span>Trigger Main Burn Node</span>
                <span className="material-symbols-outlined text-[15px] text-telemetry-cyan">rocket</span>
              </button>

              <button
                onClick={() => {
                  sfx.playClick();
                  setSafeModeActive(!safeModeActive);
                  addLog(`Safe Mode ${!safeModeActive ? 'ENGAGED' : 'STANDBY'}.`, 'warn');
                }}
                className={`p-2 px-3 rounded-lg font-mono text-xs flex items-center gap-1 transition-colors ${
                  safeModeActive
                    ? 'bg-status-warning/20 text-status-warning font-bold'
                    : 'bg-surface-container-low text-text-bright hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">shield</span>
                <span>{safeModeActive ? 'Safe: ON' : 'Safe Mode'}</span>
              </button>
            </div>
          </div>

          {/* DSN Event Log */}
          <div className="p-3 rounded-lg bg-surface-container-lowest shadow-sm flex-1 min-h-[140px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between text-text-dim pb-1 mb-1 border-b border-white/5 shrink-0">
              <span className="font-mono text-xs text-primary font-bold">DSN Event Log</span>
              <span className="font-mono text-[10px] text-telemetry-cyan animate-pulse">LIVE FEED</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
              {flightLogs.map((l, i) => (
                <div key={i} className="flex items-start gap-1 leading-relaxed">
                  <span className="text-text-dim shrink-0">{l.time}</span>
                  <span
                    className={
                      l.type === 'alert'
                        ? 'text-status-warning font-semibold'
                        : l.type === 'ok'
                        ? 'text-telemetry-cyan'
                        : 'text-text-bright'
                    }
                  >
                    {l.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Flight Anomaly Modal (Pops directly in center view!) */}
      <FlightAnomalyModal
        anomaly={activeAnomaly}
        onResolve={handleResolveAnomaly}
      />

      {/* Maneuver Burn Minigame */}
      <ManeuverBurnMinigame
        isOpen={isBurnMinigameOpen}
        onBurnExecuted={handleBurnExecuted}
        onCancel={() => setIsBurnMinigameOpen(false)}
      />

      {/* Transonic Max-Q Ascent Minigame */}
      <MaxQAscentMinigame
        isOpen={isMaxQOpen}
        onSuccess={handleMaxQSuccess}
        onFailure={handleMaxQFailure}
      />

      {/* Solar Array Sun-Tracking Gimbal Minigame */}
      <SolarArrayGimbalMinigame
        isOpen={isSolarMinigameOpen}
        onCancel={() => {
          setIsSolarMinigameOpen(false);
          setIsSimulating(true);
        }}
        onSuccess={(bonusW) => {
          setIsSolarMinigameOpen(false);
          setIsSimulating(true);
          addLog(`Solar arrays aligned with Sun vector. Power generation boosted +${bonusW}W.`, 'ok');
          if (onAddXp) onAddXp(60);
        }}
        onFailure={(penaltyW) => {
          setIsSolarMinigameOpen(false);
          setIsSimulating(true);
          addLog(`Gimbal slew timed out. Array misalignment: -${penaltyW}W generation.`, 'warn');
        }}
      />

      {/* DSN Phase Lock & Bitrate Minigame */}
      <DsnPhaseLockMinigame
        isOpen={isDsnMinigameOpen}
        onCancel={() => {
          setIsDsnMinigameOpen(false);
          setIsSimulating(true);
        }}
        onSuccess={(scienceGb) => {
          setIsDsnMinigameOpen(false);
          setIsSimulating(true);
          setScienceTransmittedGb((prev) => prev + scienceGb);
          addLog(`DSN Phase Locked! Ultra-high bitrate packet dump completed (+${scienceGb} GB).`, 'ok');
          if (onAddXp) onAddXp(80);
        }}
        onFailure={() => {
          setIsDsnMinigameOpen(false);
          setIsSimulating(true);
          addLog('DSN carrier lost in cosmic noise floor. Science packets buffered in flash RAM.', 'warn');
        }}
      />

      {/* Reaction Wheel Momentum Desaturation Minigame */}
      <ReactionWheelDesatMinigame
        isOpen={isRcsMinigameOpen}
        onCancel={() => {
          setIsRcsMinigameOpen(false);
          setIsSimulating(true);
        }}
        onSuccess={(fuelSavedKg) => {
          setIsRcsMinigameOpen(false);
          setIsSimulating(true);
          addLog(`Reaction wheels desaturated cleanly! RCS pulse efficiency saved +${fuelSavedKg} kg propellant.`, 'ok');
          if (onAddXp) onAddXp(75);
        }}
        onFailure={(damagePercent) => {
          setIsRcsMinigameOpen(false);
          setIsSimulating(true);
          setHullIntegrity((h) => Math.max(10, h - damagePercent));
          addLog(`Reaction wheel oversaturated: Attitude jitter strain caused -${damagePercent}% bus damage!`, 'alert');
          triggerScreenShake();
        }}
      />

      {/* Gravity Assist Slingshot Entry Vector Minigame */}
      <SlingshotEntryVectorMinigame
        isOpen={isSlingshotMinigameOpen}
        onCancel={() => {
          setIsSlingshotMinigameOpen(false);
          setIsSimulating(true);
        }}
        onSuccess={(deltaVBonus) => {
          setIsSlingshotMinigameOpen(false);
          setIsSimulating(true);
          addLog(`Gravity Assist corridor locked! Trajectory boosted by +${deltaVBonus} km/s Delta-V without fuel penalty.`, 'ok');
          setPropellantKg((prev) => prev + 15);
          if (onAddXp) onAddXp(120);
        }}
        onFailure={(hullDamage) => {
          setIsSlingshotMinigameOpen(false);
          setIsSimulating(true);
          setHullIntegrity((h) => Math.max(15, h - hullDamage));
          addLog(`Atmospheric graze during hyperbolic flyby! Thermal shock: -${hullDamage}% integrity!`, 'alert');
          triggerScreenShake();
        }}
      />
    </div>
  );
};
