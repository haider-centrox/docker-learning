import { Router } from "express";
import { uploadImage } from "../controllers/uploadController";
import { teacherMiddleware } from "../middlewares/auth";
import { upload } from "../config/multer";

const router = Router();
router.use(teacherMiddleware);

// POST /api/upload/image — upload a single image, get back S3 URL
router.post("/image", upload.single("image"), uploadImage);

export default router;
