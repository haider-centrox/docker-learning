import { Router } from "express";
import {
  getAllTasks,
  getAssignedTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
} from "../controllers/teacherTasksController";
import { teacherMiddleware } from "../middlewares/auth";

const router = Router();
router.use(teacherMiddleware);

router.get("/", getAllTasks);
router.get("/assigned", getAssignedTasks);
router.get("/:type/:id", getTask);
router.put("/:type/:id", updateTask);
router.delete("/:type/:id", deleteTask);
router.post("/:type/:id/assign", assignTask);
router.delete("/:type/unassign/:assignmentId", unassignTask);

export default router;
