import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { createProductController } from "../controllers/product.controller.js";

const router = Router();

router.post(
    "/",
    upload.fields([
        {name: "file", maxCount: 1},
        {name: "thumbnail", maxCount: 1}
    ]),
    createProductController
)

export default router;
