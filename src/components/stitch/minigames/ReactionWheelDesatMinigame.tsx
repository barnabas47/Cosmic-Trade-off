import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../../utils/audio';

interface ReactionWheelDesatMinigameProps {
  isOpen: boolean;
  onSuccess: (fuelSavedKg: number) => void;
  onFailure: (damagePercent: number) => void;
  onCancel: () => void;
}

export const ReactionWheelDesatMinigame: React.FC<ReactionWheelDesatMinigameProps> = ({
  isOpen,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [wheelRpm, setWheelRpm] = useState<number>(96);
  const [pitchRate, setPitchRate] = useState<number>(2.4);
  const [rollRate, setRollRate] = useState<number>(-1.8);
  const [rcsFuelKg, setRcsFuelKg] = useState<number>(15.0);
  const [activePlume, setActivePlume] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState<'success' | 'failure' | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(10);
      setWheelRpm(96);
      setPitchRate(2.4);
      setRollRate(-1.8);
      setRcsFuelKg(15.0);
      setIsResolved(null);
      return;
    }

    sfx.playAlert();

    const interval = setInterval(() => {
      setSecondsRemaining((sec) => {
        if (sec <= 1) {
          clearInterval(interval);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isResolved) return;

    if (wheelRpm <= 15) {
      setIsResolved('success');
      sfx.playIgnition();
    } else if (secondsRemaining === 0 || rcsFuelKg <= 0) {
      setIsResolved('failure');
      sfx.playAlert();
    }
  }, [isOpen, wheelRpm, secondsRemaining, rcsFuelKg, isResolved]);

  const fireImpulse = (type: 'PITCH_POS' | 'PITCH_NEG' | 'ROLL_POS' | 'ROLL_NEG') => {
    if (rcsFuelKg <= 0 || isResolved) return;
    sfx.playClick();
    setRcsFuelKg((f) => Math.max(0, Number((f - 0.4).toFixed(1))));

    setActivePlume(type);
    setTimeout(() => setActivePlume(null), 180);

    if (type === 'PITCH_POS') {
      setPitchRate((p) => p + 0.6);
      setWheelRpm((r) => Math.max(0, r - 7));
    } else if (type === 'PITCH_NEG') {
      setPitchRate((p) => p - 0.6);
      setWheelRpm((r) => Math.max(0, r - 7));
    } else if (type === 'ROLL_POS') {
      setRollRate((r) => r + 0.6);
      setWheelRpm((r) => Math.max(0, r - 7));
    } else if (type === 'ROLL_NEG') {
      setRollRate((r) => r - 0.6);
      setWheelRpm((r) => Math.max(0, r - 7));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-2xl rounded-xl bg-surface-container-high p-6 shadow-2xl overflow-hidden font-mono text-xs flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-warning animate-pulse" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-bright font-headline">
                  REACTION WHEEL DESATURATION
                </h3>
                <p className="text-[10px] text-text-dim">Cold-Gas RCS Momentum Dumping</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold text-sm bg-surface-container-lowest px-2.5 py-1 rounded">
                {secondsRemaining}s TTL
              </span>
              <button
                onClick={() => {
                  sfx.playClick();
                  onCancel();
                }}
                className="w-7 h-7 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-text-dim hover:text-text-bright transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
            {/* Attitude Horizon Sphere (6 cols) */}
            <div className="md:col-span-6 bg-surface-container-lowest p-4 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
              <span className="absolute top-2.5 left-2.5 text-[9px] text-text-dim uppercase tracking-wider">
                ATTITUDE HORIZON
              </span>

              <div className="relative w-40 h-40 rounded-full border border-white/10 bg-surface-container/30 flex items-center justify-center overflow-hidden my-2 shadow-inner">
                {/* Horizon bar tilted by pitch and roll */}
                <div
                  className="absolute w-52 h-[2px] bg-telemetry-cyan transition-transform duration-100 shadow-[0_0_8px_#00f2fe]"
                  style={{
                    transform: `translateY(${pitchRate * 8}px) rotate(${rollRate * 12}deg)`,
                  }}
                />
                <div className="w-2 h-2 rounded-full bg-primary-container" />

                {/* Plume effects */}
                {activePlume === 'PITCH_POS' && (
                  <div className="absolute top-2 w-3 h-5 bg-cyan-400/80 blur-sm rounded-full animate-ping" />
                )}
                {activePlume === 'PITCH_NEG' && (
                  <div className="absolute bottom-2 w-3 h-5 bg-cyan-400/80 blur-sm rounded-full animate-ping" />
                )}
                {activePlume === 'ROLL_POS' && (
                  <div className="absolute right-2 h-3 w-5 bg-cyan-400/80 blur-sm rounded-full animate-ping" />
                )}
                {activePlume === 'ROLL_NEG' && (
                  <div className="absolute left-2 h-3 w-5 bg-cyan-400/80 blur-sm rounded-full animate-ping" />
                )}
              </div>

              <div className="w-full flex justify-between text-[11px] text-text-dim px-2">
                <span>PITCH: {pitchRate > 0 ? `+${pitchRate.toFixed(1)}` : pitchRate.toFixed(1)}°/s</span>
                <span>ROLL: {rollRate > 0 ? `+${rollRate.toFixed(1)}` : rollRate.toFixed(1)}°/s</span>
              </div>
            </div>

            {/* Momentum Bar & RCS Pulse Buttons (6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-between gap-3">
              <div className="bg-surface-container p-3 rounded-lg">
                <div className="flex justify-between text-[11px] text-text-dim mb-1">
                  <span>WHEEL MOMENTUM RPM</span>
                  <span
                    className={`font-bold ${
                      wheelRpm > 50 ? 'text-status-warning' : 'text-telemetry-cyan'
                    }`}
                  >
                    {wheelRpm}% {wheelRpm > 50 ? '[CRITICAL]' : '[STABILIZED]'}
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      wheelRpm > 50 ? 'bg-status-warning' : 'bg-primary-container'
                    }`}
                    style={{ width: `${wheelRpm}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-text-dim mt-1.5">
                  <span>TARGET: &lt;15%</span>
                  <span>RCS FUEL: {rcsFuelKg} kg</span>
                </div>
              </div>

              {/* Pulse Buttons */}
              <div className="bg-surface-container-lowest p-3 rounded-lg">
                <span className="text-[9px] text-text-dim uppercase tracking-wider block mb-2">
                  MANUAL RCS FIRING IMPULSE (0.4 kg/burst)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fireImpulse('PITCH_POS')}
                    className="p-2.5 bg-surface-container hover:bg-surface-container-high active:bg-primary-container active:text-on-primary-container rounded font-bold transition-all text-center"
                  >
                    ▲ PITCH +
                  </button>
                  <button
                    onClick={() => fireImpulse('PITCH_NEG')}
                    className="p-2.5 bg-surface-container hover:bg-surface-container-high active:bg-primary-container active:text-on-primary-container rounded font-bold transition-all text-center"
                  >
                    ▼ PITCH −
                  </button>
                  <button
                    onClick={() => fireImpulse('ROLL_POS')}
                    className="p-2.5 bg-surface-container hover:bg-surface-container-high active:bg-primary-container active:text-on-primary-container rounded font-bold transition-all text-center"
                  >
                    ◀ ROLL +
                  </button>
                  <button
                    onClick={() => fireImpulse('ROLL_NEG')}
                    className="p-2.5 bg-surface-container hover:bg-surface-container-high active:bg-primary-container active:text-on-primary-container rounded font-bold transition-all text-center"
                  >
                    ▶ ROLL −
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Overlay */}
          {isResolved && (
            <div className="absolute inset-0 bg-surface-container-lowest/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 ${
                  isResolved === 'success'
                    ? 'bg-primary-container/20 text-telemetry-cyan shadow-[0_0_20px_#00f2fe]'
                    : 'bg-status-warning/20 text-status-warning'
                }`}
              >
                {isResolved === 'success' ? '✓' : '✕'}
              </div>
              <h4 className="font-headline text-lg font-bold text-text-bright mb-1">
                {isResolved === 'success' ? 'GYROSCOPE MOMENTUM DUMPED' : 'UNCONTROLLED ATTITUDE SPIN'}
              </h4>
              <p className="text-xs text-text-dim max-w-sm mb-4 leading-relaxed">
                {isResolved === 'success'
                  ? 'Reaction wheels desaturated below 15% RPM. Stable 3-axis pointing restored with minimal propellant expenditure.'
                  : 'Reaction wheels saturated at 100% mechanical redline, inducing structural bearing strain (-25% hull).'}
              </p>
              <button
                onClick={() => {
                  sfx.playClick();
                  if (isResolved === 'success') {
                    onSuccess(rcsFuelKg);
                  } else {
                    onFailure(25);
                  }
                }}
                className="px-5 py-2 bg-primary-container text-on-primary-container font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Confirm Stabilization
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

