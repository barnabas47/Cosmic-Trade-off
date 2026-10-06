import React from 'react';
import { MissionEngineeringMetrics } from '../../types/mission';

interface StitchFooterProps {
  metrics: MissionEngineeringMetrics;
}

export const StitchFooter: React.FC<StitchFooterProps> = ({ metrics }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest/90 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="h-12 w-full px-space-lg flex items-center justify-between gap-space-md max-w-[1720px] mx-auto">
        <div className="flex items-center gap-space-lg overflow-x-auto">
          {/* Status */}
          <div className="flex items-center gap-space-xs font-mono text-xs uppercase text-text-dim shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
            <span className="text-on-surface-variant">SYS_STATUS:</span>
            <span className="text-telemetry-cyan font-semibold">
              {metrics.validationErrors.length === 0 ? 'NOMINAL (DSN LOCK)' : 'DEFICIT MARGINS'}
            </span>
          </div>

          {/* Delta-V */}
          <div className="hidden md:flex items-center gap-space-xs font-mono text-xs uppercase text-text-dim shrink-0">
            <span className="text-on-surface-variant">DELTA-V RESERVES:</span>
            <span className="text-text-bright">{(metrics.deltaVAvailableKmS * 1000).toFixed(0)} M/S</span>
          </div>

          {/* Payload */}
          <div className="hidden md:flex items-center gap-space-xs font-mono text-xs uppercase text-text-dim shrink-0">
            <span className="text-on-surface-variant">PAYLOAD DRY:</span>
            <span className="text-text-bright">{metrics.dryMassKg.toFixed(1)} KG</span>
          </div>

          {/* Downlink */}
          <div className="hidden lg:flex items-center gap-space-xs font-mono text-xs uppercase text-text-dim shrink-0">
            <span className="text-on-surface-variant">DOWNLINK:</span>
            <span className="text-telemetry-cyan">128.4 MBPS (KA-BAND)</span>
          </div>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <div className="flex items-center gap-space-xs font-mono text-xs text-text-dim">
            <span className="text-on-surface-variant">MET:</span>
            <span className="text-primary">T+ 042:18:04:12 UTC</span>
          </div>
          <div className="hidden sm:flex items-center gap-space-xs font-mono text-xs text-text-dim">
            <span className="text-on-surface-variant">LATENCY:</span>
            <span className="text-text-bright">34.2 MS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
