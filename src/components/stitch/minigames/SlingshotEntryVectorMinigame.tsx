import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../../utils/audio';

interface SlingshotEntryVectorMinigameProps {
  isOpen: boolean;
  onSuccess: (deltaVBonusKmS: number) => void;
  onFailure: (hullDamagePercent: number) => void;
  onCancel: () => void;
}

export const SlingshotEntryVectorMinigame: React.FC<SlingshotEntryVectorMinigameProps> = ({
  isOpen,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [altitudeKm, setAltitudeKm] = useState<number>(270);
  const [isResolved, setIsResolved] = useState<'success' | 'failure' | 'suboptimal' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(10);
      setAltitudeKm(270);
      setIsResolved(null);
      return;
    }

    sfx.playQuindarTone();
    // Randomize initial altitude slightly
    setAltitudeKm(Math.floor(250 + Math.random() * 50));

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

  // Animated hyperbolic arc canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Celestial body (planet)
      const planetX = w * 0.52;
      const planetY = h * 0.48;
      const planetR = 34;

      // Atmosphere ring
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetR + 16, 0, Math.PI * 2);
      ctx.fill();

      // Slingshot sweet corridor ring
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetR + 28, 0, Math.PI * 2);
      ctx.stroke();

      // Planet body
      const grad = ctx.createRadialGradient(planetX - 8, planetY - 8, 4, planetX, planetY, planetR);
      grad.addColorStop(0, '#e0b6ff');
      grad.addColorStop(1, '#6d11ad');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
      ctx.fill();

      // Hyperbolic trajectory path
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Quadratic curve mapped to current altitude
      const bendFactor = Math.max(10, (300 - altitudeKm) * 0.5);
      ctx.moveTo(30, h * 0.85);
      ctx.quadraticCurveTo(planetX - 10, planetY - bendFactor, w - 30, h * 0.2);
      ctx.stroke();

      // Spacecraft moving along the curve
      const probeT = (t * 0.4) % 1.0;
      const u = 1 - probeT;
      const scX = u * u * 30 + 2 * u * probeT * (planetX - 10) + probeT * probeT * (w - 30);
      const scY = u * u * (h * 0.85) + 2 * u * probeT * (planetY - bendFactor) + probeT * probeT * (h * 0.2);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scX, scY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f2fe';
      ctx.strokeRect(scX - 6, scY - 6, 12, 12);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, altitudeKm]);

  // Evaluate on commit or timeout
  const commitBurn = () => {
    sfx.playClick();
    if (altitudeKm >= 140 && altitudeKm <= 180) {
      setIsResolved('success');
      sfx.playIgnition();
    } else if (altitudeKm < 135) {
      setIsResolved('failure');
      sfx.playAlert();
    } else {
      setIsResolved('suboptimal');
      sfx.playClick();
    }
  };

  useEffect(() => {
    if (secondsRemaining === 0 && !isResolved) {
      commitBurn();
    }
  }, [secondsRemaining, isResolved]);

  if (!isOpen) return null;

  // Altitude percentage mapping for needle
  const needlePct = Math.min(100, Math.max(0, ((altitudeKm - 100) / 200) * 100));

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
                  GRAVITY ASSIST PERIAPSIS VECTOR
                </h3>
                <p className="text-[10px] text-text-dim">Jovian B-Plane Hyperbolic Injection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold text-sm bg-surface-container-lowest px-2.5 py-1 rounded">
                T-{secondsRemaining}s
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

          {/* Canvas */}
          <div className="my-2 bg-surface-container-lowest p-3 rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-text-dim">
              <span>HYPERBOLIC FLYBY TRAJECTORY ARC</span>
              <span className="text-telemetry-cyan font-bold">
                {altitudeKm >= 140 && altitudeKm <= 180 ? 'CORRIDOR ACQUIRED' : 'CORRIDOR MISALIGNED'}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={560}
              height={140}
              className="w-full h-32 rounded bg-black/60 block"
            />
          </div>

          {/* Altitude gauge & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-1">
            <div className="md:col-span-7 bg-surface-container p-3 rounded-lg flex flex-col justify-between">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-dim">PERIAPSIS ALTITUDE (Rp)</span>
                <span className="font-bold text-sm text-telemetry-cyan">{altitudeKm} km</span>
              </div>

              {/* Needle track */}
              <div className="relative h-3 w-full bg-black/60 rounded-full overflow-hidden my-2">
                <div className="absolute left-0 top-0 bottom-0 w-[25%] bg-status-warning/40" />
                <div className="absolute left-[25%] top-0 bottom-0 w-[30%] bg-emerald-500/60" />
                <div className="absolute left-[55%] top-0 bottom-0 w-[45%] bg-sky-600/30" />
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_#ffffff] transition-all duration-100"
                  style={{ left: `${needlePct}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-text-dim">
                <span className="text-status-warning">&lt;135km BURN-UP</span>
                <span className="text-emerald-400 font-bold">140-180km (+1.8 km/s)</span>
                <span className="text-sky-400">&gt;200km LOW BOOST</span>
              </div>
            </div>

            {/* Controls */}
            <div className="md:col-span-5 flex flex-col justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sfx.playClick();
                    setAltitudeKm((a) => a + 16);
                  }}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high rounded text-xs font-bold transition-all text-center"
                >
                  ▲ BOOST (+16km)
                </button>
                <button
                  onClick={() => {
                    sfx.playClick();
                    setAltitudeKm((a) => Math.max(80, a - 16));
                  }}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high rounded text-xs font-bold transition-all text-center"
                >
                  ▼ BRAKE (−16km)
                </button>
              </div>

              <button
                onClick={commitBurn}
                className="w-full py-2.5 bg-primary-container text-on-primary-container font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all text-center"
              >
                LOCK TRAJECTORY BURN
              </button>
            </div>
          </div>

          {/* Outcome Overlay */}
          {isResolved && (
            <div className="absolute inset-0 bg-surface-container-lowest/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 ${
                  isResolved === 'success'
                    ? 'bg-primary-container/20 text-telemetry-cyan shadow-[0_0_20px_#00f2fe]'
                    : isResolved === 'suboptimal'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-status-warning/20 text-status-warning'
                }`}
              >
                {isResolved === 'success' ? '✓' : isResolved === 'suboptimal' ? '△' : '✕'}
              </div>
              <h4 className="font-headline text-lg font-bold text-text-bright mb-1">
                {isResolved === 'success'
                  ? 'PERFECT GRAVITY SLINGSHOT'
                  : isResolved === 'suboptimal'
                  ? 'WIDE FLYBY — PARTIAL ASSIST'
                  : 'ATMOSPHERIC RE-ENTRY OVERHEAT'}
              </h4>
              <p className="text-xs text-text-dim max-w-sm mb-4 leading-relaxed">
                {isResolved === 'success'
                  ? 'Spacecraft clipped the ideal 160km gravitational corridor. Extracted maximum +1.82 km/s hyperbolic excess velocity.'
                  : isResolved === 'suboptimal'
                  ? 'Periapsis was too high (>200km). Extracted minor +0.65 km/s assist with 0 damage.'
                  : 'Altitude fell below 135km into planetary upper atmosphere. Thermal friction damaged heat shield (-30% hull).'}
              </p>
              <button
                onClick={() => {
                  sfx.playClick();
                  if (isResolved === 'success') {
                    onSuccess(1.82);
                  } else if (isResolved === 'suboptimal') {
                    onSuccess(0.65);
                  } else {
                    onFailure(30);
                  }
                }}
                className="px-5 py-2 bg-primary-container text-on-primary-container font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Proceed on Trajectory
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

