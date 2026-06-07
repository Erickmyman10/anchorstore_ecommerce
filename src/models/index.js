// ── ID + timestamp helpers ─────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 11);
const now = () => new Date().toISOString();

const trackingCode = () =>
  'ASO-' +
  Date.now().toString(36).toUpperCase() +
  '-' +
  Math.random().toString(36).slice(2, 6).toUpperCase();

// ── Model factories ────────────────────────────────────────────────────────
// Each returns a plain object matching the agreed schema.
// Passwords are stored as-is here (no backend hashing in this simulation).

export const createUser = ({ email, password }) => ({
  id:        uid(),
  email:     email.toLowerCase().trim(),
  password,
  createdAt: now(),
});

export const createCustomer = ({ userId, name, phone = '', address = {} }) => ({
  id:     uid(),
  userId,
  name:   name.trim(),
  phone,
  address: {
    street: address.street ?? '',
    city:   address.city   ?? '',
    state:  address.state  ?? '',
    zip:    address.zip    ?? '',
  },
  createdAt: now(),
});

export const createCartItem = ({ productId, quantity = 1 }) => ({
  productId,
  quantity,
});

export const createCart = ({ customerId }) => ({
  id:        uid(),
  customerId,
  items:     [],
  updatedAt: now(),
});

export const createOrderItem = ({ productId, quantity, price }) => ({
  productId,
  quantity,
  price,
});

export const createOrder = ({ customerId, items, total }) => ({
  id:           uid(),
  customerId,
  items,
  total,
  status:       'pending',
  trackingCode: trackingCode(),
  createdAt:    now(),
  updatedAt:    now(),
});

export const createPayment = ({ orderId, method }) => ({
  id:        uid(),
  orderId,
  method,
  status:    'pending',
  createdAt: now(),
});

export const createReview = ({ productId, customerId, rating, comment = '' }) => ({
  id:         uid(),
  productId,
  customerId,
  rating:     Math.min(5, Math.max(1, Math.round(rating))),
  comment:    comment.trim(),
  createdAt:  now(),
});

// ── Status / method constants ──────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  SHIPPED:   'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHOD = {
  CARD:             'card',
  BANK_TRANSFER:    'bank_transfer',
  USSD:             'ussd',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED:  'failed',
};
