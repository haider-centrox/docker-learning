import { Request, Response } from "express";
import { StudentProgress } from "../models/StudentProgress";
import { Student } from "../models/Student";
import { uploadImageToS3, deleteImageFromS3 } from "../utils/s3";

// Save Student Progress
export const saveStudentProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;
    const { images, rewardImage } = req.body;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    let parsedImages = images;
    if (typeof images === "string") {
      try {
        parsedImages = JSON.parse(images);
      } catch {
        return res.status(400).json({ message: "Invalid images format" });
      }
    }

    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      return res.status(400).json({ message: "Images array is required" });
    }

    const progress = new StudentProgress({
      studentId,
      images: parsedImages,
      rewardImage: rewardImage || undefined,
    });

    await progress.save();

    res.status(201).json({ message: "Progress saved successfully", data: progress });
  } catch (error) {
    console.error("Error saving student progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save Student Progress with Image Upload
export const saveStudentProgressWithImages = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: `File at index ${i} is not an image` });
      }
      const imageUrl = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);
      uploadedImages.push({ index: i, url: imageUrl });
    }

    const progress = new StudentProgress({ studentId, images: uploadedImages });
    await progress.save();

    res.status(201).json({ message: "Progress saved successfully with uploaded images", data: progress });
  } catch (error) {
    console.error("Error saving student progress with images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Progress for a Student
export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const progressEntries = await StudentProgress.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await StudentProgress.countDocuments({ studentId });

    res.status(200).json({
      message: "Progress fetched successfully",
      data: { progress: progressEntries, total, limit: Number(limit), skip: Number(skip) },
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Single Progress Entry
export const getSingleProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId, progressId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const progress = await StudentProgress.findOne({ _id: progressId, studentId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    res.status(200).json({ message: "Progress fetched successfully", data: progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Student Progress
export const updateStudentProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId, progressId } = req.params;
    const { images, rewardImage } = req.body;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const progress = await StudentProgress.findOne({ _id: progressId, studentId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    if (images) {
      let parsedImages = images;
      if (typeof images === "string") {
        try { parsedImages = JSON.parse(images); } catch {
          return res.status(400).json({ message: "Invalid images format" });
        }
      }
      progress.images = parsedImages;
    }

    if (rewardImage !== undefined) progress.rewardImage = rewardImage || undefined;

    await progress.save();

    res.status(200).json({ message: "Progress updated successfully", data: progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Student Progress
export const deleteStudentProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId, progressId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const progress = await StudentProgress.findOne({ _id: progressId, studentId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    for (const image of progress.images) {
      try { await deleteImageFromS3(image.url); } catch (e) {
        console.error(`Error deleting image at index ${image.index}:`, e);
      }
    }

    if (progress.rewardImage) {
      try { await deleteImageFromS3(progress.rewardImage); } catch (e) {
        console.error("Error deleting reward image:", e);
      }
    }

    await StudentProgress.findByIdAndDelete(progressId);

    res.status(200).json({ message: "Progress deleted successfully" });
  } catch (error) {
    console.error("Error deleting progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Reward Image to Progress
export const addRewardImage = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId, progressId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const progress = await StudentProgress.findOne({ _id: progressId, studentId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    if (!req.file) return res.status(400).json({ message: "Reward image is required" });

    const file = req.file;
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    if (progress.rewardImage) {
      try { await deleteImageFromS3(progress.rewardImage); } catch (e) {
        console.error("Error deleting old reward image:", e);
      }
    }

    progress.rewardImage = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);
    await progress.save();

    res.status(200).json({ message: "Reward image added successfully", data: progress });
  } catch (error) {
    console.error("Error adding reward image:", error);
    res.status(500).json({ message: "Server error" });
  }
};
