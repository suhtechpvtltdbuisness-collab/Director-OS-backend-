import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/login", auth.login);
router.post("/verify-otp", auth.verifyOtp);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", authenticate, auth.me);

export default router;
