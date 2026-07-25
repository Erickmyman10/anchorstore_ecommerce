import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import userRouter from "./router/user.js";
import categoryRouter from "./router/category.js";
import productRouter from "./router/product.js";
import profileRouter from "./router/profile.js";
import authRouter from "./router/auth.js";
import orderRouter from "./router/order.js";
import paymentRouter from "./router/payment.js";
import adminAuthRouter from "./router/adminAuth.js";
import reviewRouter from "./router/review.js";
import errorHandler from "./middleware/errorHandler.js";

config();

const app = express();

// Security headers
app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
}));

// Limit repeated auth attempts (applies to all /api/auth and /api/users/login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});

// Raw body parser for Paystack webhook signature verification.
// Must be registered BEFORE express.json() so the webhook route receives
// the raw Buffer that Paystack signs.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Routes
app.use("/api/auth",        authLimiter,    authRouter);
app.use("/api/users",       generalLimiter, userRouter);
app.use("/api/categories",  generalLimiter, categoryRouter);
app.use("/api/products",    generalLimiter, productRouter);
app.use("/api/profiles",    generalLimiter, profileRouter);
app.use("/api/orders",      generalLimiter, orderRouter);
app.use("/api/payments",    generalLimiter, paymentRouter);
app.use("/api/admin/auth",  authLimiter,    adminAuthRouter);
app.use("/api/reviews",    generalLimiter, reviewRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "Anchorsoft Ecommerce API is running" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
