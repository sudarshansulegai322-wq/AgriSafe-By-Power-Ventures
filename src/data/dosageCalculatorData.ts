export interface PestRecommendation {
  id: string;
  name: string;
  localNameHi: string;
  pestType: 'insect' | 'fungus' | 'weed';
  severity: 'high' | 'medium' | 'low';
  symptoms: string;
  recommendedProduct: string;
  activeChemical: string;
  formulation: string;
  dosePerAcre: string;
  dosePer15LPump: string;
  pumpsPerAcre: number;
  totalChemicalAcre: string;
  phiDays: number; // Pre-harvest interval
  ppeSafety: string[];
  bestSprayTime: string;
  cibrcRegNumber: string;
  compatNote: string;
}

export interface SplitScheduleStage {
  stageName: string;
  stageNameHi: string;
  timingDays: string;
  nPct: number;
  pPct: number;
  kPct: number;
  notes: string;
  notesHi: string;
}

export interface CropNutrientProfile {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  category: 'Cereal' | 'Commercial' | 'Pulse' | 'Oilseed' | 'Vegetable';
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'All-Season';
  durationDays: string;
  // Recommended kg per acre (converted from standard ICAR kg/ha)
  defaultNpkKgPerAcre: {
    n: number;
    p: number;
    k: number;
  };
  micronutrientsRecommended?: string[];
  splitSchedule: SplitScheduleStage[];
  commonPests: PestRecommendation[];
  soilHealthTips: string;
  soilHealthTipsHi: string;
}

export const CROP_PROFILES: CropNutrientProfile[] = [
  {
    id: 'cotton',
    name: 'Cotton (Bt / Hybrid)',
    nameHi: 'कपास (बी.टी. / हाइब्रिड)',
    nameMr: 'कापूस (बीटी / संकरित)',
    category: 'Commercial',
    season: 'Kharif',
    durationDays: '150-180 Days',
    defaultNpkKgPerAcre: { n: 48, p: 24, k: 24 },
    micronutrientsRecommended: ['Zinc Sulphate 33% (5 kg/acre)', 'Magnesium Sulphate (10 kg/acre)', 'Boron 20% (1 g/L foliar)'],
    soilHealthTips: 'Bt cotton is a heavy feeder of Potassium and Magnesium. Reddening of leaves indicates Mg deficiency.',
    soilHealthTipsHi: 'कपास को पोटाश और मैग्नीशियम की अधिक आवश्यकता होती है। पत्तों का लाल होना मैग्नीशियम की कमी दर्शाता है।',
    splitSchedule: [
      {
        stageName: 'Basal / Sowing Stage',
        stageNameHi: 'बुवाई के समय (बेसल डोज)',
        timingDays: 'At sowing (Day 0)',
        nPct: 20,
        pPct: 100,
        kPct: 50,
        notes: 'Full Phosphorus (DAP) + 50% Potash (MOP) + 20% Nitrogen in furrows.',
        notesHi: 'पूरा फास्फोरस (DAP) + 50% पोटाश (MOP) + 20% यूरिया कूड़ों में डालें।'
      },
      {
        stageName: 'Square Formation / Early Vegetative',
        stageNameHi: 'कली / डोडे बनने की अवस्था',
        timingDays: '35-45 Days After Sowing',
        nPct: 40,
        pPct: 0,
        kPct: 0,
        notes: 'Top dress 40% Nitrogen (or spray Nano Urea 500ml/acre with 19:19:19).',
        notesHi: '40% यूरिया का छिड़काव करें या 500ml नैनो यूरिया 19:19:19 के साथ स्प्रे करें।'
      },
      {
        stageName: 'Peak Flowering & Boll Development',
        stageNameHi: 'फूल व गूलर बनने की मुख्य अवस्था',
        timingDays: '70-85 Days After Sowing',
        nPct: 40,
        pPct: 0,
        kPct: 50,
        notes: 'Final 40% Nitrogen + remaining 50% Potash to enhance boll weight and fiber staple length.',
        notesHi: 'अंतिम 40% यूरिया + शेष 50% पोटाश दें जिससे टिंडे का वजन व रुई की चमक बढ़े।'
      }
    ],
    commonPests: [
      {
        id: 'cot-whitefly',
        name: 'Whitefly & Jassids (Sucking Pest Complex)',
        localNameHi: 'सफेद मक्खी, हरा मच्छर व थ्रिप्स',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Yellowing curled leaves, honeydew excretion, black sooty mould.',
        recommendedProduct: 'Diafenthiuron 50% WP (e.g. Pegasus)',
        activeChemical: 'Diafenthiuron 50% WP',
        formulation: 'Wettable Powder (WP)',
        dosePerAcre: '250 g/acre',
        dosePer15LPump: '25 g (approx 2 heaped spoons) per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '250 g (1 pack)',
        phiDays: 21,
        ppeSafety: ['Face Mask', 'Rubber Gloves', 'Goggles'],
        bestSprayTime: 'Early Morning (before 9 AM)',
        cibrcRegNumber: 'CIR-48201/2012-Diafenthiuron(WP)-412',
        compatNote: 'Compatible with micronutrients; do not mix with highly alkaline copper solutions.'
      },
      {
        id: 'cot-pink-bollworm',
        name: 'Pink Bollworm (PBW)',
        localNameHi: 'गुलाबी सुंडी (टिंडा छेदक)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Rosetted flowers, entry pinholes in green bolls, damaged lint.',
        recommendedProduct: 'Emamectin Benzoate 5% SG (e.g. Proclaim / AgriSafe Shield)',
        activeChemical: 'Emamectin Benzoate 5% SG',
        formulation: 'Soluble Granule (SG)',
        dosePerAcre: '80-100 g/acre',
        dosePer15LPump: '8-10 g per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '100 g',
        phiDays: 14,
        ppeSafety: ['Face Mask', 'Full Sleeves'],
        bestSprayTime: 'Late Afternoon / Dusk (PBW larvae feed at night)',
        cibrcRegNumber: 'CIR-31902/2008-Emamectin(SG)-189',
        compatNote: 'Can be tank-mixed with 00:52:34 or Boron; avoid mixing with copper fungicides.'
      }
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat (गेहूं)',
    nameHi: 'गेहूं',
    nameMr: 'गहू',
    category: 'Cereal',
    season: 'Rabi',
    durationDays: '120-135 Days',
    defaultNpkKgPerAcre: { n: 48, p: 24, k: 16 },
    micronutrientsRecommended: ['Zinc Sulphate Monohydrate 33% (5 kg/acre basal)'],
    soilHealthTips: 'Apply Zinc strictly during basal or 1st irrigation. Zinc deficiency stunts tillering and turns leaves bronze.',
    soilHealthTipsHi: 'जिंक हमेशा पहली सिंचाई या बुवाई पर दें। जिंक की कमी से कल्ले कम फूटते हैं।',
    splitSchedule: [
      {
        stageName: 'Basal / Sowing Stage',
        stageNameHi: 'बुवाई के समय (बेसल खुराक)',
        timingDays: 'At sowing (Day 0)',
        nPct: 50,
        pPct: 100,
        kPct: 100,
        notes: 'Full DAP (100% P) + full Potash (100% K) + 50% Urea drilling below seed level.',
        notesHi: 'पूरा DAP + पूरा पोटाश + 50% यूरिया बीज के नीचे ओट कर डालें।'
      },
      {
        stageName: 'Crown Root Initiation (CRI) / 1st Irrigation',
        stageNameHi: 'पहली सिंचाई (CRI अवस्था - 21 दिन)',
        timingDays: '20-25 Days After Sowing',
        nPct: 25,
        pPct: 0,
        kPct: 0,
        notes: 'Top dress 25% Urea after first irrigation when soil is at optimum moisture.',
        notesHi: 'पहली सिंचाई के बाद जब खेत में पैर न धंसे तब 25% यूरिया का भुरकाव करें।'
      },
      {
        stageName: 'Jointing / Tillering Stage',
        stageNameHi: 'गांठ बनने व कल्ले फूटने की अवस्था',
        timingDays: '40-45 Days After Sowing',
        nPct: 25,
        pPct: 0,
        kPct: 0,
        notes: 'Final 25% Nitrogen top dress or foliar Nano Urea spray.',
        notesHi: 'अंतिम 25% यूरिया डालें या 500ml नैनो यूरिया का स्प्रे करें।'
      }
    ],
    commonPests: [
      {
        id: 'wht-yellow-rust',
        name: 'Yellow / Stripe Rust (Stripe Blight)',
        localNameHi: 'पीला रतुआ (हल्दी रोग)',
        pestType: 'fungus',
        severity: 'high',
        symptoms: 'Yellow powdery pustules arranged in linear stripes on leaves, yellow powder on clothes upon touching.',
        recommendedProduct: 'Propiconazole 25% EC (e.g. Tilt)',
        activeChemical: 'Propiconazole 25% EC',
        formulation: 'Emulsifiable Concentrate (EC)',
        dosePerAcre: '200 ml/acre',
        dosePer15LPump: '20 ml (1 measuring cup) per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '200 ml',
        phiDays: 30,
        ppeSafety: ['Gloves', 'Eye Goggles'],
        bestSprayTime: 'Morning after dew dries up',
        cibrcRegNumber: 'CIR-22100/1999-Propiconazole(EC)-891',
        compatNote: 'Never mix with alkaline fertilizers; keep pH between 6.0 and 6.8.'
      },
      {
        id: 'wht-aphids',
        name: 'Wheat Aphid (Mahun)',
        localNameHi: 'माहू / चेपा कीट',
        pestType: 'insect',
        severity: 'medium',
        symptoms: 'Sucking sap from ears and flag leaf, shriveled light grains.',
        recommendedProduct: 'Thiamethoxam 25% WG',
        activeChemical: 'Thiamethoxam 25% WG',
        formulation: 'Water Dispersible Granules (WG)',
        dosePerAcre: '40-50 g/acre',
        dosePer15LPump: '5 g per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '50 g',
        phiDays: 21,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Sunny clear morning',
        cibrcRegNumber: 'CIR-34201/2005-Thiamethoxam(WG)-310',
        compatNote: 'Highly compatible with systemic fungicides.'
      }
    ]
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (धान / चावल)',
    nameHi: 'धान (चावल)',
    nameMr: 'भात / तांदूळ',
    category: 'Cereal',
    season: 'Kharif',
    durationDays: '120-140 Days',
    defaultNpkKgPerAcre: { n: 48, p: 24, k: 16 },
    micronutrientsRecommended: ['Zinc Sulphate 33% (10 kg/acre basal or 2.5 kg/acre foliar)'],
    soilHealthTips: 'Paddy under submerged conditions requires Zinc to prevent Khaira disease (खैरा रोग).',
    soilHealthTipsHi: 'जलभराव वाले धान में जिंक की कमी से खैरा रोग होता है, अतः बेसल में जिंक अवश्य दें।',
    splitSchedule: [
      {
        stageName: 'Basal / Transplating',
        stageNameHi: 'रोपाई के समय (बेसल)',
        timingDays: 'Day 0 to 5 of transplanting',
        nPct: 50,
        pPct: 100,
        kPct: 50,
        notes: 'Full DAP (100% P) + 50% Potash (MOP) + 50% Urea incorporated in puddled soil.',
        notesHi: 'कद्दू (लेव) करते समय पूरा DAP + आधा पोटाश + आधा यूरिया मिट्टी में मिला दें।'
      },
      {
        stageName: 'Active Tillering Stage',
        stageNameHi: 'कल्ले फूटने की अवस्था',
        timingDays: '20-25 Days After Transplanting',
        nPct: 25,
        pPct: 0,
        kPct: 0,
        notes: '25% Nitrogen top dressing in standing water of 2-3 cm depth.',
        notesHi: '25% यूरिया का भुरकाव करें। खेत में 2-3 सेमी पानी होना चाहिए।'
      },
      {
        stageName: 'Panicle Initiation (Gabh Stage)',
        stageNameHi: 'बालियां निकलने की शुरुआत (गभोट अवस्था)',
        timingDays: '40-50 Days After Transplanting',
        nPct: 25,
        pPct: 0,
        kPct: 50,
        notes: 'Remaining 25% Nitrogen + remaining 50% Potash for bold grain filling.',
        notesHi: 'अंतिम 25% यूरिया + 50% पोटाश डालें ताकि बालियां लंबी और दाने चमकदार भरें।'
      }
    ],
    commonPests: [
      {
        id: 'pad-stem-borer',
        name: 'Yellow Stem Borer (Dead Heart & White Earhead)',
        localNameHi: 'तना छेदक (डेड हार्ट व सफेद बाली)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Central shoot dies in vegetative stage (dead heart); white empty chaffy panicles at heading stage.',
        recommendedProduct: 'Chlorantraniliprole 18.5% SC (Coragen) or Cartap Hydrochloride 4G',
        activeChemical: 'Chlorantraniliprole 18.5% SC',
        formulation: 'Suspension Concentrate (SC)',
        dosePerAcre: '60 ml/acre',
        dosePer15LPump: '6 ml per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '60 ml',
        phiDays: 14,
        ppeSafety: ['Face Mask', 'Rubber Boots'],
        bestSprayTime: 'Early Morning when dew has settled',
        cibrcRegNumber: 'CIR-41002/2010-Chlorantraniliprole(SC)-720',
        compatNote: 'Direct spray at the base of the plant where larvae bore into stems.'
      },
      {
        id: 'pad-bph',
        name: 'Brown Plant Hopper (BPH - Hopper Burn)',
        localNameHi: 'भूरा फुदका / माहू (हॉपर बर्न)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Circular patches of plants dry up rapidly looking burnt; swarms of hoppers at base of stems.',
        recommendedProduct: 'Pymetrozine 50% WDG (e.g. Chess)',
        activeChemical: 'Pymetrozine 50% WDG',
        formulation: 'Water Dispersible Granules (WDG)',
        dosePerAcre: '120 g/acre',
        dosePer15LPump: '12 g per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '120 g',
        phiDays: 21,
        ppeSafety: ['Face Mask', 'Gloves'],
        bestSprayTime: 'Direct spray nozzle right into the lower plant stems, not top canopy',
        cibrcRegNumber: 'CIR-38419/2009-Pymetrozine(WDG)-290',
        compatNote: 'Do not spray synthetic pyrethroids which cause BPH resurgence.'
      }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (गन्ना)',
    nameHi: 'गन्ना',
    nameMr: 'ऊस',
    category: 'Commercial',
    season: 'All-Season',
    durationDays: '300-360 Days',
    defaultNpkKgPerAcre: { n: 100, p: 46, k: 46 },
    micronutrientsRecommended: ['Ferrous Sulphate 19% (10 kg/acre)', 'Zinc Sulphate 33% (10 kg/acre)'],
    soilHealthTips: 'Heavy potassium feeder; adequate MOP increases brix sugar content and cane weight.',
    soilHealthTipsHi: 'गन्ने में पोटाश देने से मिठास (रिकवरी) और गन्ने की मोटाई व वजन बढ़ता है।',
    splitSchedule: [
      {
        stageName: 'Planting / Basal',
        stageNameHi: 'बुवाई के समय (बेसल)',
        timingDays: 'Day 0',
        nPct: 33,
        pPct: 100,
        kPct: 50,
        notes: 'Full DAP + 50% Potash + 33% Nitrogen along cane setts in furrows.',
        notesHi: 'कूड़ों में टुकड़ों के नीचे पूरा DAP + 50% पोटाश + 33% यूरिया डालें।'
      },
      {
        stageName: 'Tillering & 1st Earthing Up',
        stageNameHi: 'कल्ले फूटने व पहली मिट्टी चढ़ाने पर',
        timingDays: '60-75 Days After Planting',
        nPct: 33,
        pPct: 0,
        kPct: 0,
        notes: 'Second dose of Nitrogen (33%) along with light earthing up.',
        notesHi: '33% यूरिया का दूसरा भाग दें और हल्की मिट्टी चढ़ाएं।'
      },
      {
        stageName: 'Grand Growth & Final Earthing Up',
        stageNameHi: 'तीव्र बढ़वार व मुख्य मिट्टी चढ़ाने पर',
        timingDays: '120-150 Days After Planting',
        nPct: 34,
        pPct: 0,
        kPct: 50,
        notes: 'Remaining 34% Nitrogen + remaining 50% Potash before onset of monsoon.',
        notesHi: 'अंतिम 34% यूरिया + शेष 50% पोटाश देकर भारी मिट्टी चढ़ाएं।'
      }
    ],
    commonPests: [
      {
        id: 'sug-early-shoot-borer',
        name: 'Early Shoot Borer (ESB)',
        localNameHi: 'कंसुआ / शुरुआती तना छेदक',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Dead heart in young shoots emitted with offensive smell when pulled out.',
        recommendedProduct: 'Fipronil 0.3% GR (e.g. Regent) or Chlorantraniliprole 0.4% GR',
        activeChemical: 'Fipronil 0.3% GR',
        formulation: 'Granules (GR)',
        dosePerAcre: '10 kg/acre soil application',
        dosePer15LPump: 'Soil application in furrows (not spray)',
        pumpsPerAcre: 0,
        totalChemicalAcre: '10 kg granules',
        phiDays: 30,
        ppeSafety: ['Rubber Gloves', 'Boots'],
        bestSprayTime: 'Mix with moist sand and broadcast along rows at 30 days',
        cibrcRegNumber: 'CIR-29001/2004-Fipronil(GR)-519',
        compatNote: 'Irrigate immediately after granule application.'
      }
    ]
  },
  {
    id: 'soybean',
    name: 'Soybean (सोयाबीन)',
    nameHi: 'सोयाबीन',
    nameMr: 'सोयाबीन',
    category: 'Oilseed',
    season: 'Kharif',
    durationDays: '90-105 Days',
    defaultNpkKgPerAcre: { n: 12, p: 24, k: 16 },
    micronutrientsRecommended: ['Bentonite Sulphur 90% (10 kg/acre)', 'Rhizobium + PSB seed culture'],
    soilHealthTips: 'Legume crop fixes its own Nitrogen via root nodules. Do not overapply Urea.',
    soilHealthTipsHi: 'सोयाबीन दलहनी फसल है जो खुद नाइट्रोजन बनाती है, अतः ज्यादा यूरिया न डालें।',
    splitSchedule: [
      {
        stageName: 'Basal / Sowing Stage',
        stageNameHi: 'बुवाई के समय (बेसल)',
        timingDays: 'At sowing (Day 0)',
        nPct: 100,
        pPct: 100,
        kPct: 100,
        notes: 'All NPK applied at sowing through DAP/SSP + MOP. SSP provides vital Sulphur for oil content.',
        notesHi: 'बुवाई पर पूरा NPK दें। SSP का उपयोग करें जिससे तेल की मात्रा (सल्फर) बढ़ती है।'
      },
      {
        stageName: 'Pod Filling Foliar Boost',
        stageNameHi: 'फली बनने की अवस्था (फोलियर)',
        timingDays: '50-60 Days (Flowering/Podding)',
        nPct: 0,
        pPct: 0,
        kPct: 0,
        notes: 'Foliar spray of 00:52:34 (1 kg/acre) + Boron (100 g/acre) to prevent flower and pod drops.',
        notesHi: 'फूल व फली झड़न रोकने के लिए 00:52:34 व बोरॉन का हल्का फोलियर स्प्रे करें।'
      }
    ],
    commonPests: [
      {
        id: 'soy-girdle-beetle',
        name: 'Girdle Beetle & Tobacco Caterpillar (Semilooper)',
        localNameHi: 'चक्र भृंग (गर्डल बीटल) व तंबाकू इल्ली',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Double ring cuts on petioles/stems causing upper leaves to wither; perforated leaves.',
        recommendedProduct: 'Novaluron 5.25% + Indoxacarb 4.5% SC (e.g. Plethora)',
        activeChemical: 'Novaluron + Indoxacarb',
        formulation: 'Suspension Concentrate (SC)',
        dosePerAcre: '350 ml/acre',
        dosePer15LPump: '35 ml per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '350 ml',
        phiDays: 14,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Morning or late afternoon',
        cibrcRegNumber: 'CIR-51009/2014-Novaluron+Indoxacarb(SC)-890',
        compatNote: 'Highly effective combination covering both egg, larval and adult stages.'
      }
    ]
  },
  {
    id: 'maize',
    name: 'Maize / Corn (मक्का)',
    nameHi: 'मक्का',
    nameMr: 'मका',
    category: 'Cereal',
    season: 'Kharif',
    durationDays: '90-110 Days',
    defaultNpkKgPerAcre: { n: 48, p: 24, k: 16 },
    micronutrientsRecommended: ['Zinc Sulphate 33% (5 kg/acre)'],
    soilHealthTips: 'Zinc deficiency causes white bud disease in maize seedlings. Apply Zinc in basal.',
    soilHealthTipsHi: 'मक्का में जिंक की कमी से सफेद कली (White bud) रोग होता है, अतः बेसल में जिंक डालें।',
    splitSchedule: [
      {
        stageName: 'Basal / Sowing Stage',
        stageNameHi: 'बुवाई के समय',
        timingDays: 'Day 0',
        nPct: 33,
        pPct: 100,
        kPct: 100,
        notes: 'Full DAP + full Potash + 33% Nitrogen.',
        notesHi: 'पूरा DAP + पूरा पोटाश + 33% यूरिया।'
      },
      {
        stageName: 'Knee-High Stage',
        stageNameHi: 'घुटने की ऊंचाई पर (30 दिन)',
        timingDays: '30-35 Days',
        nPct: 33,
        pPct: 0,
        kPct: 0,
        notes: 'Second 33% Nitrogen top dress before rapid stem elongation.',
        notesHi: 'दूसरा 33% यूरिया का भुरकाव करें।'
      },
      {
        stageName: 'Tasseling & Silking Stage',
        stageNameHi: 'मूंछ व भुट्टा बनने की अवस्था (50 दिन)',
        timingDays: '50-55 Days',
        nPct: 34,
        pPct: 0,
        kPct: 0,
        notes: 'Final 34% Nitrogen for cob length and grain density.',
        notesHi: 'अंतिम 34% यूरिया डालें जिससे भुट्टा बड़ा और दाने ठोस बनें।'
      }
    ],
    commonPests: [
      {
        id: 'mz-faw',
        name: 'Fall Armyworm (FAW)',
        localNameHi: 'फाल आर्मीवर्म (सैनिक इल्ली)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Ragged irregular holes on leaves, whorls filled with moist sawdust-like fecal matter.',
        recommendedProduct: 'Spinetoram 11.7% SC (e.g. Delegate)',
        activeChemical: 'Spinetoram 11.7% SC',
        formulation: 'Suspension Concentrate (SC)',
        dosePerAcre: '100 ml/acre',
        dosePer15LPump: '10 ml per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '100 ml',
        phiDays: 14,
        ppeSafety: ['Face Mask', 'Gloves'],
        bestSprayTime: 'Direct spray directly inside the central whorl of the plant',
        cibrcRegNumber: 'CIR-49210/2013-Spinetoram(SC)-612',
        compatNote: 'Ensure water reaches deep inside the plant whorl.'
      }
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato & Vegetables (टमाटर / सब्जियां)',
    nameHi: 'टमाटर व सब्जियां',
    nameMr: 'टोमॅटो आणि भाजीपाला',
    category: 'Vegetable',
    season: 'All-Season',
    durationDays: '120-150 Days',
    defaultNpkKgPerAcre: { n: 60, p: 40, k: 48 },
    micronutrientsRecommended: ['Calcium Nitrate + Boron (Foliar)', 'Zinc + Iron chelated'],
    soilHealthTips: 'Calcium deficiency causes Blossom End Rot (black rot at fruit bottom). Provide regular Ca.',
    soilHealthTipsHi: 'कैल्शियम की कमी से फल का निचला हिस्सा काला पड़ता है (ब्लॉसम एंड रॉट), अतः कैल्शियम अवश्य दें।',
    splitSchedule: [
      {
        stageName: 'Basal / Bed Preparation',
        stageNameHi: 'रोपाई व क्यारी तैयारी (बेसल)',
        timingDays: 'Day 0',
        nPct: 30,
        pPct: 100,
        kPct: 40,
        notes: 'Full DAP + 40% Potash + 30% Urea + Farm Yard Manure in raised beds.',
        notesHi: 'क्यारी बनाते समय पूरा DAP + 40% पोटाश + 30% यूरिया व सड़ी गोबर खाद दें।'
      },
      {
        stageName: 'Flowering Stage',
        stageNameHi: 'फूल आने की अवस्था',
        timingDays: '30-40 Days After Transplanting',
        nPct: 35,
        pPct: 0,
        kPct: 30,
        notes: 'Second split of Nitrogen (35%) + Potash (30%) via fertigation or ring placement.',
        notesHi: '35% यूरिया व 30% पोटाश पौधों के तने से 5 सेमी दूर गोल रिंग में दें।'
      },
      {
        stageName: 'Peak Fruiting & Picking',
        stageNameHi: 'फल तुड़ाई व मुख्य उत्पादन अवस्था',
        timingDays: '60-80 Days After Transplanting',
        nPct: 35,
        pPct: 0,
        kPct: 30,
        notes: 'Remaining 35% Nitrogen + remaining 30% Potash to maintain fruit size and luster.',
        notesHi: 'अंतिम 35% यूरिया + शेष 30% पोटाश दें जिससे फल लगातार बड़े व चमकदार मिलें।'
      }
    ],
    commonPests: [
      {
        id: 'tom-fruit-borer',
        name: 'Tomato Fruit Borer (Helicoverpa)',
        localNameHi: 'टमाटर फल छेदक (हेलिकोवर्पा)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Circular clean holes bored in green and ripening tomatoes.',
        recommendedProduct: 'Chlorantraniliprole 18.5% SC (Coragen)',
        activeChemical: 'Chlorantraniliprole 18.5% SC',
        formulation: 'Suspension Concentrate (SC)',
        dosePerAcre: '60 ml/acre',
        dosePer15LPump: '6 ml per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '60 ml',
        phiDays: 3,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Late Afternoon',
        cibrcRegNumber: 'CIR-41002/2010-Chlorantraniliprole(SC)-720',
        compatNote: 'Very low 3-day pre-harvest interval; safe for vegetable market pickings.'
      },
      {
        id: 'tom-early-late-blight',
        name: 'Early & Late Blight (Fungal Leaf & Fruit Rot)',
        localNameHi: 'अगेती व पछेती झुलसा रोग',
        pestType: 'fungus',
        severity: 'high',
        symptoms: 'Target-board concentric rings or water-soaked greasy brown lesions on leaves and green fruit.',
        recommendedProduct: 'Metalaxyl 8% + Mancozeb 64% WP (e.g. Ridomil Gold)',
        activeChemical: 'Metalaxyl + Mancozeb',
        formulation: 'Wettable Powder (WP)',
        dosePerAcre: '500 g/acre',
        dosePer15LPump: '50 g (3 tablespoons) per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '500 g',
        phiDays: 7,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Morning before hot sun',
        cibrcRegNumber: 'CIR-31092/2006-Metalaxyl+Mancozeb(WP)-112',
        compatNote: 'Ensure thorough coverage on both upper and lower leaf surfaces.'
      }
    ]
  },
  {
    id: 'potato',
    name: 'Potato (आलू)',
    nameHi: 'आलू',
    nameMr: 'बटाटा',
    category: 'Vegetable',
    season: 'Rabi',
    durationDays: '90-110 Days',
    defaultNpkKgPerAcre: { n: 72, p: 32, k: 48 },
    micronutrientsRecommended: ['Zinc Sulphate 33% (5 kg/acre)', 'Magnesium Sulphate (10 kg/acre)'],
    soilHealthTips: 'Potato requires high Potassium (SOP is preferred over MOP for chips/starch quality).',
    soilHealthTipsHi: 'आलू में पोटाश देने से कंद का आकार और स्टार्च गुणवत्ता बढ़ती है।',
    splitSchedule: [
      {
        stageName: 'Basal / Planting',
        stageNameHi: 'बुवाई के समय (बेसल)',
        timingDays: 'Day 0',
        nPct: 50,
        pPct: 100,
        kPct: 100,
        notes: 'Full DAP + full Potash + 50% Urea in furrows below seed tuber level.',
        notesHi: 'आलू के बीज के नीचे पूरा DAP + पूरा पोटाश + आधा यूरिया डालें।'
      },
      {
        stageName: 'Earthing Up (Mitti Chadhana)',
        stageNameHi: 'मिट्टी चढ़ाने के समय (30-35 दिन)',
        timingDays: '30-35 Days After Planting',
        nPct: 50,
        pPct: 0,
        kPct: 0,
        notes: 'Remaining 50% Urea top dressed just before earthing up.',
        notesHi: 'मिट्टी चढ़ाने से ठीक पहले शेष आधा यूरिया डालें।'
      }
    ],
    commonPests: [
      {
        id: 'pot-late-blight',
        name: 'Late Blight of Potato (Phytophthora infestans)',
        localNameHi: 'आलू का पछेती झुलसा',
        pestType: 'fungus',
        severity: 'high',
        symptoms: 'Water-soaked irregular blackish brown lesions rapidly expanding during foggy damp weather.',
        recommendedProduct: 'Cymoxanil 8% + Mancozeb 64% WP (e.g. Curzate)',
        activeChemical: 'Cymoxanil + Mancozeb',
        formulation: 'Wettable Powder (WP)',
        dosePerAcre: '600 g/acre',
        dosePer15LPump: '60 g per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '600 g',
        phiDays: 14,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Morning or at first sign of cloudy foggy weather',
        cibrcRegNumber: 'CIR-44120/2011-Cymoxanil+Mancozeb(WP)-340',
        compatNote: 'Must be sprayed preventively before disease covers >5% leaf area.'
      }
    ]
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed (सरसों / राई)',
    nameHi: 'सरसों (राई)',
    nameMr: 'मोहरी',
    category: 'Oilseed',
    season: 'Rabi',
    durationDays: '110-130 Days',
    defaultNpkKgPerAcre: { n: 32, p: 16, k: 16 },
    micronutrientsRecommended: ['Bentonite Sulphur 90% (10 kg/acre)', 'Boron 20% foliar'],
    soilHealthTips: 'Sulphur is crucial for mustard oil pungency and seed oil percentage.',
    soilHealthTipsHi: 'सरसों में सल्फर देने से तेल की मात्रा 2-3% बढ़ जाती है।',
    splitSchedule: [
      {
        stageName: 'Basal / Sowing Stage',
        stageNameHi: 'बुवाई के समय',
        timingDays: 'Day 0',
        nPct: 50,
        pPct: 100,
        kPct: 100,
        notes: 'Full DAP/SSP + full MOP + 50% Urea + 10 kg Sulphur.',
        notesHi: 'पूरा DAP/SSP + पूरा पोटाश + 50% यूरिया + 10 किलो सल्फर डालें।'
      },
      {
        stageName: '1st Irrigation (Flowering Initiation)',
        stageNameHi: 'पहली सिंचाई (शाखाएं व फूल आने पर)',
        timingDays: '30-35 Days',
        nPct: 50,
        pPct: 0,
        kPct: 0,
        notes: 'Remaining 50% Urea top dressed after first irrigation.',
        notesHi: 'पहली सिंचाई के बाद शेष 50% यूरिया दें।'
      }
    ],
    commonPests: [
      {
        id: 'mus-aphid',
        name: 'Mustard Aphid (Chepa / Moyla)',
        localNameHi: 'सरसों का चेपा / मोयला (माहू)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Dense colonies of green aphids clustering on inflorescence, twigs, and pods.',
        recommendedProduct: 'Dimethoate 30% EC (Rogor) or Thiamethoxam 25% WG',
        activeChemical: 'Dimethoate 30% EC',
        formulation: 'Emulsifiable Concentrate (EC)',
        dosePerAcre: '350 ml/acre',
        dosePer15LPump: '35 ml per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '350 ml',
        phiDays: 14,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Sunny afternoon when aphids are active',
        cibrcRegNumber: 'CIR-18920/1997-Dimethoate(EC)-210',
        compatNote: 'Spray in late afternoon to avoid harming pollinating honeybees.'
      }
    ]
  },
  {
    id: 'gram',
    name: 'Gram / Chickpea / Pulses (चना / दालें)',
    nameHi: 'चना (दालें)',
    nameMr: 'हरभरा / चणा',
    category: 'Pulse',
    season: 'Rabi',
    durationDays: '100-115 Days',
    defaultNpkKgPerAcre: { n: 8, p: 20, k: 8 },
    micronutrientsRecommended: ['Rhizobium culture', 'Ammonium Molybdate'],
    soilHealthTips: 'Avoid excess Nitrogen which causes vegetative overgrowth without pod formation.',
    soilHealthTipsHi: 'चने में ज्यादा यूरिया न डालें, अन्यथा सिर्फ पौधे बढ़ेंगे और फलियां नहीं बनेंगी।',
    splitSchedule: [
      {
        stageName: 'Basal / Sowing Stage',
        stageNameHi: 'बुवाई के समय (एकमात्र खुराक)',
        timingDays: 'Day 0',
        nPct: 100,
        pPct: 100,
        kPct: 100,
        notes: 'All NPK applied at sowing through SSP + MOP or DAP. No top dressing needed.',
        notesHi: 'बुवाई पर ही पूरा खाद दें। बाद में यूरिया डालने की आवश्यकता नहीं होती।'
      }
    ],
    commonPests: [
      {
        id: 'chick-pod-borer',
        name: 'Gram Pod Borer (Helicoverpa armigera)',
        localNameHi: 'चना फली छेदक (इल्ली)',
        pestType: 'insect',
        severity: 'high',
        symptoms: 'Circular holes on pods with caterpillar head inserted inside feeding on developing grains.',
        recommendedProduct: 'Chlorantraniliprole 18.5% SC or Emamectin Benzoate 5% SG',
        activeChemical: 'Chlorantraniliprole 18.5% SC',
        formulation: 'Suspension Concentrate (SC)',
        dosePerAcre: '60 ml/acre',
        dosePer15LPump: '6 ml per 15L tank',
        pumpsPerAcre: 10,
        totalChemicalAcre: '60 ml',
        phiDays: 11,
        ppeSafety: ['Face Mask', 'Rubber Gloves'],
        bestSprayTime: 'Late Afternoon',
        cibrcRegNumber: 'CIR-41002/2010-Chlorantraniliprole(SC)-720',
        compatNote: 'Can install pheromone traps @ 5 traps/acre for timely monitoring.'
      }
    ]
  }
];

// Calculation utility based on land size and unit
export interface FertilizerCombination {
  id: string;
  title: string;
  titleHi: string;
  badge: string;
  description: string;
  descriptionHi: string;
  fertilizers: Array<{
    name: string;
    brand: string;
    quantityKg: number;
    unitFormat: string; // e.g. "3.2 Bags (45kg)" or "2 Bottles (500ml)"
    estPrice: number;
    subsidizedGovtRate: number;
    isNanoBio?: boolean;
  }>;
  totalCost: number;
  subsidizedCost: number;
  subsidySavings: number;
}

export function calculateNutrientAndFertilizers(
  cropId: string,
  landSize: number,
  landUnit: 'acres' | 'hectares' | 'guntha' | 'bigha',
  soilCondition: 'low' | 'medium' | 'high'
) {
  // Convert any local unit to standardized Acres
  let acres = landSize;
  if (landUnit === 'hectares') {
    acres = landSize * 2.47105;
  } else if (landUnit === 'guntha') {
    acres = landSize / 40; // 40 Guntha = 1 Acre
  } else if (landUnit === 'bigha') {
    acres = landSize / 1.61; // Approx 1.61 Bigha per Acre in North/Central India
  }

  const crop = CROP_PROFILES.find((c) => c.id === cropId) || CROP_PROFILES[0];

  // Soil adjustment factor:
  // Low fertility = +20% requirement
  // Medium = 100% standard
  // High = -20% requirement
  const soilMultiplier = soilCondition === 'low' ? 1.2 : soilCondition === 'high' ? 0.8 : 1.0;

  const targetN = Math.round(crop.defaultNpkKgPerAcre.n * acres * soilMultiplier);
  const targetP = Math.round(crop.defaultNpkKgPerAcre.p * acres * soilMultiplier);
  const targetK = Math.round(crop.defaultNpkKgPerAcre.k * acres * soilMultiplier);

  // --- Option 1: Standard Conventional (Urea 46% + DAP 18:46 + MOP 60%) ---
  // DAP provides all P: DAP (kg) = targetP / 0.46
  const dapKg = Math.round(targetP / 0.46);
  const nFromDap = Math.round(dapKg * 0.18);
  const remainingN1 = Math.max(0, targetN - nFromDap);
  const ureaKg1 = Math.round(remainingN1 / 0.46);
  const mopKg1 = Math.round(targetK / 0.60);

  const ureaBags1 = (ureaKg1 / 45).toFixed(1);
  const dapBags1 = (dapKg / 50).toFixed(1);
  const mopBags1 = (mopKg1 / 50).toFixed(1);

  // Government Statutory Prices (INR)
  // Urea: ~₹266 per 45kg bag (heavily subsidized)
  // DAP: ~₹1350 per 50kg bag
  // MOP: ~₹1650 per 50kg bag
  const ureaCost1 = Math.round((ureaKg1 / 45) * 266);
  const dapCost1 = Math.round((dapKg / 50) * 1350);
  const mopCost1 = Math.round((mopKg1 / 50) * 1650);
  const totalCost1 = ureaCost1 + dapCost1 + mopCost1;
  const subsidySavings1 = Math.round(totalCost1 * 1.85); // Approx Govt DBT subsidy absorbed

  // --- Option 2: Eco-Tech & Nano Urea Formulation (Nano Urea + Reduced Conventional + Bio-stimulant) ---
  // 1 bottle 500ml Nano Urea replaces 1 bag (45kg) Urea
  const nanoBottles = Math.max(1, Math.round(Number(ureaBags1) * 0.6));
  const remainingUreaKg2 = Math.round(ureaKg1 * 0.4);
  const ureaBags2 = (remainingUreaKg2 / 45).toFixed(1);
  const nanoCost = nanoBottles * 225; // ₹225 per bottle
  const ureaCost2 = Math.round((remainingUreaKg2 / 45) * 266);
  const totalCost2 = nanoCost + ureaCost2 + dapCost1 + mopCost1;

  // --- Option 3: Complex NPK Fertilizer Formulation (NPK 12:32:16 or 10:26:26 + Urea) ---
  // Using NPK 12:32:16 as basis:
  const npkComplexKg = Math.round(targetP / 0.32);
  const nFromComplex = Math.round(npkComplexKg * 0.12);
  const kFromComplex = Math.round(npkComplexKg * 0.16);
  const remainingN3 = Math.max(0, targetN - nFromComplex);
  const remainingK3 = Math.max(0, targetK - kFromComplex);
  const ureaKg3 = Math.round(remainingN3 / 0.46);
  const mopKg3 = Math.round(remainingK3 / 0.60);
  const npkBags3 = (npkComplexKg / 50).toFixed(1);
  const ureaBags3 = (ureaKg3 / 45).toFixed(1);
  const mopBags3 = (mopKg3 / 50).toFixed(1);
  const npkCost3 = Math.round((npkComplexKg / 50) * 1470);
  const ureaCost3 = Math.round((ureaKg3 / 45) * 266);
  const mopCost3 = Math.round((mopKg3 / 50) * 1650);
  const totalCost3 = npkCost3 + ureaCost3 + mopCost3;

  const combinations: FertilizerCombination[] = [
    {
      id: 'comb-traditional',
      title: 'Traditional DAP + Urea + MOP Plan',
      titleHi: 'पारंपरिक DAP + यूरिया + पोटाश योजना',
      badge: 'Widely Available (सर्वाधिक प्रचलित)',
      description: 'Standard granular application using statutory APMC cooperative fertilizers.',
      descriptionHi: 'सहकारी समितियों पर मिलने वाली मानक दानेदार खाद का संतुलित संयोजन।',
      fertilizers: [
        {
          name: 'IFFCO / KRIBHCO Neem Coated Urea',
          brand: 'IFFCO / National Fertilizers',
          quantityKg: ureaKg1,
          unitFormat: `${ureaBags1} Bags (45 kg)`,
          estPrice: ureaCost1,
          subsidizedGovtRate: 266
        },
        {
          name: 'Di-Ammonium Phosphate (DAP 18:46:0)',
          brand: 'IFFCO / IPL / Paras',
          quantityKg: dapKg,
          unitFormat: `${dapBags1} Bags (50 kg)`,
          estPrice: dapCost1,
          subsidizedGovtRate: 1350
        },
        {
          name: 'Muriate of Potash (MOP 0:0:60)',
          brand: 'IPL / Coromandel',
          quantityKg: mopKg1,
          unitFormat: `${mopBags1} Bags (50 kg)`,
          estPrice: mopCost1,
          subsidizedGovtRate: 1650
        }
      ],
      totalCost: totalCost1,
      subsidizedCost: totalCost1,
      subsidySavings: subsidySavings1
    },
    {
      id: 'comb-nano-tech',
      title: 'Modern Nano Urea + DAP Eco-Plan',
      titleHi: 'नैनो यूरिया + DAP आधुनिक पर्यावरण योजना',
      badge: 'Higher Efficiency & Eco-Safe',
      description: 'Replaces bulky Urea bags with liquid foliar Nano Urea bottles, preventing soil degradation.',
      descriptionHi: 'यूरिया की भारी बोरियों को घटाकर नैनो यूरिया का उपयोग, जिससे मिट्टी खराब नहीं होती।',
      fertilizers: [
        {
          name: 'IFFCO Nano Urea Plus Liquid (4% N)',
          brand: 'IFFCO Certified Tech',
          quantityKg: nanoBottles * 0.5,
          unitFormat: `${nanoBottles} Bottles (500 ml)`,
          estPrice: nanoCost,
          subsidizedGovtRate: 225,
          isNanoBio: true
        },
        {
          name: 'Basal Neem Coated Urea (Starter)',
          brand: 'IFFCO / KRIBHCO',
          quantityKg: remainingUreaKg2,
          unitFormat: `${ureaBags2} Bags (45 kg)`,
          estPrice: ureaCost2,
          subsidizedGovtRate: 266
        },
        {
          name: 'DAP (18:46:0) Granular',
          brand: 'IFFCO Direct',
          quantityKg: dapKg,
          unitFormat: `${dapBags1} Bags (50 kg)`,
          estPrice: dapCost1,
          subsidizedGovtRate: 1350
        },
        {
          name: 'MOP (0:0:60) Potash',
          brand: 'IPL',
          quantityKg: mopKg1,
          unitFormat: `${mopBags1} Bags (50 kg)`,
          estPrice: mopCost1,
          subsidizedGovtRate: 1650
        }
      ],
      totalCost: totalCost2,
      subsidizedCost: totalCost2,
      subsidySavings: Math.round(subsidySavings1 * 1.1)
    },
    {
      id: 'comb-complex-npk',
      title: 'Complex NPK (12:32:16) Balanced Plan',
      titleHi: 'एन.पी.के. कॉम्प्लेक्स (12:32:16) संतुलित योजना',
      badge: 'Balanced Root Nutrition',
      description: 'Single-granule uniform distribution of Nitrogen, Phosphorus, and Potassium.',
      descriptionHi: 'एक ही दाने में नाइट्रोजन, फास्फोरस और पोटाश का एक समान वितरण।',
      fertilizers: [
        {
          name: 'NPK Complex (12:32:16)',
          brand: 'IFFCO / Coromandel Gromor',
          quantityKg: npkComplexKg,
          unitFormat: `${npkBags3} Bags (50 kg)`,
          estPrice: npkCost3,
          subsidizedGovtRate: 1470
        },
        {
          name: 'Neem Coated Urea (Top-Dress)',
          brand: 'IFFCO / KRIBHCO',
          quantityKg: ureaKg3,
          unitFormat: `${ureaBags3} Bags (45 kg)`,
          estPrice: ureaCost3,
          subsidizedGovtRate: 266
        },
        ...(mopKg3 > 0 ? [{
          name: 'MOP (0:0:60) Supplementary',
          brand: 'IPL Potash',
          quantityKg: mopKg3,
          unitFormat: `${mopBags3} Bags (50 kg)`,
          estPrice: mopCost3,
          subsidizedGovtRate: 1650
        }] : [])
      ],
      totalCost: totalCost3,
      subsidizedCost: totalCost3,
      subsidySavings: Math.round(subsidySavings1 * 0.95)
    }
  ];

  // Calculate scaled pesticide requirements for the exact acreage
  const scaledPests = crop.commonPests.map((pest) => {
    const totalPumps = Math.round(pest.pumpsPerAcre * acres);
    return {
      ...pest,
      totalPumpsForFarm: totalPumps,
      waterVolumeLiters: totalPumps * 15,
      farmScaleDoseNote: `For your ${acres.toFixed(1)} acres: Mix ${pest.dosePer15LPump} in clean water. You will need approx ${totalPumps} pumps (${totalPumps * 15} Litres water).`
    };
  });

  return {
    crop,
    acres,
    landSize,
    landUnit,
    targetNutrients: {
      n: targetN,
      p: targetP,
      k: targetK
    },
    combinations,
    scaledPests
  };
}
