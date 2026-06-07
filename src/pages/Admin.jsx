import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Package, Search, ChevronDown, ChevronUp,
  TrendingUp, Clock, Truck, CheckCircle, XCircle,
} from 'lucide-react';
import db, { COL } from '../services/db';
import useOrderStore from '../store/useOrderStore';

const fmt = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

const STATUS = {
  pending:   { label: 'Pending',   pill: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', Icon: Clock       },
  confirmed: { label: 'Confirmed', pill: 'bg-blue-100   text-blue-700   border-blue-200',   dot: 'bg-blue-400',   Icon: TrendingUp  },
  shipped:   { label: 'Shipped',   pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400', Icon: Truck       },
  delivered: { label: 'Delivered', pill: 'bg-green-100  text-green-700  border-green-200',  dot: 'bg-green-400',  Icon: CheckCircle },
  cancelled: { label: 'Cancelled', pill: 'bg-red-100    text-red-700    border-red-200',    dot: 'bg-red-400',    Icon: XCircle     },
};
const ALL_STATUSES = Object.keys(STATUS);

const StatusPill = ({ status }) => {
  const cfg = STATUS[status] ?? { label: status, pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const Admin = () => {
  const { updateStatus } = useOrderStore();

  const [orders,   setOrders]   = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = () => {
    const all = db
      .getAll(COL.ORDERS)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((o) => ({
        ...o,
        payment: db.findOne(COL.PAYMENTS, (p) => p.orderId === o.id) ?? null,
      }));
    setOrders(all);
  };

  const handleStatusChange = (orderId, status) => {
    updateStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const toggle = (id) => setExpanded((cur) => (cur === id ? null : id));

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.trackingCode.toLowerCase().includes(q) ||
      o.customerId.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} orders · {fmt(revenue)} revenue</p>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {ALL_STATUSES.map((s) => {
          const cfg    = STATUS[s];
          const Icon   = cfg.Icon;
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(active ? 'all' : s)}
              className={`rounded-2xl border p-4 text-left transition-all duration-150 ${
                active
                  ? `${cfg.pill} border-current shadow-sm`
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${active ? '' : 'text-gray-400'}`} />
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{counts[s]}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, tracking, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                filter === s
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {s === 'all' ? `All (${orders.length})` : `${STATUS[s].label} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-500">No orders match your filter</p>
          <p className="text-sm mt-1">Try a different status or clear the search</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Order ID', 'Tracking Code', 'Customer ID', 'Total', 'Status', 'Date', 'Update Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap last:w-8"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                        expanded === order.id ? 'bg-brand-50/40' : ''
                      }`}
                      onClick={() => toggle(order.id)}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-400 block max-w-24 truncate" title={order.id}>
                          {order.id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-brand-600 text-xs">{order.trackingCode}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-400 block max-w-24 truncate" title={order.customerId}>
                          {order.customerId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-gray-900 whitespace-nowrap">{fmt(order.total)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs bg-white border border-gray-200 text-gray-700 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none cursor-pointer"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS[s].label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300">
                        {expanded === order.id
                          ? <ChevronUp   className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>

                    {expanded === order.id && (
                      <tr className="border-b border-brand-100 bg-brand-50/30">
                        <td colSpan={8} className="px-6 py-5">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                            Items in order · {order.items.length} line{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm"
                              >
                                <div className="min-w-0 pr-3">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Product ID</p>
                                  <p className="text-xs font-bold text-gray-700 font-mono truncate">{item.productId}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Qty: <span className="font-bold text-gray-600">{item.quantity}</span>
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Unit price</p>
                                  <p className="font-bold text-gray-900">{fmt(item.price)}</p>
                                  <p className="text-xs font-bold text-brand-600">{fmt(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {order.payment && (
                            <div className="flex flex-wrap gap-6 text-xs text-gray-500 border-t border-brand-100 pt-3">
                              <span>
                                Payment method:{' '}
                                <span className="font-bold text-gray-700 capitalize">
                                  {order.payment.method.replace(/_/g, ' ')}
                                </span>
                              </span>
                              <span>
                                Payment status:{' '}
                                <span className={`font-bold capitalize ${
                                  order.payment.status === 'success' ? 'text-green-600'
                                  : order.payment.status === 'failed'  ? 'text-red-500'
                                  : 'text-yellow-600'
                                }`}>
                                  {order.payment.status}
                                </span>
                              </span>
                              <span>
                                Payment ID:{' '}
                                <span className="font-mono text-gray-600">{order.payment.id}</span>
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
