import express from "express"
import cors from "cors"
import {createProxyMiddleware} from "http-proxy-middleware"
import dotenv from "dotenv"
import { authMiddleware } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

app.use(cors());

// Auth service
app.use(createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathFilter: "/api/auth"
}));

// Product service
app.use(
  "/api/products",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: {
      "^/api/products": ""   // 🔥 THIS FIXES IT
    },

    on: {
      proxyReq: (proxyReq, req) => {
        if (req.user) {
          proxyReq.setHeader("x-user", JSON.stringify(req.user));
        }
      }
    }
  })
);

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});