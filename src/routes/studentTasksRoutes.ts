import { Router } from "express";
import { getMyTasks, getMyActiveTasks, getMyCompletedTasks, getMyTaskById } from "../controllers/studentTasksController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();
router.use(studentMiddleware);

router.get("/", getMyTasks);
router.get("/active", getMyActiveTasks);
router.get("/completed", getMyCompletedTasks);
router.get("/:type/:id", getMyTaskById);

export default router;
