import { Router } from 'express';
import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js';
import prisma from '../Utilities/prismaclient.js';

const router = Router();

// POST /api/payments/verify
// Called by the frontend after Paystack's onSuccess callback.
// Verifies the payment reference with Paystack's API before confirming anything.
router.post('/verify', asyncHandler(async (req, res) => {
  const { reference, amount } = req.body;

  if (!reference) {
    return res.status(400).json({ verified: false, error: 'Payment reference is required' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || secretKey === 'sk_test_your_paystack_secret_key_here') {
    console.error('[Payment] PAYSTACK_SECRET_KEY is not configured');
    return res.status(500).json({ verified: false, error: 'Payment gateway not configured on server' });
  }

  console.log(`[Payment] Verifying reference: ${reference}`);

  let paystackData;
  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    paystackData = await paystackRes.json();
  } catch (err) {
    console.error('[Payment] Paystack API request failed:', err.message);
    return res.status(502).json({ verified: false, error: 'Could not reach payment gateway' });
  }

  console.log(`[Payment] Paystack response — status: ${paystackData?.data?.status}, amount: ${paystackData?.data?.amount}`);

  // Both outer status and transaction status must be success
  if (paystackData.status !== true || paystackData.data?.status !== 'success') {
    console.warn(`[Payment] Verification failed — reference: ${reference} — reason: ${paystackData.message}`);
    return res.status(400).json({
      verified: false,
      error: paystackData.message || 'Payment was not successful',
    });
  }

  // Verify the amount paid matches what we expected (Paystack stores amount in kobo)
  if (amount) {
    const expectedKobo = Math.round(amount * 100);
    const paidKobo     = paystackData.data.amount;
    if (paidKobo < expectedKobo) {
      console.warn(`[Payment] Amount mismatch — expected: ${expectedKobo} kobo, paid: ${paidKobo} kobo — reference: ${reference}`);
      return res.status(400).json({ verified: false, error: 'Amount paid does not match order total' });
    }
  }

  console.log(`[Payment] Verified successfully — reference: ${reference}`);

  res.json({
    verified: true,
    reference: paystackData.data.reference,
    amount:    paystackData.data.amount,
    email:     paystackData.data.customer?.email,
  });
}));

// POST /api/payments/webhook
// Paystack calls this endpoint for server-side event notifications.
// req.body is a raw Buffer (mounted with express.raw() in app.js before express.json()).
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).send();
  }

  // Verify Paystack's HMAC signature
  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(req.body)
    .digest('hex');

  if (hash !== signature) {
    console.warn('[Webhook] Invalid Paystack signature — request ignored');
    return res.status(400).send();
  }

  const event = JSON.parse(req.body.toString());
  console.log(`[Webhook] Event: ${event.event} — reference: ${event.data?.reference}`);

  // Respond immediately — Paystack expects 200 within 5 seconds
  res.status(200).send();

  // Process post-response work in a fire-and-forget block so any
  // errors here don't attempt a second response via asyncHandler.
  if (event.event === 'charge.success') {
    const { reference, amount, customer } = event.data;
    console.log(`[Webhook] charge.success — ref: ${reference} — ₦${amount / 100} — ${customer?.email}`);

    // Idempotent update: only change status if not already confirmed
    prisma.order.findFirst({ where: { trackingCode: reference } })
      .then((order) => {
        if (order && order.paymentStatus !== 'success') {
          return prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'success', status: 'confirmed' },
          }).then(() => {
            console.log(`[Webhook] Order ${order.id} marked confirmed via webhook`);
          });
        }
      })
      .catch((err) => {
        console.error(`[Webhook] Failed to update order for ref ${reference}:`, err.message);
      });
  }
}));

export default router;
