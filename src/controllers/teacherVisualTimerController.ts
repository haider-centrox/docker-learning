import { Request, Response } from "express";
import { VisualTimer } from "../models/VisualTimer";
import { StudentVisualTimer } from "../models/StudentVisualTimer";
import { Student } from "../models/Student";

export const createVisualTimer = async (req: Request, res: Response) => {
  try {
    const { title, durationMinutes } = req.body;
    if (!title || !durationMinutes)
      return res.status(400).json({ message: "title and durationMinutes are required" });

    const timer = new VisualTimer({ teacher: req.user._id, title, durationMinutes });
    await timer.save();
    res.status(201).json({ message: "Visual timer created successfully", data: timer });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const listVisualTimers = async (req: Request, res: Response) => {
  try {
    const timers = await VisualTimer.find({ teacher: req.user._id });
    res.status(200).json({ message: "Visual timers fetched successfully", data: timers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getVisualTimer = async (req: Request, res: Response) => {
  try {
    const timer = await VisualTimer.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!timer) return res.status(404).json({ message: "Visual timer not found" });
    res.status(200).json({ message: "Visual timer fetched successfully", data: timer });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVisualTimer = async (req: Request, res: Response) => {
  try {
    const timer = await VisualTimer.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!timer) return res.status(404).json({ message: "Visual timer not found" });

    const { title, durationMinutes } = req.body;
    if (title !== undefined) timer.title = title;
    if (durationMinutes !== undefined) timer.durationMinutes = durationMinutes;

    await timer.save();
    res.status(200).json({ message: "Visual timer updated successfully", data: timer });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVisualTimer = async (req: Request, res: Response) => {
  try {
    const timer = await VisualTimer.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!timer) return res.status(404).json({ message: "Visual timer not found" });
    res.status(200).json({ message: "Visual timer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const assignVisualTimer = async (req: Request, res: Response) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return res.status(400).json({ message: "studentIds must be a non-empty array" });

    const timer = await VisualTimer.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!timer) return res.status(404).json({ message: "Visual timer not found" });

    const results = [];
    for (const studentId of studentIds) {
      const student = await Student.findOne({ _id: studentId, teacher: req.user._id });
      if (!student) { results.push({ studentId, status: "skipped", reason: "Student not found" }); continue; }

      const assigned = new StudentVisualTimer({
        student: studentId,
        teacher: req.user._id,
        visualTimer: timer._id,
        title: timer.title,
        durationMinutes: timer.durationMinutes,
        isCompleted: false,
      });
      await assigned.save();
      results.push({ studentId, status: "assigned", timerId: assigned._id });
    }

    res.status(200).json({ message: "Assignment complete", data: results });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const listAssignedTimers = async (req: Request, res: Response) => {
  try {
    const timers = await StudentVisualTimer.find({ teacher: req.user._id, visualTimer: req.params.id })
      .populate("student", "name email profileImage");
    res.status(200).json({ message: "Assigned timers fetched successfully", data: timers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
