import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Smartphone,
  Landmark,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { CartItem, DeliveryPartner, OrderDetails, Language } from '../types';
import { DELIVERY_PARTNERS } from '../data/mockData';
import { lookupPincode, PincodeLookupResult } from '../services/pinCodeService';
import { translations } from '../data/translations';
import { INITIAL_DISTRICT_SAHAYAKS } from '../data/districtSahayaks';

interface CheckoutModalProps {
  items: CartItem[];
  language: Language;
  onClose: () => void;
  onOrderSuccess: (order: OrderDetails) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  language,
  onClose,
  onOrderSuccess,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const [pincode, setPincode] = useState('411001');
  const [pincodeResult, setPincodeResult] = useState<PincodeLookupResult>(lookupPincode('411001'));
  const [farmerName, setFarmerName] = useState('Rameshwar Patidar');
  const [phone, setPhone] = useState('9823019283');
  const [villageAddress, setVillageAddress] = useState('Gram Panchayat Shirur, Taluka Haveli');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('krishi-express');
  const [selectedSahayakId, setSelectedSahayakId] = useState<string>('SAH-MH-YAV-01');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'kcc' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('rameshwar@oksbi');
  const [isProcessing, setIsProcessing] = useState(false);

  const t = translations[language];

  // Recalculate totals
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const originalSubtotal = items.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
  const subsidySavings = originalSubtotal - subtotal;

  const currentPartner = DELIVERY_PARTNERS.find((p) => p.id === selectedPartnerId) || DELIVERY_PARTNERS[0];
  const shippingCost = pincodeResult.subsidyShippingFree && currentPartner.id === 'india-post' ? 0 : currentPartner.cost;

  // Power Ventures 3% Platform Quality & Anti-Counterfeit Commission Fee
  const commissionRate = 0.03;
  const commissionFee = Math.round(subtotal * commissionRate);

  // District Krishi Sahayak 2% Village Facilitation Commission
  const selectedSahayak = INITIAL_DISTRICT_SAHAYAKS.find((s) => s.id === selectedSahayakId);
  const sahayakCommissionRate = selectedSahayak ? 0.02 : 0;
  const sahayakCommissionFee = selectedSahayak ? Math.round(subtotal * sahayakCommissionRate) : 0;

  const netTotal = subtotal + shippingCost + commissionFee + sahayakCommissionFee;

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(code);
    if (code.length === 6) {
      setPincodeResult(lookupPincode(code));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);

    const orderId = `AGRI-ORD-${Date.now().toString().slice(-6)}`;
    const certId = `CERT-SEEDTRACE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const orderData: OrderDetails = {
      orderId,
      items,
      subtotal,
      subsidyDiscount: subsidySavings,
      commissionFee,
      commissionRate,
      assistedKendraId: selectedSahayak?.id,
      assistedKendraName: selectedSahayak ? `${selectedSahayak.name} (${selectedSahayak.district}, ${selectedSahayak.state})` : undefined,
      sahayakCommissionFee,
      sahayakCommissionRate,
      vendorPayout: subtotal - (commissionFee + sahayakCommissionFee),
      deliveryPartner: currentPartner,
      total: netTotal,
      farmerName,
      phone,
      villageAddress,
      pincode,
      paymentMethod,
      paymentRefId: paymentMethod === 'upi' ? `UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      seedTraceCertificateId: certId,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'pending_approval',
      adminApproved: false
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
    } catch (err) {
      console.warn('Network sync for order:', err);
    } finally {
      setIsProcessing(false);
      onOrderSuccess(orderData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              {t.checkoutTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500 mb-4">Your agricultural input bag is empty.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Delivery & Payment Options (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping & Rural Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>{t.deliveryAddress}</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    SeedTrace Rural Hub Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Farmer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mobile Number (For Delivery SMS)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Village Name / Farm Landmark Address
                  </label>
                  <input
                    type="text"
                    required
                    value={villageAddress}
                    onChange={(e) => setVillageAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Pin Code Lookup */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Destination Postal Pin Code
                    </label>
                    <span className="text-[11px] font-mono text-emerald-800 font-bold">
                      {pincodeResult.valid ? `${pincodeResult.district}, ${pincodeResult.state}` : 'Invalid Code'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder="e.g. 411001"
                      className="w-36 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                    />
                    <div className="flex-1 flex items-center text-[11px] text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-emerald-700 mr-1.5 shrink-0" />
                      <span className="truncate">Nearest Hub: {pincodeResult.hubName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Partner Selection */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Select Rural Logistics Partner:
                </h3>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                  {DELIVERY_PARTNERS.map((partner) => {
                    const isSelected = selectedPartnerId === partner.id;
                    const fee = (pincodeResult.subsidyShippingFree && (partner.id === 'india-post' || partner.id === 'enam-fleet')) ? 0 : partner.cost;
                    return (
                      <div
                        key={partner.id}
                        onClick={() => setSelectedPartnerId(partner.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="partner"
                            checked={isSelected}
                            onChange={() => setSelectedPartnerId(partner.id)}
                            className="text-emerald-700 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-2">
                              <span>{partner.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {partner.badge}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Estimated Delivery: <strong className="text-slate-800">{partner.estimatedDays}</strong>
                            </span>
                            <span className="text-[10px] text-emerald-800/80 block mt-0.5">
                              {partner.hubCoverage}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-slate-900">
                            {fee === 0 ? 'FREE' : `₹${fee}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assisted Order: District Krishi Sahayak & Village Kendra */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                      Assisted Order Facilitator (For Illiterate / Rural Farmers)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    2% Kendra Commission
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  If an authorized local Krishi Sahayak assisted you with dialect guidance, QR bag verification, or ordering, select their Kendra below so their 2% facilitation fee is credited to their wallet.
                </p>
                <select
                  value={selectedSahayakId}
                  onChange={(e) => setSelectedSahayakId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="none">Direct Online Order (No Local Kendra Assistance)</option>
                  {INITIAL_DISTRICT_SAHAYAKS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.district}, {s.state} (Dialect: {s.languagesSpoken.join(', ')})
                    </option>
                  ))}
                </select>
                {selectedSahayak && (
                  <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-200 text-[11px] flex items-center justify-between text-amber-900">
                    <span>Kendra: <strong>{selectedSahayak.kendraAddress}</strong></span>
                    <span className="font-mono font-bold">2% Commission: ₹{sahayakCommissionFee}</span>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  {t.paymentMethod}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* UPI */}
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span>{t.upiOption}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Google Pay, PhonePe, Paytm, BHIM QR
                    </span>
                  </div>

                  {/* KCC */}
                  <div
                    onClick={() => setPaymentMethod('kcc')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'kcc'
                        ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>{t.kccOption}</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      Govt 0% Interest Agro Tenure
                    </span>
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                      <Landmark className="w-4 h-4 text-emerald-700" />
                      <span>{t.netbankingOption}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      SBI Agri, Bank of Baroda, PNB
                    </span>
                  </div>

                  {/* COD */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>{t.codOption}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Pay cash upon delivery at farmgate
                    </span>
                  </div>
                </div>

                {/* Sub-UI for UPI */}
                {paymentMethod === 'upi' && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-slate-700 shrink-0" />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-800 block">Instant Farmer UPI ID:</span>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="farmer@upi"
                        className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Item List (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-200 mb-3">
                  Bag Items ({items.length})
                </h3>

                {/* Scrollable list */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between text-xs gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 block truncate">{product.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>₹{product.price} each</span>
                          <span>·</span>
                          <span className="font-mono text-emerald-700">Lot: {product.batchNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-5 h-5 rounded bg-white border border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="w-5 h-5 rounded bg-white border border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                        <span className="font-mono font-bold text-slate-900 w-14 text-right">
                          ₹{product.price * quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subsidized Price Breakdown */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Retail MRP Value:</span>
                    <span className="font-mono line-through">₹{originalSubtotal}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Govt Direct Subsidy Benefit:</span>
                    <span className="font-mono">- ₹{subsidySavings}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Rural Freight ({currentPartner.badge}):</span>
                    <span className="font-mono">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700 bg-emerald-50/70 px-2 py-1.5 rounded-lg border border-emerald-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-950">Power Ventures Commission (3%):</span>
                      <span className="text-[10px] text-emerald-700 font-medium" title="Includes physical lot testing, SeedTrace barcode validation & anti-counterfeit guarantee">(Quality & Anti-Fake Fee)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-900">+ ₹{commissionFee}</span>
                  </div>

                  {selectedSahayak && (
                    <div className="flex justify-between items-center text-slate-700 bg-amber-50/80 px-2 py-1.5 rounded-lg border border-amber-200/80">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-950">District Sahayak Commission (2%):</span>
                        <span className="text-[10px] text-amber-800 font-medium" title="Credited to verified local village representative for walk-in illiterate assistance">({selectedSahayak.name})</span>
                      </div>
                      <span className="font-mono font-bold text-amber-900">+ ₹{sahayakCommissionFee}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Net Farmer Payable:</span>
                    <span className="font-mono text-base text-emerald-900">₹{netTotal}</span>
                  </div>
                </div>
              </div>

              {/* Quality Compliance & Admin Verification Callout */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Mandatory Admin Quality & Certified Lot Approval</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Under the Seeds Act 1966 & Fertilizer Control Order, your order enters the Power Ventures Admin Verification Queue. Only certified genuine batches approved by our agricultural officer will be dispatched.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting for Admin Verification & Approval...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Submit Order for Admin Approval · ₹{netTotal}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Backed by Ministry of Agriculture SeedTrace Guarantee</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
