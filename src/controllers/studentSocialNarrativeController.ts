import { Request, Response } from "express";
import { StudentSocialNarrative } from "../models/StudentSocialNarrative";

export const getMyActiveNarratives = async (req: Request, res: Response) => {
  try {
    const narratives = await StudentSocialNarrative.find({ student: req.student._id, isCompleted: false });
    if (!narratives.length) return res.status(404).json({ message: "No active social narratives assigned" });
    res.status(200).json({ message: "Social narratives fetched successfully", data: narratives });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAllNarratives = async (req: Request, res: Response) => {
  try {
    const narratives = await StudentSocialNarrative.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Social narratives fetched successfully", data: narratives });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getNarrativeById = async (req: Request, res: Response) => {
  try {
    const narrative = await StudentSocialNarrative.findOne({ _id: req.params.id, student: req.student._id });
    if (!narrative) return res.status(404).json({ message: "Social narrative not found" });
    res.status(200).json({ message: "Social narrative fetched successfully", data: narrative });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const completeNarrative = async (req: Request, res: Response) => {
  try {
    const { narrativeId } = req.body;
    if (!narrativeId) return res.status(400).json({ message: "narrativeId is required" });

    const narrative = await StudentSocialNarrative.findOne({
      _id: narrativeId,
      student: req.student._id,
      isCompleted: false,
    });
    if (!narrative) return res.status(404).json({ message: "Social narrative not found or already completed" });

    narrative.isCompleted = true;
    narrative.completedAt = new Date();
    await narrative.save();

    res.status(200).json({ message: "Social narrative marked as complete", data: narrative });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
