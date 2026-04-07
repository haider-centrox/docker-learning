import { Request, Response } from "express";
import { StudentTokenBoard } from "../models/StudentTokenBoard";

// Get student's active assigned token board
export const getMyTokenBoard = async (req: Request, res: Response) => {
  try {
    const student = req.student;

    const board = await StudentTokenBoard.findOne({
      student: student._id,
      isCompleted: false,
    });

    if (!board) {
      return res.status(404).json({ message: "No active token board assigned" });
    }

    res.status(200).json({ message: "Token board fetched successfully", data: board });
  } catch (error) {
    console.error("Error fetching student token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all token boards (including completed ones)
export const getMyAllTokenBoards = async (req: Request, res: Response) => {
  try {
    const student = req.student;

    const boards = await StudentTokenBoard.find({ student: student._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Token boards fetched successfully", data: boards });
  } catch (error) {
    console.error("Error fetching student token boards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a token as completed
export const completeToken = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const { index } = req.body;

    if (typeof index !== "number" || index < 1 || index > 5) {
      return res.status(400).json({ message: "index must be a number between 1 and 5" });
    }

    const board = await StudentTokenBoard.findOne({
      student: student._id,
      isCompleted: false,
    });

    if (!board) {
      return res.status(404).json({ message: "No active token board found" });
    }

    const tokenIndex = board.tokens.findIndex((t) => t.index === index);
    if (tokenIndex === -1) {
      return res.status(400).json({ message: "Token index not found on this board" });
    }

    board.tokens[tokenIndex].isCompleted = true;
    await board.save();

    res.status(200).json({ message: "Token marked as completed", data: board });
  } catch (error) {
    console.error("Error completing token:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark the entire board as complete
export const completeBoard = async (req: Request, res: Response) => {
  try {
    const student = req.student;

    const board = await StudentTokenBoard.findOne({
      student: student._id,
      isCompleted: false,
    });

    if (!board) {
      return res.status(404).json({ message: "No active token board found" });
    }

    board.isCompleted = true;
    board.completedAt = new Date();
    await board.save();

    res.status(200).json({ message: "Token board marked as complete", data: board });
  } catch (error) {
    console.error("Error completing board:", error);
    res.status(500).json({ message: "Server error" });
  }
};
