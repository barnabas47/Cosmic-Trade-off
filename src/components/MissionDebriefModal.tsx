import React, { useEffect, useRef } from 'react';
import { MissionScorecard } from '../types/mission';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, AlertTriangle, XCircle, RotateCcw, ArrowRight, Download } from 'lucide-react';
import { sfx } from '../utils/audio';

interface MissionDebriefModalProps {
  scorecard: MissionScorecard | null;
  onClose: () => void;
  onRestart: () => void;
}

export const MissionDebriefModal: React.FC<MissionDebriefModalProps> = ({
  scorecard,
  onClose,
  onRestart,
}) => {
  const patchSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (scorecard && (scorecard.grade === 'A+' || scorecard.grade === 'A' || scorecard.grade === 'B')) {
      sfx.playCheeringCelebration();
      setTimeout(() => sfx.playQuindarTone(), 900);

      // Multi-stage realistic mission control celebration cannons!
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { x: 0.2, y: 0.65 },
        colors: ['#00f2fe', '#38bdf8', '#fbbf24', '#ffffff', '#34d399'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { x: 0.8, y: 0.65 },
          colors: ['#00f2fe', '#9d4edd', '#fbbf24', '#38bdf8'],
        });
      }, 300);

      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#fbbf24', '#00f2fe', '#e0fdff'],
        });
      }, 700);
    }
  }, [scorecard]);

  if (!scorecard) return null;

  const isSuccess = scorecard.grade === 'A+' || scorecard.grade === 'A' || scorecard.grade === 'B';

  const downloadPatchSvg = () => {
    sfx.playClick();
    if (!patchSvgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(patchSvgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NASA-JPL-Mission-Patch-${scorecard.grade}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gradeColors: Record<string, string> = {
    'A+': 'text-emerald-400 bg-emerald-500/15 shadow-[0_0_35px_rgba(52,211,153,0.35)]',
    A: 'text-telemetry-cyan bg-cyan-500/15 shadow-[0_0_30px_rgba(0,242,254,0.35)]',
    B: 'text-purple-400 bg-purple-500/15',
    C: 'text-amber-400 bg-amber-500/15',
    D: 'text-orange-400 bg-orange-500/15',
    F: 'text-red-400 bg-red-500/15',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl rounded-xl bg-surface-container-high p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col justify-between">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-primary-container/15 blur-3xl" />

        <div className="overflow-y-auto pr-1 space-y-4">
          {/* Modal Header */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-telemetry-cyan flex items-center gap-1.5 font-bold">
                <Award className="h-4 w-4" /> NASA Flight Evaluation Directorate
              </span>
              <h2 className="text-2xl font-headline font-bold text-text-bright tracking-tight mt-1">
                {scorecard.summaryTitle}
              </h2>
              {isSuccess && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300">
                    JPL LUCKY PEANUTS OBSERVED
                  </span>
                  <span className="text-[11px] font-mono text-text-dim">
                    Flight Director Declaration: Objectives Nominal
                  </span>
                </div>
              )}
            </div>

            {/* Grade Badge */}
            <div
              className={`flex flex-col items-center justify-center h-16 w-16 rounded-xl font-mono font-bold text-2xl shadow-lg shrink-0 ${
                gradeColors[scorecard.grade] || gradeColors['B']
              }`}
            >
              <span>{scorecard.grade}</span>
              <span className="text-[9px] font-sans text-text-dim -mt-1 uppercase">GRADE</span>
            </div>
          </div>

          <p className="text-xs text-text-dim leading-relaxed">
            {scorecard.summaryAnalysis}
          </p>

          {/* NASA Commemorative Mission Patch Card */}
          {isSuccess && (
            <div className="p-4 rounded-lg bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-4">
                {/* SVG Mission Patch Vector */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg
                    ref={patchSvgRef}
                    viewBox="0 0 200 200"
                    className="w-full h-full drop-shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="patchBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0a192f" />
                        <stop offset="100%" stopColor="#020813" />
                      </radialGradient>
                    </defs>

                    {/* Outer Gold Ring */}
                    <circle cx="100" cy="100" r="96" fill="#1b2a47" stroke="#fbbf24" strokeWidth="4" />
                    <circle cx="100" cy="100" r="86" fill="url(#patchBg)" stroke="#00f2fe" strokeWidth="2" strokeDasharray="4 2" />

                    {/* Stars */}
                    <circle cx="45" cy="65" r="1.5" fill="#ffffff" />
                    <circle cx="155" cy="60" r="1.5" fill="#ffffff" />
                    <circle cx="140" cy="135" r="1.5" fill="#ffffff" />
                    <circle cx="60" cy="140" r="1.5" fill="#ffffff" />
                    <circle cx="100" cy="40" r="2" fill="#fbbf24" />

                    {/* Orbital Trajectory Arc */}
                    <path
                      d="M 35 130 C 50 50, 150 50, 165 130"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                    />

                    {/* Spacecraft Silhouette */}
                    <polygon
                      points="100,55 92,75 100,70 108,75"
                      fill="#00f2fe"
                    />

                    {/* Target Celestial Sphere */}
                    <circle cx="100" cy="115" r="24" fill="#38bdf8" opacity="0.35" />
                    <circle cx="100" cy="115" r="18" fill="#00dce6" opacity="0.8" />

                    {/* Text Insignia */}
                    <text x="100" y="162" textAnchor="middle" fill="#e0fdff" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                      JPL FLIGHT LAB
                    </text>
                    <text x="100" y="176" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="JetBrains Mono, monospace">
                      ★ GRADE {scorecard.grade} ★
                    </text>
                  </svg>
                </div>

                <div>
                  <div className="font-headline text-sm font-bold text-text-bright">
                    Commemorative NASA Mission Patch
                  </div>
                  <p className="text-[11px] text-text-dim mt-0.5">
                    Official flight insignia generated for mission completion. Verified by NASA Flight Directorate.
                  </p>
                </div>
              </div>

              {/* 1-Click Download Button */}
              <button
                onClick={downloadPatchSvg}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(0,242,254,0.3)] hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Download Patch</span>
              </button>
            </div>
          )}

          {/* Score Category Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-text-dim">
              Mission Objective Scorecard ({scorecard.overallScore}/100 Overall)
            </div>

            <div className="space-y-1.5">
              {scorecard.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-surface-container-low p-3 flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {item.status === 'optimal' ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : item.status === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className="text-xs font-semibold text-text-bright">{item.category}</span>
                    </div>
                    <p className="text-[11px] text-text-dim pl-5">{item.comment}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-telemetry-cyan">
                      {item.points}
                    </span>
                    <span className="font-mono text-[10px] text-text-dim">/{item.maxPoints}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 pt-3 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-dim hover:text-text-bright text-xs font-mono transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Redesign Mission
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-primary-container to-telemetry-azure text-on-primary-container text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <span>Return to Lab</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
