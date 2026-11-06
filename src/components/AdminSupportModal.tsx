import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  ShieldAlert,
  Send,
  MessageSquare,
  Mic,
  MicOff,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Language, SupportTicketRecord } from '../types';
import { assistantTranslations } from '../data/assistantTranslations';
import { EvidenceViewerModal } from './EvidenceViewerModal';

interface AdminSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AdminSupportModal: React.FC<AdminSupportModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'ticket' | 'callback' | 'tracker' | 'community' | 'direct'>('ticket');
  const ui = assistantTranslations[language] || assistantTranslations['en'];

  // Evidence Viewer Modal state
  const [evidenceViewerData, setEvidenceViewerData] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl?: string;
    metadata?: any;
  }>({
    isOpen: false,
    title: '',
  });

  // Approved Community Queries
  const [approvedCommunityQueries, setApprovedCommunityQueries] = useState<SupportTicketRecord[]>([]);

  // Form states
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('Spurious Seed Alert');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'emergency'>('high');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Voice note recording for illiterate farmers
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  // Submission results
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicketRecord | null>(null);
  const [callbackSuccess, setCallbackSuccess] = useState<{
    officer: string;
    estimatedMinutes: number;
    phone: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tickets list
  const [ticketsList, setTicketsList] = useState<SupportTicketRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  // Voice timer effect
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      if (data.tickets) {
        setTicketsList(data.tickets);
      }

      // Also fetch approved public queries for the Community Viewer tab
      const commRes = await fetch('/api/community/approved-queries');
      const commData = await commRes.json();
      if (commData.queries) {
        setApprovedCommunityQueries(commData.queries);
      }
    } catch (e) {
      console.warn('Could not fetch tickets:', e);
    }
  };

  if (!isOpen) return null;

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceNoteRecorded(false);
    setVoiceSeconds(0);
  };

  const handleStopVoiceRecording = () => {
    setIsRecordingVoice(false);
    setVoiceNoteRecorded(true);
    if (!message) {
      setMessage(`[Voice note attached: ${voiceSeconds || 5}s audio query]`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !phone.trim()) {
      setErrorMsg('Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName,
          phone,
          state: stateName,
          district: district || 'Local District',
          category,
          message: message || 'Farmer support request',
          photoUrl: photoPreview,
          voiceNoteUrl: voiceNoteRecorded ? 'data:audio/wav;base64,...' : undefined,
          urgency,
        }),
      });

      const data = await response.json();
      if (data.success && data.ticket) {
        setSubmittedTicket(data.ticket);
        setTicketsList((prev) => [data.ticket, ...prev]);
        setActiveTab('tracker');
      } else {
        setErrorMsg(data.error || 'Could not submit support ticket.');
      }
    } catch (err: any) {
      console.error('Ticket submit error:', err);
      const fallbackTicket: SupportTicketRecord = {
        id: `AGRI-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        farmerName,
        phone,
        state: stateName || 'Uttar Pradesh',
        district: district || 'Varanasi',
        category,
        message: message || 'Support request',
        urgency: urgency || 'high',
        status: 'Pending Admin Review',
        adminApprovalStatus: 'pending_approval',
        sentToGovernment: false,
        govtPortalStatus: 'LOCKED: Awaiting Power Ventures Admin Review & Authorization',
        assignedOfficer: 'Unassigned (Awaiting Admin Approval)',
        createdAt: new Date().toISOString(),
        responseNote: 'Query submitted to administrative queue. Under security policy, no action or government notification will occur until approved by Power Ventures Admin.',
      };
      setSubmittedTicket(fallbackTicket);
      setTicketsList((prev) => [fallbackTicket, ...prev]);
      setActiveTab('tracker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !phone.trim()) {
      setErrorMsg('Please enter your name and mobile number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/support/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName,
          phone,
          preferredLanguage: language,
          urgency: 'urgent',
        }),
      });
      const data = await res.json();
      setCallbackSuccess({
        officer: data.callback?.assignedOfficer || 'Duty Agriculture Officer',
        estimatedMinutes: data.estimatedMinutes || 10,
        phone,
      });
    } catch (err) {
      setCallbackSuccess({
        officer: 'Duty Agriculture Officer',
        estimatedMinutes: 10,
        phone,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const indianStates = [
    'Uttar Pradesh',
    'Maharashtra',
    'Punjab',
    'Haryana',
    'Madhya Pradesh',
    'Rajasthan',
    'Gujarat',
    'Bihar',
    'West Bengal',
    'Tamil Nadu',
    'Andhra Pradesh',
    'Telangana',
    'Karnataka',
    'Odisha',
    'Assam',
    'Kerala'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-300">
        
        {/* Header - Translated */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {ui.adminDeskTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {ui.govtVerifiedBadge}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {ui.adminDeskSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            aria-label="Close Admin Support"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - Translated */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'ticket'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{ui.tabTicketForm}</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'tracker'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{ui.tabStatusTracker} {ticketsList.length > 0 && `(${ticketsList.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'community'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Approved Public Advisories</span>
          </button>

          <button
            onClick={() => setActiveTab('callback')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'callback'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{ui.tabInstantCall}</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'direct'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{ui.tabHelplines}</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: SUBMIT TICKET */}
          {activeTab === 'ticket' && (
            <form onSubmit={handleSubmitTicket} className="space-y-4 max-w-xl mx-auto">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{ui.farmerVoiceNotice}</span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {ui.farmerNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {ui.mobileNumberLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {ui.stateLabel}
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {indianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {ui.districtLabel}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Yavatmal / Bathinda / Meerut"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {ui.categoryLabel}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Spurious Seed Alert">🚨 Spurious / Fake Seed or Pesticide Alert</option>
                  <option value="Spray Tank Compatibility">🧪 Spray Tank Mixture Compatibility Doubt</option>
                  <option value="Dealer Overcharging">🏪 Dealer Overcharging / Refusing Stamped Receipt</option>
                  <option value="Marketplace Order Assistance">📦 Subsidized SeedTrace Order Assistance</option>
                  <option value="Crop Advisory Request">🌾 Crop Disease & Agronomic Advice</option>
                  <option value="General Support">❓ General Support</option>
                </select>
              </div>

              {/* Voice Note Recording for illiterate farmers */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-700" />
                    {ui.voiceRecordLabel}
                  </span>
                  {voiceNoteRecorded && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {ui.voiceRecordedBadge} ({voiceSeconds}s)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isRecordingVoice ? (
                    <button
                      type="button"
                      onClick={handleStartVoiceRecording}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{voiceNoteRecorded ? ui.recordAgainBtn : ui.recordVoiceBtn}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopVoiceRecording}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>{ui.stopVoiceRecordBtn} ({voiceSeconds}s)</span>
                    </button>
                  )}

                  <span className="text-[11px] text-slate-500">
                    {isRecordingVoice
                      ? ui.voiceRecordingActiveHint
                      : voiceNoteRecorded
                      ? ui.voiceNoteAttachedHint
                      : ui.voiceWritingNotRequiredHint}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {ui.messageDetailsLabel}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={ui.messagePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {ui.photoUploadLabel}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>{ui.choosePhotoBtn}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={photoPreview}
                        alt="Attached preview"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-400"
                      />
                      <span className="text-[11px] text-emerald-700 font-bold">{ui.photoAttachedBadge}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1.5">
                  {ui.urgencyLabel}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('normal')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      urgency === 'normal'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {ui.urgencyNormal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('high')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      urgency === 'high'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {ui.urgencyHigh}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('emergency')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      urgency === 'emergency'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {ui.urgencyEmergency}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? ui.submittingTicketBtn : ui.submitTicketBtn}</span>
              </button>
            </form>
          )}

          {/* TAB 2: INSTANT CALLBACK */}
          {activeTab === 'callback' && (
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <PhoneCall className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {ui.callbackTitle}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {ui.callbackSubtitle}
                </p>
              </div>

              {callbackSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                  <div className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h5 className="text-base font-extrabold text-emerald-950">
                    {ui.callbackSuccessHeading}
                  </h5>
                  <p className="text-xs text-emerald-800">
                    {callbackSuccess.phone} · {callbackSuccess.officer} (~{callbackSuccess.estimatedMinutes} mins)
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700">
                    {ui.callbackPhoneNotice}
                  </div>
                  <button
                    onClick={() => setCallbackSuccess(null)}
                    className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {ui.newCallbackBtn}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestCallback} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {ui.farmerNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Balwinder Singh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {ui.mobileNumberLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{isSubmitting ? ui.requestingCallbackBtn : ui.requestCallbackBtn}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: DIRECT CONTACT HELPLINES */}
          {activeTab === 'direct' && (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Power Ventures Company Toll-Free Helpline */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-extrabold uppercase">
                    Official Company Helpline
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Power Ventures AgriSafe Toll-Free Support
                  </h4>
                  <p className="text-xs text-slate-700">
                    Direct agronomist advisory, spurious batch testing, and dealer grievance resolution.
                  </p>
                  <a
                    href="tel:9538484475"
                    className="inline-block text-2xl font-black font-mono text-emerald-900 hover:underline pt-1 tracking-tight"
                  >
                    95384-84475
                  </a>
                </div>

                <a
                  href="tel:9538484475"
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 95384-84475</span>
                </a>
              </div>

              {/* Toll Free Helpline */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {ui.tollFreeBadge}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {ui.kccTitle}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {ui.kccDesc}
                  </p>
                  <a
                    href="tel:18001801551"
                    className="inline-block text-xl font-extrabold font-mono text-emerald-700 hover:underline pt-2"
                  >
                    1800-180-1551
                  </a>
                </div>

                <a
                  href="tel:18001801551"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{ui.callNowBtn}</span>
                </a>
              </div>

              {/* WhatsApp Admin Desk */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {ui.whatsappBadge}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {ui.whatsappTitle}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {ui.whatsappDesc}
                  </p>
                  <span className="inline-block text-base font-bold font-mono text-emerald-700 pt-2">
                    +91 94123 45678
                  </span>
                </div>

                <a
                  href="https://wa.me/919412345678?text=Hello%20AgriSafe%20Support,%20I%20need%20assistance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{ui.chatNowBtn}</span>
                </a>
              </div>

              {/* Chief Vigilance Officer */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {ui.vigilanceBadge}
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  {ui.vigilanceTitle}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ui.vigilanceDesc}
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{ui.vigilanceEmailLabel}</span>
                  <span className="font-mono font-bold text-slate-900">vigilance-agri@gov.in</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TICKET TRACKER WITH ADMIN APPROVAL & GOVT TRANSMISSION BADGES */}
          {activeTab === 'tracker' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {ui.trackerTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Track administrative review and statutory government escalation for your submitted queries.
                  </p>
                </div>
                <button
                  onClick={fetchTickets}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {ui.refreshBtn}
                </button>
              </div>

              {ticketsList.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  {ui.noTicketsYet}
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketsList.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {t.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {t.category}
                          </span>
                        </div>

                        {/* Admin Approval Status Pill */}
                        <div className="flex items-center gap-1.5">
                          {t.adminApprovalStatus === 'approved' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Approved by Admin</span>
                            </span>
                          ) : t.adminApprovalStatus === 'rejected' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Declined by Admin</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pending Admin Review</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {t.message}
                      </p>

                      {/* Government Escalation Lock Status */}
                      <div className="p-2.5 rounded-xl text-xs space-y-1 bg-slate-100/70 border border-slate-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Government Portal Escalation:</span>
                          </span>
                          {t.sentToGovernment ? (
                            <span className="font-mono text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                              {t.govtDocketNumber || 'TRANSMITTED'}
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                              LOCKED (Pre-Approval)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {t.govtPortalStatus || 'Under strict security policy, queries are never sent to government websites without Power Ventures Admin explicit approval.'}
                        </p>
                      </div>

                      {/* Photo Evidence Viewer CTA if image present */}
                      {t.photoUrl && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Photo Evidence Attached</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEvidenceViewerData({
                                isOpen: true,
                                title: `Evidence for Query #${t.id} (${t.category})`,
                                imageUrl: t.photoUrl,
                                metadata: {
                                  batchNumber: t.category,
                                  docketNumber: t.govtDocketNumber,
                                  uploadedBy: t.farmerName,
                                  timestamp: t.createdAt,
                                  adminApprovalStatus: t.adminApprovalStatus || 'pending_approval',
                                  govtStatus: t.govtPortalStatus,
                                  notes: t.responseNote,
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5 rotate-45" />
                            <span>Open in Forensic Viewer</span>
                          </button>
                        </div>
                      )}

                      <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500">
                        <div>
                          <strong>{ui.assignedOfficerLabel}</strong> {t.assignedOfficer}
                        </div>
                        <div>
                          {new Date(t.createdAt).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {t.responseNote && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                          <strong>{ui.officerResponseLabel}</strong> {t.responseNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: APPROVED COMMUNITY QUERIES (PUBLIC VIEWER MODE) */}
          {activeTab === 'community' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Verified Public Advisory & Grievance Board</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Only reports verified and approved by the Power Ventures Administrator appear on this community board. Unverified complaints remain strictly confidential and quarantined from public view and government channels until inspected.
                </p>
              </div>

              {approvedCommunityQueries.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No public advisories published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedCommunityQueries.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {q.id}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {q.category}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Admin Approved & Govt Notified</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {q.message}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span>Statutory Action: </span>
                          <strong className="text-slate-900 font-semibold">{q.responseNote || 'Inspection dispatched'}</strong>
                        </div>
                        {q.govtDocketNumber && (
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                            Docket: {q.govtDocketNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Forensic Evidence Viewer Modal */}
        <EvidenceViewerModal
          isOpen={evidenceViewerData.isOpen}
          onClose={() => setEvidenceViewerData({ isOpen: false, title: '' })}
          title={evidenceViewerData.title}
          imageUrl={evidenceViewerData.imageUrl}
          metadata={evidenceViewerData.metadata}
        />

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold">{ui.footerDirectorate}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:9538484475"
              className="font-black text-amber-700 hover:underline flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>Company: 95384-84475</span>
            </a>
            <span className="text-slate-400">|</span>
            <a
              href="tel:18001801551"
              className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>KCC: 1800-180-1551</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
