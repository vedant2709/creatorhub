import {Router} from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { createOrderController } from "../controllers/order.controller.js";

const router = Router();

router.post("/", authMiddlware, createOrderController);

export default router;