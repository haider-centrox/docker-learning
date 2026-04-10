import { Request, Response } from "express";
import { uploadImageToS3 } from "../utils/s3";

// Generic image upload — returns S3 URL
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const file = req.file;

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const url = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);

    res.status(200).json({
      message: "Image uploaded successfully",
      data: { url },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server error" });
  }
};
