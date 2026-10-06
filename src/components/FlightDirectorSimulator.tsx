import React, { useState, useEffect } from 'react';
import {
  SpacecraftConfiguration,
  MissionEngineeringMetrics,
  FlightPhase,
  FlightAnomaly,
  MissionScorecard,
} from '../types/mission';
import { DESTINATIONS } from '../data/destinations';
import { FLIGHT_ANOMALIES } from '../data/anomalies';
import { OrbitalVisualizer } from './OrbitalVisualizer';
import {
  Play,
  Pause,
  RotateCcw,
  Shield,
  Radio,
  Flame,
  Activity,
  Award,
  Terminal,
  AlertTriangle,
  ChevronRight,
  BatteryCharging,
  Database,
  Cpu,
} from 'lucide-react';

interface FlightDirectorSimulatorProps {
  config: SpacecraftConfiguration;
  metrics: MissionEngineeringMetrics;
  onMissionCompleted: (scorecard: MissionScorecard) => void;
}

export const FlightDirectorSimulator: React.FC<FlightDirectorSimulatorProps> = ({
  config,
  metrics,
  onMissionCompleted,
}) => {
  const dest = DESTINATIONS[config.destinationId];

  // Simulation State
  const [phase, setPhase] = useState<FlightPhase>('PRE_LAUNCH');
  const [progress, setProgress] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [elapsedDays, setElapsedDays] = useState<number>(0);
  const [propellantKg, setPropellantKg] = useState<number>(metrics.propellantMassKg);
  const [hullIntegrity, setHullIntegrity] = useState<number>(100);
  const [scienceTransmittedGb, setScienceTransmittedGb] = useState<number>(0);
  const [activeAnomaly, setActiveAnomaly] = useState<FlightAnomaly | null>(null);
  const [anomaliesResolvedCount, setAnomaliesResolvedCount] = useState<number>(0);
  const [safeModeActive, setSafeModeActive] = useState<boolean>(false);

  const [flightLogs, setFlightLogs] = useState<
    { time: string; msg: string; type: 'info' | 'warn' | 'alert' | 'ok' }[]
  >([
    {
      time: 'T-00:00:10',
      msg: `Cosmic Trade-off Flight Director initialized for ${dest.name}. Terminal countdown active.`,
      type: 'info',
    },
  ]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'alert' | 'ok' = 'info') => {
    const timeStr = `T+${Math.floor(elapsedDays)}d`;
    setFlightLogs((prev) => [{ time: timeStr, msg, type }, ...prev.slice(0, 40)]);
  };

  // Reset simulator
  const handleReset = () => {
    setIsSimulating(false);
    setPhase('PRE_LAUNCH');
    setProgress(0);
    setElapsedDays(0);
    setPropellantKg(metrics.propellantMassKg);
    setHullIntegrity(100);
    setScienceTransmittedGb(0);
    setActiveAnomaly(null);
    setAnomaliesResolvedCount(0);
    setSafeModeActive(false);
    setFlightLogs([
      {
        time: 'T-00:00:10',
        msg: `Flight computer reset to pre-launch state for ${dest.name}. Ready for booster ignition.`,
        type: 'info',
      },
    ]);
  };

  // Phase transition rules
  const nextPhaseMap: Record<FlightPhase, FlightPhase> = {
    PRE_LAUNCH: 'ASCENT',
    ASCENT: 'CRUISE',
    CRUISE: 'ARRIVAL',
    ARRIVAL: 'SCIENCE',
    SCIENCE: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  };

  // Finish and generate scorecard
  const finishMission = () => {
    setIsSimulating(false);
    setPhase('COMPLETED');
    addLog(`All flight objectives executed at ${dest.name}. Compiling NASA Mission Scorecard...`, 'ok');

    // Score calculations
    const baseScience = metrics.totalScienceValue;
    const scienceRatio = Math.min(1.2, (scienceTransmittedGb / 120) * (baseScience / 60));
    const scienceScore = Math.min(100, Math.round(scienceRatio * 85));

    const propellantEfficiency = propellantKg / Math.max(1, metrics.propellantMassKg);
    const engineeringScore = Math.min(
      100,
      Math.round(hullIntegrity * 0.5 + propellantEfficiency * 30 + (metrics.reliabilityRating * 0.2))
    );

    const budgetScore = Math.max(
      40,
      Math.min(100, Math.round(100 - (metrics.totalCostM / metrics.budgetCapM) * 30))
    );

    const riskScore = Math.round((hullIntegrity / 100) * 90 + anomaliesResolvedCount * 5);
    const overallScore = Math.round((scienceScore * 0.4) + (engineeringScore * 0.3) + (budgetScore * 0.15) + (riskScore * 0.15));

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (overallScore >= 92 && hullIntegrity > 80) grade = 'A+';
    else if (overallScore >= 82) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 55) grade = 'C';
    else if (hullIntegrity < 40) grade = 'F';

    const scorecard: MissionScorecard = {
      grade,
      overallScore,
      scienceScore,
      engineeringScore,
      budgetScore,
      riskScore,
      summaryTitle: grade === 'A+' || grade === 'A' ? 'Grand Exploration Success' : 'Nominal Mission Completion',
      summaryAnalysis: `Spacecraft successfully reached ${dest.name} with ${hullIntegrity}% structural integrity. Returned ${scienceTransmittedGb.toFixed(1)} GB of telemetry and resolved ${anomaliesResolvedCount} in-flight flight director hazards.`,
      breakdown: [
        {
          category: 'Scientific Yield & Discovery',
          points: scienceScore,
          maxPoints: 100,
          status: scienceScore >= 80 ? 'optimal' : 'acceptable',
          comment: `${scienceTransmittedGb.toFixed(1)} GB science downlinked from ${dest.name}. Target synergies satisfied.`,
        },
        {
          category: 'Propulsion & Astrodynamics Margins',
          points: Math.round(propellantEfficiency * 100),
          maxPoints: 100,
          status: propellantKg > 100 ? 'optimal' : 'warning',
          comment: `Remaining propellant: ${propellantKg.toFixed(0)} kg. Tsiolkovsky delta-V margins held across all burn nodes.`,
        },
        {
          category: 'Spacecraft Bus & Hull Survivability',
          points: hullIntegrity,
          maxPoints: 100,
          status: hullIntegrity > 75 ? 'optimal' : 'warning',
          comment: `Bus integrity at ${hullIntegrity}%. Radiation shielding and thermal protection remained intact.`,
        },
        {
          category: 'NASA Fiscal Cost Efficiency',
          points: budgetScore,
          maxPoints: 100,
          status: metrics.budgetWithinLimit ? 'optimal' : 'failed',
          comment: `Final mission cost: $${metrics.totalCostM}M vs NASA cap of $${metrics.budgetCapM}M.`,
        },
      ],
    };

    onMissionCompleted(scorecard);
  };

  // Main simulation tick timer
  useEffect(() => {
    if (!isSimulating || activeAnomaly || phase === 'COMPLETED' || phase === 'FAILED') {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const step = 2.0 * speedMultiplier;
        const newProgress = prevProgress + step;

        // Day counters depending on phase
        setElapsedDays((d) => {
          let dayInc = 0.5 * speedMultiplier;
          if (phase === 'CRUISE') dayInc = (dest.distanceAU * 35) / 50 * speedMultiplier;
          return d + dayInc;
        });

        // Trigger anomalies probabilistically if not triggered yet for this phase
        if (newProgress >= 45 && newProgress <= 55 && !activeAnomaly) {
          const candidateAnomaly = FLIGHT_ANOMALIES.find(
            (a) => a.phase === phase && Math.random() < 0.65
          );
          if (candidateAnomaly) {
            setActiveAnomaly(candidateAnomaly);
            setIsSimulating(false);
            addLog(`CRITICAL ANOMALY: ${candidateAnomaly.title}`, 'alert');
            return prevProgress;
          }
        }

        // Science telemetry gathering during science phase
        if (phase === 'SCIENCE') {
          setScienceTransmittedGb((s) => s + (metrics.totalScienceValue * 0.12 * speedMultiplier));
        }

        // Phase finished
        if (newProgress >= 100) {
          const next = nextPhaseMap[phase];
          if (next === 'COMPLETED') {
            finishMission();
            return 100;
          } else {
            setPhase(next);
            addLog(`Phase complete. Transitioning to ${next}...`, 'ok');
            return 0;
          }
        }

        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isSimulating, activeAnomaly, phase, speedMultiplier, dest, metrics]);

  // Handle Flight Anomaly Decision
  const handleResolveAnomaly = (choiceIdx: number) => {
    if (!activeAnomaly) return;
    const choice = activeAnomaly.choices[choiceIdx];

    // Deduct propellant
    if (choice.propellantCostKg > 0) {
      setPropellantKg((prev) => Math.max(0, prev - choice.propellantCostKg));
    }

    // Success check
    const isSuccess = Math.random() <= choice.successRate;
    if (isSuccess) {
      addLog(`Anomaly resolved: ${choice.label} succeeded.`, 'ok');
      setScienceTransmittedGb((s) => Math.max(0, s + choice.scienceModifier));
    } else {
      const damage = Math.round(15 + Math.random() * 20);
      setHullIntegrity((h) => Math.max(10, h - damage));
      addLog(`Flight risk occurred: Partial subsystem shock! Hull integrity -${damage}%`, 'alert');
    }

    setAnomaliesResolvedCount((c) => c + 1);
    setActiveAnomaly(null);
    setIsSimulating(true);
  };

  // Flight Director Direct Action: Safe Mode
  const toggleSafeMode = () => {
    setSafeModeActive(!safeModeActive);
    if (!safeModeActive) {
      addLog('COMMAND SENT: Autonomous Safe Mode enabled. Non-essential science loads shed.', 'warn');
    } else {
      addLog('COMMAND SENT: Nominal science mode restored. High-bandwidth transceivers re-engaged.', 'info');
    }
  };

  // Flight Director Direct Action: Trajectory Trim
  const executeTrimBurn = () => {
    if (propellantKg < 25) {
      addLog('ERROR: Insufficient propellant for RCS trim burn.', 'alert');
      return;
    }
    setPropellantKg((p) => p - 25);
    addLog('COMMAND SENT: RCS trim burn executed ($\Delta v$ vector realigned). -25kg propellant.', 'ok');
  };

  const calculatedVelocity =
    phase === 'ASCENT' ? 7.8 + (progress / 100) * 3.4 :
    phase === 'CRUISE' ? 11.2 - (progress / 100) * 2.1 :
    phase === 'ARRIVAL' ? 8.9 - (progress / 100) * 4.2 :
    3.8;

  const propellantPercent =
    metrics.propellantMassKg > 0 ? (propellantKg / metrics.propellantMassKg) * 100 : 0;

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Live Orbit Simulation Canvas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-cyan-400" />
            3. NASA Flight Director & Interplanetary Simulator
          </h2>
          <p className="text-sm text-neutral-400">
            Execute mission phases in real-time. Manage live space telemetry and resolve in-flight anomalies.
          </p>
        </div>

        {/* Phase Pill Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">CURRENT STAGE:</span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {phase}
          </span>
        </div>
      </div>

      {/* Orbit Visualization Canvas */}
      <OrbitalVisualizer
        destinationId={config.destinationId}
        flightPhase={phase}
        phaseProgress={progress}
        velocityKmS={calculatedVelocity}
        propellantPercent={propellantPercent}
      />

      {/* 2. Simulation Playback Controls Bar */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {phase === 'PRE_LAUNCH' ? (
            <button
              onClick={() => {
                setPhase('ASCENT');
                setIsSimulating(true);
                addLog(`Ignition sequence start. Main booster ignition! Go for launch!`, 'ok');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Flame className="h-4 w-4" />
              INITIATE LAUNCH (T-0)
            </button>
          ) : phase === 'COMPLETED' ? (
            <button
              onClick={finishMission}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Award className="h-4 w-4" />
              VIEW NASA DEBRIEF SCORECARD
            </button>
          ) : (
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isSimulating
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isSimulating ? 'PAUSE TELEMETRY' : 'RESUME TELEMETRY'}
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs hover:bg-white/10 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Flight
          </button>
        </div>

        {/* Speed Multiplier Pill */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs font-mono">
          <span className="text-neutral-400 px-2">WARP:</span>
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                speedMultiplier === s
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Flight Time Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-neutral-500">ELAPSED:</span>{' '}
            <strong className="text-white">{Math.floor(elapsedDays)} Days</strong>
          </div>
          <div>
            <span className="text-neutral-500">STAGE PROGRESS:</span>{' '}
            <strong className="text-cyan-400">{progress.toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      {/* 3. Real-time Telemetry Readout Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* Propellant */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>RCS/MAIN FUEL</span>
            <Flame className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {propellantKg.toFixed(0)} <span className="text-xs font-normal text-neutral-400">kg</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className={`h-full ${propellantPercent > 20 ? 'bg-purple-400' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, propellantPercent))}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            {propellantPercent.toFixed(1)}% remaining
          </span>
        </div>

        {/* Hull Integrity */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>HULL INTEGRITY</span>
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {hullIntegrity}%
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className={`h-full ${hullIntegrity > 60 ? 'bg-emerald-400' : 'bg-amber-500'}`}
              style={{ width: `${hullIntegrity}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            Radiation shields nominal
          </span>
        </div>

        {/* Power Bus */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>POWER BUS</span>
            <BatteryCharging className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {metrics.powerGeneratedW} <span className="text-xs font-normal text-neutral-400">W</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-400"
              style={{ width: `${Math.min(100, (metrics.powerGeneratedW / (metrics.powerConsumedW || 1)) * 50)}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            {safeModeActive ? 'Safe Mode Draw: 60W' : `Active Draw: ${metrics.powerConsumedW}W`}
          </span>
        </div>

        {/* Downlinked Science */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-cyan-300 mb-1">
            <span>SCIENCE DOWNLINK</span>
            <Database className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">
            {scienceTransmittedGb.toFixed(1)} <span className="text-xs font-normal text-cyan-200/60">GB</span>
          </div>
          <div className="w-full bg-cyan-500/20 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-400"
              style={{ width: `${Math.min(100, (scienceTransmittedGb / 150) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-300/70 mt-1 block">
            Deep Space Network connected
          </span>
        </div>
      </div>

      {/* 4. Active Anomaly Modal / Card (if hazard is occurring) */}
      {activeAnomaly && (
        <div className="rounded-3xl border-2 border-red-500/60 bg-red-950/40 p-6 backdrop-blur-2xl shadow-[0_0_40px_rgba(239,68,68,0.25)] animate-pulse-slow">
          <div className="flex items-center gap-3 text-red-400 mb-2 font-mono text-xs uppercase tracking-wider">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <span>FLIGHT DIRECTOR INTERVENTION REQUIRED • {activeAnomaly.severity} SEVERITY</span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">{activeAnomaly.title}</h3>
          <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
            {activeAnomaly.description}
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAnomaly.choices.map((c, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveAnomaly(idx)}
                className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-cyan-400 hover:bg-cyan-950/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-400 font-mono">OPTION {idx + 1}</span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {Math.round(c.successRate * 100)}% Success Rate
                  </span>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300">
                  {c.label}
                </div>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{c.description}</p>
                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                  {c.propellantCostKg > 0 && <span>Fuel Cost: -{c.propellantCostKg}kg</span>}
                  {c.scienceModifier !== 0 && (
                    <span className={c.scienceModifier > 0 ? 'text-cyan-400' : 'text-amber-400'}>
                      Science: {c.scienceModifier > 0 ? `+${c.scienceModifier}` : c.scienceModifier} pts
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Flight Director Commands & Live Terminal Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Flight Director Direct Commands */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Flight Control Commands
          </h3>

          <button
            onClick={toggleSafeMode}
            className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
              safeModeActive
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              {safeModeActive ? 'Disable Safe Mode' : 'Enter Autonomous Safe Mode'}
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          </button>

          <button
            onClick={executeTrimBurn}
            className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-300 flex items-center justify-between text-xs font-mono transition-all hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-purple-400" />
              Execute Mid-Course RCS Burn (-25kg)
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          </button>

          <button
            onClick={() => {
              setScienceTransmittedGb((s) => s + 15);
              addLog('COMMAND SENT: Telemetry burst downlinked via NASA Deep Space Network. +15 GB.', 'ok');
            }}
            className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-300 flex items-center justify-between text-xs font-mono transition-all hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              Dump Science Buffer to DSN
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          </button>
        </div>

        {/* Right 2 Columns: Live Mission Control Log */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs backdrop-blur-xl flex flex-col h-[260px]">
          <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-white/10 mb-2">
            <span className="flex items-center gap-2 text-cyan-400 font-bold">
              <Terminal className="h-4 w-4" /> NASA Mission Control Event Stream
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <Activity className="h-3 w-3 animate-spin" /> LIVE DSN FEED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
            {flightLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className="text-neutral-500 shrink-0">{log.time}</span>
                <span
                  className={
                    log.type === 'alert'
                      ? 'text-red-400 font-bold'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : log.type === 'ok'
                      ? 'text-emerald-400'
                      : 'text-neutral-300'
                  }
                >
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

