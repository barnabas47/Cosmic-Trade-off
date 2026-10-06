import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../utils/audio';

interface MaxQAscentMinigameProps {
  isOpen: boolean;
  onSuccess: (xpAwarded: number) => void;
  onFailure: (hullDamagePercent: number) => void;
}

export const MaxQAscentMinigame: React.FC<MaxQAscentMinigameProps> = ({
  isOpen,
  onSuccess,
  onFailure,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(8);
  const [throttle, setThrottle] = useState<number>(100);
  const [dynamicPressureQ, setDynamicPressureQ] = useState<number>(18); // kPa
  const [structuralStress, setStructuralStress] = useState<number>(20); // %
  const [isResolved, setIsResolved] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(8);
      setThrottle(100);
      setDynamicPressureQ(18);
      setStructuralStress(20);
      setIsResolved(false);
      return;
    }

    sfx.playQuindarTone();

    const interval = setInterval(() => {
      setSecondsRemaining((sec) => {
        if (sec <= 1) {
          // Time expired: evaluate final survival
          clearInterval(interval);
          setIsResolved(true);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Physics simulation tick
  useEffect(() => {
    if (!isOpen || isResolved) return;

    const sim = setInterval(() => {
      setDynamicPressureQ((q) => {
        // q rises as speed increases, drops with lower throttle
        const targetQ = 15 + (throttle / 100) * 35;
        return q + (targetQ - q) * 0.15;
      });

      setStructuralStress(() => {
        // If throttle > 80% during Max-Q, stress spikes to redline!
        // Optimal throttle is between 60% and 75%
        if (throttle > 82) {
          return Math.min(100, structuralStress + 3.5);
        } else if (throttle < 55) {
          // Too low: speed loss
          return Math.max(10, structuralStress - 1.5);
        } else {
          // Nominal safe throttle pocket
          return Math.max(15, structuralStress - 2.5);
        }
      });
    }, 150);

    return () => clearInterval(sim);
  }, [isOpen, isResolved, throttle, structuralStress]);

  // Handle completion evaluation
  useEffect(() => {
    if (isResolved) {
      if (structuralStress < 75) {
        sfx.playIgnition();
        onSuccess(50);
      } else {
        sfx.playAlert();
        onFailure(25);
      }
    }
  }, [isResolved, structuralStress, onSuccess, onFailure]);

  if (!isOpen) return null;

  const isOptimal = throttle >= 60 && throttle <= 78;
  const isDangerous = structuralStress > 75;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className={`relative w-full max-w-xl rounded-xl bg-surface-container-high p-6 shadow-2xl text-xs font-mono overflow-hidden ${
            isDangerous ? 'animate-shake' : ''
          }`}
        >
          {/* Ambient Engine Flare Glow */}
          <div
            className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none transition-colors duration-500 ${
              isDangerous ? 'bg-status-warning/30' : 'bg-primary-container/20'
            }`}
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping" />
              <span className="font-headline text-sm font-bold uppercase tracking-wider text-text-bright">
                TRANSONIC MAX-Q ASCENT CONTROL
              </span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-telemetry-cyan font-bold">
              {secondsRemaining}s REMAINING
            </div>
          </div>

          <p className="text-[11px] text-text-dim leading-relaxed mb-4">
            Dynamic pressure peak detected in dense lower atmosphere. Throttle main engine to <strong>65% - 75%</strong> to relieve fairing acoustic resonance before MECO!
          </p>

          {/* Meters Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Dynamic Pressure Q */}
            <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="text-[10px] text-text-dim uppercase">DYNAMIC PRESSURE (Q)</span>
              <span className="text-sm font-bold text-text-bright">
                {dynamicPressureQ.toFixed(1)} <span className="text-[10px] text-text-dim">kPa</span>
              </span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-primary-container h-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (dynamicPressureQ / 50) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fairing Structural Stress */}
            <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="text-[10px] text-text-dim uppercase">STRUCTURAL STRESS</span>
              <span
                className={`text-sm font-bold ${
                  structuralStress > 75 ? 'text-status-warning animate-pulse' : 'text-telemetry-cyan'
                }`}
              >
                {structuralStress.toFixed(0)}%
              </span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-200 ${
                    structuralStress > 75 ? 'bg-status-warning' : 'bg-primary-fixed'
                  }`}
                  style={{ width: `${structuralStress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Throttle Slider */}
          <div className="p-4 rounded-lg bg-surface-container-low mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-text-bright">MAIN ENGINE THROTTLE</span>
              <span
                className={`text-xs font-bold ${
                  isOptimal ? 'text-telemetry-cyan' : 'text-status-warning'
                }`}
              >
                {throttle}% {isOptimal ? '(NOMINAL GATE)' : '(ADJUST NOW)'}
              </span>
            </div>

            <input
              type="range"
              min={40}
              max={100}
              value={throttle}
              onChange={(e) => {
                sfx.playClick();
                setThrottle(Number(e.target.value));
              }}
              className="w-full accent-primary-container bg-surface-container-highest rounded-full h-2 cursor-pointer"
            />

            <div className="flex justify-between text-[9px] text-text-dim mt-1.5">
              <span>40% (FLAMEOUT RISK)</span>
              <span className="text-telemetry-cyan font-bold">65%-75% SAFE POCKET</span>
              <span>100% (MAX PRESSURE)</span>
            </div>
          </div>

          <div className="text-[10px] text-text-dim text-center">
            Keep structural stress below 75% until supersonic stage separation.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

