import { Request, Response } from "express";
import { StudentTokenBoardProgress } from "../models/StudentTokenBoardProgress";
import { Student } from "../models/Student";
import { ITokenBoardItem } from "../models/StudentTokenBoardProgress";

const defaultTokens = () => [
  { index: 1, isActive: false },
  { index: 2, isActive: false },
  { index: 3, isActive: false },
  { index: 4, isActive: false },
  { index: 5, isActive: false },
];

// Get or Create Token Board for a Student
export const getOrCreateTokenBoard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    let tokenBoard = await StudentTokenBoardProgress.findOne({ studentId });

    if (!tokenBoard) {
      tokenBoard = new StudentTokenBoardProgress({ studentId, tokens: defaultTokens() });
      await tokenBoard.save();
    }

    res.status(200).json({ message: "Token board fetched successfully", data: tokenBoard });
  } catch (error) {
    console.error("Error fetching/creating token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Token Index
export const updateTokenIndex = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;
    const { index, isActive } = req.body;

    if (index === undefined || index < 1 || index > 5) {
      return res.status(400).json({ message: "Index must be between 1 and 5" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    let tokenBoard = await StudentTokenBoardProgress.findOne({ studentId });

    if (!tokenBoard) {
      tokenBoard = new StudentTokenBoardProgress({ studentId, tokens: defaultTokens() });
    }

    const tokenIndex = tokenBoard.tokens.findIndex((t) => t.index === index);
    if (tokenIndex === -1) return res.status(400).json({ message: "Invalid token index" });

    tokenBoard.tokens[tokenIndex].isActive = isActive;
    await tokenBoard.save();

    res.status(200).json({ message: "Token updated successfully", data: tokenBoard });
  } catch (error) {
    console.error("Error updating token:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Reward URL
export const updateRewardUrl = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;
    const { rewardUrl } = req.body;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    let tokenBoard = await StudentTokenBoardProgress.findOne({ studentId });

    if (!tokenBoard) {
      tokenBoard = new StudentTokenBoardProgress({ studentId, tokens: defaultTokens(), rewardUrl: rewardUrl || undefined });
    } else {
      tokenBoard.rewardUrl = rewardUrl || undefined;
    }

    await tokenBoard.save();

    res.status(200).json({ message: "Reward URL updated successfully", data: tokenBoard });
  } catch (error) {
    console.error("Error updating reward URL:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Token Board
export const resetTokenBoard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const tokenBoard = await StudentTokenBoardProgress.findOne({ studentId });
    if (!tokenBoard) return res.status(404).json({ message: "Token board not found" });

    tokenBoard.tokens = tokenBoard.tokens.map((t: ITokenBoardItem) => ({ index: t.index, isActive: false }));
    await tokenBoard.save();

    res.status(200).json({ message: "Token board reset successfully", data: tokenBoard });
  } catch (error) {
    console.error("Error resetting token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Token Board
export const deleteTokenBoard = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, teacher: user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const result = await StudentTokenBoardProgress.findOneAndDelete({ studentId });
    if (!result) return res.status(404).json({ message: "Token board not found" });

    res.status(200).json({ message: "Token board deleted successfully" });
  } catch (error) {
    console.error("Error deleting token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};
