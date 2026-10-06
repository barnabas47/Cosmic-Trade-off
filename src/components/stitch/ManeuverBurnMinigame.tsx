import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../utils/audio';

interface ManeuverBurnMinigameProps {
  isOpen: boolean;
  onBurnExecuted: (bonusPercent: number) => void;
  onCancel: () => void;
}

export const ManeuverBurnMinigame: React.FC<ManeuverBurnMinigameProps> = ({
  isOpen,
  onBurnExecuted,
  onCancel,
}) => {
  const [needlePos, setNeedlePos] = useState<number>(10);
  const [direction, setDirection] = useState<number>(1);
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnResult, setBurnResult] = useState<string | null>(null);

  // Meter oscillation
  useEffect(() => {
    if (!isOpen || isBurning) return;
    const interval = setInterval(() => {
      setNeedlePos((prev) => {
        let next = prev + direction * 2.8;
        if (next >= 90) {
          setDirection(-1);
          next = 90;
        } else if (next <= 10) {
          setDirection(1);
          next = 10;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [isOpen, direction, isBurning]);

  const handleIgnite = () => {
    sfx.playIgnition();
    setIsBurning(true);

    // Sweet spot is 42% - 58%
    const inSweetSpot = needlePos >= 42 && needlePos <= 58;
    const bonus = inSweetSpot ? 15 : 0;

    if (inSweetSpot) {
      setBurnResult('PERFECT INJECTION! +15% ΔV EFFICIENCY (+75 XP)');
    } else {
      setBurnResult('NOMINAL INJECTION BURN EXECUTED (+25 XP)');
    }

    setTimeout(() => {
      onBurnExecuted(bonus);
      setIsBurning(false);
      setBurnResult(null);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md rounded-2xl bg-surface-container-high p-6 shadow-2xl text-xs font-mono"
        >
          {/* Ambient Engine Flare Glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary-container/20 blur-[80px] pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping" />
              <span className="font-headline text-base font-bold text-text-bright uppercase">
                Maneuver Burn Timing Node
              </span>
            </div>
            <button
              onClick={onCancel}
              className="text-text-dim hover:text-text-bright"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-text-dim my-3">
            Align the reaction control thruster gimbal and time the main engine burn at periapsis for optimal delta-V efficiency.
          </p>

          {/* Timing Needle Gauge */}
          <div className="my-6">
            <div className="flex justify-between text-[10px] text-text-dim uppercase mb-1">
              <span>EARLY BURN</span>
              <span className="text-primary-container font-bold">PERIAPSIS SWEET SPOT</span>
              <span>LATE BURN</span>
            </div>

            <div className="relative w-full h-8 rounded-full bg-surface-container-low overflow-hidden shadow-inner flex items-center">
              {/* Sweet spot zone */}
              <div
                className="absolute h-full bg-primary-container/25 border-x-2 border-primary-container"
                style={{ left: '42%', width: '16%' }}
              />

              {/* Oscillating needle */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-text-bright shadow-[0_0_10px_#ffffff] transition-all"
                style={{ left: `${needlePos}%` }}
              />
            </div>
          </div>

          {burnResult ? (
            <div className="p-3 rounded-xl bg-primary-container/15 text-telemetry-cyan font-bold text-center text-sm animate-pulse">
              {burnResult}
            </div>
          ) : (
            <button
              onClick={handleIgnite}
              disabled={isBurning}
              className="w-full py-3 rounded-full bg-gradient-to-r from-primary-container to-telemetry-azure text-on-primary-container font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(0,242,254,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              IGNITE PROPULSION BURN
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

