import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import db, { COL } from '../services/db';
import { createOrder, createOrderItem, createPayment, ORDER_STATUS, PAYMENT_STATUS } from '../models';

const useOrderStore = create(
  persist(
    (set, get) => ({
      // In-memory list of the current customer's orders (hydrated on login)
      orders: [],

      // ── Place an order ─────────────────────────────────────────────────────
      // cartItems shape: [{ id, name, price, quantity, category, image }]
      placeOrder: ({ customerId, cartItems, total, paymentMethod = 'cash_on_delivery' }) => {
        const orderItems = cartItems.map((item) =>
          createOrderItem({ productId: item.id, quantity: item.quantity, price: item.price })
        );

        const order   = db.insert(COL.ORDERS,   createOrder({ customerId, items: orderItems, total }));
        const payment = db.insert(COL.PAYMENTS, createPayment({ orderId: order.id, method: paymentMethod }));

        const full = { ...order, payment };
        set((s) => ({ orders: [full, ...s.orders] }));
        return full;
      },

      // ── Load orders for a customer ─────────────────────────────────────────
      loadOrders: (customerId) => {
        const orders = db
          .findMany(COL.ORDERS, (o) => o.customerId === customerId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((o) => ({
            ...o,
            payment: db.findOne(COL.PAYMENTS, (p) => p.orderId === o.id) ?? null,
          }));
        set({ orders });
      },

      // ── Get a single order by ID ───────────────────────────────────────────
      getOrder: (orderId) =>
        get().orders.find((o) => o.id === orderId) ?? null,

      // ── Simulate payment confirmation ──────────────────────────────────────
      // In production this would be triggered by a payment webhook.
      confirmPayment: (orderId) => {
        const payment = db.findOne(COL.PAYMENTS, (p) => p.orderId === orderId);
        if (!payment) return;

        db.update(COL.PAYMENTS, payment.id, { status: PAYMENT_STATUS.SUCCESS });
        db.update(COL.ORDERS,   orderId,    { status: ORDER_STATUS.CONFIRMED });

        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: ORDER_STATUS.CONFIRMED, payment: { ...o.payment, status: PAYMENT_STATUS.SUCCESS } }
              : o
          ),
        }));
      },

      // ── Simulate order status progression ─────────────────────────────────
      // Useful for admin panel or order tracking simulation.
      updateStatus: (orderId, status) => {
        db.update(COL.ORDERS, orderId, { status });
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
      },

      // ── Cancel order ──────────────────────────────────────────────────────
      cancelOrder: (orderId) => {
        db.update(COL.ORDERS,   orderId, { status: ORDER_STATUS.CANCELLED });
        const payment = db.findOne(COL.PAYMENTS, (p) => p.orderId === orderId);
        if (payment) db.update(COL.PAYMENTS, payment.id, { status: PAYMENT_STATUS.FAILED });

        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: ORDER_STATUS.CANCELLED, payment: { ...o.payment, status: PAYMENT_STATUS.FAILED } }
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
