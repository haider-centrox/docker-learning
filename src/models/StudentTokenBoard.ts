import { Schema, model, Document, Types } from "mongoose";

export interface IStudentToken {
  index: number;
  isCompleted: boolean;
}

export interface IStudentTokenBoard extends Document {
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  tokenBoard: Types.ObjectId;
  title?: string;
  tokens: IStudentToken[];
  rewardUrl: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentTokenSchema = new Schema<IStudentToken>({
  index: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
});

const StudentTokenBoardSchema = new Schema<IStudentTokenBoard>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenBoard: { type: Schema.Types.ObjectId, ref: "TokenBoard", required: true },
    title: { type: String, required: false },
    tokens: { type: [StudentTokenSchema], required: true },
    rewardUrl: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

StudentTokenBoardSchema.index({ student: 1 });
StudentTokenBoardSchema.index({ teacher: 1 });

export const StudentTokenBoard = model<IStudentTokenBoard>(
  "StudentTokenBoard",
  StudentTokenBoardSchema
);
