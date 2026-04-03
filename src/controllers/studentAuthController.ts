import { Request, Response } from "express";
import { Student } from "../models/Student";
import Jwt from "jsonwebtoken";

// Student Login — student uses email + 4-digit code
export const studentLogin = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Invalid credentials" });

    const ok = await student.compareCode(code);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = Jwt.sign(
      { role: "student", studentId: student._id },
      process.env.JWT_SEC as string
    );

    res.status(200).json({
      message: "Student logged in successfully",
      data: {
        accessToken: token,
        student,
      },
    });
  } catch (error) {
    console.error("Error logging in student:", error);
    res.status(500).json({ message: "Server error" });
  }
};
