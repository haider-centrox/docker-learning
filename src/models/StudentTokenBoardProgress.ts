import { Schema, model, Document, Types } from "mongoose";

export interface ITokenBoardItem {
  index: number;
  isActive: boolean;
}

export interface IStudentTokenBoardProgress extends Document {
  studentId: Types.ObjectId;
  tokens: ITokenBoardItem[];
  rewardUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TokenBoardItemSchema = new Schema({
  index: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: false },
});

const StudentTokenBoardProgressSchema = new Schema<IStudentTokenBoardProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    tokens: {
      type: [TokenBoardItemSchema],
      required: true,
      default: () => [
        { index: 1, isActive: false },
        { index: 2, isActive: false },
        { index: 3, isActive: false },
        { index: 4, isActive: false },
        { index: 5, isActive: false },
      ],
    },
    rewardUrl: { type: String, required: false },
  },
  { timestamps: true }
);

export const StudentTokenBoardProgress = model<IStudentTokenBoardProgress>(
  "StudentTokenBoardProgress",
  StudentTokenBoardProgressSchema
);
