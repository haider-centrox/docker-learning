import { Request, Response } from "express";
import { StudentTokenBoard } from "../models/StudentTokenBoard";
import { StudentPictureSchedule } from "../models/StudentPictureSchedule";
import { StudentFirstThenChart } from "../models/StudentFirstThenChart";
import { StudentVisualTimer } from "../models/StudentVisualTimer";

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const [tokenBoards, pictureSchedules, firstThenCharts, visualTimers] = await Promise.all([
      StudentTokenBoard.find({ student: student._id }).sort({ createdAt: -1 }),
      StudentPictureSchedule.find({ student: student._id }).sort({ createdAt: -1 }),
      StudentFirstThenChart.find({ student: student._id }).sort({ createdAt: -1 }),
      StudentVisualTimer.find({ student: student._id }).sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ message: "Tasks fetched successfully", data: { tokenBoards, pictureSchedules, firstThenCharts, visualTimers } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyActiveTasks = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const [tokenBoards, pictureSchedules, firstThenCharts, visualTimers] = await Promise.all([
      StudentTokenBoard.find({ student: student._id, isCompleted: false }).sort({ createdAt: -1 }),
      StudentPictureSchedule.find({ student: student._id, isCompleted: false }).sort({ createdAt: -1 }),
      StudentFirstThenChart.find({ student: student._id, isCompleted: false }).sort({ createdAt: -1 }),
      StudentVisualTimer.find({ student: student._id, isCompleted: false }).sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ message: "Active tasks fetched successfully", data: { tokenBoards, pictureSchedules, firstThenCharts, visualTimers } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyCompletedTasks = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const [tokenBoards, pictureSchedules, firstThenCharts, visualTimers] = await Promise.all([
      StudentTokenBoard.find({ student: student._id, isCompleted: true }).sort({ completedAt: -1 }),
      StudentPictureSchedule.find({ student: student._id, isCompleted: true }).sort({ completedAt: -1 }),
      StudentFirstThenChart.find({ student: student._id, isCompleted: true }).sort({ completedAt: -1 }),
      StudentVisualTimer.find({ student: student._id, isCompleted: true }).sort({ completedAt: -1 }),
    ]);
    res.status(200).json({ message: "Completed tasks fetched successfully", data: { tokenBoards, pictureSchedules, firstThenCharts, visualTimers } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyTaskById = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const { type, id } = req.params;

    if (type === "tokenboard") {
      const board = await StudentTokenBoard.findOne({ _id: id, student: student._id });
      if (!board) return res.status(404).json({ message: "Token board not found" });
      return res.status(200).json({ message: "Task fetched successfully", data: board });
    }
    if (type === "pictureschedule") {
      const schedule = await StudentPictureSchedule.findOne({ _id: id, student: student._id });
      if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });
      return res.status(200).json({ message: "Task fetched successfully", data: schedule });
    }
    if (type === "firstthen") {
      const chart = await StudentFirstThenChart.findOne({ _id: id, student: student._id });
      if (!chart) return res.status(404).json({ message: "First/Then chart not found" });
      return res.status(200).json({ message: "Task fetched successfully", data: chart });
    }
    if (type === "visualtimer") {
      const timer = await StudentVisualTimer.findOne({ _id: id, student: student._id });
      if (!timer) return res.status(404).json({ message: "Visual timer not found" });
      return res.status(200).json({ message: "Task fetched successfully", data: timer });
    }

    return res.status(400).json({ message: "Invalid type. Use 'tokenboard', 'pictureschedule', 'firstthen', or 'visualtimer'" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
