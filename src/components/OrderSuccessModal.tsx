import React from 'react';
import {
  CheckCircle2,
  Award,
  Download,
  Printer,
  X,
  Truck,
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';
import { OrderDetails, Language } from '../types';
import { translations } from '../data/translations';

interface OrderSuccessModalProps {
  order: OrderDetails;
  language: Language;
  onClose: () => void;
  onTrackOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  language,
  onClose,
  onTrackOrder
}) => {
  const t = translations[language];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div className={`p-6 text-white text-center relative ${
          order.status === 'approved' ? 'bg-emerald-800' : 'bg-slate-900 border-b border-slate-800'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 text-amber-300 shadow-lg">
            {order.status === 'approved' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-amber-300 animate-pulse" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2 bg-amber-400/20 text-amber-300 border border-amber-400/40">
            {order.status === 'approved' ? '🟢 Admin Approved & Dispatch Authorized' : '⏳ Queued for Power Ventures Admin Approval'}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {order.status === 'approved' ? 'Order Approved & Certified for Dispatch!' : 'Order Placed & Awaiting Admin Approval'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Order Reference ID: <strong className="text-amber-300">{order.orderId}</strong>
          </p>
        </div>

        {/* 3-Step Admin Approval Stepper */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] mb-1">
                ✓
              </span>
              <span className="font-bold text-slate-800">1. Order Placed</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Payment Logged</span>
            </div>

            <div className="flex flex-col items-center">
              <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] mb-1 ${
                order.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-400 text-slate-950 animate-pulse'
              }`}>
                {order.status === 'approved' ? '✓' : '2'}
              </span>
              <span className="font-bold text-slate-800">2. Admin Approval</span>
              <span className={`text-[10px] font-semibold ${
                order.status === 'approved' ? 'text-emerald-600' : 'text-amber-700'
              }`}>
                {order.status === 'approved' ? 'Approved by Admin' : 'In Quality Queue'}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] mb-1 ${
                order.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                3
              </span>
              <span className="font-bold text-slate-800">3. Hub Dispatch</span>
              <span className="text-[10px] text-slate-500">
                {order.status === 'approved' ? 'Manifest Generated' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6">
          {/* SeedTrace Government Digital Seal Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  SeedTrace Cryptographic Authentication Certificate
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-800 block">
                  {order.seedTraceCertificateId}
                </span>
                <span className="text-[10px] text-slate-500">
                  National Agricultural Input Authenticity Ledger
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                🟢 100% Certified Lot
              </span>
            </div>
          </div>

          {/* Delivery & Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wide block">
                Consignee Farmer
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {order.farmerName}
              </span>
              <span className="text-slate-600 block">{order.villageAddress}</span>
              <span className="font-mono text-emerald-700 font-bold block">
                PIN: {order.pincode}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wide block">
                Logistics Carrier
              </span>
              <span className="text-sm font-bold text-slate-900 block flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                {order.deliveryPartner.name}
              </span>
              <span className="text-slate-600 block">
                Estimated Farm Delivery: <strong>{order.deliveryPartner.estimatedDays}</strong>
              </span>
              <span className="text-slate-600 block">
                Payment: <strong className="uppercase">{order.paymentMethod}</strong> (Confirmed)
              </span>
            </div>
          </div>

          {/* Itemized Receipt Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-700 flex justify-between">
              <span>Verified Certified Product</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map(({ product, quantity }) => (
                <div key={product.id} className="p-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{product.title}</span>
                    <span className="text-slate-500 block text-[11px]">
                      Qty: {quantity} × ₹{product.price} · Lot: {product.batchNumber}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{product.price * quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Direct Farmer Subsidy Savings:</span>
                <span className="font-mono">- ₹{order.subsidyDiscount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Power Ventures Commission (3% Quality & Verification Fee):</span>
                <span className="font-mono font-bold text-emerald-800">+ ₹{order.commissionFee || Math.round(order.subtotal * 0.03)}</span>
              </div>
              {order.sahayakCommissionFee ? (
                <div className="flex justify-between text-slate-600">
                  <span>District Sahayak Fee (2% to {order.assistedKendraName || 'Village Kendra'}):</span>
                  <span className="font-mono font-bold text-amber-700">+ ₹{order.sahayakCommissionFee}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-800">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.downloadInvoice}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to AgriSafe Hub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
