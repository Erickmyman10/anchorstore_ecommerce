import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({ include: { category: true } });
  res.json(products);
}));

router.post("/", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { name, unitPrice, categoryId, image, description } = req.body;
  const product = await prisma.product.create({ data: { name, unitPrice, categoryId, image, description } });
  res.json(product);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
}));

router.patch("/:id", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { name, unitPrice, categoryId, image, description } = req.body;
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { name, unitPrice, categoryId, image, description },
  });
  res.json(product);
}));

router.delete("/:id", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const product = await prisma.product.delete({ where: { id: req.params.id } });
  res.json(product);
}));

export default router;
