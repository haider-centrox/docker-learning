import { Schema, model, Document, Types } from "mongoose";

export interface IPictureSchedule extends Document {
  teacher: Types.ObjectId;
  title?: string;
  pictures: string[]; // array of image URLs
  rewardPicture: string;
  rewardName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PictureScheduleSchema = new Schema<IPictureSchedule>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: false },
    pictures: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: "At least one picture URL is required",
      },
    },
    rewardPicture: { type: String, required: true },
    rewardName: { type: String, required: false },
  },
  { timestamps: true }
);

PictureScheduleSchema.index({ teacher: 1 });

export const PictureSchedule = model<IPictureSchedule>("PictureSchedule", PictureScheduleSchema);
