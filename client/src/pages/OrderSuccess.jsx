import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Package, Home, ShoppingBag,
  Printer, Truck, MapPin, Phone, Mail,
  CreditCard, Wallet, Building2, Clock,
} from 'lucide-react';
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

const METHOD_META = {
  card:          { label: 'Debit / Credit Card',    Icon: CreditCard },
  bank_transfer: { label: 'Bank Transfer / USSD',   Icon: Building2  },
  paypal:        { label: 'PayPal',                  Icon: CreditCard },
  wallet:        { label: 'AnchorWallet',            Icon: Wallet     },
};

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const orderId   = state?.orderId;
  const order     = useOrderStore(selectOrderById(orderId));

  // Prefer navigation state (has names + breakdown), fall back to order fields
  const cartItems     = state?.cartItems     ?? [];
  const deliveryInfo  = state?.deliveryInfo  ?? order?.deliveryInfo  ?? {};
  const paymentMethod = state?.paymentMethod ?? 'card';
  const subtotal      = state?.subtotal      ?? 0;
  const shipping      = state?.shipping      ?? 0;
  const tax           = state?.tax           ?? 0;
  const total         = state?.total         ?? order?.total ?? 0;

  useEffect(() => {
    if (!orderId) navigate('/');
  }, [orderId, navigate]);

  if (!order) return null;

  const nameById = Object.fromEntries(cartItems.map((i) => [String(i.id), i.name]));

  const orderDate = new Date(order.createdAt).toLocaleString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const { label: methodLabel, Icon: MethodIcon } = METHOD_META[paymentMethod] ?? METHOD_META.card;
  const hasDelivery = Object.values(deliveryInfo).some(Boolean);
  const hasBreakdown = subtotal > 0;

  const handlePrint = () => window.print();

  return (
    <>
      {/* ── Print isolation — hides everything except #order-receipt ── */}
      <style>{`
        @media print {
          body > * { visibility: hidden !important; }
          #order-receipt {
            visibility: visible !important;
            position: absolute !important;
            top: 0; left: 0;
            width: 100% !important;
            padding: 32px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          #order-receipt * { visibility: visible !important; }
          .no-print { display: none !important; }
        }
        .print-only { display: none; }
        @media print { .print-only { display: block !important; } }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-10"
      >
        {/* ── Screen-only success animation ── */}
        <div className="no-print text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm">Your order is being processed and will be delivered soon.</p>
        </div>

        {/* ══════════════════════════════════════════════════
            RECEIPT — shown on screen AND when printing
        ══════════════════════════════════════════════════ */}
        <div
          id="order-receipt"
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Print-only header */}
          <div className="print-only px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">AnchorStore</h1>
                <p className="text-xs text-gray-400 mt-0.5">Official Purchase Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-600">RECEIPT</p>
                <p className="text-xs text-gray-400 mt-0.5">{orderDate}</p>
              </div>
            </div>
          </div>

          {/* Screen-only top banner */}
          <div className="no-print bg-linear-to-r from-brand-500 to-brand-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-100 text-xs font-medium mb-0.5">Order Confirmation</p>
                <p className="text-white font-extrabold text-xl tracking-wide">{order.trackingCode}</p>
                <p className="text-brand-200 text-xs mt-1">{orderDate}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
                STATUS_STYLES[order.status] ?? 'bg-white/20 text-white'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* IDs row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
                <p className="text-[11px] font-bold text-gray-600 break-all leading-relaxed">{order.id}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3.5 border border-brand-100">
                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Tracking Code
                </p>
                <p className="text-sm font-extrabold text-brand-600">{order.trackingCode}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Delivery address */}
            {hasDelivery && (
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Delivery Address
                </p>
                <p className="text-sm font-semibold text-gray-800">{deliveryInfo.name}</p>
                <div className="mt-1.5 space-y-1 text-xs text-gray-500">
                  {deliveryInfo.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      {deliveryInfo.phone}
                    </p>
                  )}
                  {deliveryInfo.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      {deliveryInfo.email}
                    </p>
                  )}
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                    {[deliveryInfo.street, deliveryInfo.city, deliveryInfo.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</p>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <MethodIcon className="w-4 h-4 text-brand-500" />
                {methodLabel}
              </div>
            </div>

            {/* Items ordered */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Items Ordered
              </p>
              <div className="space-y-2.5">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-gray-600 leading-snug min-w-0">
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

            {/* Price breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
              {hasBreakdown && (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-700">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                      {shipping === 0 ? 'Free' : fmt(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>VAT (7.5%)</span>
                    <span className="font-medium text-gray-700">{fmt(tax)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-200 pt-3 mt-1">
                <span>Total Paid</span>
                <span className="text-brand-600">{fmt(total || order.total)}</span>
              </div>
            </div>

            {/* Estimated delivery */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <Clock className="w-4 h-4 text-brand-500 shrink-0" />
              <p className="text-xs text-brand-700">
                <span className="font-bold">Estimated delivery:</span> 3–5 business days
              </p>
            </div>

            {/* Print-only footer */}
            <div className="print-only pt-4 border-t border-gray-100 text-center space-y-0.5">
              <p className="text-xs text-gray-500 font-semibold">Thank you for shopping with AnchorStore!</p>
              <p className="text-xs text-gray-400">Please keep this receipt for your records.</p>
              <p className="text-xs text-gray-400">For support: support@anchorstore.com.ng</p>
            </div>
          </div>
        </div>

        {/* ── Screen-only CTAs ── */}
        <div className="no-print mt-6 space-y-3">
          {/* Print / Save as PDF */}
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-brand-500 text-brand-600 rounded-xl font-extrabold hover:bg-brand-50 active:scale-[0.98] transition-all duration-200"
          >
            <Printer className="w-4 h-4" />
            Print Receipt / Save as PDF
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-colors shadow-brand"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OrderSuccess;
