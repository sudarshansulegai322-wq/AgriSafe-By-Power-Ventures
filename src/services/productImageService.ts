// Agricultural Product Image Fallback and Resolver Service
// Ensures product cards always display authentic agricultural input packaging
// and NEVER fall back to the corporate logo.

export function getProductImage(image?: string, category?: string, title?: string): string {
  if (image && image.trim().length > 0 && !image.includes('agrisafe_logo')) {
    return image;
  }
  return getCategoryFallbackImage(category, title);
}

export function getCategoryFallbackImage(category?: string, title?: string): string {
  const cat = (category || '').toLowerCase();
  const name = (title || '').toLowerCase();

  // 1. Seeds & Hybrid Varieties
  if (
    cat.includes('seed') ||
    name.includes('seed') ||
    name.includes('hybrid') ||
    name.includes('bt cotton') ||
    name.includes('paddy') ||
    name.includes('wheat') ||
    name.includes('mustard')
  ) {
    return '/images/product_hybrid_seeds_1793873618582.jpg';
  }

  // 2. Nano & Liquid Fertilizers
  if (name.includes('nano') || name.includes('liquid urea') || name.includes('nano dap')) {
    return '/images/product_nano_urea_1793873618375.jpg';
  }

  // 3. Granular & Water-Soluble Fertilizers / Micronutrients
  if (
    cat.includes('fertilizer') ||
    cat.includes('micronutrient') ||
    cat.includes('nutrient') ||
    name.includes('npk') ||
    name.includes('dap') ||
    name.includes('urea') ||
    name.includes('zinc') ||
    name.includes('boron') ||
    name.includes('potassium')
  ) {
    return '/images/fertilizer_npk_bighaat.jpg';
  }

  // 4. Bio-Stimulants, Organic & Soil Conditioners
  if (
    cat.includes('bio') ||
    name.includes('bio') ||
    name.includes('humic') ||
    name.includes('seaweed') ||
    name.includes('mycorrhiza') ||
    name.includes('amino') ||
    name.includes('zzyme') ||
    name.includes('tonic')
  ) {
    return '/images/biostimulant_pack_bighaat.jpg';
  }

  // 5. Farm Equipment, Sprayers, Traps, Solar
  if (
    cat.includes('equipment') ||
    cat.includes('machin') ||
    cat.includes('tool') ||
    name.includes('sprayer') ||
    name.includes('trap') ||
    name.includes('solar') ||
    name.includes('probe') ||
    name.includes('tester')
  ) {
    if (name.includes('trap') || name.includes('solar') || name.includes('lure')) {
      return '/images/solar_insect_trap.jpg';
    }
    return '/images/battery_knapsack_sprayer.jpg';
  }

  // 6. Fungicides & Disease Shields
  if (
    cat.includes('fungi') ||
    name.includes('fungicide') ||
    name.includes('blight') ||
    name.includes('mildew') ||
    name.includes('saaf') ||
    name.includes('amistar') ||
    name.includes('bavistin')
  ) {
    return '/images/product_crop_shield_1793873618659.jpg';
  }

  // 7. Herbicides & Weed Killers
  if (
    cat.includes('herbicide') ||
    cat.includes('weed') ||
    name.includes('glyphosate') ||
    name.includes('roundup') ||
    name.includes('weed') ||
    name.includes('2,4-d') ||
    name.includes('atrazine')
  ) {
    return '/images/pesticide_pack_bighaat.jpg';
  }

  // 8. Default Agricultural Crop Protection Pack
  return '/images/pesticide_pack_bighaat.jpg';
}

/**
 * Handle img onError event safely without ever replacing with the company logo.
 * Tries the category fallback first; if already using it, uses an inline SVG badge.
 */
export function handleProductImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string,
  title?: string
) {
  const target = event.currentTarget;
  const fallback = getCategoryFallbackImage(category, title);

  // If the failing source wasn't the category fallback, try that first
  if (!target.src.endsWith(fallback)) {
    target.src = fallback;
    return;
  }

  // If even the fallback fails, generate a clean agricultural input packaging placeholder
  const safeCategory = (category || 'AgriSafe Certified').replace(/[<>&"]/g, '');
  const safeTitle = (title || 'Agricultural Input').slice(0, 32).replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="100%" stop-color="#022c22" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#bg)"/>
    <circle cx="200" cy="110" r="48" fill="#10b981" fill-opacity="0.2" stroke="#34d399" stroke-width="2"/>
    <path d="M200 80 C185 95 180 120 200 135 C220 120 215 95 200 80 Z" fill="#34d399"/>
    <path d="M200 135 L200 100" stroke="#064e3b" stroke-width="2" stroke-linecap="round"/>
    <text x="200" y="195" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${safeTitle}</text>
    <text x="200" y="222" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a7f3d0" text-anchor="middle">${safeCategory} • Certified Input</text>
    <rect x="130" y="244" width="140" height="24" rx="12" fill="#047857"/>
    <text x="200" y="260" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#ecfdf5" text-anchor="middle">100% CIBRC / SEED REGISTERED</text>
  </svg>`;

  target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
