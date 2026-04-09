import {Router} from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { createOrderController, getOrderByIdController, getOrdersController } from "../controllers/order.controller.js";

const router = Router();

router.post("/", authMiddlware, createOrderController);
router.get("/", authMiddlware, getOrdersController);
router.get("/:id", authMiddlware, getOrderByIdController);

export default router;