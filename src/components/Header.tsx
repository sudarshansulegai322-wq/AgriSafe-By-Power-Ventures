import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Volume2,
  Menu,
  X,
  Globe,
  Mic,
  ShieldAlert,
  PhoneCall,
  Lock,
  Eye,
  Users,
  HeartHandshake,
  Download,
  ChevronDown,
  Share2
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { assistantTranslations } from '../data/assistantTranslations';
import { speechService } from '../services/speechService';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  cartCount: number;
  openCart: () => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onOpenAiAssistant: () => void;
  onOpenAdminSupport: () => void;
  onOpenAdminAccess: () => void;
  onOpenVisitorLink: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
  language,
  setLanguage,
  cartCount,
  openCart,
  isSpeaking,
  onToggleSpeech,
  onOpenAiAssistant,
  onOpenAdminSupport,
  onOpenAdminAccess,
  onOpenVisitorLink,
  isAdminLoggedIn = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [viewerStats, setViewerStats] = useState({
    activeFarmersViewing: 1428,
    todayAuthentications: 42890,
    moderationStatus: 'Enforced'
  });

  useEffect(() => {
    fetch('/api/viewer/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.stats) {
          setViewerStats({
            activeFarmersViewing: data.stats.activeFarmersViewing,
            todayAuthentications: data.stats.todayAuthentications,
            moderationStatus: data.stats.queryModerationStatus || 'Enforced'
          });
        }
      })
      .catch(() => {});
  }, []);

  const t = translations[language];
  const ui = assistantTranslations[language] || assistantTranslations['en'];

  // Primary navigation items kept in main bar
  const primaryNavItems = [
    { id: 'verify', label: t.navVerify, badge: null },
    { id: 'compatibility', label: t.navCompatibility, badge: null },
    { id: 'dosage-calculator', label: t.navDosageCalculator, badge: 'NPK & Pump' },
    { id: 'marketplace', label: t.navMarketplace, badge: null },
    { id: 'weather', label: t.navWeather, badge: 'Radar' },
  ];

  // Secondary items in clean dropdown
  const moreNavItems = [
    { id: 'drone', label: t.navDrone, badge: '50% Subsidy', desc: 'DGCA Certified Drone Spraying & CHC Booking' },
    { id: 'traceability', label: t.navTraceability, badge: 'NABL', desc: 'Seed-to-Harvest Output Provenance & QR' },
    { id: 'offline-sms', label: t.navOfflineSms, badge: '56161', desc: 'Zero-data 2G GSM & USSD *99*51# Fallback' },
    { id: 'kendras', label: 'District Kendras', badge: 'Walk-In', desc: 'Offline Krishi Sahayak Village Network' },
    { id: 'helpline', label: t.navSupport, badge: 'Toll-Free', desc: 'Grievance Redressal & Anti-Spurious Desk' }
  ];

  const allNavItems = [...primaryNavItems, ...moreNavItems];

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
    { code: 'en', label: 'English', native: 'English' }
  ];

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    speechService.stop();
    speechService.testVoice(newLang);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs w-full">
      {/* Top micro-banner for Company Toll-Free & Central Helplines */}
      <div className="bg-slate-900 text-slate-300 text-[11px] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SeedTrace & CIBRC Central Server
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden md:inline text-slate-300 truncate">
              Company Toll-Free: <a href="tel:9538484475" className="font-mono text-amber-300 font-extrabold hover:underline">95384-84475</a>
            </span>
            <span className="hidden lg:inline text-slate-600">·</span>
            <span className="hidden lg:inline text-slate-300 truncate">
              Kisan Helpline: <a href="tel:18001801551" className="font-mono text-emerald-300 font-bold hover:underline">1800-180-1551</a>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Click to Call Company Toll-Free Directly */}
            <a
              href="tel:9538484475"
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-black cursor-pointer text-[11px] bg-slate-800/90 px-2 py-0.5 rounded-full border border-amber-400/40"
              title="Call Power Ventures Official Toll-Free Hotline"
            >
              <PhoneCall className="w-3 h-3 text-amber-400 shrink-0" />
              <span>95384-84475</span>
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenAdminSupport}
              className="text-slate-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Grievance Desk</span>
            </button>
            <span className="text-slate-700">|</span>
            {/* Share / Visitor Link Button */}
            <button
              onClick={onOpenVisitorLink}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs border border-emerald-400/50"
              title="Get Public Visitor Link for farmers, dealers & guests"
            >
              <Share2 className="w-3 h-3 text-white" />
              <span>Visitor Link</span>
            </button>
            <span className="text-slate-700">|</span>
            {/* Administrative Portal Access Button */}
            <button
              onClick={onOpenAdminAccess}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                isAdminLoggedIn
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title="Power Ventures Administrative Console"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Admin Portal Active' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Official Logo & Brand Name */}
          <button
            onClick={() => setActiveSection('verify')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
          >
            <img
              src="/images/agrisafe_logo.jpeg"
              onError={(e) => {
                e.currentTarget.src = '/assets/aistudio/WhatsApp_Image_2026-11-05_at_4.30.52_PM_245dea67.jpeg';
              }}
              alt="Power Ventures AgriSafe Logo"
              className="h-10 w-auto object-contain rounded-lg border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap leading-tight">
                AgriSafe
              </span>
              <span className="text-[10px] font-extrabold tracking-wide text-emerald-700 uppercase">
                by Power Ventures
              </span>
            </div>
          </button>

          {/* Zone 2: Streamlined & Balanced Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs font-bold text-slate-600">
            {primaryNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMoreMenuOpen(false);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className={`relative px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-100/70 font-extrabold border border-emerald-300/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-400 text-slate-950 uppercase shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* More Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreMenuOpen((prev) => !prev);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-xs font-bold border ${
                  moreNavItems.some((i) => i.id === activeSection)
                    ? 'text-emerald-800 bg-emerald-100/70 font-extrabold border-emerald-300/80 shadow-2xs'
                    : moreMenuOpen
                    ? 'bg-slate-100 text-slate-900 border-slate-300'
                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>More Services</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-emerald-700' : 'text-slate-500'}`} />
              </button>

              {moreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMoreMenuOpen(false)}
                  />
                  <div className="absolute top-full right-0 lg:left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 space-y-1.5 animate-fadeIn">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Additional Platform Modules
                    </div>
                    {moreNavItems.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSection(item.id);
                            setMoreMenuOpen(false);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-2 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200'
                              : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-400 text-slate-950 uppercase shadow-2xs">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5 leading-snug">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Zone 3: Balanced & Compact Utility Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Share / Visitor Link Button */}
            <button
              onClick={onOpenVisitorLink}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
              title="Share Visitor Link with Farmers & Guests"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Share</span>
            </button>

            {/* Kisan Voice AI Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
              title={ui.kisanAiBtn}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{ui.kisanAiBtn}</span>
            </button>

            {/* Multilingual Voice Selector */}
            <div className="relative inline-flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="pl-7 pr-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none transition-colors"
                aria-label="Select Regional Voice Language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Speech Toggle */}
            <button
              onClick={onToggleSpeech}
              title={isSpeaking ? ui.stopVoiceBtn : ui.voiceGuideBtn}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              aria-label="Toggle Voice Guide"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Shopping Bag Primary Action */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">{t.cart}</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.15rem] h-4.5 px-1 text-[10px] font-bold text-emerald-950 bg-amber-400 rounded-full tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                onOpenAiAssistant();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Mic className="w-4 h-4" />
              <span>{ui.kisanAiBtn}</span>
            </button>
            <button
              onClick={() => {
                onOpenAdminSupport();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{ui.adminSupportBtn}</span>
            </button>
          </div>

          {/* Separate Admin Portal Access for Mobile */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenVisitorLink();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-4 h-4 text-emerald-200" />
              <span>Share Visitor Link</span>
            </button>
            <button
              onClick={() => {
                onOpenAdminAccess();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Admin Active' : 'Admin Login'}</span>
            </button>
          </div>

          {allNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                activeSection === item.id
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-amber-400 text-slate-950 uppercase">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Company Toll-Free:</span>
              <a href="tel:9538484475" className="font-black font-mono text-emerald-800 text-sm hover:underline">
                95384-84475
              </a>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Kisan Call Centre 24x7:</span>
              <a href="tel:18001801551" className="font-bold font-mono text-slate-600">1800-180-1551</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
