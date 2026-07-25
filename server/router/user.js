import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const router = Router();

// GET all users — admin only
router.get("/", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, avatar: true, role: true, createdAt: true, profile: true },
  });
  res.json(users);
}));

// GET current logged-in user — must come before /:id so "me" isn't treated as an ID
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        profile: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// GET one user — owner or admin only
router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  if (req.userId !== req.params.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, username: true, email: true, avatar: true, role: true, createdAt: true, profile: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}));

// SIGNUP
router.post("/signup", asyncHandler(async (req, res) => {
  const { username, email, password, avatar } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" });
  }
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser) return res.status(409).json({ error: "Registration failed. Please try again." });
  const hashedPassword = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, avatar },
  });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
    token,
  });
}));

// LOGIN
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
  });
}));

// CHANGE PASSWORD
router.put("/change-password", authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  const valid = await argon2.verify(user.password, currentPassword);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  const hashed = await argon2.hash(newPassword);
  await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });
  res.json({ message: "Password updated successfully" });
}));

// LOGOUT
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// UPDATE user — owner only; role changes are blocked here
router.patch("/:id", authMiddleware, asyncHandler(async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({ error: "You can only update your own account" });
  }
  const { username, email, password, avatar } = req.body;
  const data = {
    ...(username && { username }),
    ...(email    && { email }),
    ...(avatar   && { avatar }),
  };
  if (password) data.password = await argon2.hash(password);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, username: true, email: true, avatar: true, createdAt: true },
  });
  res.json(user);
}));

// DELETE user — owner or admin only
router.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  if (req.userId !== req.params.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: "User deleted successfully" });
}));

export default router;
