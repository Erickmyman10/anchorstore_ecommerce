import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Check, ChevronRight, Lock, Loader2 } from 'lucide-react';
import useCartStore, { selectCartTotal } from '../store/useCartStore';
import useOrderStore from '../store/useOrderStore';
import useAuthStore from '../store/useAuthStore';
import visaLogo       from '../assets/images/payments/visa.png';
import mastercardLogo from '../assets/images/payments/mastercard.png';
import verveLogo      from '../assets/images/payments/verve.png';
import paypalLogo     from '../assets/images/payments/paypal.png';

const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

const Checkout = () => {
  const navigate  = useNavigate();
  const { cartItems, clearCart } = useCartStore();
  const cartTotal = useCartStore(selectCartTotal);
  const { placeOrder, confirmPayment } = useOrderStore();
  const { customer, isAuthenticated }  = useAuthStore();

  const [step,    setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [method,  setMethod]  = useState('card');

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotalNaira = cartTotal;
  const shippingNaira = subtotalNaira >= 50_000 ? 0 : 3_500;
  const taxNaira      = subtotalNaira * 0.075;
  const totalNaira    = subtotalNaira + shippingNaira + taxNaira;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleContinue = () => {
    const { name, email, phone, address } = form;
    const next = {};
    if (!name.trim())    next.name    = 'Full name is required';
    if (!email.trim())   next.email   = 'Email address is required';
    if (!phone.trim())   next.phone   = 'Phone number is required';
    if (!address.trim()) next.address = 'Delivery address is required';
    if (Object.keys(next).length) { setErrors(next); return; }
    setStep(2);
  };

  const handlePayment = () => {
    if (loading) return;
    if (!method) { alert('Select a payment method'); return; }
    if (!isAuthenticated || !customer) { navigate('/login'); return; }

    setLoading(true);
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate

      if (!success) {
        setLoading(false);
        alert('Payment failed. Please try again.');
        return;
      }

      const order = placeOrder({
        customerId:    customer.id,
        cartItems,
        total:         totalNaira,
        paymentMethod: method.toUpperCase(),
        paymentStatus: 'success',
        deliveryInfo:  form,
      });
      confirmPayment(order.id);
      clearCart();
      localStorage.removeItem('checkout_form');
      setLoading(false);
      navigate('/order-success', { state: { orderId: order.id, cartItems } });
    }, 1500);
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-150 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* ── Step indicators ── */}
      <div className="flex items-center gap-4 mb-8">
        {['Delivery', 'Payment', 'Confirmation'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1
                  ? 'bg-green-600 text-white'
                  : step === i + 1
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step >= i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 ml-2" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">

          {/* ── Step 1 — Delivery Information ── */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Delivery Information</h2>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Chukwuemeka Obi"
                    value={form.name}
                    onChange={handleChange}
                    className={inputCls('name')}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={inputCls('email')}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputCls('phone')}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    name="address"
                    rows={3}
                    placeholder="e.g. 14 Ademola Adetokunbo Crescent, Wuse II, Abuja"
                    value={form.address}
                    onChange={handleChange}
                    className={inputCls('address')}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 active:scale-[0.98] transition-all duration-200"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* ── Step 2 — Payment ── */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Select Payment Method</h2>
              </div>

              {/* Payment method options */}
              <div className="space-y-3">
                {/* Card */}
                <label
                  onClick={() => setMethod('card')}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                    method === 'card'
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-300'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${method === 'card' ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`} />
                  <span className="font-bold text-sm text-gray-900 flex-1">Pay with Card</span>
                  <div className="flex items-center gap-2">
                    <img src={visaLogo}       alt="Visa"       className="h-5 object-contain" />
                    <img src={mastercardLogo} alt="Mastercard" className="h-5 object-contain" />
                    <img src={verveLogo}      alt="Verve"      className="h-5 object-contain" />
                  </div>
                </label>

                {/* PayPal */}
                <label
                  onClick={() => setMethod('paypal')}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                    method === 'paypal'
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-300'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${method === 'paypal' ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`} />
                  <span className="font-bold text-sm text-gray-900 flex-1">Pay with PayPal</span>
                  <img src={paypalLogo} alt="PayPal" className="h-5 object-contain" />
                </label>
              </div>

              {/* Trust signal */}
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Secure payment powered by trusted providers
              </p>

              {!isAuthenticated && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  You need to be logged in to place an order.
                </p>
              )}

              {/* Delivery summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm border border-gray-100">
                <p className="font-bold text-gray-700 mb-2">Delivering to</p>
                <p className="text-gray-600">{form.name} · {form.phone}</p>
                <p className="text-gray-500 text-xs mt-0.5">{form.address}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Payment...
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
        <div className="w-full lg:w-96">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 pr-4 leading-snug">
                    {item.name}
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{fmt(subtotalNaira)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shippingNaira === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {shippingNaira === 0 ? '🎉 Free' : fmt(shippingNaira)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (7.5%)</span>
                <span className="font-semibold text-gray-900">{fmt(taxNaira)}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-extrabold text-gray-900 text-base">
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
