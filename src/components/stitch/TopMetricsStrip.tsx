import React from 'react';
import { Destination, MissionEngineeringMetrics } from '../../types/mission';

interface TopMetricsStripProps {
  destination: Destination;
  metrics: MissionEngineeringMetrics;
}

export const TopMetricsStrip: React.FC<TopMetricsStripProps> = ({
  destination,
  metrics,
}) => {
  const isC3Optimal = metrics.deltaVSufficient;
  const deltaVReservePercent = Math.min(
    100,
    Math.round((metrics.deltaVAvailableKmS / metrics.deltaVRequiredKmS) * 100)
  );

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-space-sm w-full">
      {/* 1. Trajectory Regime */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-low shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-dim">
          <span className="font-mono text-[10px] uppercase">Trajectory</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
        </div>
        <div className="mt-space-xs font-mono text-sm text-primary font-medium tracking-wide">
          {destination.id === 'moon' ? 'CISLUNAR TLI' : destination.id === 'mars' ? 'HELIOCENTRIC' : 'JOVIAN FLYBY'}
        </div>
        <div className="text-xs text-on-surface-variant flex items-center justify-between">
          <span>Target</span>
          <span className="font-mono text-[11px] text-text-bright font-medium">{destination.name.split('—')[0]}</span>
        </div>
      </div>

      {/* 2. C3 Energy */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-low shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-dim">
          <span className="font-mono text-[10px] uppercase">C3 Injection</span>
          <span className={`font-mono text-[10px] font-semibold ${isC3Optimal ? 'text-telemetry-cyan' : 'text-status-warning'}`}>
            {isC3Optimal ? 'OPTIMAL' : 'DEFICIT'}
          </span>
        </div>
        <div className="mt-space-xs font-mono text-sm text-text-bright font-medium tracking-wide">
          {(destination.deltaVRequired * 2.6).toFixed(1)}{' '}
          <span className="font-mono text-[10px] text-text-dim">KM²/S²</span>
        </div>
        <div className="text-xs text-on-surface-variant flex items-center justify-between">
          <span>Margin</span>
          <span className="font-mono text-[11px] text-primary-fixed">
            {metrics.deltaVMarginKmS >= 0 ? `+${metrics.deltaVMarginKmS.toFixed(2)} km/s` : `${metrics.deltaVMarginKmS.toFixed(2)} km/s`}
          </span>
        </div>
      </div>

      {/* 3. Mass Margin */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-low shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-dim">
          <span className="font-mono text-[10px] uppercase">Mass Reserve</span>
          <span className="material-symbols-outlined text-[14px] text-primary-container">balance</span>
        </div>
        <div className="mt-space-xs font-mono text-sm text-text-bright font-medium tracking-wide">
          {metrics.massMarginKg >= 0 ? `+${metrics.massMarginKg.toFixed(0)}` : metrics.massMarginKg.toFixed(0)}{' '}
          <span className="font-mono text-[10px] text-text-dim">KG</span>
        </div>
        <div className="text-xs text-on-surface-variant flex items-center justify-between">
          <span>Dry Mass</span>
          <span className="font-mono text-[11px] text-text-bright">{metrics.dryMassKg.toFixed(0)} kg</span>
        </div>
      </div>

      {/* 4. Tsiolkovsky Reserve */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-low shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-dim">
          <span className="font-mono text-[10px] uppercase">Delta-V</span>
          <span className={`font-mono text-[10px] font-semibold ${metrics.deltaVSufficient ? 'text-telemetry-cyan' : 'text-status-warning'}`}>
            {deltaVReservePercent}%
          </span>
        </div>
        <div className="mt-space-xs font-mono text-sm text-text-bright font-medium tracking-wide">
          {metrics.deltaVAvailableKmS.toFixed(2)}{' '}
          <span className="font-mono text-[10px] text-text-dim">KM/S</span>
        </div>
        <div className="text-xs text-on-surface-variant flex items-center justify-between">
          <span>Required</span>
          <span className="font-mono text-[11px] text-text-bright">{metrics.deltaVRequiredKmS.toFixed(1)} km/s</span>
        </div>
      </div>

      {/* 5. Power Surplus */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-low shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-dim">
          <span className="font-mono text-[10px] uppercase">Power Bus</span>
          <span className="material-symbols-outlined text-[14px] text-secondary">bolt</span>
        </div>
        <div className="mt-space-xs font-mono text-sm text-text-bright font-medium tracking-wide">
          {metrics.netPowerMarginW >= 0 ? `+${metrics.netPowerMarginW}` : metrics.netPowerMarginW}{' '}
          <span className="font-mono text-[10px] text-text-dim">WATTS</span>
        </div>
        <div className="text-xs text-on-surface-variant flex items-center justify-between">
          <span>Generation</span>
          <span className="font-mono text-[11px] text-primary">{metrics.powerGeneratedW}W</span>
        </div>
      </div>

      {/* 6. Cost Cap */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-low shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-dim">
          <span className="font-mono text-[10px] uppercase">NASA Budget</span>
          <span className="font-mono text-[10px] text-on-surface-variant">${metrics.budgetCapM}M</span>
        </div>
        <div className="mt-space-xs font-mono text-sm text-text-bright font-medium tracking-wide">
          ${metrics.totalCostM}{' '}
          <span className="font-mono text-[10px] text-text-dim">M</span>
        </div>
        <div className="text-xs text-on-surface-variant flex items-center justify-between">
          <span>Status</span>
          <span className={`font-mono text-[11px] font-semibold ${metrics.budgetWithinLimit ? 'text-telemetry-cyan' : 'text-status-warning'}`}>
            {metrics.budgetWithinLimit ? `+$${metrics.budgetMarginM}M Safe` : `-$${Math.abs(metrics.budgetMarginM)}M`}
          </span>
        </div>
      </div>
    </section>
  );
};
