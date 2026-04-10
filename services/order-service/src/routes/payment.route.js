import { Router } from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create",authMiddlware, createPaymentOrder);
router.post("/verify",authMiddlware, verifyPayment);

export default router