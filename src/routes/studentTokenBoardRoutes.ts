import { Router } from "express";
import {
  getMyTokenBoard,
  getMyAllTokenBoards,
  getTokenBoardById,
  completeToken,
  completeBoard,
} from "../controllers/studentTokenBoardController";
import { studentMiddleware } from "../middlewares/auth";

const router = Router();
router.use(studentMiddleware);

router.get("/", getMyTokenBoard);
router.get("/all", getMyAllTokenBoards);
router.get("/:id", getTokenBoardById);
router.put("/token", completeToken);
router.post("/complete", completeBoard);

export default router;
