import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Truck, Check, Lock, Loader2,
  User, Phone, MapPin, Mail, Wallet, Building2,
  AlertCircle, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import useCartStore, { selectCartTotal } from '../store/useCartStore';
import useOrderStore from '../store/useOrderStore';
import useAuthStore from '../store/useAuthStore';
import useWalletStore from '../store/useWalletStore';
import { api } from '../services/api';
import visaLogo       from '../assets/images/payments/visa.png';
import mastercardLogo from '../assets/images/payments/mastercard.png';
import verveLogo      from '../assets/images/payments/verve.png';
import paypalLogo     from '../assets/images/payments/paypal.png';

const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

const METHOD_LABELS = {
  card:          'Debit / Credit Card',
  bank_transfer: 'Bank Transfer / USSD',
  paypal:        'PayPal',
  wallet:        'AnchorWallet',
};

// ── Radio-style payment option row ──────────────────────────────────────────
const PaymentOption = ({ value, selected, onSelect, label, right }) => (
  <div
    onClick={() => onSelect(value)}
    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
      selected === value
        ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-300'
        : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
    }`}
  >
    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
      selected === value ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
    }`} />
    <span className="font-bold text-sm text-gray-900 flex-1">{label}</span>
    {right}
  </div>
);

// ── Field-level validation ───────────────────────────────────────────────────
const DISPOSABLE_DOMAINS = ['test.com', 'fake.com', 'example.com', 'mailinator.com', 'tempmail.com', 'yopmail.com'];

const validateField = (name, value) => {
  const v = String(value).trim();

  switch (name) {
    case 'name': {
      if (!/^[a-zA-Z\s]+$/.test(v) || v.length < 6 || v.split(/\s+/).filter(Boolean).length < 2)
        return 'Please enter your full name (at least 6 characters, first and last name)';
      return '';
    }
    case 'email': {
      const stripped = value.replace(/\s/g, '');
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(stripped))
        return 'Please enter a valid email address';
      const domain = stripped.split('@')[1].toLowerCase();
      const parts  = domain.split('.');
      const sld    = parts[parts.length - 2];
      const tld    = parts[parts.length - 1];
      if (!sld || sld.length < 2 || !tld || tld.length < 2)
        return 'Please enter a valid email address';
      if (DISPOSABLE_DOMAINS.includes(domain))
        return 'Please enter a valid email address';
      return '';
    }
    case 'phone': {
      const stripped = value.replace(/\s/g, '');
      if (/^0/.test(stripped)) {
        if (!/^0[0-9]{10}$/.test(stripped))
          return 'Please enter a valid phone number (e.g. 08012345678 or +2348012345678)';
      } else if (!/^\+?[0-9]{7,15}$/.test(stripped)) {
        return 'Please enter a valid phone number (e.g. 08012345678 or +2348012345678)';
      }
      return '';
    }
    case 'street': {
      if (v.length < 10 || !/[0-9]/.test(v))
        return 'Please enter a valid street address with house number';
      return '';
    }
    case 'city': {
      if (v.length < 3 || !/^[a-zA-Z\s]+$/.test(v))
        return 'Please enter a valid city name';
      return '';
    }
    case 'state': {
      if (!v) return 'Please select your state';
      return '';
    }
    default:
      return '';
  }
};

// ── Main component ───────────────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart }              = useCartStore();
  const cartTotal                             = useCartStore(selectCartTotal);
  const { placeOrder, confirmPayment }        = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  const { balance: walletBalance, deduct, topUp }          = useWalletStore();

  const [step,         setStep]         = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [verifying,    setVerifying]    = useState(false);
  const [paystackOpen, setPaystackOpen] = useState(false);
  const [method,       setMethod]       = useState('card');
  const [saveAddr,     setSaveAddr]     = useState(false);
  const [autoFilled,   setAutoFilled]   = useState(false);
  const [errors,       setErrors]       = useState({});

  // Holds the local pending order while Paystack popup is open,
  // so the success/close callbacks can reference it via a stable ref.
  const pendingOrderRef = useRef(null);

  const [form, setForm] = useState({
    name:   '',
    email:  '',
    phone:  '',
    street: '',
    city:   '',
    state:  '',
  });

  // Auto-fill from saved profile on first mount
  useEffect(() => {
    if (!user) return;
    const p = user.profile;
    const patch = {
      name:   p?.fullName      ?? user?.username  ?? '',
      email:  user?.email                         ?? '',
      phone:  p?.phoneNumber                      ?? '',
      street: p?.address?.street                  ?? '',
      city:   p?.address?.city                    ?? '',
      state:  p?.address?.state                   ?? '',
    };
    if (Object.values(patch).some(Boolean)) {
      setForm(patch);
      setAutoFilled(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotalNaira = cartTotal;
  const shippingNaira = subtotalNaira >= 50_000 ? 0 : 3_500;
  const taxNaira      = Math.round(subtotalNaira * 0.075);
  const totalNaira    = subtotalNaira + shippingNaira + taxNaira;
  const walletOk      = walletBalance >= totalNaira;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    if (err) setErrors((prev) => ({ ...prev, [name]: err }));
  };

  // ── Derived: is the delivery form fully valid? ────────────────────────────
  const DELIVERY_FIELDS = ['name', 'email', 'phone', 'street', 'city', 'state'];
  const isFormValid = DELIVERY_FIELDS.every((f) => !validateField(f, form[f]));

  // ── Step 1 → 2 ────────────────────────────────────────────────────────────
  const handleContinueToPayment = () => {
    const next = {};
    DELIVERY_FIELDS.forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) next[field] = err;
    });
    if (Object.keys(next).length) { setErrors(next); return; }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 2 → 3 ────────────────────────────────────────────────────────────
  const handleContinueToReview = () => {
    if (!method) { setErrors({ method: 'Please select a payment method.' }); return; }
    if (method === 'wallet' && !walletOk) {
      setErrors({ method: `Insufficient balance. You need ${fmt(totalNaira - walletBalance)} more to pay with AnchorWallet.` });
      return;
    }
    setErrors({});
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Opens the Paystack inline popup ───────────────────────────────────────
  // ref must be the same value passed to placeOrder so the webhook can match.
  const openPaystackPopup = (ref, onSuccess, onClose) => {
    if (!window.PaystackPop) {
      setErrors({ payment: 'Payment service is not available. Please refresh the page and try again.' });
      setPaystackOpen(false);
      return;
    }
    const handler = window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      email:    form.email,
      amount:   Math.round(totalNaira * 100), // Paystack expects kobo
      ref,
      currency: 'NGN',
      callback: onSuccess,
      onClose,
    });
    handler.openIframe();
  };

  // ── Step 3 → place order ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (loading || paystackOpen) return;

    const deliveryInfo = {
      name:   form.name,
      email:  form.email,
      phone:  form.phone,
      street: form.street,
      city:   form.city,
      state:  form.state,
    };

    // ── Card payment → Paystack popup ────────────────────────────────────────
    if (method === 'card') {
      // Generate the reference once; reuse it as both the Paystack ref and the
      // backend trackingCode so the payment webhook can match them.
      const paystackRef = `ANC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setLoading(true);
      let order;
      try {
        order = await placeOrder({
          cartItems,
          total:         totalNaira,
          paymentMethod: 'card',
          deliveryInfo,
          trackingCode:  paystackRef,
        });
      } catch {
        setLoading(false);
        setErrors({ payment: 'Could not create order. Please try again.' });
        return;
      }
      setLoading(false);

      pendingOrderRef.current = { order, cartItems: [...cartItems], deliveryInfo };

      const onPaystackSuccess = async (response) => {
        setPaystackOpen(false);
        setVerifying(true);
        setLoading(true);
        try {
          const result = await api.verifyPayment(response.reference, totalNaira);
          if (result.verified) {
            confirmPayment(order.id);
            clearCart();
            navigate('/order-success', {
              state: {
                orderId:       order.id,
                cartItems:     pendingOrderRef.current.cartItems,
                deliveryInfo,
                paymentMethod: 'card',
                subtotal:      subtotalNaira,
                shipping:      shippingNaira,
                tax:           taxNaira,
                total:         totalNaira,
              },
            });
          } else {
            setErrors({ payment: 'Payment could not be verified. Please contact support if you were charged.' });
          }
        } catch {
          setErrors({ payment: 'Payment verification failed. Please contact support if you were charged.' });
        } finally {
          setVerifying(false);
          setLoading(false);
        }
      };

      const onPaystackClose = () => {
        setPaystackOpen(false);
        setErrors({ payment: 'Payment was cancelled. Your order has not been confirmed.' });
      };

      setPaystackOpen(true);
      openPaystackPopup(paystackRef, onPaystackSuccess, onPaystackClose);
      return;
    }

    // ── Wallet / bank-transfer payment ────────────────────────────────────────
    setLoading(true);
    try {
      if (method === 'wallet') {
        try { deduct(totalNaira); }
        catch {
          setLoading(false);
          setErrors({ payment: 'Wallet deduction failed. Please choose another payment method.' });
          setStep(2);
          return;
        }
      }

      const order = await placeOrder({
        cartItems,
        total:         totalNaira,
        paymentMethod: method,
        deliveryInfo,
      });

      confirmPayment(order.id);
      clearCart();
      setLoading(false);

      navigate('/order-success', {
        state: {
          orderId:       order.id,
          cartItems,
          deliveryInfo,
          paymentMethod: method,
          subtotal:      subtotalNaira,
          shipping:      shippingNaira,
          tax:           taxNaira,
          total:         totalNaira,
        },
      });
    } catch {
      setLoading(false);
      setErrors({ payment: 'Order could not be created. Please try again.' });
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
    }`;

  const goBack = (toStep) => { setStep(toStep); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const STEP_LABELS = ['Delivery', 'Payment', 'Review'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Checkout</h1>

      {/* ── Step indicators ── */}
      <div className="flex items-center mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                step > i + 1  ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-brand-500 text-white' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${step >= i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className={`h-0.5 w-6 sm:w-14 mx-2 transition-colors duration-200 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main panel ── */}
        <div className="flex-1 min-w-0">

          {/* ────────────── STEP 1 — Delivery ────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-extrabold text-gray-900">Delivery Information</h2>
              </div>

              {autoFilled && (
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                  <p className="text-xs font-semibold text-brand-700">
                    Address auto-filled from your profile — edit below if needed.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      name="name" type="text"
                      placeholder="e.g. Chukwuemeka Obi"
                      value={form.name} onChange={handleChange} onBlur={handleBlur}
                      className={`${inputCls('name')} pl-9`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      name="email" type="email"
                      placeholder="you@example.com"
                      value={form.email} onChange={handleChange} onBlur={handleBlur}
                      className={`${inputCls('email')} pl-9`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      name="phone" type="tel"
                      placeholder="e.g. 08012345678"
                      value={form.phone} onChange={handleChange} onBlur={handleBlur}
                      className={`${inputCls('phone')} pl-9`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Street */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Street Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    <textarea
                      name="street" rows={2}
                      placeholder="e.g. 14 Ademola Adetokunbo Crescent, Wuse II"
                      value={form.street} onChange={handleChange} onBlur={handleBlur}
                      className={`${inputCls('street')} pl-9 resize-none`}
                    />
                  </div>
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="city" type="text"
                    placeholder="e.g. Abuja"
                    value={form.city} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls('city')}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="state" type="text"
                    placeholder="e.g. FCT"
                    value={form.state} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls('state')}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Save address checkbox */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setSaveAddr(!saveAddr)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                    saveAddr ? 'bg-brand-500 border-brand-500' : 'border-gray-300 group-hover:border-brand-400'
                  }`}>
                    {saveAddr && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-600">Save this address to my profile</span>
                </button>
              )}

              <button
                onClick={handleContinueToPayment}
                disabled={!isFormValid}
                className="w-full bg-brand-500 text-white py-3.5 rounded-xl font-extrabold hover:bg-brand-600 active:scale-[0.98] transition-all duration-200 shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* ────────────── STEP 2 — Payment ────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-extrabold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* Card */}
                <PaymentOption
                  value="card" selected={method} onSelect={setMethod}
                  label="Debit / Credit Card"
                  right={
                    <div className="flex items-center gap-1.5">
                      <img src={visaLogo}       alt="Visa"       className="h-5 object-contain" />
                      <img src={mastercardLogo} alt="Mastercard" className="h-5 object-contain" />
                      <img src={verveLogo}      alt="Verve"      className="h-5 object-contain" />
                    </div>
                  }
                />

                {/* Bank Transfer */}
                <PaymentOption
                  value="bank_transfer" selected={method} onSelect={setMethod}
                  label="Bank Transfer / USSD"
                  right={<Building2 className="w-5 h-5 text-gray-400" />}
                />

                {/* PayPal */}
                <PaymentOption
                  value="paypal" selected={method} onSelect={setMethod}
                  label="PayPal"
                  right={<img src={paypalLogo} alt="PayPal" className="h-5 object-contain" />}
                />

                {/* AnchorWallet */}
                <div
                  onClick={() => setMethod('wallet')}
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                    method === 'wallet'
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-300'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded-full border-2 shrink-0 transition-colors ${
                    method === 'wallet' ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900">AnchorWallet</span>
                      <Wallet className="w-4 h-4 text-brand-400 shrink-0" />
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Balance:</span>
                      <span className={`text-xs font-extrabold ${walletOk ? 'text-green-600' : 'text-red-500'}`}>
                        {fmt(walletBalance)}
                      </span>
                      {!walletOk && (
                        <span className="text-xs text-red-400 font-medium">
                          — need {fmt(totalNaira - walletBalance)} more
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); topUp(100_000); }}
                      className="mt-1.5 text-xs text-brand-500 font-semibold hover:underline"
                    >
                      + Top up ₦100,000
                    </button>
                  </div>
                </div>
              </div>

              {/* Method error */}
              {errors.method && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {errors.method}
                </div>
              )}

              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Secure payment — your data is encrypted and protected
              </p>

              {/* Delivery summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm border border-gray-100">
                <p className="font-bold text-gray-600 text-xs uppercase tracking-wider mb-1.5">Delivering to</p>
                <p className="font-semibold text-gray-800">{form.name} · {form.phone}</p>
                <p className="text-gray-500 text-xs mt-0.5">{form.street}, {form.city}, {form.state}</p>
              </div>

              {!isAuthenticated && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  You need to be signed in to place an order.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => goBack(1)}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleContinueToReview}
                  disabled={method === 'wallet' && !walletOk}
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl font-extrabold hover:bg-brand-600 active:scale-[0.98] transition-all duration-200 shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ────────────── STEP 3 — Review ────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-extrabold text-gray-900">Review Your Order</h2>

              {/* Delivery summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Delivery
                  </p>
                  <button onClick={() => goBack(1)} className="text-xs text-brand-500 font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-800">{form.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{form.phone} · {form.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">{form.street}, {form.city}, {form.state}</p>
              </div>

              {/* Payment method */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Payment
                  </p>
                  <button onClick={() => goBack(2)} className="text-xs text-brand-500 font-semibold hover:underline">
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {method === 'wallet' ? <Wallet className="w-4 h-4 text-brand-500" /> : <CreditCard className="w-4 h-4 text-brand-500" />}
                  <span className="text-sm font-semibold text-gray-800">{METHOD_LABELS[method]}</span>
                  {method === 'wallet' && (
                    <span className="text-xs text-gray-500">({fmt(walletBalance)} available)</span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Items Ordered ({cartItems.length})
                </p>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image} alt={item.name}
                          className="w-10 h-10 object-contain bg-gray-50 rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">× {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 shrink-0">
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-700">{fmt(subtotalNaira)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={`font-medium ${shippingNaira === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                    {shippingNaira === 0 ? 'Free' : fmt(shippingNaira)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>VAT (7.5%)</span>
                  <span className="font-medium text-gray-700">{fmt(taxNaira)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-100 pt-3 mt-1">
                  <span>Total</span>
                  <span>{fmt(totalNaira)}</span>
                </div>
              </div>

              {errors.payment && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.payment}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => goBack(2)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || paystackOpen}
                  className="flex-1 bg-brand-500 text-white py-3.5 rounded-xl font-extrabold hover:bg-brand-600 active:scale-[0.98] transition-all duration-200 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {verifying ? 'Verifying your payment…' : 'Processing…'}
                    </>
                  ) : (
                    `Place Order — ${fmt(totalNaira)}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 sticky top-24">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-gray-600 leading-snug min-w-0 truncate">
                    {item.name}
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{fmt(subtotalNaira)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={`font-medium ${shippingNaira === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {shippingNaira === 0 ? 'Free 🎉' : fmt(shippingNaira)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT (7.5%)</span>
                <span className="font-medium text-gray-800">{fmt(taxNaira)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-extrabold text-gray-900">
              <span>Total</span>
              <span>{fmt(totalNaira)}</span>
            </div>

            {shippingNaira > 0 && (
              <p className="text-xs text-brand-500 font-semibold flex items-center gap-1 mt-3">
                <Truck className="w-3.5 h-3.5" />
                Add {fmt(50_000 - subtotalNaira)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
