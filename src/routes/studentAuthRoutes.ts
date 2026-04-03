import { Router } from "express";
import { studentLogin } from "../controllers/studentAuthController";

const router = Router();

// Public — student logs in with email + 4-digit code
router.post("/login", studentLogin);

export default router;
