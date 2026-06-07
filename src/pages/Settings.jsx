import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/Avatar';

// ── Shared input class ────────────────────────────────────────────
const INPUT = [
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm',
  'bg-gray-50 focus:bg-white',
  'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
  'transition-all font-[inherit]',
].join(' ');

// ── Inline save-status message ────────────────────────────────────
function StatusMsg({ status }) {
  if (!status) return null;
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
        <CheckCircle2 className="w-4 h-4 shrink-0" /> Saved
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-red-500 font-semibold">
      <AlertCircle className="w-4 h-4 shrink-0" /> {status.error}
    </span>
  );
}

// ── Reusable section card ─────────────────────────────────────────
function SettingsCard({ title, status, onSave, btnLabel = 'Save', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <h2 className="text-base font-bold text-gray-900 mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <StatusMsg status={status} />
        <button
          onClick={onSave}
          className="ml-auto px-5 py-2 bg-brand-500 text-white text-sm font-bold rounded-xl
                     hover:bg-brand-600 transition-colors shadow-brand"
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

// ── Password input with show/hide ─────────────────────────────────
function PasswordInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div className="relative max-w-sm">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${INPUT} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────
export default function Settings() {
  const customer       = useAuthStore((s) => s.customer);
  const user           = useAuthStore((s) => s.user);
  const updateProfile  = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);

  const displayName = customer?.name?.trim() || user?.email?.split('@')[0] || '';

  // ── Profile state ─────────────────────────────────────────────
  const [name,           setName]           = useState(customer?.name ?? '');
  const [profileStatus,  setProfileStatus]  = useState(null);

  // ── Address state ─────────────────────────────────────────────
  const [address,        setAddress]        = useState({
    street: customer?.address?.street ?? '',
    city:   customer?.address?.city   ?? '',
    state:  customer?.address?.state  ?? '',
    zip:    customer?.address?.zip    ?? '',
  });
  const [addressStatus,  setAddressStatus]  = useState(null);

  // ── Contact state ─────────────────────────────────────────────
  const [phone,          setPhone]          = useState(customer?.phone ?? '');
  const [contactStatus,  setContactStatus]  = useState(null);

  // ── Security state ────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [securityStatus, setSecurityStatus] = useState(null);

  // ── Helper: flash status then auto-clear on success ───────────
  const flash = (setter, value) => {
    setter(value);
    if (value === 'saved') setTimeout(() => setter(null), 3000);
  };

  // ── Save handlers ─────────────────────────────────────────────
  const saveProfile = () => {
    if (!name.trim()) {
      flash(setProfileStatus, { error: 'Name cannot be empty.' });
      return;
    }
    updateProfile({ name: name.trim() });
    flash(setProfileStatus, 'saved');
  };

  const saveAddress = () => {
    updateProfile({ address });
    flash(setAddressStatus, 'saved');
  };

  const saveContact = () => {
    if (phone && !/^0\d{10}$/.test(phone)) {
      flash(setContactStatus, { error: 'Enter a valid Nigerian number (e.g. 08012345678).' });
      return;
    }
    updateProfile({ phone: phone.trim() });
    flash(setContactStatus, 'saved');
  };

  const savePassword = () => {
    if (!pw.current) {
      flash(setSecurityStatus, { error: 'Enter your current password.' });
      return;
    }
    if (pw.next.length < 8) {
      flash(setSecurityStatus, { error: 'New password must be at least 8 characters.' });
      return;
    }
    if (pw.next !== pw.confirm) {
      flash(setSecurityStatus, { error: 'New passwords do not match.' });
      return;
    }
    const result = changePassword({ currentPassword: pw.current, newPassword: pw.next });
    if (result.ok) {
      setPw({ current: '', next: '', confirm: '' });
      flash(setSecurityStatus, 'saved');
    } else {
      flash(setSecurityStatus, { error: result.error });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500
                     transition-colors mb-7 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Store
        </Link>

        {/* Page header — avatar + name + email */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar name={displayName} size={60} />
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── Profile ── */}
          <SettingsCard
            title="Profile"
            status={profileStatus}
            onSave={saveProfile}
            btnLabel="Save Profile"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileStatus(null); }}
                placeholder="e.g. Michael Adeyemi"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className={`${INPUT} opacity-50 cursor-not-allowed`}
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed at this time.</p>
            </div>
          </SettingsCard>

          {/* ── Delivery Address ── */}
          <SettingsCard
            title="Delivery Address"
            status={addressStatus}
            onSave={saveAddress}
            btnLabel="Save Address"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Street address</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => { setAddress((a) => ({ ...a, street: e.target.value })); setAddressStatus(null); }}
                placeholder="e.g. 12 Broad Street"
                className={INPUT}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => { setAddress((a) => ({ ...a, city: e.target.value })); setAddressStatus(null); }}
                  placeholder="e.g. Lagos"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => { setAddress((a) => ({ ...a, state: e.target.value })); setAddressStatus(null); }}
                  placeholder="e.g. Lagos State"
                  className={INPUT}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ZIP / Postal code
              </label>
              <input
                type="text"
                value={address.zip}
                onChange={(e) => { setAddress((a) => ({ ...a, zip: e.target.value })); setAddressStatus(null); }}
                placeholder="e.g. 100001"
                className={`${INPUT} max-w-40`}
              />
            </div>
          </SettingsCard>

          {/* ── Contact ── */}
          <SettingsCard
            title="Contact"
            status={contactStatus}
            onSave={saveContact}
            btnLabel="Save Contact"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setContactStatus(null); }}
                placeholder="e.g. 08012345678"
                className={`${INPUT} max-w-xs`}
              />
              <p className="text-xs text-gray-400 mt-1">
                Nigerian format — 11 digits starting with 0
              </p>
            </div>
          </SettingsCard>

          {/* ── Security ── */}
          <SettingsCard
            title="Security"
            status={securityStatus}
            onSave={savePassword}
            btnLabel="Update Password"
          >
            <PasswordInput
              label="Current password"
              value={pw.current}
              onChange={(e) => { setPw((p) => ({ ...p, current: e.target.value })); setSecurityStatus(null); }}
              placeholder="••••••••"
            />
            <PasswordInput
              label="New password"
              value={pw.next}
              onChange={(e) => { setPw((p) => ({ ...p, next: e.target.value })); setSecurityStatus(null); }}
              placeholder="Min. 8 characters"
            />
            <PasswordInput
              label="Confirm new password"
              value={pw.confirm}
              onChange={(e) => { setPw((p) => ({ ...p, confirm: e.target.value })); setSecurityStatus(null); }}
              placeholder="Re-enter new password"
            />
          </SettingsCard>

        </div>
      </div>
    </div>
  );
}
