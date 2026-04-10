import { Schema, model, Document, Types } from "mongoose";

export interface IStudentFirstThenChart extends Document {
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  firstThenChart: Types.ObjectId;
  title?: string;
  first: { image: string; label?: string; isCompleted: boolean };
  next: { image: string; label?: string; isCompleted: boolean };
  reward: { image: string; label?: string };
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StepSchema = new Schema(
  { image: { type: String, required: true }, label: { type: String }, isCompleted: { type: Boolean, default: false } },
  { _id: false }
);

const RewardSchema = new Schema(
  { image: { type: String, required: true }, label: { type: String } },
  { _id: false }
);

const StudentFirstThenChartSchema = new Schema<IStudentFirstThenChart>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    firstThenChart: { type: Schema.Types.ObjectId, ref: "FirstThenChart", required: true },
    title: { type: String },
    first: { type: StepSchema, required: true },
    next: { type: StepSchema, required: true },
    reward: { type: RewardSchema, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

StudentFirstThenChartSchema.index({ student: 1 });
StudentFirstThenChartSchema.index({ teacher: 1 });

export const StudentFirstThenChart = model<IStudentFirstThenChart>("StudentFirstThenChart", StudentFirstThenChartSchema);
