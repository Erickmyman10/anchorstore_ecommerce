import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],

      // ── Place an order ─────────────────────────────────────────────────────
      // cartItems: [{ id, name, price, quantity, category, image }]
      // trackingCode: pass the Paystack ref so backend and Paystack share the same reference.
      placeOrder: async ({ cartItems, total, paymentMethod = 'card', deliveryInfo = {}, trackingCode }) => {
        const order = await api.createOrder({
          total,
          paymentMethod,
          deliveryInfo,
          trackingCode,
          cartItems: cartItems.map((item) => ({
            id:       item.id,
            quantity: item.quantity,
            price:    Number(item.price),
          })),
        });
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },

      // ── Load orders for the authenticated user ─────────────────────────────
      loadOrders: async () => {
        try {
          const orders = await api.getMyOrders();
          set({ orders: Array.isArray(orders) ? orders : [] });
        } catch {
          set({ orders: [] });
        }
      },

      // ── Get a single order by ID (local state) ────────────────────────────
      getOrder: (orderId) =>
        get().orders.find((o) => o.id === orderId) ?? null,

      // ── Mark an order as paid in local state ──────────────────────────────
      // The backend is the source of truth; this keeps the UI in sync without
      // a re-fetch after Paystack's onSuccess callback fires.
      confirmPayment: (orderId) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: 'confirmed', paymentStatus: 'success' }
              : o
          ),
        }));
      },

      // ── Optimistic status update (used by admin views) ────────────────────
      updateStatus: (orderId, status) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
      },

      cancelOrder: (orderId) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: 'cancelled', paymentStatus: 'failed' }
              : o
          ),
        }));
      },

      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'anchorsoft-orders',
      partialize: (s) => ({ orders: s.orders }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectOrderCount = (s) => s.orders.length;

export const selectOrderById = (id) => (s) =>
  s.orders.find((o) => o.id === id) ?? null;

export default useOrderStore;
