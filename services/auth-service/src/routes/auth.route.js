import { Router } from "express";
import { getMeController, loginUserController, refreshTokenController, registerUserController, verifyEmailController } from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUserController);
router.get("/verify-email/:token", verifyEmailController);
router.post("/login", loginUserController);
router.get("/me", authMiddlware ,getMeController);
router.post("/refresh-token" ,refreshTokenController);

export default router;