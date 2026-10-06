import React from 'react';
import {
  SpacecraftConfiguration,
  MissionEngineeringMetrics,
} from '../types/mission';
import {
  LAUNCH_VEHICLES,
  POWER_SYSTEMS,
  PROPULSION_SYSTEMS,
  COMMS_SYSTEMS,
  SCIENCE_INSTRUMENTS,
} from '../data/subsystems';
import { DESTINATIONS } from '../data/destinations';
import {
  Rocket,
  Zap,
  Flame,
  Radio,
  Microscope,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

interface SpacecraftConfiguratorProps {
  config: SpacecraftConfiguration;
  onChangeConfig: (newConfig: SpacecraftConfiguration) => void;
  metrics: MissionEngineeringMetrics;
}

export const SpacecraftConfigurator: React.FC<SpacecraftConfiguratorProps> = ({
  config,
  onChangeConfig,
  metrics,
}) => {
  const dest = DESTINATIONS[config.destinationId];
  const activePropulsion = PROPULSION_SYSTEMS.find((p) => p.id === config.propulsionSystemId) || PROPULSION_SYSTEMS[1];

  const handleInstrumentToggle = (instId: string) => {
    const exists = config.selectedInstrumentIds.includes(instId);
    let updated: string[];
    if (exists) {
      updated = config.selectedInstrumentIds.filter((id) => id !== instId);
    } else {
      updated = [...config.selectedInstrumentIds, instId];
    }
    onChangeConfig({
      ...config,
      selectedInstrumentIds: updated,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header with Status Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            2. Spacecraft Engineering Blueprint & Trade-off Matrix
          </h2>
          <p className="text-sm text-neutral-400">
            Configure mass, power, delta-V, and scientific payload to satisfy NASA mission requirements.
          </p>
        </div>

        {/* Validation Status Badge */}
        <div className="flex items-center gap-3">
          {metrics.validationErrors.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <CheckCircle className="h-4 w-4" />
              FLIGHT READY — ALL MARGINS NOMINAL
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
              <XCircle className="h-4 w-4" />
              {metrics.validationErrors.length} CRITICAL DEFICIT(S) DETECTED
            </div>
          )}
        </div>
      </div>

      {/* 2. Real-time Engineering Telemetry Bento Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Mass Gauge */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono">WET MASS</span>
            <Rocket className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {metrics.totalWetMassKg.toFixed(0)} <span className="text-xs font-normal text-neutral-400">kg</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full ${metrics.massMarginKg >= 0 ? 'bg-cyan-400' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, metrics.massCapacityRatio * 100))}%` }}
            />
          </div>
          <span className={`text-[10px] font-mono mt-1 block ${metrics.massMarginKg >= 0 ? 'text-neutral-400' : 'text-red-400 font-bold'}`}>
            Margin: {metrics.massMarginKg.toFixed(0)} kg
          </span>
        </div>

        {/* Delta-V Gauge */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono">DELTA-V ($\Delta v$)</span>
            <Flame className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {metrics.deltaVAvailableKmS.toFixed(2)} <span className="text-xs font-normal text-neutral-400">km/s</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full ${metrics.deltaVSufficient ? 'bg-purple-400' : 'bg-red-500'}`}
              style={{
                width: `${Math.min(100, (metrics.deltaVAvailableKmS / metrics.deltaVRequiredKmS) * 100)}%`,
              }}
            />
          </div>
          <span className={`text-[10px] font-mono mt-1 block ${metrics.deltaVSufficient ? 'text-emerald-400' : 'text-red-400 font-bold'}`}>
            Req: {metrics.deltaVRequiredKmS.toFixed(1)} km/s ({metrics.deltaVMarginKmS >= 0 ? `+${metrics.deltaVMarginKmS.toFixed(2)}` : metrics.deltaVMarginKmS.toFixed(2)})
          </span>
        </div>

        {/* Power Balance Gauge */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono">POWER BALANCE</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {metrics.powerGeneratedW} <span className="text-xs font-normal text-neutral-400">W</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full ${metrics.powerSufficient ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{
                width: `${Math.min(100, metrics.powerConsumedW > 0 ? (metrics.powerGeneratedW / (metrics.powerConsumedW * 1.5)) * 100 : 100)}%`,
              }}
            />
          </div>
          <span className={`text-[10px] font-mono mt-1 block ${metrics.powerSufficient ? 'text-neutral-400' : 'text-red-400 font-bold'}`}>
            Draw: {metrics.powerConsumedW}W ({metrics.netPowerMarginW >= 0 ? `+${metrics.netPowerMarginW}W` : `${metrics.netPowerMarginW}W`})
          </span>
        </div>

        {/* Cost Budget Gauge */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono">MISSION BUDGET</span>
            <span className="text-emerald-400 font-mono text-xs">$</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${metrics.totalCostM}M
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full ${metrics.budgetWithinLimit ? 'bg-emerald-400' : 'bg-red-500'}`}
              style={{
                width: `${Math.min(100, (metrics.totalCostM / metrics.budgetCapM) * 100)}%`,
              }}
            />
          </div>
          <span className={`text-[10px] font-mono mt-1 block ${metrics.budgetWithinLimit ? 'text-emerald-400' : 'text-red-400 font-bold'}`}>
            Cap: ${metrics.budgetCapM}M ({metrics.budgetMarginM >= 0 ? `+$${metrics.budgetMarginM}M` : `-$${Math.abs(metrics.budgetMarginM)}M`})
          </span>
        </div>

        {/* Science Score */}
        <div className="col-span-2 md:col-span-1 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-cyan-300 mb-1">
            <span className="font-mono">SCIENCE RETURN</span>
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-1">
            {metrics.totalScienceValue} <span className="text-xs font-normal text-cyan-200/60">pts</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 mt-3 block">
            Reliability: {metrics.reliabilityRating}% nominal
          </span>
        </div>
      </div>

      {/* 3. Validation Warnings & Alert Banners */}
      {(metrics.validationErrors.length > 0 || metrics.validationWarnings.length > 0) && (
        <div className="space-y-2">
          {metrics.validationErrors.map((err, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-200"
            >
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-300 font-semibold uppercase font-mono tracking-wide">
                  Critical Engineering Error:
                </strong>{' '}
                {err}
              </div>
            </div>
          ))}

          {metrics.validationWarnings.map((warn, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold uppercase font-mono tracking-wide">
                  Engineering Advisory:
                </strong>{' '}
                {warn}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Subsystems Configurator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Launch Vehicle & Power */}
        <div className="space-y-6">
          {/* Subsystem 1: Launch Vehicle */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-cyan-400" />
              Launch Vehicle Tier
            </h3>
            <div className="space-y-2.5">
              {LAUNCH_VEHICLES.map((lv) => (
                <label
                  key={lv.id}
                  className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    config.launchVehicleId === lv.id
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-white/5 hover:border-white/15 bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="launchVehicle"
                      checked={config.launchVehicleId === lv.id}
                      onChange={() => onChangeConfig({ ...config, launchVehicleId: lv.id })}
                      className="mt-1 accent-cyan-400"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{lv.name}</div>
                      <div className="text-xs text-neutral-400">{lv.description}</div>
                      <div className="text-[11px] font-mono text-cyan-400 mt-1">
                        Payload LEO: {lv.payloadCapacityLEOKg} kg • Reliability: {lv.reliabilityPercent}%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-400 shrink-0 ml-2">
                    ${lv.costM}M
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Subsystem 2: Power Subsystem */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              Power Subsystem Architecture
            </h3>
            <div className="space-y-2.5">
              {POWER_SYSTEMS.map((ps) => {
                const outputAtTarget = ps.solarDependent
                  ? Math.round(ps.basePowerOutputW * (dest.solarFluxWm2 / 1361))
                  : ps.basePowerOutputW;

                return (
                  <label
                    key={ps.id}
                    className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.powerSystemId === ps.id
                        ? 'border-amber-400 bg-amber-950/20'
                        : 'border-white/5 hover:border-white/15 bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="powerSystem"
                        checked={config.powerSystemId === ps.id}
                        onChange={() => onChangeConfig({ ...config, powerSystemId: ps.id })}
                        className="mt-1 accent-amber-400"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{ps.name}</div>
                        <div className="text-xs text-neutral-400">{ps.description}</div>
                        <div className="text-[11px] font-mono text-amber-400 mt-1">
                          Output at target: {outputAtTarget}W • Mass: {ps.massKg}kg • Lifespan: {ps.lifespanYears} yrs
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-400 shrink-0 ml-2">
                      ${ps.costM}M
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Propulsion & Comms */}
        <div className="space-y-6">
          {/* Subsystem 3: Propulsion & Propellant Loading */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-purple-400" />
              Propulsion & Tsiolkovsky Engine
            </h3>
            <div className="space-y-2.5">
              {PROPULSION_SYSTEMS.map((prop) => (
                <label
                  key={prop.id}
                  className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    config.propulsionSystemId === prop.id
                      ? 'border-purple-400 bg-purple-950/20'
                      : 'border-white/5 hover:border-white/15 bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="propulsionSystem"
                      checked={config.propulsionSystemId === prop.id}
                      onChange={() => {
                        const newLoad = Math.min(config.propellantLoadKg, prop.fuelCapacityMaxKg);
                        onChangeConfig({
                          ...config,
                          propulsionSystemId: prop.id,
                          propellantLoadKg: newLoad,
                        });
                      }}
                      className="mt-1 accent-purple-400"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{prop.name}</div>
                      <div className="text-xs text-neutral-400">{prop.description}</div>
                      <div className="text-[11px] font-mono text-purple-400 mt-1">
                        Specific Impulse ($I_{'{sp}'}$): {prop.ispSec}s • Dry Mass: {prop.dryMassKg}kg • Active Draw: {prop.powerDrawActiveW}W
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-400 shrink-0 ml-2">
                    ${prop.costM}M
                  </div>
                </label>
              ))}
            </div>

            {/* Propellant Mass Slider */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-neutral-400">Propellant Load ($m_p$):</span>
                <span className="text-white font-bold">{config.propellantLoadKg} kg / {activePropulsion.fuelCapacityMaxKg} kg</span>
              </div>
              <input
                type="range"
                min={200}
                max={activePropulsion.fuelCapacityMaxKg}
                step={50}
                value={config.propellantLoadKg}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    propellantLoadKg: Number(e.target.value),
                  })
                }
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                <span>Minimum 200 kg</span>
                <span>Max Tank {activePropulsion.fuelCapacityMaxKg} kg</span>
              </div>
            </div>
          </div>

          {/* Subsystem 4: Communications */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 mb-3">
              <Radio className="h-4 w-4 text-cyan-400" />
              Telemetry & Comms Link Budget
            </h3>
            <div className="space-y-2.5">
              {COMMS_SYSTEMS.map((cs) => {
                const canReach = cs.rangeLimitAU >= dest.distanceAU;
                return (
                  <label
                    key={cs.id}
                    className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      config.commsSystemId === cs.id
                        ? 'border-cyan-400 bg-cyan-950/20'
                        : 'border-white/5 hover:border-white/15 bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="commsSystem"
                        checked={config.commsSystemId === cs.id}
                        onChange={() => onChangeConfig({ ...config, commsSystemId: cs.id })}
                        className="mt-1 accent-cyan-400"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          {cs.name}
                          {!canReach && (
                            <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                              Out of range
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400">{cs.description}</div>
                        <div className="text-[11px] font-mono text-cyan-400 mt-1">
                          Downlink: {cs.maxBitrateKbps} kbps • Max Range: {cs.rangeLimitAU} AU • Power: {cs.powerDrawW}W
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-400 shrink-0 ml-2">
                      ${cs.costM}M
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Scientific Instrument Payload Selection */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Microscope className="h-4 w-4 text-cyan-400" />
              Scientific Instrument Payload Configuration
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select discovery payloads. Instruments matching primary destination science targets gain +35% synergy bonus points.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            {config.selectedInstrumentIds.length} Installed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCIENCE_INSTRUMENTS.map((inst) => {
            const isSelected = config.selectedInstrumentIds.includes(inst.id);
            const hasBonus = inst.bonusDestinations?.includes(dest.id);
            const calculatedPoints = hasBonus ? Math.round(inst.sciencePoints * 1.35) : inst.sciencePoints;

            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => handleInstrumentToggle(inst.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-white/5 hover:border-white/15 bg-white/[0.01]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    {inst.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasBonus && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Target Bonus +35%
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${inst.costM}M
                    </span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-white">{inst.name}</div>
                <div className="text-xs text-neutral-400 mt-1 line-clamp-2">{inst.description}</div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">
                    {inst.massKg}kg • {inst.powerDrawW}W
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-neutral-300'}`}>
                    +{calculatedPoints} Science Pts
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

