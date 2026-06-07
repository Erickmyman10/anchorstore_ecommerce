import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import anchorstoreLogo from '../../Images/Logo/anchorstore_logo.svg';
import useAuthStore from '../../store/useAuthStore';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const login      = useAuthStore((s) => s.login);
  const error      = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate   = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login({ email, password });
    if (ok) navigate('/');
  };

  const handleChange = (setter) => (e) => {
    clearError();
    setter(e.target.value);
  };

  const canSubmit = email.trim() && password;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream py-12 px-4">
      <div className="w-full max-w-md">

        {/* ── Logo + heading ── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <img src={anchorstoreLogo} alt="AnchorStore" className="h-10 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Sign in to continue shopping</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleChange(setEmail)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                           transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handleChange(setPassword)}
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                             transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link
                to="#"
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-brand-500 text-white py-2.5 rounded-xl font-bold text-sm
                         hover:bg-brand-600 transition-colors shadow-brand
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-bold transition-colors">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
