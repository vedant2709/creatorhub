import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { createProductController, getMyProductsController, getProductByIdController, getProductsController, togglePusblishController } from "../controllers/product.controller.js";

const router = Router();

router.post(
    "/",
    upload.fields([
        {name: "file", maxCount: 1},
        {name: "thumbnail", maxCount: 1}
    ]),
    createProductController
);
router.get("/", getProductsController);
router.get("/my-products", getMyProductsController);
router.get("/:id", getProductByIdController)
router.patch("/:id/publish", togglePusblishController);

export default router;
