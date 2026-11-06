import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  FileText,
  Clock,
  FlaskConical,
  Sprout,
  TrendingUp,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  User,
  PlusCircle,
  X
} from 'lucide-react';
import { Language, HarvestTraceabilityLot } from '../types';
import { HARVEST_TRACEABILITY_LOTS } from '../data/moduleData';

interface TraceabilityDashboardProps {
  language: Language;
  onNavigateToVerifyBatch?: (batchNo: string) => void;
}

export const TraceabilityDashboard: React.FC<TraceabilityDashboardProps> = ({
  language,
  onNavigateToVerifyBatch
}) => {
  const [selectedLotId, setSelectedLotId] = useState<string>('HRV-COT-2026-902');
  const [viewMode, setViewMode] = useState<'processor' | 'consumer'>('processor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lab' | 'ledger'>('overview');

  // New Harvest Registration Form State
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newCropName, setNewCropName] = useState('Cotton');
  const [newSeedBatch, setNewSeedBatch] = useState('BT-COT-2026-8841');
  const [newAcreage, setNewAcreage] = useState('5.0');
  const [newYield, setNewYield] = useState('36.0');
  const [newDistrict, setNewDistrict] = useState('Yavatmal');
  const [lotsList, setLotsList] = useState<HarvestTraceabilityLot[]>(HARVEST_TRACEABILITY_LOTS);

  const currentLot =
    lotsList.find((lot) => lot.lotId.toLowerCase() === selectedLotId.toLowerCase()) ||
    lotsList[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = lotsList.find(
      (l) =>
        l.lotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.cropName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedLotId(found.lotId);
    }
  };

  const handleRegisterHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: HarvestTraceabilityLot = {
      lotId: `HRV-${newCropName.slice(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
      qrPayload: `https://seedtrace.gov.in/verify/harvest?lot=HRV-NEW-${Date.now()}`,
      blockchainHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      farmerName: newFarmerName || 'Shri Devendra Patil',
      farmerAadhaarMasked: 'XXXX-XXXX-9912',
      fpoName: `${newDistrict} Kisan FPO Producer Co.`,
      farmLocation: {
        village: 'Gram Panchayat Central',
        taluka: newDistrict,
        district: newDistrict,
        state: 'Maharashtra',
        khasraNumber: 'Gat No. 88/2',
        geoCoordinates: '19.8912° N, 77.2109° E'
      },
      cropName: newCropName,
      variety: 'Certified Commercial Grade',
      seedBatchUsed: newSeedBatch || 'BT-COT-2026-8841',
      seedTraceRegisterId: `ST-GOV-IN-LOT-${Math.floor(100000 + Math.random() * 900000)}`,
      acreageCultivated: parseFloat(newAcreage) || 5.0,
      harvestDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      harvestQuantityQuintals: parseFloat(newYield) || 40.0,
      soilHealthCardNumber: `SHC-${newDistrict.slice(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      chemicalLedger: [
        {
          stage: 'Basal Soil Nutrition',
          dateApplied: '10-06-2026',
          productName: 'IFFCO Nano Urea Plus',
          batchNumber: 'NANO-UREA-IF772',
          category: 'Fertilizer',
          cibrcRegId: 'FCO/GJ/CENTRAL/2021/0082',
          doseApplied: '500 ml / acre',
          phiDaysRequired: 0,
          phiObservedDays: 140,
          isCompliant: true
        }
      ],
      nablLabReport: {
        labName: 'Central Regional NABL Quality Testing Lab',
        nablCertNumber: `NABL-TC-${Math.floor(1000 + Math.random() * 9000)}`,
        reportDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        sampleId: `SMPL-${Date.now().toString().slice(-6)}`,
        geneticPurityPercent: 99.4,
        moisturePercent: 8.5,
        pesticideResidueStatus: 'Below Detection Limit (BDL)',
        aflatoxinPpb: 0.6,
        heavyMetalsStatus: 'Not Detected / Safe',
        exportGradeCertified: true
      },
      processorVerified: true,
      mandiGatePassIssued: true,
      status: 'Certified Export Grade'
    };

    setLotsList([newLot, ...lotsList]);
    setSelectedLotId(newLot.lotId);
    setIsRegisterModalOpen(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
              <QrCode className="w-4 h-4" />
              <span>Full-Cycle Seed-to-Harvest Traceability Passport</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Direct Farmer-to-Processor Traceability
            </h1>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-2 leading-relaxed">
              Extending the SeedTrace batch verification loop to harvested agricultural output. Cryptographic QR codes for food processors, millers, and export buyers validating seed origin, NABL lab tests, and MRL residue compliance.
            </p>
          </div>

          {/* Action: Register New Harvest Lot */}
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>Register Harvest Lot</span>
          </button>
        </div>
      </div>

      {/* Lot Selector & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Quick Lot Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Recent Lots:
          </span>
          {lotsList.map((lot) => (
            <button
              key={lot.lotId}
              onClick={() => setSelectedLotId(lot.lotId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedLotId === lot.lotId
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lot.lotId} ({lot.cropName.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lot ID or farmer..."
              className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            Find
          </button>
        </form>
      </div>

      {/* Main Lot Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Lot Header Ribbon */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-extrabold text-xs border border-emerald-400/30">
                {currentLot.lotId}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                ★ {currentLot.status}
              </span>
              {currentLot.mandiGatePassIssued && (
                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-300 text-[11px] font-bold">
                  APMC Mandi Gate-Pass Issued
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentLot.cropName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
              Variety: <strong>{currentLot.variety}</strong> | FPO: <strong>{currentLot.fpoName}</strong>
            </p>
          </div>

          {/* View Mode Toggle (Processor vs Consumer) */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15">
            <button
              onClick={() => setViewMode('processor')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'processor'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🏢 Processor / Mandi View
            </button>
            <button
              onClick={() => setViewMode('consumer')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'consumer'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🍽️ Consumer Farm-to-Fork
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Origin & Cultivation Overview
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'lab'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            NABL Lab Certificate & Residue (MRL)
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Agro-Chemical Application Ledger ({currentLot.chemicalLedger.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Provenance Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Farmer & Land Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>Producer Identity</span>
                  </div>
                  <div className="text-slate-600">
                    Farmer Name: <strong className="text-slate-900">{currentLot.farmerName}</strong>
                  </div>
                  <div className="text-slate-600">
                    Aadhaar (DBT Linked): <strong className="text-slate-900">{currentLot.farmerAadhaarMasked}</strong>
                  </div>
                  <div className="text-slate-600">
                    Soil Health Card: <code className="text-emerald-700 font-mono font-bold">{currentLot.soilHealthCardNumber}</code>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Farm Location & Plot</span>
                  </div>
                  <div className="text-slate-600">
                    Village: <strong className="text-slate-900">{currentLot.farmLocation.village}</strong>
                  </div>
                  <div className="text-slate-600">
                    District / State: <strong className="text-slate-900">{currentLot.farmLocation.district}, {currentLot.farmLocation.state}</strong>
                  </div>
                  <div className="text-slate-600">
                    Survey / Khasra: <strong className="text-slate-900">{currentLot.farmLocation.khasraNumber}</strong>
                  </div>
                  <div className="text-slate-600">
                    GPS Coordinates: <code className="text-slate-700 font-mono">{currentLot.farmLocation.geoCoordinates}</code>
                  </div>
                </div>
              </div>

              {/* Seed Origin Loopback */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-2 text-sm">
                    <Sprout className="w-4 h-4 text-emerald-700" />
                    <span>Official SeedTrace Certified Input Linkage</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    Cryptographically Linked
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  This harvest was cultivated using certified seed batch{' '}
                  <strong className="text-slate-900 font-mono">{currentLot.seedBatchUsed}</strong>, authenticated in the national SeedTrace database under registration number{' '}
                  <strong className="text-slate-900 font-mono">{currentLot.seedTraceRegisterId}</strong>.
                </p>
                {onNavigateToVerifyBatch && (
                  <button
                    onClick={() => onNavigateToVerifyBatch(currentLot.seedBatchUsed)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <span>Inspect Original Seed Batch Lab Report</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Harvest Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Harvest Date</span>
                  <span className="text-sm font-extrabold text-slate-900">{currentLot.harvestDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Acreage</span>
                  <span className="text-sm font-extrabold text-slate-900">{currentLot.acreageCultivated} Acres</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Yield Output</span>
                  <span className="text-sm font-extrabold text-emerald-700">{currentLot.harvestQuantityQuintals} Qtl</span>
                </div>
              </div>
            </div>

            {/* Right Col: QR Code & Cryptographic Stamp */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-mono font-bold">
                {currentLot.lotId}
              </span>

              {/* Dynamic SVG QR Code */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-sm relative group">
                <svg
                  className="w-40 h-40"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="26" height="26" rx="3" stroke="#064e3b" strokeWidth="4" />
                  <rect x="12" y="12" width="12" height="12" fill="#064e3b" />
                  <rect x="69" y="5" width="26" height="26" rx="3" stroke="#064e3b" strokeWidth="4" />
                  <rect x="76" y="12" width="12" height="12" fill="#064e3b" />
                  <rect x="5" y="69" width="26" height="26" rx="3" stroke="#064e3b" strokeWidth="4" />
                  <rect x="12" y="76" width="12" height="12" fill="#064e3b" />
                  {/* Timing & Data Matrix elements */}
                  <rect x="36" y="8" width="4" height="4" fill="#0f172a" />
                  <rect x="44" y="8" width="4" height="4" fill="#0f172a" />
                  <rect x="52" y="8" width="4" height="4" fill="#0f172a" />
                  <rect x="60" y="8" width="4" height="4" fill="#0f172a" />
                  <rect x="8" y="36" width="4" height="4" fill="#0f172a" />
                  <rect x="8" y="44" width="4" height="4" fill="#0f172a" />
                  <rect x="8" y="52" width="4" height="4" fill="#0f172a" />
                  <rect x="8" y="60" width="4" height="4" fill="#0f172a" />
                  {/* Central SeedTrace icon */}
                  <circle cx="50" cy="50" r="14" fill="#047857" />
                  <path d="M46 50L49 53L55 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Random cryptographic QR modules */}
                  <rect x="36" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="58" y="36" width="6" height="6" fill="#0f172a" />
                  <rect x="36" y="58" width="6" height="6" fill="#0f172a" />
                  <rect x="58" y="58" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="68" y="48" width="6" height="6" fill="#0f172a" />
                  <rect x="76" y="76" width="6" height="6" fill="#0f172a" />
                  <rect x="84" y="68" width="6" height="6" fill="#0f172a" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-extrabold text-slate-900">
                  {viewMode === 'processor' ? 'Buyer / Mandi Verification QR' : 'Farm-to-Fork Consumer Story'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
                  <span className="font-semibold text-slate-700">Digital Registry ID:</span>
                  <span>{currentLot.seedTraceRegisterId}</span>
                </div>
              </div>

              <div className="w-full pt-3 border-t border-slate-200 flex flex-col gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Mandi Quality Passport</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: NABL Lab Certificate & Residue Status */}
        {activeTab === 'lab' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-teal-400 font-extrabold uppercase tracking-wider block">
                  National Accreditation Board for Testing and Calibration Laboratories (NABL)
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {currentLot.nablLabReport.labName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accreditation Certificate: <strong className="text-white font-mono">{currentLot.nablLabReport.nablCertNumber}</strong> | Sample ID: <strong className="text-white font-mono">{currentLot.nablLabReport.sampleId}</strong>
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold text-center">
                Report Date: {currentLot.nablLabReport.reportDate}
              </div>
            </div>

            {/* Test Results Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Genetic Purity</span>
                <span className="text-2xl font-black text-emerald-900">{currentLot.nablLabReport.geneticPurityPercent}%</span>
                <span className="text-[10px] text-emerald-700 block mt-1">DNA Fingerprinting Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Moisture Content</span>
                <span className="text-2xl font-black text-blue-900">{currentLot.nablLabReport.moisturePercent}%</span>
                <span className="text-[10px] text-blue-700 block mt-1">Safe for Long Storage (&lt;12%)</span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Pesticide Residue (MRL)</span>
                <span className="text-sm font-black text-teal-900 block mt-1.5">{currentLot.nablLabReport.pesticideResidueStatus}</span>
                <span className="text-[10px] text-teal-700 block mt-1">100% EU & FSSAI Compliant</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Heavy Metals & Toxins</span>
                <span className="text-sm font-black text-amber-900 block mt-1.5">{currentLot.nablLabReport.heavyMetalsStatus}</span>
                <span className="text-[10px] text-amber-700 block mt-1">Aflatoxin: {currentLot.nablLabReport.aflatoxinPpb} ppb (Limit &lt;10)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>Statutory Certification Note:</strong> This harvest batch has undergone Gas Chromatography-Mass Spectrometry (GC-MS) and High-Performance Liquid Chromatography (HPLC) testing in accordance with ISO/IEC 17025 standards. All agro-chemical residues are verified below the Maximum Residue Limit (MRL).
            </div>
          </div>
        )}

        {/* Tab 3: Agro-Chemical Application Ledger */}
        {activeTab === 'ledger' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Complete Field Chemical & Fertilizer Treatment Timeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All farm inputs cross-validated with CIBRC statutory withholding periods (PHI).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                100% PHI Withholding Compliance
              </span>
            </div>

            <div className="space-y-3">
              {currentLot.chemicalLedger.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {item.stage}
                      </span>
                      <span className="text-xs text-slate-500">Applied on {item.dateApplied}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {item.productName}
                    </div>
                    <div className="text-xs text-slate-600">
                      Batch: <code className="font-mono text-emerald-700 font-bold">{item.batchNumber}</code> | Dose: {item.doseApplied}
                    </div>
                  </div>

                  <div className="text-right sm:text-right text-xs">
                    <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Compliant</span>
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Statutory PHI: {item.phiDaysRequired} days | Observed: <strong>{item.phiObservedDays} days</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Harvest Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-700" />
                <span>Register Harvested Crop Output Lot</span>
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterHarvest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Shinde"
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Crop Name</label>
                  <select
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                  >
                    <option value="Cotton">Cotton (Bt Hybrid)</option>
                    <option value="Paddy">Paddy / Basmati</option>
                    <option value="Wheat">Wheat (Rabi)</option>
                    <option value="Chilli">Dry Red Chilli</option>
                    <option value="Soybean">Soybean (Yellow)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                  >
                    <option value="Yavatmal">Yavatmal (MH)</option>
                    <option value="Ludhiana">Ludhiana (PB)</option>
                    <option value="Varanasi">Varanasi (UP)</option>
                    <option value="Guntur">Guntur (AP)</option>
                    <option value="Pune">Pune (MH)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cultivated Acres</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAcreage}
                    onChange={(e) => setNewAcreage(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Yield (Quintals)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newYield}
                    onChange={(e) => setNewYield(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Seed Batch Used (SeedTrace Verified)</label>
                <input
                  type="text"
                  value={newSeedBatch}
                  onChange={(e) => setNewSeedBatch(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-800"
                  placeholder="e.g. BT-COT-2026-8841"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md mt-4"
              >
                Generate Cryptographic Harvest Passport
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
