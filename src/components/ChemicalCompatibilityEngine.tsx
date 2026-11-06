import React, { useState } from 'react';
import {
  FlaskConical,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  TestTube2,
  Glasses,
  Clock,
  Sparkles,
  Info,
  Layers,
  Thermometer,
  Droplets,
  Plane,
  Sun,
  Sprout,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Check,
  Compass
} from 'lucide-react';
import { ChemicalInput, Language, CompatibilityReport, EnvironmentalConditions, ConditionalAlert } from '../types';
import { CHEMICAL_INPUTS } from '../data/mockData';
import { translations } from '../data/translations';
import { speechService } from '../services/speechService';
import { REGIONAL_WEATHER_DATA } from '../data/moduleData';

interface ChemicalCompatibilityEngineProps {
  language: Language;
}

export const ChemicalCompatibilityEngine: React.FC<ChemicalCompatibilityEngineProps> = ({ language }) => {
  // Selected Chemicals
  const [selectedChemIds, setSelectedChemIds] = useState<string[]>([
    'chem-nano-urea',
    'chem-chlorpyrifos'
  ]);
  const [activeTabCategory, setActiveTabCategory] = useState<string>('All');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Environmental & Application Conditions (Mandatory Dynamic Constraints)
  const [conditions, setConditions] = useState<EnvironmentalConditions>({
    waterPh: 7.2,
    waterHardnessPpm: 220,
    temperatureC: 28,
    cropGrowthStage: 'vegetative',
    applicationMethod: 'high_volume_knapsack',
    timeOfDay: 'early_morning'
  });

  const [activePresetConditionName, setActivePresetConditionName] = useState<string | null>(null);

  const t = translations[language];

  // Toggle chemical selection
  const handleToggleChem = (id: string) => {
    if (selectedChemIds.includes(id)) {
      setSelectedChemIds(selectedChemIds.filter((c) => c !== id));
    } else {
      if (selectedChemIds.length >= 4) {
        alert('Spray tanks are usually limited to max 4 combined products for agronomic safety.');
        return;
      }
      setSelectedChemIds([...selectedChemIds, id]);
    }
  };

  const handleReset = () => {
    setSelectedChemIds([]);
    setConditions({
      waterPh: 7.0,
      waterHardnessPpm: 200,
      temperatureC: 26,
      cropGrowthStage: 'vegetative',
      applicationMethod: 'high_volume_knapsack',
      timeOfDay: 'early_morning'
    });
    setActivePresetConditionName(null);
    speechService.stop();
    setIsSpeaking(false);
  };

  // Load weather from active regional data
  const handleImportLocalWeather = () => {
    const yavatmal = REGIONAL_WEATHER_DATA['Yavatmal'];
    setConditions((prev) => ({
      ...prev,
      temperatureC: Math.round(yavatmal.temperature),
      timeOfDay: 'early_morning'
    }));
    setActivePresetConditionName('Imported Live Weather');
  };

  // Preset Demonstrating Specific Condition Incompatibilities
  const applyConditionScenario = (
    chemList: string[],
    conds: Partial<EnvironmentalConditions>,
    scenarioName: string
  ) => {
    setSelectedChemIds(chemList);
    setConditions((prev) => ({ ...prev, ...conds }));
    setActivePresetConditionName(scenarioName);
    speechService.stop();
    setIsSpeaking(false);
  };

  const selectedChems = CHEMICAL_INPUTS.filter((c) => selectedChemIds.includes(c.id));

  // Compute Compatibility: Multi-factor Dynamic Condition Evaluation Engine
  const computeCompatibility = (): CompatibilityReport => {
    if (selectedChems.length < 2) {
      return {
        status: 'safe',
        title: 'Single Product in Tank',
        summary: 'Add at least one more fertilizer, pesticide, or micronutrient to evaluate tank-mix and field conditions.',
        chemicalReactionDetail: 'No chemical interaction when spraying an isolated single active ingredient.',
        riskFactors: ['Check spray water pH before tank addition (Optimal: 6.0 - 6.8).'],
        ppeRequirements: selectedChems.length === 1 ? selectedChems[0].ppeRequired : ['Standard chemical safety gloves', 'Eye protection'],
        jarTestProtocol: 'Fill clean 1-litre transparent glass jar with 800ml field water, add proportional dose, and shake.',
        applicationGuidance: 'Apply during cool morning or evening hours with low wind drift.',
        audioSpeechText: 'Please select two or more chemicals in your spray tank to run the dynamic compatibility analysis.'
      };
    }

    // --- STEP 1: Baseline Fixed Chemical Compatibility Check ---
    const incompatibilitiesFound: { pair: [string, string]; note: string }[] = [];

    for (let i = 0; i < selectedChems.length; i++) {
      for (let j = i + 1; j < selectedChems.length; j++) {
        const chemA = selectedChems[i];
        const chemB = selectedChems[j];

        const aConflictsWithB = chemA.incompatibleWith.some(
          (inc) =>
            chemB.tradeName.toLowerCase().includes(inc.toLowerCase()) ||
            chemB.activeIngredient.toLowerCase().includes(inc.toLowerCase())
        );

        const bConflictsWithA = chemB.incompatibleWith.some(
          (inc) =>
            chemA.tradeName.toLowerCase().includes(inc.toLowerCase()) ||
            chemA.activeIngredient.toLowerCase().includes(inc.toLowerCase())
        );

        if (aConflictsWithB || bConflictsWithA) {
          const note =
            chemA.incompatibleNotes[chemB.tradeName] ||
            chemB.incompatibleNotes[chemA.tradeName] ||
            `Chemical clash detected between ${chemA.activeIngredient} and ${chemB.activeIngredient}.`;

          incompatibilitiesFound.push({
            pair: [chemA.tradeName, chemB.tradeName],
            note
          });
        }
      }
    }

    // Specific severe baseline chemistry checks:
    const hasCalc = selectedChems.some((c) => c.id === 'chem-calc-nitrate');
    const hasMKP = selectedChems.some((c) => c.id === 'chem-mkp');
    const hasCopper = selectedChems.some((c) => c.id === 'chem-copper-oxy');
    const hasChlor = selectedChems.some((c) => c.id === 'chem-chlorpyrifos');
    const hasGly = selectedChems.some((c) => c.id === 'chem-glyphosate');
    const hasNanoUrea = selectedChems.some((c) => c.id === 'chem-nano-urea');
    const hasZinc = selectedChems.some((c) => c.id === 'chem-zinc-edta');

    let baselineStatus: 'safe' | 'danger' = 'safe';
    let baselineReport: Partial<CompatibilityReport> = {};

    if (hasCalc && hasMKP) {
      baselineStatus = 'danger';
      baselineReport = {
        title: 'CRITICAL PRECIPITATION HAZARD: Calcium Phosphate Clumping',
        summary: 'Mixing Calcium Nitrate with Mono Potassium Phosphate triggers an instantaneous double-displacement reaction producing insoluble dicalcium phosphate.',
        chemicalReactionDetail: 'Ca(NO3)2 + KH2PO4 → Insoluble CaHPO4 ↓ (chalky white precipitate). Blocks nozzles permanently and destroys nutrient uptake.',
        riskFactors: [
          'Immediate severe clogging of hydraulic spray nozzles and line strainers.',
          'Zero foliar nutrient uptake: white chalk marks causing severe surface cosmetic damage.',
          'Piston pump cavitation and excessive seal friction damage.'
        ]
      };
    } else if (hasCopper && hasChlor) {
      baselineStatus = 'danger';
      baselineReport = {
        title: 'TOXIC PHYTOTOXICITY ALERT: Alkaline Hydrolysis & Leaf Scorch',
        summary: 'Copper Oxychloride has an alkaline pH (8.0-9.0), destroying the acidic ester bond of Chlorpyrifos within 15 minutes of tank preparation.',
        chemicalReactionDetail: 'Rapid alkaline cleavage breaks the organophosphorothioate ester, releasing trichloropyridinol and toxic ionic salts. Emulsion breaks into floating oily scum.',
        riskFactors: [
          'Severe necrotic leaf spotting, scorched leaf margins, and flower drop.',
          'Chlorpyrifos pest-control efficacy drops by over 85%, leaving sucking insects uncontrolled.',
          'High aerosol toxicity to the spray operator due to solvent destabilization.'
        ]
      };
    } else if (hasCopper && hasGly) {
      baselineStatus = 'danger';
      baselineReport = {
        title: 'HERBICIDE DEACTIVATION: Copper-Glyphosate Chelation',
        summary: 'Copper cations bind irreversibly to glyphosate phosphonomethyl functional groups, completely neutralizing weed killing activity.',
        chemicalReactionDetail: 'Cu2+ chelation locks the herbicide molecules into heavy insoluble complexes that cannot penetrate plant cuticle.',
        riskFactors: [
          'Zero weed control efficacy (100% economic loss on chemical input cost).',
          'Leaves insoluble residue inside herbicide spray equipment.'
        ]
      };
    } else if (incompatibilitiesFound.length > 0) {
      baselineStatus = 'danger';
      baselineReport = {
        title: 'BASELINE CHEMICAL INCOMPATIBILITY DETECTED',
        summary: `Conflicting interactions detected between ${incompatibilitiesFound.map((i) => i.pair.join(' + ')).join('; ')}.`,
        chemicalReactionDetail: incompatibilitiesFound.map((i) => i.note).join(' '),
        riskFactors: [
          'Risk of foliar burn or reduced biological efficacy.',
          'Chemical breakdown into inert or toxic secondary compounds.',
          'Physical tank separation or nozzle filter blockage.'
        ]
      };
    } else {
      baselineStatus = 'safe';
      baselineReport = {
        title: hasNanoUrea && hasZinc ? 'EXCELLENT SYNERGISTIC TANK MIX' : 'BASELINE COMPATIBLE IN LABORATORY TEST',
        summary: hasNanoUrea && hasZinc
          ? 'Nano Urea and Chelated Zinc EDTA exhibit strong nutritional synergy under neutral conditions.'
          : `All ${selectedChems.length} selected inputs are chemically stable together in neutral laboratory water.`,
        chemicalReactionDetail: 'Active ingredients remain homogeneous in pure solution without direct precipitation.',
        riskFactors: ['Safe under standard moderate climatic conditions.']
      };
    }

    // --- STEP 2: DYNAMIC FIELD CONDITION CONSTRAINTS EVALUATION ---
    // Two products that are generally compatible may become UNSUITABLE under water pH, temperature, crop growth stage, or application method.
    const conditionAlerts: ConditionalAlert[] = [];

    // 1. Water pH Constraint
    if (conditions.waterPh > 7.5) {
      const hasOrganoOrPyrethroid = selectedChems.some((c) =>
        c.category === 'Insecticide' ||
        c.activeIngredient.toLowerCase().includes('chlorpyrifos') ||
        c.activeIngredient.toLowerCase().includes('imidacloprid') ||
        c.activeIngredient.toLowerCase().includes('cypermethrin') ||
        c.activeIngredient.toLowerCase().includes('coragen')
      );

      if (hasOrganoOrPyrethroid) {
        conditionAlerts.push({
          type: 'water_ph',
          severity: 'danger',
          title: `Alkaline Hydrolysis Degradation (Water pH: ${conditions.waterPh})`,
          description: `Spray water pH is ${conditions.waterPh} (Alkaline borewell/canal water). Insecticide active molecules break down via alkaline hydrolysis. Chlorpyrifos and Imidacloprid lose 50-70% efficacy within 20 minutes in tank.`,
          correctiveAction: 'Add a tank water acidifier/buffer (Citric Acid @ 50-75g per 100L water or commercial pH reducer) to lower water pH to 6.2 - 6.8 before mixing products.'
        });
      }
    } else if (conditions.waterPh < 5.8) {
      const hasHeavyMetalOrCopper = selectedChems.some((c) =>
        c.id.includes('copper') ||
        c.category === 'Micronutrient' ||
        c.category === 'Fungicide'
      );
      if (hasHeavyMetalOrCopper) {
        conditionAlerts.push({
          type: 'water_ph',
          severity: 'danger',
          title: `Acidic Phytotoxicity Hazard (Water pH: ${conditions.waterPh})`,
          description: `Acidic water (pH ${conditions.waterPh}) accelerates metal ion dissociation to toxic concentrations, causing acute acidic chemical leaf scorch and necrotic burn.`,
          correctiveAction: 'Buffer water with baking soda (Sodium Bicarbonate) to reach neutral pH 6.5.'
        });
      }
    }

    // 2. Temperature & Solar Radiation Constraint
    if (conditions.temperatureC >= 32) {
      const hasFertilizerOrEC = selectedChems.some((c) =>
        c.category === 'Fertilizer' ||
        c.category === 'Micronutrient' ||
        c.formulation.includes('EC') ||
        c.formulation.includes('Emulsifiable')
      );

      const isHighHeat = conditions.temperatureC >= 35;

      if (hasFertilizerOrEC) {
        conditionAlerts.push({
          type: 'temperature',
          severity: isHighHeat || conditions.timeOfDay === 'noon_harsh_sun' ? 'danger' : 'caution',
          title: `Thermal Leaf Scorch & Rapid Evaporation (${conditions.temperatureC}°C)`,
          description: `At ${conditions.temperatureC}°C, foliar nitrogen salts and EC solvents dry out on leaves within 3 minutes, leaving burning salt crystals that cause necrotic margins and biuret phytotoxicity. Stomata are closed to prevent water loss, yielding zero systemic absorption.`,
          correctiveAction: 'Do not spray at current temperature. Postpone spray to early morning (05:30 - 08:30 AM) when temperature is below 28°C and foliage can absorb nutrients.'
        });
      }
    }

    // 3. Crop Growth Stage Constraint (Phenological Vulnerability)
    if (conditions.cropGrowthStage === 'flowering') {
      const hasInsecticideOrHighNitrogen = selectedChems.some((c) =>
        c.category === 'Insecticide' ||
        c.category === 'Fertilizer' ||
        c.category === 'Herbicide'
      );

      if (hasInsecticideOrHighNitrogen) {
        conditionAlerts.push({
          type: 'growth_stage',
          severity: 'danger',
          title: 'Flowering & Anthesis Hazard (Blossom Abortion & Bee Kill)',
          description: `CRITICAL STAGE CONSTRAINT: Even though these products are chemically compatible in a bucket, spraying foliar nitrogen or insecticides during open flowering/anthesis causes direct floral stigma desiccation, blossom abortion, and acute toxicity to honeybee pollinators.`,
          correctiveAction: 'STRICTLY AVOID combined foliar spray during active bloom. Wait until petal-fall and early fruit/boll setting stage, or apply micro-doses exclusively in late twilight.'
        });
      }
    } else if (conditions.cropGrowthStage === 'seedling') {
      const isHighConcentration = selectedChems.length >= 2;
      if (isHighConcentration) {
        conditionAlerts.push({
          type: 'growth_stage',
          severity: 'caution',
          title: 'Tender Seedling Osmotic Stress (0-20 DAS)',
          description: `Young seedlings possess very thin cuticular wax. The combined osmotic pressure of multiple foliar inputs risks osmotic salt dehydration (plasmolysis) of tender cotyledons.`,
          correctiveAction: 'Halve the application dosage or apply single-product light soil drench.'
        });
      }
    } else if (conditions.cropGrowthStage === 'maturity_preharvest') {
      const maxPhi = Math.max(...selectedChems.map((c) => c.phiDays));
      if (maxPhi > 7) {
        conditionAlerts.push({
          type: 'growth_stage',
          severity: 'danger',
          title: `Statutory Pre-Harvest Interval (PHI) Violation (${maxPhi} Days)`,
          description: `Crop is approaching harvest. Applying ${selectedChems.map((c) => c.tradeName).join(', ')} violates CIBRC pre-harvest interval requirements (${maxPhi} days needed). Food residues will exceed statutory Maximum Residue Limits (MRL).`,
          correctiveAction: 'Do not apply synthetic chemicals. Use zero-residue bio-pesticides (Neem extract, Trichoderma) with 0-day PHI.'
        });
      }
    }

    // 4. Application Method Constraint (Drone ULV vs High Volume)
    if (conditions.applicationMethod === 'drone_ulv') {
      const hasWettablePowder = selectedChems.some((c) => c.formulation.includes('WP'));
      const hasHighSalts = selectedChems.some((c) => c.category === 'Fertilizer' || c.category === 'Micronutrient');

      if (hasWettablePowder) {
        conditionAlerts.push({
          type: 'application_method',
          severity: 'danger',
          title: 'Drone Atomizer Clogging & Formulation Incompatibility',
          description: `Ultra-Low Volume (ULV) drone spray uses only 8-10 L water/acre. Wettable Powders (WP) fail to suspend at this 20× concentration and precipitate into heavy sludge that clogs high-speed centrifugal atomizer nozzles and strainer meshes.`,
          correctiveAction: 'Substitute Wettable Powders (WP) with Suspension Concentrates (SC) or water-soluble liquids (SL) certified for drone ULV spray.'
        });
      } else if (hasHighSalts && selectedChems.length >= 2) {
        conditionAlerts.push({
          type: 'application_method',
          severity: 'caution',
          title: 'High Drone ULV Ionic Conductivity (EC Shock)',
          description: `In 10 L water/acre drone spray, ionic concentration is 18× higher than standard 180 L manual spray. Multiple combined salt formulations reach high electrical conductivity (EC > 3.2 dS/m), risking acute foliar dehydration.`,
          correctiveAction: 'Ensure total water volume is increased to minimum 12-15 L/acre or apply nutrients separately from curative crop protection.'
        });
      }
    }

    // --- STEP 3: Synthesize Final Dynamic Report ---
    const hasDangerCondition = conditionAlerts.some((a) => a.severity === 'danger');
    const hasCautionCondition = conditionAlerts.some((a) => a.severity === 'caution');

    // Was baseline safe but made unsafe by conditions?
    const conditionOverride = baselineStatus === 'safe' && (hasDangerCondition || hasCautionCondition);

    let finalStatus: 'safe' | 'danger' | 'caution' = baselineStatus;
    if (hasDangerCondition) {
      finalStatus = 'danger';
    } else if (hasCautionCondition && finalStatus !== 'danger') {
      finalStatus = 'caution';
    }

    const allPpe = Array.from(new Set(selectedChems.flatMap((c) => c.ppeRequired)));
    const maxPhi = Math.max(...selectedChems.map((c) => c.phiDays));

    let finalTitle = baselineReport.title || 'Compatibility Assessment';
    let finalSummary = baselineReport.summary || '';

    if (conditionOverride) {
      if (hasDangerCondition) {
        finalTitle = 'CONDITION OVERRIDE: UNSUITABLE UNDER CURRENT FIELD CONDITIONS';
        finalSummary = `Although these ${selectedChems.length} products are generally compatible in standard tables, they are UNSUITABLE for combined application under your current field conditions (${conditionAlerts.map((a) => a.title).join('; ')}).`;
      } else {
        finalTitle = 'CONDITION CAUTION: RESTRICTED UNDER CURRENT FIELD CONDITIONS';
        finalSummary = `These products are generally compatible, but require special dosage and timing adjustments for your current environment.`;
      }
    }

    const combinedRiskFactors = [
      ...(baselineReport.riskFactors || []),
      ...conditionAlerts.map((a) => `${a.title}: ${a.description}`)
    ];

    const audioText = conditionOverride
      ? language === 'hi'
        ? `सावधान! हालांकि यह उत्पाद सामान्य रूप से संगत हैं, लेकिन आपके खेत की परिस्थितियों जैसे पानी का पी-एच ${conditions.waterPh}, तापमान ${conditions.temperatureC} डिग्री, या फूल आने की अवस्था के कारण यह स्प्रे हानिकारक हो सकता है। कृपया सलाह पढ़ें।`
        : language === 'mr'
        ? `लक्ष द्या! हे औषध सर्वसाधारणपणे चालत असले तरी, तुमच्या शेतातील पाणी, तापमान किंवा फुलोरा अवस्थेमुळे हे मिश्रण घातक ठरू शकते. फवारणीपूर्वी परिस्थिती तपासा.`
        : `Warning. While these agricultural inputs are generally compatible in a fixed table, they are UNSUITABLE under your specific field conditions such as water pH of ${conditions.waterPh}, temperature of ${conditions.temperatureC} degrees, crop growth stage, or application method. Review the conditional alerts.`
      : baselineStatus === 'danger'
      ? (baselineReport as any).audioSpeechText || 'Hazardous chemical reaction detected. Do not mix.'
      : 'Good news. This tank mixture is compatible under your specified environmental conditions.';

    return {
      status: finalStatus,
      title: finalTitle,
      summary: finalSummary,
      chemicalReactionDetail: baselineReport.chemicalReactionDetail || '',
      riskFactors: combinedRiskFactors,
      ppeRequirements: allPpe.length > 0 ? allPpe : ['Protective rubber gloves', 'Safety goggles'],
      jarTestProtocol: 'Conduct standard 1-Litre Jar Test using the actual borewell/irrigation water you intend to spray in the field.',
      applicationGuidance: `Maintain tank agitation. Pre-Harvest Interval (PHI): Observe at least ${maxPhi} days before harvest.`,
      audioSpeechText: audioText,
      baselineTableStatus: baselineStatus === 'safe' ? 'compatible' : 'incompatible',
      conditionOverrideApplied: conditionOverride,
      conditionalAlerts: conditionAlerts,
      phAdjustmentAdvice: conditions.waterPh > 7.5 ? 'Add 50-75g Citric Acid per 100L water to reduce pH to 6.2.' : undefined,
      stageSafeAlternative: conditions.cropGrowthStage === 'flowering' ? 'Postpone combined application until petal-fall stage to avoid blossom drop and bee kill.' : undefined
    };
  };

  const report = computeCompatibility();

  const handleAudioGuide = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(report.audioSpeechText, language);
      setIsSpeaking(true);
    }
  };

  const categories = ['All', 'Insecticide', 'Fungicide', 'Fertilizer', 'Micronutrient', 'Herbicide', 'Bio-Stimulant'];
  const filteredInputs =
    activeTabCategory === 'All'
      ? CHEMICAL_INPUTS
      : CHEMICAL_INPUTS.filter((c) => c.category === activeTabCategory);

  return (
    <div id="compatibility" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3 border border-blue-200">
          <FlaskConical className="w-4 h-4 text-blue-700" />
          <span>Dynamic Environmental & Condition-Aware Matrix</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {t.compatTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Beyond fixed compatibility tables: Evaluates water pH, ambient temperature, crop growth stage, and application method (Drone ULV vs Knapsack) to prevent catastrophic field failures.
        </p>
      </div>

      {/* Preset Condition Scenarios Demonstrating the Constraint */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Interactive Condition-Override Test Bench:
            </span>
          </div>
          <button
            onClick={handleImportLocalWeather}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-400/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Auto-Fill Current Weather (Yavatmal 33.4°C)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Preset 1: Flowering Stage Override */}
          <button
            onClick={() =>
              applyConditionScenario(
                ['chem-nano-urea', 'chem-chlorpyrifos'],
                { cropGrowthStage: 'flowering', waterPh: 6.8, temperatureC: 28 },
                'Flowering Anthesis (Flower Drop & Bee Kill)'
              )
            }
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activePresetConditionName === 'Flowering Anthesis (Flower Drop & Bee Kill)'
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-amber-400" />
              <span>Flowering Stage Override</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1">
              Confidor + Urea: Safe on table, but causes <strong>Blossom Drop & Bee Kill</strong> during bloom.
            </div>
          </button>

          {/* Preset 2: Alkaline Hydrolysis Override */}
          <button
            onClick={() =>
              applyConditionScenario(
                ['chem-chlorpyrifos', 'chem-nano-urea'],
                { waterPh: 8.5, temperatureC: 28, cropGrowthStage: 'vegetative' },
                'Alkaline Tube-Well Water (pH 8.5 Hydrolysis)'
              )
            }
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activePresetConditionName === 'Alkaline Tube-Well Water (pH 8.5 Hydrolysis)'
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Alkaline Water (pH 8.5)</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1">
              Water pH 8.5 causes <strong>Alkaline Hydrolysis</strong>; insecticide loses 70% potency in tank.
            </div>
          </button>

          {/* Preset 3: High Temperature & Harsh Sun */}
          <button
            onClick={() =>
              applyConditionScenario(
                ['chem-chlorpyrifos', 'chem-nano-urea'],
                { temperatureC: 36, timeOfDay: 'noon_harsh_sun', waterPh: 6.8 },
                'Summer Heat (36°C Leaf Scorch)'
              )
            }
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activePresetConditionName === 'Summer Heat (36°C Leaf Scorch)'
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>High Heat (36°C Sun)</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1">
              At 36°C noon sun, salt crystallization causes <strong>acute necrotic foliar burn</strong>.
            </div>
          </button>

          {/* Preset 4: Drone ULV Concentration Shock */}
          <button
            onClick={() =>
              applyConditionScenario(
                ['chem-copper-oxy', 'chem-nano-urea'],
                { applicationMethod: 'drone_ulv', temperatureC: 28 },
                'Drone ULV (10 L/ac Atomizer Shock)'
              )
            }
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              activePresetConditionName === 'Drone ULV (10 L/ac Atomizer Shock)'
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-teal-400" />
              <span>Drone ULV (10 L / ac)</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1">
              20× ULV concentration clogs rotary atomizers & creates high ionic EC shock.
            </div>
          </button>
        </div>
      </div>

      {/* Environmental & Application Conditions Control Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-700" />
              <span>Field Conditions Under Evaluation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust parameters below to see real-time chemical stability changes.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Conditions</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Water pH Level */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Water pH Level</span>
              </label>
              <span
                className={`text-sm font-black font-mono px-2 py-0.5 rounded-md ${
                  conditions.waterPh > 7.5
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : conditions.waterPh < 6.0
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                pH {conditions.waterPh}
              </span>
            </div>

            <input
              type="range"
              min="5.0"
              max="9.5"
              step="0.1"
              value={conditions.waterPh}
              onChange={(e) =>
                setConditions({ ...conditions, waterPh: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span className="text-amber-700">Acidic (5.0)</span>
              <span className="text-emerald-700">Ideal (6.5)</span>
              <span className="text-rose-700">Alkaline (9.5)</span>
            </div>

            <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200">
              {conditions.waterPh > 7.5 ? (
                <span className="text-rose-600 font-bold">⚠️ High Alkaline Hydrolysis Risk!</span>
              ) : conditions.waterPh < 6.0 ? (
                <span className="text-amber-700 font-bold">⚠️ Acidic Metal Burn Risk</span>
              ) : (
                <span className="text-emerald-700 font-semibold">✓ Safe Neutral Buffer Zone</span>
              )}
            </div>
          </div>

          {/* 2. Ambient Temperature */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span>Temperature (°C)</span>
              </label>
              <span
                className={`text-sm font-black font-mono px-2 py-0.5 rounded-md ${
                  conditions.temperatureC >= 32
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {conditions.temperatureC}°C
              </span>
            </div>

            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={conditions.temperatureC}
              onChange={(e) =>
                setConditions({ ...conditions, temperatureC: parseInt(e.target.value) })
              }
              className="w-full accent-amber-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>Cool 15°C</span>
              <span className="text-emerald-700">Mild 25°C</span>
              <span className="text-rose-700">Hot 45°C</span>
            </div>

            <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200">
              {conditions.temperatureC >= 32 ? (
                <span className="text-rose-600 font-bold">⚠️ High Scorch & Stomata Closure!</span>
              ) : (
                <span className="text-emerald-700 font-semibold">✓ Favorable Absorption Window</span>
              )}
            </div>
          </div>

          {/* 3. Crop Growth Stage */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Crop Growth Stage</span>
            </label>

            <select
              value={conditions.cropGrowthStage}
              onChange={(e) =>
                setConditions({ ...conditions, cropGrowthStage: e.target.value as any })
              }
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="seedling">🌱 Tender Seedling (0-20 DAS)</option>
              <option value="vegetative">🌿 Active Vegetative & Tillering</option>
              <option value="flowering">🌸 Flowering & Anthesis (Bloom)</option>
              <option value="fruit_setting">🌾 Fruit Setting & Grain Filling</option>
              <option value="maturity_preharvest">📦 Pre-Harvest Maturation (PHI)</option>
            </select>

            <div className="text-[10px] text-slate-600 pt-1">
              {conditions.cropGrowthStage === 'flowering' ? (
                <span className="text-rose-600 font-bold">⚠️ High Blossom Abortion & Bee Risk</span>
              ) : conditions.cropGrowthStage === 'maturity_preharvest' ? (
                <span className="text-amber-700 font-bold">⚠️ Strict PHI Chemical Limits</span>
              ) : (
                <span className="text-emerald-700 font-semibold">Active canopy foliar uptake</span>
              )}
            </div>
          </div>

          {/* 4. Application Method */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-teal-600" />
              <span>Application Method</span>
            </label>

            <select
              value={conditions.applicationMethod}
              onChange={(e) =>
                setConditions({ ...conditions, applicationMethod: e.target.value as any })
              }
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high_volume_knapsack">🎒 Manual Knapsack (150-200 L/ac)</option>
              <option value="drone_ulv">🛸 Precision Drone ULV (8-10 L/ac)</option>
              <option value="tractor_boom">🚜 Tractor Boom Sprayer (120 L/ac)</option>
              <option value="drip_fertigation">💧 Drip Fertigation Injection</option>
            </select>

            <div className="text-[10px] text-slate-600 pt-1">
              {conditions.applicationMethod === 'drone_ulv' ? (
                <span className="text-teal-700 font-bold">20× High Chemical Concentration</span>
              ) : (
                <span className="text-slate-600">Standard hydraulic dilution</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Display Result Card */}
      {selectedChems.length >= 2 && (
        <div
          className={`rounded-3xl border-2 shadow-xl overflow-hidden transition-all ${
            report.status === 'danger'
              ? 'border-rose-400 bg-rose-50/40'
              : report.status === 'caution'
              ? 'border-amber-400 bg-amber-50/40'
              : 'border-emerald-400 bg-emerald-50/40'
          }`}
        >
          {/* Top Status Header */}
          <div
            className={`p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              report.status === 'danger'
                ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900'
                : report.status === 'caution'
                ? 'bg-gradient-to-r from-amber-800 via-amber-700 to-slate-900'
                : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    report.status === 'danger'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : report.status === 'caution'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  {report.status === 'danger' && <AlertOctagon className="w-3.5 h-3.5" />}
                  {report.status === 'caution' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {report.status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{report.status === 'danger' ? 'UNSUITABLE / HAZARDOUS' : report.status === 'caution' ? 'CONDITIONAL CAUTION' : 'SAFE & COMPATIBLE'}</span>
                </span>

                {/* Constraint Proof Indicator Badge */}
                {report.conditionOverrideApplied ? (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dynamic Condition Override Triggered!</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-semibold">
                    Baseline & Condition Synchronized
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight">{report.title}</h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
                {report.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAudioGuide}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer shadow-md"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Play Voice Advisory'}</span>
              </button>
            </div>
          </div>

          {/* Condition Override Comparison Card (Direct Proof of Constraint Satisfaction) */}
          {report.conditionOverrideApplied && (
            <div className="p-5 bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-700" />
                  <span>Why a Fixed Compatibility Table is NOT Enough:</span>
                </span>
                <p className="text-xs text-amber-950 leading-relaxed">
                  A static table lists these products as <strong className="text-emerald-800">"Generally Compatible"</strong>. However, due to your field conditions (<strong>Water pH {conditions.waterPh}</strong>, <strong>Temp {conditions.temperatureC}°C</strong>, or <strong>{conditions.cropGrowthStage.toUpperCase()} Stage</strong>), spraying them combined will cause severe chemical deactivation, flower abortion, or leaf burn.
                </p>
              </div>
            </div>
          )}

          {/* Dynamic Condition Warnings List */}
          {report.conditionalAlerts && report.conditionalAlerts.length > 0 && (
            <div className="p-6 bg-white border-b border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Condition-Specific Failure Mechanisms & Corrective Protocols:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.conditionalAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 text-xs space-y-2 ${
                      alert.severity === 'danger'
                        ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                        : 'bg-amber-50/70 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="font-black text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>{alert.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {alert.description}
                    </p>
                    <div className="pt-2 border-t border-slate-200/70 text-[11px] font-bold text-slate-900">
                      <strong>Remediation:</strong> {alert.correctiveAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Chemical Reaction & Jar Test Protocol */}
          <div className="p-6 sm:p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Chemical Reaction & Risk Factors */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <span>Chemical Mechanism Detail</span>
                </span>
                <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                  {report.chemicalReactionDetail || 'No direct antagonistic chemical bonding observed in neutral water.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Identified Risk Factors</span>
                </span>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                  {report.riskFactors.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Field Jar Test & Application Protocol */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wider block flex items-center gap-1.5">
                  <TestTube2 className="w-4 h-4 text-blue-700" />
                  <span>1-Litre Field Jar Test Protocol</span>
                </span>
                <p className="text-blue-900 leading-relaxed">
                  {report.jarTestProtocol}
                </p>
                <div className="text-[11px] text-blue-800 italic pt-1">
                  Test using your actual borewell water before mixing hundreds of litres in the main spray rig.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block flex items-center gap-1.5">
                  <Glasses className="w-4 h-4 text-emerald-700" />
                  <span>Statutory PPE & Field Guidelines</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.ppeRequirements.map((ppe, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800">
                      ✓ {ppe}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {report.applicationGuidance}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chemical Selection Palette */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Select Agricultural Products in Your Spray Tank (Max 4)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click products to add or remove them from the active tank mix.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTabCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTabCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Products in Tank Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Current Tank Mix ({selectedChems.length}/4):
            </span>
            {selectedChems.map((chem) => (
              <span
                key={chem.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border-2 border-emerald-500 text-slate-900 font-bold text-xs shadow-xs"
              >
                <span>{chem.tradeName}</span>
                <button
                  onClick={() => handleToggleChem(chem.id)}
                  className="text-slate-400 hover:text-rose-600 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={() => setSelectedChemIds([])}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Clear Tank
          </button>
        </div>

        {/* Chemical Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredInputs.map((chem) => {
            const isSelected = selectedChemIds.includes(chem.id);
            return (
              <div
                key={chem.id}
                onClick={() => handleToggleChem(chem.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {chem.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      chem.phType === 'Alkaline'
                        ? 'bg-rose-100 text-rose-800'
                        : chem.phType === 'Acidic'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    pH: {chem.phType}
                  </span>
                </div>

                <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {chem.tradeName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                  {chem.activeIngredient}
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
                  <span>Formulation: {chem.formulation}</span>
                  <span className="font-bold text-emerald-800">
                    {isSelected ? '✓ In Tank' : '+ Add'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
