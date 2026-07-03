/**
 * Estimate each plan's annual cost for the household described by the usage
 *
 * @format
 */

import type {
  RawConsumption,
  RawServicePoints,
  EnergyPlanDetail,
  RankedPlanCost,
} from "./types.js";

export interface EstimateInput {
  usage: RawConsumption;
  servicePoints: RawServicePoints;
  plans: EnergyPlanDetail[];
}

export function estimatePlanCosts(input: EstimateInput): RankedPlanCost[] {
  // TODO: implement.
  throw new Error(
    "estimatePlanCosts is not implemented yet — this is the exercise.",
  );
}
