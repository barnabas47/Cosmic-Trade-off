import React from 'react';
import { Destination, MissionEngineeringMetrics } from '../../types/mission';

interface CompactTelemetryTickerProps {
  destination: Destination;
  metrics: MissionEngineeringMetrics;
}

export const CompactTelemetryTicker: React.FC<CompactTelemetryTickerProps> = ({
  destination,
  metrics,
}) => {
  // Live Grade
  let score = 50;
  if (metrics.deltaVSufficient) score += 20;
  if (metrics.powerSufficient) score += 15;
  if (metrics.budgetWithinLimit) score += 15;
  score = Math.min(100, Math.max(10, score));

  let grade = 'B';
  if (score >= 90 && metrics.validationErrors.length === 0) grade = 'A+';
  else if (score >= 80 && metrics.validationErrors.length === 0) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'F';

  return (
    <div className="h-9 w-full bg-surface-container-low px-4 flex items-center justify-between gap-3 text-xs font-mono shrink-0 shadow-sm overflow-x-auto select-none">
      {/* Target Destination & Grade */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
        <span className="text-text-dim text-[11px] uppercase">TARGET:</span>
        <span className="text-text-bright font-bold">{destination.name.split('—')[0]}</span>
        <span
          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            grade === 'A+' || grade === 'A'
              ? 'bg-primary-container/20 text-telemetry-cyan'
              : 'bg-secondary/20 text-secondary'
          }`}
        >
          GRADE {grade}
        </span>
      </div>

      {/* Center 4 Telemetry Metrics */}
      <div className="flex items-center gap-5 text-[11px] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-text-dim">MASS MARGIN:</span>
          <span className={`font-semibold ${metrics.massMarginKg >= 0 ? 'text-primary-fixed' : 'text-status-warning'}`}>
            {metrics.massMarginKg >= 0 ? `+${metrics.massMarginKg.toFixed(0)}` : metrics.massMarginKg.toFixed(0)} kg
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-text-dim">ΔV MARGIN:</span>
          <span className={`font-semibold ${metrics.deltaVSufficient ? 'text-telemetry-cyan' : 'text-status-warning'}`}>
            {metrics.deltaVMarginKmS >= 0 ? `+${metrics.deltaVMarginKmS.toFixed(2)}` : metrics.deltaVMarginKmS.toFixed(2)} km/s
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-text-dim">POWER BUS:</span>
          <span className={`font-semibold ${metrics.powerSufficient ? 'text-primary' : 'text-status-warning'}`}>
            {metrics.netPowerMarginW >= 0 ? `+${metrics.netPowerMarginW}` : metrics.netPowerMarginW} W
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-text-dim">BUDGET:</span>
          <span className={`font-semibold ${metrics.budgetWithinLimit ? 'text-text-bright' : 'text-status-warning'}`}>
            ${metrics.totalCostM}M / ${metrics.budgetCapM}M
          </span>
        </div>
      </div>

      {/* Flight Readiness Status */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
            metrics.validationErrors.length === 0
              ? 'bg-primary-container/15 text-telemetry-cyan'
              : 'bg-status-warning/15 text-status-warning'
          }`}
        >
          {metrics.validationErrors.length === 0 ? 'FLIGHT READY' : `${metrics.validationErrors.length} DEFICITS`}
        </span>
      </div>
    </div>
  );
};

