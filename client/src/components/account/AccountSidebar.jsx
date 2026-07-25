import { LayoutDashboard, Package, Wallet, Settings, LogOut } from 'lucide-react';

export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'orders',    label: 'My Orders',  icon: Package          },
  { id: 'wallet',    label: 'Wallet',     icon: Wallet           },
  { id: 'settings',  label: 'Settings',   icon: Settings         },
];

const AccountSidebar = ({ active, onChange, onLogout, user, customer }) => {
  const displayName =
    customer?.name?.trim() || user?.email?.split('@')[0] || 'Guest';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* User header */}
      <div className="px-5 py-6 bg-linear-to-br from-brand-500 to-brand-600 text-white">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <span className="text-2xl font-extrabold">{initial}</span>
        </div>
        <p className="font-bold text-base leading-tight truncate">{displayName}</p>
        <p className="text-xs text-white/70 truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="py-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 ${
              active === id
                ? 'bg-brand-50 text-brand-600 border-r-2 border-brand-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}

        <div className="mx-4 border-t border-gray-100 my-2" />

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default AccountSidebar;
