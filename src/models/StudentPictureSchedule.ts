import { Schema, model, Document, Types } from "mongoose";

export interface IPictureItem {
  index: number;
  url: string;
  isCompleted: boolean;
}

export interface IStudentPictureSchedule extends Document {
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  pictureSchedule: Types.ObjectId;
  title?: string;
  pictures: IPictureItem[];
  rewardPicture: string;
  rewardName?: string;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PictureItemSchema = new Schema<IPictureItem>({
  index: { type: Number, required: true },
  url: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

const StudentPictureScheduleSchema = new Schema<IStudentPictureSchedule>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pictureSchedule: { type: Schema.Types.ObjectId, ref: "PictureSchedule", required: true },
    title: { type: String, required: false },
    pictures: { type: [PictureItemSchema], required: true },
    rewardPicture: { type: String, required: true },
    rewardName: { type: String, required: false },
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

StudentPictureScheduleSchema.index({ student: 1 });
StudentPictureScheduleSchema.index({ teacher: 1 });

export const StudentPictureSchedule = model<IStudentPictureSchedule>(
  "StudentPictureSchedule",
  StudentPictureScheduleSchema
);
