import { Request, Response } from "express";
import { TokenBoard } from "../models/TokenBoard";
import { PictureSchedule } from "../models/PictureSchedule";
import { StudentTokenBoard } from "../models/StudentTokenBoard";
import { StudentPictureSchedule } from "../models/StudentPictureSchedule";
import { Student } from "../models/Student";
import { FirstThenChart } from "../models/FirstThenChart";
import { StudentFirstThenChart } from "../models/StudentFirstThenChart";

// GET /api/teacher/tasks — all created tasks (both types)
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const [tokenBoards, pictureSchedules, firstThenCharts] = await Promise.all([
      TokenBoard.find({ teacher: teacher._id }),
      PictureSchedule.find({ teacher: teacher._id }),
      FirstThenChart.find({ teacher: teacher._id }),
    ]);
    res.status(200).json({ message: "Tasks fetched successfully", data: { tokenBoards, pictureSchedules, firstThenCharts } });
  } catch (error) {
    console.error("Error fetching teacher tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/teacher/tasks/assigned — all assigned tasks
export const getAssignedTasks = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const [assignedTokenBoards, assignedPictureSchedules, assignedFirstThenCharts] = await Promise.all([
      StudentTokenBoard.find({ teacher: teacher._id })
        .populate("student", "name email profileImage")
        .populate("tokenBoard", "title")
        .sort({ createdAt: -1 }),
      StudentPictureSchedule.find({ teacher: teacher._id })
        .populate("student", "name email profileImage")
        .populate("pictureSchedule", "title")
        .sort({ createdAt: -1 }),
      StudentFirstThenChart.find({ teacher: teacher._id })
        .populate("student", "name email profileImage")
        .populate("firstThenChart", "title")
        .sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ message: "Assigned tasks fetched successfully", data: { assignedTokenBoards, assignedPictureSchedules, assignedFirstThenCharts } });
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/teacher/tasks/:type/:id — get single task by type and id
export const getTask = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { type, id } = req.params;

    if (type === "tokenboard") {
      const board = await TokenBoard.findOne({ _id: id, teacher: teacher._id });
      if (!board) return res.status(404).json({ message: "Token board not found" });
      return res.status(200).json({ message: "Task fetched successfully", data: board });
    }

    if (type === "pictureschedule") {
      const schedule = await PictureSchedule.findOne({ _id: id, teacher: teacher._id });
      if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });
      return res.status(200).json({ message: "Task fetched successfully", data: schedule });
    }

    return res.status(400).json({ message: "Invalid type. Use 'tokenboard' or 'pictureschedule'" });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/teacher/tasks/:type/:id — update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { type, id } = req.params;

    if (type === "tokenboard") {
      const { title, tokens, rewardUrl, rewardName } = req.body;
      const board = await TokenBoard.findOne({ _id: id, teacher: teacher._id });
      if (!board) return res.status(404).json({ message: "Token board not found" });
      if (title !== undefined) board.title = title;
      if (rewardUrl) board.rewardUrl = rewardUrl;
      if (rewardName !== undefined) board.rewardName = rewardName;
      if (tokens !== undefined) {
        if (!Array.isArray(tokens) || tokens.length < 1 || tokens.length > 5)
          return res.status(400).json({ message: "tokens must be an array of 1 to 5 items" });
        board.tokens = tokens;
      }
      await board.save();
      return res.status(200).json({ message: "Token board updated successfully", data: board });
    }

    if (type === "pictureschedule") {
      const { title, pictures, rewardPicture, rewardName } = req.body;
      const schedule = await PictureSchedule.findOne({ _id: id, teacher: teacher._id });
      if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });
      if (title !== undefined) schedule.title = title;
      if (rewardPicture) schedule.rewardPicture = rewardPicture;
      if (rewardName !== undefined) schedule.rewardName = rewardName;
      if (pictures !== undefined) {
        if (!Array.isArray(pictures) || pictures.length === 0)
          return res.status(400).json({ message: "pictures must be a non-empty array" });
        schedule.pictures = pictures;
      }
      await schedule.save();
      return res.status(200).json({ message: "Picture schedule updated successfully", data: schedule });
    }

    return res.status(400).json({ message: "Invalid type. Use 'tokenboard' or 'pictureschedule'" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/teacher/tasks/:type/:id — delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { type, id } = req.params;

    if (type === "tokenboard") {
      const board = await TokenBoard.findOneAndDelete({ _id: id, teacher: teacher._id });
      if (!board) return res.status(404).json({ message: "Token board not found" });
      return res.status(200).json({ message: "Token board deleted successfully" });
    }

    if (type === "pictureschedule") {
      const schedule = await PictureSchedule.findOneAndDelete({ _id: id, teacher: teacher._id });
      if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });
      return res.status(200).json({ message: "Picture schedule deleted successfully" });
    }

    return res.status(400).json({ message: "Invalid type. Use 'tokenboard' or 'pictureschedule'" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/teacher/tasks/:type/:id/assign — assign a task to students
export const assignTask = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { type, id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return res.status(400).json({ message: "studentIds must be a non-empty array" });

    if (type === "tokenboard") {
      const board = await TokenBoard.findOne({ _id: id, teacher: teacher._id });
      if (!board) return res.status(404).json({ message: "Token board not found" });

      const results = [];
      for (const studentId of studentIds) {
        const student = await Student.findOne({ _id: studentId, teacher: teacher._id });
        if (!student) { results.push({ studentId, status: "skipped", reason: "Student not found" }); continue; }

        const studentBoard = new StudentTokenBoard({
          student: studentId,
          teacher: teacher._id,
          tokenBoard: board._id,
          title: board.title,
          tokens: board.tokens.map((t) => ({ index: t.index, isCompleted: false })),
          rewardUrl: board.rewardUrl,
          rewardName: board.rewardName,
          isCompleted: false,
        });
        await studentBoard.save();
        results.push({ studentId, status: "assigned", studentBoardId: studentBoard._id });
      }
      return res.status(200).json({ message: "Assignment complete", data: results });
    }

    if (type === "pictureschedule") {
      const schedule = await PictureSchedule.findOne({ _id: id, teacher: teacher._id });
      if (!schedule) return res.status(404).json({ message: "Picture schedule not found" });

      const results = [];
      for (const studentId of studentIds) {
        const student = await Student.findOne({ _id: studentId, teacher: teacher._id });
        if (!student) { results.push({ studentId, status: "skipped", reason: "Student not found" }); continue; }

        const studentSchedule = new StudentPictureSchedule({
          student: studentId,
          teacher: teacher._id,
          pictureSchedule: schedule._id,
          title: schedule.title,
          pictures: schedule.pictures.map((url, i) => ({ index: i + 1, url, isCompleted: false })),
          rewardPicture: schedule.rewardPicture,
          rewardName: schedule.rewardName,
          completionPercentage: 0,
          isCompleted: false,
        });
        await studentSchedule.save();
        results.push({ studentId, status: "assigned", studentScheduleId: studentSchedule._id });
      }
      return res.status(200).json({ message: "Assignment complete", data: results });
    }

    return res.status(400).json({ message: "Invalid type. Use 'tokenboard' or 'pictureschedule'" });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/teacher/tasks/:type/unassign/:assignmentId — unassign a task from a student
export const unassignTask = async (req: Request, res: Response) => {
  try {
    const teacher = req.user;
    const { type, assignmentId } = req.params;

    if (type === "tokenboard") {
      const board = await StudentTokenBoard.findOneAndDelete({
        _id: assignmentId,
        teacher: teacher._id,
      });
      if (!board) return res.status(404).json({ message: "Assigned token board not found" });
      return res.status(200).json({ message: "Token board unassigned successfully" });
    }

    if (type === "pictureschedule") {
      const schedule = await StudentPictureSchedule.findOneAndDelete({
        _id: assignmentId,
        teacher: teacher._id,
      });
      if (!schedule) return res.status(404).json({ message: "Assigned picture schedule not found" });
      return res.status(200).json({ message: "Picture schedule unassigned successfully" });
    }

    return res.status(400).json({ message: "Invalid type. Use 'tokenboard' or 'pictureschedule'" });
  } catch (error) {
    console.error("Error unassigning task:", error);
    res.status(500).json({ message: "Server error" });
  }
};
