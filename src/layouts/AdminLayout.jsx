import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";

const links = [
  { to: "/admin",            label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products",   label: "Products",  icon: Package         },
  { to: "/admin/orders",     label: "Orders",    icon: ShoppingCart    },
  { to: "/admin/customers",  label: "Customers", icon: Users           },
];

const AdminLayout = () => (
  <div className="flex min-h-screen bg-gray-50">

    {/* ── Sidebar ── */}
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-extrabold mb-6 px-1">Admin</h2>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${
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

    {/* ── Main content ── */}
    <main className="flex-1 p-6 min-w-0">
      <Outlet />
    </main>

  </div>
);

export default AdminLayout;
