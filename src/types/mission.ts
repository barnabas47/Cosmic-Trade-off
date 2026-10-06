export type DestinationId = 'moon' | 'mars' | 'europa' | 'titan';

export interface Destination {
  id: DestinationId;
  name: string;
  tagline: string;
  distanceAU: number;
  deltaVRequired: number; // km/s
  solarFluxWm2: number; // W/m^2 (Earth is ~1361)
  oneWayLightMinutes: number; // minutes
  gravityMps2: number;
  atmosphereBar: number;
  budgetCapM: number; // Million USD
  maxMassLimitKg: number; // kg
  scientificPriority: string;
  description: string;
  primaryTargets: string[];
  color: string;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  provider: string;
  costM: number;
  payloadCapacityLEOKg: number;
  payloadCapacityGTOKg: number;
  fairingDiameterM: number;
  reliabilityPercent: number;
  description: string;
}

export interface PowerSystem {
  id: string;
  name: string;
  technology: 'solar' | 'rtg' | 'fuel_cell';
  costM: number;
  massKg: number;
  basePowerOutputW: number; // At 1 AU (Earth)
  solarDependent: boolean;
  lifespanYears: number;
  description: string;
}

export interface PropulsionSystem {
  id: string;
  name: string;
  type: 'chemical_monoprop' | 'chemical_biprop' | 'hall_ion' | 'nuclear_thermal';
  costM: number;
  dryMassKg: number;
  ispSec: number; // Specific impulse in seconds
  fuelCapacityMaxKg: number;
  powerDrawActiveW: number;
  description: string;
}

export interface CommsSystem {
  id: string;
  name: string;
  band: 'S-band' | 'X/Ka-band' | 'Deep Space Optical';
  costM: number;
  massKg: number;
  powerDrawW: number;
  maxBitrateKbps: number;
  rangeLimitAU: number;
  description: string;
}

export interface ScienceInstrument {
  id: string;
  name: string;
  category: 'imaging' | 'spectrometry' | 'radar' | 'plasma_field' | 'surface_probe';
  costM: number;
  massKg: number;
  powerDrawW: number;
  sciencePoints: number;
  description: string;
  bonusDestinations?: DestinationId[];
}

export interface SpacecraftConfiguration {
  destinationId: DestinationId;
  launchVehicleId: string;
  powerSystemId: string;
  propulsionSystemId: string;
  commsSystemId: string;
  selectedInstrumentIds: string[];
  propellantLoadKg: number;
}

export interface MissionEngineeringMetrics {
  dryMassKg: number;
  propellantMassKg: number;
  totalWetMassKg: number;
  massCapacityRatio: number; // wetMass / launchVehicleCapacity
  massMarginKg: number;
  
  deltaVAvailableKmS: number;
  deltaVRequiredKmS: number;
  deltaVMarginKmS: number;
  deltaVSufficient: boolean;

  powerGeneratedW: number;
  powerConsumedW: number;
  netPowerMarginW: number;
  powerSufficient: boolean;

  totalCostM: number;
  budgetCapM: number;
  budgetMarginM: number;
  budgetWithinLimit: boolean;

  totalScienceValue: number;
  reliabilityRating: number; // 0 - 100%

  validationErrors: string[];
  validationWarnings: string[];
}

export type FlightPhase = 'PRE_LAUNCH' | 'ASCENT' | 'CRUISE' | 'ARRIVAL' | 'SCIENCE' | 'COMPLETED' | 'FAILED';

export interface FlightAnomaly {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  phase: FlightPhase;
  choices: {
    label: string;
    description: string;
    scienceModifier: number;
    propellantCostKg: number;
    powerRisk: number;
    successRate: number;
    minigameTrigger?: 'solar' | 'dsn' | 'rcs' | 'slingshot' | 'burn' | 'maxq';
  }[];
}

export interface FlightSimulationState {
  currentPhase: FlightPhase;
  progressPercent: number; // 0 - 100 within current phase
  elapsedMissionDays: number;
  totalDistanceTraveledKm: number;
  fuelRemainingKg: number;
  currentPowerOutputW: number;
  hullIntegrityPercent: number;
  scienceDataTransmittedGb: number;
  activeAnomaly: FlightAnomaly | null;
  anomaliesResolved: number;
  flightLog: {
    timestamp: string;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
  }[];
  isSimulating: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  completedScorecard: MissionScorecard | null;
}

export interface MissionScorecard {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  overallScore: number; // 0 - 100
  scienceScore: number;
  engineeringScore: number;
  budgetScore: number;
  riskScore: number;
  summaryTitle: string;
  summaryAnalysis: string;
  breakdown: {
    category: string;
    points: number;
    maxPoints: number;
    status: 'optimal' | 'acceptable' | 'warning' | 'failed';
    comment: string;
  }[];
}

export interface JudgePreset {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  config: SpacecraftConfiguration;
  expectedResult: string;
}

