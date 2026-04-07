import { Request, Response } from "express";
import { TokenBoard } from "../models/TokenBoard";
import { StudentTokenBoard } from "../models/StudentTokenBoard";
import { Student } from "../models/Student";

// Create a token board template
export const createTokenBoard = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { title, tokens, rewardUrl } = req.body;

    if (!rewardUrl) {
      return res.status(400).json({ message: "rewardUrl is required" });
    }

    if (!Array.isArray(tokens) || tokens.length < 1 || tokens.length > 5) {
      return res.status(400).json({ message: "tokens must be an array of 1 to 5 items" });
    }

    for (const t of tokens) {
      if (typeof t.index !== "number") {
        return res.status(400).json({ message: "Each token must have index (number)" });
      }
    }

    const board = new TokenBoard({ teacher: teacher._id, title, tokens, rewardUrl });
    await board.save();

    res.status(201).json({ message: "Token board created successfully", data: board });
  } catch (error) {
    console.error("Error creating token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// List all token boards created by teacher
export const listTokenBoards = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const boards = await TokenBoard.find({ teacher: teacher._id });
    res.status(200).json({ message: "Token boards fetched successfully", data: boards });
  } catch (error) {
    console.error("Error listing token boards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single token board
export const getTokenBoard = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;

    const board = await TokenBoard.findOne({ _id: id, teacher: teacher._id });
    if (!board) return res.status(404).json({ message: "Token board not found" });

    res.status(200).json({ message: "Token board fetched successfully", data: board });
  } catch (error) {
    console.error("Error fetching token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a token board template
export const updateTokenBoard = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;
    const { title, tokens, rewardUrl } = req.body;

    const board = await TokenBoard.findOne({ _id: id, teacher: teacher._id });
    if (!board) return res.status(404).json({ message: "Token board not found" });

    if (title) board.title = title;
    if (rewardUrl) board.rewardUrl = rewardUrl;

    if (tokens !== undefined) {
      if (!Array.isArray(tokens) || tokens.length < 1 || tokens.length > 5) {
        return res.status(400).json({ message: "tokens must be an array of 1 to 5 items" });
      }
      board.tokens = tokens;
    }

    await board.save();

    res.status(200).json({ message: "Token board updated successfully", data: board });
  } catch (error) {
    console.error("Error updating token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a token board template
export const deleteTokenBoard = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;

    const board = await TokenBoard.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!board) return res.status(404).json({ message: "Token board not found" });

    res.status(200).json({ message: "Token board deleted successfully" });
  } catch (error) {
    console.error("Error deleting token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign a token board to one or more students
export const assignTokenBoard = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;
    const { studentIds } = req.body; // array of student IDs

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "studentIds must be a non-empty array" });
    }

    const board = await TokenBoard.findOne({ _id: id, teacher: teacher._id });
    if (!board) return res.status(404).json({ message: "Token board not found" });

    const results = [];

    for (const studentId of studentIds) {
      // Verify student belongs to this teacher
      const student = await Student.findOne({ _id: studentId, teacher: teacher._id });
      if (!student) {
        results.push({ studentId, status: "skipped", reason: "Student not found" });
        continue;
      }

      // Check if student already has an active (incomplete) board
      const existing = await StudentTokenBoard.findOne({ student: studentId, isCompleted: false });
      if (existing) {
        results.push({ studentId, status: "skipped", reason: "Student already has an active token board" });
        continue;
      }

      // Create a copy of the board for this student
      const studentBoard = new StudentTokenBoard({
        student: studentId,
        teacher: teacher._id,
        tokenBoard: board._id,
        title: board.title,
        tokens: board.tokens.map((t) => ({
          index: t.index,
          isCompleted: false,
        })),
        rewardUrl: board.rewardUrl,
        isCompleted: false,
      });

      await studentBoard.save();
      results.push({ studentId, status: "assigned", studentBoardId: studentBoard._id });
    }

    res.status(200).json({ message: "Assignment complete", data: results });
  } catch (error) {
    console.error("Error assigning token board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// List all assigned boards (teacher view — see all students' progress)
export const listAssignedBoards = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;

    const boards = await StudentTokenBoard.find({ teacher: teacher._id, tokenBoard: id })
      .populate("student", "name email profileImage");

    res.status(200).json({ message: "Assigned boards fetched successfully", data: boards });
  } catch (error) {
    console.error("Error listing assigned boards:", error);
    res.status(500).json({ message: "Server error" });
  }
};
