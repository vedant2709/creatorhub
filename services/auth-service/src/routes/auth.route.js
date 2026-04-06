import { Router } from "express";
import { forgortPasswordController, getMeController, loginUserController, logoutController, refreshTokenController, registerUserController, resetPasswordController, verifyEmailController } from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUserController);
router.get("/verify-email/:token", verifyEmailController);
router.post("/login", loginUserController);
router.get("/me", authMiddlware ,getMeController);
router.post("/refresh-token" ,refreshTokenController);
router.post("/logout" ,logoutController);
router.post("/forgot-password" ,forgortPasswordController);
router.post("/reset-password/:token" ,resetPasswordController);

export default router;