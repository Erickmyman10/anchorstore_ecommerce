import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Save, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/Avatar';

const Field = ({ label, icon: Icon, value, onChange, disabled = false, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all
          ${disabled
            ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
            : 'bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent hover:border-gray-300'
          }`}
      />
    </div>
  </div>
);

const Profile = () => {
  const navigate     = useNavigate();
  const user         = useAuthStore((s) => s.user);
  const customer     = useAuthStore((s) => s.customer);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setName(customer?.name    ?? '');
    setPhone(customer?.phone  ?? '');
    setAddress(customer?.address ?? '');
  }, [isAuthenticated, customer]);

  const displayName = name.trim() || user?.email?.split('@')[0] || '';

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* Back link */}
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Hero header */}
          <div className="bg-linear-to-br from-brand-500 to-brand-600 px-6 py-10 text-center text-white">
            <div className="inline-flex justify-center">
              <Avatar name={displayName} size={80} />
            </div>
            <h2 className="mt-4 text-xl font-extrabold">{displayName || 'Your Profile'}</h2>
            <p className="text-white/70 text-sm mt-0.5">{user?.email}</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Personal Information</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                <CheckCircle className="w-4 h-4 shrink-0" /> Profile saved successfully!
              </div>
            )}

            <Field
              label="Full Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            <Field
              label="Email Address"
              icon={Mail}
              value={user?.email ?? ''}
              disabled
              placeholder="Email cannot be changed"
            />
            <Field
              label="Phone Number"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="080XXXXXXXX"
            />
            <Field
              label="Delivery Address"
              icon={MapPin}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State"
            />

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white font-bold text-sm py-3 rounded-xl hover:bg-brand-600 disabled:opacity-60 transition-all shadow-brand"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              Need to change your password?{' '}
              <Link to="/settings" className="text-brand-600 font-medium hover:underline">
                Go to Settings
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
