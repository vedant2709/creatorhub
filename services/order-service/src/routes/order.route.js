import {Router} from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { checkPurchaseController, createOrderController, getCreatorOrders, getOrderByIdController, getOrdersController, updateOrderStatusController } from "../controllers/order.controller.js";

const router = Router();

router.post("/", authMiddlware, createOrderController);
router.get("/", authMiddlware, getOrdersController);
router.get("/check/:productId", authMiddlware, checkPurchaseController);
router.get("/creator", authMiddlware, getCreatorOrders);
router.get("/:id", authMiddlware, getOrderByIdController);
router.patch("/:id/status", authMiddlware, updateOrderStatusController);

export default router;
