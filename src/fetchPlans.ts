/**
 * Fetch the electricity plans available to THIS household from the 10 retailers we give you, using the
 * public, unauthenticated CDR "Product Reference Data" endpoints, and filter to the ones that apply.
 *
 * Notes:
 *  - These endpoints need NO auth — do NOT put any API key/token in here.
 *  - The 10 retailers (name + base URI) are provided in `retailers.json` (load via `loadRetailers()`).
 *    You do NOT need to discover retailers from the CDR register — that's optional bonus.
 *  - List endpoint uses header `x-v: 1`; plan DETAIL uses `x-v: 3`. Some retailers have 1000+ plans, so
 *    paginate (`meta.totalPages`). How you handle failures, expiry, dedup and eligibility is yours to
 *    decide and justify. Keep the HTTP call separate from the filtering so the filter is unit-testable.
 *
 * @format
 */

import type { RawServicePoints, EnergyPlanDetail, Retailer } from "./types.js";

export interface FetchPlansInput {
  servicePoints: RawServicePoints;
  /** The 10 companies to compare — from `loadRetailers()`. */
  retailers: Retailer[];
}
export async function fetchPlans(
  input: FetchPlansInput,
): Promise<EnergyPlanDetail[]> {
  // TODO: implement — for each of the 10 retailers, list + page their plans, fetch plan detail, and
  // filter to the plans applicable to this household (fuel, customer type, currency, distributor).
  throw new Error("fetchPlans is not implemented yet — this is the exercise.");
}
