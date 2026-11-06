import React, { useState } from 'react';
import {
  Search,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  FileCheck2,
  Building2,
  Calendar,
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  Award,
  QrCode,
  FileText,
  CloudSun,
  Plane,
  WifiOff,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { VerificationRecord, Language } from '../types';
import { VERIFICATION_RECORDS } from '../data/mockData';
import { translations } from '../data/translations';
import { speechService } from '../services/speechService';

interface VerificationEngineProps {
  language: Language;
  onNavigateToSection?: (section: string) => void;
}

export const VerificationEngine: React.FC<VerificationEngineProps> = ({
  language,
  onNavigateToSection
}) => {
  const [searchInput, setSearchInput] = useState('BT-COT-2026-8841');
  const [currentRecord, setCurrentRecord] = useState<VerificationRecord | null>(
    VERIFICATION_RECORDS['BT-COT-2026-8841']
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = translations[language];

  // Handle Search
  const handleSearch = (batchToQuery?: string) => {
    const query = (batchToQuery !== undefined ? batchToQuery : searchInput).trim().toUpperCase();
    if (!query) return;

    setIsSearching(true);
    setSearchNotFound(false);

    setTimeout(() => {
      // Look up in verified database
      const record = VERIFICATION_RECORDS[query];
      if (record) {
        setCurrentRecord(record);
        setSearchNotFound(false);
      } else {
        // Generate a simulated dynamic record or counterfeit alert if not in official register
        setCurrentRecord({
          batchNumber: query,
          uidTag: `UID-UNVERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
          qrHash: 'NONE - RECORD NOT IN SEEDTRACE REGISTER',
          status: 'counterfeit',
          productName: `Unregistered Input (Batch: ${query})`,
          category: 'Pesticide',
          manufacturer: 'Unknown / Unlicensed Manufacturer',
          mfgLicense: 'INVALID / NOT FOUND IN STATE REGISTER',
          seedTraceRegisterId: 'NOT_FOUND_IN_CENTRAL_DB',
          activeIngredients: 'Unverified Chemical Formulation',
          mfgDate: 'Unknown',
          expiryDate: 'Unknown',
          testingLab: 'No Laboratory Certification on File',
          hologramVerified: false,
          stateQualityWingNotes: 'CRITICAL ALERT: This batch number does not exist in the official SeedTrace.gov.in or CIBRC national registers. High risk of counterfeit or illegal smuggled stock.',
          warnings: [
            'No valid statutory licensing found',
            'Do not apply to crops without verifying with your District Agriculture Officer',
            'Report suspected illegal sales to Kisan Call Centre 1800-180-1551'
          ],
          recommendedDose: 'DO NOT USE'
        });
      }
      setIsSearching(false);
    }, 450);
  };

  // Preset Clicks
  const handleSelectPreset = (key: string) => {
    setSearchInput(key);
    handleSearch(key);
  };

  // Photo Scan Simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setIsScanningPhoto(true);

      setTimeout(() => {
        setIsScanningPhoto(false);
        // Randomly pick a certified or alert batch for OCR demonstration
        const sampleBatches = ['BT-COT-2026-8841', 'NANO-UREA-IF772', 'CONF-BAY-4491', 'CF-FAKE-9920'];
        const randomBatch = sampleBatches[Math.floor(Math.random() * sampleBatches.length)];
        setSearchInput(randomBatch);
        handleSearch(randomBatch);
      }, 1500);
    }
  };

  // Audio Readout of Verification
  const handleReadout = () => {
    if (!currentRecord) return;

    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';

    if (language === 'hi') {
      speechText = currentRecord.status === 'genuine'
        ? `सत्यापन सफल! यह बैच ${currentRecord.productName} सरकारी पोर्टल seedtrace.gov.in पर प्रमाणित है। निर्माता: ${currentRecord.manufacturer}। सक्रिय तत्व: ${currentRecord.activeIngredients}। समाप्ति तिथि: ${currentRecord.expiryDate}। यह उत्पाद पूरी तरह असली और सुरक्षित है।`
        : `सावधान! चेतावनी! बैच संख्या ${currentRecord.batchNumber} एक संदिग्ध या नकली उत्पाद है। इसका सरकारी रजिस्टर में कोई रिकॉर्ड नहीं है। इसे अपनी फसल पर कतई न डालें। तुरंत कृषि हेल्पलाइन 1800-180-1551 पर शिकायत करें।`;
    } else if (language === 'mr') {
      speechText = currentRecord.status === 'genuine'
        ? `पडताळणी यशस्वी! हा बॅच ${currentRecord.productName} शासकीय सीडट्रेस पोर्टलवर १००% अस्सल नोंदणीकृत आहे. निर्माता: ${currentRecord.manufacturer}. सक्रिय घटक: ${currentRecord.activeIngredients}.`
        : `सावधान! धोक्याचा इशारा! हा बॅच ${currentRecord.batchNumber} बनावट किंवा अवैध आहे. याचा वापर पिकांवर करू नका.`;
    } else if (language === 'pa') {
      speechText = currentRecord.status === 'genuine'
        ? `ਤਸਦੀਕ ਕਾਮਯਾਬ! ਇਹ ਬੈਚ ${currentRecord.productName} ਸਰਕਾਰੀ ਸੀਡਟ੍ਰੇਸ ਪੋਰਟਲ ਤੇ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਹੈ। ਇਹ ਬਿਲਕੁਲ ਅਸਲੀ ਉਤਪਾਦ ਹੈ।`
        : `ਸਾਵਧਾਨ! ਖ਼ਤਰਾ! ਬੈਚ ਨੰਬਰ ${currentRecord.batchNumber} ਨਕਲੀ ਜਾਂ ਗੈਰ-ਕਾਨੂੰਨੀ ਉਤਪਾਦ ਹੈ। ਇਸ ਦਾ ਸਪ੍ਰੇ ਨਾ ਕਰੋ।`;
    } else if (language === 'ta') {
      speechText = currentRecord.status === 'genuine'
        ? `சரிபார்ப்பு வெற்றி! இந்த தொகுதி ${currentRecord.productName} அரசு போர்ட்டலில் சான்றளிக்கப்பட்டது. இது 100% அசல் பொருள்.`
        : `எச்சரிக்கை! இந்த தொகுதி ${currentRecord.batchNumber} போலி மருந்து என கண்டறியப்பட்டது. இதை பயிர்களில் பயன்படுத்த வேண்டாம்.`;
    } else if (language === 'te') {
      speechText = currentRecord.status === 'genuine'
        ? `ధృవీకరణ విజయవంతమైంది! ఈ బ్యాచ్ ${currentRecord.productName} సీడ్‌ట్రేస్ పోర్టల్‌లో 100% అసలైనదిగా ధృవీకరించబడింది. తయారీదారు: ${currentRecord.manufacturer}. ఇది వాడటానికి పూర్తిగా సురక్షితం.`
        : `హెచ్చరిక! బ్యాచ్ నంబర్ ${currentRecord.batchNumber} నకిలీ లేదా చట్టవిరుద్ధమైన ఉత్పత్తిగా గుర్తించబడింది. దీన్ని పంటలపై పిచికారీ చేయవద్దు. వెంటనే కిసాన్ కాల్ సెంటర్ 1800-180-1551 కు ఫిర్యాదు చేయండి.`;
    } else if (language === 'kn') {
      speechText = currentRecord.status === 'genuine'
        ? `ಪರಿಶೀಲನೆ ಯಶಸ್ವಿಯಾಗಿದೆ! ಈ ಬ್ಯಾಚ್ ${currentRecord.productName} ಸರ್ಕಾರಿ ಸೀಡ್‌ಟ್ರೇಸ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಧಿಕೃತವಾಗಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದೆ. ಇದು ಸಂಪೂರ್ಣ ಅಸಲಿ ಮತ್ತು ಸುರಕ್ಷಿತ ಉತ್ಪನ್ನ.`
        : `ಎಚ್ಚರಿಕೆ! ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ ${currentRecord.batchNumber} ನಕಲಿ ಔಷಧ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. ಇದನ್ನು ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಬಳಸಬೇಡಿ. ತಕ್ಷಣ ರೈತ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ.`;
    } else if (language === 'gu') {
      speechText = currentRecord.status === 'genuine'
        ? `ચકાસણી સફળ થઈ! આ બેચ ${currentRecord.productName} સરકારી સીડટ્રેસ પોર્ટલ પર પ્રમાણિત છે. ઉત્પાદક: ${currentRecord.manufacturer}. આ ઉત્પાદન વાપરવા માટે સંપૂર્ણ સુરક્ષિત છે.`
        : `સાવધાન! ચેતવણી! બેચ નંબર ${currentRecord.batchNumber} નકલી ઉત્પાદન છે. આ દવા પાક પર છાંટવી નહીં. કિસાન હેલ્પલાઇન 1800-180-1551 પર જાણ કરો.`;
    } else if (language === 'bn') {
      speechText = currentRecord.status === 'genuine'
        ? `যাচাইকরণ সফল হয়েছে! এই ব্যাচ ${currentRecord.productName} সরকারি সিডট্রেস পোর্টালে প্রত্যয়িত। প্রস্তুতকারক: ${currentRecord.manufacturer}। এটি সম্পূর্ণ আসল এবং নিরাপদ।`
        : `সতর্কতা! ব্যাচ নম্বর ${currentRecord.batchNumber} একটি নকল বা অনিবন্ধিত পণ্য। ফসলে এটি প্রয়োগ করবেন না। অবিলম্বে কিষাণ কল সেন্টারে যোগাযোগ করুন।`;
    } else if (language === 'ml') {
      speechText = currentRecord.status === 'genuine'
        ? `പരിശോധന വിജയിച്ചു! ഈ ബാച്ച് ${currentRecord.productName} സർക്കാർ സീഡ്‌ട്രേസ് പോർട്ടലിൽ 100% യഥാർത്ഥമാണെന്ന് സാക്ഷ്യപ്പെടുത്തിയിരിക്കുന്നു.`
        : `മുന്നറിയിപ്പ്! ബാച്ച് നമ്പർ ${currentRecord.batchNumber} വ്യാജ ഉൽപ്പന്നമാണെന്ന് കണ്ടെത്തിയിരിക്കുന്നു. ഇത് കൃഷിയിടത്തിൽ പ്രയോഗിക്കരുത്.`;
    } else {
      speechText = currentRecord.status === 'genuine'
        ? `Verification Confirmed. Batch ${currentRecord.batchNumber} for ${currentRecord.productName} is 100% Genuine and certified on seedtrace.gov.in. Manufacturer: ${currentRecord.manufacturer}. Active formulation: ${currentRecord.activeIngredients}. Tested lab status: Verified.`
        : `Critical Alert. Batch ${currentRecord.batchNumber} is detected as Counterfeit or Unregistered. High toxic risk. Do not use on crops. Report to Kisan Call Centre 1800-180-1551.`;
    }

    speechService.speak(speechText, language);
    setIsSpeaking(true);
  };

  return (
    <div id="verify" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Official seedtrace.gov.in Validation Node</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {t.verificationPortalTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          {t.verificationSubtitle}
        </p>
      </div>

      {/* Search & Upload Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Text Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 font-mono text-sm sm:text-base rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="flex-1 md:flex-initial px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cross-Referencing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.verifyButton}</span>
                </>
              )}
            </button>

            {/* Photo Scan Upload Trigger */}
            <label
              className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              title="Upload Label Photo for OCR Scan"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Scan Label</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* OCR Scanning Simulation Feedback */}
        {isScanningPhoto && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-200 overflow-hidden relative shrink-0">
              {photoPreview && (
                <img src={photoPreview} alt="Uploaded label" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                <span>Optical Character Recognition (OCR) Active</span>
                <span className="font-mono text-emerald-700">Reading CIBRC / SeedTrace Tag...</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Instant Test Presets */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">{t.instantTestPresets}</span>
          <button
            onClick={() => handleSelectPreset('CORA-FMC-2026-9102')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            🟢 FMC Coragen (Insecticide)
          </button>
          <button
            onClick={() => handleSelectPreset('NANO-DAP-IF901')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            🟢 IFFCO Nano DAP
          </button>
          <button
            onClick={() => handleSelectPreset('AMIS-SYN-9021')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            🟢 Syngenta Amistar Top
          </button>
          <button
            onClick={() => handleSelectPreset('NPK-MAH-2026-3021')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            🟢 Mahadhan 19:19:19 NPK
          </button>
          <button
            onClick={() => handleSelectPreset('SAGA-IF-2026-1029')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            🟢 IFFCO Sagarika Seaweed
          </button>
          <button
            onClick={() => handleSelectPreset('BT-COT-2026-8841')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            🟢 Mahyco Bt Cotton
          </button>
          <button
            onClick={() => handleSelectPreset('CF-FAKE-9920')}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold rounded-md border border-rose-200 cursor-pointer transition-colors"
          >
            🔴 Counterfeit Seized Lot
          </button>
          <button
            onClick={() => handleSelectPreset('EXP-SEED-2021')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-md border border-amber-200 cursor-pointer transition-colors"
          >
            ⚠️ Expired Lot (Seeds Act)
          </button>
        </div>
      </div>

      {/* Illiterate Farmer Audio-First & Direct Calling Strip */}
      <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md inline-block mb-1">
              अनपढ़ किसान सरल सहायता • Voice First Assistance
            </span>
            <p className="text-sm font-bold text-slate-900 leading-tight">
              अगर आप पढ़ नहीं सकते, तो सीधे बोलकर पूछें या तुरंत टोल-फ्री कॉल करें:
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              सभी जानकारी आपकी मातृभाषा में आवाज़ में सुनाई जाएगी।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="tel:9538484475"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>पावर वेंचर्स हेल्पलाइन: 95384-84475</span>
          </a>
          <a
            href="tel:18001801551"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-emerald-300" />
            <span>किसान कॉल सेंटर: 1800-180-1551</span>
          </a>
        </div>
      </div>

      {/* Verification Result Card */}
      {currentRecord && (
        <div
          className={`rounded-2xl border-2 overflow-hidden shadow-lg transition-all ${
            currentRecord.status === 'genuine'
              ? 'bg-white border-emerald-500 shadow-emerald-500/10'
              : currentRecord.status === 'counterfeit'
              ? 'bg-rose-50/40 border-rose-600 shadow-rose-600/15'
              : 'bg-amber-50/40 border-amber-500 shadow-amber-500/10'
          }`}
        >
          {/* Top Status Banner */}
          <div
            className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-white ${
              currentRecord.status === 'genuine'
                ? 'bg-emerald-700'
                : currentRecord.status === 'counterfeit'
                ? 'bg-rose-700'
                : 'bg-amber-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {currentRecord.status === 'genuine' ? (
                <CheckCircle className="w-6 h-6 text-emerald-200 shrink-0" />
              ) : currentRecord.status === 'counterfeit' ? (
                <ShieldAlert className="w-6 h-6 text-rose-200 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-200 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold tracking-wider uppercase opacity-90 block">
                  seedtrace.gov.in Official Register Status
                </span>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {currentRecord.status === 'genuine'
                    ? t.genuineBadge
                    : currentRecord.status === 'counterfeit'
                    ? t.counterfeitBadge
                    : t.expiredBadge}
                </span>
              </div>
            </div>

            {/* Spoken Voice Guide CTA */}
            <button
              onClick={handleReadout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-bold text-xs flex items-center gap-2 border border-white/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? t.stopAudioButton : t.audioGuideButton}</span>
            </button>
          </div>

          {/* Giant Illiterate Farmer Pictorial Verdict */}
          <div
            className={`p-5 sm:p-6 border-b ${
              currentRecord.status === 'genuine'
                ? 'bg-emerald-500/10 border-emerald-200'
                : currentRecord.status === 'counterfeit'
                ? 'bg-rose-500/15 border-rose-300'
                : 'bg-amber-500/15 border-amber-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shrink-0 ${
                    currentRecord.status === 'genuine'
                      ? 'bg-emerald-600 text-white'
                      : currentRecord.status === 'counterfeit'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {currentRecord.status === 'genuine' ? '✓' : currentRecord.status === 'counterfeit' ? '✕' : '⏳'}
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                    {currentRecord.status === 'genuine' && (
                      <span className="text-emerald-700">ASLI / असली उत्पाद (100% Genuine)</span>
                    )}
                    {currentRecord.status === 'counterfeit' && (
                      <span className="text-rose-700">NAKLI / नकली माल • सावधान! (Fake)</span>
                    )}
                    {currentRecord.status === 'expired' && (
                      <span className="text-amber-800">EXPIRY / मियाद खत्म • मत बोएं (Expired)</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                    {currentRecord.status === 'genuine' &&
                      'सरकारी जांच में पास • 100% शुद्ध और असली बीज/दवा। बेझिझक खरीदें।'}
                    {currentRecord.status === 'counterfeit' &&
                      'जब्तशुदा नकली माल • दुकानदार को एक रुपया न दें। तुरंत टोल-फ्री 1800-180-1551 पर शिकायत करें।'}
                    {currentRecord.status === 'expired' &&
                      'बीज की अंकुरण क्षमता खत्म हो चुकी है। यह खेत में नहीं उगेगा। बीज अधिनियम 1966 के तहत प्रतिबंधित।'}
                  </p>
                </div>
              </div>

              {/* Huge Loudspeaker Audio Button for Illiterate Farmers */}
              <button
                onClick={handleReadout}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Volume2 className="w-5 h-5 text-slate-950 animate-pulse" />
                <span>{isSpeaking ? 'आवाज़ बंद करें' : '🔊 आवाज़ में पूरा फैसला सुनें'}</span>
              </button>
            </div>
          </div>

          {/* Main Inspection Grid */}
          <div className="p-6 space-y-6">
            {/* Header Lockup: Product Name & Manufacturer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Batch: <strong className="font-mono text-slate-800">{currentRecord.batchNumber}</strong></span>
                  <span>·</span>
                  <span>Category: <strong className="text-slate-800">{currentRecord.category}</strong></span>
                  <span>·</span>
                  <span>UID: <strong className="font-mono text-slate-800">{currentRecord.uidTag}</strong></span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentRecord.productName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{currentRecord.manufacturer}</span>
                </div>
              </div>

              {/* Cryptographic Government Seal Tag */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Digital Traceability Seal</span>
                  <span className="font-mono text-[11px] text-emerald-700 block truncate max-w-[180px]">
                    {currentRecord.seedTraceRegisterId}
                  </span>
                  <span className="text-[10px] text-slate-500">Ministry of Agriculture & Farmers Welfare</span>
                </div>
              </div>
            </div>

            {/* Technical Laboratory Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {t.fssaiCibrcReg}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900 block">
                  {currentRecord.cibrcNumber || currentRecord.mfgLicense}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Central Statutory Registry ID
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {t.mfgExpiry}
                </span>
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mfg: {currentRecord.mfgDate}</span>
                </div>
                <span className={`text-[11px] font-bold mt-1 block ${
                  currentRecord.status === 'expired' ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  Exp: {currentRecord.expiryDate}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Lab Test Certification
                </span>
                <span className="text-xs font-semibold text-slate-900 block line-clamp-2">
                  {currentRecord.testingLab}
                </span>
                {currentRecord.germinationRate && (
                  <span className="text-[11px] font-bold text-emerald-700 mt-1 block">
                    Germination: {currentRecord.germinationRate}
                  </span>
                )}
                {currentRecord.purityRate && (
                  <span className="text-[11px] text-slate-600 block">
                    Purity: {currentRecord.purityRate}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Security Hologram
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {currentRecord.hologramVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">Govt Hologram Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-rose-700">Forged / Missing Seal</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-[10px] text-slate-500 block mt-1 truncate">
                  Hash: {currentRecord.qrHash}
                </span>
              </div>
            </div>

            {/* Active Ingredients & Quality Notes */}
            <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">{t.activeChemicals}: </strong>
                  <span className="text-slate-700 font-mono text-xs">{currentRecord.activeIngredients}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-200/80">
                <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">{t.qualityNotes}: </strong>
                  <span className="text-slate-700 text-xs leading-relaxed">{currentRecord.stateQualityWingNotes}</span>
                </div>
              </div>
            </div>

            {/* Warnings or Instructions */}
            {currentRecord.warnings && currentRecord.warnings.length > 0 && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  currentRecord.status === 'genuine'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Statutory Handling Directives & Warnings</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {currentRecord.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color-Coded Pest Infestation Alert Banner (Directly on verified batch profile) */}
            {currentRecord.status === 'genuine' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>ICAR Regional Pest Alert</span>
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {currentRecord.category === 'Seed'
                        ? 'High Humidity Favoring Early Infestation Risk'
                        : 'Atmospheric Drift & Temperature Advisory'}
                    </span>
                  </div>
                  {onNavigateToSection && (
                    <button
                      onClick={() => onNavigateToSection('weather')}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>View Live Doppler Radar & Outbreak Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-slate-700 leading-relaxed">
                  Regional agrometeorological sensors indicate current relative humidity &gt;75% across key cotton and paddy tracts. If planting or spraying this batch, adhere to CIBRC economic threshold levels (ETL) and inspect morning floral squares.
                </p>

                {/* Direct Action Chips */}
                <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {onNavigateToSection && (
                      <button
                        onClick={() => onNavigateToSection('drone')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Plane className="w-3.5 h-3.5 text-amber-300" />
                        <span>Book Drone Spraying (50% Subsidy)</span>
                      </button>
                    )}
                    {onNavigateToSection && (
                      <button
                        onClick={() => onNavigateToSection('traceability')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Track Harvest Output</span>
                      </button>
                    )}
                  </div>

                  {/* Offline SMS hint */}
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                    <span>No internet? SMS <strong>VERIFY {currentRecord.batchNumber}</strong> to <strong>56161</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
