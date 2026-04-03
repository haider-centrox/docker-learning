import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/teacherAuthRoutes";
import studentRoutes from "./routes/studentRoutes";
import studentAuthRoutes from "./routes/studentAuthRoutes";
import studentProgressRoutes from "./routes/studentProgressRoutes";
import studentTokenBoardRoutes from "./routes/studentTokenBoardRoutes";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student-auth", studentAuthRoutes);
app.use("/api/student", studentProgressRoutes);
app.use("/api/student", studentTokenBoardRoutes);

app.get("/", (_req, res) => res.send("API is running"));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI || "").then(() => {
  console.log("Mongo connected");
  app.listen(PORT, () => console.log("Server running on", PORT));
}).catch(err => {
  console.error("Mongo connect error", err);
});
