import { Schema, model, Document, Types } from "mongoose";

export interface IStudentVisualTimer extends Document {
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  visualTimer: Types.ObjectId;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentVisualTimerSchema = new Schema<IStudentVisualTimer>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visualTimer: { type: Schema.Types.ObjectId, ref: "VisualTimer", required: true },
    title: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

StudentVisualTimerSchema.index({ student: 1 });
StudentVisualTimerSchema.index({ teacher: 1 });

export const StudentVisualTimer = model<IStudentVisualTimer>("StudentVisualTimer", StudentVisualTimerSchema);
