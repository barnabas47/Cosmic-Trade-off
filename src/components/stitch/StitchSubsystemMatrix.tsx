import React from 'react';
import {
  SpacecraftConfiguration,
  MissionEngineeringMetrics,
  Destination,
} from '../../types/mission';
import {
  LAUNCH_VEHICLES,
  POWER_SYSTEMS,
  PROPULSION_SYSTEMS,
  COMMS_SYSTEMS,
  SCIENCE_INSTRUMENTS,
} from '../../data/subsystems';
import { SubsystemDetailInfo } from './SubsystemDetailDrawer';
import { sfx } from '../../utils/audio';

interface StitchSubsystemMatrixProps {
  config: SpacecraftConfiguration;
  onChangeConfig: (newConfig: SpacecraftConfiguration) => void;
  metrics: MissionEngineeringMetrics;
  destination: Destination;
  onExecuteBurn: () => void;
  onInspect: (info: SubsystemDetailInfo) => void;
}

export const StitchSubsystemMatrix: React.FC<StitchSubsystemMatrixProps> = ({
  config,
  onChangeConfig,
  metrics,
  destination,
  onExecuteBurn,
  onInspect,
}) => {
  const activePropulsion =
    PROPULSION_SYSTEMS.find((p) => p.id === config.propulsionSystemId) || PROPULSION_SYSTEMS[1];

  const handleInstrumentToggle = (instId: string) => {
    sfx.playClick();
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

  // Inspect Launch Vehicle helper
  const inspectLaunchVehicle = (lv: (typeof LAUNCH_VEHICLES)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    onInspect({
      title: lv.name,
      category: 'Launch Vehicle & Booster',
      costM: lv.costM,
      specs: [
        { label: 'LEO Payload Capacity', value: `${lv.payloadCapacityLEOKg} kg` },
        { label: 'GTO Payload Capacity', value: `${lv.payloadCapacityGTOKg} kg` },
        { label: 'Fairing Diameter', value: `${lv.fairingDiameterM} m` },
        { label: 'Fleet Reliability', value: `${lv.reliabilityPercent}%` },
      ],
      physicsRationale:
        'Hohmann and interplanetary injection velocity requires maximum payload fairing acoustic dampening and high staging thrust to satisfy C3 orbital escape energy.',
      nasaPrecedent: `${lv.provider} interplanetary flight certification (Class-A flagship payload standard).`,
      trlLevel: 9,
    });
  };

  // Inspect Power Subsystem helper
  const inspectPowerSystem = (ps: (typeof POWER_SYSTEMS)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    const outputAtTarget = ps.solarDependent
      ? Math.round(ps.basePowerOutputW * (destination.solarFluxWm2 / 1361))
      : ps.basePowerOutputW;
    onInspect({
      title: ps.name,
      category: 'Spacecraft Electrical Power System',
      costM: ps.costM,
      massKg: ps.massKg,
      powerW: outputAtTarget,
      specs: [
        { label: 'Technology', value: ps.technology.toUpperCase() },
        { label: 'Base Earth Output (1 AU)', value: `${ps.basePowerOutputW} W` },
        { label: 'Target Output', value: `${outputAtTarget} W` },
        { label: 'Design Lifespan', value: `${ps.lifespanYears} years` },
      ],
      physicsRationale: ps.solarDependent
        ? `Solar irradiance degrades proportionally to the inverse-square of distance: F(r) = 1361 / r² W/m². At ${destination.distanceAU} AU, solar panels generate only ${outputAtTarget}W.`
        : 'Plutonium-238 radioisotope thermoelectric generator generates constant decay heat converted to electricity via SiGe thermopiles, immune to planetary distance or eclipse.',
      nasaPrecedent: ps.solarDependent
        ? 'Juno spacecraft (solar Jovian orbit), Dawn probe (asteroid belt).'
        : 'Cassini-Huygens, Voyager 1 & 2, New Horizons Pluto flyby, Perseverance Rover.',
      trlLevel: 9,
    });
  };

  // Inspect Propulsion helper
  const inspectPropulsion = (prop: (typeof PROPULSION_SYSTEMS)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    onInspect({
      title: prop.name,
      category: 'Reaction Control & Primary Propulsion',
      costM: prop.costM,
      massKg: prop.dryMassKg,
      powerW: prop.powerDrawActiveW,
      specs: [
        { label: 'Specific Impulse (Isp)', value: `${prop.ispSec} seconds` },
        { label: 'Thrust Mechanism', value: prop.type === 'hall_ion' ? 'Electrostatic Ion Acceleration' : 'Chemical Exothermic Combustion' },
        { label: 'Max Tank Fuel Capacity', value: `${prop.fuelCapacityMaxKg} kg` },
        { label: 'Electrical Draw', value: `${prop.powerDrawActiveW} W` },
      ],
      physicsRationale:
        'Tsiolkovsky Rocket Equation governs velocity gain: Δv = Isp · g₀ · ln(m₀ / mf). High specific impulse drastically reduces required propellant mass for identical mission velocity.',
      nasaPrecedent: prop.type === 'hall_ion'
        ? 'Deep Space 1, Dawn (Ceres & Vesta orbiter), Psyche asteroid mission.'
        : 'Galileo, Cassini main engine, Mars Reconnaissance Orbiter.',
      trlLevel: prop.type === 'hall_ion' ? 8 : 9,
    });
  };

  // Inspect Instrument helper
  const inspectInstrument = (inst: (typeof SCIENCE_INSTRUMENTS)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playClick();
    onInspect({
      title: inst.name,
      category: `Scientific Instrument (${inst.category.toUpperCase()})`,
      costM: inst.costM,
      massKg: inst.massKg,
      powerW: inst.powerDrawW,
      specs: [
        { label: 'Primary Scientific Value', value: `${inst.sciencePoints} Discovery Points` },
        { label: 'Power Consumption', value: `${inst.powerDrawW} W` },
        { label: 'Dry Mass', value: `${inst.massKg} kg` },
      ],
      physicsRationale: inst.description,
      nasaPrecedent: 'Europa Clipper payload suite, Mars 2020 science instruments, Cassini radar sounder.',
      trlLevel: 7,
    });
  };

  // Cost breakdown
  const launchCost = LAUNCH_VEHICLES.find((lv) => lv.id === config.launchVehicleId)?.costM || 65;
  const powerCost = POWER_SYSTEMS.find((ps) => ps.id === config.powerSystemId)?.costM || 95;
  const propCost = activePropulsion.costM || 32;
  const instrumentsCost = SCIENCE_INSTRUMENTS.filter((i) =>
    config.selectedInstrumentIds.includes(i.id)
  ).reduce((acc, i) => acc + i.costM, 0);

  const totalSpent = metrics.totalCostM;
  const launchPct = Math.round((launchCost / totalSpent) * 100);
  const instPct = Math.round((instrumentsCost / totalSpent) * 100);
  const propPct = Math.round((propCost / totalSpent) * 100);
  const powerPct = Math.round((powerCost / totalSpent) * 100);

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-surface-container rounded-lg shadow-xl p-3 overflow-hidden select-none">
      {/* Module Header */}
      <div className="flex items-center justify-between pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-telemetry-cyan shadow-[0_0_8px_#00f2fe]" />
          <span className="font-headline text-base text-text-bright font-semibold">
            Subsystem Matrix
          </span>
          <span className="text-xs text-text-dim">• Configuration</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high font-mono text-xs text-primary font-semibold">
          STAGE 1/4
        </span>
      </div>

      {/* Scrollable Subsystem Selection Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1.5">
        {/* 1. LAUNCH VEHICLE */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-dim uppercase tracking-wider">
              1. Launch Vehicle
            </span>
            <span className="font-mono text-xs text-telemetry-cyan">
              C3: 16.5 km²/s²
            </span>
          </div>

          <div className="grid grid-cols-3 gap-space-xs">
            {LAUNCH_VEHICLES.map((lv) => {
              const isSelected = config.launchVehicleId === lv.id;
              const isOverweight = metrics.totalWetMassKg > lv.payloadCapacityLEOKg;

              return (
                <div
                  key={lv.id}
                  onClick={() => {
                    sfx.playClick();
                    onChangeConfig({ ...config, launchVehicleId: lv.id });
                  }}
                  className={`p-space-sm rounded-DEFAULT text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[10px] uppercase ${isSelected ? 'text-on-primary-fixed-variant font-semibold' : 'text-text-dim'}`}>
                      ${lv.costM}M
                    </span>
                    <button
                      onClick={(e) => inspectLaunchVehicle(lv, e)}
                      className={`text-[11px] font-mono px-1 rounded hover:bg-white/20 ${isSelected ? 'text-on-primary-fixed' : 'text-text-dim'}`}
                      title="Inspect technical specifications"
                    >
                      ⓘ
                    </button>
                  </div>
                  <div className={`font-headline text-xs font-semibold mt-0.5 ${isSelected ? 'text-on-primary-fixed' : 'text-on-surface'}`}>
                    {lv.name.split('(')[0].trim()}
                  </div>
                  <div className={`font-mono text-[10px] mt-1 ${
                    isSelected
                      ? 'text-on-primary-fixed-variant font-bold'
                      : isOverweight
                      ? 'text-status-warning'
                      : 'text-telemetry-azure'
                  }`}>
                    {isOverweight ? `Deficit -${(metrics.totalWetMassKg - lv.payloadCapacityLEOKg).toFixed(0)}kg` : `+${(lv.payloadCapacityLEOKg - metrics.totalWetMassKg).toFixed(0)}kg`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. POWER GENERATION */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-dim uppercase tracking-wider">
              2. Power Architecture
            </span>
            <span className="font-mono text-xs text-primary">
              BUS: {metrics.powerConsumedW}W
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            {POWER_SYSTEMS.slice(0, 2).map((ps) => {
              const isSelected = config.powerSystemId === ps.id;
              const outputAtDest = ps.solarDependent
                ? Math.round(ps.basePowerOutputW * (destination.solarFluxWm2 / 1361))
                : ps.basePowerOutputW;
              const margin = outputAtDest - metrics.powerConsumedW;

              return (
                <div
                  key={ps.id}
                  onClick={() => {
                    sfx.playClick();
                    onChangeConfig({ ...config, powerSystemId: ps.id });
                  }}
                  className={`p-space-sm rounded-DEFAULT text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-headline text-xs font-semibold ${isSelected ? 'text-on-primary-fixed' : 'text-on-surface'}`}>
                      {ps.name.split(' ')[0]} {ps.technology.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => inspectPowerSystem(ps, e)}
                      className={`text-[11px] font-mono px-1 rounded hover:bg-white/20 ${isSelected ? 'text-on-primary-fixed' : 'text-text-dim'}`}
                      title="Inspect physics rationale"
                    >
                      ⓘ
                    </button>
                  </div>
                  <div className={`font-mono text-[10px] mt-1 ${
                    isSelected
                      ? 'text-on-primary-fixed-variant font-bold'
                      : margin >= 0
                      ? 'text-telemetry-cyan'
                      : 'text-status-warning'
                  }`}>
                    {margin >= 0 ? `+${margin}W Net` : `${margin}W Deficit`} • ${ps.costM}M
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PROPULSION & PROPELLANT */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-dim uppercase tracking-wider">
              3. Propulsion System
            </span>
            <span className="font-mono text-xs text-telemetry-cyan">
              Isp: {activePropulsion.ispSec}s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            {PROPULSION_SYSTEMS.slice(1, 3).map((prop) => {
              const isSelected = config.propulsionSystemId === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    sfx.playClick();
                    const newLoad = Math.min(config.propellantLoadKg, prop.fuelCapacityMaxKg);
                    onChangeConfig({
                      ...config,
                      propulsionSystemId: prop.id,
                      propellantLoadKg: newLoad,
                    });
                  }}
                  className={`p-space-sm rounded-DEFAULT text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-headline text-xs font-semibold ${isSelected ? 'text-on-primary-fixed' : 'text-on-surface'}`}>
                      {prop.name.split('(')[0].trim()}
                    </span>
                    <button
                      onClick={(e) => inspectPropulsion(prop, e)}
                      className={`text-[11px] font-mono px-1 rounded hover:bg-white/20 ${isSelected ? 'text-on-primary-fixed' : 'text-text-dim'}`}
                      title="Inspect propulsion specs"
                    >
                      ⓘ
                    </button>
                  </div>
                  <div className={`font-mono text-[10px] mt-1 ${isSelected ? 'text-on-primary-fixed-variant font-bold' : 'text-telemetry-azure'}`}>
                    Isp {prop.ispSec}s • ${prop.costM}M
                  </div>
                </div>
              );
            })}
          </div>

          {/* Propellant Loading Slider */}
          <div className="p-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col gap-space-xs mt-1">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-dim uppercase">Fuel Loading</span>
              <span className="text-telemetry-cyan font-semibold">
                {config.propellantLoadKg} kg / {activePropulsion.fuelCapacityMaxKg} kg
              </span>
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
              className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1 cursor-pointer"
            />
          </div>
        </div>

        {/* 4. COMM TELEMETRY */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-dim uppercase tracking-wider">
              4. Deep Space Comms
            </span>
            <span className="font-mono text-xs text-telemetry-azure">
              {COMMS_SYSTEMS.find((c) => c.id === config.commsSystemId)?.band || 'X/Ka'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-space-xs">
            {COMMS_SYSTEMS.map((cs) => {
              const isSelected = config.commsSystemId === cs.id;
              const canReach = cs.rangeLimitAU >= destination.distanceAU;

              return (
                <button
                  key={cs.id}
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    onChangeConfig({ ...config, commsSystemId: cs.id });
                  }}
                  className={`p-space-sm rounded-DEFAULT text-left transition-all ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <div className={`font-headline text-xs font-semibold ${isSelected ? 'text-on-primary-fixed' : 'text-on-surface'}`}>
                    {cs.name.split('(')[0].trim()}
                  </div>
                  <div className={`font-mono text-[10px] mt-1 ${
                    isSelected
                      ? 'text-on-primary-fixed-variant font-bold'
                      : !canReach
                      ? 'text-status-warning'
                      : 'text-text-dim'
                  }`}>
                    {cs.maxBitrateKbps > 1000 ? `${(cs.maxBitrateKbps / 1000).toFixed(0)} Mbps` : `${cs.maxBitrateKbps}k`} • ${cs.costM}M
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. SCIENCE PAYLOAD */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-dim uppercase tracking-wider">
              5. Science Payload
            </span>
            <span className="font-mono text-xs text-secondary font-semibold">
              SCORE: {metrics.totalScienceValue} PTS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            {SCIENCE_INSTRUMENTS.map((inst) => {
              const isSelected = config.selectedInstrumentIds.includes(inst.id);
              return (
                <div
                  key={inst.id}
                  onClick={() => handleInstrumentToggle(inst.id)}
                  className={`p-space-sm rounded-DEFAULT flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-surface-container-high'
                      : 'bg-surface-container-low opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex-1 mr-2">
                    <div className="flex items-center justify-between">
                      <span className="font-headline text-xs text-text-bright font-medium line-clamp-1">
                        {inst.name.split('(')[0].trim()}
                      </span>
                      <button
                        onClick={(e) => inspectInstrument(inst, e)}
                        className="text-[10px] font-mono px-1 rounded hover:bg-white/20 text-text-dim"
                        title="Inspect instrument details"
                      >
                        ⓘ
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-text-dim">
                      {inst.massKg}kg • +{inst.sciencePoints}pts
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[16px] shrink-0 ${
                      isSelected ? 'text-primary-container' : 'text-text-dim'
                    }`}
                  >
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ALLOCATION PROGRESS BAR */}
        <div className="p-space-md rounded-DEFAULT bg-surface-container-low flex flex-col gap-space-xs mt-space-xs">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-dim uppercase">Allocation</span>
            <span className="text-text-bright">
              ${metrics.totalCostM}M / ${metrics.budgetCapM}M NASA Cap
            </span>
          </div>

          <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden flex">
            <div className="bg-primary-container h-full" style={{ width: `${Math.min(40, launchPct)}%` }} />
            <div className="bg-telemetry-azure h-full" style={{ width: `${Math.min(30, instPct)}%` }} />
            <div className="bg-aurora-violet h-full" style={{ width: `${Math.min(25, propPct)}%` }} />
            <div className="bg-secondary-fixed h-full" style={{ width: `${Math.min(20, powerPct)}%` }} />
            <div className="bg-surface-bright h-full flex-1" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-text-dim uppercase mt-1">
            <span>Launch {launchPct}%</span>
            <span>Payload {instPct}%</span>
            <span>Prop {propPct}%</span>
            <span>Power {powerPct}%</span>
            <span className={metrics.budgetWithinLimit ? 'text-primary font-semibold' : 'text-status-warning font-semibold'}>
              {metrics.budgetWithinLimit ? `+$${metrics.budgetMarginM}M Safe` : `-$${Math.abs(metrics.budgetMarginM)}M`}
            </span>
          </div>
        </div>
      </div>

      {/* STATUS BANNER & EXECUTION TRIGGER (Pinned at bottom) */}
      <div className="pt-2 mt-2 border-t border-white/5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              metrics.validationErrors.length === 0
                ? 'bg-primary-container shadow-[0_0_12px_#00f2fe]'
                : 'bg-status-warning shadow-[0_0_12px_#c86a50]'
            }`}
          />
          <div>
            <div
              className={`font-mono text-xs font-bold tracking-wider ${
                metrics.validationErrors.length === 0
                  ? 'text-telemetry-cyan'
                  : 'text-status-warning'
              }`}
            >
              {metrics.validationErrors.length === 0
                ? 'ALL MARGINS NOMINAL • TRL-9'
                : `${metrics.validationErrors.length} DEFICITS`}
            </div>
            <div className="text-[11px] text-text-dim">
              {metrics.validationErrors.length === 0
                ? 'Ready for Trans-Planetary Injection'
                : metrics.validationErrors[0]}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sfx.playIgnition();
            onExecuteBurn();
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-full bg-gradient-to-r from-primary-container to-telemetry-azure text-on-primary-container font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_24px_rgba(0,242,254,0.35)] hover:shadow-[0_0_36px_rgba(0,242,254,0.6)] hover:scale-[1.02] active:scale-95 transition-all"
        >
          Execute Trajectory Burn
        </button>
      </div>
    </div>
  );
};
