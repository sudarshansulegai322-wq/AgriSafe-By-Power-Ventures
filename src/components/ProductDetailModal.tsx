import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Truck,
  Leaf,
  Volume2
} from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';
import { speechService } from '../services/speechService';
import { getProductImage, handleProductImageError } from '../services/productImageService';

interface ProductDetailModalProps {
  product: Product;
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onVerifyBatch: (batchNumber: string) => void;
  onCheckCompatibility: () => void;
  onAskAi?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
  onBuyNow,
  onVerifyBatch,
  onCheckCompatibility,
  onAskAi
}) => {
  const [quantity, setQuantity] = useState(1);
  const t = translations[language];

  const handleAudioGuide = () => {
    const text = language === 'hi'
      ? `${product.title}। निर्माता: ${product.brand}। मूल्य: ${product.price} रुपये। अनुशंसित खुराक: ${product.dosagePerAcre}। यह उत्पाद CIBRC और SeedTrace द्वारा प्रमाणित है।`
      : language === 'mr'
      ? `${product.title}. किंमत: ${product.price} रुपये. वापरण्याची मात्रा: ${product.dosagePerAcre}. हे शासकीय प्रमाणित उत्पादन आहे.`
      : language === 'te'
      ? `${product.title}. ధర: ₹${product.price}. వాడాల్సిన మోతాదు: ${product.dosagePerAcre}. ఇది సీడ్‌ట్రేస్ మరియు CIBRC ధృవీకరించిన నాణ్యమైన ఉత్పత్తి.`
      : language === 'kn'
      ? `${product.title}. ಬೆಲೆ: ₹${product.price}. ಬಳಸುವ ಪ್ರಮಾಣ: ${product.dosagePerAcre}. ಇದು ಸರ್ಕಾರಿ ಪ್ರಮಾಣೀಕೃತ ಕೃಷಿ ಉತ್ಪನ್ನ.`
      : language === 'gu'
      ? `${product.title}. કિંમત: ₹${product.price}. ભલામણ કરેલ માત્રા: ${product.dosagePerAcre}. આ સરકારી પ્રમાણિત ઉત્પાદન છે.`
      : language === 'bn'
      ? `${product.title}। মূল্য: ₹${product.price}। ব্যবহারের মাত্রা: ${product.dosagePerAcre}। এটি সিডট্রেস দ্বারা প্রত্যয়িত।`
      : language === 'ml'
      ? `${product.title}. വില: ₹${product.price}. ഉപയോഗിക്കേണ്ട അളവ്: ${product.dosagePerAcre}. ഇത് സർക്കാർ സാക്ഷ്യപ്പെടുത്തിയ ഉൽപ്പന്നമാണ്.`
      : `${product.title} by ${product.brand}. Subsidized price: Rupee ${product.price}. Recommended application: ${product.dosagePerAcre}. Verified SeedTrace Batch: ${product.batchNumber}.`;

    speechService.speak(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white rounded-full shadow-xs cursor-pointer transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Product Photo & Verified Badges (5 cols) */}
          <div className="md:col-span-5 bg-slate-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs mb-4">
              <img
                src={getProductImage(product.image, product.category, product.title)}
                onError={(e) => handleProductImageError(e, product.category, product.title)}
                alt={product.title}
                className="w-full h-72 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {product.subsidyTag && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-bold text-xs shadow-xs">
                  {product.subsidyTag}
                </div>
              )}
            </div>

            {/* Quick Action: Audio Narration & Certified SeedTrace Batch */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    Certified SeedTrace Lot
                  </span>
                  <span className="font-mono text-xs font-extrabold text-emerald-800">
                    {product.batchNumber}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onVerifyBatch(product.batchNumber);
                  }}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Verify Lot
                </button>
              </div>

              <button
                onClick={handleAudioGuide}
                className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>{t.audioGuideButton}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module & Specs (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Brand Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-emerald-800 uppercase tracking-wide">
                  {product.category}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Building2 className="w-3.5 h-3.5" />
                  {product.brand}
                </span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {product.season} Season
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {product.title}
              </h2>

              {/* Pricing Block */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  ₹{product.price}
                </span>
                <span className="text-base text-slate-400 line-through font-mono tabular-nums">
                  ₹{product.originalPrice}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Save ₹{product.originalPrice - product.price} (Govt Subsidized)
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Key Technical Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Active Formulation
                  </span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {product.activeChemical}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Package Specification
                  </span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {product.packageSize}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Recommended Dosage
                  </span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {product.dosagePerAcre}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Fulfillment Partner
                  </span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {product.vendorName}
                  </span>
                </div>
              </div>

              {/* Suitable Crops Tag list */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase">
                  Approved Crop Applications:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.suitableCrops.map((crop, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contiguous Purchase Module Bottom Bar */}
            <div className="pt-5 mt-5 border-t border-slate-200 space-y-3">
              {onAskAi && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskAi(product);
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 font-bold text-xs rounded-xl border border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>🌾 डॉ. किसान AI से पूछें (Ask Dr. Kisan AI for dosage, timing & safe tank-mix)</span>
                </button>
              )}

              <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.addToCart}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>{t.buyNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tank Mix Shortcut Link */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  Dispatched via Rural IndiaPost / Krishi Express
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onCheckCompatibility();
                  }}
                  className="text-slate-600 hover:text-emerald-700 underline font-medium cursor-pointer"
                >
                  Test Tank-Mix Compatibility ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
