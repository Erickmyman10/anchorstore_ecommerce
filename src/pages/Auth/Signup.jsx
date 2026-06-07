import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import anchorstoreLogo from '../../Images/Logo/anchorstore_logo.svg';
import useAuthStore from '../../store/useAuthStore';

const Signup = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    password:  '',
    confirmPassword: '',
  });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError,         setClientError]         = useState('');

  const register   = useAuthStore((s) => s.register);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate   = useNavigate();

  const handleChange = (e) => {
    clearError();
    setClientError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  const passwordMismatch =
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password.length >= 8 &&
    passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setClientError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }

    const ok = register({
      email:    form.email,
      password: form.password,
      name:     `${form.firstName} ${form.lastName}`.trim(),
    });
    if (ok) navigate('/');
  };

  const error = clientError || storeError;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream py-12 px-4">
      <div className="w-full max-w-md">

        {/* ── Logo + heading ── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <img src={anchorstoreLogo} alt="AnchorStore" className="h-10 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Join us for a better shopping experience</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="e.g. Michael"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                             transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="e.g. Adeyemi"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                             transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
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
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:border-transparent
                    transition-all bg-gray-50 focus:bg-white
                    ${passwordMismatch
                      ? 'border-red-300 focus:ring-red-300'
                      : passwordsMatch
                      ? 'border-green-300 focus:ring-green-300'
                      : 'border-gray-200 focus:ring-brand-400'
                    }`}
                />
                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Match indicator */}
                {passwordsMatch && (
                  <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {passwordMismatch && (
                  <XCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                )}
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                required
                className="mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-400 cursor-pointer"
              />
              <span className="text-gray-600 leading-snug">
                I agree to the{' '}
                <Link to="#" className="text-brand-500 hover:text-brand-600 font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="text-brand-500 hover:text-brand-600 font-semibold">
                  Privacy Policy
                </Link>
              </span>
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
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
