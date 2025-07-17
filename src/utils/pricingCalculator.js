import { VAT_RATE, PLATFORM_FEE_RATE } from './constants';


export const calculateDynamicPricing = (site) => {
  if (!site) return 0;

  let basePrice = site.base_price_per_sqm || 0;
  let dynamicPrice = basePrice;

  if (site.location_premium) {
    dynamicPrice += site.location_premium;
  }

  if (site.seasonal_multiplier && site.seasonal_multiplier !== 1) {
    dynamicPrice *= site.seasonal_multiplier;
  }

  if (site.demand_factor && site.demand_factor !== 1) {
    dynamicPrice *= site.demand_factor;
  }

  if (site.foot_traffic_score) {
    const trafficBonus = (site.foot_traffic_score - 5) * 2;
    dynamicPrice += Math.max(0, trafficBonus);
  }

  if (site.visibility_rating) {
    const visibilityBonus = (site.visibility_rating - 5) * 1.5;
    dynamicPrice += Math.max(0, visibilityBonus);
  }

  const usageTypeMultipliers = {
    'F&B': 1.1,
    'Retail': 1.0,
    'Entertainment': 0.9,
    'Services': 0.95
  };

  if (site.usage_type && usageTypeMultipliers[site.usage_type]) {
    dynamicPrice *= usageTypeMultipliers[site.usage_type];
  }

  const minPrice = basePrice * 0.5;
  dynamicPrice = Math.max(minPrice, dynamicPrice);

  const maxPrice = basePrice * 2.0;
  dynamicPrice = Math.min(maxPrice, dynamicPrice);

  return Math.round(dynamicPrice * 100) / 100;
};


export const calculateLeasePrice = (site, durationMonths = 12) => {
  if (!site) return null;

  const pricePerSqm = site.current_price_per_sqm || calculateDynamicPricing(site);
  const baseRent = pricePerSqm * site.area_sqm;

  let durationMultiplier = 1.0;
  if (durationMonths >= 24) {
    durationMultiplier = 0.95; 
  } else if (durationMonths >= 18) {
    durationMultiplier = 0.975; 
  } else if (durationMonths >= 12) {
    durationMultiplier = 0.99; 
  }

  const discountedBaseRent = baseRent * durationMultiplier;
  
  const vatAmount = discountedBaseRent * VAT_RATE;
  const platformFee = discountedBaseRent * PLATFORM_FEE_RATE;
  const totalAmount = discountedBaseRent + vatAmount + platformFee;

  return {
    base_rent: Math.round(discountedBaseRent * 100) / 100,
    vat_amount: Math.round(vatAmount * 100) / 100,
    platform_fee: Math.round(platformFee * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    duration_discount: Math.round((baseRent - discountedBaseRent) * 100) / 100,
    price_per_sqm: pricePerSqm,
    total_area: site.area_sqm,
    duration_months: durationMonths,
    vat_rate: VAT_RATE,
    platform_fee_rate: PLATFORM_FEE_RATE,
    duration_multiplier: durationMultiplier
  };
};

export const calculateTotalLeaseCost = (priceBreakdown) => {
  if (!priceBreakdown) return null;

  const totalBaseRent = priceBreakdown.base_rent * priceBreakdown.duration_months;
  const totalVAT = priceBreakdown.vat_amount * priceBreakdown.duration_months;
  const totalPlatformFee = priceBreakdown.platform_fee * priceBreakdown.duration_months;
  const totalAmount = priceBreakdown.total_amount * priceBreakdown.duration_months;

  return {
    total_base_rent: Math.round(totalBaseRent * 100) / 100,
    total_vat: Math.round(totalVAT * 100) / 100,
    total_platform_fee: Math.round(totalPlatformFee * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    monthly_breakdown: priceBreakdown
  };
};

export const calculatePriorityScore = (requestData, site, client) => {
  let score = 5.0; 

  if (client?.previous_leases >= 3) score += 1.5;
  else if (client?.previous_leases >= 1) score += 1.0;

  if (client?.payment_history_score >= 9.0) score += 1.0;
  else if (client?.payment_history_score >= 7.0) score += 0.5;

  if (requestData?.requested_duration_months >= 24) score += 1.0;
  else if (requestData?.requested_duration_months >= 12) score += 0.5;

  if (site?.location_premium >= 20) score += 1.5;
  else if (site?.location_premium >= 10) score += 1.0;

  if (requestData?.activity_type === 'F&B') score += 1.0;
  else if (requestData?.activity_type === 'Retail') score += 0.8;

  if (site?.demand_factor >= 1.3) score += 1.0;
  else if (site?.demand_factor >= 1.1) score += 0.5;

  return Math.min(Math.max(score, 0), 10.0);
};


export const formatCurrency = (amount, currency = 'SAR') => {
  if (!amount) return `0 ${currency}`;
  return `${amount.toLocaleString()} ${currency}`;
};


export const calculateROI = (site, pricing) => {
  if (!site || !pricing) return null;

  const annualRent = pricing.total_amount * 12;
  const propertyValue = site.area_sqm * site.current_price_per_sqm * 20; 
  const maintenanceCost = annualRent * 0.05; 
  const managementCost = annualRent * 0.08; 
  const netIncome = annualRent - maintenanceCost - managementCost;
  const roi = (netIncome / propertyValue) * 100;

  return {
    annual_rent: annualRent,
    property_value: propertyValue,
    maintenance_cost: maintenanceCost,
    management_cost: managementCost,
    net_income: netIncome,
    roi_percentage: Math.round(roi * 100) / 100,
    payback_period: Math.round((propertyValue / netIncome) * 100) / 100
  };
};

export default {
  calculateDynamicPricing,
  calculateLeasePrice,
  calculateTotalLeaseCost,
  calculatePriorityScore,
  formatCurrency,
  calculateROI
};