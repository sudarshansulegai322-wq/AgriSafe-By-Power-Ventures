import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Award,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Volume2,
  Navigation,
  Sparkles,
  HeartHandshake,
  Star,
  ExternalLink,
  Lock
} from 'lucide-react';
import { DistrictSahayak, Language } from '../types';
import { INITIAL_DISTRICT_SAHAYAKS } from '../data/districtSahayaks';
import { speechService } from '../services/speechService';

interface DistrictKendraNetworkProps {
  language: Language;
  onSelectKendraForOrder?: (kendra: DistrictSahayak) => void;
  selectedKendraId?: string;
}

export const DistrictKendraNetwork: React.FC<DistrictKendraNetworkProps> = ({
  language,
  onSelectKendraForOrder,
  selectedKendraId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [activeSahayaks, setActiveSahayaks] = useState<DistrictSahayak[]>(INITIAL_DISTRICT_SAHAYAKS);

  const states = Array.from(new Set(activeSahayaks.map((s) => s.state)));
  const allDialects = Array.from(new Set(activeSahayaks.flatMap((s) => s.languagesSpoken)));

  const filteredSahayaks = activeSahayaks.filter((s) => {
    const matchesSearch =
      s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tehsilBlock.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kendraAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.languagesSpoken.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesState = selectedState === 'all' || s.state === selectedState;
    const matchesLang =
      selectedLanguageFilter === 'all' || s.languagesSpoken.includes(selectedLanguageFilter);

    return matchesSearch && matchesState && matchesLang;
  });

  const handleSpeakKendraDetails = (kendra: DistrictSahayak) => {
    const text = `आपके जिले ${kendra.district} में अधिकृत कृषि सहायक ${kendra.name} हैं। इनका केंद्र ${kendra.kendraAddress} में है। संपर्क नंबर ${kendra.phone} है। यदि आप पढ़ना-लिखना नहीं जानते, तो आप सीधे इनके केंद्र पर जाकर या फोन करके असली बीज व खाद मंगवा सकते हैं।`;
    speechService.speak(text, 'hi');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 border border-emerald-500/40 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Dedicated Offline Village Help for Illiterate & Rural Farmers</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            District Krishi Sahayak & Village Seva Kendra Directory
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Can't read, write, or order on a smartphone? Visit your district's authorized <strong>Krishi Mitra Kendra</strong> in person. Our certified representative speaks your local dialect, inspects genuine seed bags, scans holograms, and places certified orders for you at zero extra markup.
          </p>

          {/* 2% Commission Transparency Badge */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Official 2% Facilitation Commission Credited to Village Kendra</span>
            </div>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 text-xs">
              Every Kendra representative is licensed under Seeds Act 1966 & Fertilizer Control Order.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by District (e.g. Yavatmal, Varanasi, Ludhiana, Pune)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All States ({states.length})</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedLanguageFilter}
              onChange={(e) => setSelectedLanguageFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Spoken Dialects</option>
              {allDialects.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredSahayaks.length}</strong> certified district kendras ready for walk-in visits
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Authorized & Certified Personnel
          </span>
        </div>
      </div>

      {/* Kendras Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSahayaks.map((sahayak) => {
          const isSelected = selectedKendraId === sahayak.id;

          return (
            <div
              key={sahayak.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500 shadow-lg'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Card Top / Header */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {sahayak.district}, {sahayak.state}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active on duty" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {sahayak.name}
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      {sahayak.role}
                    </p>
                  </div>

                  {/* Audio Read-out for Illiterate Farmers */}
                  <button
                    onClick={() => handleSpeakKendraDetails(sahayak)}
                    title="आवाज में सुनें (Listen in voice)"
                    className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs cursor-pointer transition-transform active:scale-95 shrink-0"
                    aria-label="Listen details in voice"
                  >
                    <Volume2 className="w-4 h-4 text-amber-800" />
                  </button>
                </div>

                {/* License & Verification Badge */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Govt License #</span>
                    <span className="font-mono font-bold text-slate-800">{sahayak.licenseNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assisted Orders</span>
                    <span className="font-mono font-bold text-emerald-700">{sahayak.ordersFacilitated}+ Farmers</span>
                  </div>
                </div>

                {/* Physical Walk-In Address */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Physical Walk-In Kendra Address:</span>
                  </span>
                  <p className="text-slate-800 font-semibold pl-4">
                    {sahayak.kendraAddress}
                  </p>
                  <p className="text-slate-500 text-[11px] pl-4 italic">
                    Landmark: {sahayak.landmark} (Tehsil: {sahayak.tehsilBlock})
                  </p>
                </div>

                {/* Spoken Dialects */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                    Spoken Dialects (Farmers can speak comfortably):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sahayak.languagesSpoken.map((lang, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-900 text-[11px] font-bold"
                      >
                        🗣️ {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assisted Services Offered */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                    Services for Walk-in Farmers:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {sahayak.assistedServices.slice(0, 3).map((srv, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer: Direct Contact & Order Attribution */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${sahayak.phone.replace(/\s+/g, '')}`}
                    className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Kendra</span>
                  </a>

                  <a
                    href={`https://wa.me/${sahayak.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Namaste ${sahayak.name} ji, I am a farmer from ${sahayak.district}. I need help with authentic seed and fertilizer verification.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {onSelectKendraForOrder && (
                  <button
                    onClick={() => onSelectKendraForOrder(sahayak)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {isSelected
                      ? '✓ Selected as My Facilitator (2% Commission Attributed)'
                      : `Select ${sahayak.name} for My Order (2% Sahayak Fee)`}
                  </button>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Facilitator Commission: <strong>2.0%</strong></span>
                  <span className="font-mono text-emerald-700 font-bold">UPI: {sahayak.upiId || 'Verified'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanatory Village Guide Box */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
            <span>🌾 Want to become a certified District Krishi Sahayak for your village?</span>
          </h4>
          <p className="text-xs text-amber-900 leading-relaxed max-w-3xl">
            Village youth, cooperative workers, and educated farmers can apply to become an authorized Power Ventures Kendra point-of-contact. Help local farmers fight counterfeit inputs and earn a statutory <strong>2% Field Commission</strong> on all certified farm orders you process.
          </p>
        </div>
        <div className="shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs inline-block shadow-xs">
            Direct Admin Enrollment Active
          </span>
        </div>
      </div>
    </section>
  );
};
