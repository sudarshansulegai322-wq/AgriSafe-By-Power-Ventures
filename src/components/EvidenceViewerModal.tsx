import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Download,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  Building2,
  Award,
  ExternalLink
} from 'lucide-react';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl?: string;
  documentType?: 'receipt' | 'label_photo' | 'lab_report' | 'seedtrace_certificate';
  metadata?: {
    docketNumber?: string;
    batchNumber?: string;
    uploadedBy?: string;
    timestamp?: string;
    adminApprovalStatus?: 'pending_approval' | 'approved' | 'rejected';
    govtStatus?: string;
    notes?: string;
  };
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  imageUrl,
  documentType = 'label_photo',
  metadata,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white shadow-xl shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white truncate">{title}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                Evidence Viewer
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {metadata?.batchNumber ? `Batch: ${metadata.batchNumber} · ` : ''}
              {metadata?.timestamp ? `Captured: ${new Date(metadata.timestamp).toLocaleDateString()} · ` : ''}
              Statutory Quality Evidence
            </p>
          </div>
        </div>

        {/* Viewer Zoom & Tool Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 w-12 text-center select-none hidden sm:inline">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer hidden sm:flex items-center gap-1"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <div className="h-5 w-px bg-slate-800 mx-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
            title="Close Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Area */}
      <div className="flex-1 my-3 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-auto flex items-center justify-center p-4 relative select-none">
        {imageUrl ? (
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[68vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-slate-800"
              draggable={false}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 space-y-3">
            <FileText className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">No visual attachment available for this record.</p>
            <p className="text-xs text-slate-600">The farmer statement or statutory registry data was submitted in text format.</p>
          </div>
        )}

        {/* Watermark Overlay for Statutory Integrity */}
        <div className="absolute bottom-4 left-4 pointer-events-none opacity-40 text-[10px] font-mono text-slate-400">
          POWER VENTURES · AGRI-SAFE FORENSIC VIEWER · TAMPER-PROOF
        </div>
      </div>

      {/* Bottom Inspection & Metadata Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 shadow-xl shrink-0 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Admin Approval Status */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
              Admin Verification Status
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              {metadata?.adminApprovalStatus === 'approved' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Approved by Admin</span>
                </>
              ) : metadata?.adminApprovalStatus === 'rejected' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">Rejected / Discarded</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-300">Pending Admin Approval</span>
                </>
              )}
            </div>
          </div>

          {/* Government Transmission Status */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
              Government Portal Status
            </span>
            <span className="font-semibold text-slate-200 block truncate" title={metadata?.govtStatus}>
              {metadata?.govtStatus || 'Locked: Awaiting Admin Approval'}
            </span>
          </div>

          {/* Statutory Docket Number */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
              Statutory Docket #
            </span>
            <span className="font-mono font-bold text-amber-300 block">
              {metadata?.docketNumber || 'Unassigned (Pre-Approval)'}
            </span>
          </div>

          {/* Submitter Info */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
              Source Informant
            </span>
            <span className="font-semibold text-slate-200 block truncate">
              {metadata?.uploadedBy || 'Rural Farmer Informant'}
            </span>
          </div>
        </div>

        {metadata?.notes && (
          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
            Inspection notes: {metadata.notes}
          </p>
        )}
      </div>
    </div>
  );
};
