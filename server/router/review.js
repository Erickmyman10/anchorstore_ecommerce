import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/reviews/user/me — must be before /:productId to avoid matching "user" as a productId
router.get("/user/me", authMiddleware, asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
}));

// GET /api/reviews/:productId
router.get("/:productId", asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
}));

// POST /api/reviews/:productId (auth required)
router.post("/:productId", authMiddleware, asyncHandler(async (req, res) => {
  const { name, title, rating, comment, verified } = req.body;

  const duplicate = await prisma.review.findFirst({
    where: { productId: req.params.productId, userId: req.userId },
  });
  if (duplicate) {
    return res.status(409).json({ error: "You have already reviewed this product." });
  }

  const review = await prisma.review.create({
    data: {
      productId: req.params.productId,
      userId: req.userId,
      name,
      title: title ?? null,
      rating,
      comment,
      verified: verified ?? false,
    },
  });
  res.status(201).json(review);
}));

// POST /api/reviews/:reviewId/like
router.post("/:reviewId/like", asyncHandler(async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.reviewId },
    data: { likes: { increment: 1 } },
  });
  res.json(review);
}));

// POST /api/reviews/:reviewId/dislike
router.post("/:reviewId/dislike", asyncHandler(async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.reviewId },
    data: { dislikes: { increment: 1 } },
  });
  res.json(review);
}));

// PATCH /api/reviews/:reviewId (owner only)
router.patch("/:reviewId", authMiddleware, asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const existing = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
  if (!existing) return res.status(404).json({ error: "Review not found." });
  if (existing.userId !== req.userId) return res.status(403).json({ error: "Not authorized." });

  const review = await prisma.review.update({
    where: { id: req.params.reviewId },
    data: { rating, title, comment },
  });
  res.json(review);
}));

// DELETE /api/reviews/:reviewId (owner only)
router.delete("/:reviewId", authMiddleware, asyncHandler(async (req, res) => {
  const existing = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
  if (!existing) return res.status(404).json({ error: "Review not found." });
  if (existing.userId !== req.userId) return res.status(403).json({ error: "Not authorized." });

  await prisma.review.delete({ where: { id: req.params.reviewId } });
  res.json({ success: true });
}));

export default router;
