import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Check, ChevronRight } from 'lucide-react';
import useCartStore, { selectCartTotal } from '../store/useCartStore';

const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

const Checkout = () => {
  const navigate  = useNavigate();
  const { cartItems, clearCart } = useCartStore();
  const cartTotal = useCartStore(selectCartTotal); // sum of (usdPrice × qty)
  const [step, setStep] = useState(1);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // item.price is already in ₦ — cartTotal is the raw ₦ sum, no conversion needed
  const subtotalNaira  = cartTotal;
  const shippingNaira  = subtotalNaira >= 50_000 ? 0 : 3_500;
  const taxNaira       = subtotalNaira * 0.075; // 7.5% VAT
  const totalNaira     = subtotalNaira + shippingNaira + taxNaira;

  const handlePlaceOrder = () => {
    clearCart();
    setStep(3);
  };

  const inputCls =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-150';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* ── Step indicators ── */}
      <div className="flex items-center gap-4 mb-8">
        {['Shipping', 'Payment', 'Confirmation'].map((label, i) => (
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
        {/* ── Left panel ── */}
        <div className="flex-1">

          {/* Step 1 — Shipping */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" className={inputCls} placeholder="e.g. 14 Ademola Adetokunbo Crescent, Wuse II" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" className={inputCls} placeholder="e.g. Abuja" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" className={inputCls} placeholder="e.g. 900108" />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-4">
                <div className="border border-brand-200 bg-brand-50 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-brand-500 rounded-full bg-brand-500" />
                  <span className="font-medium text-gray-900">Credit / Debit Card</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input type="text" placeholder="123" className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                >
                  Place Order — {fmt(totalNaira)}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirmation */}
          {step === 3 && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-500 mb-6">
                Thank you for your purchase. Your order #12345 has been placed successfully.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ── */}
        <div className="w-full lg:w-96">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Item list */}
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

            {/* Totals */}
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
