import { Destination } from '../types/mission';

export const DESTINATIONS: Record<string, Destination> = {
  moon: {
    id: 'moon',
    name: 'Moon — Shackleton Crater',
    tagline: 'Artemis Lunar South Pole Reconnaissance',
    distanceAU: 0.00257, // ~384,400 km
    deltaVRequired: 3.9, // km/s (LEO to Lunar Orbit & Soft Landing)
    solarFluxWm2: 1361, // Same as Earth
    oneWayLightMinutes: 0.021, // ~1.3 seconds
    gravityMps2: 1.62,
    atmosphereBar: 0.0,
    budgetCapM: 140,
    maxMassLimitKg: 4200,
    scientificPriority: 'Volatile Water Ice & Permanent Shadow Polar Mapping',
    description: 'Permanently shadowed craters at the Lunar South Pole contain billions of tons of water-ice volatiles crucial for sustained human exploration.',
    primaryTargets: [
      'Volatiles in permanently shadowed regions (PSRs)',
      'High-resolution LIDAR terrain mapping for Artemis base',
      'Surface regolith dielectric permittivity',
    ],
    color: '#38bdf8', // Sky blue
  },
  mars: {
    id: 'mars',
    name: 'Mars — Jezero Crater',
    tagline: 'Astrobiology & Paleo-Lake Basin Exploration',
    distanceAU: 1.52,
    deltaVRequired: 5.8, // km/s (Trans-Mars Injection & Aerocapture/Entry)
    solarFluxWm2: 590, // ~43% of Earth solar flux
    oneWayLightMinutes: 12.6, // Average light delay
    gravityMps2: 3.72,
    atmosphereBar: 0.006, // Thin CO2 atmosphere
    budgetCapM: 320,
    maxMassLimitKg: 3500,
    scientificPriority: 'Ancient Biosignatures & Subsurface Perchlorate Chemistry',
    description: 'Ancient river delta lakebed in Jezero Crater holding fine-grained clay minerals that could preserve fossilized microbial life.',
    primaryTargets: [
      'Deltaic mudstones organic biosignature detection',
      'Atmospheric methane pulse tracking',
      'Subsurface radar water table sounding',
    ],
    color: '#f97316', // Orange
  },
  europa: {
    id: 'europa',
    name: 'Europa — Jovian Ice Ocean',
    tagline: 'Subsurface Ocean Life Candidate',
    distanceAU: 5.2,
    deltaVRequired: 9.1, // km/s (Deep Jovian gravity well, radiation shield insertion)
    solarFluxWm2: 50, // ~3.7% of Earth solar flux! Solar panels heavily penalized
    oneWayLightMinutes: 43.2,
    gravityMps2: 1.315,
    atmosphereBar: 0.0,
    budgetCapM: 680,
    maxMassLimitKg: 5800,
    scientificPriority: 'Subsurface Ocean Habitability & Cryovolcanic Plumes',
    description: 'A global liquid ocean beneath a 15-25 km ice shell with more liquid water than all Earth oceans combined, warmed by tidal flexing from Jupiter.',
    primaryTargets: [
      'Cryovolcanic vapor plume sampling in-situ',
      'Ice crust thickness profiling via VHF radar',
      'Induced magnetic dipole ocean salinity verification',
    ],
    color: '#a855f7', // Violet
  },
  titan: {
    id: 'titan',
    name: 'Titan — Kraken Mare',
    tagline: 'Prebiotic Liquid Hydrocarbon Seas',
    distanceAU: 9.58,
    deltaVRequired: 10.8, // km/s (Saturn insertion & dense aero-entry)
    solarFluxWm2: 15, // ~1.1% of Earth! Solar is non-viable, RTG mandatory
    oneWayLightMinutes: 79.5,
    gravityMps2: 1.352,
    atmosphereBar: 1.45, // Dense nitrogen atmosphere!
    budgetCapM: 850,
    maxMassLimitKg: 6200,
    scientificPriority: 'Exotic Organic Chemistry & Methane Weather Cycle',
    description: 'The only celestial body besides Earth with stable liquid surface lakes, consisting of liquid methane and ethane under a dense nitrogen haze.',
    primaryTargets: [
      'Kraken Mare liquid hydrocarbon composition probe',
      'Atmospheric complex tholin photochemistry',
      'Subsurface water-ammonia internal ocean sounding',
    ],
    color: '#06b6d4', // Cyan
  },
};

