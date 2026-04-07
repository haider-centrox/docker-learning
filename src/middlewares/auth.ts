import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Student } from "../models/Student";
import Jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      student?: any;
    }
  }
}

// Verifies teacher JWT and attaches user to req.user
export async function teacherMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authenticated" });
  const token = auth.split(" ")[1];
  try {
    const decoded: any = Jwt.verify(token, process.env.JWT_SEC as string);
    if (decoded.role !== "teacher")
      return res.status(403).json({ message: "Access denied: teachers only" });
    const user = await User.findById(decoded._id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Verifies student JWT and attaches student to req.student
export async function studentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authenticated" });
  const token = auth.split(" ")[1];
  try {
    const decoded: any = Jwt.verify(token, process.env.JWT_SEC as string);
    if (decoded.role !== "student")
      return res.status(403).json({ message: "Access denied: students only" });
    const student = await Student.findById(decoded.studentId).select("-code");
    if (!student) return res.status(401).json({ message: "Student not found" });
    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Kept for backward compatibility
export const authMiddleware = teacherMiddleware;
