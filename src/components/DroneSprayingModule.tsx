import React, { useState } from 'react';
import {
  Plane,
  ShieldCheck,
  Award,
  Clock,
  Droplets,
  Zap,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  MapPin
} from 'lucide-react';
import { Language, DroneServiceProvider, DroneBookingDetails } from '../types';
import { DRONE_SERVICE_PROVIDERS } from '../data/moduleData';

interface DroneSprayingModuleProps {
  language: Language;
  onNavigateToCompatibility?: () => void;
  preselectedChemical?: string;
}

export const DroneSprayingModule: React.FC<DroneSprayingModuleProps> = ({
  language,
  onNavigateToCompatibility,
  preselectedChemical
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    DRONE_SERVICE_PROVIDERS[0].id
  );
  const [acreage, setAcreage] = useState<number>(5);
  const [cropType, setCropType] = useState<string>('Cotton');
  const [villageName, setVillageName] = useState<string>('Ner Shindewadi');
  const [pincode, setPincode] = useState<string>('445001');
  const [district, setDistrict] = useState<string>('Yavatmal');
  const [state, setState] = useState<string>('Maharashtra');
  const [preferredSlot, setPreferredSlot] = useState<'early_morning' | 'late_afternoon'>('early_morning');
  const [preferredDate, setPreferredDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedChemical, setSelectedChemical] = useState<string>(
    preselectedChemical || 'Bayer Confidor 200 SL + IFFCO Nano Urea'
  );
  const [farmerName, setFarmerName] = useState<string>('Rameshwar Patil');
  const [phoneNumber, setPhoneNumber] = useState<string>('9822014589');

  const [bookingSuccess, setBookingSuccess] = useState<DroneBookingDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const provider =
    DRONE_SERVICE_PROVIDERS.find((p) => p.id === selectedProviderId) ||
    DRONE_SERVICE_PROVIDERS[0];

  // Precision CIBRC Ultra-Low Volume (ULV) Calculations
  const waterVolumeTotalLiters = acreage * 10; // 10 L / acre
  const chemicalVolumeTotalMl = acreage * 60; // Average 60ml/acre for typical formulation
  const flightMinutesEstimated = Math.ceil(acreage * 7.5);
  const baseCharge = acreage * provider.ratePerAcre;
  const subsidyRebate = Math.round(baseCharge * provider.subsidyRate);
  const netPayable = baseCharge - subsidyRebate;

  // Comparison metrics vs manual spraying
  const manualWaterVolume = acreage * 180; // 180 L / acre manual
  const waterSavedLiters = manualWaterVolume - waterVolumeTotalLiters;

  const handleBookMission = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking: DroneBookingDetails = {
        bookingId: `DRN-SMAM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        farmerName,
        phone: phoneNumber,
        villageName,
        district,
        pincode,
        cropType,
        acreage,
        selectedChemicals: [selectedChemical],
        preferredSlot,
        preferredDate,
        droneProvider: provider,
        waterVolumeTotalLiters,
        chemicalVolumeTotalMl,
        flightMinutesEstimated,
        baseCharge,
        subsidyRebate,
        netPayable,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };

      setBookingSuccess(newBooking);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-300/30 text-teal-300 text-xs font-bold mb-3">
              <Plane className="w-4 h-4" />
              <span>Sub-Mission on Agricultural Mechanization (SMAM) & Namo Drone Didi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Precision Drone Spraying & Custom Hiring Linkage
            </h1>
            <p className="text-teal-100/80 text-sm sm:text-base mt-2 leading-relaxed">
              Book verified DGCA-certified drone pilots and village Custom Hiring Centers (CHCs). Automated CIBRC Ultra-Low Volume (ULV) formulation calculations with 50% central mechanization subsidy.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/15">
            <div className="text-center p-2">
              <div className="text-2xl font-extrabold text-amber-300">90%</div>
              <div className="text-[11px] text-teal-200">Water Conservation</div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl font-extrabold text-amber-300">50%</div>
              <div className="text-[11px] text-teal-200">Govt SMAM Subsidy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Booking Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-emerald-700" />
                <span>Book Precision Agricultural Flight</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate chemical volume and reserve verified pilot slot.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              DGCA Type-Certified Fleet
            </span>
          </div>

          <form onSubmit={handleBookMission} className="space-y-6">
            {/* Step 1: Acreage & Crop */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Select Farm Acreage & Crop</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Acreage Slider & Number */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Land Area (Acres)</label>
                    <span className="text-lg font-extrabold text-emerald-700">{acreage} Acres</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={acreage}
                    onChange={(e) => setAcreage(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 Acre</span>
                    <span>25 Acres</span>
                    <span>50 Acres</span>
                  </div>
                </div>

                {/* Crop Selection */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Crop Type</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Cotton">Cotton (Kharif / Bt Hybrid)</option>
                    <option value="Paddy">Paddy / Basmati Rice</option>
                    <option value="Wheat">Wheat (Rabi Grain)</option>
                    <option value="Chilli">Chilli / Dry Red Peppers</option>
                    <option value="Sugarcane">Sugarcane (Tall Canopy)</option>
                    <option value="Soybean">Soybean (Broad Leaf)</option>
                    <option value="Maize">Maize / Sweet Corn</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Chemical & CIBRC ULV Formulation */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Approved Tank-Mix or Formulation</span>
                </div>
                {onNavigateToCompatibility && (
                  <button
                    type="button"
                    onClick={onNavigateToCompatibility}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Check Compatibility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Spray Chemical / Tank-Mix
                </label>
                <select
                  value={selectedChemical}
                  onChange={(e) => setSelectedChemical(e.target.value)}
                  className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Bayer Confidor 200 SL + IFFCO Nano Urea">
                    Bayer Confidor 200 SL (60 ml/ac) + IFFCO Nano Urea (250 ml/ac) [Safe Mix]
                  </option>
                  <option value="Syngenta Amistar Top (Azoxystrobin + Difenoconazole)">
                    Syngenta Amistar Top Fungal Curative (200 ml/ac) [Certified Drone Recipe]
                  </option>
                  <option value="Coragen (Chlorantraniliprole 18.5% SC)">
                    Coragen Pink Bollworm / Borer Specialist (60 ml/ac)
                  </option>
                  <option value="Spinetoram 11.7% SC (Delegate)">
                    Spinetoram 11.7% SC Thrips Floral Spray (160 ml/ac)
                  </option>
                  <option value="Custom Tank-Mix (Verified in AgriSafe Matrix)">
                    Custom Tank-Mix (Verified in AgriSafe Matrix)
                  </option>
                </select>

                {/* Automated ULV Math Display */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Drone Water Vol</span>
                    <span className="text-sm font-extrabold text-blue-700">{waterVolumeTotalLiters} L</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Chemical Volume</span>
                    <span className="text-sm font-extrabold text-emerald-700">{chemicalVolumeTotalMl} ml</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Est. Flight Time</span>
                    <span className="text-sm font-extrabold text-amber-700">{flightMinutesEstimated} Mins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Verified Drone Provider Selection */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Select DGCA Certified Operator / CHC</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DRONE_SERVICE_PROVIDERS.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {p.hubType}
                        </span>
                        <span className="text-xs font-extrabold text-amber-600">★ {p.rating}</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">{p.operatorName}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        Pilot: <strong>{p.pilotName}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Drone: {p.droneModel} ({p.tankCapacityLiters}L Tank)
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/70 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Missions: {p.completedMissions}</span>
                        <span className="font-extrabold text-emerald-700">₹{p.ratePerAcre} / acre</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Schedule & Farmer Details */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Flight Timing & Village Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Spray Window</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredSlot('early_morning')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        preferredSlot === 'early_morning'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      🌅 Morning (05:30-08:30)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredSlot('late_afternoon')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        preferredSlot === 'late_afternoon'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      🌇 Evening (16:30-19:00)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Farmer Full Name</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Rameshwar Patil"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile (WhatsApp for flight updates)</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="10-digit mobile"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Village & Khasra / Survey No.</label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Ner Gat #142/A"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 445001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Plane className="w-5 h-5 text-amber-300" />
              <span>{isSubmitting ? 'Confirming DGCA Flight Slot...' : `Confirm Drone Booking (Net ₹${netPayable})`}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Cost Breakdown & CIBRC Safety Card */}
        <div className="space-y-6">
          {/* Transparent Cost & Subsidy Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Cost & Subsidy Breakdown</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Flight Charge ({acreage} ac × ₹{provider.ratePerAcre})</span>
                <span className="font-bold text-slate-900">₹{baseCharge}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>SMAM / Drone Didi Subsidy (50%)</span>
                </span>
                <span>- ₹{subsidyRebate}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">Net Farmer Amount</span>
                  <span className="text-[10px] text-slate-500">Pay on farm via UPI / KCC</span>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  ₹{netPayable}
                </div>
              </div>
            </div>

            {/* Environmental Savings */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200/80 text-xs text-blue-900 space-y-2">
              <div className="font-extrabold flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Water & Health Protection</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                By choosing drone spraying, you conserve <strong>{waterSavedLiters} Litres of water</strong> for {acreage} acres and completely avoid manual chemical inhalation and skin contact.
              </p>
            </div>
          </div>

          {/* Pilot Credentials Badge */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
                Assigned Drone Unit
              </span>
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-white text-sm">{provider.operatorName}</div>
              <div className="text-slate-300">
                Remote Pilot: <strong className="text-white">{provider.pilotName}</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                DGCA License: <code className="text-amber-300 font-mono">{provider.pilotLicense}</code>
              </div>
              <div className="text-slate-400 text-[11px]">
                Drone UIN: <code className="text-teal-300 font-mono">{provider.droneUin}</code>
              </div>
              <div className="text-slate-400 text-[11px]">
                Coverage Radius: {provider.serviceRadiusKm} km from {provider.district} Hub
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <a
                href={`tel:${provider.phone}`}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>Call Hub</span>
              </a>
              <a
                href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Booking Confirmed & Dispatched
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Drone Mission Reserved!
              </h3>
              <p className="text-xs text-slate-600">
                Booking ID: <strong className="font-mono text-emerald-800">{bookingSuccess.bookingId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Farmer:</span>
                <strong>{bookingSuccess.farmerName} ({bookingSuccess.phone})</strong>
              </div>
              <div className="flex justify-between">
                <span>Area & Crop:</span>
                <strong>{bookingSuccess.acreage} Acres ({bookingSuccess.cropType})</strong>
              </div>
              <div className="flex justify-between">
                <span>Flight Window:</span>
                <strong>{bookingSuccess.preferredDate} ({bookingSuccess.preferredSlot === 'early_morning' ? 'Morning 05:30-08:30' : 'Evening 16:30-19:00'})</strong>
              </div>
              <div className="flex justify-between">
                <span>Operator:</span>
                <strong>{bookingSuccess.droneProvider.operatorName}</strong>
              </div>
              <div className="flex justify-between text-emerald-800 font-extrabold pt-2 border-t border-slate-200">
                <span>Net Payable (Post-Subsidy):</span>
                <span>₹{bookingSuccess.netPayable}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              An SMS with pilot GPS coordinates and flight checklist has been transmitted to <strong>+91 {bookingSuccess.phone}</strong>.
            </p>

            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md"
            >
              Done & Return to Drone Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
