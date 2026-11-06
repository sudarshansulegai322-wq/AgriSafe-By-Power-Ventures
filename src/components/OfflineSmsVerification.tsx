import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Signal,
  WifiOff,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Send,
  RefreshCw,
  PhoneCall,
  Delete,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { SMS_USSD_DICTIONARY } from '../data/moduleData';
import { VERIFICATION_RECORDS } from '../data/mockData';

interface OfflineSmsVerificationProps {
  language: Language;
}

export const OfflineSmsVerification: React.FC<OfflineSmsVerificationProps> = ({
  language
}) => {
  const [activeMode, setActiveMode] = useState<'sms' | 'ussd'>('sms');
  const [inputBatch, setInputBatch] = useState<string>('BT-COT-2026-8841');
  const [ussdStep, setUssdStep] = useState<number>(1);
  const [ussdInput, setUssdInput] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [mobileLinkNotice, setMobileLinkNotice] = useState<string | null>(null);

  const dict = SMS_USSD_DICTIONARY[language] || SMS_USSD_DICTIONARY['en'];

  // Handle preset selection
  const handleSelectPreset = (batch: string) => {
    setInputBatch(batch);
    setSimulatedResponse(null);
    if (activeMode === 'ussd') {
      setUssdInput(batch);
      setUssdStep(2);
    }
  };

  // Generate simulated SMS response dynamically based on VERIFICATION_RECORDS
  const handleSimulateSms = () => {
    setIsSimulating(true);
    setSimulatedResponse(null);

    setTimeout(() => {
      const clean = inputBatch.trim().toUpperCase();
      const record = VERIFICATION_RECORDS[clean];

      if (!record) {
        setSimulatedResponse(
          `[AGRISAFE ALERT] 🚨 UNREGISTERED BATCH! Batch ${clean} NOT found in SeedTrace/CIBRC national register. High risk of spurious input. DO NOT PAY DEALER. Call DAC&FW Vigilance: 1800-180-1551 or AgriSafe: 95384-84475.`
        );
      } else if (record.status === 'genuine') {
        setSimulatedResponse(
          `[AGRISAFE SEEDTRACE] ✅ GENUINE BATCH. Prod: ${record.productName} (Lot: ${record.batchNumber}). Mfg: ${record.manufacturer}. Lic: ${record.mfgLicense}. Exp: ${record.expiryDate}. Lab Purity: ${record.purityRate || '98.8%'}. Genuine Hologram Valid. DAC&FW Approved.`
        );
      } else if (record.status === 'counterfeit' || record.status === 'blacklisted') {
        setSimulatedResponse(
          `[AGRISAFE ALERT] 🚨 COUNTERFEIT LOT! Batch ${record.batchNumber} flagged as BLACKLISTED/COUNTERFEIT by State Quality Control Wing. Refuse delivery. Inform Vigilance at 1800-180-1551 or AgriSafe at 95384-84475.`
        );
      } else {
        setSimulatedResponse(
          `[AGRISAFE WARNING] ⚠️ EXPIRED INPUT. Batch ${record.batchNumber} expired on ${record.expiryDate}. Seed germination/potency failed. Selling expired stock violates Seeds Act 1966 Section 6.`
        );
      }
      setIsSimulating(false);
    }, 450);
  };

  // USSD Interactive Menu Flow
  const handleUssdSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = ussdInput.trim();

    if (ussdStep === 1) {
      if (trimmed === '1') {
        setUssdStep(2);
        setUssdInput('');
      } else if (trimmed === '2') {
        setUssdStep(3);
        setUssdInput('');
      } else if (trimmed === '3') {
        setUssdStep(4);
        setUssdInput('');
      } else if (trimmed === '4') {
        setUssdStep(6);
        setUssdInput('');
      } else {
        // Default to step 2 if they typed a batch directly
        if (trimmed.length > 2) {
          setInputBatch(trimmed.toUpperCase());
          setUssdStep(5);
        } else {
          setUssdStep(1);
        }
      }
    } else if (ussdStep === 2) {
      const targetBatch = trimmed.toUpperCase() || inputBatch;
      setInputBatch(targetBatch);
      setUssdStep(5);
      setUssdInput('');
    } else if (ussdStep === 3 || ussdStep === 4 || ussdStep === 5 || ussdStep === 6) {
      if (trimmed === '0') {
        setUssdStep(1);
        setUssdInput('');
      } else if (trimmed === '9' && ussdStep === 5) {
        setUssdStep(2);
        setUssdInput('');
      } else {
        setUssdStep(1);
        setUssdInput('');
      }
    }
  };

  // Keypad click handler for physical phone simulator
  const handleKeypadPress = (key: string) => {
    if (activeMode === 'ussd') {
      if (ussdStep === 1) {
        if (key === '1') {
          setUssdStep(2);
          setUssdInput('');
        } else if (key === '2') {
          setUssdStep(3);
          setUssdInput('');
        } else if (key === '3') {
          setUssdStep(4);
          setUssdInput('');
        } else if (key === '4') {
          setUssdStep(6);
          setUssdInput('');
        }
      } else if (ussdStep === 2) {
        setUssdInput((prev) => prev + key);
      } else if (ussdStep === 3 || ussdStep === 4 || ussdStep === 5 || ussdStep === 6) {
        if (key === '0') {
          setUssdStep(1);
          setUssdInput('');
        } else if (key === '9' && ussdStep === 5) {
          setUssdStep(2);
          setUssdInput('');
        }
      }
    } else {
      // SMS mode: append to inputBatch
      setInputBatch((prev) => prev + key);
      setSimulatedResponse(null);
    }
  };

  const handleBackspace = () => {
    if (activeMode === 'ussd') {
      setUssdInput((prev) => prev.slice(0, -1));
    } else {
      setInputBatch((prev) => prev.slice(0, -1));
      setSimulatedResponse(null);
    }
  };

  const resetUssd = () => {
    setUssdStep(1);
    setUssdInput('');
  };

  const handleCopySmsTemplate = () => {
    navigator.clipboard.writeText(`VERIFY ${inputBatch}`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleMobileLinkClick = (type: 'sms' | 'ussd') => {
    if (type === 'sms') {
      navigator.clipboard.writeText(`VERIFY ${inputBatch}`);
      setMobileLinkNotice(
        `Copied "VERIFY ${inputBatch}" to clipboard! On Android/iPhone, this opens SMS shortcode 56161. Use phone simulator below for live web test.`
      );
    } else {
      navigator.clipboard.writeText(`*99*51#`);
      setMobileLinkNotice(
        `Copied "*99*51#" to clipboard! On a physical phone, dial this to open the GSM USSD session. Use phone simulator below for live web test.`
      );
    }
    setTimeout(() => setMobileLinkNotice(null), 5000);
  };

  // Get active record for USSD step 5
  const activeRecord = VERIFICATION_RECORDS[inputBatch.trim().toUpperCase()];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/60">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3 shadow-xs">
              <WifiOff className="w-4 h-4" />
              <span>Zero-Data 2G GSM / CDMA Offline Fallback Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Offline SMS & USSD Verification Gateway
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-2 leading-relaxed">
              Designed for remote rural farming areas with poor cellular data or zero internet connectivity. Send simple text messages to central shortcode <strong className="text-amber-300">56161</strong> or dial <strong className="text-amber-300">*99*51#</strong> from any ₹800 keypad feature phone for instant statutory batch verification.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-emerald-200/90 font-medium">
              <span>National Farmer Helpline: <strong>1800-180-1551</strong></span>
              <span>•</span>
              <span>AgriSafe Support: <strong className="text-amber-300">95384-84475</strong></span>
            </div>
          </div>

          {/* Direct Action Links with Desktop-Aware Feedback */}
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href={`sms:56161?body=VERIFY%20${inputBatch}`}
              onClick={() => handleMobileLinkClick('sms')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Native SMS (56161)</span>
            </a>
            <a
              href="tel:*99*51%23"
              onClick={() => handleMobileLinkClick('ussd')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Dial USSD (*99*51#)</span>
            </a>
          </div>
        </div>

        {/* Desktop notification banner if link is clicked */}
        {mobileLinkNotice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{mobileLinkNotice}</span>
            </div>
            <button
              onClick={() => setMobileLinkNotice(null)}
              className="text-amber-300 hover:text-white text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Keypad Phone Simulator + Protocol Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Realistic Feature Phone Keypad Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border-4 border-slate-700 relative">
            {/* Speaker Grille */}
            <div className="w-16 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

            {/* Top Channel Toggle */}
            <div className="flex rounded-xl bg-slate-800 p-1 mb-4">
              <button
                onClick={() => {
                  setActiveMode('sms');
                  setSimulatedResponse(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'sms'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SMS Gateway (56161)
              </button>
              <button
                onClick={() => {
                  setActiveMode('ussd');
                  resetUssd();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'ussd'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USSD Menu (*99*51#)
              </button>
            </div>

            {/* Nokia Retro LCD Screen */}
            <div className="bg-[#8fae85] text-[#1a3016] p-4 rounded-2xl border-4 border-[#76936d] shadow-inner font-mono text-xs min-h-[240px] flex flex-col justify-between select-none">
              {/* LCD Status Header */}
              <div className="flex justify-between items-center text-[10px] pb-1 border-b border-[#76936d]/40 font-bold">
                <span className="flex items-center gap-1">
                  <Signal className="w-3 h-3 text-[#1a3016]" />
                  <span>BSNL / JIO 2G (Full)</span>
                </span>
                <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* LCD Body: SMS Mode */}
              {activeMode === 'sms' && (
                <div className="py-2 flex-1 flex flex-col justify-between">
                  {!simulatedResponse ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-[#1a3016]">
                        TO: 56161 (Kisan Gateway)
                      </div>
                      <div className="bg-[#9bbd90] p-2.5 rounded border border-[#76936d]/60 shadow-xs">
                        <div className="text-[9px] text-[#2f4e2a] font-sans">Draft Message:</div>
                        <div className="text-[11px] font-black break-all">VERIFY {inputBatch}</div>
                      </div>
                      <div className="text-[9px] text-[#2f4e2a] leading-tight">
                        {isSimulating ? (
                          <span className="flex items-center gap-1 font-bold animate-pulse text-[#1a3016]">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Transmitting 2G text to SeedTrace node...
                          </span>
                        ) : (
                          'Press [Send SMS] below to receive instant government registry reply.'
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <div className="text-[9px] font-bold text-[#142811] flex items-center justify-between border-b border-[#76936d]/40 pb-0.5">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-800" />
                          <span>FROM: AGRISAFE-GOV</span>
                        </span>
                        <span className="bg-[#76936d]/30 px-1 rounded text-[8px]">1 NEW SMS</span>
                      </div>
                      <div className="bg-[#9bbd90] p-2 rounded border border-[#76936d]/60 text-[10px] leading-tight break-words font-semibold max-h-[140px] overflow-y-auto">
                        {simulatedResponse}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[9px] font-bold text-[#2a4625] pt-1 border-t border-[#76936d]/30">
                    <button
                      onClick={() => setSimulatedResponse(null)}
                      className="hover:underline cursor-pointer"
                    >
                      [New SMS]
                    </button>
                    <span>[Options]</span>
                  </div>
                </div>
              )}

              {/* LCD Body: USSD Interactive Menu Flow */}
              {activeMode === 'ussd' && (
                <div className="py-2 flex-1 flex flex-col justify-between">
                  {/* Step 1: Main Menu */}
                  {ussdStep === 1 && (
                    <div className="space-y-1.5">
                      <div className="font-extrabold text-[11px] border-b border-[#76936d]/50 pb-0.5">
                        AgriSafe Kisan Flash Portal:
                      </div>
                      <div className="text-[10px] leading-snug space-y-0.5">
                        <div
                          onClick={() => {
                            setUssdStep(2);
                            setUssdInput('');
                          }}
                          className="hover:bg-[#9bbd90] p-0.5 rounded cursor-pointer font-bold"
                        >
                          1. Verify Batch ID
                        </div>
                        <div
                          onClick={() => {
                            setUssdStep(3);
                            setUssdInput('');
                          }}
                          className="hover:bg-[#9bbd90] p-0.5 rounded cursor-pointer font-bold"
                        >
                          2. Tank-Mix Safety
                        </div>
                        <div
                          onClick={() => {
                            setUssdStep(4);
                            setUssdInput('');
                          }}
                          className="hover:bg-[#9bbd90] p-0.5 rounded cursor-pointer font-bold"
                        >
                          3. Report Fake Dealer
                        </div>
                        <div
                          onClick={() => {
                            setUssdStep(6);
                            setUssdInput('');
                          }}
                          className="hover:bg-[#9bbd90] p-0.5 rounded cursor-pointer font-bold"
                        >
                          4. Today Weather/Pest
                        </div>
                      </div>
                      <div className="text-[9px] text-[#2f4e2a] italic">
                        Tap item or press keypad number (1-4)
                      </div>
                    </div>
                  )}

                  {/* Step 2: Batch Input */}
                  {ussdStep === 2 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-[10px]">Enter Agricultural Batch No:</div>
                      <div className="bg-[#9bbd90] p-1.5 rounded border border-[#76936d]/60 text-[11px] font-black tracking-wide">
                        {ussdInput || inputBatch}
                      </div>
                      <div className="text-[9px] text-[#2f4e2a] leading-tight">
                        Type batch or pick preset below, then press [Send]
                      </div>
                    </div>
                  )}

                  {/* Step 3: Tank-Mix Safety */}
                  {ussdStep === 3 && (
                    <div className="space-y-1">
                      <div className="font-bold text-[10px] text-[#142811] border-b border-[#76936d]/40 pb-0.5">
                        TANK-MIX COMPATIBILITY:
                      </div>
                      <div className="text-[9px] leading-tight space-y-1 bg-[#9bbd90] p-1.5 rounded">
                        <p>• NEVER mix Zinc Sulphate / Cu-fungicides with Chlorpyrifos.</p>
                        <p>• Always test water pH (optimal 6.0-7.0).</p>
                        <p>• Conduct 1-litre jar test before tractor/drone tank fill.</p>
                      </div>
                      <div className="text-[9px] font-bold text-[#142811]">
                        Press 0 to return to Main Menu.
                      </div>
                    </div>
                  )}

                  {/* Step 4: Report Fake Dealer */}
                  {ussdStep === 4 && (
                    <div className="space-y-1">
                      <div className="font-bold text-[10px] text-[#142811] border-b border-[#76936d]/40 pb-0.5">
                        REPORT SPURIOUS LOT:
                      </div>
                      <div className="text-[9px] leading-tight space-y-1 bg-[#9bbd90] p-1.5 rounded">
                        <p>• DAC&FW Vigilance: 1800-180-1551</p>
                        <p>• AgriSafe Helpline: 95384-84475</p>
                        <p>• Refuse payment; report invoice to DAO / KVK office.</p>
                      </div>
                      <div className="text-[9px] font-bold text-[#142811]">
                        Press 0 to return to Main Menu.
                      </div>
                    </div>
                  )}

                  {/* Step 5: Dynamic Verification Result */}
                  {ussdStep === 5 && (
                    <div className="space-y-1">
                      <div className="font-bold text-[10px] border-b border-[#76936d]/40 pb-0.5 flex items-center justify-between">
                        <span>LOT VERIFICATION:</span>
                        <span className="font-black text-[9px] uppercase">
                          {activeRecord?.status || 'UNREGISTERED'}
                        </span>
                      </div>
                      {activeRecord?.status === 'genuine' ? (
                        <div className="text-[9px] leading-tight font-semibold bg-[#9bbd90] p-1.5 rounded space-y-0.5">
                          <p className="font-bold text-[#0d210b]">✅ {activeRecord.productName}</p>
                          <p>Lot: {activeRecord.batchNumber} | Exp: {activeRecord.expiryDate}</p>
                          <p>Lic: {activeRecord.mfgLicense}</p>
                          <p>Lab Purity: {activeRecord.purityRate || '98.8%'}</p>
                          <p className="text-[8px] text-[#1a3816]">Hologram Valid • DAC&FW Approved</p>
                        </div>
                      ) : activeRecord?.status === 'counterfeit' ? (
                        <div className="text-[9px] leading-tight font-bold bg-[#b56e6e] text-white p-1.5 rounded space-y-0.5">
                          <p>🚨 CRITICAL: COUNTERFEIT LOT!</p>
                          <p>Lot {activeRecord.batchNumber} flagged as spurious.</p>
                          <p>Order #QC-MH-2026-042 Seized.</p>
                          <p>DO NOT USE. Report to 1800-180-1551.</p>
                        </div>
                      ) : activeRecord?.status === 'expired' ? (
                        <div className="text-[9px] leading-tight font-bold bg-[#c49a56] text-[#291e0a] p-1.5 rounded space-y-0.5">
                          <p>⚠️ EXPIRED SEED/INPUT!</p>
                          <p>Batch {activeRecord.batchNumber} expired on {activeRecord.expiryDate}.</p>
                          <p>Germination vigor degraded (54%).</p>
                          <p>Sale violates Seeds Act 1966 Section 6.</p>
                        </div>
                      ) : (
                        <div className="text-[9px] leading-tight font-bold bg-[#c49a56] text-[#291e0a] p-1.5 rounded space-y-0.5">
                          <p>🚨 UNREGISTERED BATCH!</p>
                          <p>Batch {inputBatch} not in SeedTrace/CIBRC.</p>
                          <p>High risk of spurious formulation.</p>
                          <p>Call Helpline: 95384-84475.</p>
                        </div>
                      )}
                      <div className="text-[9px] text-[#142811] flex justify-between font-bold pt-0.5">
                        <span>0: Main Menu</span>
                        <span>9: New Batch</span>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Today Weather & Pest Advisory */}
                  {ussdStep === 6 && (
                    <div className="space-y-1">
                      <div className="font-bold text-[10px] text-[#142811] border-b border-[#76936d]/40 pb-0.5">
                        WEATHER & PEST ADVISORY:
                      </div>
                      <div className="text-[9px] leading-tight space-y-1 bg-[#9bbd90] p-1.5 rounded">
                        <p>• Temp 31.4°C, Humidity 82% (High)</p>
                        <p>• Yellow Rust & Sucking Pest Alert in standing crops.</p>
                        <p>• Safe spray window: 06:00 to 09:30 AM.</p>
                      </div>
                      <div className="text-[9px] font-bold text-[#142811]">
                        Press 0 to return to Main Menu.
                      </div>
                    </div>
                  )}

                  {/* Bottom Softkeys */}
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#2a4625] pt-1 border-t border-[#76936d]/30">
                    <button
                      onClick={() => handleUssdSubmit()}
                      className="hover:underline cursor-pointer"
                    >
                      [Select / Send]
                    </button>
                    <button
                      onClick={resetUssd}
                      className="hover:underline cursor-pointer"
                    >
                      [Menu / Cancel]
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Simulator Controls */}
            <div className="mt-4 space-y-3">
              {activeMode === 'sms' ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputBatch}
                      onChange={(e) => {
                        setInputBatch(e.target.value.toUpperCase());
                        setSimulatedResponse(null);
                      }}
                      placeholder="Enter Batch No (e.g. BT-COT-2026-8841)"
                      className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono font-bold"
                    />
                    <button
                      onClick={handleBackspace}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer border border-slate-700"
                      title="Backspace"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleSimulateSms}
                    disabled={isSimulating}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'Sending 2G SMS to 56161...' : 'Send SMS (Simulate 56161)'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUssdSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={ussdInput}
                    onChange={(e) => setUssdInput(e.target.value)}
                    placeholder={
                      ussdStep === 1
                        ? 'Enter 1, 2, 3 or 4'
                        : ussdStep === 2
                        ? 'Enter Batch No'
                        : 'Enter 0 for Main Menu'
                    }
                    className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-transform"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={resetUssd}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer border border-slate-700"
                    title="Reset to Menu"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Physical Keypad Buttons Representation */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { key: '1', sub: '.,' },
                  { key: '2', sub: 'ABC' },
                  { key: '3', sub: 'DEF' },
                  { key: '4', sub: 'GHI' },
                  { key: '5', sub: 'JKL' },
                  { key: '6', sub: 'MNO' },
                  { key: '7', sub: 'PQRS' },
                  { key: '8', sub: 'TUV' },
                  { key: '9', sub: 'WXYZ' },
                  { key: '*', sub: 'USSD' },
                  { key: '0', sub: 'Menu / +' },
                  { key: '#', sub: 'OK' }
                ].map(({ key, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-700 text-slate-200 text-xs font-black transition-all border border-slate-700/60 active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-xs"
                  >
                    <span>{key}</span>
                    <span className="text-[8px] text-slate-400 font-normal">{sub}</span>
                  </button>
                ))}
              </div>

              {/* Keypad Quick Actions */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="hover:text-amber-300 cursor-pointer flex items-center gap-1"
                >
                  <Delete className="w-3 h-3" />
                  <span>Clear Digit</span>
                </button>
                <button
                  type="button"
                  onClick={resetUssd}
                  className="hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Phone</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Protocol Guide & Shortcode Cheatsheet */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Batch Selector Pills */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Live Agricultural Batches:</span>
              </span>
              <span className="text-[11px] text-slate-500">Tap to load into phone</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelectPreset('BT-COT-2026-8841')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  inputBatch === 'BT-COT-2026-8841'
                    ? 'border-emerald-600 bg-emerald-50/80 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 font-mono">BT-COT-2026-8841</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Genuine</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1">Mahyco Bt Cotton Hybrid Seed</div>
              </button>

              <button
                onClick={() => handleSelectPreset('NANO-UREA-IF772')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  inputBatch === 'NANO-UREA-IF772'
                    ? 'border-emerald-600 bg-emerald-50/80 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 font-mono">NANO-UREA-IF772</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Genuine</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1">IFFCO Nano Urea Plus Liquid</div>
              </button>

              <button
                onClick={() => handleSelectPreset('CF-FAKE-9920')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  inputBatch === 'CF-FAKE-9920'
                    ? 'border-rose-600 bg-rose-50/80 font-bold ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 font-mono">CF-FAKE-9920</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">Counterfeit</span>
                </div>
                <div className="text-[11px] text-rose-700 mt-1">Seized Spurious Pesticide Batch</div>
              </button>

              <button
                onClick={() => handleSelectPreset('EXP-SEED-2021')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  inputBatch === 'EXP-SEED-2021'
                    ? 'border-amber-600 bg-amber-50/80 font-bold ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 font-mono">EXP-SEED-2021</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">Expired</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1">Expired Hybrid Seed Lot (Seeds Act)</div>
              </button>
            </div>
          </div>

          {/* SMS Protocol Instructions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              <span>SMS Shortcode Syntax: 56161</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500 font-medium">Text Message Format:</div>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-300 font-mono text-sm font-black text-slate-900 shadow-inner">
                <span>VERIFY {inputBatch}</span>
                <button
                  onClick={handleCopySmsTemplate}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1 text-xs"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Send to: <strong className="text-slate-900 font-bold">56161</strong></span>
                <span>Toll-Free / Standard SMS • No data needed</span>
              </div>
            </div>

            {/* Multi-lingual Example */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-2 text-emerald-950">
              <div className="font-extrabold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Multi-Lingual Automatic Telecom Dialect Recognition</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                The AgriSafe SMS engine automatically identifies your circle state (Maharashtra, Punjab, UP, Tamil Nadu, Karnataka, Andhra, etc.) and transmits statutory alerts in the farmer's regional dialect:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] italic text-slate-700 leading-relaxed">
                "{dict.genuineSampleText}"
              </div>
            </div>
          </div>

          {/* USSD Keypad Instructions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-700" />
              <span>USSD Interactive Flash Menu: *99*51#</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Zero Mobile Balance Needed</span>
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  USSD operates directly across the GSM signaling channel. Works even when main account balance is ₹0.00.
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Instant Session Turnaround</span>
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  Session popups execute under 350ms, connected to Central SeedTrace and CIBRC statutory registers.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <span className="font-extrabold block">Kisan Statutory Protection (Seeds Act 1966 & Insecticides Act 1968):</span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  If an input is flagged as <strong className="text-rose-700">Counterfeit</strong> or <strong className="text-amber-800">Expired</strong>, do not spray or sow. Hand over the container to your local Krishi Vigyan Kendra (KVK) or call the Power Ventures Helpline at <strong className="text-slate-950">95384-84475</strong> for immediate enforcement action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
