import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone,
  Package, Wallet, Star, MapPin,
  Plus, ArrowRight, ChevronRight,
  ShoppingBag, ExternalLink,
  Clock, Truck, XCircle, CheckCircle,
  Settings as SettingsIcon,
  LayoutDashboard, LogOut, Lock,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import useWalletStore from '../store/useWalletStore';
import useReviewStore from '../store/useReviewStore';
import AccountSidebar from '../components/account/AccountSidebar';
import AccountCard from '../components/account/AccountCard';
import OrderTimeline from '../components/orders/OrderTimeline';
import Avatar from '../components/Avatar';

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

// Order model uses lowercase status values (pending / confirmed / shipped / delivered / cancelled)
const STATUS_META = {
  pending:   { pill: 'bg-yellow-100 text-yellow-700', icon: Clock,       label: 'Pending'   },
  confirmed: { pill: 'bg-blue-100 text-blue-700',     icon: CheckCircle, label: 'Confirmed' },
  shipped:   { pill: 'bg-purple-100 text-purple-700', icon: Truck,       label: 'Shipped'   },
  delivered: { pill: 'bg-green-100 text-green-700',   icon: CheckCircle, label: 'Delivered' },
  cancelled: { pill: 'bg-red-100 text-red-700',       icon: XCircle,     label: 'Cancelled' },
};

// StatusTimeline is now the reusable OrderTimeline component (compact mode)

// ── Dashboard section ─────────────────────────────────────────────────────────

const DashboardSection = ({ customer, user, orders, balance, userReviews, onSection }) => {
  const displayName = customer?.name?.trim() || user?.email?.split('@')[0] || '';
  const lastOrder   = orders[0];

  const avgRating = useMemo(() => {
    if (!userReviews.length) return null;
    return (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1);
  }, [userReviews]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Profile summary */}
        <AccountCard icon={User} title="Profile" accent="brand"
          action={
            <Link to="/profile" className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1">
              Edit <ChevronRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="flex items-center gap-3 mt-1">
            <Avatar name={displayName} size={44} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName || '—'}</p>
              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 shrink-0" />{user?.email}
              </p>
              {customer?.phone && (
                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 shrink-0" />{customer.phone}
                </p>
              )}
            </div>
          </div>
        </AccountCard>

        {/* Orders summary */}
        <AccountCard icon={Package} title="Orders" accent="blue"
          action={
            <button onClick={() => onSection('orders')}
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          }
        >
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{orders.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total orders placed</p>
          {lastOrder && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_META[lastOrder.status]?.pill ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_META[lastOrder.status]?.label ?? lastOrder.status}
              </span>
              <span className="text-xs text-gray-400">Last order</span>
            </div>
          )}
        </AccountCard>

        {/* Wallet summary */}
        <AccountCard icon={Wallet} title="Wallet" accent="green"
          action={
            <button onClick={() => onSection('wallet')}
              className="text-xs text-green-600 font-medium hover:underline flex items-center gap-1">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          }
        >
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{fmt(balance)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Available balance</p>
          <button
            onClick={() => onSection('wallet')}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Top Up
          </button>
        </AccountCard>

        {/* Reviews summary */}
        <AccountCard icon={Star} title="Reviews" accent="orange"
          action={
            <Link to="/" className="text-xs text-orange-600 font-medium hover:underline flex items-center gap-1">
              Shop <ChevronRight className="w-3 h-3" />
            </Link>
          }
        >
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{userReviews.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {userReviews.length === 0
              ? 'No reviews written yet'
              : `Avg rating: ${avgRating} / 5`}
          </p>
          <Link to="/"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
            Browse Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </AccountCard>
      </div>
    </div>
  );
};

// ── Orders section ────────────────────────────────────────────────────────────

const OrdersSection = ({ orders, navigate }) => {
  const orderCount = useMemo(() => orders.length, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          My Orders <span className="text-sm font-normal text-gray-400">({orderCount})</span>
        </h2>
        <Link to="/orders"
          className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
          Full history <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {orderCount === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link to="/" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
            Start shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 8).map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div
                key={order.id}
                onClick={() => navigate('/orders')}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {order.trackingCode ?? `#${String(order.id).slice(-8).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {' · '}
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.pill}`}>
                      <Icon className="w-3 h-3" />{meta.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{fmt(order.total)}</span>
                  </div>
                </div>

                {/* Status timeline (compact) */}
                <OrderTimeline status={order.status} compact />
                <div className="mt-2 pt-2">
                  <Link
                    to={`/track-order/${order.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Track Order
                  </Link>
                </div>
              </div>
            );
          })}

          {orderCount > 8 && (
            <Link to="/orders"
              className="block text-center text-sm text-brand-600 font-semibold py-3 hover:underline">
              View all {orderCount} orders →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

// ── Wallet section ────────────────────────────────────────────────────────────

const WalletSection = ({ balance, transactions }) => {
  const displayTransactions = useMemo(
    () => transactions.slice(0, 15),
    [transactions]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Wallet</h2>

      {/* Balance card */}
      <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-white/80 mb-1">Available Balance</p>
        <p className="text-4xl font-extrabold tracking-tight">{fmt(balance)}</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <Lock className="w-4 h-4 shrink-0 text-gray-400" />
        <span>Wallet top-up via Paystack coming soon. Your balance reflects completed orders.</span>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Transaction History</h3>
          {transactions.length > 0 && (
            <span className="text-xs text-gray-400">{transactions.length} transactions</span>
          )}
        </div>

        {displayTransactions.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No transactions yet. Top up to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {tx.type === 'topup' ? 'Wallet Top-Up' : tx.type === 'payment' ? 'Purchase' : 'Refund'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.date).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.amount > 0 ? '+' : ''}{fmt(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Settings section ──────────────────────────────────────────────────────────

const SettingsSection = ({ customer, user }) => {
  const items = [
    { icon: User,        label: 'Profile',           desc: 'Update your name and avatar'            },
    { icon: MapPin,      label: 'Delivery Address',   desc: customer?.address?.street || 'No address saved' },
    { icon: Phone,       label: 'Contact',            desc: customer?.phone            || 'No phone saved'  },
    { icon: SettingsIcon, label: 'Password & Security', desc: 'Change your account password'          },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <Link to="/settings"
          className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
          Open settings <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {items.map(({ icon: Icon, label, desc }) => (
          <Link
            key={label}
            to="/settings"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 rounded-xl bg-brand-50 shrink-0">
              <Icon className="w-4 h-4 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

// ── Mobile tab config ─────────────────────────────────────────────────────────

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home',     icon: LayoutDashboard },
  { id: 'orders',    label: 'Orders',   icon: Package          },
  { id: 'wallet',    label: 'Wallet',   icon: Wallet           },
  { id: 'settings',  label: 'Settings', icon: SettingsIcon     },
];

// ── Main component ────────────────────────────────────────────────────────────

const Account = () => {
  const navigate = useNavigate();

  const user            = useAuthStore((s) => s.user);
  const customer        = useAuthStore((s) => s.customer);
  const logout          = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const orders      = useOrderStore((s) => s.orders);
  const loadOrders  = useOrderStore((s) => s.loadOrders);

  const balance      = useWalletStore((s) => s.balance);
  const topUp        = useWalletStore((s) => s.topUp);
  const transactions = useWalletStore((s) => s.transactions);

  const userReviews     = useReviewStore((s) => s.userReviews);
  const loadUserReviews = useReviewStore((s) => s.loadUserReviews);

  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const displayName = customer?.name?.trim() || user?.email?.split('@')[0] || '';
  const handleLogout = () => { logout(); navigate('/'); };

  const sharedProps = { customer, user, orders, balance, topUp, transactions, userReviews, navigate, onSection: setActiveSection };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-700">{displayName.split(' ')[0]}</span>
          </p>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-2">
          {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                activeSection === id
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-red-500 bg-white border border-gray-200 hover:bg-red-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (desktop only) */}
          <div className="hidden lg:block w-64 shrink-0">
            <AccountSidebar
              active={activeSection}
              onChange={setActiveSection}
              onLogout={handleLogout}
              user={user}
              customer={customer}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {activeSection === 'dashboard' && <DashboardSection {...sharedProps} />}
            {activeSection === 'orders'    && <OrdersSection    {...sharedProps} />}
            {activeSection === 'wallet'    && <WalletSection    {...sharedProps} />}
            {activeSection === 'settings'  && <SettingsSection  {...sharedProps} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
