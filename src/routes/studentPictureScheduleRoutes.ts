import { Router } from "express";
import {
  getMyPictureSchedule,
  getMyAllPictureSchedules,
  getPictureScheduleById,
  completePicture,
  completeSchedule,
} from "../controllers/studentPictureScheduleController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();
router.use(studentMiddleware);

router.get("/", getMyPictureSchedule);
router.get("/all", getMyAllPictureSchedules);
router.get("/:id", getPictureScheduleById);
router.put("/picture", completePicture);
router.post("/complete", completeSchedule);

export default router;
