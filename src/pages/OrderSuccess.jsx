import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import useOrderStore, { selectOrderById } from '../store/useOrderStore';

const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100  text-green-700',
  shipped:   'bg-blue-100   text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100    text-red-700',
};

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate   = useNavigate();
  const orderId    = state?.orderId;
  const cartItems  = state?.cartItems ?? [];
  const order      = useOrderStore(selectOrderById(orderId));

  useEffect(() => {
    if (!orderId) navigate('/');
  }, [orderId, navigate]);

  if (!order) return null;

  const nameById = Object.fromEntries(cartItems.map((i) => [String(i.id), i.name]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-16"
    >
      {/* Success header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500">Your order is confirmed and being processed.</p>
      </div>

      {/* Order details card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 space-y-6">

        {/* IDs row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
            <p className="text-xs font-bold text-gray-700 break-all">{order.id}</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
              <Package className="w-3 h-3" /> Tracking Code
            </p>
            <p className="text-sm font-extrabold text-brand-600">{order.trackingCode}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Order Status</span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
            STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
          }`}>
            {order.status}
          </span>
        </div>

        {/* Items list */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-500" /> Items Ordered
          </h3>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between items-start text-sm">
                <span className="text-gray-600 pr-4 leading-snug">
                  {nameById[String(item.productId)] ?? `Product #${item.productId}`}
                  <span className="text-gray-400 ml-1">× {item.quantity}</span>
                </span>
                <span className="font-semibold text-gray-900 shrink-0">
                  {fmt(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total paid */}
        <div className="border-t border-gray-100 pt-5 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Total Paid</span>
          <span className="text-2xl font-extrabold text-brand-600">{fmt(order.total)}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-4 rounded-xl font-bold text-base hover:bg-brand-600 active:scale-95 transition-all duration-200 shadow-brand"
        >
          <Home className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderSuccess;
