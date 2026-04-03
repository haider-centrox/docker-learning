import { Router } from "express";
import {
  createStudent,
  listStudents,
  editStudentDetails,
  deleteStudent,
} from "../controllers/studentController";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../config/multer";

const router = Router();

// All routes require teacher JWT
router.use(authMiddleware);
router.get("/", listStudents);
router.post("/", upload.single("profileImage"), createStudent);
router.put("/:id", upload.single("profileImage"), editStudentDetails);
router.delete("/:id", deleteStudent);

export default router;
