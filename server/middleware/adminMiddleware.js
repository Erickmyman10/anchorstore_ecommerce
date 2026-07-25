import asyncHandler from './asyncHandler.js';

const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
});

export default adminMiddleware;
