import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../../utils/audio';

interface DsnPhaseLockMinigameProps {
  isOpen: boolean;
  onSuccess: (scienceBonusGb: number) => void;
  onFailure: () => void;
  onCancel: () => void;
}

export const DsnPhaseLockMinigame: React.FC<DsnPhaseLockMinigameProps> = ({
  isOpen,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(12);
  const [freq, setFreq] = useState<number>(32.0);
  const [phase, setPhase] = useState<number>(0);
  const [targetFreq, setTargetFreq] = useState<number>(34.2);
  const [targetPhase, setTargetPhase] = useState<number>(140);
  const [lockProgress, setLockProgress] = useState<number>(0);
  const [isResolved, setIsResolved] = useState<'success' | 'failure' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lockTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(12);
      setFreq(32.0);
      setPhase(0);
      setLockProgress(0);
      setIsResolved(null);
      lockTimerRef.current = 0;
      return;
    }

    sfx.playQuindarTone();
    // Randomize targets
    const tF = Number((32.5 + Math.random() * 3.5).toFixed(2));
    const tP = Math.floor(Math.random() * 300) + 30;
    setTargetFreq(tF);
    setTargetPhase(tP);
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

  // Delta calculations
  const freqDiff = Math.abs(freq - targetFreq);
  const phaseDiff = Math.abs((phase - targetPhase + 360) % 360);
  const minPhaseDiff = Math.min(phaseDiff, 360 - phaseDiff);
  const isSynchronized = freqDiff <= 0.25 && minPhaseDiff <= 22;

  // Real-time oscilloscope animation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.08;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // 1. JPL Goldstone noisy carrier wave (coral)
      ctx.strokeStyle = '#c86a50';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const angle = (x / w) * Math.PI * 4 * (targetFreq / 10) + t;
        const noise = (Math.random() - 0.5) * 6;
        const y = h / 2 + Math.sin(angle) * 35 + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Local VCO tuned wave (cyan)
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const phaseRad = (phase * Math.PI) / 180;
      for (let x = 0; x < w; x++) {
        const angle = (x / w) * Math.PI * 4 * (freq / 10) + t + phaseRad;
        const y = h / 2 + Math.sin(angle) * 35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, freq, phase, targetFreq]);

  // Lock hold logic
  useEffect(() => {
    if (!isOpen || isResolved) return;

    if (secondsRemaining === 0 && !isResolved) {
      setIsResolved('failure');
      sfx.playAlert();
      return;
    }

    const timer = setInterval(() => {
      if (isSynchronized) {
        lockTimerRef.current += 0.1;
        const pct = Math.min(100, Math.round((lockTimerRef.current / 1.8) * 100));
        setLockProgress(pct);

        if (pct >= 100) {
          clearInterval(timer);
          setIsResolved('success');
          sfx.playIgnition();
        }
      } else {
        lockTimerRef.current = Math.max(0, lockTimerRef.current - 0.08);
        setLockProgress(Math.round((lockTimerRef.current / 1.8) * 100));
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, isSynchronized, isResolved, secondsRemaining]);

  if (!isOpen) return null;

  const snr = isSynchronized ? (24.5 + Math.random() * 0.8).toFixed(1) : Math.max(2.4, (24.0 - freqDiff * 6.5 - minPhaseDiff * 0.08)).toFixed(1);
  const bitrate = isSynchronized ? '128 kbps' : `${Math.max(4, Math.round(Number(snr) * 3))} kbps`;

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
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isSynchronized ? 'bg-primary-container shadow-[0_0_10px_#00f2fe]' : 'bg-status-warning'
                }`}
              />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-bright font-headline">
                  DSN 70M PHASE RESONANCE TUNER
                </h3>
                <p className="text-[10px] text-text-dim">Deep Space Carrier Lock Acquisition</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold text-sm bg-surface-container-lowest px-2.5 py-1 rounded">
                {secondsRemaining}s WINDOW
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

          {/* Oscilloscope Canvas */}
          <div className="my-2 bg-surface-container-lowest p-3 rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-text-dim">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-telemetry-cyan" />
                <span>LOCAL VCO SINE</span>
                <span className="w-2.5 h-0.5 bg-status-warning ml-2" />
                <span>DSN GOLDSTONE CARRIER</span>
              </div>
              <span className={isSynchronized ? 'text-telemetry-cyan font-bold' : 'text-status-warning'}>
                {isSynchronized ? '● PHASE LOCK ENGAGED' : '○ CARRIER SEARCH...'}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={560}
              height={120}
              className="w-full h-28 rounded bg-black/60 block"
            />

            {/* Hold meter */}
            <div>
              <div className="flex justify-between text-[10px] text-text-dim mb-1">
                <span>HOLD RESONANCE FOR 2.0s</span>
                <span className="text-telemetry-cyan font-bold">{lockProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container transition-all duration-75"
                  style={{ width: `${lockProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-1">
            <div className="space-y-2 bg-surface-container p-3 rounded-lg">
              <div>
                <div className="flex justify-between text-[11px] text-text-dim mb-1">
                  <span>CARRIER FREQUENCY</span>
                  <span className="text-telemetry-cyan font-bold">{freq.toFixed(2)} GHz</span>
                </div>
                <input
                  type="range"
                  min="31.0"
                  max="37.0"
                  step="0.05"
                  value={freq}
                  onChange={(e) => setFreq(Number(e.target.value))}
                  className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1.5 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-text-dim mb-1">
                  <span>PHASE SHIFT ANGLE</span>
                  <span className="text-telemetry-azure font-bold">{phase}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="2"
                  value={phase}
                  onChange={(e) => setPhase(Number(e.target.value))}
                  className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1.5 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest p-3 rounded-lg text-center">
              <div>
                <span className="text-[9px] text-text-dim uppercase tracking-wider block">SNR RATIO</span>
                <span className="text-base font-bold text-amber-400">{snr} dB</span>
              </div>
              <div>
                <span className="text-[9px] text-text-dim uppercase tracking-wider block">DOWNLINK RATE</span>
                <span className="text-base font-bold text-text-bright">{bitrate}</span>
              </div>
              <div>
                <span className="text-[9px] text-text-dim uppercase tracking-wider block">FREQ OFFSET</span>
                <span className="text-[11px] text-text-dim">Δ {freqDiff.toFixed(2)} GHz</span>
              </div>
              <div>
                <span className="text-[9px] text-text-dim uppercase tracking-wider block">PHASE DELTA</span>
                <span className="text-[11px] text-text-dim">Δ {minPhaseDiff.toFixed(0)}°</span>
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
                {isResolved === 'success' ? 'DSN 70M CARRIER LOCKED' : 'SIGNAL LOSS DISCONNECT'}
              </h4>
              <p className="text-xs text-text-dim max-w-sm mb-4 leading-relaxed">
                {isResolved === 'success'
                  ? 'Goldstone 70m antenna acquired carrier resonance lock. High-bandwidth scientific telemetry downlink established (+18.5 GB).'
                  : 'Atmospheric CME noise drowned out radio signal. Data buffer overflow experienced.'}
              </p>
              <button
                onClick={() => {
                  sfx.playClick();
                  if (isResolved === 'success') {
                    onSuccess(18.5);
                  } else {
                    onFailure();
                  }
                }}
                className="px-5 py-2 bg-primary-container text-on-primary-container font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Acknowledge & Continue
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

