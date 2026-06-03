const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3000/api/payments';

const processPayment = async (paymentData) => {
  const response = await fetch(PAYMENT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error(`Payment failed: ${response.status}`);
  return response.json();
};

export const paymentService = { processPayment };
export default paymentService;
