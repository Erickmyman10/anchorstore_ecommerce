import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import db, { COL } from '../services/db';
import { createUser, createCustomer } from '../models';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Session state (persisted across refreshes)
      user:            null,  // { id, email }
      customer:        null,  // { id, userId, name, phone, address }
      isAuthenticated: false,
      error:           null,

      // ── Register ──────────────────────────────────────────────────────────
      // Creates a User + Customer record in localStorage, then logs in.
      register: ({ email, password, name, phone = '', address = {} }) => {
        const duplicate = db.findOne(
          COL.USERS,
          (u) => u.email === email.toLowerCase().trim()
        );
        if (duplicate) {
          set({ error: 'An account with this email already exists.' });
          return false;
        }
        const user     = db.insert(COL.USERS,     createUser({ email, password }));
        const customer = db.insert(COL.CUSTOMERS, createCustomer({ userId: user.id, name, phone, address }));
        set({
          user:            { id: user.id, email: user.email },
          customer,
          isAuthenticated: true,
          error:           null,
        });
        return true;
      },

      // ── Login ─────────────────────────────────────────────────────────────
      // Validates credentials against stored users.
      // Falls back to accepting any email when no users exist yet (demo mode).
      login: ({ email, password }) => {
        const allUsers = db.getAll(COL.USERS);

        let user;
        if (allUsers.length === 0) {
          // Demo mode — no registered users yet; accept any credential
          user = db.insert(
            COL.USERS,
            createUser({ email, password: password ?? 'demo' })
          );
          db.insert(COL.CUSTOMERS, createCustomer({ userId: user.id, name: email.split('@')[0] }));
        } else {
          user = db.findOne(
            COL.USERS,
            (u) => u.email === email.toLowerCase().trim() && u.password === (password ?? '')
          );
        }

        if (!user) {
          set({ error: 'Invalid email or password.' });
          return false;
        }

        const customer = db.findOne(COL.CUSTOMERS, (c) => c.userId === user.id);
        set({
          user:            { id: user.id, email: user.email },
          customer,
          isAuthenticated: true,
          error:           null,
        });
        return true;
      },

      // ── Profile ───────────────────────────────────────────────────────────
      updateProfile: (patch) => {
        const { customer } = get();
        if (!customer) return;
        const updated = db.update(COL.CUSTOMERS, customer.id, patch);
        set({ customer: updated });
      },

      // ── Change password ───────────────────────────────────────────────────
      changePassword: ({ currentPassword, newPassword }) => {
        const { user } = get();
        if (!user) return { ok: false, error: 'Not authenticated.' };
        const stored = db.findOne(COL.USERS, (u) => u.id === user.id);
        if (!stored || stored.password !== currentPassword) {
          return { ok: false, error: 'Current password is incorrect.' };
        }
        db.update(COL.USERS, user.id, { password: newPassword });
        return { ok: true };
      },

      clearError: () => set({ error: null }),

      logout: () =>
        set({ user: null, customer: null, isAuthenticated: false, error: null }),
    }),
    {
      name: 'anchorsoft-auth',
      // Only persist the session tokens — sensitive fields stay in memory
      partialize: (s) => ({
        user:            s.user,
        customer:        s.customer,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
