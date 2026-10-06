import {
  SpacecraftConfiguration,
  MissionEngineeringMetrics,
} from '../types/mission';
import { DESTINATIONS } from '../data/destinations';
import {
  LAUNCH_VEHICLES,
  POWER_SYSTEMS,
  PROPULSION_SYSTEMS,
  COMMS_SYSTEMS,
  SCIENCE_INSTRUMENTS,
} from '../data/subsystems';

const G0 = 9.80665; // Standard Earth gravitational acceleration (m/s^2)
const BUS_AVIONICS_MASS_KG = 160; // Base satellite structure, thermal louvers, harness
const BUS_BASE_POWER_DRAW_W = 50; // Avionics, onboard computer, star tracker, thermal heaters

export function calculateMissionMetrics(
  config: SpacecraftConfiguration
): MissionEngineeringMetrics {
  const destination = DESTINATIONS[config.destinationId];
  const launchVehicle = LAUNCH_VEHICLES.find((lv) => lv.id === config.launchVehicleId) || LAUNCH_VEHICLES[1];
  const powerSystem = POWER_SYSTEMS.find((ps) => ps.id === config.powerSystemId) || POWER_SYSTEMS[0];
  const propulsionSystem = PROPULSION_SYSTEMS.find((prop) => prop.id === config.propulsionSystemId) || PROPULSION_SYSTEMS[1];
  const commsSystem = COMMS_SYSTEMS.find((cs) => cs.id === config.commsSystemId) || COMMS_SYSTEMS[1];

  const selectedInstruments = SCIENCE_INSTRUMENTS.filter((inst) =>
    config.selectedInstrumentIds.includes(inst.id)
  );

  // 1. Calculate Mass Breakdown
  const instrumentsMass = selectedInstruments.reduce((acc, inst) => acc + inst.massKg, 0);
  const dryMassKg =
    BUS_AVIONICS_MASS_KG +
    powerSystem.massKg +
    propulsionSystem.dryMassKg +
    commsSystem.massKg +
    instrumentsMass;

  const propellantMassKg = Math.min(config.propellantLoadKg, propulsionSystem.fuelCapacityMaxKg);
  const totalWetMassKg = dryMassKg + propellantMassKg;

  const massCapacityRatio = totalWetMassKg / launchVehicle.payloadCapacityLEOKg;
  const massMarginKg = launchVehicle.payloadCapacityLEOKg - totalWetMassKg;

  // 2. Tsiolkovsky Rocket Equation: Delta-V = Isp * g0 * ln(m0 / mf)
  const massRatio = totalWetMassKg / dryMassKg;
  const deltaVAvailableKmS =
    (propulsionSystem.ispSec * G0 * Math.log(massRatio)) / 1000;
  const deltaVRequiredKmS = destination.deltaVRequired;
  const deltaVMarginKmS = deltaVAvailableKmS - deltaVRequiredKmS;
  const deltaVSufficient = deltaVMarginKmS >= 0;

  // 3. Power Generation vs Inverse-Square Law (1 / r^2)
  let powerGeneratedW = powerSystem.basePowerOutputW;
  if (powerSystem.solarDependent) {
    // Solar flux scaling: Earth is 1361 W/m^2 at 1.0 AU
    const distanceScaling = destination.solarFluxWm2 / 1361;
    powerGeneratedW = Math.round(powerSystem.basePowerOutputW * distanceScaling);
  }

  // Power Consumption
  const instrumentsPower = selectedInstruments.reduce((acc, inst) => acc + inst.powerDrawW, 0);
  // Ion thruster has high continuous active draw; chemical only draws valve heater power
  const propulsionPowerDemand = propulsionSystem.type === 'hall_ion'
    ? propulsionSystem.powerDrawActiveW * 0.8
    : propulsionSystem.powerDrawActiveW;

  const powerConsumedW =
    BUS_BASE_POWER_DRAW_W +
    commsSystem.powerDrawW +
    propulsionPowerDemand +
    instrumentsPower;

  const netPowerMarginW = powerGeneratedW - powerConsumedW;
  const powerSufficient = netPowerMarginW >= 0;

  // 4. Budget Cost Calculation
  const instrumentsCost = selectedInstruments.reduce((acc, inst) => acc + inst.costM, 0);
  const totalCostM =
    launchVehicle.costM +
    powerSystem.costM +
    propulsionSystem.costM +
    commsSystem.costM +
    instrumentsCost +
    Math.round(propellantMassKg * 0.005); // Propellant conditioning & fueling cost

  const budgetCapM = destination.budgetCapM;
  const budgetMarginM = budgetCapM - totalCostM;
  const budgetWithinLimit = budgetMarginM >= 0;

  // 5. Science Value
  let totalScienceValue = 0;
  selectedInstruments.forEach((inst) => {
    let pts = inst.sciencePoints;
    if (inst.bonusDestinations?.includes(destination.id)) {
      pts = Math.round(pts * 1.35); // 35% synergy bonus
    }
    totalScienceValue += pts;
  });

  // 6. Reliability Rating
  let reliability = launchVehicle.reliabilityPercent * 0.45;
  reliability += (powerSystem.lifespanYears >= 8 ? 20 : 12);
  reliability += (propulsionSystem.type === 'chemical_biprop' ? 20 : 16);
  reliability += (commsSystem.rangeLimitAU >= destination.distanceAU ? 15 : 0);
  const reliabilityRating = Math.min(99, Math.max(20, Math.round(reliability)));

  // 7. Validation Warnings and Errors
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  if (totalWetMassKg > launchVehicle.payloadCapacityLEOKg) {
    validationErrors.push(
      `Overweight: Wet mass (${totalWetMassKg.toFixed(0)} kg) exceeds ${launchVehicle.name} limit (${launchVehicle.payloadCapacityLEOKg} kg) by ${Math.abs(massMarginKg).toFixed(0)} kg.`
    );
  }

  if (totalCostM > budgetCapM) {
    validationErrors.push(
      `Budget Overrun: Mission cost ($${totalCostM}M) exceeds NASA ${destination.name} cap ($${budgetCapM}M) by $${Math.abs(budgetMarginM)}M.`
    );
  }

  if (deltaVMarginKmS < 0) {
    validationErrors.push(
      `Delta-V Deficit: Available ${deltaVAvailableKmS.toFixed(2)} km/s is short of required ${deltaVRequiredKmS.toFixed(2)} km/s by ${Math.abs(deltaVMarginKmS).toFixed(2)} km/s.`
    );
  }

  if (commsSystem.rangeLimitAU < destination.distanceAU) {
    validationErrors.push(
      `Comms Blackout: ${commsSystem.name} maximum range (${commsSystem.rangeLimitAU} AU) cannot reach target at ${destination.distanceAU} AU.`
    );
  }

  if (netPowerMarginW < 0) {
    validationErrors.push(
      `Power Deficit: Spacecraft consumes ${powerConsumedW}W but only generates ${powerGeneratedW}W (deficit: ${Math.abs(netPowerMarginW)}W).`
    );
  }

  // Warnings
  if (powerSystem.solarDependent && destination.distanceAU > 3.0) {
    validationWarnings.push(
      `Extreme Solar Attenuation: Solar flux at ${destination.name} is only ${destination.solarFluxWm2} W/m² (${((destination.solarFluxWm2 / 1361) * 100).toFixed(1)}% of Earth). Nuclear RTG strongly advised.`
    );
  }

  if (propulsionSystem.type === 'hall_ion' && netPowerMarginW < 120) {
    validationWarnings.push(
      `Ion Engine Power Starvation: Hall Thrusters operate with severe thrust degradation without >120W surplus.`
    );
  }

  if (selectedInstruments.length === 0) {
    validationWarnings.push('No scientific instruments installed. Mission will return 0 discovery points.');
  }

  if (deltaVMarginKmS > 0 && deltaVMarginKmS < 0.3) {
    validationWarnings.push('Tight Delta-V margin (<300 m/s). Anomaly mid-course correction burns will risk mission failure.');
  }

  return {
    dryMassKg,
    propellantMassKg,
    totalWetMassKg,
    massCapacityRatio,
    massMarginKg,
    deltaVAvailableKmS,
    deltaVRequiredKmS,
    deltaVMarginKmS,
    deltaVSufficient,
    powerGeneratedW,
    powerConsumedW,
    netPowerMarginW,
    powerSufficient,
    totalCostM,
    budgetCapM,
    budgetMarginM,
    budgetWithinLimit,
    totalScienceValue,
    reliabilityRating,
    validationErrors,
    validationWarnings,
  };
}

