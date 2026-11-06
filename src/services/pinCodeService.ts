export interface PincodeLookupResult {
  valid: boolean;
  state: string;
  district: string;
  hubName: string;
  isRuralEligible: boolean;
  droneExpressAvailable: boolean;
  subsidyShippingFree: boolean;
  nearestKrishiKendra: string;
}

const PIN_REGION_MAP: Record<string, { state: string; district: string; hub: string }> = {
  '41': { state: 'Maharashtra', district: 'Pune / Satara Agri Corridor', hub: 'Western Maharashtra Krishi Seva Kendra' },
  '42': { state: 'Maharashtra', district: 'Nashik / Jalgaon Grape & Cotton Belt', hub: 'Nashik Central Agri Logistics Depot' },
  '43': { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar / Marathwada', hub: 'Marathwada Seed Corp Logistics Hub' },
  '44': { state: 'Maharashtra', district: 'Nagpur / Vidarbha Cotton Tract', hub: 'Vidarbha Krishi Mandi Hub' },
  '14': { state: 'Punjab', district: 'Ludhiana / Jalandhar Grain Belt', hub: 'PAU Ludhiana Certified Depot' },
  '15': { state: 'Punjab', district: 'Bathinda / Malwa Cotton Belt', hub: 'Malwa Kisan Seva Center' },
  '12': { state: 'Haryana', district: 'Hisar / Sirsa Agriculture Zone', hub: 'HAU Hisar Agri Logistics Terminal' },
  '13': { state: 'Haryana', district: 'Karnal / Kurukshetra Basmati Rice Belt', hub: 'National Basmati Hub Karnal' },
  '20': { state: 'Uttar Pradesh', district: 'Aligarh / Western UP Fertile Plain', hub: 'West UP Agro Logistics Centre' },
  '22': { state: 'Uttar Pradesh', district: 'Lucknow / Barabanki Agri Zone', hub: 'Central UP Mandi Distribution Depot' },
  '24': { state: 'Uttarakhand / UP', district: 'Dehradun / Bareilly Region', hub: 'Tarai Seed Development Corporation Hub' },
  '30': { state: 'Rajasthan', district: 'Jaipur / Sikar Mustard & Gram Belt', hub: 'Rajasthan State Agro Depot' },
  '38': { state: 'Gujarat', district: 'Ahmedabad / Kheda Potato & Cotton Belt', hub: 'Gujarat State Seeds Corp Terminal' },
  '39': { state: 'Gujarat', district: 'Surat / Bharuch Sugarcane Basin', hub: 'South Gujarat Krishi Hub' },
  '50': { state: 'Telangana', district: 'Warangal / Karimnagar Cotton & Chilli', hub: 'Telangana Rythu Vedika Depot' },
  '52': { state: 'Andhra Pradesh', district: 'Guntur / Vijayawada Chilli & Tobacco', hub: 'Guntur Spices & Agro Freight Terminal' },
  '56': { state: 'Karnataka', district: 'Bengaluru Rural / Kolar Vegetable Hub', hub: 'Karnataka State Agro Industries Hub' },
  '58': { state: 'Karnataka', district: 'Belagavi / Dharwad Soybean & Pulses', hub: 'North Karnataka Seed Distribution Center' },
  '60': { state: 'Tamil Nadu', district: 'Chennai / Kanchipuram Agro Plain', hub: 'Tamil Nadu Agri Logistics Terminal' },
  '62': { state: 'Tamil Nadu', district: 'Madurai / Theni Banana & Paddy Belt', hub: 'Madurai Krishi Seva Center' },
  '63': { state: 'Tamil Nadu', district: 'Salem / Erode Turmeric & Cotton Zone', hub: 'Kongu Agro Hub Erode' },
  '80': { state: 'Bihar', district: 'Patna / Nalanda Vegetables & Rice Zone', hub: 'Bihar State Seed Corp Depot' },
  '70': { state: 'West Bengal', district: 'Kolkata / Hooghly Potato & Jute Basin', hub: 'Bengal Krishi Seva Depot' }
};

export function lookupPincode(pincode: string): PincodeLookupResult {
  const cleanPin = pincode.trim().replace(/\D/g, '');

  if (cleanPin.length !== 6) {
    return {
      valid: false,
      state: 'Unknown',
      district: 'Invalid Pincode',
      hubName: 'Standard Rural Dispatch',
      isRuralEligible: false,
      droneExpressAvailable: false,
      subsidyShippingFree: false,
      nearestKrishiKendra: 'Nearest District Agriculture Office (DAO)'
    };
  }

  const prefix = cleanPin.substring(0, 2);
  const found = PIN_REGION_MAP[prefix];

  if (found) {
    return {
      valid: true,
      state: found.state,
      district: found.district,
      hubName: found.hub,
      isRuralEligible: true,
      droneExpressAvailable: true,
      subsidyShippingFree: true,
      nearestKrishiKendra: `${found.district} Krishi Vigyan Kendra (KVK)`
    };
  }

  // Fallback for general valid 6-digit Indian PIN
  return {
    valid: true,
    state: 'India (Rural / Agricultural Pin)',
    district: `Postal Region ${prefix}`,
    hubName: `Division Hub - Postal Code ${cleanPin}`,
    isRuralEligible: true,
    droneExpressAvailable: false,
    subsidyShippingFree: true,
    nearestKrishiKendra: 'Local Gram Panchayat CSC / Krishi Bhavan'
  };
}
