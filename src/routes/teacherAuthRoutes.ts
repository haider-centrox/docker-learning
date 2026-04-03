import { Router } from "express";
import {
  signup,
  verifySignupOtp,
  login,
  requestPasswordReset,
  verifyResetOtp,
  setNewPassword,
  resendSignupOtp,
  resendResetOtp,
  editAccount,
  deleteAccount,
  buyPlan,
} from "../controllers/teacherAuthController";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../config/multer";

const router = Router();

router.post("/signup", signup);
router.post("/signup/verify", verifySignupOtp);
router.post("/login", login);
router.post("/password/request", requestPasswordReset);
router.post("/password/verify", verifyResetOtp);
router.post("/password/reset", setNewPassword);
router.post("/resend-signup-otp", resendSignupOtp);
router.post("/resend-reset-otp", resendResetOtp);
router.post("/buyplan", authMiddleware, buyPlan);
// Protected routes
router.put("/account/edit", authMiddleware, upload.single("profileImage"), editAccount);
router.delete("/account/delete", authMiddleware, deleteAccount);

export default router;
