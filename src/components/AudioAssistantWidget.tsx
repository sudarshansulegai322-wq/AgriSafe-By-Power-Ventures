import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  PhoneCall,
  ChevronUp,
  ChevronDown,
  Mic,
  ShieldAlert
} from 'lucide-react';
import { Language } from '../types';
import { speechService, LANGUAGE_METADATA } from '../services/speechService';
import { assistantTranslations } from '../data/assistantTranslations';

interface AudioAssistantWidgetProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeSection: string;
  onOpenAiAssistant: () => void;
  onOpenAdminSupport: () => void;
}

export const AudioAssistantWidget: React.FC<AudioAssistantWidgetProps> = ({
  language,
  setLanguage,
  onOpenAiAssistant,
  onOpenAdminSupport
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceRate, setVoiceRate] = useState<'slow' | 'normal'>('slow');
  const ui = assistantTranslations[language] || assistantTranslations['en'];

  useEffect(() => {
    const unsubscribe = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      const meta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA['en'];
      speechService.speak(meta.fallbackGreeting, language);
    }
  };

  const handleTestVoice = (lang: Language) => {
    setLanguage(lang);
    speechService.stop();
    speechService.testVoice(lang);
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-80">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-600/40 overflow-hidden transition-all">
        {/* Main Floating Capsule Button */}
        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Open AI Voice Assistant Button (Dynamic translation!) */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer transition-all active:scale-95"
              title={ui.assistantTitle}
            >
              <Mic className="w-3.5 h-3.5 text-slate-950" />
              <span>{ui.widgetAiTitle}</span>
            </button>

            {/* Listen / Pause Voice Guide Button (Dynamic translation!) */}
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-600 text-white shadow-md animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
              title={isSpeaking ? ui.stopVoiceBtn : ui.voiceGuideBtn}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? ui.widgetVoiceStop : ui.widgetVoiceTitle}</span>
            </button>
          </div>

          {/* Equalizer Sound Wave Animation */}
          {isSpeaking && (
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-amber-400 h-2 animate-[pulse_0.4s_ease-in-out_infinite]" />
              <span className="w-1 bg-amber-400 h-4 animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-1 bg-amber-400 h-3 animate-[pulse_0.5s_ease-in-out_infinite]" />
              <span className="w-1 bg-amber-400 h-1 animate-[pulse_0.3s_ease-in-out_infinite]" />
            </div>
          )}

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 cursor-pointer"
            aria-label="Toggle language and admin options"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Controls Drawer */}
        {isExpanded && (
          <div className="p-3.5 bg-white border-t border-slate-200 space-y-3 max-h-80 overflow-y-auto">
            {/* Quick Action Hub */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenAiAssistant();
                }}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-left flex items-center gap-2 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold block">{ui.assistantTitle}</span>
                  <span className="text-[9px] text-emerald-700 block">{ui.widgetAiSubtitle}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenAdminSupport();
                }}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-left flex items-center gap-2 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold block">{ui.widgetAdminTitle}</span>
                  <span className="text-[9px] text-rose-700 block">{ui.widgetAdminSubtitle}</span>
                </div>
              </button>
            </div>

            {/* Speed toggle for illiterate farmers */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 text-[11px]">{ui.voiceSpeedLabel}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setVoiceRate('slow');
                    speechService.setRate('slow');
                    speechService.testVoice(language);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                    voiceRate === 'slow'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {ui.speedSlow}
                </button>
                <button
                  onClick={() => {
                    setVoiceRate('normal');
                    speechService.setRate('normal');
                    speechService.testVoice(language);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                    voiceRate === 'normal'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {ui.speedNormal}
                </button>
              </div>
            </div>

            {/* All Regional Language Voices */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {ui.allVoicesLabel}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">{ui.clickToListen}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleTestVoice(l.code)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      language === l.code
                        ? 'bg-emerald-700 text-white shadow-2xs font-bold ring-2 ring-emerald-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{l.native}</span>
                    <Volume2 className="w-3 h-3 opacity-70" />
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Farmer Support Hotline */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[11px]">Power Ventures Toll-Free:</span>
                </div>
                <a
                  href="tel:9538484475"
                  className="font-mono font-black text-amber-700 hover:underline text-xs"
                >
                  95384-84475
                </a>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Kisan Helpline (Govt):</span>
                <a href="tel:18001801551" className="font-mono hover:underline">1800-180-1551</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
