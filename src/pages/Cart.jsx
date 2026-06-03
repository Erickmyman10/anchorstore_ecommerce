import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Tag, Truck, Lock } from 'lucide-react';
import useCartStore, { selectCartTotal } from '../store/useCartStore';
import CartItem from '../components/CartItem';

const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyCart = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-md mx-auto py-24 text-center px-4"
  >
    <div className="relative w-28 h-28 mx-auto mb-6">
      <div className="absolute inset-0 bg-brand-50 rounded-full animate-pulse" />
      <div className="relative flex items-center justify-center w-full h-full">
        <ShoppingBag className="w-14 h-14 text-brand-300" />
      </div>
    </div>
    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
    <p className="text-gray-400 mb-8 leading-relaxed">
      Looks like you haven't picked anything yet. Let's fix that.
    </p>
    <Link
      to="/categories"
      className="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-600 active:scale-95 transition-all duration-200 shadow-brand"
    >
      Start Shopping
      <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

// ── Cart page ──────────────────────────────────────────────────────────────
const Cart = () => {
  const { cartItems, clearCart } = useCartStore();
  const cartTotal = useCartStore(selectCartTotal);

  if (cartItems.length === 0) return <EmptyCart />;

  // item.price is already in ₦ — cartTotal is the raw ₦ sum
  const totalNaira    = cartTotal;
  const shippingNaira = totalNaira >= 50_000 ? 0 : 3_500;
  const taxNaira      = totalNaira * 0.075;
  const grandTotal    = totalNaira + shippingNaira + taxNaira;

  // Savings across all cart items
  const savingsNaira = cartItems.reduce((sum, item) => {
    const pct      = [15, 20, 25, 30, 35][item.id % 5];
    const oldNaira = item.price / (1 - pct / 100);
    return sum + (oldNaira - item.price) * item.quantity;
  }, 0);

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Shopping Cart
            <span className="ml-2 text-base font-semibold text-gray-400">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Item list ── */}
          <div className="flex-1 space-y-3">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Savings callout */}
            {savingsNaira > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
              >
                <Tag className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm font-bold text-green-700">
                  You're saving {fmt(savingsNaira)} on this order!
                </p>
              </motion.div>
            )}
          </div>

          {/* ── Order Summary (desktop sidebar) ── */}
          <div className="hidden lg:block w-96 shrink-0">
            <OrderSummary
              totalNaira={totalNaira}
              shippingNaira={shippingNaira}
              taxNaira={taxNaira}
              grandTotal={grandTotal}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile sticky checkout bar ── */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total (incl. VAT)</p>
            <p className="text-lg font-extrabold text-gray-900">{fmt(grandTotal)}</p>
          </div>
          {shippingNaira === 0 && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Truck className="w-3 h-3" /> Free Shipping
            </span>
          )}
        </div>
        <Link
          to="/checkout"
          className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all duration-200 shadow-brand"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
};

// ── Shared summary panel ───────────────────────────────────────────────────
const OrderSummary = ({ totalNaira, shippingNaira, taxNaira, grandTotal }) => {
  const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sticky top-24">
      <h2 className="text-lg font-extrabold text-gray-900 mb-5">Order Summary</h2>

      <div className="space-y-3 text-sm mb-5">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">{fmt(totalNaira)}</span>
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

        {shippingNaira > 0 && (
          <p className="text-xs text-brand-500 font-semibold flex items-center gap-1 pt-1">
            <Truck className="w-3.5 h-3.5" />
            Add {fmt(50000 - totalNaira)} more for free shipping
          </p>
        )}

        <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-gray-900 text-base">
          <span>Total</span>
          <span>{fmt(grandTotal)}</span>
        </div>
      </div>

      <Link
        to="/checkout"
        className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-4 rounded-xl font-bold text-base hover:bg-brand-600 active:scale-95 transition-all duration-200 shadow-brand"
      >
        Proceed to Checkout <ArrowRight className="w-4 h-4" />
      </Link>

      <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400 font-medium">
        <Lock className="w-3 h-3" />
        Secure checkout — SSL encrypted
      </div>
    </div>
  );
};

export default Cart;
