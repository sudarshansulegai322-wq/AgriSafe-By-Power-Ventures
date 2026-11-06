import React, { useState, useId } from 'react';
import {
  CROP_PROFILES,
  calculateNutrientAndFertilizers,
  CropNutrientProfile,
  FertilizerCombination,
  PestRecommendation
} from '../data/dosageCalculatorData';
import { Language, Product } from '../types';
import { speechService } from '../services/speechService';
import {
  Calculator,
  Sprout,
  Beaker,
  ShieldAlert,
  Volume2,
  VolumeX,
  Share2,
  Printer,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Droplets,
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass
} from 'lucide-react';

interface FertilizerDosageCalculatorProps {
  language: Language;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onNavigateToCompatibility?: () => void;
  onNavigateToMarketplace?: () => void;
}

export const FertilizerDosageCalculator: React.FC<FertilizerDosageCalculatorProps> = ({
  language,
  onAddToCart,
  onNavigateToCompatibility,
  onNavigateToMarketplace
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>('cotton');
  const [landSize, setLandSize] = useState<number>(2);
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares' | 'guntha' | 'bigha'>('acres');
  const [soilCondition, setSoilCondition] = useState<'low' | 'medium' | 'high'>('medium');
  const [activeTab, setActiveTab] = useState<'fertilizers' | 'pesticides' | 'schedule'>('fertilizers');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('comb-nano-tech');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const landSizeInputId = useId();

  // Calculation output
  const calculation = calculateNutrientAndFertilizers(
    selectedCropId,
    Math.max(0.1, Number(landSize) || 1),
    landUnit,
    soilCondition
  );

  const currentCrop = calculation.crop;
  const currentPlan =
    calculation.combinations.find((c) => c.id === selectedPlanId) || calculation.combinations[0];

  // Multilingual labels for Calculator UI
  const labels = {
    en: {
      title: 'Precision Fertilizer & Pesticide Dosage Calculator',
      subtitle:
        'ICAR-grounded NPK nutrient balancing, Bag-to-Acre conversion, and Knapsack spray pump dilution for Indian farms.',
      landSizeLabel: 'Land Size',
      unitAcres: 'Acres',
      unitHectares: 'Hectares',
      unitGuntha: 'Guntha',
      unitBigha: 'Bigha',
      soilLabel: 'Soil Fertility Level',
      soilLow: 'Low Fertility (+20% Dose)',
      soilMed: 'Medium (Standard ICAR)',
      soilHigh: 'High Organic Carbon (-20% Dose)',
      cropSelectLabel: 'Select Crop',
      tabFertilizers: 'Fertilizer Requirements (NPK)',
      tabPesticides: 'Pesticide & Spray Pump Dosage',
      tabSchedule: 'Split Application Schedule',
      targetNpkTitle: 'Total Elemental Nutrient Requirement',
      selectPlanPrompt: 'Choose Fertilizer Plan Formulation',
      splitScheduleTitle: 'Scientific Application Stages',
      sprayGuideTitle: 'Spray Tank Mix & Knapsack Dilution (Per 15L Pump)',
      pumpRuleBanner: 'Indian Knapsack Pump Standard: 15 Litre Tank (10-12 Pumps per Acre)',
      readOutLoud: 'Listen to Dosage in Voice',
      stopVoice: 'Stop Voice',
      shareWhatsApp: 'Share on WhatsApp',
      copied: 'Copied to Clipboard!',
      printSlip: 'Print Dosage Slip',
      orderFertilizers: 'Order Subsidized Inputs',
      checkCompat: 'Check Tank-Mix Safety',
      marketRateNote: 'Statutory DBT subsidized prices applicable through certified dealers.'
    },
    hi: {
      title: 'खाद एवं कीटनाशक सटीक मात्रा कैलकुलेटर',
      subtitle:
        'भारतीय कृषि अनुसंधान परिषद (ICAR) आधारित NPK पोषक तत्व गणना, बोरी माप एवं 15 लीटर स्प्रे पंप घोल अनुपात।',
      landSizeLabel: 'खेत का रकबा (माप)',
      unitAcres: 'एकड़',
      unitHectares: 'हेक्टेयर',
      unitGuntha: 'गुंठा',
      unitBigha: 'बीघा',
      soilLabel: 'जमीन की उर्वरता (मिट्टी स्वास्थ्य)',
      soilLow: 'कमजोर मिट्टी (+20% खाद)',
      soilMed: 'मध्यम (मानक सरकारी)',
      soilHigh: 'उपजाऊ मिट्टी (-20% खाद)',
      cropSelectLabel: 'फसल चुनें',
      tabFertilizers: 'उर्वरक आवश्यकता (NPK खाद)',
      tabPesticides: 'कीटनाशक व 15L पंप घोल मात्रा',
      tabSchedule: 'चरणबद्ध खाद कार्यक्रम (स्प्लिट)',
      targetNpkTitle: 'कुल आवश्यक पोषक तत्व (शुद्ध N-P-K)',
      selectPlanPrompt: 'खाद संयोजन योजना चुनें',
      splitScheduleTitle: 'कब और कितना खाद डालें (चरणबद्ध तालिका)',
      sprayGuideTitle: 'स्प्रे टंकी घोल व प्रति 15 लीटर पंप मात्रा',
      pumpRuleBanner: 'भारतीय मानक स्प्रे टंकी: 15 लीटर पंप (प्रति एकड़ 10 से 12 टंकी घोल)',
      readOutLoud: 'मात्रा बोलकर सुनें',
      stopVoice: 'आवाज रोकें',
      shareWhatsApp: 'व्हाट्सएप पर भेजें',
      copied: 'कॉपी हो गया!',
      printSlip: 'पर्ची प्रिंट करें',
      orderFertilizers: 'सब्सिडी वाली खाद मंगवाएं',
      checkCompat: 'दवा मिलावट सुरक्षा जांचें',
      marketRateNote: 'मानक सरकारी नियंत्रित दरें (DBT सब्सिडी सम्मिलित)।'
    },
    mr: {
      title: 'खत आणि कीटकनाशक अचूक प्रमाण कॅल्क्युलेटर',
      subtitle: 'ICAR आधारित NPK अन्नद्रव्य गणना, गोणी प्रमाण व १५ लिटर स्प्रे पंप द्रावण प्रमाण.',
      landSizeLabel: 'शेतीचे क्षेत्रफळ',
      unitAcres: 'एकर',
      unitHectares: 'हेक्टर',
      unitGuntha: 'गुंठा',
      unitBigha: 'बीघा',
      soilLabel: 'जमिनीची सुपीकता',
      soilLow: 'कमी सुपीक (+२०% खत)',
      soilMed: 'मध्यम (प्रमाणित)',
      soilHigh: 'अधिक सुपीक (-२०% खत)',
      cropSelectLabel: 'पीक निवडा',
      tabFertilizers: 'खतांचे प्रमाण (NPK)',
      tabPesticides: 'कीटकनाशक व फवारणी पंप प्रमाण',
      tabSchedule: 'टप्प्याटप्प्याने खत व्यवस्थापन',
      targetNpkTitle: 'एकूण आवश्यक अन्नद्रव्ये (N-P-K)',
      selectPlanPrompt: 'खत नियोजन प्रकार निवडा',
      splitScheduleTitle: 'खत देण्याचे वेळापत्रक',
      sprayGuideTitle: '१५ लिटर पंपासाठी औषधाचे योग्य प्रमाण',
      pumpRuleBanner: 'प्रमाणित स्प्रे पंप: १५ लिटर (एका एकरासाठी १० ते १२ पंप द्रावण)',
      readOutLoud: 'आवाजात ऐका',
      stopVoice: 'आवाज थांबवा',
      shareWhatsApp: 'व्हॉट्सॲपवर पाठवा',
      copied: 'कॉपी झाले!',
      printSlip: 'पावती प्रिंट करा',
      orderFertilizers: 'खते बुक करा',
      checkCompat: 'मिश्रण सुसंगतता तपासा',
      marketRateNote: 'शासकीय अनुदानित दर (डीबीटी अंतर्गत).'
    }
  };

  const l = labels[language as 'hi' | 'mr'] || labels.en;

  // Voice Readout implementation
  const handleToggleVoice = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      const speechSummary =
        language === 'hi'
          ? `${currentCrop.nameHi} के ${calculation.acres.toFixed(1)} एकड़ के लिए: ${
              currentPlan.titleHi
            } अनुसार, कुल ${currentPlan.fertilizers
              .map((f) => `${f.name} ${f.unitFormat}`)
              .join(', ')} की आवश्यकता होगी। अनुमानित खर्च लगभग ₹${currentPlan.totalCost} है।`
          : language === 'mr'
          ? `${currentCrop.nameMr} च्या ${calculation.acres.toFixed(1)} एकरासाठी: ${
              currentPlan.fertilizers.map((f) => `${f.name} ${f.unitFormat}`).join(', ')
            } खतांची आवश्यकता आहे.`
          : `For ${currentCrop.name} across ${calculation.acres.toFixed(1)} acres: Recommended ${
              currentPlan.title
            } requires ${currentPlan.fertilizers
              .map((f) => `${f.name} ${f.unitFormat}`)
              .join(', ')}. Total subsidized cost is approximately ₹${currentPlan.totalCost}.`;

      setIsSpeaking(true);
      speechService.speak(speechSummary, language);
      setTimeout(() => setIsSpeaking(false), 8000);
    }
  };

  // WhatsApp formatted slip generator
  const handleShareWhatsApp = () => {
    const textLines = [
      `🌱 *AgriSafe Dosage Recommendation*`,
      `*Crop:* ${currentCrop.name} | *Area:* ${calculation.landSize} ${calculation.landUnit} (${calculation.acres.toFixed(1)} Acres)`,
      `*Target NPK:* N: ${calculation.targetNutrients.n}kg | P: ${calculation.targetNutrients.p}kg | K: ${calculation.targetNutrients.k}kg`,
      ``,
      `📦 *Recommended Fertilizers (${currentPlan.title}):*`,
      ...currentPlan.fertilizers.map((f) => `• ${f.name}: ${f.unitFormat} (~₹${f.estPrice})`),
      `*Estimated Cost:* ₹${currentPlan.totalCost} (Govt Subsidized)`,
      ``,
      `💧 *Pesticide Spray Guidelines (Per 15L Knapsack Pump):*`,
      ...calculation.scaledPests.map(
        (p) => `• *${p.name}:* ${p.recommendedProduct} -> ${p.dosePer15LPump} (${p.totalPumpsForFarm} pumps needed)`
      ),
      ``,
      `Verified via AgriSafe by Power Ventures | Toll-Free: 95384-84475`
    ];

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textLines.join('\n'))}`;
    window.open(shareUrl, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <section id="dosage-calculator" className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs">
            <Calculator className="w-3.5 h-3.5 text-emerald-700" />
            <span>ICAR & Agronomy Standard Algorithm</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {l.title}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{l.subtitle}</p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                isSpeaking
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isSpeaking ? l.stopVoice : l.readOutLoud}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? l.copied : l.shareWhatsApp}</span>
            </button>

            <button
              onClick={handlePrintSlip}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{l.printSlip}</span>
            </button>
          </div>
        </div>

        {/* Primary Interactive Input Control Island */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Step 1: Land Area & Measurement Unit */}
            <div className="md:col-span-5 space-y-3">
              <label htmlFor={landSizeInputId} className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>1. {l.landSizeLabel}</span>
                <span className="text-[11px] font-mono text-emerald-700 lowercase font-bold">
                  = {calculation.acres.toFixed(2)} Acres total
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  id={landSizeInputId}
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={landSize}
                  onChange={(e) => setLandSize(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-32 px-4 py-2.5 rounded-2xl border-2 border-emerald-500 bg-white font-mono text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-inner"
                />

                {/* Unit Segmented Control */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 flex-1">
                  {(['acres', 'hectares', 'guntha', 'bigha'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setLandUnit(unit)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer capitalize ${
                        landUnit === unit
                          ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {unit === 'acres'
                        ? l.unitAcres
                        : unit === 'hectares'
                        ? l.unitHectares
                        : unit === 'guntha'
                        ? l.unitGuntha
                        : l.unitBigha}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Area Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Presets:</span>
                {[1, 2, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setLandSize(num);
                      setLandUnit('acres');
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                      landSize === num && landUnit === 'acres'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {num} Ac
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Soil Fertility Condition */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                2. {l.soilLabel}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: l.soilLow, desc: 'Sandy / Degraded' },
                  { id: 'medium', label: l.soilMed, desc: 'Average Black / Loam' },
                  { id: 'high', label: l.soilHigh, desc: 'Rich Organic / Manured' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSoilCondition(s.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      soilCondition === s.id
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold leading-tight">{s.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Crop Selection Strip */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>3. {l.cropSelectLabel}</span>
              <span className="text-[11px] font-bold text-slate-500">
                {currentCrop.durationDays} · {currentCrop.season} Season
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {CROP_PROFILES.map((c) => {
                const isSelected = selectedCropId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCropId(c.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-102'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black leading-snug">
                        {language === 'hi' ? c.nameHi : language === 'mr' ? c.nameMr : c.name}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                      >
                        {c.category} · {c.season}
                      </div>
                    </div>
                    <div
                      className={`text-[10px] font-mono mt-2 pt-1 border-t ${
                        isSelected ? 'border-white/20 text-slate-300' : 'border-slate-100 text-slate-600'
                      }`}
                    >
                      NPK: {c.defaultNpkKgPerAcre.n}:{c.defaultNpkKgPerAcre.p}:{c.defaultNpkKgPerAcre.k} kg/ac
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result Navigation Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('fertilizers')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'fertilizers'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>{l.tabFertilizers}</span>
          </button>

          <button
            onClick={() => setActiveTab('pesticides')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pesticides'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Beaker className="w-3.5 h-3.5 text-emerald-700" />
            <span>{l.tabPesticides}</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{l.tabSchedule}</span>
          </button>
        </div>

        {/* Tab 1: Fertilizer Plans & NPK Bag Converter */}
        {activeTab === 'fertilizers' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pure Nutrient Summary Pill Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                  {l.targetNpkTitle}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {calculation.acres.toFixed(1)} Acres of {currentCrop.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Soil Fertility: <strong className="capitalize">{soilCondition}</strong> · Calculated according to state agricultural university package of practices.
                </p>
              </div>

              {/* The 3 elemental nutrient boxes */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] font-bold text-emerald-300 block">Nitrogen (N)</span>
                  <span className="text-2xl font-black text-white">{calculation.targetNutrients.n}</span>
                  <span className="text-[10px] text-slate-300 block">kg pure</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] font-bold text-amber-300 block">Phosphorus (P)</span>
                  <span className="text-2xl font-black text-white">{calculation.targetNutrients.p}</span>
                  <span className="text-[10px] text-slate-300 block">kg pure</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] font-bold text-cyan-300 block">Potash (K)</span>
                  <span className="text-2xl font-black text-white">{calculation.targetNutrients.k}</span>
                  <span className="text-[10px] text-slate-300 block">kg pure</span>
                </div>
              </div>
            </div>

            {/* Formulation Option Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  {l.selectPlanPrompt}
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {l.marketRateNote}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {calculation.combinations.map((comb) => {
                  const isSelected = selectedPlanId === comb.id;
                  return (
                    <div
                      key={comb.id}
                      onClick={() => setSelectedPlanId(comb.id)}
                      className={`rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-emerald-600 shadow-xl ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block mb-1">
                              {comb.badge}
                            </span>
                            <h5 className="text-base font-extrabold text-slate-900 leading-tight">
                              {language === 'hi' ? comb.titleHi : comb.title}
                            </h5>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {language === 'hi' ? comb.descriptionHi : comb.description}
                        </p>

                        {/* List of Specific Bag/Bottle Requirements */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {comb.fertilizers.map((f, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 block">{f.name}</span>
                                <span className="text-[10px] text-slate-500">{f.brand}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-black text-emerald-800 text-sm block">
                                  {f.unitFormat}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ~₹{f.estPrice}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financials & Action */}
                      <div className="pt-5 mt-5 border-t border-slate-100 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-slate-500">Total Farmer Cost:</span>
                          <span className="text-xl font-black font-mono text-slate-900">
                            ₹{comb.totalCost}
                          </span>
                        </div>

                        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center justify-between font-semibold">
                          <span>Govt Subsidy Savings:</span>
                          <span className="font-mono font-bold">+₹{comb.subsidySavings}</span>
                        </div>

                        {onNavigateToMarketplace && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToMarketplace();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                            <span>{l.orderFertilizers}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Micronutrient Advisory Box */}
            {currentCrop.micronutrientsRecommended && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-950">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold">Micronutrient Recommendation for {currentCrop.name}:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentCrop.micronutrientsRecommended.map((micro, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white/90 border border-amber-300 font-medium text-[11px]"
                      >
                        {micro}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-amber-800">
                    {language === 'hi' ? currentCrop.soilHealthTipsHi : currentCrop.soilHealthTips}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pesticide & Knapsack Tank Spray Calculator */}
        {activeTab === 'pesticides' && (
          <div className="space-y-6 animate-fadeIn">
            {/* The 15L Knapsack Pump Rule Banner */}
            <div className="p-4 rounded-3xl bg-emerald-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    {l.pumpRuleBanner}
                  </h4>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    For your <strong>{calculation.acres.toFixed(1)} acres</strong>, prepare approximately{' '}
                    <strong>{Math.round(calculation.acres * 10)} to {Math.round(calculation.acres * 12)} spray pumps</strong> (150-180L water total).
                  </p>
                </div>
              </div>

              {onNavigateToCompatibility && (
                <button
                  type="button"
                  onClick={onNavigateToCompatibility}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
                  <span>{l.checkCompat}</span>
                </button>
              )}
            </div>

            {/* List of Targeted Pests & Dilution Guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {calculation.scaledPests.map((pest) => (
                <div
                  key={pest.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                        Target {pest.pestType.toUpperCase()}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">
                        {pest.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        ({pest.localNameHi})
                      </p>
                    </div>

                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      High Alert
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-800">Symptoms:</strong> {pest.symptoms}
                  </p>

                  {/* Scientific Dilution Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                        Per 15L Knapsack Pump
                      </span>
                      <span className="text-base font-black font-mono text-emerald-950 block mt-0.5">
                        {pest.dosePer15LPump}
                      </span>
                      <span className="text-[10px] text-emerald-700">Dilute in 1 tank clean water</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">
                        Total for Your {calculation.acres.toFixed(1)} Acres
                      </span>
                      <span className="text-base font-black font-mono text-slate-900 block mt-0.5">
                        {pest.totalPumpsForFarm} Tanks
                      </span>
                      <span className="text-[10px] text-slate-500">~{pest.waterVolumeLiters}L total water</span>
                    </div>
                  </div>

                  {/* Chemical Recommendation Spec */}
                  <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Recommended Chemical:</span>
                      <span className="font-extrabold text-slate-900 text-right">{pest.recommendedProduct}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Active Molecule:</span>
                      <span className="font-mono text-[11px] text-slate-800 text-right">{pest.activeChemical}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Optimal Spray Time:</span>
                      <span className="text-emerald-800 font-bold text-right flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {pest.bestSprayTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Pre-Harvest Interval (PHI):</span>
                      <span className="font-black text-rose-700 text-right">{pest.phiDays} Days Waiting Period</span>
                    </div>
                  </div>

                  {/* Personal Safety Warning */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Safety Gear:
                    </span>
                    <span>{pest.ppeSafety.join(' · ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Split Application Stage Timeline */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                Agronomic Nutrient Timing
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {currentCrop.name} - {l.splitScheduleTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Applying all nitrogen at once causes fertilizer leaching and crop scorching. Follow these three split stages for maximum yield.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {currentCrop.splitSchedule.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {stage.timingDays}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {language === 'hi' ? stage.stageNameHi : stage.stageName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {language === 'hi' ? stage.notesHi : stage.notes}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-800 font-bold">N: {stage.nPct}%</span>
                    <span className="text-amber-800 font-bold">P: {stage.pPct}%</span>
                    <span className="text-cyan-800 font-bold">K: {stage.kPct}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Always spray or apply fertilizer in the morning or late afternoon when soil moisture is adequate.
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
