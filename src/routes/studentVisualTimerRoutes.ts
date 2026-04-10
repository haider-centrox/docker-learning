import { Router } from "express";
import { getMyActiveTimers, getMyAllTimers, getTimerById, completeTimer } from "../controllers/studentVisualTimerController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();
router.use(studentMiddleware);

router.get("/", getMyActiveTimers);
router.get("/all", getMyAllTimers);
router.get("/:id", getTimerById);
router.post("/complete", completeTimer);

export default router;
