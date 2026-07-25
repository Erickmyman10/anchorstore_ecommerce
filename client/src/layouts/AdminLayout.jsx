import { useState } from 'react';
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Star, Menu, X } from "lucide-react";

const links = [
  { to: "/admin",           label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products",  label: "Products",  icon: Package         },
  { to: "/admin/orders",    label: "Orders",    icon: ShoppingCart    },
  { to: "/admin/customers", label: "Customers", icon: Users           },
  { to: "/admin/reviews",   label: "Reviews",   icon: Star            },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
          flex flex-col p-4 transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-lg font-extrabold text-gray-900">Admin</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar — hamburger + title */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-soft">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-gray-900">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
