import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided, authorization denied" });
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid authorization header format" });
    }
    const token = authHeader.slice(7);
    if (!token) {
        return res.status(401).json({ error: "No token provided, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Support both JWT shapes: old { userId } and new admin { id, role }
        req.userId = decoded.userId || decoded.id;
        req.user = { id: req.userId, role: decoded.role || "USER" };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

export default authMiddleware;
