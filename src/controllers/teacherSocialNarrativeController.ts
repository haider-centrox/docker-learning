import { Request, Response } from "express";
import { StudentSocialNarrative } from "../models/StudentSocialNarrative";
import { Student } from "../models/Student";

// Assign a social narrative to students
export const assignSocialNarrative = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { socialNarrativeId, studentIds } = req.body;

    if (!socialNarrativeId)
      return res.status(400).json({ message: "socialNarrativeId is required" });

    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return res.status(400).json({ message: "studentIds must be a non-empty array" });

    const results = [];
    for (const studentId of studentIds) {
      const student = await Student.findOne({ _id: studentId, teacher: teacher._id });
      if (!student) { results.push({ studentId, status: "skipped", reason: "Student not found" }); continue; }

      const assigned = new StudentSocialNarrative({
        student: studentId,
        teacher: teacher._id,
        socialNarrativeId,
        isCompleted: false,
      });
      await assigned.save();
      results.push({ studentId, status: "assigned", narrativeId: assigned._id });
    }

    res.status(200).json({ message: "Assignment complete", data: results });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// List all assigned social narratives by this teacher
export const listAssignedNarratives = async (req: Request, res: Response) => {
  try {
    const narratives = await StudentSocialNarrative.find({ teacher: req.user._id })
      .populate("student", "name email profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Assigned narratives fetched successfully", data: narratives });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Unassign a social narrative from a student
export const unassignSocialNarrative = async (req: Request, res: Response) => {
  try {
    const narrative = await StudentSocialNarrative.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user._id,
    });
    if (!narrative) return res.status(404).json({ message: "Assignment not found" });
    res.status(200).json({ message: "Social narrative unassigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
