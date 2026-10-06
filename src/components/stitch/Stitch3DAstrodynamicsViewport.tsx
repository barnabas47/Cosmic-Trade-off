import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Destination, MissionEngineeringMetrics } from '../../types/mission';
import { sfx } from '../../utils/audio';

interface Stitch3DAstrodynamicsViewportProps {
  destination: Destination;
  metrics: MissionEngineeringMetrics;
  onExecuteBurn?: () => void;
}

interface CelestialBody3D {
  id: string;
  name: string;
  class: string;
  a: string;
  e: string;
  v: string;
  r: number;
  color: string;
  glow?: string;
  isSun?: boolean;
  rx?: number;
  ry?: number;
  period?: number;
  angle?: number;
  parent?: string;
  moonDist?: number;
  moonSpeed?: number;
  ringColor?: string;
  inclination?: number;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  currentScreenPos?: { x: number; y: number; scale: number; depth: number; z: number };
}

export const Stitch3DAstrodynamicsViewport: React.FC<Stitch3DAstrodynamicsViewportProps> = ({
  destination,
  metrics,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trajectory & Warp Mode
  const [trajectoryMode, setTrajectoryMode] = useState<'gravity' | 'hohmann'>('gravity');
  const [warpFactor, setWarpFactor] = useState<number>(1);
  const [probeT, setProbeT] = useState<number>(0.62);
  const [followProbe, setFollowProbe] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'ecliptic' | 'topDown' | 'edge'>('ecliptic');

  // Camera 3D Perspective Angles & Zoom State
  const cameraRef = useRef({
    zoom: 1.0,
    targetZoom: 1.0,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    pitch: (45 * Math.PI) / 180,
    targetPitch: (45 * Math.PI) / 180,
    yaw: (-25 * Math.PI) / 180,
    targetYaw: (-25 * Math.PI) / 180,
    isDragging: false,
    dragMode: 'rotate' as 'rotate' | 'pan',
    dragStartX: 0,
    dragStartY: 0,
    initialYaw: 0,
    initialPitch: 0,
    initialPanX: 0,
    initialPanY: 0,
    simTime: 0,
    manualEpochScrub: false,
  });

  // Hovered / Inspected Celestial Body
  const [inspectedBody, setInspectedBody] = useState<CelestialBody3D | null>(null);
  const [cameraAngles, setCameraAngles] = useState({ pitch: '45°', yaw: '-25°', zoom: '1.0x' });

  // Celestial Bodies Model
  const celestialBodiesRef = useRef<CelestialBody3D[]>([
    { id: 'sol', name: 'SOL (1.00 AU)', class: 'G2V STAR', a: '0.000 AU', e: '0.000', v: '0.0 km/s', r: 13, color: '#6ff6ff', isSun: true, inclination: 0 },
    { id: 'earth', name: 'EARTH [1.0 AU]', class: 'TERRESTRIAL', a: '1.000 AU', e: '0.0167', v: '29.78 km/s', r: 7, rx: 140, ry: 135, period: 100, angle: 3.5, color: '#38bdf8', ringColor: 'rgba(56,189,248,0.3)', inclination: 0.0 },
    { id: 'mars', name: 'MARS (1.52 AU)', class: 'TERRESTRIAL', a: '1.524 AU', e: '0.0934', v: '24.07 km/s', r: 5, rx: 200, ry: 195, period: 188, angle: 2.1, color: '#c86a50', ringColor: 'rgba(200,106,80,0.3)', inclination: 0.032 },
    { id: 'jupiter', name: 'JUPITER (5.20 AU)', class: 'GAS GIANT', a: '5.204 AU', e: '0.0489', v: '13.07 km/s', r: 14, rx: 370, ry: 360, period: 1186, angle: 5.4, color: '#e0b6ff', ringColor: 'rgba(224,182,255,0.22)', inclination: 0.022 },
    { id: 'europa', name: 'EUROPA (MOON)', class: 'ICY SATELLITE', a: '670,900 km', e: '0.009', v: '13.74 km/s', r: 4, parent: 'jupiter', moonDist: 26, moonSpeed: 5.0, angle: 1.2, color: '#00f2fe' }
  ]);

  // Adjust celestial target when destination changes
  useEffect(() => {
    const bodies = celestialBodiesRef.current;
    const destTarget = destination.id;
    if (destTarget === 'moon') {
      const jupIdx = bodies.findIndex((b) => b.id === 'jupiter');
      if (jupIdx !== -1) bodies.splice(jupIdx, 2);
      if (!bodies.find((b) => b.id === 'moon')) {
        bodies.push({
          id: 'moon',
          name: 'LUNA (MOON)',
          class: 'NATURAL SATELLITE',
          a: '384,400 km',
          e: '0.0549',
          v: '1.02 km/s',
          r: 4,
          parent: 'earth',
          moonDist: 22,
          moonSpeed: 8.0,
          angle: 0.8,
          color: '#38bdf8',
        });
      }
    } else if (destTarget === 'mars') {
      const euroIdx = bodies.findIndex((b) => b.id === 'europa');
      if (euroIdx !== -1) bodies.splice(euroIdx, 1);
    }
  }, [destination]);

  // 3D Spatial Projection Function
  const project3D = useCallback((x: number, y: number, z: number, w: number, h: number) => {
    const cam = cameraRef.current;
    const cx = w * 0.44 + cam.panX;
    const cy = h * 0.52 + cam.panY;

    // 1. Yaw rotation (around Z-axis)
    const cosY = Math.cos(cam.yaw);
    const sinY = Math.sin(cam.yaw);
    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;
    const z1 = z;

    // 2. Pitch rotation (around X-axis)
    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;
    const x2 = x1;

    // 3. Perspective Camera calculation
    const fovDist = 950;
    const depth = fovDist + z2;
    const pScale = (fovDist / Math.max(120, depth)) * cam.zoom;

    return {
      x: cx + x2 * pScale,
      y: cy + y2 * pScale,
      scale: pScale,
      depth: depth,
      z: z2,
    };
  }, []);

  // 3D Bezier Trajectory math
  const getTransferPoints3D = useCallback(() => {
    if (trajectoryMode === 'gravity') {
      return {
        p0: { x: -130, y: -45, z: 0 },
        p1: { x: -30, y: -160, z: 18 },
        p2: { x: 120, y: -130, z: -10 },
        p3: { x: 350, y: -90, z: 0 },
      };
    } else {
      return {
        p0: { x: -130, y: -45, z: 0 },
        p1: { x: -20, y: -210, z: 12 },
        p2: { x: 190, y: -230, z: -8 },
        p3: { x: 350, y: -90, z: 0 },
      };
    }
  }, [trajectoryMode]);

  const getBezierPoint3D = (t: number, p0: any, p1: any, p2: any, p3: any) => {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
      z: uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z,
    };
  };

  const getBezierTangent3D = (t: number, p0: any, p1: any, p2: any, p3: any) => {
    const u = 1 - t;
    return {
      x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
      y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
      z: 3 * u * u * (p1.z - p0.z) + 6 * u * t * (p2.z - p1.z) + 3 * t * t * (p3.z - p2.z),
    };
  };

  // Main 3D Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: {
      worldX: number;
      worldY: number;
      worldZ: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      size: number;
      color: string;
    }[] = [];

    const handleResize = () => {
      const parent = canvas.parentElement || container;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const parent = canvas.parentElement || container;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cam = cameraRef.current;

      // Smooth camera dampening
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.12;
      cam.panX += (cam.targetPanX - cam.panX) * 0.12;
      cam.panY += (cam.targetPanY - cam.panY) * 0.12;
      cam.pitch += (cam.targetPitch - cam.pitch) * 0.12;
      cam.yaw += (cam.targetYaw - cam.yaw) * 0.12;

      cam.simTime += 0.016 * (warpFactor / 10);

      if (!cam.manualEpochScrub) {
        setProbeT((prevT) => (prevT + 0.00035 * (warpFactor / 10)) % 1.0);
      }

      let displayYaw = Math.round((cam.yaw * 180) / Math.PI) % 360;
      if (displayYaw < 0) displayYaw += 360;
      setCameraAngles({
        pitch: `${Math.round((cam.pitch * 180) / Math.PI)}°`,
        yaw: `${displayYaw}°`,
        zoom: `${cam.zoom.toFixed(1)}x`,
      });

      const pts = getTransferPoints3D();

      // Update Keplerian celestial orbits in 3D
      celestialBodiesRef.current.forEach((b) => {
        if (b.isSun) {
          b.worldX = 0;
          b.worldY = 0;
          b.worldZ = 0;
        } else if (b.parent) {
          const parent = celestialBodiesRef.current.find((cb) => cb.id === b.parent);
          b.angle = (b.angle || 0) + 0.04 * (warpFactor / 10);
          b.worldX = (parent?.worldX || 0) + Math.cos(b.angle) * (b.moonDist || 20);
          b.worldY = (parent?.worldY || 0) + Math.sin(b.angle) * (b.moonDist || 20);
          b.worldZ = (parent?.worldZ || 0) + Math.sin(b.angle * 1.5) * 4;
        } else {
          b.angle = (b.angle || 0) + (1.5 / (b.period || 100)) * (warpFactor / 10);
          b.worldX = Math.cos(b.angle) * (b.rx || 100);
          b.worldY = Math.sin(b.angle) * (b.ry || 100);
          b.worldZ = Math.sin(b.angle) * ((b.rx || 100) * (b.inclination || 0));
        }

        b.currentScreenPos = project3D(b.worldX || 0, b.worldY || 0, b.worldZ || 0, w, h);
      });

      // Spacecraft World Position in 3D
      const probeWorld = getBezierPoint3D(probeT, pts.p0, pts.p1, pts.p2, pts.p3);
      const probeTangent = getBezierTangent3D(probeT, pts.p0, pts.p1, pts.p2, pts.p3);

      // Follow Probe Camera
      if (followProbe) {
        const probeProj = project3D(probeWorld.x, probeWorld.y, probeWorld.z, w, h);
        cam.targetPanX += (w * 0.44 - probeProj.x) * 0.08;
        cam.targetPanY += (h * 0.52 - probeProj.y) * 0.08;
      }

      // 1. Draw 3D Radial Grid Rings
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.setLineDash([3, 5]);

      [90, 180, 280, 390].forEach((r) => {
        ctx.beginPath();
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const p = project3D(Math.cos(theta) * r, Math.sin(theta) * r, 0, w, h);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      });

      // Ecliptic Coordinate Axes through Sun
      ctx.beginPath();
      const pCrossX1 = project3D(-420, 0, 0, w, h);
      const pCrossX2 = project3D(420, 0, 0, w, h);
      const pCrossY1 = project3D(0, -420, 0, w, h);
      const pCrossY2 = project3D(0, 420, 0, w, h);
      ctx.moveTo(pCrossX1.x, pCrossX1.y);
      ctx.lineTo(pCrossX2.x, pCrossX2.y);
      ctx.moveTo(pCrossY1.x, pCrossY1.y);
      ctx.lineTo(pCrossY2.x, pCrossY2.y);
      ctx.stroke();

      // 2. Draw 3D Planetary Orbit Rings
      celestialBodiesRef.current.forEach((b) => {
        if (b.rx && b.ry) {
          ctx.strokeStyle = b.ringColor || 'rgba(255, 255, 255, 0.12)';
          ctx.setLineDash(b.id === 'jupiter' ? [6, 6] : [4, 4]);
          ctx.beginPath();
          const segments = 64;
          for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const wx = Math.cos(theta) * b.rx;
            const wy = Math.sin(theta) * b.ry;
            const wz = Math.sin(theta) * (b.rx * (b.inclination || 0));
            const p = project3D(wx, wy, wz, w, h);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);

      // 3. Gravity Assist Ripple at Mars node
      if (trajectoryMode === 'gravity') {
        const assistPt = pts.p2;
        const assistProj = project3D(assistPt.x, assistPt.y, assistPt.z, w, h);
        const rippleR = ((cam.simTime * 25) % 45) * assistProj.scale;

        ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, 0.7 - rippleR / (45 * assistProj.scale))})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(assistProj.x, assistProj.y, Math.max(1, rippleR), 0, Math.PI * 2);
        ctx.stroke();

        // Mars callout billboard
        ctx.strokeStyle = 'rgba(132, 148, 149, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(assistProj.x, assistProj.y);
        ctx.lineTo(assistProj.x + 30, assistProj.y - 20);
        ctx.stroke();
        ctx.fillStyle = '#b9cacb';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('MARS GRAVITY ASSIST (+1.4 km/s)', assistProj.x + 35, assistProj.y - 18);
      }

      // 4. Draw 3D Hyperbolic Trajectory with Multi-Stop Perspective Line
      const transferSteps = 80;
      const trajectoryProjPoints: any[] = [];
      for (let i = 0; i <= transferSteps; i++) {
        const tStep = i / transferSteps;
        const wp = getBezierPoint3D(tStep, pts.p0, pts.p1, pts.p2, pts.p3);
        trajectoryProjPoints.push(project3D(wp.x, wp.y, wp.z, w, h));
      }

      ctx.save();
      const pStart = trajectoryProjPoints[0];
      const pEnd = trajectoryProjPoints[trajectoryProjPoints.length - 1];
      const grad = ctx.createLinearGradient(pStart.x, pStart.y, pEnd.x, pEnd.y);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.45, '#38bdf8');
      grad.addColorStop(0.7, '#9d4edd');
      grad.addColorStop(1, '#00f2fe');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.2 * Math.min(1.4, Math.max(0.7, cam.zoom));
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      trajectoryProjPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();

      // Delta-V launch guidelines
      const p0Proj = trajectoryProjPoints[0];
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(p0Proj.x, p0Proj.y);
      ctx.lineTo(p0Proj.x + 40, p0Proj.y - 28);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(p0Proj.x + 40, p0Proj.y - 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e0fdff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('ΔV1: +2.84 km/s', p0Proj.x + 48, p0Proj.y - 26);

      // 5. Draw Celestial Bodies and Probe (z-depth sorted)
      const renderList: any[] = celestialBodiesRef.current.map((b) => ({
        type: 'body',
        data: b,
        depth: b.currentScreenPos ? b.currentScreenPos.depth : 0,
      }));

      const probeProj = project3D(probeWorld.x, probeWorld.y, probeWorld.z, w, h);
      renderList.push({
        type: 'probe',
        proj: probeProj,
        depth: probeProj.depth,
      });

      renderList.sort((a, b) => b.depth - a.depth);

      renderList.forEach((item) => {
        if (item.type === 'body') {
          const b = item.data;
          const p = b.currentScreenPos;
          if (!p) return;

          ctx.save();
          if (b.isSun) {
            const sunPulse = (18 + Math.sin(cam.simTime * 2) * 4) * p.scale;
            ctx.fillStyle = 'rgba(111, 246, 255, 0.12)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, sunPulse * 1.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(p.x, p.y, b.r * p.scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#71717a';
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillText('SOL (1.00 AU)', p.x - 28, p.y + 24);
          } else {
            // Planet Sphere with 3D shaded radial gradient
            const isHovered = inspectedBody?.id === b.id;
            const rad = (isHovered ? b.r * 1.3 : b.r) * p.scale;
            const planetGrad = ctx.createRadialGradient(
              p.x - rad * 0.35,
              p.y - rad * 0.35,
              rad * 0.1,
              p.x,
              p.y,
              rad
            );
            planetGrad.addColorStop(0, '#ffffff');
            planetGrad.addColorStop(0.35, b.color);
            planetGrad.addColorStop(1, '#0e0e12');

            ctx.fillStyle = planetGrad;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = isHovered ? 20 : 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
            ctx.fill();

            // Billboard label with safe offset
            ctx.shadowBlur = 0;
            ctx.fillStyle = isHovered ? '#00f2fe' : '#f4f4f5';
            ctx.font = '10px "JetBrains Mono", monospace';
            if (b.id === 'earth') {
              ctx.fillText('EARTH [1.0 AU]', p.x - 40, p.y - 14);
            } else if (b.id === 'jupiter') {
              ctx.fillText('JUPITER (5.2 AU)', p.x - 48, p.y - 20);
            } else if (b.id === 'europa') {
              ctx.fillStyle = '#00f2fe';
              ctx.fillText('TARGET: EUROPA', p.x + 12, p.y + 4);
            }
          }
          ctx.restore();
        } else if (item.type === 'probe') {
          // Draw Spacecraft Probe Beacon
          const p = item.proj;
          ctx.save();
          ctx.translate(p.x, p.y);

          // Ping wave
          const probePing = ((cam.simTime * 20) % 30) * p.scale;
          ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, 0.7 - probePing / (30 * p.scale))})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(1, probePing), 0, Math.PI * 2);
          ctx.stroke();

          // Glowing center
          ctx.fillStyle = '#00f2fe';
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, 5 * p.scale, 0, Math.PI * 2);
          ctx.fill();

          // Heading direction vector calculated from tangent in 3D
          const pTangProj = project3D(
            probeWorld.x + probeTangent.x,
            probeWorld.y + probeTangent.y,
            probeWorld.z + probeTangent.z,
            w,
            h
          );
          const headAngle = Math.atan2(pTangProj.y - p.y, pTangProj.x - p.x);

          ctx.rotate(headAngle);
          ctx.fillStyle = '#e0fdff';
          ctx.beginPath();
          ctx.moveTo(8 * p.scale, 0);
          ctx.lineTo(2 * p.scale, -3.5 * p.scale);
          ctx.lineTo(2 * p.scale, 3.5 * p.scale);
          ctx.closePath();
          ctx.fill();
          ctx.rotate(-headAngle);

          // Billboard Probe HUD Leader Line & Badge
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(20, -18);
          ctx.lineTo(40, -18);
          ctx.stroke();

          ctx.fillStyle = 'rgba(31, 31, 35, 0.94)';
          ctx.beginPath();
          ctx.roundRect(42, -30, 148, 24, 6);
          ctx.fill();

          ctx.fillStyle = '#f4f4f5';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(`PROBE-1 [MET ${Math.round(probeT * 550)}D]`, 50, -14);

          ctx.restore();
        }
      });

      // 6. Thruster Sparks Particle simulation in 3D
      if (Math.random() < 0.7) {
        particles.push({
          worldX: probeWorld.x - probeTangent.x * 0.05,
          worldY: probeWorld.y - probeTangent.y * 0.05,
          worldZ: probeWorld.z - probeTangent.z * 0.05,
          vx: -(probeTangent.x * 0.02) + (Math.random() - 0.5) * 1.2,
          vy: -(probeTangent.y * 0.02) + (Math.random() - 0.5) * 1.2,
          vz: -(probeTangent.z * 0.02) + (Math.random() - 0.5) * 1.2,
          life: 1.0,
          size: Math.random() * 2.8 + 1,
          color: Math.random() > 0.4 ? '#00f2fe' : '#9d4edd',
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.worldX += pt.vx;
        pt.worldY += pt.vy;
        pt.worldZ += pt.vz;
        pt.life -= 0.04;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const ptProj = project3D(pt.worldX, pt.worldY, pt.worldZ, w, h);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(ptProj.x, ptProj.y, pt.size * ptProj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [project3D, getTransferPoints3D, probeT, warpFactor, trajectoryMode, followProbe, inspectedBody]);

  // Mouse & Drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    sfx.playClick();
    const cam = cameraRef.current;
    cam.isDragging = true;
    (cam as any).lastClientX = e.clientX;
    (cam as any).lastClientY = e.clientY;

    // Right-click or Shift-key forces PAN
    const isPan = e.button === 2 || e.shiftKey || cam.dragMode === 'pan';
    cam.dragMode = isPan ? 'pan' : 'rotate';

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!cameraRef.current.isDragging) return;
      const c = cameraRef.current as any;
      const dX = moveEvent.clientX - (c.lastClientX ?? moveEvent.clientX);
      const dY = moveEvent.clientY - (c.lastClientY ?? moveEvent.clientY);
      c.lastClientX = moveEvent.clientX;
      c.lastClientY = moveEvent.clientY;

      if (c.dragMode === 'pan') {
        c.targetPanX += dX;
        c.targetPanY += dY;
        setFollowProbe(false);
      } else {
        // Endless continuous yaw rotation (360 degrees indefinitely without boundary)
        c.targetYaw += dX * 0.009;
        // Pitch can smoothly orbit from nadir (-89°) to zenith (+89°)
        c.targetPitch = Math.max(-Math.PI * 0.495, Math.min(Math.PI * 0.495, c.targetPitch + dY * 0.009));
      }
    };

    const onGlobalMouseUp = () => {
      cameraRef.current.isDragging = false;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const cam = cameraRef.current as any;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (cam.isDragging) {
      const deltaX = e.clientX - (cam.lastClientX ?? e.clientX);
      const deltaY = e.clientY - (cam.lastClientY ?? e.clientY);
      cam.lastClientX = e.clientX;
      cam.lastClientY = e.clientY;

      if (cam.dragMode === 'pan') {
        cam.targetPanX += deltaX;
        cam.targetPanY += deltaY;
        setFollowProbe(false);
      } else {
        // Endless continuous yaw rotation (360 degrees indefinitely without stop)
        cam.targetYaw += deltaX * 0.009;
        // Pitch can smoothly orbit from nadir (-89°) to zenith (+89°)
        cam.targetPitch = Math.max(-Math.PI * 0.495, Math.min(Math.PI * 0.495, cam.targetPitch + deltaY * 0.009));
      }
    }

    // Hit-testing celestial bodies for interactive smart inspection
    let found: CelestialBody3D | null = null;
    celestialBodiesRef.current.forEach((b) => {
      if (b.currentScreenPos) {
        const dx = mouseX - b.currentScreenPos.x;
        const dy = mouseY - b.currentScreenPos.y;
        const hitRadius = Math.max(b.r * b.currentScreenPos.scale + 12, 18);
        if (Math.hypot(dx, dy) < hitRadius) {
          found = b;
        }
      }
    });

    if (found && found !== inspectedBody) {
      sfx.playHover();
    }
    setInspectedBody(found);
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    cam.targetZoom = Math.min(Math.max(cam.targetZoom * zoomFactor, 0.45), 3.5);
  };

  // Camera presets
  const setPreset = (preset: 'ecliptic' | 'topDown' | 'edge') => {
    sfx.playClick();
    setActivePreset(preset);
    const cam = cameraRef.current;
    setFollowProbe(false);
    if (preset === 'ecliptic') {
      cam.targetPitch = (45 * Math.PI) / 180;
      cam.targetYaw = (-25 * Math.PI) / 180;
      cam.targetZoom = 1.0;
    } else if (preset === 'topDown') {
      cam.targetPitch = (88 * Math.PI) / 180;
      cam.targetYaw = 0;
    } else if (preset === 'edge') {
      cam.targetPitch = (6 * Math.PI) / 180;
      cam.targetYaw = (-35 * Math.PI) / 180;
    }
  };

  const handleReset = () => {
    sfx.playClick();
    const cam = cameraRef.current;
    cam.targetZoom = 1.0;
    cam.targetPanX = 0;
    cam.targetPanY = 0;
    setPreset('ecliptic');
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 select-none">
      {/* 3D Astrodynamics Canvas Enclosure (Zero Gray Borders) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="relative rounded-lg bg-surface-container-lowest shadow-2xl overflow-hidden p-3 flex flex-col justify-between w-full h-full min-h-0 cursor-grab active:cursor-grabbing"
      >
        {/* Living Ambient Lighting Orbs */}
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-primary-container/10 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-aurora-violet/10 blur-[140px] pointer-events-none" />

        {/* Viewport Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-sm pointer-events-auto">
          <div className="flex items-center gap-space-sm">
            <span className="px-space-sm py-space-xs rounded-full bg-primary-container/10 text-primary-container font-mono text-xs tracking-wider uppercase font-semibold">
              JPL 3D KEPLERIAN SOLVER
            </span>
            <span className="text-xs text-text-dim">
              {destination.name} Heliocentric Model
            </span>
          </div>

          {/* 3D Camera Angles & Presets */}
          <div className="flex items-center gap-space-xs bg-surface-container/70 p-1 rounded-full backdrop-blur-md">
            <button
              onClick={() => setPreset('ecliptic')}
              className={`px-space-sm py-0.5 rounded-full font-mono text-[10px] uppercase transition-all ${
                activePreset === 'ecliptic' && !followProbe
                  ? 'bg-primary-container/20 text-telemetry-cyan font-semibold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Ecliptic 3D
            </button>
            <button
              onClick={() => setPreset('topDown')}
              className={`px-space-sm py-0.5 rounded-full font-mono text-[10px] uppercase transition-all ${
                activePreset === 'topDown' && !followProbe
                  ? 'bg-primary-container/20 text-telemetry-cyan font-semibold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Top-Down
            </button>
            <button
              onClick={() => setPreset('edge')}
              className={`px-space-sm py-0.5 rounded-full font-mono text-[10px] uppercase transition-all ${
                activePreset === 'edge' && !followProbe
                  ? 'bg-primary-container/20 text-telemetry-cyan font-semibold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Edge-On
            </button>
            <button
              onClick={() => {
                sfx.playClick();
                setFollowProbe(!followProbe);
              }}
              className={`px-space-sm py-0.5 rounded-full font-mono text-[10px] uppercase transition-all ${
                followProbe
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,242,254,0.5)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Chase Cam
            </button>
            <button
              onClick={handleReset}
              className="px-space-xs py-0.5 rounded-full font-mono text-[10px] text-text-dim hover:text-text-bright"
              title="Reset View"
            >
              Recenter
            </button>
          </div>
        </div>

        {/* 3D Canvas Canvas Node */}
        <div className="relative my-1 w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block select-none" />

          {/* Interactive Inspection Telemetry Card (Opens when hovering/clicking any body) */}
          {inspectedBody && (
            <div className="absolute top-3 right-3 z-20 w-64 p-3 rounded-lg bg-surface-container-high/90 backdrop-blur-2xl shadow-xl text-xs font-mono pointer-events-none animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <span className="text-primary font-bold">{inspectedBody.name}</span>
                <span className="text-[10px] text-telemetry-cyan font-semibold">{inspectedBody.class}</span>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-text-dim">
                <div className="flex justify-between">
                  <span>Semi-Major Axis:</span>
                  <span className="text-text-bright">{inspectedBody.a}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eccentricity:</span>
                  <span className="text-text-bright">{inspectedBody.e}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orbital Velocity:</span>
                  <span className="text-telemetry-azure">{inspectedBody.v}</span>
                </div>
                <div className="flex justify-between">
                  <span>True Anomaly (ν):</span>
                  <span className="text-primary-fixed">
                    {(((inspectedBody.angle || 0) * (180 / Math.PI)) % 360).toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Camera Angles Micro-HUD */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 font-mono text-[10px] text-text-dim bg-surface-container/60 px-2 py-1 rounded-full backdrop-blur-md pointer-events-none">
            <span>PITCH: <strong className="text-text-bright">{cameraAngles.pitch}</strong></span>
            <span>•</span>
            <span>YAW: <strong className="text-text-bright">{cameraAngles.yaw}</strong></span>
            <span>•</span>
            <span>ZOOM: <strong className="text-telemetry-cyan">{cameraAngles.zoom}</strong></span>
          </div>
        </div>

        {/* Floating Telemetry HUD Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-space-xs p-space-xs rounded-DEFAULT bg-surface-container/80 backdrop-blur-md pointer-events-auto">
          <div className="p-space-xs px-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col">
            <span className="font-mono text-[10px] text-text-dim">HYPERBOLIC EXCESS (V∞)</span>
            <span className="font-mono text-xs text-primary font-semibold">
              {(32.4 + Math.sin(probeT * 4) * 1.2).toFixed(1)} <span className="text-text-dim text-[9px]">KM/S</span>
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
              {(destination.solarFluxWm2 - probeT * 12).toFixed(1)} <span className="text-text-dim text-[9px]">W/M²</span>
            </span>
          </div>

          <div className="p-space-xs px-space-sm rounded-DEFAULT bg-surface-container-low flex flex-col">
            <span className="font-mono text-[10px] text-text-dim">LIGHT TIME DELAY</span>
            <span className="font-mono text-xs text-secondary font-semibold">
              {destination.oneWayLightMinutes} <span className="text-text-dim text-[9px]">MIN</span>
            </span>
          </div>
        </div>

        {/* Trajectory Controls & Epoch Scrubber */}
        <div className="relative z-10 mt-space-md pt-space-xs flex flex-col sm:flex-row items-center justify-between gap-space-md pointer-events-auto">
          <div className="flex items-center gap-space-xs p-space-xs rounded-full bg-surface-container-high/90">
            <button
              onClick={() => {
                sfx.playClick();
                setTrajectoryMode('hohmann');
              }}
              className={`px-space-md py-space-xs rounded-full font-mono text-xs uppercase transition-all ${
                trajectoryMode === 'hohmann'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Direct Hohmann
            </button>
            <button
              onClick={() => {
                sfx.playClick();
                setTrajectoryMode('gravity');
              }}
              className={`px-space-md py-space-xs rounded-full font-mono text-xs uppercase transition-all ${
                trajectoryMode === 'gravity'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(0,242,254,0.3)]'
                  : 'text-text-dim hover:text-text-bright'
              }`}
            >
              Gravity Assist
            </button>
          </div>

          {/* Epoch Slider & Warp controls */}
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <div className="flex items-center gap-space-xs">
              <span className="font-mono text-xs text-text-dim uppercase">WARP:</span>
              {[1, 10, 100].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    sfx.playClick();
                    setWarpFactor(w);
                  }}
                  className={`px-space-xs py-0.5 rounded font-mono text-xs transition-colors ${
                    warpFactor === w
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
                value={Math.round(probeT * 100)}
                onChange={(e) => {
                  cameraRef.current.manualEpochScrub = true;
                  setProbeT(Number(e.target.value) / 100);
                }}
                onMouseUp={() => {
                  setTimeout(() => {
                    cameraRef.current.manualEpochScrub = false;
                  }, 2000);
                }}
                className="w-full accent-primary-container bg-surface-container-highest rounded-full h-1.5 cursor-pointer"
              />
              <span className="font-mono text-xs text-text-bright w-8">{Math.round(probeT * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

