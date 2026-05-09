import express from "express"
import cors from "cors"
import {createProxyMiddleware, fixRequestBody} from "http-proxy-middleware"
import dotenv from "dotenv"
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

dotenv.config();

const app = express();

// Trust proxy for Nginx/Managed environments to get real user IP
app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// 1. Global Rate Limiter: Applies to all requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per 15 mins
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});

// 2. Strict Limiter: Specifically for Auth (Login/Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, // 20 attempts allowed per 15 mins
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  }
});

// Apply Global Limiter
app.use(globalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "Gateway" });
});

// Auth service - Apply Auth Limiter here
app.use(
  "/api/auth",
  authLimiter,
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      path.startsWith("/api/auth") ? path : `/api/auth${path}`,
    proxyTimeout: 10000,
    timeout: 10000,
    on: {
      proxyReq: fixRequestBody,
      error: (_err, _req, res) => {
        res.status(502).json({
          success: false,
          message: "Auth service unavailable"
        });
      }
    }
  })
);

// Product service
app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      path.startsWith("/api/products") ? path : `/api/products${path}`,
    proxyTimeout: 10000,
    timeout: 10000,
    on: {
      proxyReq: fixRequestBody,
      error: (_err, _req, res) => {
        res.status(502).json({
          success: false,
          message: "Product service unavailable"
        });
      }
    }
  })
);

// Order service
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      path.startsWith("/api/orders") ? path : `/api/orders${path}`,
    proxyTimeout: 10000,
    timeout: 10000,
    on: {
      proxyReq: fixRequestBody,
      error: (_err, _req, res) => {
        res.status(502).json({
          success: false,
          message: "Order service unavailable"
        });
      }
    }
  })
);

app.use(
  "/api/payments",
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      path.startsWith("/api/payments") ? path : `/api/payments${path}`,
    proxyTimeout: 10000,
    timeout: 10000,
    on: {
      proxyReq: fixRequestBody,
      error: (_err, _req, res) => {
        res.status(502).json({
          success: false,
          message: "Payment service unavailable"
        });
      }
    }
  })
);

app.use(
  "/api/dashboard",
  createProxyMiddleware({
    target: process.env.DASHBOARD_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      path.startsWith("/api/dashboard") ? path : `/api/dashboard${path}`,
    proxyTimeout: 10000,
    timeout: 10000,
    on: {
      proxyReq: fixRequestBody,
      error: (_err, _req, res) => {
        res.status(502).json({
          success: false,
          message: "Dashboard service unavailable"
        });
      }
    }
  })
);

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});
