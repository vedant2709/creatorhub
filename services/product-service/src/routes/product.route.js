import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { createProductController, deleteProductController, downloadProductController, getMyProductsController, getProductByIdController, getProductsController, togglePusblishController, updateProductController } from "../controllers/product.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/",
    authMiddlware,
    upload.fields([
        {name: "file", maxCount: 1},
        {name: "thumbnail", maxCount: 1}
    ]),
    createProductController
);
router.get("/", getProductsController);
router.get("/my-products", authMiddlware,getMyProductsController);
router.get("/:id", authMiddlware,getProductByIdController)
router.patch("/:id/publish", authMiddlware,togglePusblishController);
// ✏️ Update (with file support)
router.put(
  "/:id",
  authMiddlware,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  updateProductController
);
router.delete("/:id", authMiddlware,deleteProductController);
router.get("/:id/download", authMiddlware, downloadProductController);

export default router;
