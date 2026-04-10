import { Router } from "express";
import {
  createFirstThenChart,
  listFirstThenCharts,
  getFirstThenChart,
  updateFirstThenChart,
  deleteFirstThenChart,
  assignFirstThenChart,
  listAssignedCharts,
} from "../controllers/teacherFirstThenController";
import { teacherMiddleware } from "../middlewares/auth";

const router = Router();
router.use(teacherMiddleware);

router.post("/", createFirstThenChart);
router.get("/", listFirstThenCharts);
router.get("/:id", getFirstThenChart);
router.put("/:id", updateFirstThenChart);
router.delete("/:id", deleteFirstThenChart);
router.post("/:id/assign", assignFirstThenChart);
router.get("/:id/assigned", listAssignedCharts);

export default router;
