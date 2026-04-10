import { Request, Response } from "express";
import { StudentVisualTimer } from "../models/StudentVisualTimer";

export const getMyActiveTimers = async (req: Request, res: Response) => {
  try {
    const timers = await StudentVisualTimer.find({ student: req.student._id, isCompleted: false });
    if (!timers.length) return res.status(404).json({ message: "No active visual timers assigned" });
    res.status(200).json({ message: "Visual timers fetched successfully", data: timers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAllTimers = async (req: Request, res: Response) => {
  try {
    const timers = await StudentVisualTimer.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Visual timers fetched successfully", data: timers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTimerById = async (req: Request, res: Response) => {
  try {
    const timer = await StudentVisualTimer.findOne({ _id: req.params.id, student: req.student._id });
    if (!timer) return res.status(404).json({ message: "Visual timer not found" });
    res.status(200).json({ message: "Visual timer fetched successfully", data: timer });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const completeTimer = async (req: Request, res: Response) => {
  try {
    const { timerId } = req.body;
    if (!timerId) return res.status(400).json({ message: "timerId is required" });

    const timer = await StudentVisualTimer.findOne({ _id: timerId, student: req.student._id, isCompleted: false });
    if (!timer) return res.status(404).json({ message: "Visual timer not found or already completed" });

    timer.isCompleted = true;
    timer.completedAt = new Date();
    await timer.save();

    res.status(200).json({ message: "Visual timer marked as complete", data: timer });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
