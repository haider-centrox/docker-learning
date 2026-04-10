import { Request, Response } from "express";
import { PictureSchedule } from "../models/PictureSchedule";
import { StudentPictureSchedule } from "../models/StudentPictureSchedule";
import { Student } from "../models/Student";

// Create a picture schedule
export const createPictureSchedule = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { title, pictures, rewardPicture, rewardName } = req.body;

    if (!rewardPicture) {
      return res.status(400).json({ message: "rewardPicture is required" });
    }

    if (!Array.isArray(pictures) || pictures.length === 0) {
      return res.status(400).json({ message: "pictures must be a non-empty array of URLs" });
    }

    const schedule = new PictureSchedule({ teacher: teacher._id, title, pictures, rewardPicture, rewardName });
    await schedule.save();

    res.status(201).json({ message: "Picture schedule created successfully", data: schedule });
  } catch (error) {
    console.error("Error creating picture schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// List all picture schedules by teacher
export const listPictureSchedules = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const schedules = await PictureSchedule.find({ teacher: teacher._id });
    res.status(200).json({ message: "Picture schedules fetched successfully", data: schedules });
  } catch (error) {
    console.error("Error listing picture schedules:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single picture schedule
export const getPictureSchedule = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;

    const schedule = await PictureSchedule.findOne({ _id: id, teacher: teacher._id });
    if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });

    res.status(200).json({ message: "Picture schedule fetched successfully", data: schedule });
  } catch (error) {
    console.error("Error fetching picture schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a picture schedule
export const updatePictureSchedule = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;
    const { title, pictures, rewardPicture, rewardName } = req.body;

    const schedule = await PictureSchedule.findOne({ _id: id, teacher: teacher._id });
    if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });

    if (title !== undefined) schedule.title = title;
    if (rewardPicture) schedule.rewardPicture = rewardPicture;
    if (rewardName !== undefined) schedule.rewardName = rewardName;

    if (pictures !== undefined) {
      if (!Array.isArray(pictures) || pictures.length === 0) {
        return res.status(400).json({ message: "pictures must be a non-empty array of URLs" });
      }
      schedule.pictures = pictures;
    }

    await schedule.save();

    res.status(200).json({ message: "Picture schedule updated successfully", data: schedule });
  } catch (error) {
    console.error("Error updating picture schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a picture schedule
export const deletePictureSchedule = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;

    const schedule = await PictureSchedule.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });

    res.status(200).json({ message: "Picture schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting picture schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign picture schedule to students
export const assignPictureSchedule = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "studentIds must be a non-empty array" });
    }

    const schedule = await PictureSchedule.findOne({ _id: id, teacher: teacher._id });
    if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });

    const results = [];

    for (const studentId of studentIds) {
      const student = await Student.findOne({ _id: studentId, teacher: teacher._id });
      if (!student) {
        results.push({ studentId, status: "skipped", reason: "Student not found" });
        continue;
      }

      const studentSchedule = new StudentPictureSchedule({
        student: studentId,
        teacher: teacher._id,
        pictureSchedule: schedule._id,
        title: schedule.title,
        pictures: schedule.pictures.map((url, i) => ({
          index: i + 1,
          url,
          isCompleted: false,
        })),
        rewardPicture: schedule.rewardPicture,
        rewardName: schedule.rewardName,
        completionPercentage: 0,
        isCompleted: false,
      });

      await studentSchedule.save();
      results.push({ studentId, status: "assigned", studentScheduleId: studentSchedule._id });
    }

    res.status(200).json({ message: "Assignment complete", data: results });
  } catch (error) {
    console.error("Error assigning picture schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// List assigned schedules with student progress
export const listAssignedSchedules = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { id } = req.params;

    const schedules = await StudentPictureSchedule.find({ teacher: teacher._id, pictureSchedule: id })
      .populate("student", "name email profileImage");

    res.status(200).json({ message: "Assigned schedules fetched successfully", data: schedules });
  } catch (error) {
    console.error("Error listing assigned schedules:", error);
    res.status(500).json({ message: "Server error" });
  }
};
