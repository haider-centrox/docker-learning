import { Request, Response } from "express";
import { StudentPictureSchedule } from "../models/StudentPictureSchedule";

// Get all active picture schedules
export const getMyPictureSchedule = async (req: Request, res: Response) => {
  try {
    const student = req.student;

    const schedules = await StudentPictureSchedule.find({
      student: student._id,
      isCompleted: false,
    });

    if (!schedules.length) {
      return res.status(404).json({ message: "No active picture schedule assigned" });
    }

    res.status(200).json({ message: "Picture schedules fetched successfully", data: schedules });
  } catch (error) {
    console.error("Error fetching picture schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single picture schedule by ID
export const getPictureScheduleById = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const { id } = req.params;

    const schedule = await StudentPictureSchedule.findOne({ _id: id, student: student._id });
    if (!schedule) {
      return res.status(404).json({ message: "Picture schedule not found" });
    }

    res.status(200).json({ message: "Picture schedule fetched successfully", data: schedule });
  } catch (error) {
    console.error("Error fetching picture schedule by id:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all picture schedules including completed
export const getMyAllPictureSchedules = async (req: Request, res: Response) => {
  try {
    const student = req.student;

    const schedules = await StudentPictureSchedule.find({ student: student._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Picture schedules fetched successfully", data: schedules });
  } catch (error) {
    console.error("Error fetching picture schedules:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a picture as completed — requires scheduleId
export const completePicture = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const { scheduleId, index } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ message: "scheduleId is required" });
    }

    if (typeof index !== "number" || index < 1) {
      return res.status(400).json({ message: "index must be a positive number" });
    }

    const schedule = await StudentPictureSchedule.findOne({
      _id: scheduleId,
      student: student._id,
      isCompleted: false,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Picture schedule not found or already completed" });
    }

    const picIndex = schedule.pictures.findIndex((p) => p.index === index);
    if (picIndex === -1) {
      return res.status(400).json({ message: "Picture index not found on this schedule" });
    }

    schedule.pictures[picIndex].isCompleted = true;

    const completedCount = schedule.pictures.filter((p) => p.isCompleted).length;
    schedule.completionPercentage = Math.round((completedCount / schedule.pictures.length) * 100);

    await schedule.save();

    res.status(200).json({ message: "Picture marked as completed", data: schedule });
  } catch (error) {
    console.error("Error completing picture:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark entire schedule as complete — requires scheduleId
export const completeSchedule = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ message: "scheduleId is required" });
    }

    const schedule = await StudentPictureSchedule.findOne({
      _id: scheduleId,
      student: student._id,
      isCompleted: false,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Picture schedule not found or already completed" });
    }

    schedule.isCompleted = true;
    schedule.completionPercentage = 100;
    schedule.completedAt = new Date();
    schedule.pictures = schedule.pictures.map((p) => ({
      index: p.index,
      url: p.url,
      isCompleted: true,
    })) as any;

    await schedule.save();

    res.status(200).json({
      message: "Picture schedule completed",
      data: { schedule, reward: schedule.rewardPicture, rewardName: schedule.rewardName },
    });
  } catch (error) {
    console.error("Error completing schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};
