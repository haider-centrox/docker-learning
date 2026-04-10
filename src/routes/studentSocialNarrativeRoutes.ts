import { Router } from "express";
import { getMyActiveNarratives, getMyAllNarratives, getNarrativeById, completeNarrative } from "../controllers/studentSocialNarrativeController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();
router.use(studentMiddleware);

router.get("/", getMyActiveNarratives);
router.get("/all", getMyAllNarratives);
router.get("/:id", getNarrativeById);
router.post("/complete", completeNarrative);

export default router;
