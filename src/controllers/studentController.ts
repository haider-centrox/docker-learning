import { Request, Response } from "express";
import { Student } from "../models/Student";
import {
  uploadImageToS3,
  deleteImageFromS3,
  updateImageInS3,
} from "../utils/s3";

// Create student (teacher creates)
export const createStudent = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const count = await Student.countDocuments({ teacher: user._id });
    if (count >= user.plan.childLimit)
      return res
        .status(403)
        .json({ message: `Student limit reached for ${user.plan.type} plan` });

    const { name, age, email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    if (!/^\d{4}$/.test(code)) {
      return res.status(400).json({ message: "Code must be a 4-digit number" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    let profileImageUrl: string | undefined;

    if (req.file) {
      const file = req.file;
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image files are allowed" });
      }
      profileImageUrl = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);
    }

    const student = new Student({
      name,
      age,
      email,
      code,
      profileImage: profileImageUrl,
      teacher: user._id,
    });

    await student.save();

    res.status(201).json({
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// List students of teacher
export const listStudents = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const students = await Student.find({ teacher: user._id }).select("-code");
    res.status(200).json({
      message: "Students fetched successfully",
      data: students,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search students of teacher
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { query } = req.query;
    const students = await Student.find({
      teacher: user._id,
      name: { $regex: query as string, $options: "i" },
    }).select("-code");
    res.status(200).json({
      message: "Search results",
      data: students,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Edit Student Details
export const editStudentDetails = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name, age, code } = req.body;

    const student = await Student.findOne({ _id: id, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name) student.name = name;
    if (age !== undefined) student.age = age;

    if (code !== undefined) {
      if (!/^\d{4}$/.test(code)) {
        return res.status(400).json({ message: "Code must be a 4-digit number" });
      }
      student.code = code;
    }

    if (req.file) {
      const file = req.file;
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image files are allowed" });
      }
      student.profileImage = await updateImageInS3(
        student.profileImage || null,
        file.buffer,
        file.originalname,
        file.mimetype
      );
    }

    await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const student = await Student.findOne({ _id: id, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.profileImage) {
      try {
        await deleteImageFromS3(student.profileImage);
      } catch (error) {
        console.error("Error deleting profile image:", error);
      }
    }

    await Student.findByIdAndDelete(id);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error" });
  }
};
