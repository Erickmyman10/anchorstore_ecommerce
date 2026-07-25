import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package, MapPin, Phone, Mail, User,
  ArrowLeft, Calendar, Clock, CreditCard,
  Search, AlertCircle,
} from 'lucide-react';
import db, { COL } from '../services/db';
import useOrderStore from '../store/useOrderStore';
import OrderTimeline from '../components/orders/OrderTimeline';

const fmt = (n) =>
  `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:   'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const estimatedDelivery = (order) => {
  const base = new Date(order.createdAt);
  const days = order.status === 'delivered' ? 0 :
               order.status === 'shipped'   ? 2 :
               order.status === 'confirmed' ? 5 : 7;
  if (days === 0) return 'Delivered';
  const eta = new Date(base);
  eta.setDate(eta.getDate() + days);
  return eta.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Track by ID form ──────────────────────────────────────────────────────────
const TrackForm = ({ onTrack }) => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handle = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    navigate(`/track-order/${encodeURIComponent(q)}`);
    onTrack?.(q);
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
        <Package className="w-8 h-8 text-brand-500" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Track Your Order</h2>
      <p className="text-sm text-gray-500 mb-8">Enter your order ID or tracking code</p>
      <form onSubmit={handle} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. ASO-M9X4K1-ABCD or order ID"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors shrink-0"
        >
          Track
        </button>
      </form>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TrackOrder = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const storeOrders = useOrderStore((s) => s.orders);
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    // Try the store first (fast path for logged-in users)
    const fromStore = storeOrders.find(
      (o) => o.id === id || o.trackingCode?.toUpperCase() === id.toUpperCase()
    );
    if (fromStore) { setOrder(fromStore); setLoading(false); return; }

    // Fall back to db (works even for logged-out users)
    const fromDb =
      db.getById(COL.ORDERS, id) ??
      db.findOne(COL.ORDERS, (o) => o.trackingCode?.toUpperCase() === id.toUpperCase());

    if (fromDb) {
      const payment = db.findOne(COL.PAYMENTS, (p) => p.orderId === fromDb.id);
      setOrder({ ...fromDb, payment });
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [id, storeOrders]);

  // ── No ID yet — show search form ──────────────────────────────────────────
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-lg">
          <TrackForm />
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Looking up order…</p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Order not found</h2>
            <p className="text-sm text-gray-500 mb-6">
              We couldn't find an order matching <span className="font-mono font-semibold text-gray-700">"{id}"</span>.
            </p>
            <TrackForm />
          </div>
          <div className="text-center">
            <Link to="/orders" className="text-sm text-brand-600 font-medium hover:underline">
              View my orders →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Order found ───────────────────────────────────────────────────────────
  const statusBadge = STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const eta         = estimatedDelivery(order);
  const d           = order.deliveryInfo ?? {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Order Tracking</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">{order.trackingCode}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border capitalize ${statusBadge}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Timeline panel ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Timeline card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-6">Shipment Status</h2>
              <OrderTimeline status={order.status} compact={false} />
            </div>

            {/* ETA card */}
            {order.status !== 'cancelled' && (
              <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
                order.status === 'delivered'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-brand-50 border-brand-100'
              }`}>
                <div className={`p-3 rounded-xl ${order.status === 'delivered' ? 'bg-green-100' : 'bg-brand-100'}`}>
                  <Calendar className={`w-5 h-5 ${order.status === 'delivered' ? 'text-green-600' : 'text-brand-600'}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {order.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                  </p>
                  <p className={`text-base font-extrabold mt-0.5 ${
                    order.status === 'delivered' ? 'text-green-700' : 'text-brand-700'
                  }`}>{eta}</p>
                </div>
              </div>
            )}

            {/* Items ordered */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">
                  Items Ordered <span className="text-gray-400 font-normal">({order.items?.length ?? 0})</span>
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {(order.items ?? []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-5 py-3.5 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500">Product ID</p>
                        <p className="text-sm font-bold text-gray-900 font-mono truncate">{item.productId}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{fmt(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{fmt(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between">
                <span className="text-sm font-bold text-gray-700">Order Total</span>
                <span className="text-base font-extrabold text-gray-900">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs text-gray-600 text-right truncate max-w-32">{order.id}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {order.payment?.method?.replace(/_/g, ' ') ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Pay status</span>
                  <span className={`font-bold capitalize ${
                    order.payment?.status === 'success' ? 'text-green-600' :
                    order.payment?.status === 'failed'  ? 'text-red-500'   : 'text-yellow-600'
                  }`}>
                    {order.payment?.status ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            {(d.name || d.street) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Delivery Address</h3>
                <div className="space-y-2.5 text-sm text-gray-600">
                  {d.name && (
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">{d.name}</span>
                    </div>
                  )}
                  {d.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{d.phone}</span>
                    </div>
                  )}
                  {d.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{d.email}</span>
                    </div>
                  )}
                  {(d.street || d.city) && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>{[d.street, d.city, d.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to="/orders"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Package className="w-4 h-4" /> All My Orders
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 text-white font-bold text-sm rounded-xl hover:bg-brand-600 transition-colors shadow-brand"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
