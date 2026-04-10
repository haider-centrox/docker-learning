import { Router } from "express";
import {
  createPictureSchedule,
  listPictureSchedules,
  getPictureSchedule,
  updatePictureSchedule,
  deletePictureSchedule,
  assignPictureSchedule,
  listAssignedSchedules,
} from "../controllers/teacherPictureScheduleController";
import { teacherMiddleware } from "../middlewares/auth";

const router = Router();
router.use(teacherMiddleware);

router.post("/", createPictureSchedule);
router.get("/", listPictureSchedules);
router.get("/:id", getPictureSchedule);
router.put("/:id", updatePictureSchedule);
router.delete("/:id", deletePictureSchedule);
router.post("/:id/assign", assignPictureSchedule);
router.get("/:id/assigned", listAssignedSchedules);

export default router;
