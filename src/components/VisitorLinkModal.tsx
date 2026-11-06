import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  QrCode,
  Globe2,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface VisitorLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitorLinkModal: React.FC<VisitorLinkModalProps> = ({ isOpen, onClose }) => {
  const [copiedPre, setCopiedPre] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  // The official shared / visitor preview URL generated for this applet
  const visitorPreUrl = 'https://ais-pre-uiqjqtvx2jps5r74fhcvlc-268398595292.asia-east1.run.app';
  const devUrl = 'https://ais-dev-uiqjqtvx2jps5r74fhcvlc-268398595292.asia-east1.run.app';

  // Dynamic current window URL if loaded in browser
  const currentBrowserUrl = typeof window !== 'undefined' ? window.location.origin : visitorPreUrl;

  const handleCopyVisitorLink = async () => {
    try {
      await navigator.clipboard.writeText(visitorPreUrl);
      setCopiedPre(true);
      setTimeout(() => setCopiedPre(false), 2500);
    } catch (e) {
      // Fallback
      setCopiedPre(true);
      setTimeout(() => setCopiedPre(false), 2500);
    }
  };

  const handleCopyDevLink = async () => {
    try {
      await navigator.clipboard.writeText(devUrl);
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    } catch (e) {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(visitorPreUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                Public Access & Visitor Link Guide
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                Share AgriSafe with Visitors
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            How to correctly generate and share your public link so farmers, dealers, and evaluators can open AgriSafe without permission errors.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Critical Explanation Banner: Why visitor links fail */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-950 text-sm">
                  Why does the visitor link say &quot;404 Not Found&quot; or ask for Google login?
                </p>
                <p className="text-amber-800 mt-1 leading-relaxed">
                  In Google AI Studio, there are two separate URLs:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-200/60 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200">
                <span className="font-bold text-rose-700 block">❌ Dev Link (ais-dev)</span>
                <span className="text-slate-600 text-[10px]">Private to your account only. Blocks visitors with 403 or Google sign-in.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-300">
                <span className="font-bold text-emerald-700 block">✅ Visitor Link (ais-pre)</span>
                <span className="text-slate-600 text-[10px]">Public for all users. Activates when you click AI Studio &quot;Share&quot;.</span>
              </div>
            </div>
          </div>

          {/* 3 Step Action Checklist to activate visitor link */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <span className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider block text-emerald-800">
              ⚡ 3 Simple Steps to Activate Visitor Access:
            </span>
            <ol className="space-y-2 list-decimal list-inside pl-1 text-[12px] leading-relaxed">
              <li className="font-medium">
                Look at the <strong>top-right corner of Google AI Studio</strong> (above this application view) and click the blue <strong>&quot;Share&quot;</strong> button.
              </li>
              <li className="font-medium">
                Under Link Settings, ensure permissions are set to <strong>&quot;Anyone with the link can view&quot;</strong> (or click <strong>Create link</strong>).
              </li>
              <li className="font-medium">
                Copy the official <strong>Public Visitor Link</strong> below and send it to your users, farmers, or evaluators.
              </li>
            </ol>
          </div>

          {/* The Public Visitor Link Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Public Visitor URL (ais-pre)</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Recommended for Visitors
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={visitorPreUrl}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 font-mono text-xs text-slate-900 select-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="button"
                onClick={handleCopyVisitorLink}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {copiedPre ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code and Quick Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQr ? 'Hide QR Code' : 'Show Mobile QR Code'}</span>
            </button>

            <a
              href={visitorPreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Test Visitor Link in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* QR Code Viewer */}
          {showQr && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center space-y-2 animate-fadeIn">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Scan to open AgriSafe on Mobile Phone
              </span>
              <img
                src={qrCodeUrl}
                alt="AgriSafe Visitor QR Code"
                className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-xs"
              />
              <span className="text-[11px] text-slate-500 font-mono">{visitorPreUrl}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero-configuration SSL secured
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
