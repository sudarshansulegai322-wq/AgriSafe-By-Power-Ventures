import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { VerificationEngine } from './components/VerificationEngine';
import { ChemicalCompatibilityEngine } from './components/ChemicalCompatibilityEngine';
import { FertilizerDosageCalculator } from './components/FertilizerDosageCalculator';
import { MarketplaceCatalog } from './components/MarketplaceCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AudioAssistantWidget } from './components/AudioAssistantWidget';
import { AiVoiceAssistantModal } from './components/AiVoiceAssistantModal';
import { AdminSupportModal } from './components/AdminSupportModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPortal, AdminUser } from './components/AdminPortal';
import { DistrictKendraNetwork } from './components/DistrictKendraNetwork';
import { WeatherPestAdvisory } from './components/WeatherPestAdvisory';
import { DroneSprayingModule } from './components/DroneSprayingModule';
import { TraceabilityDashboard } from './components/TraceabilityDashboard';
import { OfflineSmsVerification } from './components/OfflineSmsVerification';
import { VisitorLinkModal } from './components/VisitorLinkModal';
import { Footer } from './components/Footer';
import { Product, CartItem, OrderDetails, Language } from './types';
import { speechService, LANGUAGE_METADATA } from './services/speechService';
import { translations } from './data/translations';
import { assistantTranslations } from './data/assistantTranslations';
import {
  ShieldAlert,
  PhoneCall,
  Award,
  Mic,
  MessageSquare,
  Sparkles,
  Lock,
  CloudSun,
  Plane,
  QrCode,
  WifiOff,
  Calculator
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('verify');
  const [language, setLanguage] = useState<Language>('en'); // Clean English default, switchable to any language
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Modals & Administrative Access
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiAssistantQuery, setAiAssistantQuery] = useState<string | undefined>(undefined);
  const [isAdminSupportOpen, setIsAdminSupportOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminPortalView, setIsAdminPortalView] = useState(false);
  const [isVisitorLinkOpen, setIsVisitorLinkOpen] = useState(false);

  // Restore authenticated admin session from localStorage or URL hash/query
  useEffect(() => {
    try {
      const savedAdmin = localStorage.getItem('agrisafe_admin_user');
      if (savedAdmin) {
        setAdminUser(JSON.parse(savedAdmin));
      }
    } catch (e) {}

    // Check if URL specifies visitor link modal (e.g. ?share=true or ?visitor=true)
    if (
      typeof window !== 'undefined' &&
      (window.location.search.includes('share') || window.location.search.includes('visitor'))
    ) {
      setIsVisitorLinkOpen(true);
    }

    // Check if URL specifies admin portal access (e.g. ?admin=true or #admin)
    if (
      typeof window !== 'undefined' &&
      (window.location.search.includes('admin') || window.location.hash.includes('admin'))
    ) {
      const savedAdmin = localStorage.getItem('agrisafe_admin_user');
      if (savedAdmin) {
        setIsAdminPortalView(true);
      } else {
        setIsAdminLoginOpen(true);
      }
    }
  }, []);

  const handleOpenAdminAccess = () => {
    if (adminUser) {
      setIsAdminPortalView(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setIsAdminPortalView(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('agrisafe_admin_token');
    localStorage.removeItem('agrisafe_admin_user');
    setAdminUser(null);
    setIsAdminPortalView(false);
  };

  const t = translations[language];
  const ui = assistantTranslations[language] || assistantTranslations['en'];

  // Subscribe to speech synthesis state
  useEffect(() => {
    const unsubscribe = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleVerifyBatchFromProduct = (batchNumber: string) => {
    setActiveSection('verify');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleAskAiAboutProduct = (product: Product) => {
    const query =
      language === 'hi'
        ? `${product.title} का उपयोग कैसे करें? इसकी 15L पंप में सही मात्रा क्या है और यह किन फसलों के लिए सर्वोत्तम है?`
        : language === 'mr'
        ? `${product.title} चा वापर कसा करावा? १५ लिटर पंपात याचे योग्य प्रमाण किती आणि कोणत्या पिकासाठी योग्य आहे?`
        : `How to use ${product.title}? What is the exact dosage per 15L knapsack spray pump and which crops is it best for?`;
    setAiAssistantQuery(query);
    setIsAiAssistantOpen(true);
  };

  const handleCheckCompatibility = () => {
    setActiveSection('compatibility');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      const meta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA['en'];
      speechService.speak(meta.fallbackGreeting, language);
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Separate Dedicated Admin Portal View for Power Ventures Authorized Personnel
  if (isAdminPortalView && adminUser) {
    return (
      <AdminPortal
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onExitToFarmerView={() => setIsAdminPortalView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 w-full overflow-x-hidden">
      {/* 3-Zone Top Navigation Header with AgriSafe by Power Ventures & dynamic buttons */}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        language={language}
        setLanguage={setLanguage}
        cartCount={totalCartCount}
        openCart={() => setIsCheckoutOpen(true)}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenAdminSupport={() => setIsAdminSupportOpen(true)}
        onOpenAdminAccess={handleOpenAdminAccess}
        onOpenVisitorLink={() => setIsVisitorLinkOpen(true)}
        isAdminLoggedIn={Boolean(adminUser)}
      />

      {/* Hero Section with Trust Metrics */}
      <HeroSection
        language={language}
        onVerifyClick={() => {
          setActiveSection('verify');
          window.scrollTo({ top: 450, behavior: 'smooth' });
        }}
        onMarketplaceClick={() => {
          setActiveSection('marketplace');
          window.scrollTo({ top: 450, behavior: 'smooth' });
        }}
        onDosageCalculatorClick={() => {
          setActiveSection('dosage-calculator');
          window.scrollTo({ top: 450, behavior: 'smooth' });
        }}
      />

      {/* Quick Action Ribbon: Dynamically translated into the active language */}
      <div className="bg-emerald-900 text-white border-y border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0">
              🌾
            </span>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 block">
                {ui.ribbonTitle}
              </span>
              <span className="text-[11px] text-emerald-200">
                {ui.ribbonSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Quick module chips */}
            <button
              onClick={() => {
                setActiveSection('dosage-calculator');
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs cursor-pointer transition-all shrink-0"
            >
              <Calculator className="w-3.5 h-3.5 text-slate-950" />
              <span>NPK & Pump Dosage</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('weather');
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs border border-emerald-700 cursor-pointer transition-all"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-300" />
              <span>Weather & Pests</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('drone');
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs border border-emerald-700 cursor-pointer transition-all"
            >
              <Plane className="w-3.5 h-3.5 text-teal-300" />
              <span>Drone Spraying</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('traceability');
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs border border-emerald-700 cursor-pointer transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-300" />
              <span>Harvest QR</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('offline-sms');
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs border border-emerald-700 cursor-pointer transition-all"
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-300" />
              <span>SMS 56161</span>
            </button>

            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Mic className="w-4 h-4" />
              <span>{ui.ribbonVoiceCta}</span>
            </button>

            <button
              onClick={() => setIsAdminSupportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{ui.ribbonAdminCta}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Verification Engine */}
        {activeSection === 'verify' && (
          <VerificationEngine
            language={language}
            onNavigateToSection={(sec) => {
              setActiveSection(sec);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        )}

        {/* Chemical Compatibility Engine */}
        {activeSection === 'compatibility' && (
          <ChemicalCompatibilityEngine language={language} />
        )}

        {/* Precision Fertilizer & Pesticide Dosage Calculator */}
        {activeSection === 'dosage-calculator' && (
          <FertilizerDosageCalculator
            language={language}
            onAddToCart={handleAddToCart}
            onNavigateToCompatibility={() => {
              setActiveSection('compatibility');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            onNavigateToMarketplace={() => {
              setActiveSection('marketplace');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        )}

        {/* Live Weather & Pest Advisory Module */}
        {activeSection === 'weather' && (
          <WeatherPestAdvisory
            language={language}
            onNavigateToCompatibility={() => {
              setActiveSection('compatibility');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            onNavigateToDrone={() => {
              setActiveSection('drone');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        )}

        {/* Drone Spraying & Custom Hiring Linkage */}
        {activeSection === 'drone' && (
          <DroneSprayingModule
            language={language}
            onNavigateToCompatibility={() => {
              setActiveSection('compatibility');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        )}

        {/* Direct Farmer-to-Processor Traceability Dashboard */}
        {activeSection === 'traceability' && (
          <TraceabilityDashboard
            language={language}
            onNavigateToVerifyBatch={(batchNo) => {
              setActiveSection('verify');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        )}

        {/* Offline / Low-Bandwidth SMS USSD Verification Fallback */}
        {activeSection === 'offline-sms' && (
          <OfflineSmsVerification language={language} />
        )}

        {/* Certified Marketplace Catalog */}
        {activeSection === 'marketplace' && (
          <MarketplaceCatalog
            language={language}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAskAiAboutProduct={handleAskAiAboutProduct}
          />
        )}

        {/* District Kendras & Offline Village Facilitators (Walk-In Help for Illiterate Farmers) */}
        {activeSection === 'kendras' && (
          <DistrictKendraNetwork language={language} />
        )}

        {/* Govt Support & Redressal Portal */}
        {activeSection === 'helpline' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-3 border border-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <span>Anti-Spurious Agro-Input Taskforce</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Farmer Protection, AI Sahayak & Counterfeit Grievance Redressal
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Report spurious seeds, illegal adulterated pesticides, or overcharging directly to state agricultural quality control officers.
              </p>
            </div>

            {/* Direct Admin & AI Callout Cards - Dynamically translated! */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Direct Admin Support Desk Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-md">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {ui.adminCardTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {ui.adminCardDesc}
                  </p>
                </div>

                <div className="pt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsAdminSupportOpen(true)}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{ui.adminCardBtn}</span>
                  </button>
                  <a
                    href="tel:9538484475"
                    className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Company Toll-Free: 95384-84475</span>
                  </a>
                </div>
              </div>

              {/* Kisan Voice AI Assistant Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mb-4 shadow-md">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {ui.aiCardTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {ui.aiCardDesc}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setIsAiAssistantOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{ui.aiCardBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Emergency Hotline Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Power Ventures & Farmer Hotlines
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Round-the-clock agricultural input authenticity support, spurious dealer reporting, and agronomic advisory.
                  </p>
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 block">Power Ventures Company Toll-Free:</span>
                    <a href="tel:9538484475" className="text-2xl font-black font-mono text-emerald-900 hover:underline block">
                      95384-84475
                    </a>
                    <span className="text-[10px] text-amber-800 block">Direct Line for Verification & Grievance Redressal</span>
                  </div>
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Kisan Call Centre (Govt 24x7):</span>
                    <a href="tel:18001801551" className="text-base font-bold font-mono text-slate-800 hover:underline block">
                      1800-180-1551
                    </a>
                  </div>
                </div>
              </div>

              {/* State Quality Control Wing */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Vigilance & Raid Reporting Cell
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Seizure of counterfeit lots under Section 29 of the Insecticides Act 1968 and Section 19 of the Seeds Act 1966.
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">National Grievance Email:</span>
                    <span className="text-base font-bold font-mono text-slate-800">
                      vigilance-agri@gov.in
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">All informant details are strictly protected by law</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Legal Guidance */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                  Statutory Rights of Every Indian Farmer
                </h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Every agricultural dealer is legally bound to provide a stamped computer tax receipt containing the lot batch number.</li>
                <li>Farmers are entitled to full compensation from seed companies if germination falls below statutory certified thresholds.</li>
                <li>Never buy loose unsealed pesticides or repackaged seed bags lacking the official manufacturer security hologram.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Floating AI Multilingual Voice Guide Widget */}
      <AudioAssistantWidget
        language={language}
        setLanguage={setLanguage}
        activeSection={activeSection}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenAdminSupport={() => setIsAdminSupportOpen(true)}
      />

      {/* Kisan AI Voice Assistant Modal for Illiterate Farmers */}
      <AiVoiceAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => {
          setIsAiAssistantOpen(false);
          setAiAssistantQuery(undefined);
        }}
        language={language}
        setLanguage={setLanguage}
        onOpenAdminSupport={() => {
          setIsAiAssistantOpen(false);
          setIsAdminSupportOpen(true);
        }}
        initialQuery={aiAssistantQuery}
      />

      {/* Admin Support & Grievance Modal */}
      <AdminSupportModal
        isOpen={isAdminSupportOpen}
        onClose={() => setIsAdminSupportOpen(false)}
        language={language}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          language={language}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onVerifyBatch={handleVerifyBatchFromProduct}
          onCheckCompatibility={handleCheckCompatibility}
          onAskAi={handleAskAiAboutProduct}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={cart}
          language={language}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => {
            setIsCheckoutOpen(false);
            setCart([]);
            setCompletedOrder(order);
          }}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
        />
      )}

      {/* Order Success Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          language={language}
          onClose={() => setCompletedOrder(null)}
          onTrackOrder={() => setCompletedOrder(null)}
        />
      )}

      {/* Power Ventures Administrative Access Gate Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Share / Public Visitor Link Modal Guide */}
      <VisitorLinkModal
        isOpen={isVisitorLinkOpen}
        onClose={() => setIsVisitorLinkOpen(false)}
      />

      {/* Enterprise Footer with AgriSafe by Power Ventures branding */}
      <Footer
        language={language}
        onNavigate={(sec) => setActiveSection(sec)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenAdminSupport={() => setIsAdminSupportOpen(true)}
        onOpenAdminAccess={handleOpenAdminAccess}
        onOpenVisitorLink={() => setIsVisitorLinkOpen(true)}
      />
    </div>
  );
}
