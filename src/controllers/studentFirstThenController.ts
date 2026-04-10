import { Request, Response } from "express";
import { StudentFirstThenChart } from "../models/StudentFirstThenChart";

export const getMyActiveCharts = async (req: Request, res: Response) => {
  try {
    const charts = await StudentFirstThenChart.find({ student: req.student._id, isCompleted: false });
    if (!charts.length) return res.status(404).json({ message: "No active First/Then charts assigned" });
    res.status(200).json({ message: "Charts fetched successfully", data: charts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAllCharts = async (req: Request, res: Response) => {
  try {
    const charts = await StudentFirstThenChart.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Charts fetched successfully", data: charts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getChartById = async (req: Request, res: Response) => {
  try {
    const chart = await StudentFirstThenChart.findOne({ _id: req.params.id, student: req.student._id });
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    res.status(200).json({ message: "Chart fetched successfully", data: chart });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark "first" step as completed
export const completeFirstStep = async (req: Request, res: Response) => {
  try {
    const { chartId } = req.body;
    if (!chartId) return res.status(400).json({ message: "chartId is required" });

    const chart = await StudentFirstThenChart.findOne({ _id: chartId, student: req.student._id, isCompleted: false });
    if (!chart) return res.status(404).json({ message: "Chart not found or already completed" });

    chart.first.isCompleted = true;
    await chart.save();
    res.status(200).json({ message: "First step completed", data: chart });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark "next" step as completed
export const completeNextStep = async (req: Request, res: Response) => {
  try {
    const { chartId } = req.body;
    if (!chartId) return res.status(400).json({ message: "chartId is required" });

    const chart = await StudentFirstThenChart.findOne({ _id: chartId, student: req.student._id, isCompleted: false });
    if (!chart) return res.status(404).json({ message: "Chart not found or already completed" });

    chart.next.isCompleted = true;
    await chart.save();
    res.status(200).json({ message: "Next step completed", data: chart });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Complete entire chart and unlock reward
export const completeChart = async (req: Request, res: Response) => {
  try {
    const { chartId } = req.body;
    if (!chartId) return res.status(400).json({ message: "chartId is required" });

    const chart = await StudentFirstThenChart.findOne({ _id: chartId, student: req.student._id, isCompleted: false });
    if (!chart) return res.status(404).json({ message: "Chart not found or already completed" });

    chart.first.isCompleted = true;
    chart.next.isCompleted = true;
    chart.isCompleted = true;
    chart.completedAt = new Date();
    await chart.save();

    res.status(200).json({ message: "Chart completed", data: { chart, reward: chart.reward } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
