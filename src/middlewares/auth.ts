import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import Jwt from "jsonwebtoken";
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authMiddleware(
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
    const user = await User.findById(decoded._id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
