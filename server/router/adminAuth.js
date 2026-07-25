import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// POST /api/admin/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { username, password, adminCode } = req.body;
  const timestamp = new Date().toISOString();

  // Check 1: admin code
  if (!adminCode || adminCode !== process.env.ADMIN_AUTH_CODE) {
    console.log(`[${timestamp}] Admin login FAILED (invalid admin code) — username: ${username}`);
    return res.status(401).json({ error: "Invalid admin authorization code" });
  }

  // Check 2: find user
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.log(`[${timestamp}] Admin login FAILED (user not found) — username: ${username}`);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check 3: verify password
  const valid = await argon2.verify(user.password, password);
  if (!valid) {
    console.log(`[${timestamp}] Admin login FAILED (wrong password) — username: ${username}`);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check 4: must be ADMIN role
  if (user.role !== "ADMIN") {
    console.log(`[${timestamp}] Admin login FAILED (not ADMIN role) — username: ${username}`);
    return res.status(403).json({ error: "You do not have admin privileges" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  console.log(`[${timestamp}] Admin login SUCCESS — username: ${username}`);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}));

// POST /api/admin/auth/promote — requires an existing admin's JWT
router.post("/promote", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.role === "ADMIN") {
    return res.status(409).json({ error: "User is already an admin" });
  }

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Admin promotion — '${username}' promoted by user ID: ${req.userId}`);

  await prisma.user.update({
    where: { username },
    data: { role: "ADMIN" },
  });

  res.json({ success: true, message: `${username} has been promoted to admin` });
}));

export default router;
