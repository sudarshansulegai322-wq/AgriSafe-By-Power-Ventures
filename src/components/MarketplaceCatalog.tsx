import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  Sparkles,
  Search,
  Eye,
  Award,
  Volume2,
  ArrowUpDown,
  Tag,
  HelpCircle
} from 'lucide-react';
import { Product, Language } from '../types';
import { PRODUCTS } from '../data/mockData';
import { translations } from '../data/translations';
import { speechService } from '../services/speechService';
import { getProductImage, handleProductImageError } from '../services/productImageService';

interface MarketplaceCatalogProps {
  language: Language;
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onAskAiAboutProduct?: (product: Product) => void;
}

export const MarketplaceCatalog: React.FC<MarketplaceCatalogProps> = ({
  language,
  onAddToCart,
  onSelectProduct,
  onAskAiAboutProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('featured');

  const t = translations[language];

  const categories = [
    { id: 'All', label: 'All Inputs (BigHaat / IFFCO / Govt)' },
    { id: 'Certified Seeds', label: '🌾 Certified Hybrid Seeds' },
    { id: 'Fertilizers', label: '🌿 Fertilizers & Plant Nutrition' },
    { id: 'Pesticides', label: '🐛 Pesticides & Insecticides' },
    { id: 'Fungicides', label: '🍄 Fungicides & Disease Control' },
    { id: 'Herbicides', label: '🌱 Herbicides & Weedicides' },
    { id: 'Micronutrients', label: '⚡ Micronutrients & Zinc' },
    { id: 'Bio-Stimulants', label: '🍃 Organic Bio-Stimulants' },
    { id: 'Farm Equipment', label: '🚜 Farm Equipment & Solar Traps' }
  ];

  const topBrands = [
    'All',
    'IFFCO India',
    'Bayer CropScience',
    'Syngenta India',
    'FMC India',
    'UPL Limited',
    'Corteva Agriscience',
    'Deepak Fertilisers (Mahadhan)',
    'National Seeds Corporation (NSC)',
    'Mahyco Seeds',
    'Rasi Seeds',
    'Dhanuka Agritech',
    'Multiplex Group'
  ];

  const seasons = ['All', 'Kharif', 'Rabi', 'All-Season'];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category match
      let matchesCat = selectedCategory === 'All';
      if (!matchesCat) {
        if (selectedCategory === 'Fertilizers') {
          matchesCat = p.category === 'Fertilizers' || p.category === 'Micronutrients';
        } else if (selectedCategory === 'Pesticides') {
          matchesCat = p.category === 'Pesticides' || p.category === 'Crop Protection';
        } else {
          matchesCat = p.category === selectedCategory;
        }
      }

      // Brand match
      const matchesBrand =
        selectedBrand === 'All' ||
        p.brand.toLowerCase().includes(selectedBrand.toLowerCase().replace(' (nsc)', '').replace(' (mahadhan)', '').split(' ')[0]);

      // Season match
      const matchesSeason = selectedSeason === 'All' || p.season === selectedSeason || p.season === 'All-Season';

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.activeChemical.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.batchNumber.toLowerCase().includes(query) ||
        p.suitableCrops.some((c) => c.toLowerCase().includes(query));

      return matchesCat && matchesBrand && matchesSeason && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') {
        const discA = (a.originalPrice - a.price) / a.originalPrice;
        const discB = (b.originalPrice - b.price) / b.originalPrice;
        return discB - discA;
      }
      return b.reviewsCount - a.reviewsCount; // featured default
    });
  }, [selectedCategory, selectedBrand, selectedSeason, searchQuery, sortBy]);

  const handleSpeakProduct = (product: Product) => {
    const speechText =
      language === 'hi'
        ? `${product.title}। रियायती मूल्य: ${product.price} रुपये। निर्माता: ${product.brand}। सरकारी प्रमाणित बीज और दवा।`
        : language === 'mr'
        ? `${product.title}. सवलतीचा दर: ${product.price} रुपये. निर्माता: ${product.brand}. शासकीय प्रमाणित औषध.`
        : language === 'te'
        ? `${product.title}. సబ్సిడీ ధర: ₹${product.price}. కంపెనీ: ${product.brand}. ప్రభుత్వ ధృవీకృత నాణ్యమైన ఉత్పత్తి.`
        : language === 'ta'
        ? `${product.title}. விலை: ₹${product.price}. நிறுவனம்: ${product.brand}. அரசு அங்கீகாரம் பெற்றது.`
        : language === 'kn'
        ? `${product.title}. ರಿಯಾಯಿತಿ ದರ: ₹${product.price}. ಕಂಪನಿ: ${product.brand}. ಸರ್ಕಾರಿ ಪ್ರಮಾಣೀಕೃತ ಉತ್ಪನ್ನ.`
        : `${product.title} by ${product.brand}. Subsidized price: Rupee ${product.price}. Certified agricultural input.`;

    speechService.speak(speechText, language);
  };

  return (
    <div id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-bold mb-3 border border-emerald-300 shadow-2xs">
          <Award className="w-4 h-4 text-emerald-800" />
          <span>BigHaat, IFFCO, Bayer, Syngenta & NSC Certified Input Hub (45+ Products)</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.marketplaceTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          {t.marketplaceSubtitle}
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8 space-y-4">
        {/* Top Row: Search and Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop (cotton, paddy, chilli), brand (Bayer, IFFCO), or chemical (Coragen, Urea, Amistar)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm font-medium text-slate-900 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="featured">Featured & Best Selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rating (★)</option>
              <option value="discount">Biggest Subsidy / Discount</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedCategory === c.id
                  ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Brand Strip & Season Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Brand Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-slate-500 font-bold shrink-0">Brands:</span>
            {topBrands.map((b) => {
              const shortName = b.replace(' (NSC)', '').replace(' (Mahadhan)', '').replace(' India', '').replace(' Limited', '').replace(' Agrovet', '');
              return (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedBrand === b
                      ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          {/* Season Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-semibold">{t.filterSeason}:</span>
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedSeason === s
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'All' ? 'All Seasons' : `${s} Crop`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Authentic Sourcing Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 mb-6 px-1">
        <div>
          Showing <span className="font-extrabold text-slate-900 font-mono">{filteredProducts.length}</span> certified inputs from BigHaat, IFFCO, Bayer, Syngenta, FMC, UPL, and National Seeds Corp.
        </div>
        <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>All Batches CIBRC Registered & SeedTrace™ Tested</span>
        </div>
      </div>

      {/* Zero Results Fallback */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No agricultural inputs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No products match "{searchQuery}" under category "{selectedCategory}". Try searching for crops like "cotton", "paddy", "tomato", or inputs like "coragen", "nano urea", or "amistar".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setSelectedSeason('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Product Cards Grid: 3-column desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredProducts.map((product) => {
          const discountPercent = Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
          );

          return (
            <div
              key={product.id}
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              {/* Lead Image Slot */}
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img
                  src={getProductImage(product.image, product.category, product.title)}
                  onError={(e) => handleProductImageError(e, product.category, product.title)}
                  alt={product.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Subsidized Badge */}
                {product.subsidyTag && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-950" />
                    <span>{product.subsidyTag}</span>
                  </div>
                )}

                {/* Season & Discount Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {discountPercent > 0 && (
                    <div className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                      {discountPercent}% OFF
                    </div>
                  )}
                  <div className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium">
                    {product.season}
                  </div>
                </div>

                {/* Quick View Overlay Button */}
                <button
                  onClick={() => onSelectProduct(product)}
                  className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t.viewDetails}</span>
                </button>
              </div>

              {/* Content & Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Brand & Package Size */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span className="font-extrabold text-emerald-800 uppercase tracking-wide">
                      {product.brand}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                      {product.packageSize}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {product.title}
                  </h3>

                  {/* Active Chemical Formulation */}
                  <p className="text-xs text-slate-600 mt-1.5 font-mono line-clamp-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    🧪 {product.activeChemical}
                  </p>

                  {/* Suitable Crops Tag */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {product.suitableCrops.slice(0, 3).map((crop, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold border border-emerald-100"
                      >
                        {crop}
                      </span>
                    ))}
                    {product.suitableCrops.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium self-center">
                        +{product.suitableCrops.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Verified Vendor Tag */}
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold mt-3">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{product.vendorType}</span>
                    </span>
                    <span className="text-amber-600 font-bold">
                      ★ {product.rating} ({product.reviewsCount.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Price, Ask AI & Purchase Bar */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                      ₹{product.price}
                    </div>
                    {product.originalPrice > product.price && (
                      <div className="text-[11px] text-slate-400 line-through font-mono tabular-nums">
                        ₹{product.originalPrice}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Ask Kisan AI about this Product Button */}
                    {onAskAiAboutProduct && (
                      <button
                        type="button"
                        onClick={() => onAskAiAboutProduct(product)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 shadow-2xs"
                        title="डॉ. किसान AI से इस उत्पाद की मात्रा व छिड़काव पूछें (Ask Dr. Kisan AI)"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                      </button>
                    )}

                    {/* Audio Listen Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakProduct(product)}
                      className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 shadow-2xs"
                      title="आवाज़ में सुनें (Listen to product details)"
                    >
                      <Volume2 className="w-4 h-4 text-amber-900" />
                    </button>

                    {/* Add to Cart */}
                    <button
                      onClick={() => onAddToCart(product, 1)}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
