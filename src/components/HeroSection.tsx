import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Lock, FileCheck, Calculator } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

export type RequestApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

interface HeroSectionProps {
  language: Language;
  onVerifyClick: () => void;
  onMarketplaceClick: () => void;
  onDosageCalculatorClick?: () => void;
  initialApprovalStatus?: RequestApprovalStatus;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  onVerifyClick,
  onMarketplaceClick,
  onDosageCalculatorClick,
  initialApprovalStatus = 'Pending'
}) => {
  const [approvalStatus, setApprovalStatus] = useState<RequestApprovalStatus>(initialApprovalStatus);
  const t = translations[language];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Mission, Headings & Direct CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Trust Kicker & Governance pill */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-800/80 border border-emerald-600/60 text-emerald-200 text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{t.heroBadge}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900/80 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Admin Governance Protocol Active · 100% Quality & Docket Verification</span>
              </div>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4 text-balance">
              {t.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl mb-8">
              {t.heroSubtitle}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={onVerifyClick}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
              >
                <span>{t.heroVerifyCta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onMarketplaceClick}
                className="px-6 py-3.5 bg-emerald-800/70 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg border border-emerald-500/50 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.heroExploreCta}
              </button>

              {onDosageCalculatorClick && (
                <button
                  onClick={onDosageCalculatorClick}
                  className="px-5 py-3.5 bg-emerald-950/90 hover:bg-emerald-900 text-amber-300 font-bold text-sm rounded-lg border border-amber-400/50 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>{t.navDosageCalculator || 'Dosage Calculator'}</span>
                </button>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-800/60 text-xs text-emerald-200/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Statutory Seed Act 1966 Lot Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>CIBRC Anti-Counterfeit Database</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>NABL Lab Tested Certified Lots</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Anchor with Trust Card Overlay */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-700/50 shadow-2xl bg-slate-950 group">
              <img
                src="/images/hero_agrisafe_banner_1793873618161.jpg"
                onError={(e) => {
                  e.currentTarget.src = '/images/product_crop_shield_1793873618659.jpg';
                }}
                alt="Indian Agronomist inspecting certified crop field with digital verification station"
                className="w-full h-80 lg:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Verified Dispatch Seal Card Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                      approvalStatus === 'Approved'
                        ? 'bg-emerald-400'
                        : approvalStatus === 'Pending'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-rose-500'
                    }`} />
                    <span
                      onClick={() => {
                        setApprovalStatus((prev) => (prev === 'Pending' ? 'Approved' : prev === 'Approved' ? 'Rejected' : 'Pending'));
                      }}
                      role="status"
                      title="Approval Status: Click to cycle through Pending, Approved, and Rejected states"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide cursor-pointer transition-all duration-300 select-none border shadow-xs ${
                        approvalStatus === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                          : approvalStatus === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                      }`}
                    >
                      {approvalStatus === 'Pending' && '⏳ Status: Pending'}
                      {approvalStatus === 'Approved' && '✓ Status: Approved'}
                      {approvalStatus === 'Rejected' && '✕ Status: Rejected'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    SEEDTRACE™ VERIFIED
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {approvalStatus === 'Pending' && 'Grievance / order submitted. Awaiting authorized admin validation before dispatch.'}
                    {approvalStatus === 'Approved' && 'Authorized by Power Ventures Admin. Transmitted to SeedTrace / CIBRC national database.'}
                    {approvalStatus === 'Rejected' && 'Rejected by administrator during quality review. Barred from dispatch and government transmission.'}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {(['Pending', 'Approved', 'Rejected'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setApprovalStatus(st)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          approvalStatus === st
                            ? st === 'Approved'
                              ? 'bg-emerald-600 text-white'
                              : st === 'Pending'
                              ? 'bg-amber-500 text-slate-950 font-extrabold'
                              : 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Trust Strip */}
        <div className="mt-12 pt-8 border-t border-emerald-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
            <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
              1,420,000+
            </div>
            <div className="text-xs text-emerald-200 mt-1 font-medium">
              {t.statVerifiedBatches}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums">
              380,000+
            </div>
            <div className="text-xs text-emerald-200 mt-1 font-medium">
              {t.statFarmersProtected}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
            <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
              99.98%
            </div>
            <div className="text-xs text-emerald-200 mt-1 font-medium">
              {t.statSeedTraceUptime}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums">
              100%
            </div>
            <div className="text-xs text-emerald-200 mt-1 font-medium">
              {t.statLabAccuracy}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
