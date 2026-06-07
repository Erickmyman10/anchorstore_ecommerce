import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Package, ChevronDown, ChevronUp,
  Clock, TrendingUp, Truck, CheckCircle, XCircle, ArrowRight,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';

const fmt     = (n)   => `₦${Math.round(n).toLocaleString('en-NG')}`;
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS = {
  pending:   { label: 'Pending',   pill: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400',  Icon: Clock       },
  confirmed: { label: 'Confirmed', pill: 'bg-blue-100   text-blue-700   border-blue-200',   dot: 'bg-blue-400',    Icon: TrendingUp  },
  shipped:   { label: 'Shipped',   pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400',  Icon: Truck       },
  delivered: { label: 'Delivered', pill: 'bg-green-100  text-green-700  border-green-200',  dot: 'bg-green-400',   Icon: CheckCircle },
  cancelled: { label: 'Cancelled', pill: 'bg-red-100    text-red-700    border-red-200',    dot: 'bg-red-400',     Icon: XCircle     },
};
const ALL_STATUSES = Object.keys(STATUS);

const PROGRESS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const StatusPill = ({ status }) => {
  const cfg = STATUS[status] ?? { label: status, pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const ProgressTracker = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 text-red-500">
        <XCircle className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = PROGRESS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {PROGRESS_STEPS.map((step, idx) => {
        const done   = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  done
                    ? active
                      ? STATUS[step]?.dot ?? 'bg-brand-500'
                      : 'bg-green-400'
                    : 'bg-gray-200'
                }`}
              />
              <span
                className={`text-[9px] font-semibold mt-0.5 capitalize whitespace-nowrap ${
                  done ? 'text-gray-500' : 'text-gray-300'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < PROGRESS_STEPS.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 mb-3.5 mx-0.5 transition-colors ${
                  idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-brand-600 tracking-wide">
                {order.trackingCode}
              </span>
              <StatusPill status={order.status} />
            </div>
            <p className="text-xs text-gray-400">
              Placed {fmtDate(order.createdAt)} &nbsp;·&nbsp; {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-extrabold text-gray-900 text-base">{fmt(order.total)}</span>
            {open
              ? <ChevronUp   className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </div>
        </div>
        <div className="mt-3">
          <ProgressTracker status={order.status} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 mb-3">
                Items Ordered
              </p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-brand-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700 font-mono truncate max-w-[140px]">
                          {item.productId}
                        </p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-gray-400">{fmt(item.price)} each</p>
                      <p className="font-bold text-gray-900 text-sm">{fmt(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 mt-4 pt-4">
                <span className="text-sm font-bold text-gray-700">Order Total</span>
                <span className="text-lg font-extrabold text-brand-600">{fmt(order.total)}</span>
              </div>

              {order.payment && (
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                  <span>
                    Payment:{' '}
                    <span className="font-semibold text-gray-600 capitalize">
                      {order.payment.method.replace(/_/g, ' ')}
                    </span>
                  </span>
                  <span>
                    Status:{' '}
                    <span className={`font-bold capitalize ${
                      order.payment.status === 'success' ? 'text-green-600'
                      : order.payment.status === 'failed'  ? 'text-red-500'
                      : 'text-yellow-600'
                    }`}>
                      {order.payment.status}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmptyOrders = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-24 px-4"
  >
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="absolute inset-0 bg-brand-50 rounded-full animate-pulse" />
      <div className="relative flex items-center justify-center w-full h-full">
        <ShoppingBag className="w-10 h-10 text-brand-300" />
      </div>
    </div>
    <h2 className="text-xl font-extrabold text-gray-900 mb-2">No orders yet</h2>
    <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
      You haven't placed any orders. Start shopping and your orders will show up here.
    </p>
    <Link
      to="/categories"
      className="inline-flex items-center gap-2 bg-brand-500 text-white px-7 py-3.5 rounded-full font-bold hover:bg-brand-600 active:scale-95 transition-all duration-200 shadow-brand text-sm"
    >
      Start Shopping <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

const MyOrders = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useAuthStore();
  const { orders, loadOrders }        = useOrderStore();
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (customer) loadOrders(customer.id);
  }, [isAuthenticated, customer]);

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-0.5">My Orders</h1>
        <p className="text-sm text-gray-400">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </p>
      </div>

      {orders.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            All ({orders.length})
          </button>
          {ALL_STATUSES.filter((s) => counts[s] > 0).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                filter === s
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {STATUS[s].label} ({counts[s]})
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-semibold text-gray-500">No {filter} orders</p>
          <button
            onClick={() => setFilter('all')}
            className="text-brand-500 text-sm font-semibold mt-2 hover:underline"
          >
            Show all orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
