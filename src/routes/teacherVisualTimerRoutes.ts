import { Router } from "express";
import {
  createVisualTimer, listVisualTimers, getVisualTimer,
  updateVisualTimer, deleteVisualTimer, assignVisualTimer, listAssignedTimers,
} from "../controllers/teacherVisualTimerController";
import { teacherMiddleware } from "../middlewares/auth";

const router = Router();
router.use(teacherMiddleware);

router.post("/", createVisualTimer);
router.get("/", listVisualTimers);
router.get("/:id", getVisualTimer);
router.put("/:id", updateVisualTimer);
router.delete("/:id", deleteVisualTimer);
router.post("/:id/assign", assignVisualTimer);
router.get("/:id/assigned", listAssignedTimers);

export default router;
