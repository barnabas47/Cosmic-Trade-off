import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Destination, MissionEngineeringMetrics } from '../../types/mission';

interface StitchAstrodynamicsViewportProps {
  destination: Destination;
  metrics: MissionEngineeringMetrics;
}

interface InspectableNode {
  id: string;
  name: string;
  tag: string;
  distance: string;
  details: string;
  x: number;
  y: number;
}

export const StitchAstrodynamicsViewport: React.FC<StitchAstrodynamicsViewportProps> = ({
  destination,
  metrics,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [trajectoryMode, setTrajectoryMode] = useState<'hohmann' | 'gravity'>('gravity');
  const [warpSpeed, setWarpSpeed] = useState<number>(10);
  const [scrubPercent, setScrubPercent] = useState<number>(62);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Pan & Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hovered / Selected Node
  const [inspectedNode, setInspectedNode] = useState<InspectableNode | null>(null);

  // Reset View
  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  // Zoom Handler
  const handleZoom = (delta: number) => {
    setZoom((z) => Math.min(2.2, Math.max(0.65, z + delta)));
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((z) => Math.min(2.2, Math.max(0.65, z + zoomDelta)));
  };

  // Pointer drag events for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: pan.x, y: pan.y };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Animation loop for flight progress and particle trails
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setScrubPercent((p) => {
        const next = p + 0.15 * (warpSpeed / 10);
        return next > 100 ? 0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, warpSpeed]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particleOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Deep void backdrop
      ctx.fillStyle = '#0e0e12';
      ctx.fillRect(0, 0, width, height);

      // Save transform for Pan & Zoom
      ctx.save();
      ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Center coordinates relative to canvas
      const centerX = width * 0.38;
      const centerY = height * 0.62;

      // Distance radiuses
      const rEarth = 140;
      const rMars = 210;
      let rTarget = 380;
      if (destination.id === 'moon') rTarget = 175;
      else if (destination.id === 'mars') rTarget = 240;
      else if (destination.id === 'europa') rTarget = 390;
      else if (destination.id === 'titan') rTarget = 440;

      // 1. Grid coordinates & distance rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);

      [80, 140, 210, 290, rTarget].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 2. Sun (Sol 1.00 AU)
      particleOffset += 0.02;
      const coronaPulse = 18 + Math.sin(particleOffset * 2) * 4;
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, coronaPulse + 16);
      sunGlow.addColorStop(0, '#6ff6ff');
      sunGlow.addColorStop(0.3, 'rgba(0, 242, 254, 0.35)');
      sunGlow.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coronaPulse + 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6ff6ff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Sol Label (clean, offset, no collision)
      ctx.fillStyle = '#71717a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SOL (1.00 AU)', centerX, centerY + 28);

      // 3. Earth Orbit & Body
      const earthAngle = Math.PI * 1.15;
      const earthX = centerX + Math.cos(earthAngle) * rEarth;
      const earthY = centerY + Math.sin(earthAngle) * rEarth;

      // Earth Orbit dashed arc
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, rEarth, 0, Math.PI * 2);
      ctx.stroke();

      // Earth Atmosphere Glow
      const earthGlow = ctx.createRadialGradient(earthX, earthY, 2, earthX, earthY, 18);
      earthGlow.addColorStop(0, '#38bdf8');
      earthGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(earthX, earthY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(earthX, earthY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Earth clean label
      ctx.fillStyle = '#e0fdff';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('EARTH [1.0 AU]', earthX - 12, earthY + 4);

      // 4. Intermediate / Gravity Assist Flyby Node
      let flybyX = earthX;
      let flybyY = earthY;
      let hasFlyby = trajectoryMode === 'gravity' && destination.id !== 'moon';
      if (hasFlyby) {
        const flybyAngle = Math.PI * 0.72;
        flybyX = centerX + Math.cos(flybyAngle) * rMars;
        flybyY = centerY + Math.sin(flybyAngle) * rMars;

        // Flyby SOI ring
        ctx.strokeStyle = 'rgba(200, 106, 80, 0.25)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(flybyX, flybyY, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#c86a50';
        ctx.beginPath();
        ctx.arc(flybyX, flybyY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Leader line & label for Gravity node (upward offset, no collision)
        ctx.strokeStyle = 'rgba(200, 106, 80, 0.5)';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(flybyX, flybyY - 6);
        ctx.lineTo(flybyX - 15, flybyY - 24);
        ctx.lineTo(flybyX - 60, flybyY - 24);
        ctx.stroke();

        ctx.fillStyle = '#b9cacb';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('GRAVITY ASSIST (+1.4 km/s)', flybyX - 65, flybyY - 21);
      }

      // 5. Target Planet System (Europa/Jupiter, Mars, Titan, Moon)
      const targetAngle = Math.PI * 0.25;
      const targetX = centerX + Math.cos(targetAngle) * rTarget;
      const targetY = centerY + Math.sin(targetAngle) * rTarget;

      // Target Orbit Ring
      ctx.strokeStyle = 'rgba(157, 78, 221, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, rTarget, 0, Math.PI * 2);
      ctx.stroke();

      // Parent Jovian / Saturnian body if Europa or Titan
      if (destination.id === 'europa' || destination.id === 'titan') {
        const parentGlow = ctx.createRadialGradient(targetX + 35, targetY - 15, 4, targetX + 35, targetY - 15, 36);
        parentGlow.addColorStop(0, 'rgba(157, 78, 221, 0.4)');
        parentGlow.addColorStop(1, 'rgba(157, 78, 221, 0)');
        ctx.fillStyle = parentGlow;
        ctx.beginPath();
        ctx.arc(targetX + 35, targetY - 15, 36, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e0b6ff';
        ctx.beginPath();
        ctx.arc(targetX + 35, targetY - 15, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Target Moon / Body
      const destGlow = ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, 20);
      destGlow.addColorStop(0, '#00f2fe');
      destGlow.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = destGlow;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Target Label (Clean above, no overlap)
      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${destination.name.split('—')[0].trim()} (${destination.distanceAU} AU)`, targetX + 16, targetY + 4);

      // 6. Hyperbolic Transfer Trajectory Bezier Curve
      ctx.setLineDash([]);
      ctx.lineWidth = 3;

      let cp1X: number;
      let cp1Y: number;
      let cp2X: number;
      let cp2Y: number;

      if (hasFlyby) {
        // Curve passing through Gravity Flyby node
        cp1X = (earthX + flybyX) / 2 - 30;
        cp1Y = centerY - 140;
        cp2X = (flybyX + targetX) / 2 + 20;
        cp2Y = centerY - 180;
      } else {
        // Direct Hohmann arc
        cp1X = (earthX + targetX) / 2 - 40;
        cp1Y = centerY - 200;
        cp2X = (earthX + targetX) / 2 + 60;
        cp2Y = centerY - 180;
      }

      const grad = ctx.createLinearGradient(earthX, earthY, targetX, targetY);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.75, '#9d4edd');
      grad.addColorStop(1, '#00f2fe');
      ctx.strokeStyle = grad;

      ctx.beginPath();
      ctx.moveTo(earthX, earthY);
      if (hasFlyby) {
        ctx.quadraticCurveTo(cp1X, cp1Y, flybyX, flybyY);
        ctx.quadraticCurveTo(cp2X, cp2Y, targetX, targetY);
      } else {
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY);
      }
      ctx.stroke();

      // 7. Spacecraft Probe Position along Path
      const t = scrubPercent / 100;
      let scX: number;
      let scY: number;

      if (hasFlyby) {
        if (t <= 0.5) {
          const u = t * 2;
          scX = Math.pow(1 - u, 2) * earthX + 2 * (1 - u) * u * cp1X + Math.pow(u, 2) * flybyX;
          scY = Math.pow(1 - u, 2) * earthY + 2 * (1 - u) * u * cp1Y + Math.pow(u, 2) * flybyY;
        } else {
          const u = (t - 0.5) * 2;
          scX = Math.pow(1 - u, 2) * flybyX + 2 * (1 - u) * u * cp2X + Math.pow(u, 2) * targetX;
          scY = Math.pow(1 - u, 2) * flybyY + 2 * (1 - u) * u * cp2Y + Math.pow(u, 2) * targetY;
        }
      } else {
        scX =
          Math.pow(1 - t, 3) * earthX +
          3 * Math.pow(1 - t, 2) * t * cp1X +
          3 * (1 - t) * Math.pow(t, 2) * cp2X +
          Math.pow(t, 3) * targetX;
        scY =
          Math.pow(1 - t, 3) * earthY +
          3 * Math.pow(1 - t, 2) * t * cp1Y +
          3 * (1 - t) * Math.pow(t, 2) * cp2Y +
          Math.pow(t, 3) * targetY;
      }

      // Animated Ion Engine Plume / Particle trail behind probe
      for (let i = 1; i <= 6; i++) {
        const trailT = Math.max(0, t - i * 0.015);
        let trX: number;
        let trY: number;
        if (hasFlyby) {
          if (trailT <= 0.5) {
            const u = trailT * 2;
            trX = Math.pow(1 - u, 2) * earthX + 2 * (1 - u) * u * cp1X + Math.pow(u, 2) * flybyX;
            trY = Math.pow(1 - u, 2) * earthY + 2 * (1 - u) * u * cp1Y + Math.pow(u, 2) * flybyY;
          } else {
            const u = (trailT - 0.5) * 2;
            trX = Math.pow(1 - u, 2) * flybyX + 2 * (1 - u) * u * cp2X + Math.pow(u, 2) * targetX;
            trY = Math.pow(1 - u, 2) * flybyY + 2 * (1 - u) * u * cp2Y + Math.pow(u, 2) * targetY;
          }
        } else {
          trX =
            Math.pow(1 - trailT, 3) * earthX +
            3 * Math.pow(1 - trailT, 2) * trailT * cp1X +
            3 * (1 - trailT) * Math.pow(trailT, 2) * cp2X +
            Math.pow(trailT, 3) * targetX;
          trY =
            Math.pow(1 - trailT, 3) * earthY +
            3 * Math.pow(1 - trailT, 2) * trailT * cp1Y +
            3 * (1 - trailT) * Math.pow(trailT, 2) * cp2X +
            Math.pow(trailT, 3) * targetY;
        }

        ctx.fillStyle = `rgba(0, 242, 254, ${(1 - i / 7) * 0.4})`;
        ctx.beginPath();
        ctx.arc(trX, trY, 3.5 - i * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spacecraft beacon pulse
      const scPulse = 14 + Math.sin(particleOffset * 4) * 3;
      const probeGlow = ctx.createRadialGradient(scX, scY, 2, scX, scY, scPulse);
      probeGlow.addColorStop(0, '#00f2fe');
      probeGlow.addColorStop(0.5, 'rgba(0, 242, 254, 0.4)');
      probeGlow.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = probeGlow;
      ctx.beginPath();
      ctx.arc(scX, scY, scPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scX, scY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Spacecraft Crosshair box
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(scX - 7, scY - 7, 14, 14);

      // Probe Tooltip Badge (Dynamic smart placement: positioned above and to the right)
      const pillW = 148;
      const pillH = 26;
      const pillX = scX + 16;
      const pillY = scY - 32;

      ctx.fillStyle = 'rgba(27, 27, 31, 0.92)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
      ctx.fill();

      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`PROBE-1 [MET ${Math.round(scrubPercent * 5.5)}D]`, pillX + 10, pillY + 16);

      // Trajectory Leader Line
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(pillX, pillY + pillH / 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [pan, zoom, scrubPercent, trajectoryMode, destination, metrics]);

  // Current calculated physics along trajectory
  const currentDistAU = (1.0 + (scrubPercent / 100) * (destination.distanceAU - 1.0)).toFixed(2);
  const currentVelocityKmS = (
    metrics.deltaVAvailableKmS * 3.8 -
    Math.sin((scrubPercent / 100) * Math.PI) * 4.2
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-space-md w-full select-none">
      {/* Viewport Canvas Enclosure */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative rounded-lg bg-surface-container-lowest shadow-2xl overflow-hidden p-space-lg flex flex-col justify-between min-h-[560px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-28 -left-24 w-96 h-96 rounded-full bg-aurora-violet/10 blur-[130px] pointer-events-none" />

        {/* Viewport Header Overlay */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-sm pointer-events-auto">
          <div className="flex items-center gap-space-sm">
            <span className="px-space-sm py-space-xs rounded-full bg-primary-container/10 text-primary-container font-mono text-xs tracking-wider uppercase font-semibold">
              JPL KEPLERIAN SOLVER v4.2
            </span>
            <span className="text-xs text-text-dim">
              {destination.name} Astrodynamics Profile
            </span>
          </div>

          {/* Interactive Navigation & View Controls */}
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => handleZoom(0.15)}
              className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-bright text-sm font-mono transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-bright text-sm font-mono transition-colors"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={handleResetView}
              className="px-space-sm py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high font-mono text-[11px] text-text-dim hover:text-text-bright transition-colors"
              title="Recenter Camera"
            >
              Recenter
            </button>
          </div>
        </div>

        {/* The 60FPS Interactive Astrodynamics Canvas */}
        <div className="relative my-space-sm w-full h-[360px] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={840}
            height={360}
            className="w-full h-full object-cover select-none"
          />

          {/* Pan Hint Overlay */}
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-surface-container-lowest/70 backdrop-blur-md text-[10px] font-mono text-text-dim pointer-events-none">
            DRAG TO PAN • SCROLL TO ZOOM
          </div>
        </div>

        {/* Floating Telemetry HUD Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-space-xs p-space-xs rounded-DEFAULT bg-surface-container/80 backdrop-blur-md pointer-events-auto">
          <div className="p-space-xs px-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col">
            <span className="font-mono text-[10px] text-text-dim">HYPERBOLIC EXCESS (V∞)</span>
            <span className="font-mono text-xs text-primary font-semibold">
              {currentVelocityKmS} <span className="text-text-dim text-[9px]">KM/S</span>
            </span>
          </div>

          <div className="p-space-xs px-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col">
            <span className="font-mono text-[10px] text-text-dim">DELTA-V BUDGET</span>
            <span className="font-mono text-xs text-telemetry-cyan font-semibold">
              {(destination.deltaVRequired * 1000).toFixed(0)} <span className="text-text-dim text-[9px]">M/S</span>
            </span>
          </div>

          <div className="p-space-xs px-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col">
            <span className="font-mono text-[10px] text-text-dim">SOLAR FLUX (CURRENT)</span>
            <span className={`font-mono text-xs font-semibold ${destination.solarFluxWm2 < 100 ? 'text-status-warning' : 'text-text-bright'}`}>
              {destination.solarFluxWm2} <span className="text-text-dim text-[9px]">W/M²</span>
            </span>
          </div>

          <div className="p-space-xs px-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col">
            <span className="font-mono text-[10px] text-text-dim">LIGHT TIME DELAY</span>
            <span className="font-mono text-xs text-secondary font-semibold">
              {destination.oneWayLightMinutes} <span className="text-text-dim text-[9px]">MIN</span>
            </span>
          </div>
        </div>

        {/* Astrodynamics Controls & Scrubber */}
        <div className="relative z-10 mt-space-md pt-space-xs flex flex-col sm:flex-row items-center justify-between gap-space-md pointer-events-auto">
          <div className="flex items-center gap-space-xs p-space-xs rounded-full bg-surface-container-high/90">
            <button
              onClick={() => setTrajectoryMode('hohmann')}
              className={`px-space-md py-space-xs rounded-full font-mono text-xs uppercase transition-all ${
                trajectoryMode === 'hohmann'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Direct Hohmann
            </button>
            <button
              onClick={() => setTrajectoryMode('gravity')}
              className={`px-space-md py-space-xs rounded-full font-mono text-xs uppercase transition-all ${
                trajectoryMode === 'gravity'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Gravity Assist
            </button>
          </div>

          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high font-mono text-xs text-text-bright"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <div className="flex items-center gap-space-xs">
              <span className="font-mono text-xs text-text-dim uppercase">WARP:</span>
              {[1, 10, 100].map((w) => (
                <button
                  key={w}
                  onClick={() => setWarpSpeed(w)}
                  className={`px-space-xs py-0.5 rounded font-mono text-xs transition-colors ${
                    warpSpeed === w
                      ? 'bg-primary-container/20 text-telemetry-cyan font-semibold'
                      : 'bg-surface-container-high text-text-dim hover:text-text-bright'
                  }`}
                >
                  {w}X
                </button>
              ))}
            </div>

            <div className="flex items-center gap-space-xs flex-1 sm:flex-initial sm:w-44">
              <input
                type="range"
                min={0}
                max={100}
                value={scrubPercent}
                onChange={(e) => {
                  setIsPlaying(false);
                  setScrubPercent(Number(e.target.value));
                }}
                className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1.5 cursor-pointer"
              />
              <span className="font-mono text-xs text-text-bright w-8">{scrubPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Environmental Micro-Card */}
      <div className="p-space-lg rounded-lg bg-surface-container-low shadow-sm flex flex-col sm:flex-row gap-space-lg items-center justify-between">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-status-warning shrink-0">
            <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
          </div>
          <div>
            <div className="font-headline text-sm text-text-bright font-medium">
              Deep Space Environmental Radiation
            </div>
            <p className="text-xs text-on-surface-variant">
              Tantalum-vaulted electronics enclosure rated for 2.4 Mrad total ionizing dose.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-lg shrink-0">
          <div className="text-right">
            <div className="font-mono text-[10px] text-text-dim">ABSORBED DOSE</div>
            <div className="font-mono text-xs text-telemetry-cyan font-semibold">0.42 / 2.40 Mrad</div>
          </div>
          <div className="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '17.5%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
