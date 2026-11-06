import React from 'react';
import { ShieldCheck, PhoneCall, ExternalLink, Mic, ShieldAlert, Share2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { assistantTranslations } from '../data/assistantTranslations';

interface FooterProps {
  language: Language;
  onNavigate: (section: string) => void;
  onOpenAiAssistant?: () => void;
  onOpenAdminSupport?: () => void;
  onOpenAdminAccess?: () => void;
  onOpenVisitorLink?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onNavigate,
  onOpenAiAssistant,
  onOpenAdminSupport,
  onOpenAdminAccess,
  onOpenVisitorLink,
}) => {
  const t = translations[language];
  const ui = assistantTranslations[language] || assistantTranslations['en'];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <img
                src="/images/agrisafe_logo.jpeg"
                onError={(e) => {
                  e.currentTarget.src = '/assets/aistudio/WhatsApp_Image_2026-11-05_at_4.30.52_PM_245dea67.jpeg';
                }}
                alt="Power Ventures Logo"
                className="h-10 w-auto object-contain rounded-lg border border-slate-700 bg-white p-0.5"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight leading-tight">
                  AgriSafe
                </span>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                  by Power Ventures
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Intelligent Agricultural Input Authenticity, Multilingual Voice AI & Certified Marketplace Hub by Power Ventures. Protecting farmers with statutory seed lot validation, CIBRC compliance, and agronomic support.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {onOpenVisitorLink && (
                <button
                  onClick={onOpenVisitorLink}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-600/60 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Visitor Link</span>
                </button>
              )}
              {onOpenAiAssistant && (
                <button
                  onClick={onOpenAiAssistant}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-700/60 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{ui.kisanAiBtn}</span>
                </button>
              )}
              {onOpenAdminSupport && (
                <button
                  onClick={onOpenAdminSupport}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-[11px] flex items-center gap-1.5 border border-rose-800/60 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{ui.adminSupportBtn}</span>
                </button>
              )}
            </div>
          </div>

          {/* Col 2: Core Platform Modules */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('verify')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  seedtrace.gov.in Batch Verification
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compatibility')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Chemical Compatibility & Tank-Mix Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dosage-calculator')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-amber-300 font-semibold"
                >
                  Fertilizer & Pesticide Dosage Calculator (NPK & Pump)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Subsidized Certified Seed & Input Market
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('helpline')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Kisan Call Centre & State Quality Control
                </button>
              </li>
              {onOpenAdminSupport && (
                <li>
                  <button
                    onClick={onOpenAdminSupport}
                    className="hover:text-rose-400 font-semibold transition-colors cursor-pointer text-rose-300"
                  >
                    {ui.tabTicketForm}
                  </button>
                </li>
              )}
              {onOpenAdminAccess && (
                <li>
                  <button
                    onClick={onOpenAdminAccess}
                    className="hover:text-emerald-400 transition-colors cursor-pointer text-slate-400 flex items-center gap-1.5 pt-1"
                  >
                    <span>Administrative Console (Authorized Officers)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Official Government Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              National Government Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://seedtrace.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>SeedTrace India Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://cibrc.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Central Insecticides Board (CIBRC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://agricoop.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Ministry of Agriculture & Farmers Welfare</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://icar.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Indian Council of Agricultural Research (ICAR)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Farmer Support & Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Power Ventures Helpline
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
              <span className="text-[11px] text-amber-300 font-bold block">Company Toll-Free Hotline:</span>
              <a
                href="tel:9538484475"
                className="text-lg font-black font-mono text-amber-400 hover:text-amber-300 block tracking-tight"
              >
                95384-84475
              </a>
              <span className="text-[10px] text-slate-400 block">
                Direct Agricultural Support & Spurious Input Redressal
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Kisan Call Centre (Govt 24x7):</span>
              <a
                href="tel:18001801551"
                className="text-sm font-bold font-mono text-emerald-400 hover:text-emerald-300 block"
              >
                1800-180-1551
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Report Counterfeit: vigilance-agri@gov.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            © 2026 AgriSafe by Power Ventures · Integrated with seedtrace.gov.in & CIBRC Central Registry
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Quality Certification Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
