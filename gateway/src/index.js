import express from "express"
import cors from "cors"
import {createProxyMiddleware, fixRequestBody} from "http-proxy-middleware"
import dotenv from "dotenv"
import { authMiddleware } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Auth service
app.use(
  "/api/auth",
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
