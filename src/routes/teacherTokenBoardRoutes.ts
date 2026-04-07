import { Router } from "express";
import {
  createTokenBoard,
  listTokenBoards,
  getTokenBoard,
  updateTokenBoard,
  deleteTokenBoard,
  assignTokenBoard,
  listAssignedBoards,
} from "../controllers/teacherTokenBoardController";
import { teacherMiddleware } from "../middlewares/auth";

const router = Router();
router.use(teacherMiddleware);

router.post("/", createTokenBoard);
router.get("/", listTokenBoards);
router.get("/:id", getTokenBoard);
router.put("/:id", updateTokenBoard);
router.delete("/:id", deleteTokenBoard);
router.post("/:id/assign", assignTokenBoard);
router.get("/:id/assigned", listAssignedBoards);

export default router;
