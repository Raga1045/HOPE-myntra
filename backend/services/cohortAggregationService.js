import { ReturnOutcome } from '../db.js';

/**
 * Aggregates return and keep outcomes for a specific cohort profile and product filter.
 * 
 * @param {Object} cohortFilter - Includes { gender, heightBand, weightBand, bodyType, preferredFit }
 * @param {Object} productQuery - Product matching parameters (e.g. { productId }, { brand }, or { category })
 */
export async function aggregateCohortData(cohortFilter, productQuery = {}) {
  const query = {
    gender: cohortFilter.gender,
    heightBand: cohortFilter.heightBand,
    weightBand: cohortFilter.weightBand,
    bodyType: cohortFilter.bodyType,
    preferredFit: cohortFilter.preferredFit,
    ...productQuery
  };

  const outcomes = await ReturnOutcome.find(query);
  
  const sizeMap = {};
  
  outcomes.forEach(event => {
    const size = event.sizePurchased;
    if (!sizeMap[size]) {
      sizeMap[size] = { kept: 0, returned: 0, total: 0 };
    }
    if (event.kept) sizeMap[size].kept++;
    if (event.returned) sizeMap[size].returned++;
    sizeMap[size].total++;
  });

  return {
    rawOutcomes: outcomes,
    sizeAverages: sizeMap,
    totalCount: outcomes.length
  };
}
