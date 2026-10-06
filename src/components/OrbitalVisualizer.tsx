import React, { useRef, useEffect } from 'react';
import { DestinationId, FlightPhase } from '../types/mission';
import { DESTINATIONS } from '../data/destinations';

interface OrbitalVisualizerProps {
  destinationId: DestinationId;
  flightPhase: FlightPhase;
  phaseProgress: number; // 0 - 100
  velocityKmS: number;
  propellantPercent: number;
}

export const OrbitalVisualizer: React.FC<OrbitalVisualizerProps> = ({
  destinationId,
  flightPhase,
  phaseProgress,
  velocityKmS,
  propellantPercent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dest = DESTINATIONS[destinationId];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const centerX = width * 0.44;
      const centerY = height * 0.50;
      const minDim = Math.min(width, height);

      ctx.clearRect(0, 0, width, height);

      // Deep space starfield
      ctx.fillStyle = '#06060a';
      ctx.fillRect(0, 0, width, height);

      // Distant stars grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const starSeeds = [
        [width * 0.08, height * 0.12],
        [width * 0.22, height * 0.24],
        [width * 0.35, height * 0.08],
        [width * 0.62, height * 0.18],
        [width * 0.85, height * 0.14],
        [width * 0.15, height * 0.72],
        [width * 0.38, height * 0.82],
        [width * 0.70, height * 0.68],
        [width * 0.88, height * 0.78],
        [width * 0.52, height * 0.88],
      ];
      starSeeds.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scale factors dynamically mapped to container dimensions
      const rScale = minDim * 0.38;
      let rTarget = rScale;
      let rEarth = rScale * 0.50;
      if (destinationId === 'moon') {
        rEarth = rScale * 0.60;
        rTarget = rScale * 0.78;
      } else if (destinationId === 'mars') {
        rEarth = rScale * 0.46;
        rTarget = rScale * 0.80;
      } else if (destinationId === 'europa') {
        rEarth = rScale * 0.38;
        rTarget = rScale * 0.92;
      } else if (destinationId === 'titan') {
        rEarth = rScale * 0.32;
        rTarget = rScale * 1.02;
      }

      // 1. Sun / Central Star with multi-stage solar corona
      const sunGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 32);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.35, '#f59e0b');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
      ctx.fill();

      // 2. Earth Orbit line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, rEarth, 0, Math.PI * 2);
      ctx.stroke();

      // Earth body
      const earthAngle = Math.PI * 0.85;
      const earthX = centerX + Math.cos(earthAngle) * rEarth;
      const earthY = centerY + Math.sin(earthAngle) * rEarth;

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(earthX, earthY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('Earth (1.0 AU)', earthX + 9, earthY + 3);

      // 3. Target Orbit line
      ctx.strokeStyle = `${dest.color}40`;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, rTarget, 0, Math.PI * 2);
      ctx.stroke();

      // Target body
      const targetAngle = Math.PI * 0.05;
      const targetX = centerX + Math.cos(targetAngle) * rTarget;
      const targetY = centerY + Math.sin(targetAngle) * rTarget;

      // Glow behind target
      const targetGlow = ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, 28);
      targetGlow.addColorStop(0, `${dest.color}88`);
      targetGlow.addColorStop(1, `${dest.color}00`);
      ctx.fillStyle = targetGlow;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = dest.color;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(dest.name.split('—')[0].trim(), targetX + 11, targetY + 4);

      // 4. Hohmann Transfer Elliptical Arc
      ctx.setLineDash([]);
      ctx.lineWidth = 2.2;
      const arcGrad = ctx.createLinearGradient(earthX, earthY, targetX, targetY);
      arcGrad.addColorStop(0, '#38bdf8');
      arcGrad.addColorStop(0.5, '#00f2fe');
      arcGrad.addColorStop(1, dest.color);
      ctx.strokeStyle = arcGrad;

      const cpX = centerX + (earthX + targetX) / 2 - centerX + 40;
      const cpY = centerY - (rTarget + rEarth) * 0.45;

      ctx.beginPath();
      ctx.moveTo(earthX, earthY);
      ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
      ctx.stroke();

      // 5. Spacecraft Location based on flight phase & progress
      let t = 0;
      if (flightPhase === 'PRE_LAUNCH') t = 0.02;
      else if (flightPhase === 'ASCENT') t = 0.06 + (phaseProgress / 100) * 0.10;
      else if (flightPhase === 'CRUISE') t = 0.16 + (phaseProgress / 100) * 0.65;
      else if (flightPhase === 'ARRIVAL') t = 0.81 + (phaseProgress / 100) * 0.14;
      else if (flightPhase === 'SCIENCE' || flightPhase === 'COMPLETED') t = 0.98;

      const scX = Math.pow(1 - t, 2) * earthX + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * targetX;
      const scY = Math.pow(1 - t, 2) * earthY + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * targetY;

      // Spacecraft thrust flare
      angle += 0.06;
      const pulseSize = 12 + Math.sin(angle) * 3;
      const scGlow = ctx.createRadialGradient(scX, scY, 1, scX, scY, pulseSize);
      scGlow.addColorStop(0, '#00f2fe');
      scGlow.addColorStop(0.5, 'rgba(0, 242, 254, 0.4)');
      scGlow.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = scGlow;
      ctx.beginPath();
      ctx.arc(scX, scY, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Spacecraft reticle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scX, scY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(scX - 7, scY - 7, 14, 14);

      // Trajectory vector line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(scX + 16, scY - 12);
      ctx.stroke();

      // Spacecraft live telemetry pill
      ctx.fillStyle = 'rgba(14, 14, 18, 0.88)';
      ctx.beginPath();
      ctx.roundRect(scX + 18, scY - 28, 125, 30, 4);
      ctx.fill();

      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText(`V: ${velocityKmS.toFixed(1)} km/s`, scX + 24, scY - 16);

      ctx.fillStyle = '#b9cacb';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`PROPELLANT: ${propellantPercent.toFixed(0)}%`, scX + 24, scY - 5);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [destinationId, flightPhase, phaseProgress, velocityKmS, propellantPercent, dest]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-0 rounded-lg bg-[#06060a] overflow-hidden shadow-2xl flex flex-col justify-between select-none"
    >
      {/* Top telemetry banner */}
      <div className="absolute top-2.5 left-3 right-3 z-10 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-telemetry-cyan animate-pulse shadow-[0_0_8px_#00f2fe]" />
          <span className="text-text-bright font-bold uppercase tracking-wider text-[11px]">
            Keplerian Orbit Solver
          </span>
          <span className="text-text-dim text-[10px]">•</span>
          <span className="text-telemetry-cyan text-[11px] font-semibold">{dest.tagline}</span>
        </div>
        <div className="flex items-center gap-3 text-text-dim text-[11px]">
          <span>Target Distance: <strong className="text-text-bright">{dest.distanceAU} AU</strong></span>
          <span className="text-white/20">|</span>
          <span>Light Delay: <strong className="text-text-bright">{dest.oneWayLightMinutes}m</strong></span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Bottom overlay indicators */}
      <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[11px] font-mono text-text-dim pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Sol (1.0 AU)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Earth Departure
          </span>
          <span className="flex items-center gap-1.5" style={{ color: dest.color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dest.color }} /> {dest.name.split('—')[0]} Insertion
          </span>
        </div>
        <span className="text-text-dim text-[10px] tracking-wider uppercase">60 FPS Astrodynamics Mesh</span>
      </div>
    </div>
  );
};
