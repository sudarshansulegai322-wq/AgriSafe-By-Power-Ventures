export type Language = 'en' | 'hi' | 'mr' | 'pa' | 'ta' | 'te' | 'kn' | 'gu' | 'bn' | 'ml';

export interface VerificationRecord {
  batchNumber: string;
  uidTag: string;
  qrHash: string;
  status: 'genuine' | 'counterfeit' | 'expired' | 'blacklisted';
  productName: string;
  category:
    | 'Seed'
    | 'Fertilizer'
    | 'Pesticide'
    | 'Fungicide'
    | 'Herbicide'
    | 'Micronutrient'
    | 'Bio-stimulant';
  manufacturer: string;
  mfgLicense: string;
  cibrcNumber?: string;
  fssaiNumber?: string;
  seedTraceRegisterId: string;
  activeIngredients: string;
  mfgDate: string;
  expiryDate: string;
  testingLab: string;
  germinationRate?: string;
  purityRate?: string;
  moistureContent?: string;
  hologramVerified: boolean;
  stateQualityWingNotes?: string;
  warnings?: string[];
  recommendedDose: string;
}

export interface ChemicalInput {
  id: string;
  tradeName: string;
  activeIngredient: string;
  category: 'Fungicide' | 'Insecticide' | 'Fertilizer' | 'Micronutrient' | 'Herbicide' | 'Bio-Stimulant';
  phType: 'Acidic' | 'Neutral' | 'Alkaline';
  formulation: string;
  incompatibleWith: string[]; // List of chemical names or IDs
  incompatibleNotes: Record<string, string>; // Explanations for specific incompatibilities
  ppeRequired: string[];
  phiDays: number; // Pre-harvest interval
}

export interface EnvironmentalConditions {
  waterPh: number; // e.g. 5.0 to 9.5
  waterHardnessPpm: number; // e.g. 150 to 500 ppm
  temperatureC: number; // Celsius
  cropGrowthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruit_setting' | 'maturity_preharvest';
  applicationMethod: 'drone_ulv' | 'high_volume_knapsack' | 'tractor_boom' | 'drip_fertigation';
  timeOfDay: 'early_morning' | 'noon_harsh_sun' | 'late_afternoon';
}

export interface ConditionalAlert {
  type: 'water_ph' | 'temperature' | 'growth_stage' | 'application_method' | 'time_of_day' | 'water_hardness';
  severity: 'danger' | 'caution';
  title: string;
  description: string;
  correctiveAction: string;
}

export interface CompatibilityReport {
  status: 'safe' | 'danger' | 'caution';
  title: string;
  summary: string;
  chemicalReactionDetail: string;
  riskFactors: string[];
  ppeRequirements: string[];
  jarTestProtocol: string;
  applicationGuidance: string;
  audioSpeechText: string;
  // Dynamic Condition Constraints & Overrides
  baselineTableStatus?: 'compatible' | 'incompatible';
  conditionOverrideApplied?: boolean;
  conditionalAlerts?: ConditionalAlert[];
  phAdjustmentAdvice?: string;
  stageSafeAlternative?: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category:
    | 'Certified Seeds'
    | 'Fertilizers'
    | 'Crop Protection'
    | 'Pesticides'
    | 'Fungicides'
    | 'Herbicides'
    | 'Micronutrients'
    | 'Bio-Stimulants'
    | 'Farm Equipment';
  activeChemical: string;
  packageSize: string;
  price: number;
  originalPrice: number;
  subsidyTag?: string;
  rating: number;
  reviewsCount: number;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'All-Season';
  suitableCrops: string[];
  image: string;
  batchNumber: string;
  stock: number;
  dosagePerAcre: string;
  vendorName: string;
  vendorType: 'Govt Seed Corp' | 'Authorized Distributor' | 'Direct Manufacturer';
  cibrcCertified: boolean;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  badge: string;
  estimatedDays: string;
  cost: number;
  hubCoverage: string;
}

export interface OrderDetails {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  subsidyDiscount: number;
  commissionFee: number;
  commissionRate: number;
  assistedKendraId?: string;
  assistedKendraName?: string;
  sahayakCommissionFee?: number;
  sahayakCommissionRate?: number;
  vendorPayout?: number;
  deliveryPartner: DeliveryPartner;
  total: number;
  farmerName: string;
  phone: string;
  villageAddress: string;
  pincode: string;
  paymentMethod: 'upi' | 'kcc' | 'card' | 'netbanking' | 'cod';
  paymentRefId?: string;
  seedTraceCertificateId: string;
  timestamp: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'dispatched';
  adminApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface DistrictSahayak {
  id: string;
  name: string;
  photoUrl?: string;
  role: string;
  licenseNumber: string;
  phone: string;
  whatsappNumber: string;
  state: string;
  district: string;
  tehsilBlock: string;
  kendraAddress: string;
  landmark: string;
  languagesSpoken: string[];
  assistedServices: string[];
  rating: number;
  ordersFacilitated: number;
  commissionEarnedWallet: number;
  commissionRate: number; // e.g. 0.02 (2%)
  status: 'active' | 'on_field' | 'offline';
  upiId?: string;
}

export interface SupportTicketRecord {
  id: string;
  farmerName: string;
  phone: string;
  state: string;
  district: string;
  category: string;
  message: string;
  voiceNoteUrl?: string;
  photoUrl?: string;
  urgency: 'normal' | 'high' | 'emergency';
  status: 'Pending Admin Review' | 'Approved by Admin' | 'Assigned to Agro Officer' | 'In Progress' | 'Resolved' | 'Rejected';
  adminApprovalStatus: 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  sentToGovernment: boolean;
  govtPortalStatus: string;
  govtDocketNumber?: string;
  assignedOfficer: string;
  createdAt: string;
  responseNote?: string;
  adminNotes?: string;
}

// 1. Weather & Pest Advisory Types
export interface RegionalWeatherReport {
  district: string;
  state: string;
  agroZone: string;
  universityStation: string;
  temperature: number; // Celsius
  minTemp: number;
  maxTemp: number;
  humidity: number; // %
  rainfallChance: number; // %
  rainfallMm: number;
  windSpeedKmH: number;
  windDirection: string;
  sprayCondition: 'Optimal' | 'Caution' | 'Unfavorable';
  sprayWindowAdvice: string;
  updatedAt: string;
}

export interface PestDiseaseAlert {
  id: string;
  cropName: string;
  pestName: string;
  scientificName: string;
  severity: 'green' | 'yellow' | 'red'; // green=low, yellow=moderate, red=high outbreak
  riskTitle: string;
  triggerConditions: string;
  symptoms: string[];
  preventiveAction: string;
  recommendedChemicals: Array<{
    chemicalName: string;
    tradeName: string;
    cibrcDose: string;
    cibrcRegNo: string;
  }>;
  nonChemicalRemedies: string[];
  lastSurveyDate: string;
}

// 2. Drone Spraying & Custom Hiring Linkage Types
export interface DroneServiceProvider {
  id: string;
  operatorName: string;
  hubType: 'Custom Hiring Center (CHC)' | 'Namo Drone Didi Hub' | 'DGCA Certified AgTech Node';
  dgcaLicenseNumber: string;
  pilotName: string;
  pilotLicense: string;
  droneModel: string;
  droneUin: string; // DGCA Unique Identification Number
  tankCapacityLiters: number;
  swappableBatteriesCount: number;
  rating: number;
  completedMissions: number;
  district: string;
  state: string;
  phone: string;
  whatsapp: string;
  serviceRadiusKm: number;
  ratePerAcre: number;
  subsidyRate: number; // 0.50 for 50% SMAM rebate
}

export interface DroneBookingDetails {
  bookingId: string;
  farmerName: string;
  phone: string;
  villageName: string;
  district: string;
  pincode: string;
  cropType: string;
  acreage: number;
  selectedChemicals: string[];
  preferredSlot: 'early_morning' | 'late_afternoon';
  preferredDate: string;
  droneProvider: DroneServiceProvider;
  waterVolumeTotalLiters: number;
  chemicalVolumeTotalMl: number;
  flightMinutesEstimated: number;
  baseCharge: number;
  subsidyRebate: number;
  netPayable: number;
  status: 'Confirmed' | 'Pilot Assigned' | 'En Route' | 'Completed';
  createdAt: string;
}

// 3. Harvest Output Traceability Types
export interface AgroChemicalInputRecord {
  stage: string;
  dateApplied: string;
  productName: string;
  batchNumber: string;
  category: 'Fertilizer' | 'Pesticide' | 'Bio-stimulant';
  cibrcRegId: string;
  doseApplied: string;
  phiDaysRequired: number;
  phiObservedDays: number;
  isCompliant: boolean;
}

export interface NablLabReport {
  labName: string;
  nablCertNumber: string;
  reportDate: string;
  sampleId: string;
  geneticPurityPercent: number;
  moisturePercent: number;
  pesticideResidueStatus: 'Below Detection Limit (BDL)' | 'Compliant with FSSAI & EU MRL' | 'Non-compliant';
  aflatoxinPpb: number;
  heavyMetalsStatus: 'Not Detected / Safe';
  exportGradeCertified: boolean;
}

export interface HarvestTraceabilityLot {
  lotId: string;
  qrPayload: string;
  blockchainHash: string;
  farmerName: string;
  farmerAadhaarMasked: string;
  fpoName: string;
  farmLocation: {
    village: string;
    taluka: string;
    district: string;
    state: string;
    khasraNumber: string;
    geoCoordinates: string;
  };
  cropName: string;
  variety: string;
  seedBatchUsed: string;
  seedTraceRegisterId: string;
  acreageCultivated: number;
  harvestDate: string;
  harvestQuantityQuintals: number;
  soilHealthCardNumber: string;
  chemicalLedger: AgroChemicalInputRecord[];
  nablLabReport: NablLabReport;
  processorVerified: boolean;
  mandiGatePassIssued: boolean;
  status: 'Certified Export Grade' | 'Verified Mandi Grade' | 'Under Inspection';
}

// 4. SMS / USSD Verification Types
export interface SmsVerificationResponse {
  phoneNumber: string;
  queryBatch: string;
  responseType: 'SMS' | 'USSD';
  status: 'genuine' | 'counterfeit' | 'expired' | 'invalid_format';
  rawTextResponse: string;
  language: Language;
  timestamp: string;
  channelGateway: string;
}
