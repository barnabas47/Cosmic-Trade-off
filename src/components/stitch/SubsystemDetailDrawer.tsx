import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SubsystemDetailInfo {
  title: string;
  category: string;
  costM: number;
  massKg?: number;
  powerW?: number;
  specs: { label: string; value: string }[];
  physicsRationale: string;
  nasaPrecedent: string;
  trlLevel: number; // 1 to 9
}

interface SubsystemDetailDrawerProps {
  info: SubsystemDetailInfo | null;
  onClose: () => void;
}

export const SubsystemDetailDrawer: React.FC<SubsystemDetailDrawerProps> = ({
  info,
  onClose,
}) => {
  if (!info) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-2xl bg-surface-container p-6 shadow-2xl text-xs font-mono"
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary-container/10 blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-telemetry-cyan font-semibold">
                {info.category} • NASA TRL-{info.trlLevel}
              </span>
              <h3 className="font-headline text-lg font-bold text-text-bright mt-0.5">
                {info.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-text-dim hover:text-text-bright transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Key Specs Bento Strip */}
          <div className="grid grid-cols-3 gap-2 my-4">
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-[10px] text-text-dim uppercase">COST</span>
              <div className="font-bold text-sm text-primary mt-0.5">${info.costM}M</div>
            </div>
            {info.massKg !== undefined && (
              <div className="p-2.5 rounded-lg bg-surface-container-low">
                <span className="text-[10px] text-text-dim uppercase">MASS</span>
                <div className="font-bold text-sm text-text-bright mt-0.5">{info.massKg} kg</div>
              </div>
            )}
            {info.powerW !== undefined && (
              <div className="p-2.5 rounded-lg bg-surface-container-low">
                <span className="text-[10px] text-text-dim uppercase">POWER</span>
                <div className="font-bold text-sm text-amber-400 mt-0.5">{info.powerW} W</div>
              </div>
            )}
          </div>

          {/* Technical Specs List */}
          <div className="space-y-1.5 p-3 rounded-lg bg-surface-container-low">
            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-1 font-semibold">
              Engineering Characteristics
            </div>
            {info.specs.map((s, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-text-dim">{s.label}:</span>
                <span className="text-text-bright font-semibold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Deep Trade-off Physics Rationale */}
          <div className="mt-3.5 space-y-1">
            <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold">
              Astrodynamics & Trade-off Rationale
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {info.physicsRationale}
            </p>
          </div>

          {/* NASA Flight Heritage */}
          <div className="mt-3 p-2.5 rounded-lg bg-primary-container/5 text-[11px] text-text-dim">
            <span className="text-primary-fixed font-semibold uppercase text-[10px] block mb-0.5">
              Flight Heritage Precedent:
            </span>
            {info.nasaPrecedent}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-mono font-bold text-xs uppercase shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              Close Telemetry
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

