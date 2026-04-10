import { Schema, model, Document, Types } from "mongoose";

export interface IVisualTimer extends Document {
  teacher: Types.ObjectId;
  title: string;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisualTimerSchema = new Schema<IVisualTimer>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

VisualTimerSchema.index({ teacher: 1 });

export const VisualTimer = model<IVisualTimer>("VisualTimer", VisualTimerSchema);
