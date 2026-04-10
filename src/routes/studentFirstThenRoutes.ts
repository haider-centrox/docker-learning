import { Router } from "express";
import {
  getMyActiveCharts,
  getMyAllCharts,
  getChartById,
  completeFirstStep,
  completeNextStep,
  completeChart,
} from "../controllers/studentFirstThenController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();
router.use(studentMiddleware);

router.get("/", getMyActiveCharts);
router.get("/all", getMyAllCharts);
router.get("/:id", getChartById);
router.put("/first", completeFirstStep);
router.put("/next", completeNextStep);
router.post("/complete", completeChart);

export default router;
