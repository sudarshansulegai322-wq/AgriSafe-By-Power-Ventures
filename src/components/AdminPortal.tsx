import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  PhoneCall,
  Clock,
  ArrowLeft,
  LogOut,
  User,
  Building2,
  Activity,
  Layers,
  FileText,
  Volume2,
  Camera,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Award,
  Zap,
  Trash2,
  ShoppingBag,
  Truck,
  Check,
  Ban,
  PackageCheck,
  Eye,
  HeartHandshake,
  MapPin,
  Wallet
} from 'lucide-react';
import { EvidenceViewerModal } from './EvidenceViewerModal';
import { DistrictSahayak } from '../types';
import { INITIAL_DISTRICT_SAHAYAKS } from '../data/districtSahayaks';

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  organization: string;
  token: string;
  lastLogin: string;
  permissions: string[];
}

interface AdminBatch {
  batchNumber: string;
  productName: string;
  category: 'Seed' | 'Fertilizer' | 'Pesticide' | 'Bio-stimulant';
  manufacturer: string;
  mfgLicense: string;
  seedTraceRegisterId: string;
  mfgDate: string;
  expiryDate: string;
  status: 'genuine' | 'counterfeit' | 'expired' | 'blacklisted';
  testingLab: string;
  purityRate: string;
  notes: string;
  flaggedReason?: string;
  flaggedBy?: string;
  updatedAt: string;
}

interface SupportTicket {
  id: string;
  farmerName: string;
  phone: string;
  state: string;
  district: string;
  category: string;
  message: string;
  voiceNoteUrl?: string;
  photoUrl?: string;
  urgency: 'normal' | 'high' | 'emergency';
  status: 'Pending Admin Review' | 'Approved by Admin' | 'Assigned to Agro Officer' | 'In Progress' | 'Resolved' | 'Rejected';
  adminApprovalStatus: 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  sentToGovernment: boolean;
  govtPortalStatus: string;
  govtDocketNumber?: string;
  assignedOfficer: string;
  createdAt: string;
  responseNote?: string;
  adminNotes?: string;
}

interface AdminOrder {
  orderId: string;
  items: Array<{
    product: {
      id: string;
      title: string;
      brand: string;
      category: string;
      price: number;
      batchNumber: string;
      packageSize: string;
      vendorName: string;
    };
    quantity: number;
  }>;
  subtotal: number;
  subsidyDiscount: number;
  commissionFee?: number;
  commissionRate?: number;
  vendorPayout?: number;
  deliveryPartner: {
    id: string;
    name: string;
    cost: number;
    estimatedDays: string;
  };
  total: number;
  farmerName: string;
  phone: string;
  villageAddress: string;
  pincode: string;
  paymentMethod: string;
  paymentRefId?: string;
  seedTraceCertificateId: string;
  timestamp: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'dispatched';
  adminApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface CallbackRequest {
  id: string;
  farmerName: string;
  phone: string;
  preferredLanguage: string;
  urgency: string;
  requestedAt: string;
  status: 'Pending' | 'Officer Calling' | 'Completed';
  assignedOfficer: string;
  officerNotes?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

interface AdminPortalProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onExitToFarmerView: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  adminUser,
  onLogout,
  onExitToFarmerView,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tickets' | 'batches' | 'callbacks' | 'audit'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Evidence Viewer Modal State
  const [evidenceViewerData, setEvidenceViewerData] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl?: string;
    metadata?: any;
  }>({
    isOpen: false,
    title: '',
  });

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [rejectOrderModal, setRejectOrderModal] = useState<AdminOrder | null>(null);
  const [orderRejectReason, setOrderRejectReason] = useState('');

  // Ticket status & search filter
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');

  // Filters
  const [batchSearch, setBatchSearch] = useState('');
  const [batchStatusFilter, setBatchStatusFilter] = useState('all');
  const [batchCategoryFilter, setBatchCategoryFilter] = useState('all');

  // Modal: Add Batch
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({
    batchNumber: '',
    productName: '',
    category: 'Seed' as any,
    manufacturer: '',
    mfgLicense: '',
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-06-30',
    testingLab: 'State Seed Testing Laboratory, Pune',
    purityRate: '99.2%',
    notes: 'Certified lot authorized by Directorate of Agriculture.',
    status: 'genuine' as any,
  });

  // Modal: Flag Batch as Counterfeit
  const [flagModalBatch, setFlagModalBatch] = useState<AdminBatch | null>(null);
  const [flagReason, setFlagReason] = useState('');

  // Selected Ticket for Details/Action
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketActionNote, setTicketActionNote] = useState('');

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setTickets(data.recentTickets || []);
        setCallbacks(data.recentCallbacks || []);
        setAuditLogs(data.recentAuditLogs || []);
      }
    } catch (e) {
      console.warn('Could not fetch admin overview', e);
    }
  };

  const fetchBatches = async () => {
    try {
      const params = new URLSearchParams();
      if (batchStatusFilter !== 'all') params.set('status', batchStatusFilter);
      if (batchCategoryFilter !== 'all') params.set('category', batchCategoryFilter);
      if (batchSearch) params.set('search', batchSearch);

      const res = await fetch(`/api/admin/batches?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (e) {
      console.warn('Could not fetch batches', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'all') params.set('status', orderStatusFilter);
      if (orderSearch) params.set('search', orderSearch);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.warn('Could not fetch admin orders', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Could not fetch audit logs', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchOverview(), fetchBatches(), fetchOrders(), fetchAuditLogs()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'batches') {
      fetchBatches();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, batchStatusFilter, batchCategoryFilter, batchSearch, orderStatusFilter, orderSearch]);

  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorEmail: adminUser.email }),
      });
      if (res.ok) {
        fetchOrders();
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to approve order', e);
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, actorEmail: adminUser.email }),
      });
      if (res.ok) {
        setRejectOrderModal(null);
        setOrderRejectReason('');
        fetchOrders();
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to reject order', e);
    }
  };

  const handleApproveTicket = async (ticketId: string, assignedOfficer?: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedOfficer: assignedOfficer || selectedTicket?.assignedOfficer || 'Dr. V. K. Deshmukh',
          adminNotes: adminNotes || 'Approved by Power Ventures administrator.',
          actorEmail: adminUser.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to approve ticket', e);
    }
  };

  const handleRejectTicket = async (ticketId: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || 'Dismissed following administrative review',
          actorEmail: adminUser.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to reject ticket', e);
    }
  };

  const handleEscalateTicketGov = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}/escalate-gov`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governmentTarget: 'Ministry of Agriculture & Farmers Welfare (DAC&FW) and CIBRC Enforcement Unit',
          actorEmail: adminUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Cannot escalate to government portal without Admin Approval.');
        return;
      }
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(data.ticket);
      }
      fetchOverview();
    } catch (e) {
      console.error('Failed to escalate ticket to government', e);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchForm.batchNumber || !newBatchForm.productName || !newBatchForm.manufacturer) return;

    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBatchForm,
          actorEmail: adminUser.email,
        }),
      });

      if (res.ok) {
        setIsAddBatchOpen(false);
        fetchBatches();
        fetchOverview();
        setNewBatchForm({
          batchNumber: '',
          productName: '',
          category: 'Seed',
          manufacturer: '',
          mfgLicense: '',
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: '2028-06-30',
          testingLab: 'State Seed Testing Laboratory, Pune',
          purityRate: '99.2%',
          notes: 'Certified lot authorized by Directorate of Agriculture.',
          status: 'genuine',
        });
      }
    } catch (e) {
      console.error('Failed to create batch', e);
    }
  };

  const handleUpdateBatchStatus = async (batchNumber: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/batches/${encodeURIComponent(batchNumber)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason,
          actorEmail: adminUser.email,
        }),
      });

      if (res.ok) {
        setFlagModalBatch(null);
        setFlagReason('');
        fetchBatches();
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to update batch status', e);
    }
  };

  const handleDeleteBatch = async (batchNumber: string) => {
    if (!confirm(`Are you sure you want to archive batch ${batchNumber}?`)) return;
    try {
      await fetch(`/api/admin/batches/${encodeURIComponent(batchNumber)}`, {
        method: 'DELETE',
      });
      fetchBatches();
      fetchOverview();
    } catch (e) {
      console.error('Failed to delete batch', e);
    }
  };

  const handleUpdateTicket = async (ticketId: string, status: string, assignedOfficer?: string, responseNote?: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedOfficer,
          responseNote,
          actorEmail: adminUser.email,
        }),
      });

      if (res.ok) {
        setSelectedTicket(null);
        setTicketActionNote('');
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to update ticket', e);
    }
  };

  const handleCompleteCallback = async (callbackId: string) => {
    try {
      await fetch(`/api/admin/callbacks/${encodeURIComponent(callbackId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          officerNotes: `Completed by ${adminUser.name} on ${new Date().toLocaleTimeString()}`,
        }),
      });
      fetchOverview();
    } catch (e) {
      console.error('Failed to update callback', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Administration Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Admin Identity */}
            <div className="flex items-center gap-3">
              <img
                src="/images/agrisafe_logo.jpeg"
                onError={(e) => {
                  e.currentTarget.src = '/assets/aistudio/WhatsApp_Image_2026-11-05_at_4.30.52_PM_245dea67.jpeg';
                }}
                alt="Power Ventures Official Logo"
                className="h-10 w-auto rounded-lg border border-slate-700 bg-white/5 p-0.5 object-contain"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white leading-tight">
                    AgriSafe Admin Console
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Power Ventures
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  Central SeedTrace & CIBRC Enforcement Unit · Authenticated Session
                </span>
              </div>
            </div>

            {/* Right: User Profile & View Switcher */}
            <div className="flex items-center gap-3">
              {/* Admin User Card */}
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {adminUser.name.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {adminUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    {adminUser.role}
                  </span>
                </div>
              </div>

              {/* Exit to Public Farmer View */}
              <button
                onClick={onExitToFarmerView}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Switch to public farmer-facing portal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Farmer Portal</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors cursor-pointer"
                title="Logout of admin session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto py-2.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview & KPIs</span>
            </button>

            {/* TAB: ORDERS APPROVAL & DISPATCH */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Input Orders & Approvals</span>
              {metrics?.pendingOrders > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 animate-pulse">
                  {metrics.pendingOrders} Needs Approval
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
                  {orders.length}
                </span>
              )}
            </button>

            {/* TAB: QUERIES & GRIEVANCES APPROVAL */}
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'tickets'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Queries & Govt Escalation</span>
              {metrics?.pendingApprovalQueries > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                  {metrics.pendingApprovalQueries} Pending Review
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'batches'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch & Counterfeit Registry</span>
              {metrics && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {metrics.totalBatches}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('callbacks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'callbacks'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Callbacks Queue</span>
              {callbacks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {callbacks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ================= TAB 1: OVERVIEW & KPIS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Power Ventures 3% Platform Commission & Revenue Stream Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/40 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    Power Ventures Platform Revenue Stream
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active 3.0% Commission Take-Rate
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  3% Quality Assurance & Anti-Counterfeit Platform Commission
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Earned automatically on all certified agricultural inputs ordered via AgriSafe. Covers physical lot sampling, NABL testing verification, and statutory SeedTrace national registry indexing.
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/70 px-5 py-3 rounded-xl border border-slate-800 shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Commission Earned</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    ₹{(metrics?.totalPlatformCommissionEarned !== undefined ? metrics.totalPlatformCommissionEarned : 146).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-400/80 block">From approved dispatches</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">In Approval Queue</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                    ₹{(metrics?.pendingPlatformCommission !== undefined ? metrics.pendingPlatformCommission : 117).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-amber-400/80 block">Pending order review</span>
                </div>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Live Verifications</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {metrics?.totalVerifications?.toLocaleString() || '14,820'}
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <TrendingUp className="w-3 h-3" /> +142 scans in last 24h
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Fake Batches Flagged</span>
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                  {metrics?.counterfeitBatches || 1}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  100% blocked from farmer purchase
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Emergency Grievances</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                  {metrics?.emergencyTickets || 1}
                </div>
                <span className="text-[11px] text-amber-400/80 block mt-1">
                  Inspection teams dispatched
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Certified Registry Batches</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {metrics?.genuineBatches || 5}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  SeedTrace & CIBRC Central sync
                </span>
              </div>
            </div>

            {/* Middle Grid: Active Threats & Emergency Alert Dispatch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Emergency Alert Card */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/50 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-base font-extrabold text-white">
                      Active Counterfeit Seizure & Legal Raid Action
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    FIR Dispatched
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-300 font-bold">BATCH # CF-FAKE-9920</span>
                    <span className="text-slate-400">Mandi: Aurangabad & Yavatmal</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    SUSPECT COUNTERFEIT: Chlorpyrifos 20% EC Imitation (Kerosene Solvent Adulterant)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Joint raid executed under Section 29 of the Insecticides Act 1968. Counterfeit hologram and unauthorized packager identified. Any farmer scanning this QR code automatically receives a high-contrast danger alert and the direct emergency DAO contact.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span>Officer in Charge: Dr. V. K. Deshmukh</span>
                    <span className="text-emerald-400 font-semibold">Central Database Synchronized</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab('batches')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Inspect Registry Batches</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-xs font-bold text-rose-200 border border-rose-700/60 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Review Farmer Grievances</span>
                  </button>
                </div>
              </div>

              {/* System & Power Ventures Status */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
                    Power Ventures Security Grid
                  </h3>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">SeedTrace Central Gateway</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live (22ms)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">CIBRC National Registry</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> 21,980 Lots
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Kisan AI Knowledge Cache</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> 10 Languages
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">DAO Vigilance Officers</span>
                    <span className="text-white font-mono font-bold">14 On Duty</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 space-y-1">
                  <span className="font-bold block">Administrator Authority:</span>
                  <span>Full read/write permissions to modify verification results, revoke counterfeit batches, and dispatch officers.</span>
                </div>
              </div>
            </div>

            {/* Recent Farmer Grievances Stream */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">
                    Recent Incoming Farmer Grievances & Fake Product Reports
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="text-xs text-emerald-400 hover:underline font-bold"
                >
                  View All ({tickets.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300">{t.id}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs font-bold text-white">{t.farmerName}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-[11px] text-slate-400">{t.district}, {t.state}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            t.urgency === 'emergency'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {t.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{t.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                        {t.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setActiveTab('tickets');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                      >
                        Triage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BATCH & COUNTERFEIT REGISTRY ================= */}
        {activeTab === 'batches' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Central Seed & Chemical Batch Registry
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage certified inputs, revoke counterfeit lots, and add new verified batches to the national database.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={fetchBatches}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                  title="Refresh registry"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAddBatchOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Batch</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  placeholder="Search batch #, product name, or company..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div>
                <select
                  value={batchStatusFilter}
                  onChange={(e) => setBatchStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs text-slate-300 cursor-pointer"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="genuine">Genuine / Certified</option>
                  <option value="counterfeit">Counterfeit / Fake</option>
                  <option value="expired">Expired Lots</option>
                  <option value="blacklisted">Blacklisted Vendors</option>
                </select>
              </div>

              <div>
                <select
                  value={batchCategoryFilter}
                  onChange={(e) => setBatchCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs text-slate-300 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Seed">Seeds</option>
                  <option value="Fertilizer">Fertilizers</option>
                  <option value="Pesticide">Pesticides / Fungicides</option>
                  <option value="Bio-stimulant">Bio-stimulants</option>
                </select>
              </div>
            </div>

            {/* Batches Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Batch # & Category</th>
                      <th className="py-3 px-4">Product & Manufacturer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Validity</th>
                      <th className="py-3 px-4">Quality Lab Assay</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No batches found matching your search.
                        </td>
                      </tr>
                    ) : (
                      batches.map((b) => (
                        <tr key={b.batchNumber} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-white block">
                              {b.batchNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{b.category}</span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="font-bold text-white block line-clamp-1">
                              {b.productName}
                            </span>
                            <span className="text-[11px] text-slate-400 block line-clamp-1">
                              {b.manufacturer}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                b.status === 'genuine'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : b.status === 'counterfeit'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {b.status === 'genuine' && <ShieldCheck className="w-3 h-3" />}
                              {b.status === 'counterfeit' && <AlertOctagon className="w-3 h-3" />}
                              {b.status === 'expired' && <Clock className="w-3 h-3" />}
                              <span>{b.status}</span>
                            </span>
                            {b.flaggedReason && (
                              <span className="text-[9px] text-rose-400 block mt-0.5 max-w-xs truncate" title={b.flaggedReason}>
                                {b.flaggedReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] text-slate-300 block">Exp: {b.expiryDate}</span>
                            <span className="text-[10px] text-slate-500 block">Mfg: {b.mfgDate}</span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="text-[11px] font-mono text-emerald-300 block">{b.purityRate}</span>
                            <span className="text-[10px] text-slate-400 block truncate" title={b.testingLab}>
                              {b.testingLab}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === 'genuine' ? (
                                <button
                                  onClick={() => setFlagModalBatch(b)}
                                  className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-500/40 cursor-pointer"
                                  title="Flag this batch as counterfeit (will warn farmers instantly)"
                                >
                                  Flag Fake
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateBatchStatus(b.batchNumber, 'genuine', 'Re-certified after laboratory audit')}
                                  className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 cursor-pointer"
                                  title="Mark as genuine certified lot"
                                >
                                  Mark Genuine
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBatch(b.batchNumber)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                                title="Archive batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS APPROVAL & DISPATCH ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">
                    Certified Input Orders & Admin Approval Desk
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Statutory Compliance Queue
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify genuine seed lots, subsidized price limits, and authorize warehouse dispatch. Orders are quarantined from dispatch until approved.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={fetchOrders}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                  title="Refresh orders"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* KPI Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Approval</span>
                <span className="text-xl font-mono font-black text-amber-300 block">
                  {orders.filter((o) => o.status === 'pending_approval').length}
                </span>
                <span className="text-[10px] text-amber-400/80">Requires admin authorization</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Approved Orders</span>
                <span className="text-xl font-mono font-black text-emerald-400 block">
                  {orders.filter((o) => o.status === 'approved').length}
                </span>
                <span className="text-[10px] text-emerald-400/80">Dispatched & Certified</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                <span className="text-xl font-mono font-black text-white block">
                  {orders.length}
                </span>
                <span className="text-[10px] text-slate-400">All channels</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Volume</span>
                <span className="text-xl font-mono font-black text-emerald-300 block">
                  ₹{orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">Approved GMV</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40">
                <span className="text-[10px] font-bold text-amber-300 uppercase">Power Ventures 3% Fee</span>
                <span className="text-xl font-mono font-black text-emerald-400 block">
                  ₹{orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + (o.commissionFee || Math.round(o.subtotal * 0.03)), 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400/80">3% platform commission</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, farmer name, mobile or village..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending_approval', label: 'Pending Approval' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'rejected', label: 'Rejected' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      orderStatusFilter === st.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
                  No orders found matching this filter.
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.orderId}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md space-y-4 transition-all"
                  >
                    {/* Top Order Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-extrabold text-white">{o.orderId}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-xs text-slate-400">{o.timestamp}</span>
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">
                            Farmer: <strong className="text-white">{o.farmerName}</strong> ({o.phone}) · {o.villageAddress}, PIN: {o.pincode}
                          </div>
                        </div>
                      </div>

                      {/* Status & Immediate Action */}
                      <div className="flex items-center gap-2">
                        {o.status === 'pending_approval' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>Awaiting Admin Approval</span>
                            </span>
                            <button
                              onClick={() => handleApproveOrder(o.orderId)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Order</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectOrderModal(o);
                                setOrderRejectReason('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : o.status === 'approved' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>Approved & Dispatch Authorized</span>
                            </span>
                            {o.approvedBy && (
                              <span className="text-[10px] text-slate-400 hidden md:inline">
                                By: {o.approvedBy}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Rejected: {o.rejectionReason || 'Declined by Admin'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      <div className="md:col-span-8 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                          Certified Inputs in Lot
                        </span>
                        <div className="space-y-1.5">
                          {o.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-white block">{it.product.title}</span>
                                <span className="text-[11px] text-slate-400 block font-mono">
                                  Lot Batch: <strong className="text-amber-300">{it.product.batchNumber}</strong> · Pack: {it.product.packageSize}
                                </span>
                              </div>
                              <div className="text-right font-mono">
                                <span className="text-white font-bold block">{it.quantity} × ₹{it.product.price}</span>
                                <span className="text-[10px] text-emerald-400 font-semibold block">₹{it.quantity * it.product.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financials & Carrier */}
                      <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                            Billing & Carrier
                          </span>
                          <div className="flex justify-between text-slate-400">
                            <span>Subtotal:</span>
                            <span className="font-mono text-white">₹{o.subtotal}</span>
                          </div>
                          {o.subsidyDiscount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Govt Subsidy:</span>
                              <span className="font-mono">- ₹{o.subsidyDiscount}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-400">
                            <span>Carrier ({o.deliveryPartner.name}):</span>
                            <span className="font-mono">{o.deliveryPartner.cost === 0 ? 'FREE' : `₹${o.deliveryPartner.cost}`}</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-300 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
                            <span className="font-bold text-[11px]">Power Ventures Fee (3%):</span>
                            <span className="font-mono font-extrabold">+ ₹{o.commissionFee || Math.round(o.subtotal * 0.03)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Net Vendor Disbursal:</span>
                            <span className="font-mono text-slate-300">₹{o.vendorPayout || (o.subtotal - (o.commissionFee || Math.round(o.subtotal * 0.03)))}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex justify-between font-extrabold text-white text-sm">
                            <span>Farmer Total Paid:</span>
                            <span className="font-mono text-emerald-300">₹{o.total}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span className="font-mono uppercase font-bold text-slate-200">{o.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between truncate">
                            <span>SeedTrace Seal:</span>
                            <span className="font-mono text-emerald-400 truncate max-w-[140px]">{o.seedTraceCertificateId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: FARMER GRIEVANCES & QUERY APPROVALS ================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">
                    Farmer Grievances & Query Approvals Desk
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Strict Admin Gate
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect incoming queries. Under security rules, nothing is sent to government portals or published without your explicit approval.
                </p>
              </div>
              <button
                onClick={fetchOverview}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tickets List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedTicket?.id === t.id
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-300">{t.id}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-xs font-bold text-white">{t.farmerName}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[11px] text-slate-400">{t.district}, {t.state}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{t.category}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {t.message}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Admin Approval Pill */}
                        {t.adminApprovalStatus === 'approved' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Approved
                          </span>
                        ) : t.adminApprovalStatus === 'rejected' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Declined
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 font-bold animate-pulse">
                            Needs Approval
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            t.urgency === 'emergency'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {t.urgency}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-slate-300">{t.phone}</span>
                        </span>
                        {t.photoUrl && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Photo Evidence</span>
                          </span>
                        )}
                        {t.sentToGovernment && (
                          <span className="flex items-center gap-1 text-amber-300 font-mono text-[10px]">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{t.govtDocketNumber}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ticket Details & Action Panel (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 h-fit sticky top-24">
                {selectedTicket ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-amber-300 font-bold block">
                          {selectedTicket.id}
                        </span>
                        <h3 className="text-sm font-extrabold text-white">
                          Grievance Decision Center
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedTicket.adminApprovalStatus === 'approved' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Approved by Admin
                          </span>
                        ) : selectedTicket.adminApprovalStatus === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 font-bold animate-pulse">
                            Pending Your Approval
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MANDATORY ADMIN APPROVAL DECISION BOX */}
                    {selectedTicket.adminApprovalStatus === 'pending_approval' ? (
                      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2.5">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-200">
                            <strong className="block font-bold">Admin Permission Required:</strong>
                            Under security rules, this query has NOT been sent to government databases or field officers. You must approve it before any downstream actions occur.
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleApproveTicket(selectedTicket.id, selectedTicket.assignedOfficer, ticketActionNote)}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Query</span>
                          </button>
                          <button
                            onClick={() => handleRejectTicket(selectedTicket.id, ticketActionNote || 'Rejected as unverified query')}
                            className="py-2.5 px-3 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Reject / Dismiss</span>
                          </button>
                        </div>
                      </div>
                    ) : selectedTicket.adminApprovalStatus === 'approved' ? (
                      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
                        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Approved by Admin ({selectedTicket.approvedBy || adminUser.name})</span>
                        </div>

                        {/* Government Portal Escalation Box */}
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Government Portal Status:</span>
                            {selectedTicket.sentToGovernment ? (
                              <span className="font-mono text-[10px] text-amber-300 font-extrabold bg-amber-400/20 px-2 py-0.5 rounded">
                                {selectedTicket.govtDocketNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-bold">Awaiting Transmission</span>
                            )}
                          </div>

                          {!selectedTicket.sentToGovernment ? (
                            <button
                              onClick={() => handleEscalateTicketGov(selectedTicket.id)}
                              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Authorize & Transmit to Govt Website (CIBRC / DAC&FW)</span>
                            </button>
                          ) : (
                            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Transmitted to National Agricultural Portal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                        Query declined by administrator. Blocked from government transmission.
                      </div>
                    )}

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Farmer Contact</span>
                        <span className="font-bold text-white block">{selectedTicket.farmerName}</span>
                        <span className="font-mono text-slate-300 block">{selectedTicket.phone}</span>
                        <span className="text-slate-400 block">{selectedTicket.district}, {selectedTicket.state}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Category</span>
                        <span className="font-bold text-amber-300">{selectedTicket.category}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">Farmer Statement</span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {selectedTicket.message}
                        </p>
                      </div>

                      {/* Photo Evidence with Forensic Viewer Launch */}
                      {selectedTicket.photoUrl && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-400 font-bold">Uploaded Photo Evidence</span>
                            <button
                              onClick={() =>
                                setEvidenceViewerData({
                                  isOpen: true,
                                  title: `Forensic Evidence: Query #${selectedTicket.id}`,
                                  imageUrl: selectedTicket.photoUrl,
                                  metadata: {
                                    batchNumber: selectedTicket.category,
                                    docketNumber: selectedTicket.govtDocketNumber,
                                    uploadedBy: selectedTicket.farmerName,
                                    timestamp: selectedTicket.createdAt,
                                    adminApprovalStatus: selectedTicket.adminApprovalStatus,
                                    govtStatus: selectedTicket.govtPortalStatus,
                                    notes: selectedTicket.responseNote,
                                  },
                                })
                              }
                              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Open in Evidence Viewer</span>
                            </button>
                          </div>
                          <img
                            src={selectedTicket.photoUrl}
                            alt="Uploaded evidence"
                            onClick={() =>
                              setEvidenceViewerData({
                                isOpen: true,
                                title: `Forensic Evidence: Query #${selectedTicket.id}`,
                                imageUrl: selectedTicket.photoUrl,
                                metadata: {
                                  batchNumber: selectedTicket.category,
                                  docketNumber: selectedTicket.govtDocketNumber,
                                  uploadedBy: selectedTicket.farmerName,
                                  timestamp: selectedTicket.createdAt,
                                  adminApprovalStatus: selectedTicket.adminApprovalStatus,
                                  govtStatus: selectedTicket.govtPortalStatus,
                                },
                              })
                            }
                            className="w-full max-h-36 object-cover rounded-lg border border-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">
                          Officer Resolution / Admin Notes
                        </span>
                        <textarea
                          rows={2}
                          value={ticketActionNote}
                          onChange={(e) => setTicketActionNote(e.target.value)}
                          placeholder="Enter administrative directive, lab instruction, or raid note..."
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        disabled={selectedTicket.adminApprovalStatus !== 'approved'}
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'Assigned to Agro Officer', selectedTicket.assignedOfficer, ticketActionNote || 'Dispatched for statutory field inspection')}
                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Dispatch Field Agro Officer
                      </button>
                      <button
                        disabled={selectedTicket.adminApprovalStatus !== 'approved'}
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'Resolved', selectedTicket.assignedOfficer, ticketActionNote || 'Case resolved and verified by district vigilance team.')}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer transition-colors"
                      >
                        Mark Grievance Resolved
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <FileText className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs">Select any query on the left to review farmer statements, inspect evidence in the forensic viewer, approve queries, and authorize government transmissions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CALLBACKS QUEUE ================= */}
        {activeTab === 'callbacks' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Emergency Farmer Callbacks Queue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scheduled phone callbacks requested by rural farmers requiring immediate agronomic assistance.
                </p>
              </div>
              <button
                onClick={fetchOverview}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {callbacks.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No pending callback requests right now.
                </div>
              ) : (
                callbacks.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300">{c.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          c.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-white">{c.farmerName}</h4>
                      <a
                        href={`tel:${c.phone}`}
                        className="text-emerald-400 hover:underline font-mono font-bold text-sm flex items-center gap-1.5 mt-0.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{c.phone}</span>
                      </a>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                      <div className="flex justify-between">
                        <span>Preferred Language:</span>
                        <span className="text-white font-semibold uppercase">{c.preferredLanguage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Officer:</span>
                        <span className="text-slate-300 font-medium truncate max-w-[140px]">{c.assignedOfficer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requested At:</span>
                        <span className="text-slate-400">{new Date(c.requestedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {c.status !== 'Completed' && (
                      <button
                        onClick={() => handleCompleteCallback(c.id)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        Mark Call Completed
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: AUDIT LOGS ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Security & Administrative Audit Logs
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable chronological trail of batch registrations, status revocations, counterfeit flags, and officer dispatches.
                </p>
              </div>
              <button
                onClick={fetchAuditLogs}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          log.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {log.severity === 'critical' ? (
                          <AlertOctagon className="w-4 h-4" />
                        ) : log.severity === 'warning' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{log.action}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[11px] font-mono text-emerald-400">{log.actor}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] text-slate-500 block">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="font-mono text-[9px] text-slate-600 block mt-0.5">{log.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add New Certified Batch */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">
                  Register New Certified Batch
                </h3>
              </div>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={newBatchForm.batchNumber}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batchNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. BT-MAH-2026-9912"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category *</label>
                  <select
                    value={newBatchForm.category}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white cursor-pointer"
                  >
                    <option value="Seed">Certified Seed</option>
                    <option value="Fertilizer">Fertilizer / Nutrient</option>
                    <option value="Pesticide">Pesticide / Fungicide</option>
                    <option value="Bio-stimulant">Bio-stimulant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Product Commercial Name *</label>
                <input
                  type="text"
                  required
                  value={newBatchForm.productName}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, productName: e.target.value })}
                  placeholder="e.g. Mahyco Bollgard II Cotton Seeds"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newBatchForm.manufacturer}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, manufacturer: e.target.value })}
                    placeholder="e.g. Mahyco Seed Co."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Manufacturing License #</label>
                  <input
                    type="text"
                    value={newBatchForm.mfgLicense}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, mfgLicense: e.target.value })}
                    placeholder="e.g. MH/SEED/2022/4119"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={newBatchForm.mfgDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, mfgDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newBatchForm.expiryDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Testing Laboratory</label>
                  <input
                    type="text"
                    value={newBatchForm.testingLab}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, testingLab: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assayed Purity / Quality</label>
                  <input
                    type="text"
                    value={newBatchForm.purityRate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, purityRate: e.target.value })}
                    placeholder="99.2% Genetic Purity"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer shadow-md"
                >
                  Save to National Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Flag Batch as Counterfeit / Fake */}
      {flagModalBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-white">
                Flag Batch as Counterfeit
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Flagging batch <span className="font-mono font-bold text-amber-300">{flagModalBatch.batchNumber}</span> will instantly trigger a <strong className="text-rose-400">RED FRAUD ALERT</strong> across the entire national portal. Farmers scanning this QR code will be warned not to spray or plant.
            </p>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-400 font-bold">Reason for Seizure / Alert *</label>
              <textarea
                rows={3}
                required
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="e.g. Police raid in Mandi seized adulterated lot containing kerosene solvent impurities..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFlagModalBatch(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateBatchStatus(flagModalBatch.batchNumber, 'counterfeit', flagReason || 'Seized during joint raid by Directorate of Agriculture')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs cursor-pointer shadow-md"
              >
                Confirm Fraud Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Farmer Order */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-900/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <Ban className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-white">
                Decline Input Order #{rejectOrderModal.orderId}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are declining the order placed by <span className="font-bold text-white">{rejectOrderModal.farmerName}</span> ({rejectOrderModal.items.length} items, Total: ₹{rejectOrderModal.total.toLocaleString()}).
              Warehouse dispatch will be aborted and farmer will be notified.
            </p>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-400 font-bold">Reason for Rejection *</label>
              <textarea
                rows={3}
                required
                value={orderRejectReason}
                onChange={(e) => setOrderRejectReason(e.target.value)}
                placeholder="e.g. Subsidy quota exceeded for land parcel / Invalid pin code / Out of certified stock lot..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectOrderModal(null);
                  setOrderRejectReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectOrder(rejectOrderModal.orderId, orderRejectReason || 'Order declined after compliance review.')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs cursor-pointer shadow-md"
              >
                Confirm Order Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forensic Evidence / Document High-Resolution Viewer */}
      <EvidenceViewerModal
        isOpen={evidenceViewerData.isOpen}
        onClose={() => setEvidenceViewerData({ isOpen: false, title: '' })}
        title={evidenceViewerData.title}
        imageUrl={evidenceViewerData.imageUrl}
        metadata={evidenceViewerData.metadata}
      />
    </div>
  );
};
