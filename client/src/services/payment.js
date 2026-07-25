import db, { COL } from './db';
import { PAYMENT_STATUS } from '../models';

const PAYMENT_API_URL =
  import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3000/api/payments';

// ── Local simulation ───────────────────────────────────────────────────────
// Simulates a payment confirmation without a real backend.
// Marks the payment record as 'success' and returns it.
const simulatePayment = (paymentId) => {
  const payment = db.update(COL.PAYMENTS, paymentId, { status: PAYMENT_STATUS.SUCCESS });
  if (!payment) throw new Error(`Payment ${paymentId} not found in local store.`);
  return Promise.resolve({ success: true, payment });
};

// ── Remote payment processor ───────────────────────────────────────────────
// Tries the real backend first; falls back to local simulation when offline.
const processPayment = async (paymentData) => {
  try {
    const response = await fetch(PAYMENT_API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error(`Payment gateway error: ${response.status}`);
    return response.json();
  } catch {
    // Backend unreachable — fall back to local simulation
    if (paymentData.paymentId) {
      return simulatePayment(paymentData.paymentId);
    }
    return { success: true, simulated: true };
  }
};

export const paymentService = { processPayment, simulatePayment };
export default paymentService;
