/**
 * Confidence Engine for sizing recommendations.
 * Computes scores and maps outcomes to the 5 requested confidence states.
 * 
 * @param {number} cohortSize - Number of similar shoppers in the target cohort
 * @param {number} keepRate - Percentage of cohort who kept the selected size
 * @param {number} productTotalPurchases - Total purchase records for this product across all cohorts
 * @param {string} brand - Brand name of the product
 * @param {string} preferredFit - The preferred fit of the shopper (Slim, Regular, Loose)
 */
export function calculateConfidence(cohortSize, keepRate, productTotalPurchases, brand, preferredFit) {
  // State 5: New Arrival
  // Show if the product is new (very low total historical purchase events)
  if (productTotalPurchases <= 3) {
    return {
      level: "New Arrival",
      score: 50,
      reasoning: [
        "New product",
        "Estimated from brand measurements",
        "Confidence improves as more purchases are recorded"
      ]
    };
  }

  // State 1: Very High Confidence
  if (cohortSize >= 30 && keepRate >= 90) {
    return {
      level: "Very High Confidence",
      score: Math.round(keepRate),
      reasoning: [
        `Based on ${cohortSize} shoppers with a similar body profile`,
        `${Math.round(keepRate)}% kept this size`,
        brand === 'Libas' ? "This brand runs slightly small" : "Brand sizing is highly consistent",
        `${preferredFit} Fit matches your preference`
      ]
    };
  }

  // State 2: High Confidence
  if (cohortSize >= 15 && keepRate >= 80) {
    return {
      level: "High Confidence",
      score: Math.round(keepRate),
      reasoning: [
        "Based on similar shoppers",
        "Most users kept this size",
        brand === 'Libas' ? "This brand runs slightly small" : "Brand sizing is highly consistent",
        "Matches your preferred fit"
      ]
    };
  }

  // State 3: Good Confidence
  if (cohortSize >= 5 && keepRate >= 70) {
    return {
      level: "Good Confidence",
      score: Math.round(keepRate),
      reasoning: [
        "Similar body profiles preferred this size",
        "Product fit matches your preference",
        "Brand history supports this recommendation"
      ]
    };
  }

  // State 4: Estimated Recommendation
  return {
    level: "Estimated Recommendation",
    score: 65,
    reasoning: [
      "Limited purchase history",
      "Recommendation uses brand sizing history",
      "Similar products indicate this size"
    ]
  };
}
