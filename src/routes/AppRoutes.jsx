import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Home from '../pages/Home';
import Category from '../pages/Category';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Payment from '../pages/Payment';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import OrderSuccess from '../pages/OrderSuccess';
import Admin from '../pages/Admin';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCustomers from '../pages/admin/AdminCustomers';
import MyOrders from '../pages/MyOrders';
import Settings from '../pages/Settings';

const AppRoutes = () => (
  <Routes>
    {/* ── Public / customer routes ─────────────────────────────────── */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Category />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Route>

    {/* ── Admin routes (whitelist-protected, own sidebar layout) ───── */}
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }
    >
      <Route index element={<Admin />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="customers" element={<AdminCustomers />} />
    </Route>
  </Routes>
);

export default AppRoutes;
