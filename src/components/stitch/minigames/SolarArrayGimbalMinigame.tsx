import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../../utils/audio';

interface SolarArrayGimbalMinigameProps {
  isOpen: boolean;
  onSuccess: (bonusPowerW: number) => void;
  onFailure: (penaltyW: number) => void;
  onCancel: () => void;
}

export const SolarArrayGimbalMinigame: React.FC<SolarArrayGimbalMinigameProps> = ({
  isOpen,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [azimuth, setAzimuth] = useState<number>(0);
  const [elevation, setElevation] = useState<number>(0);
  const [targetAzimuth, setTargetAzimuth] = useState<number>(45);
  const [targetElevation, setTargetElevation] = useState<number>(-25);
  const [lockProgress, setLockProgress] = useState<number>(0);
  const [isResolved, setIsResolved] = useState<'success' | 'failure' | null>(null);

  const lockTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(10);
      setAzimuth(0);
      setElevation(0);
      setLockProgress(0);
      setIsResolved(null);
      lockTimerRef.current = 0;
      return;
    }

    sfx.playQuindarTone();
    // Randomize Sol vector
    const tAz = Math.floor(Math.random() * 200) - 100;
    const tEl = Math.floor(Math.random() * 100) - 50;
    setTargetAzimuth(tAz);
    setTargetElevation(tEl);
    setLockProgress(0);
    lockTimerRef.current = 0;

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

  // Epsilon and lock detection loop
  const errorEpsilon = Math.hypot(azimuth - targetAzimuth, elevation - targetElevation);
  const isAligned = errorEpsilon <= 10.0;

  useEffect(() => {
    if (!isOpen || isResolved) return;

    if (secondsRemaining === 0 && !isResolved) {
      setIsResolved('failure');
      sfx.playAlert();
      return;
    }

    const tracker = setInterval(() => {
      if (isAligned) {
        lockTimerRef.current += 0.1;
        const pct = Math.min(100, Math.round((lockTimerRef.current / 1.5) * 100));
        setLockProgress(pct);

        if (pct >= 100) {
          clearInterval(tracker);
          setIsResolved('success');
          sfx.playIgnition();
        }
      } else {
        lockTimerRef.current = Math.max(0, lockTimerRef.current - 0.08);
        setLockProgress(Math.round((lockTimerRef.current / 1.5) * 100));
      }
    }, 100);

    return () => clearInterval(tracker);
  }, [isOpen, isAligned, isResolved, secondsRemaining]);

  if (!isOpen) return null;

  // Radar coordinate mappings
  const targetX = (targetAzimuth / 180) * 88;
  const targetY = (targetElevation / 90) * 88;
  const reticleX = (azimuth / 180) * 88;
  const reticleY = (elevation / 90) * 88;

  const solarFlux = Math.max(80, Math.round(530 - errorEpsilon * 3.8));
  const busPower = Math.max(120, Math.round(480 - errorEpsilon * 2.9));

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
              <span className="w-2.5 h-2.5 rounded-full bg-telemetry-cyan animate-pulse" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-bright font-headline">
                  GIMBAL ATTITUDE SYNCHRONIZER
                </h3>
                <p className="text-[10px] text-text-dim">Jovian Solar Flux Re-Acquisition Protocol</p>
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
            {/* 2-Axis Polar Radar (7 cols) */}
            <div className="md:col-span-7 flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-lg relative overflow-hidden">
              <div className="absolute top-2 left-2.5 text-[9px] text-text-dim uppercase tracking-wider">
                RADAR: 2-AXIS POLAR PROJECTION
              </div>

              {/* Radar Circle */}
              <div className="relative w-52 h-52 rounded-full border border-cyan-500/20 flex items-center justify-center my-2 bg-surface-container/40">
                <div className="absolute w-36 h-36 border border-white/[0.04] rounded-full" />
                <div className="absolute w-24 h-24 border border-white/[0.05] rounded-full" />
                <div className="absolute w-12 h-12 border border-white/[0.08] rounded-full" />
                <div className="absolute w-full h-[1px] bg-white/[0.07]" />
                <div className="absolute h-full w-[1px] bg-white/[0.07]" />

                {/* Target Sun Vector */}
                <div
                  className="absolute w-7 h-7 rounded-full border border-dashed border-amber-400 flex items-center justify-center transition-all duration-300"
                  style={{ transform: `translate(${targetX}px, ${targetY}px)` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                  <span className="absolute -top-3.5 text-[8px] font-bold text-amber-300 tracking-tight whitespace-nowrap">
                    SOL VECTOR
                  </span>
                </div>

                {/* Current Reticle */}
                <div
                  className="absolute w-8 h-8 border-2 border-telemetry-cyan rounded-md flex items-center justify-center transition-transform duration-75"
                  style={{ transform: `translate(${reticleX}px, ${reticleY}px)` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan" />
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[11px] px-1 pt-1 text-text-dim">
                <span>ERROR EPSILON:</span>
                <span className={`font-semibold ${isAligned ? 'text-telemetry-cyan' : 'text-text-bright'}`}>
                  {errorEpsilon.toFixed(1)}° {isAligned ? '[ALIGNED]' : '[SLEWING]'}
                </span>
              </div>
            </div>

            {/* Sliders & Telemetry (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between gap-3">
              <div className="space-y-2.5 bg-surface-container p-3 rounded-lg">
                <div>
                  <div className="flex justify-between text-[11px] text-text-dim mb-1">
                    <span>SOLAR FLUX</span>
                    <span className="text-text-bright font-bold">{solarFlux} W/m²</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-150"
                      style={{ width: `${Math.min(100, (solarFlux / 530) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-text-dim mb-1">
                    <span>BUS OUTPUT</span>
                    <span className="text-telemetry-cyan font-bold">{busPower} W</span>
                  </div>
                  <div className="text-[10px] text-text-dim">DEMAND: 310 W ELECTRICAL</div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-dim mb-1">
                    <span>VECTOR LOCK ENGAGEMENT</span>
                    <span className="text-primary-fixed font-bold">{lockProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container transition-all duration-75"
                      style={{ width: `${lockProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-2.5 bg-surface-container-lowest p-3 rounded-lg text-[11px]">
                <div>
                  <div className="flex justify-between text-text-dim mb-1">
                    <span>AZIMUTH GIMBAL</span>
                    <span className="text-telemetry-cyan font-bold">{azimuth}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={azimuth}
                    onChange={(e) => setAzimuth(Number(e.target.value))}
                    className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-text-dim mb-1">
                    <span>ELEVATION TILT</span>
                    <span className="text-telemetry-cyan font-bold">{elevation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={elevation}
                    onChange={(e) => setElevation(Number(e.target.value))}
                    className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1.5 cursor-pointer"
                  />
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
                {isResolved === 'success' ? 'SOLAR VECTOR SYNCHRONIZED' : 'CAPACITOR EXHAUSTION'}
              </h4>
              <p className="text-xs text-text-dim max-w-sm mb-4 leading-relaxed">
                {isResolved === 'success'
                  ? 'Solar array gimbals locked onto Sun vector. High-efficiency photovoltaic harvest restored (+650W bus power).'
                  : 'Capacitor depleted before solar alignment. Spacecraft battery reserve suffered degradation (-180W).'}
              </p>
              <button
                onClick={() => {
                  sfx.playClick();
                  if (isResolved === 'success') {
                    onSuccess(650);
                  } else {
                    onFailure(180);
                  }
                }}
                className="px-5 py-2 bg-primary-container text-on-primary-container font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Acknowledge & Return
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

