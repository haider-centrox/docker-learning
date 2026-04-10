import { Schema, model, Document, Types } from "mongoose";

export interface IFirstThenChart extends Document {
  teacher: Types.ObjectId;
  title?: string;
  first: { image: string; label?: string };
  next: { image: string; label?: string };
  reward: { image: string; label?: string };
  createdAt: Date;
  updatedAt: Date;
}

const StepSchema = new Schema({ image: { type: String, required: true }, label: { type: String } }, { _id: false });

const FirstThenChartSchema = new Schema<IFirstThenChart>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    first: { type: StepSchema, required: true },
    next: { type: StepSchema, required: true },
    reward: { type: StepSchema, required: true },
  },
  { timestamps: true }
);

FirstThenChartSchema.index({ teacher: 1 });

export const FirstThenChart = model<IFirstThenChart>("FirstThenChart", FirstThenChartSchema);
