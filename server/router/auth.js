import { Router } from "express";
import prisma from "../Utilities/prismaclient.js";
import authMiddleware from "../middleware/authMiddleware.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Registration failed. Please try again." });
    }

    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });

  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.role === "ADMIN") {
      return res.status(403).json({ error: "Please use the admin login portal" });
    }
    const payload = { userId: user.id, email: user.email, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// GET current logged-in user
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

export default router;
