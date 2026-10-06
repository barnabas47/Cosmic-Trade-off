import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionEngineeringMetrics, Destination } from '../../types/mission';

interface StitchFloatingTelemetryPillProps {
  metrics: MissionEngineeringMetrics;
  destination: Destination;
}

export const StitchFloatingTelemetryPill: React.FC<StitchFloatingTelemetryPillProps> = ({
  metrics,
  destination,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-14 right-6 z-40 hidden md:flex flex-col items-end">
      {/* Expanded Telemetry Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2 w-96 p-space-md rounded-2xl bg-surface-container/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-xs font-mono"
          >
            <div className="flex items-center justify-between pb-2 text-text-dim">
              <span className="text-telemetry-cyan font-bold uppercase tracking-wider">
                JPL Execution Trace
              </span>
              <span className="text-primary-fixed">60 FPS DETERMINISTIC</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="p-2.5 rounded bg-surface-container-low shadow-sm">
                <div className="text-text-bright font-semibold">Tsiolkovsky Delta-V Solver</div>
                <div className="text-[11px] text-text-dim mt-0.5">
                  Δv = {metrics.deltaVAvailableKmS.toFixed(2)} km/s • Isp {metrics.deltaVSufficient ? 'Nominal' : 'Low'}
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low shadow-sm">
                <div className="text-text-bright font-semibold">Inverse-Square Flux (1/r²)</div>
                <div className="text-[11px] text-text-dim mt-0.5">
                  Distance: {destination.distanceAU} AU ➔ Solar Flux: {destination.solarFluxWm2} W/m²
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low shadow-sm">
                <div className="text-text-bright font-semibold">Payload Margin & Mass Balance</div>
                <div className="text-[11px] text-text-dim mt-0.5">
                  Wet: {metrics.totalWetMassKg.toFixed(0)}kg / Cap: {(metrics.totalWetMassKg + metrics.massMarginKg).toFixed(0)}kg
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between text-[10px] text-text-dim">
              <span>Ground Lock: Goldstone #14</span>
              <span className="text-primary-container">Gemini 3.8 Flash • Sub-40ms</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-space-md px-space-md py-space-xs rounded-full bg-surface-container/90 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
          <span className="font-mono text-xs text-primary font-semibold uppercase">
            NASA JPL Physics Core
          </span>
        </div>

        <span className="text-text-dim font-mono">•</span>
        <span className="font-mono text-xs text-text-dim uppercase">
          Latency: <span className="text-telemetry-cyan font-bold">34ms</span>
        </span>

        <span className="text-text-dim font-mono">•</span>
        <div className="flex items-center gap-space-xs font-mono text-xs text-on-surface-variant">
          <span>DSN 70M LOCK:</span>
          <span className="text-text-bright font-mono font-medium">GOLDSTONE #14</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            isOpen
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_8px_#00f2fe]'
              : 'bg-surface-container-high text-text-dim hover:text-text-bright hover:bg-surface-bright'
          }`}
          title="Toggle Detailed Telemetry Log"
        >
          <span className="material-symbols-outlined text-[14px]">tune</span>
        </button>
      </div>
    </div>
  );
};
