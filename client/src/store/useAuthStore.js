import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,   // { id, username, email, avatar, profile }
      customer:        null,   // { name, phone, address } — mapped from user.profile
      token:           null,
      isAuthenticated: false,
      loading:         false,
      error:           null,

      // ── Register ──────────────────────────────────────────────────────────
      register: async ({ email, password, name }) => {
        set({ loading: true, error: null });
        try {
          const base     = name.replace(/\s+/g, '').toLowerCase().slice(0, 16);
          const username = base + Math.floor(1000 + Math.random() * 9000);

          const data = await api.register({ username, email, password });
          api.setToken(data.token);

          const user = await api.getMe();
          set({
            user,
            customer:        null,
            token:           data.token,
            isAuthenticated: true,
            loading:         false,
            error:           null,
          });
          return true;
        } catch (err) {
          const msg = err.status === 409
            ? 'An account with this email already exists.'
            : err.message || 'Registration failed. Please try again.';
          set({ error: msg, loading: false });
          return false;
        }
      },

      // ── Login ─────────────────────────────────────────────────────────────
      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const data = await api.loginWithEmail({ email, password });
          api.setToken(data.token);

          const user = await api.getMe();
          const customer = user.profile ? {
            name:    user.profile.fullName,
            phone:   user.profile.phoneNumber,
            address: user.profile.address,
          } : null;

          set({
            user,
            customer,
            token:           data.token,
            isAuthenticated: true,
            loading:         false,
            error:           null,
          });
          return true;
        } catch {
          set({ error: 'Invalid email or password.', loading: false });
          return false;
        }
      },

      // ── Update profile ────────────────────────────────────────────────────
      updateProfile: async ({ name, phone, address }) => {
        try {
          const updated = await api.request('/profiles/my', {
            method: 'PUT',
            body: JSON.stringify({
              fullName:    name,
              phoneNumber: phone,
              address:     address,
            }),
          });
          const customer = {
            name:    updated.fullName,
            phone:   updated.phoneNumber,
            address: updated.address,
          };
          set({ customer });
          return true;
        } catch (err) {
          throw new Error(err.message || 'Failed to update profile');
        }
      },

      // ── Change password ───────────────────────────────────────────────────
      changePassword: async ({ currentPassword, newPassword }) => {
        try {
          await api.request('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
          });
          return { ok: true };
        } catch (err) {
          return { ok: false, error: err.message || 'Failed to change password' };
        }
      },

      logout: () => {
        api.clearToken();
        set({ user: null, customer: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name:    'anchorsoft-auth',
      version: 2,
      migrate: (oldState) => {
        if (!oldState?.token) return { user: null, customer: null, token: null, isAuthenticated: false };
        return oldState;
      },
      partialize: (s) => ({
        user:            s.user,
        customer:        s.customer,
        token:           s.token,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) api.setToken(state.token);
      },
    }
  )
);

export default useAuthStore;
