import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
}));

router.post("/", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.json(category);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(400).json({ error: "Category not found" });
  res.json(category);
}));

router.patch("/:id", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.update({ where: { id: req.params.id }, data: { name } });
  res.json(category);
}));

router.delete("/:id", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const category = await prisma.category.delete({ where: { id: req.params.id } });
  res.json(category);
}));

export default router;
