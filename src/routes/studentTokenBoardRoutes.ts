import { Router } from "express";
import {
  getOrCreateTokenBoard,
  updateTokenIndex,
  updateRewardUrl,
  resetTokenBoard,
  deleteTokenBoard,
} from "../controllers/studentTokenBoardController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

router.get("/:studentId/tokenboard", getOrCreateTokenBoard);
router.put("/:studentId/tokenboard/token", updateTokenIndex);
router.put("/:studentId/tokenboard/reward", updateRewardUrl);
router.post("/:studentId/tokenboard/reset", resetTokenBoard);
router.delete("/:studentId/tokenboard", deleteTokenBoard);

export default router;
