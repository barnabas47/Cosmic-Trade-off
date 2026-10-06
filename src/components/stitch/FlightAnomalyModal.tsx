import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlightAnomaly } from '../../types/mission';
import { sfx } from '../../utils/audio';

interface FlightAnomalyModalProps {
  anomaly: FlightAnomaly | null;
  onResolve: (choiceIndex: number) => void;
}

export const FlightAnomalyModal: React.FC<FlightAnomalyModalProps> = ({
  anomaly,
  onResolve,
}) => {
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    if (!anomaly) return;
    sfx.playAlert();
    setCountdown(30);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // Default to choice 0 if time runs out
          onResolve(0);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [anomaly, onResolve]);

  if (!anomaly) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl rounded-xl bg-surface-container-high p-6 shadow-[0_0_50px_rgba(200,106,80,0.4)] text-xs font-mono"
        >
          {/* Pulsing Emergency Red Corona */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-status-warning/20 blur-[90px] pointer-events-none animate-pulse" />

          {/* Top Banner with Alert Icon & Countdown */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2 text-status-warning font-bold uppercase tracking-wider text-xs">
              <span className="material-symbols-outlined text-[18px] animate-pulse">
                warning
              </span>
              <span>FLIGHT DIRECTOR INTERVENTION • {anomaly.severity} SEVERITY</span>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-warning/20 text-status-warning font-bold text-xs animate-pulse">
              <span>DECISION WINDOW:</span>
              <span className="text-white text-sm">{countdown}s</span>
            </div>
          </div>

          {/* Anomaly Title & Description */}
          <div className="my-4">
            <h2 className="font-headline text-xl font-bold text-text-bright tracking-tight">
              {anomaly.title}
            </h2>
            <p className="text-xs text-text-dim mt-1.5 leading-relaxed">
              {anomaly.description}
            </p>
          </div>

          {/* Choice Cards (Interactive Decision Options) */}
          <div className={`grid gap-3 my-4 ${anomaly.choices.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {anomaly.choices.map((choice, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onResolve(idx);
                }}
                className={`p-3.5 rounded-lg text-left transition-all hover:scale-[1.01] active:scale-95 group shadow-md flex flex-col justify-between ${
                  choice.minigameTrigger
                    ? 'bg-primary-container/10 hover:bg-primary-container/20 border border-telemetry-cyan/25'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-telemetry-cyan font-bold text-xs tracking-wider">
                      DIRECTIVE {idx + 1}
                    </span>
                    {choice.minigameTrigger ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-container/25 text-telemetry-cyan flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-[12px]">sports_esports</span>
                        <span>INTERVENE</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-primary-fixed">
                        {Math.round(choice.successRate * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="font-headline text-sm font-semibold text-text-bright group-hover:text-telemetry-cyan transition-colors">
                    {choice.label}
                  </div>
                  <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                    {choice.description}
                  </p>
                </div>

                {/* Impact Pills */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-text-dim">
                  <span>
                    Fuel:{' '}
                    <strong className={choice.propellantCostKg > 0 ? 'text-status-warning' : 'text-text-bright'}>
                      {choice.propellantCostKg > 0 ? `-${choice.propellantCostKg} kg` : '0 kg'}
                    </strong>
                  </span>
                  <span>
                    Science:{' '}
                    <strong className={choice.scienceModifier > 0 ? 'text-telemetry-cyan' : choice.scienceModifier < 0 ? 'text-status-warning' : 'text-text-bright'}>
                      {choice.scienceModifier > 0 ? `+${choice.scienceModifier} pts` : `${choice.scienceModifier} pts`}
                    </strong>
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-[10px] text-text-dim text-center">
            Click directive to transmit telemetry sequence via NASA Deep Space Network.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

