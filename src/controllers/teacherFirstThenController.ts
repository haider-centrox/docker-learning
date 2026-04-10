import { Request, Response } from "express";
import { FirstThenChart } from "../models/FirstThenChart";
import { StudentFirstThenChart } from "../models/StudentFirstThenChart";
import { Student } from "../models/Student";

export const createFirstThenChart = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { title, first, next, reward } = req.body;

    if (!first?.image || !next?.image || !reward?.image)
      return res.status(400).json({ message: "first, next, and reward images are required" });

    const chart = new FirstThenChart({ teacher: teacher._id, title, first, next, reward });
    await chart.save();

    res.status(201).json({ message: "First/Then chart created successfully", data: chart });
  } catch (error) {
    console.error("Error creating first/then chart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listFirstThenCharts = async (req: Request, res: Response) => {
  try {
    const charts = await FirstThenChart.find({ teacher: req.user._id });
    res.status(200).json({ message: "Charts fetched successfully", data: charts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getFirstThenChart = async (req: Request, res: Response) => {
  try {
    const chart = await FirstThenChart.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    res.status(200).json({ message: "Chart fetched successfully", data: chart });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateFirstThenChart = async (req: Request, res: Response) => {
  try {
    const chart = await FirstThenChart.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!chart) return res.status(404).json({ message: "Chart not found" });

    const { title, first, next, reward } = req.body;
    if (title !== undefined) chart.title = title;
    if (first) chart.first = first;
    if (next) chart.next = next;
    if (reward) chart.reward = reward;

    await chart.save();
    res.status(200).json({ message: "Chart updated successfully", data: chart });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFirstThenChart = async (req: Request, res: Response) => {
  try {
    const chart = await FirstThenChart.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    res.status(200).json({ message: "Chart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const assignFirstThenChart = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return res.status(400).json({ message: "studentIds must be a non-empty array" });

    const chart = await FirstThenChart.findOne({ _id: req.params.id, teacher: teacher._id });
    if (!chart) return res.status(404).json({ message: "Chart not found" });

    const results = [];
    for (const studentId of studentIds) {
      const student = await Student.findOne({ _id: studentId, teacher: teacher._id });
      if (!student) { results.push({ studentId, status: "skipped", reason: "Student not found" }); continue; }

      const assigned = new StudentFirstThenChart({
        student: studentId,
        teacher: teacher._id,
        firstThenChart: chart._id,
        title: chart.title,
        first: { ...chart.first, isCompleted: false },
        next: { ...chart.next, isCompleted: false },
        reward: chart.reward,
        isCompleted: false,
      });
      await assigned.save();
      results.push({ studentId, status: "assigned", chartId: assigned._id });
    }

    res.status(200).json({ message: "Assignment complete", data: results });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const listAssignedCharts = async (req: Request, res: Response) => {
  try {
    const charts = await StudentFirstThenChart.find({ teacher: req.user._id, firstThenChart: req.params.id })
      .populate("student", "name email profileImage");
    res.status(200).json({ message: "Assigned charts fetched successfully", data: charts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
