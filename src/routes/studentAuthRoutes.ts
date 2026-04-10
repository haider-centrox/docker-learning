import { Router } from "express";
import { studentLogin, getMyProfile } from "../controllers/studentAuthController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/login", studentLogin);
router.get("/self", studentMiddleware, getMyProfile);

export default router;
