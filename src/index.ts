import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/teacherAuthRoutes";
import studentRoutes from "./routes/studentRoutes";
import studentAuthRoutes from "./routes/studentAuthRoutes";
import studentTokenBoardRoutes from "./routes/studentTokenBoardRoutes";
import teacherTokenBoardRoutes from "./routes/teacherTokenBoardRoutes";
import teacherPictureScheduleRoutes from "./routes/teacherPictureScheduleRoutes";
import studentPictureScheduleRoutes from "./routes/studentPictureScheduleRoutes";
import studentTasksRoutes from "./routes/studentTasksRoutes";
import teacherTasksRoutes from "./routes/teacherTasksRoutes";
import teacherFirstThenRoutes from "./routes/teacherFirstThenRoutes";
import studentFirstThenRoutes from "./routes/studentFirstThenRoutes";
import teacherVisualTimerRoutes from "./routes/teacherVisualTimerRoutes";
import studentVisualTimerRoutes from "./routes/studentVisualTimerRoutes";
import teacherSocialNarrativeRoutes from "./routes/teacherSocialNarrativeRoutes";
import studentSocialNarrativeRoutes from "./routes/studentSocialNarrativeRoutes";
import uploadRoutes from "./routes/uploadRoutes";
dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student-auth", studentAuthRoutes);
app.use("/api/student/tokenboard", studentTokenBoardRoutes);
app.use("/api/student/picture-schedule", studentPictureScheduleRoutes);
app.use("/api/teacher/tokenboards", teacherTokenBoardRoutes);
app.use("/api/teacher/picture-schedules", teacherPictureScheduleRoutes);
app.use("/api/teacher/tasks", teacherTasksRoutes);
app.use("/api/student/tasks", studentTasksRoutes);
app.use("/api/teacher/first-then", teacherFirstThenRoutes);
app.use("/api/student/first-then", studentFirstThenRoutes);
app.use("/api/teacher/visual-timer", teacherVisualTimerRoutes);
app.use("/api/student/visual-timer", studentVisualTimerRoutes);
app.use("/api/teacher/social-narrative", teacherSocialNarrativeRoutes);
app.use("/api/student/social-narrative", studentSocialNarrativeRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (_req, res) => res.send("API is running"));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI || "").then(() => {
  console.log("Mongo connected");
  app.listen(PORT, () => console.log("Server running on", PORT));
}).catch(err => {
  console.error("Mongo connect error", err);
});
