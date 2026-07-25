import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute';
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
import AdminLogin from '../pages/admin/AdminLogin';
import MyOrders from '../pages/MyOrders';
import Settings from '../pages/Settings';
import Account from '../pages/Account';
import Profile from '../pages/Profile';
import TrackOrder from '../pages/TrackOrder';
import AdminReviews from '../pages/admin/AdminReviews';

const AppRoutes = () => (
  <Routes>
    {/* ── Public / customer routes ─────────────────────────────────── */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Category />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/orders"    element={<MyOrders />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/track-order"    element={<TrackOrder />} />
      <Route path="/track-order/:id" element={<TrackOrder />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Route>

    {/* ── Admin login (public, no layout) ─────────────────────────── */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* ── Admin routes (JWT-protected, own sidebar layout) ─────────── */}
    <Route
      path="/admin"
      element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }
    >
      <Route index element={<Admin />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders"    element={<AdminOrders />} />
      <Route path="customers" element={<AdminCustomers />} />
      <Route path="reviews"   element={<AdminReviews />} />
    </Route>
  </Routes>
);

export default AppRoutes;
