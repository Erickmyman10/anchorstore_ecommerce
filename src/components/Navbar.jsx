import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, LogOut, Package, Settings as SettingsIcon } from 'lucide-react';
import useCartStore, { selectCartCount } from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import Avatar from './Avatar';
import anchorstoreLogo from '../Images/Logo/anchorstore_logo.svg';

const Navbar = () => {
  const cartCount      = useCartStore(selectCartCount);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const customer       = useAuthStore((s) => s.customer);
  const user           = useAuthStore((s) => s.user);
  const logout         = useAuthStore((s) => s.logout);

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [accountOpen,  setAccountOpen]  = useState(false);

  const accountRef = useRef(null);
  const location   = useLocation();
  const navigate   = useNavigate();

  // Derive display name: prefer customer name, fall back to email prefix
  const displayName = customer?.name?.trim() ||
    user?.email?.split('@')[0] || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close all overlays on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Close account dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accountOpen]);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/',           label: 'Home'       },
    { path: '/categories', label: 'Categories' },
    { path: '/cart',       label: 'Cart'       },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-soft' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src={anchorstoreLogo}
              alt="AnchorStore"
              className="h-10 w-auto group-hover:opacity-90 transition-opacity duration-200"
            />
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop actions ── */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-brand-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full px-1 shadow-brand leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* ── Account button ── */}
            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  aria-label="Account menu"
                >
                  <Avatar name={displayName} size={32} />
                  <span className="text-sm font-bold text-gray-800 max-w-20 truncate">
                    {displayName.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-card-hover py-1 z-50 animate-[chatSlideUp_0.15s_ease]">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                aria-label="Sign in"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* ── Mobile: cart + hamburger ── */}
          <div className="flex md:hidden items-center gap-1">
            <Link to="/cart" className="relative p-2.5 rounded-xl text-gray-500">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-brand-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full shadow-brand leading-none">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        {searchOpen && (
          <div className="py-3 border-t border-gray-100">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-soft">
          <div className="px-4 py-3 space-y-1">

            {/* Mobile nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* Logged-in user info */}
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar name={displayName} size={36} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-all"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-all"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-brand"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
