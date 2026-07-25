import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// CREATE order (protected)
router.post("/", authMiddleware, asyncHandler(async (req, res) => {
  const { total, paymentMethod, deliveryInfo, cartItems, trackingCode: clientRef } = req.body;

  // If the frontend supplies a reference (e.g. Paystack ref), reuse it so the
  // webhook can match the payment to this order by trackingCode.
  const trackingCode = (clientRef && typeof clientRef === 'string' && clientRef.startsWith('ANC-'))
    ? clientRef
    : 'ANC-' + Date.now();

  const order = await prisma.order.create({
    data: {
      userId:        req.userId,
      total,
      paymentMethod,
      paymentStatus: "pending",
      status:        "pending",
      trackingCode,
      name:          deliveryInfo.name,
      email:         deliveryInfo.email,
      phone:         deliveryInfo.phone,
      street:        deliveryInfo.street,
      city:          deliveryInfo.city,
      state:         deliveryInfo.state,
      items: {
        create: cartItems.map((item) => ({
          productId: String(item.id),
          quantity:  item.quantity,
          price:     item.price,
        })),
      },
    },
    include: { items: true },
  });

  res.status(201).json(order);
}));

// GET all orders for logged-in user (protected)
router.get("/my-orders", authMiddleware, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where:   { userId: req.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}));

// GET single order by ID — owner or admin only
router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where:   { id: req.params.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.userId && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  res.json(order);
}));

// UPDATE order status (admin only)
router.patch("/:id/status", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      ...(status        && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
    include: { items: true },
  });
  res.json(order);
}));

export default router;
