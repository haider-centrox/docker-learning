import { Router } from "express";
import {
  saveStudentProgress,
  saveStudentProgressWithImages,
  getStudentProgress,
  getSingleProgress,
  updateStudentProgress,
  deleteStudentProgress,
  addRewardImage,
} from "../controllers/studentProgressController";
import { teacherMiddleware } from "../middlewares/auth";
import { upload } from "../config/multer";

const router = Router();
router.use(teacherMiddleware);

router.post("/:studentId/progress", saveStudentProgress);
router.post("/:studentId/progress/upload", upload.array("images", 10), saveStudentProgressWithImages);
router.get("/:studentId/progress", getStudentProgress);
router.get("/:studentId/progress/:progressId", getSingleProgress);
router.put("/:studentId/progress/:progressId", updateStudentProgress);
router.delete("/:studentId/progress/:progressId", deleteStudentProgress);
router.post("/:studentId/progress/:progressId/reward", upload.single("rewardImage"), addRewardImage);

export default router;
