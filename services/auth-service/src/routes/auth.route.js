import { Router } from "express";
import { registerUserController, verifyEmailController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUserController);
router.get("/verify-email/:token", verifyEmailController);

export default router;