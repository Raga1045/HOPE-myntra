import { aggregateCohortData } from './cohortAggregationService.js';
import { calculateConfidence } from './confidenceEngine.js';
import { ReturnOutcome } from '../db.js';

/**
 * Standard size chart fallback based on gender height/weight bands.
 */
function getStandardSizeChart(gender, heightBand, weightBand, bodyType, preferredFit) {
  let size = 'M';
  
  if (heightBand === '150-160 cm') size = 'S';
  else if (heightBand === '160-170 cm') size = 'M';
  else if (heightBand === '170-180 cm') size = 'L';
  else if (heightBand === '180-190 cm') size = 'XL';

  // Weight offset
  if (weightBand === '80-90 kg') {
    if (size === 'S') size = 'M';
    else if (size === 'M') size = 'L';
    else if (size === 'L') size = 'XL';
    else if (size === 'XL') size = 'XXL';
  } else if (weightBand === '50-60 kg') {
    if (size === 'XXL') size = 'XL';
    else if (size === 'XL') size = 'L';
    else if (size === 'L') size = 'M';
    else if (size === 'M') size = 'S';
  }

  // Preferred fit offset
  if (preferredFit === 'Loose') {
    if (size === 'S') size = 'M';
    else if (size === 'M') size = 'L';
    else if (size === 'L') size = 'XL';
    else if (size === 'XL') size = 'XXL';
  } else if (preferredFit === 'Slim') {
    if (size === 'XXL') size = 'XL';
    else if (size === 'XL') size = 'L';
    else if (size === 'L') size = 'M';
    else if (size === 'M') size = 'S';
  }

  return size;
}

/**
 * Executes the size recommendation pipeline.
 * Priority order: Exact Product -> Same Brand -> Same Category -> Standard Size Chart.
 */
export async function getRecommendedSizeForUser(userProfile, product) {
  const { gender, heightBand, weightBand, bodyType, preferredFit } = userProfile;
  const cohortFilter = { gender, heightBand, weightBand, bodyType, preferredFit };

  // Calculate total purchase events for the product overall (to detect New Arrivals)
  const productTotalEvents = await ReturnOutcome.find({ productId: product.id });
  const productTotalPurchases = productTotalEvents.length;

  // PIPELINE LEVEL 1: Exact Product
  const exactProductData = await aggregateCohortData(cohortFilter, { productId: product.id });
  
  if (exactProductData.totalCount >= 5) {
    const bestSize = findBestSize(exactProductData.sizeAverages);
    if (bestSize) {
      const stats = exactProductData.sizeAverages[bestSize];
      const keepRate = (stats.kept / stats.total) * 100;
      const confidence = calculateConfidence(exactProductData.totalCount, keepRate, productTotalPurchases, product.brand, preferredFit);
      return {
        recommendedSize: bestSize,
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score,
        similarShoppers: exactProductData.totalCount,
        keepRate: Math.round(keepRate),
        reasoning: confidence.reasoning,
        pipelineLevel: "Exact Product"
      };
    }
  }

  // PIPELINE LEVEL 2: Same Brand
  const brandData = await aggregateCohortData(cohortFilter, { brand: product.brand });
  
  if (brandData.totalCount >= 10) {
    const bestSize = findBestSize(brandData.sizeAverages);
    if (bestSize) {
      const stats = brandData.sizeAverages[bestSize];
      const keepRate = (stats.kept / stats.total) * 100;
      const confidence = calculateConfidence(brandData.totalCount, keepRate, productTotalPurchases, product.brand, preferredFit);
      return {
        recommendedSize: bestSize,
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score,
        similarShoppers: brandData.totalCount,
        keepRate: Math.round(keepRate),
        reasoning: confidence.reasoning,
        pipelineLevel: "Same Brand"
      };
    }
  }

  // PIPELINE LEVEL 3: Same Category
  const categoryData = await aggregateCohortData(cohortFilter, { category: product.category });
  
  if (categoryData.totalCount >= 5) {
    const bestSize = findBestSize(categoryData.sizeAverages);
    if (bestSize) {
      const stats = categoryData.sizeAverages[bestSize];
      const keepRate = (stats.kept / stats.total) * 100;
      const confidence = calculateConfidence(categoryData.totalCount, keepRate, productTotalPurchases, product.brand, preferredFit);
      return {
        recommendedSize: bestSize,
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score,
        similarShoppers: categoryData.totalCount,
        keepRate: Math.round(keepRate),
        reasoning: confidence.reasoning,
        pipelineLevel: "Same Category"
      };
    }
  }

  // PIPELINE LEVEL 4: Standard Size Chart fallback
  const standardSize = getStandardSizeChart(gender, heightBand, weightBand, bodyType, preferredFit);
  const confidence = calculateConfidence(0, 0, productTotalPurchases, product.brand, preferredFit);
  
  return {
    recommendedSize: standardSize,
    confidenceLevel: confidence.level,
    confidenceScore: confidence.score,
    similarShoppers: 0,
    keepRate: 0,
    reasoning: confidence.reasoning,
    pipelineLevel: "Standard Size Chart"
  };
}

function findBestSize(sizeAverages) {
  let bestSize = null;
  let highestKeptCount = -1;
  let highestKeepRate = -1;

  for (const size in sizeAverages) {
    const data = sizeAverages[size];
    if (data.kept > 0) {
      const rate = data.kept / data.total;
      if (rate > highestKeepRate || (rate === highestKeepRate && data.kept > highestKeptCount)) {
        highestKeepRate = rate;
        highestKeptCount = data.kept;
        bestSize = size;
      }
    }
  }

  return bestSize;
}
