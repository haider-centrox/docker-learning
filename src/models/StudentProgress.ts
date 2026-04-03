import { Schema, model, Document, Types } from "mongoose";

export interface IProgressImage {
  index: number;
  url: string;
}

export interface IStudentProgress extends Document {
  studentId: Types.ObjectId;
  images: IProgressImage[];
  rewardImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressImageSchema = new Schema({
  index: { type: Number, required: true },
  url: { type: String, required: true },
});

const StudentProgressSchema = new Schema<IStudentProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    images: { type: [ProgressImageSchema], default: [] },
    rewardImage: { type: String, required: false },
  },
  { timestamps: true }
);

StudentProgressSchema.index({ studentId: 1, createdAt: -1 });

export const StudentProgress = model<IStudentProgress>("StudentProgress", StudentProgressSchema);
