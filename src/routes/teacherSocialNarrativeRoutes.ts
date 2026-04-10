import { Router } from "express";
import { assignSocialNarrative, listAssignedNarratives, unassignSocialNarrative } from "../controllers/teacherSocialNarrativeController";
import { teacherMiddleware } from "../middlewares/auth";

const router = Router();
router.use(teacherMiddleware);

router.post("/assign", assignSocialNarrative);
router.get("/assigned", listAssignedNarratives);
router.delete("/unassign/:id", unassignSocialNarrative);

export default router;
