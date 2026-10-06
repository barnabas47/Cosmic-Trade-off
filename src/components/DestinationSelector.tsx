import React from 'react';
import { DestinationId } from '../types/mission';
import { DESTINATIONS } from '../data/destinations';
import { Globe, Sun, Zap, Radio, DollarSign, Gauge } from 'lucide-react';

interface DestinationSelectorProps {
  selectedDestinationId: DestinationId;
  onSelectDestination: (id: DestinationId) => void;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  selectedDestinationId,
  onSelectDestination,
}) => {
  const destinationKeys: DestinationId[] = ['moon', 'mars', 'europa', 'titan'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            1. Select NASA Mission Destination
          </h2>
          <p className="text-sm text-neutral-400">
            Each deep space destination imposes strict astrophysical constraints on Delta-V, solar flux, and budget.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {destinationKeys.map((destId) => {
          const dest = DESTINATIONS[destId];
          const isSelected = selectedDestinationId === destId;

          return (
            <button
              key={destId}
              type="button"
              onClick={() => onSelectDestination(destId)}
              className={`text-left relative rounded-2xl p-5 border transition-all duration-300 backdrop-blur-xl ${
                isSelected
                  ? 'border-cyan-400 bg-white/[0.07] shadow-[0_0_30px_rgba(6,182,212,0.25)] scale-[1.02]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && (
                <div
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl pointer-events-none opacity-40"
                  style={{ backgroundColor: dest.color }}
                />
              )}

              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                  style={{
                    color: dest.color,
                    borderColor: `${dest.color}40`,
                    backgroundColor: `${dest.color}15`,
                  }}
                >
                  {dest.id}
                </span>
                <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-emerald-400" />
                  Max ${dest.budgetCapM}M
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">{dest.name}</h3>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {dest.tagline}
              </p>

              {/* Physical Parameters Bento Strip */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Gauge className="h-3.5 w-3.5 text-purple-400" /> Req. $\Delta v$:
                  </span>
                  <span className="font-semibold text-white">{dest.deltaVRequired} km/s</span>
                </div>

                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Sun className="h-3.5 w-3.5 text-amber-400" /> Solar Flux:
                  </span>
                  <span className={dest.solarFluxWm2 < 100 ? 'text-amber-400 font-bold' : 'text-neutral-200'}>
                    {dest.solarFluxWm2} W/m²
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Radio className="h-3.5 w-3.5 text-cyan-400" /> Light Delay:
                  </span>
                  <span className="text-neutral-200">{dest.oneWayLightMinutes} min</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

