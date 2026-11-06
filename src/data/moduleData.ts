import {
  RegionalWeatherReport,
  PestDiseaseAlert,
  DroneServiceProvider,
  HarvestTraceabilityLot,
  Language
} from '../types';

export const REGIONAL_WEATHER_DATA: Record<string, RegionalWeatherReport> = {
  'Yavatmal': {
    district: 'Yavatmal',
    state: 'Maharashtra',
    agroZone: 'Vidarbha Semi-Arid Cotton & Soybean Zone',
    universityStation: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV) & ICAR-CICR Nagpur',
    temperature: 33.4,
    minTemp: 24.1,
    maxTemp: 35.8,
    humidity: 78,
    rainfallChance: 65,
    rainfallMm: 14.2,
    windSpeedKmH: 9.4,
    windDirection: 'South-West (SW)',
    sprayCondition: 'Optimal',
    sprayWindowAdvice: 'Ideal morning spray window: 06:00 AM to 09:30 AM. Low thermal drift; stomata open for foliar uptake.',
    updatedAt: 'Today, 06:30 AM IST (Live IMD Doppler Radar sync)'
  },
  'Ludhiana': {
    district: 'Ludhiana',
    state: 'Punjab',
    agroZone: 'Central Plain Indo-Gangetic Wheat & Basmati Zone',
    universityStation: 'Punjab Agricultural University (PAU) Agrometeorological Advisory Cell',
    temperature: 26.2,
    minTemp: 16.5,
    maxTemp: 28.0,
    humidity: 84,
    rainfallChance: 40,
    rainfallMm: 3.5,
    windSpeedKmH: 7.2,
    windDirection: 'North-West (NW)',
    sprayCondition: 'Optimal',
    sprayWindowAdvice: 'Morning window 07:00 AM to 10:30 AM safe. High morning dew observed; wait until foliar moisture evaporates before systemic spray.',
    updatedAt: 'Today, 07:00 AM IST (PAU Agro-Met Doppler sync)'
  },
  'Varanasi': {
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    agroZone: 'Eastern Alluvial Plain (Rice-Wheat & Vegetable Belt)',
    universityStation: 'ICAR-Indian Institute of Vegetable Research (IIVR) & BHU Agro Faculty',
    temperature: 31.8,
    minTemp: 23.0,
    maxTemp: 34.2,
    humidity: 82,
    rainfallChance: 55,
    rainfallMm: 9.0,
    windSpeedKmH: 8.5,
    windDirection: 'Easterly (E)',
    sprayCondition: 'Caution',
    sprayWindowAdvice: 'High humidity favors early disease spore germination. Spray early morning before 09:00 AM. Avoid afternoon rain wash-off.',
    updatedAt: 'Today, 06:45 AM IST (IMD Alluvial Station)'
  },
  'Guntur': {
    district: 'Guntur',
    state: 'Andhra Pradesh',
    agroZone: 'Krishna Delta Commercial Chilli & Cotton Hub',
    universityStation: 'Acharya N.G. Ranga Agricultural University (ANGRAU) Lam Farm Station',
    temperature: 34.6,
    minTemp: 26.2,
    maxTemp: 37.1,
    humidity: 71,
    rainfallChance: 25,
    rainfallMm: 0.0,
    windSpeedKmH: 14.8,
    windDirection: 'South-East (SE)',
    sprayCondition: 'Caution',
    sprayWindowAdvice: 'Wind speeds exceeding 14 km/h by 11:00 AM. Shift chemical applications to early dawn (05:30 AM - 08:30 AM) to prevent drift wastage.',
    updatedAt: 'Today, 06:15 AM IST (ANGRAU Lam Observatory)'
  },
  'Pune': {
    district: 'Pune',
    state: 'Maharashtra',
    agroZone: 'Western Ghat Transition Zone (Sugarcane & Horticulture)',
    universityStation: 'Mahatma Phule Krishi Vidyapeeth (MPKV) Rahuri & KVK Baramati Node',
    temperature: 29.5,
    minTemp: 19.8,
    maxTemp: 31.0,
    humidity: 64,
    rainfallChance: 15,
    rainfallMm: 0.0,
    windSpeedKmH: 6.8,
    windDirection: 'Westerly (W)',
    sprayCondition: 'Optimal',
    sprayWindowAdvice: 'Excellent spray weather throughout the morning. Uniform droplet deposition predicted for drone & tractor-mounted booms.',
    updatedAt: 'Today, 07:15 AM IST (Baramati KVK Station)'
  },
  'Karnal': {
    district: 'Karnal',
    state: 'Haryana',
    agroZone: 'Trans-Gangetic Plain Basmati & Mustard Hub',
    universityStation: 'ICAR-Central Soil Salinity Research Institute (CSSRI) & CCS HAU Hisar',
    temperature: 27.8,
    minTemp: 17.2,
    maxTemp: 29.5,
    humidity: 79,
    rainfallChance: 30,
    rainfallMm: 1.2,
    windSpeedKmH: 8.0,
    windDirection: 'North-West (NW)',
    sprayCondition: 'Optimal',
    sprayWindowAdvice: 'Favorable conditions from 06:30 AM to 10:00 AM. Check soil moisture before post-emergence herbicide treatment.',
    updatedAt: 'Today, 06:50 AM IST (CSSRI Weather Center)'
  },
  'Nashik': {
    district: 'Nashik',
    state: 'Maharashtra',
    agroZone: 'Northern Western Ghats Onion, Grape & Pomegranate Belt',
    universityStation: 'ICAR-National Research Centre for Grapes (NRCG) & MPKV Zonal Office',
    temperature: 28.9,
    minTemp: 18.4,
    maxTemp: 30.8,
    humidity: 86,
    rainfallChance: 70,
    rainfallMm: 18.5,
    windSpeedKmH: 11.2,
    windDirection: 'South-West (SW)',
    sprayCondition: 'Unfavorable',
    sprayWindowAdvice: 'Unfavorable for non-rainfast chemicals. Use organosilicone super-spreader stickers if fungal prevention spray is mandatory today.',
    updatedAt: 'Today, 06:30 AM IST (Nashik Weather Radar)'
  },
  'Coimbatore': {
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    agroZone: 'Western Agro-Climatic Zone (Cotton, Maize & Coconut)',
    universityStation: 'Tamil Nadu Agricultural University (TNAU) Agro Climate Research Centre',
    temperature: 32.1,
    minTemp: 23.5,
    maxTemp: 33.8,
    humidity: 73,
    rainfallChance: 35,
    rainfallMm: 2.0,
    windSpeedKmH: 10.5,
    windDirection: 'Easterly (E)',
    sprayCondition: 'Optimal',
    sprayWindowAdvice: 'Morning hours 06:00 AM to 09:00 AM recommended. Monitor canopy humidity in irrigated cotton blocks.',
    updatedAt: 'Today, 06:00 AM IST (TNAU Weather Network)'
  }
};

export const PEST_DISEASE_ALERTS: PestDiseaseAlert[] = [
  {
    id: 'ALERT-COT-PBW-01',
    cropName: 'Cotton',
    pestName: 'Pink Bollworm (Pectinophora gossypiella)',
    scientificName: 'Pectinophora gossypiella',
    severity: 'red',
    riskTitle: 'High Outbreak Warning: 3rd Generation Larval Ingress',
    triggerConditions: 'Humidity > 75% for 48 consecutive hours combined with night temps between 22-26°C has accelerated egg hatching in square & green boll stages.',
    symptoms: [
      'Rosetted flowers that fail to open naturally',
      'Small entrance bore holes in young developing bolls plugged with excreta',
      'Premature boll opening and stained lint'
    ],
    preventiveAction: 'Install 5 pheromone traps (Pecti-Lure) per acre immediately for ETL monitoring (8 moths/trap/night). Apply CIBRC-registered ovicidal and larval spray.',
    recommendedChemicals: [
      {
        chemicalName: 'Chlorantraniliprole 18.5% SC',
        tradeName: 'Coragen',
        cibrcDose: '60 ml / acre in 150-200 L water (or 8-10 L for drone ULV)',
        cibrcRegNo: 'CIR-59,281/2008/Chlorantraniliprole-182'
      },
      {
        chemicalName: 'Profenofos 40% + Cypermethrin 4% EC',
        tradeName: 'Roket / Polytrin C',
        cibrcDose: '400 ml / acre in 200 L water',
        cibrcRegNo: 'CIR-31,440/1999/Profenofos-102'
      }
    ],
    nonChemicalRemedies: [
      'Release Trichogramma bactrae egg parasitoids @ 60,000 / acre at weekly intervals',
      'Hand-pick and destroy rosetted flowers in early morning',
      'Avoid excessive urea application which stimulates succulent vegetative growth'
    ],
    lastSurveyDate: 'Surveyed: Yesterday by District Agricultural Vigilance Squad'
  },
  {
    id: 'ALERT-PAD-BLAST-02',
    cropName: 'Paddy / Rice',
    pestName: 'Rice Blast & Sheath Blight (Magnaporthe oryzae)',
    scientificName: 'Magnaporthe oryzae / Rhizoctonia solani',
    severity: 'red',
    riskTitle: 'Severe Fungal Alert: Foliar & Neck Blast Spread Risk',
    triggerConditions: 'Overcast skies, relative humidity > 85%, and night temperatures around 20-24°C with prolonged morning leaf wetness (>9 hours).',
    symptoms: [
      'Spindle-shaped elliptical lesions with gray/white center and brown margin',
      'Blackish necrotic lesions on the panicle neck causing chaffy grain heads',
      'Snake-skin like irregular water-soaked spots on leaf sheaths'
    ],
    preventiveAction: 'Drain stagnant water from paddy fields temporarily. Apply systemic curative fungicide before morning dew dries up.',
    recommendedChemicals: [
      {
        chemicalName: 'Tricyclazole 75% WP',
        tradeName: 'Beam / Sivic',
        cibrcDose: '120-160 g / acre in 200 L clean water',
        cibrcRegNo: 'CIR-18,290/1994/Tricyclazole-491'
      },
      {
        chemicalName: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
        tradeName: 'Amistar Top',
        cibrcDose: '200 ml / acre in 200 L clean water (Drone: 10 L)',
        cibrcRegNo: 'CIR-54,129/2007/Azoxystrobin-128'
      }
    ],
    nonChemicalRemedies: [
      'Apply Pseudomonas fluorescens bio-agent @ 1 kg/acre mixed in vermicompost',
      'Split nitrogen dosage into 3-4 applications instead of single heavy basal dose',
      'Maintain 25x25 cm spacing for air circulation between hills'
    ],
    lastSurveyDate: 'Surveyed: 24 hrs ago by Rice Research Station Entomologist'
  },
  {
    id: 'ALERT-WHT-RUST-03',
    cropName: 'Wheat',
    pestName: 'Yellow / Stripe Rust (Puccinia striiformis)',
    scientificName: 'Puccinia striiformis f. sp. tritici',
    severity: 'yellow',
    riskTitle: 'Moderate Warning: Morning Fog Induced Stripe Rust Pustules',
    triggerConditions: 'Cold morning mist/fog with temperatures of 12-18°C and high canopy moisture. Wind currents moving southwards from sub-mountainous tracks.',
    symptoms: [
      'Bright yellow linear pustules arranged parallel to leaf veins',
      'Yellow powder (urediniospores) rubs off easily on farmer’s clothes or fingers',
      'Premature chlorosis and leaf desiccation reducing 1000-grain weight'
    ],
    preventiveAction: 'Inspect crop daily in morning. If isolated yellow foci are spotted in field patches, apply propiconazole immediately to check spore propagation.',
    recommendedChemicals: [
      {
        chemicalName: 'Propiconazole 25% EC',
        tradeName: 'Tilt / Bumper',
        cibrcDose: '200 ml / acre in 200 L water',
        cibrcRegNo: 'CIR-22,110/1996/Propiconazole-380'
      }
    ],
    nonChemicalRemedies: [
      'Grow rust-resistant certified varieties (HD-3086, DBW-187, PBW-725)',
      'Eradicate wild alternate host grasses on field boundaries'
    ],
    lastSurveyDate: 'Surveyed: 36 hrs ago by KVK Agronomy Cell'
  },
  {
    id: 'ALERT-CHI-THRIPS-04',
    cropName: 'Chilli',
    pestName: 'Black Thrips & Yellow Mites (Thrips parvispinus)',
    scientificName: 'Thrips parvispinus / Polyphagotarsonemus latus',
    severity: 'red',
    riskTitle: 'High Outbreak Alert: Invasive Black Thrips Floral Damage',
    triggerConditions: 'Dry, warm microclimate with temperatures 32-36°C and intermittent high humidity. Severe floral colonization reported in delta regions.',
    symptoms: [
      'Upward curling of leaves (boat shaped) with crinkling',
      'Severe flower drop and blackening of stamens',
      'Silvery or bronzed scarring on chilli pods making them unmarketable'
    ],
    preventiveAction: 'Erect 20-25 blue and yellow sticky traps per acre at crop canopy height. Spray registered translaminar insecticide in evening.',
    recommendedChemicals: [
      {
        chemicalName: 'Spinetoram 11.7% SC',
        tradeName: 'Delegate',
        cibrcDose: '160 ml / acre in 200 L water',
        cibrcRegNo: 'CIR-62,810/2010/Spinetoram-210'
      },
      {
        chemicalName: 'Diafenthiuron 50% WP',
        tradeName: 'Pegasus',
        cibrcDose: '240 g / acre in 200 L water',
        cibrcRegNo: 'CIR-39,940/2002/Diafenthiuron-109'
      }
    ],
    nonChemicalRemedies: [
      'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem Oil 10,000 ppm @ 3 ml/L',
      'Intercrop with 2 rows of maize or border crop of sorghum as barrier barrier'
    ],
    lastSurveyDate: 'Surveyed: Today 08:00 AM by Horticulture Research Station'
  },
  {
    id: 'ALERT-SOY-STEM-05',
    cropName: 'Soybean',
    pestName: 'Stem Fly & Girdle Beetle (Melanagromyza sojae)',
    scientificName: 'Melanagromyza sojae / Obereopsis brevis',
    severity: 'green',
    riskTitle: 'Low Alert: Normal Vegetative Phase Under Surveillance',
    triggerConditions: 'Moderate weather, sunshine hours > 7 hrs/day. Natural predatory spiders and larval parasitoids maintaining balance below economic threshold level (ETL).',
    symptoms: [
      'Zig-zag red gall mines inside split stem pith (not observed currently)',
      'Wilting of central shoot during seedling stage'
    ],
    preventiveAction: 'Continue weekly field scouting. No chemical spray warranted at this juncture. Save input cost.',
    recommendedChemicals: [],
    nonChemicalRemedies: [
      'Maintain bird perches @ 15 per acre for insectivorous drongos and mynas',
      'Regularly scout field boundaries'
    ],
    lastSurveyDate: 'Surveyed: 2 days ago by Oilseeds Directorate'
  },
  {
    id: 'ALERT-MAZ-FAW-06',
    cropName: 'Maize',
    pestName: 'Fall Armyworm (Spodoptera frugiperda)',
    scientificName: 'Spodoptera frugiperda',
    severity: 'yellow',
    riskTitle: 'Moderate Warning: Early Whorl Stage Infestation',
    triggerConditions: 'Temperatures 26-31°C with intermittent showers. Young larvae feeding concealed inside maize whorl.',
    symptoms: [
      'Shot-hole punctures in expanding leaves',
      'Copious sawdust-like frass inside whorl cone',
      'Ragged shredded leaves on knee-high plants'
    ],
    preventiveAction: 'Whorl application of sand + neem cake (9:1 ratio) or targeted bio-spray with Metarhizium rileyi or Chlorantraniliprole.',
    recommendedChemicals: [
      {
        chemicalName: 'Emamectin Benzoate 5% SG',
        tradeName: 'Proclaim / Missile',
        cibrcDose: '80 g / acre in 200 L water directed into whorls',
        cibrcRegNo: 'CIR-44,810/2004/Emamectin-190'
      }
    ],
    nonChemicalRemedies: [
      'Application of dry sand mixed with wood ash into whorls to kill early instar larvae',
      'Erect FAW-pheromone traps @ 4 / acre'
    ],
    lastSurveyDate: 'Surveyed: Yesterday by Maize Research Directorate'
  }
];

export const DRONE_SERVICE_PROVIDERS: DroneServiceProvider[] = [
  {
    id: 'DRN-MH-YAV-01',
    operatorName: 'KrishiViman Agri-Drones & Custom Hiring Hub',
    hubType: 'Custom Hiring Center (CHC)',
    dgcaLicenseNumber: 'DGCA-OP-2024-MH-9941',
    pilotName: 'Captain Sagar B. Kadam',
    pilotLicense: 'RPC-DGCA-2023-MH-10492',
    droneModel: 'IoTechWorld Agribot 16L Hexacopter (Type Certified)',
    droneUin: 'UIN-U4291-MH-2024-A01',
    tankCapacityLiters: 16,
    swappableBatteriesCount: 6,
    rating: 4.96,
    completedMissions: 840,
    district: 'Yavatmal',
    state: 'Maharashtra',
    phone: '+91 98220 44910',
    whatsapp: '+91 98220 44910',
    serviceRadiusKm: 35,
    ratePerAcre: 450,
    subsidyRate: 0.50
  },
  {
    id: 'DRN-UP-VAR-02',
    operatorName: 'Kashi Namo Drone Didi Kisan Self-Help Group',
    hubType: 'Namo Drone Didi Hub',
    dgcaLicenseNumber: 'DGCA-OP-2024-UP-4402',
    pilotName: 'Smt. Rekha Devi Bind (Certified Drone Didi)',
    pilotLicense: 'RPC-DGCA-2024-UP-00812',
    droneModel: 'Marut Dronetech AG365 Dual-Nozzle 10L (Type Certified)',
    droneUin: 'UIN-U8810-UP-2024-B19',
    tankCapacityLiters: 10,
    swappableBatteriesCount: 8,
    rating: 4.98,
    completedMissions: 520,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    phone: '+91 94520 77180',
    whatsapp: '+91 94520 77180',
    serviceRadiusKm: 25,
    ratePerAcre: 400,
    subsidyRate: 0.50
  },
  {
    id: 'DRN-PB-LUD-03',
    operatorName: 'Malwa Kisan Mechanization & Drone Hub',
    hubType: 'Custom Hiring Center (CHC)',
    dgcaLicenseNumber: 'DGCA-OP-2023-PB-8819',
    pilotName: 'Er. Harpreet Singh Dhillon',
    pilotLicense: 'RPC-DGCA-2023-PB-04192',
    droneModel: 'Garuda Aerospace Kisan Drone 16L Heavy Lifter',
    droneUin: 'UIN-U5519-PB-2023-K08',
    tankCapacityLiters: 16,
    swappableBatteriesCount: 10,
    rating: 4.92,
    completedMissions: 1140,
    district: 'Ludhiana',
    state: 'Punjab',
    phone: '+91 98150 99401',
    whatsapp: '+91 98150 99401',
    serviceRadiusKm: 40,
    ratePerAcre: 480,
    subsidyRate: 0.50
  },
  {
    id: 'DRN-AP-GUN-04',
    operatorName: 'Andhra Delta AgTech Precision Fleet',
    hubType: 'DGCA Certified AgTech Node',
    dgcaLicenseNumber: 'DGCA-OP-2024-AP-1029',
    pilotName: 'K. Venkateswara Rao',
    pilotLicense: 'RPC-DGCA-2024-AP-09941',
    droneModel: 'Dhaksha Unmanned Agrigator 12L Precision Centrifugal',
    droneUin: 'UIN-U7721-AP-2024-D44',
    tankCapacityLiters: 12,
    swappableBatteriesCount: 6,
    rating: 4.94,
    completedMissions: 670,
    district: 'Guntur',
    state: 'Andhra Pradesh',
    phone: '+91 94900 12890',
    whatsapp: '+91 94900 12890',
    serviceRadiusKm: 30,
    ratePerAcre: 450,
    subsidyRate: 0.50
  }
];

export const HARVEST_TRACEABILITY_LOTS: HarvestTraceabilityLot[] = [
  {
    lotId: 'HRV-COT-2026-902',
    qrPayload: 'https://seedtrace.gov.in/verify/harvest?lot=HRV-COT-2026-902&hash=sha256-488219-cibrc',
    blockchainHash: '0x8f4c2e91b8a47d206f19472e391bb8a4d7c0192e',
    farmerName: 'Rameshwar Babanrao Patil',
    farmerAadhaarMasked: 'XXXX-XXXX-4819',
    fpoName: 'Yavatmal Krishi Vikas Farmer Producer Co. Ltd.',
    farmLocation: {
      village: 'Ner (Parsodi Shivajinagar)',
      taluka: 'Ner',
      district: 'Yavatmal',
      state: 'Maharashtra',
      khasraNumber: 'Gat No. 142/2A',
      geoCoordinates: '20.4891° N, 78.1322° E'
    },
    cropName: 'Cotton (Kharif Extra-Long Staple)',
    variety: 'Mahyco Bollgard II Hybrid Bt Cotton',
    seedBatchUsed: 'BT-COT-2026-8841',
    seedTraceRegisterId: 'ST-GOV-IN-LOT-488219-KHARIF',
    acreageCultivated: 6.5,
    harvestDate: '28-10-2026',
    harvestQuantityQuintals: 48.5,
    soilHealthCardNumber: 'SHC-MH-YAV-2025-004918',
    chemicalLedger: [
      {
        stage: 'Basal Soil Application (0-15 DAS)',
        dateApplied: '15-06-2026',
        productName: 'IFFCO Nano Urea Plus + SSP 16%',
        batchNumber: 'NANO-UREA-IF772',
        category: 'Fertilizer',
        cibrcRegId: 'FCO/GJ/CENTRAL/2021/0082',
        doseApplied: '500 ml / acre foliar spray + 50 kg SSP',
        phiDaysRequired: 0,
        phiObservedDays: 135,
        isCompliant: true
      },
      {
        stage: 'Sucking Pest Management (45-55 DAS)',
        dateApplied: '22-07-2026',
        productName: 'Bayer Confidor 200 SL (Imidacloprid 17.8%)',
        batchNumber: 'CONF-BAY-4491',
        category: 'Pesticide',
        cibrcRegId: 'CIR-21,980/96/Imidacloprid-391',
        doseApplied: '60 ml / acre via Precision Drone',
        phiDaysRequired: 21,
        phiObservedDays: 98,
        isCompliant: true
      },
      {
        stage: 'Foliar Micronutrient & Boll Growth (80 DAS)',
        dateApplied: '25-08-2026',
        productName: 'Chelated Zinc 12% + 19:19:19 NPK',
        batchNumber: 'MC-ZN-2026-119',
        category: 'Bio-stimulant',
        cibrcRegId: 'FCO-SCH-IV-ZN12',
        doseApplied: '250 g / acre in 200 L water',
        phiDaysRequired: 7,
        phiObservedDays: 64,
        isCompliant: true
      }
    ],
    nablLabReport: {
      labName: 'Central Institute for Research on Cotton Technology (CIRCOT) NABL Lab #TC-5120',
      nablCertNumber: 'NABL-CIRCOT-TC5120-2026-88192',
      reportDate: '02-11-2026',
      sampleId: 'CIRCOT-SMPL-COT-902',
      geneticPurityPercent: 99.2,
      moisturePercent: 7.8,
      pesticideResidueStatus: 'Below Detection Limit (BDL)',
      aflatoxinPpb: 0.8,
      heavyMetalsStatus: 'Not Detected / Safe',
      exportGradeCertified: true
    },
    processorVerified: true,
    mandiGatePassIssued: true,
    status: 'Certified Export Grade'
  },
  {
    lotId: 'HRV-PB-BAS-441',
    qrPayload: 'https://seedtrace.gov.in/verify/harvest?lot=HRV-PB-BAS-441&hash=sha256-991042-apeda',
    blockchainHash: '0x3a71b9e02c54817a109e208b3941a87c1209b021',
    farmerName: 'Sardar Gurpreet Singh Gill',
    farmerAadhaarMasked: 'XXXX-XXXX-9417',
    fpoName: 'Ludhiana Progressive Basmati Growers Cooperative',
    farmLocation: {
      village: 'Samrala Khurd',
      taluka: 'Samrala',
      district: 'Ludhiana',
      state: 'Punjab',
      khasraNumber: 'Kila No. 24//12/2',
      geoCoordinates: '30.8419° N, 76.1920° E'
    },
    cropName: 'Traditional Pusa Basmati 1121 Paddy',
    variety: 'Pusa Basmati 1121 (GI Tagged Punjab Indo-Gangetic)',
    seedBatchUsed: 'PBW-BAS-2026-1049',
    seedTraceRegisterId: 'ST-GOV-IN-LOT-1121-PB-RABI',
    acreageCultivated: 12.0,
    harvestDate: '22-10-2026',
    harvestQuantityQuintals: 216.0,
    soilHealthCardNumber: 'SHC-PB-LUD-2025-009182',
    chemicalLedger: [
      {
        stage: 'Seed Treatment & Nursery (0 DAS)',
        dateApplied: '20-05-2026',
        productName: 'Trichoderma harzianum Bio-fungicide 1% WP',
        batchNumber: 'BIO-TRI-2026-004',
        category: 'Bio-stimulant',
        cibrcRegId: 'CIBRC/BIO/2019/TRI-11',
        doseApplied: '10 g / kg seed slurry soak',
        phiDaysRequired: 0,
        phiObservedDays: 155,
        isCompliant: true
      },
      {
        stage: 'Sheath Blight Preventive Spray (65 DAS)',
        dateApplied: '02-08-2026',
        productName: 'Syngenta Amistar Top (Azoxystrobin + Difenoconazole)',
        batchNumber: 'AMIS-SYN-9021',
        category: 'Pesticide',
        cibrcRegId: 'CIR-54,129/2007/Azoxystrobin-128',
        doseApplied: '200 ml / acre via Drone ULV (10 L/acre)',
        phiDaysRequired: 28,
        phiObservedDays: 81,
        isCompliant: true
      }
    ],
    nablLabReport: {
      labName: 'Basmati Export Development Foundation (BEDF) Lab, Modipuram NABL #TC-6201',
      nablCertNumber: 'NABL-BEDF-TC6201-2026-1049',
      reportDate: '26-10-2026',
      sampleId: 'BEDF-BAS-1121-441',
      geneticPurityPercent: 99.8,
      moisturePercent: 12.2,
      pesticideResidueStatus: 'Compliant with FSSAI & EU MRL',
      aflatoxinPpb: 0.4,
      heavyMetalsStatus: 'Not Detected / Safe',
      exportGradeCertified: true
    },
    processorVerified: true,
    mandiGatePassIssued: true,
    status: 'Certified Export Grade'
  },
  {
    lotId: 'HRV-AP-CHI-108',
    qrPayload: 'https://seedtrace.gov.in/verify/harvest?lot=HRV-AP-CHI-108&hash=sha256-771920-spices',
    blockchainHash: '0x1c8091a4b928e104f98102a9042b8109ca4198e0',
    farmerName: 'K. Subba Rao',
    farmerAadhaarMasked: 'XXXX-XXXX-1289',
    fpoName: 'Guntur Mirchi Rythu Producer Company',
    farmLocation: {
      village: 'Lam Village, Amaravati Road',
      taluka: 'Tadikonda',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      khasraNumber: 'Sy No. 89/1B',
      geoCoordinates: '16.3812° N, 80.4419° E'
    },
    cropName: 'Guntur Teja (S17) Export Quality Dry Red Chilli',
    variety: 'Teja S17 High Pungency & Capsaicin',
    seedBatchUsed: 'CHI-TEJA-2026-904',
    seedTraceRegisterId: 'ST-GOV-IN-LOT-88192-AP-SPICES',
    acreageCultivated: 4.0,
    harvestDate: '15-10-2026',
    harvestQuantityQuintals: 32.0,
    soilHealthCardNumber: 'SHC-AP-GUN-2025-007712',
    chemicalLedger: [
      {
        stage: 'Flowering & Sucking Pest Control (50 DAS)',
        dateApplied: '28-07-2026',
        productName: 'Spinetoram 11.7% SC (Delegate)',
        batchNumber: 'SPIN-COR-2026-081',
        category: 'Pesticide',
        cibrcRegId: 'CIR-62,810/2010/Spinetoram-210',
        doseApplied: '160 ml / acre in 200 L water',
        phiDaysRequired: 14,
        phiObservedDays: 79,
        isCompliant: true
      }
    ],
    nablLabReport: {
      labName: 'Spices Board Quality Evaluation Laboratory (QEL) NABL #TC-7104, Nambur',
      nablCertNumber: 'NABL-SPICES-TC7104-2026-9041',
      reportDate: '19-10-2026',
      sampleId: 'SPICES-QEL-CHI-108',
      geneticPurityPercent: 99.4,
      moisturePercent: 9.5,
      pesticideResidueStatus: 'Below Detection Limit (BDL)',
      aflatoxinPpb: 1.2,
      heavyMetalsStatus: 'Not Detected / Safe',
      exportGradeCertified: true
    },
    processorVerified: true,
    mandiGatePassIssued: true,
    status: 'Certified Export Grade'
  }
];

export const SMS_USSD_DICTIONARY: Record<Language, {
  shortcodePrompt: string;
  ussdPrompt: string;
  helpHint: string;
  genuineSampleText: string;
  counterfeitSampleText: string;
  expiredSampleText: string;
}> = {
  en: {
    shortcodePrompt: 'Send SMS: VERIFY <Batch Number> to 56161',
    ussdPrompt: 'Dial USSD Code: *99*51# or *144*4# from any phone',
    helpHint: 'Works on 2G feature phones without internet or smartphones.',
    genuineSampleText: '[AGRISAFE SEEDTRACE] ✅ GENUINE BATCH. Prod: Mahyco Bt Cotton (Lot: BT-COT-2026-8841). Mfg: Mahyco Seeds Pune. Lic: MH/SEED/4119. Exp: 11-10-2026. Lab Purity: 98.8%. Genuine Hologram Valid. DAC&FW Approved.',
    counterfeitSampleText: '[AGRISAFE ALERT] 🚨 COUNTERFEIT LOT! Batch CF-FAKE-9920 is NOT in CIBRC/SeedTrace register. DO NOT PAY DEALER. Report immediately at toll-free 1800-180-1551. Ref: DAC-ENF-4819.',
    expiredSampleText: '[AGRISAFE WARNING] ⚠️ EXPIRED INPUT. Batch EXP-SEED-2021 expired on 30-10-2023. Seed vigor and germination severely degraded. Selling this lot violates Seed Act 1966 Section 7.'
  },
  hi: {
    shortcodePrompt: 'SMS भेजें: VERIFY <बैच नंबर> लिखकर 56161 पर',
    ussdPrompt: 'USSD डायल करें: किसी भी सामान्य फोन से *99*51# मिलाएं',
    helpHint: 'बिना इंटरनेट वाले कीपैड फोन पर भी तुरंत काम करता है।',
    genuineSampleText: '[एग्रीसेफ सीडट्रेस] ✅ असली बैच। उत्पाद: महिको बीटी कॉटन (लॉट: BT-COT-2026-8841)। निर्माता: महिको सीड्स पुणे। लाइसेंस: MH/SEED/4119। समाप्ति: 11-10-2026। प्रयोगशाला शुद्धता: 98.8%। होलोग्राम मान्य।',
    counterfeitSampleText: '[एग्रीसेफ चेतावनी] 🚨 नकली लॉट! बैच CF-FAKE-9920 सरकारी रजिस्टर में दर्ज नहीं है। दुकानदार को पैसे न दें। टोल-फ्री 1800-180-1551 पर तुरंत शिकायत दर्ज करें। संदर्भ: DAC-ENF-4819।',
    expiredSampleText: '[एग्रीसेफ चेतावनी] ⚠️ मियाद खत्म (Expired)। बैच EXP-SEED-2021 की तारीख 30-10-2023 को समाप्त हो चुकी है। इसका अंकुरण नहीं होगा। इसे बेचना बीज अधिनियम 1966 के तहत अपराध है।'
  },
  mr: {
    shortcodePrompt: 'SMS पाठवा: VERIFY <बॅच नंबर> लिहून 56161 वर',
    ussdPrompt: 'USSD डायल करा: कोणत्याही साध्या फोनवरून *99*51# दाबा',
    helpHint: 'इंटरनेट नसलेल्या जुन्या कीपॅड फोनवरही मोफत आणि त्वरित चालते.',
    genuineSampleText: '[ॲग्रीसेफ सीडट्रेस] ✅ अस्सल बॅच. उत्पादन: महिको बीटी कापूस (लॉट: BT-COT-2026-8841). निर्माता: महिको सीड्स पुणे. परवाना: MH/SEED/4119. मुदत: 11-10-2026. लॅब शुद्धता: 98.8%. होलोग्राम अधिकृत.',
    counterfeitSampleText: '[ॲग्रीसेफ सतर्कता] 🚨 बनावट लॉट! बॅच CF-FAKE-9920 शासकीय नोंदणीत आढळली नाही. पैसे देऊ नका. त्वरित टोल-फ्री 1800-180-1551 वर तक्रार नोंदवा. संदर्भ: DAC-ENF-4819.',
    expiredSampleText: '[ॲग्रीसेफ इशारा] ⚠️ मुदत संपलेले बियाणे. बॅच EXP-SEED-2021 ची मुदत 30-10-2023 रोजी संपली आहे. उगवण क्षमता निकृष्ट आहे. विक्री करणे बेकायदेशीर आहे.'
  },
  pa: {
    shortcodePrompt: 'SMS ਭੇਜੋ: VERIFY <ਬੈਚ ਨੰਬਰ> ਲਿਖ ਕੇ 56161 ਤੇ',
    ussdPrompt: 'USSD ਡਾਇਲ ਕਰੋ: ਕਿਸੇ ਵੀ ਫੋਨ ਤੋਂ *99*51# ਡਾਇਲ ਕਰੋ',
    helpHint: 'ਇੰਟਰਨੈਟ ਤੋਂ ਬਿਨਾਂ ਆਮ ਕੀਪੈਡ ਫੋਨ ਤੇ ਵੀ ਚੱਲਦਾ ਹੈ।',
    genuineSampleText: '[ਐਗਰੀਸੇਫ ਸੀਡਟਰੇਸ] ✅ ਅਸਲੀ ਬੈਚ। ਉਤਪਾਦ: ਮਾਹੀਕੋ ਬੀਟੀ ਨਰਮਾ (ਲੌਟ: BT-COT-2026-8841)। ਨਿਰਮਾਤਾ: ਮਾਹੀਕੋ ਸੀਡਜ਼। ਲਾਇਸੈਂਸ: MH/SEED/4119। ਮਿਆਦ: 11-10-2026। ਲੈਬ ਸ਼ੁੱਧਤਾ: 98.8%। ਹੋਲੋਗ੍ਰਾਮ ਵੈਧ ਹੈ।',
    counterfeitSampleText: '[ਐਗਰੀਸੇਫ ਚੇਤਾਵਨੀ] 🚨 ਨਕਲੀ ਲੌਟ! ਬੈਚ CF-FAKE-9920 ਸਰਕਾਰੀ ਰਜਿਸਟਰ ਵਿੱਚ ਨਹੀਂ ਹੈ। ਪੈਸੇ ਨਾ ਦਿਓ। 1800-180-1551 ਤੇ ਤੁਰੰਤ ਰਿਪੋਰਟ ਕਰੋ।',
    expiredSampleText: '[ਐਗਰੀਸੇਫ ਚੇਤਾਵਨੀ] ⚠️ ਮਿਆਦ ਪੁੱਗ ਚੁੱਕੀ ਹੈ। ਬੈਚ EXP-SEED-2021 ਦੀ ਤਰੀਕ 30-10-2023 ਨੂੰ ਖਤਮ ਹੋ ਗਈ ਸੀ। ਇਸਦੀ ਬਿਜਾਈ ਨਾ ਕਰੋ।'
  },
  ta: {
    shortcodePrompt: 'SMS அனுப்பவும்: VERIFY <பேட்ச் எண்> என 56161 க்கு',
    ussdPrompt: 'USSD டயல் செய்யவும்: எந்த போனிலிருந்தும் *99*51# ஐ அழுத்தவும்',
    helpHint: 'இணைய வசதி இல்லாத சாதாரண போன்களிலும் இயங்கும்.',
    genuineSampleText: '[அக்ரிசேப் சீட்திரேஸ்] ✅ உண்மையான தயாரிப்பு. பொருள்: மஹிகோ பி.டி பருத்தி (லாட்: BT-COT-2026-8841). உரிமம்: MH/SEED/4119. காலாவதி: 11-10-2026. தூய்மை: 98.8%. அரசு முத்திரை சரிபார்க்கப்பட்டது.',
    counterfeitSampleText: '[அக்ரிசேப் எச்சரிக்கை] 🚨 போலி தயாரிப்பு! பேட்ச் CF-FAKE-9920 அரசு பதிவேட்டில் இல்லை. பணம் கொடுக்காதீர்கள். 1800-180-1551 என்ற எண்ணில் உடனே புகார் செய்யவும்.',
    expiredSampleText: '[அக்ரிசேப் எச்சரிக்கை] ⚠️ காலாவதியானது. பேட்ச் EXP-SEED-2021 காலாவதியாகிவிட்டது. முளைப்பு திறன் பாதிக்கப்பட்டுள்ளது.'
  },
  te: {
    shortcodePrompt: 'SMS పంపండి: VERIFY <బ్యాచ్ నంబర్> టైప్ చేసి 56161 కు',
    ussdPrompt: 'USSD డయల్ చేయండి: ఏ ఫోన్ నుండి అయినా *99*51# చేయండి',
    helpHint: 'ఇంటర్నెట్ లేని సాధారణ కీప్యాడ్ ఫోన్లలో కూడా పనిచేస్తుంది.',
    genuineSampleText: '[అగ్రిసేఫ్ సీడ్‌ట్రేస్] ✅ అసలైన బ్యాచ్. ఉత్పత్తి: మహిక్కో బీటీ కాటన్ (లాట్: BT-COT-2026-8841). లైసెన్స్: MH/SEED/4119. గడువు: 11-10-2026. ల్యాబ్ స్వచ్ఛత: 98.8%. హోలోగ్రామ్ సరైనది.',
    counterfeitSampleText: '[అగ్రిసేఫ్ హెచ్చరిక] 🚨 నకిలీ లాట్! బ్యాచ్ CF-FAKE-9920 ప్రభుత్వ రిజిస్టర్‌లో లేదు. డీలర్‌కు డబ్బు చెల్లించవద్దు. 1800-180-1551 లో ఫిర్యాదు చేయండి.',
    expiredSampleText: '[అగ్రిసేఫ్ హెచ్చరిక] ⚠️ గడువు ముగిసింది. బ్యాచ్ EXP-SEED-2021 కాలం చెల్లింది. మొలక శాతం దెబ్బతింటుంది.'
  },
  kn: {
    shortcodePrompt: 'SMS ಕಳುಹಿಸಿ: VERIFY <ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ> ಎಂದು 56161 ಗೆ',
    ussdPrompt: 'USSD ಡಯಲ್ ಮಾಡಿ: ಯಾವುದೇ ಫೋನ್‌ನಿಂದ *99*51# ಒತ್ತಿ',
    helpHint: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದ ಸಾಮಾನ್ಯ ಕೀಪ್ಯಾಡ್ ಫೋನ್‌ಗಳಲ್ಲಿಯೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
    genuineSampleText: '[ಅಗ್ರಿಸೇಫ್ ಸೀಡ್‌ಟ್ರೇಸ್] ✅ ಅಸಲಿ ಬ್ಯಾಚ್. ಉತ್ಪನ್ನ: ಮಹಿಕೋ ಬಿಟಿ ಹತ್ತಿ (ಲಾಟ್: BT-COT-2026-8841). ಪರವಾನಗಿ: MH/SEED/4119. ಮುಕ್ತಾಯ: 11-10-2026. ಶುದ್ಧತೆ: 98.8%. ಹೋಲೋಗ್ರಾಮ್ ಮಾನ್ಯವಾಗಿದೆ.',
    counterfeitSampleText: '[ಅಗ್ರಿಸೇಫ್ ಎಚ್ಚರಿಕೆ] 🚨 ನಕಲಿ ಲಾಟ್! CF-FAKE-9920 ಬ್ಯಾಚ್ ಸರಕಾರಿ ನೋಂದಣಿಯಲ್ಲಿಲ್ಲ. ಹಣ ಪಾವತಿಸಬೇಡಿ. 1800-180-1551 ಗೆ ತಕ್ಷಣ ದೂರು ನೀಡಿ.',
    expiredSampleText: '[ಅಗ್ರಿಸೇಫ್ ಎಚ್ಚರಿಕೆ] ⚠️ ಅವಧಿ ಮುಗಿದಿದೆ. EXP-SEED-2021 ದಿನಾಂಕ ಮುಗಿದಿದೆ. ಇದನ್ನು ಬಿತ್ತನೆ ಮಾಡಬೇಡಿ.'
  },
  gu: {
    shortcodePrompt: 'SMS મોકલો: VERIFY <બેચ નંબર> લખીને 56161 પર',
    ussdPrompt: 'USSD ડાયલ કરો: કોઈપણ ફોન પરથી *99*51# ડાયલ કરો',
    helpHint: 'ઇન્ટરનેટ વગર સામાન્ય કીપેડ ફોન પર પણ તાત્કાલિક ચાલે છે.',
    genuineSampleText: '[એગ્રીસેફ સીડટ્રેસ] ✅ અસલી બેચ. ઉત્પાદન: માહિકો બીટી કપાસ (લોટ: BT-COT-2026-8841). લાઇસન્સ: MH/SEED/4119. મુદત: 11-10-2026. શુદ્ધતા: 98.8%. હોલોગ્રામ માન્ય છે.',
    counterfeitSampleText: '[એગ્રીસેફ ચેતવણી] 🚨 નકલી લોટ! બેચ CF-FAKE-9920 સરકારી ચોપડે નોંધાયેલ નથી. વેપારીને નાણાં ન આપો. 1800-180-1551 પર ફરિયાદ કરો.',
    expiredSampleText: '[એગ્રીસેફ ચેતવણી] ⚠️ મુદત પૂરી થયેલ બિયારણ. બેચ EXP-SEED-2021 ની મુદત વીતી ગઈ છે.'
  },
  bn: {
    shortcodePrompt: 'SMS পাঠান: VERIFY <ব্যাচ নম্বর> লিখে 56161 নম্বরে',
    ussdPrompt: 'USSD ডায়াল করুন: যে কোনো ফোন থেকে *99*51# ডায়াল করুন',
    helpHint: 'ইন্টারনেট ছাড়াই সাধারণ বোতাম ফোনে সাথে সাথে কাজ করে।',
    genuineSampleText: '[এগ্রিসেফ সীডট্রেস] ✅ আসল ব্যাচ। পণ্য: মাহিকো বিটি তুলা (লট: BT-COT-2026-8841)। লাইসেন্স: MH/SEED/4119। মেয়াদ: 11-10-2026। বিশুদ্ধতা: 98.8%। হলোগ্রাম বৈধ।',
    counterfeitSampleText: '[এগ্রিসেফ সতর্কবার্তা] 🚨 নকল লট! ব্যাচ CF-FAKE-9920 সরকারি খাতায় নেই। বিক্রেতাকে টাকা দেবেন না। 1800-180-1551 নম্বরে অভিযোগ জানান।',
    expiredSampleText: '[এগ্রিসেফ সতর্কবার্তা] ⚠️ মেয়াদোত্তীর্ণ বীজ। ব্যাচ EXP-SEED-2021 এর মেয়াদ শেষ হয়ে গেছে।'
  },
  ml: {
    shortcodePrompt: 'SMS അയക്കുക: VERIFY <ബാച്ച് നമ്പർ> എന്ന് 56161 ലേക്ക്',
    ussdPrompt: 'USSD ഡയൽ ചെയ്യുക: ഏത് ഫോണിൽ നിന്നും *99*51# ഡയൽ ചെയ്യുക',
    helpHint: 'ഇന്റർനെറ്റ് ഇല്ലാത്ത സാധാരണ ഫോണുകളിലും ലഭ്യമാണ്.',
    genuineSampleText: '[അഗ്രിസേഫ് സീഡ്‌ട്രേസ്] ✅ ഒറിജിനൽ ബാച്ച്. ഉൽപ്പന്നം: മാഹിക്കോ ബി.ടി കോട്ടൺ (ലോട്ട്: BT-COT-2026-8841). ലൈസൻസ്: MH/SEED/4119. കാലാവധി: 11-10-2026. പരിശുദ്ധി: 98.8%.',
    counterfeitSampleText: '[അഗ്രിസേഫ് മുന്നറിയിപ്പ്] 🚨 വ്യാജ ഉൽപ്പന്നം! ബാച്ച് CF-FAKE-9920 സർക്കാർ രജിസ്റ്ററിൽ ഇല്ല. വ്യാപാരിക്ക് പണം നൽകരുത്. 1800-180-1551 ൽ പരാതിപ്പെടുക.',
    expiredSampleText: '[അഗ്രിസേഫ് മുന്നറിയിപ്പ്] ⚠️ കാലാവധി കഴിഞ്ഞു. ബാച്ച് EXP-SEED-2021 ഉപയോഗശൂന്യമാണ്.'
  }
};
