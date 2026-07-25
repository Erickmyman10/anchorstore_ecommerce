import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// GET all profiles — admin only
router.get("/", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const profiles = await prisma.profile.findMany({ include: { user: { select: { id: true, username: true, email: true } } } });
  res.json(profiles);
}));

// CREATE profile — authenticated; userId always comes from the JWT, not the body
router.post("/", authMiddleware, asyncHandler(async (req, res) => {
  const { fullName, address, phoneNumber } = req.body;
  const existing = await prisma.profile.findUnique({ where: { userId: req.userId } });
  if (existing) {
    return res.status(409).json({ error: "Profile already exists for this user" });
  }
  const profile = await prisma.profile.create({
    data: { fullName, address, phoneNumber, userId: req.userId },
  });
  res.status(201).json(profile);
}));

// GET current logged-in user's profile
router.get("/logged-in", authMiddleware, asyncHandler(async (req, res) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.userId },
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
}));

// UPDATE (or create) logged-in user's own profile by userId
router.put("/my", authMiddleware, asyncHandler(async (req, res) => {
  const { fullName, address, phoneNumber } = req.body;
  const existing = await prisma.profile.findUnique({ where: { userId: req.userId } });
  if (existing) {
    const updated = await prisma.profile.update({
      where: { userId: req.userId },
      data: {
        ...(fullName    !== undefined && { fullName }),
        ...(address     !== undefined && { address }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });
    return res.json(updated);
  }
  const created = await prisma.profile.create({
    data: {
      fullName:    fullName    || '',
      address:     address     || '',
      phoneNumber: phoneNumber || '',
      userId:      req.userId,
    },
  });
  res.status(201).json(created);
}));

// GET one profile by profile ID — owner or admin only
router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const profile = await prisma.profile.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  if (profile.userId !== req.userId && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  res.json(profile);
}));

// UPDATE profile — owner only
router.patch("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { id: Number(req.params.id) } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  if (profile.userId !== req.userId) {
    return res.status(403).json({ error: "You can only update your own profile" });
  }
  const { fullName, address, phoneNumber } = req.body;
  const updated = await prisma.profile.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(fullName     && { fullName }),
      ...(address      && { address }),
      ...(phoneNumber  && { phoneNumber }),
    },
  });
  res.json(updated);
}));

// DELETE profile — owner or admin only
router.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { id: Number(req.params.id) } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  if (profile.userId !== req.userId && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  await prisma.profile.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Profile deleted successfully" });
}));

export default router;
