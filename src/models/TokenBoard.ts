import { Schema, model, Document, Types } from "mongoose";

export interface ITokenItem {
  index: number;
}

export interface ITokenBoard extends Document {
  teacher: Types.ObjectId;
  title?: string;
  tokens: ITokenItem[]; // up to 5 tokens (index only)
  rewardUrl: string;
  rewardName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TokenItemSchema = new Schema<ITokenItem>({
  index: { type: Number, required: true },
});

const TokenBoardSchema = new Schema<ITokenBoard>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: false },
    tokens: {
      type: [TokenItemSchema],
      required: true,
      validate: {
        validator: (v: ITokenItem[]) => v.length >= 1 && v.length <= 5,
        message: "Token board must have between 1 and 5 tokens",
      },
    },
    rewardUrl: { type: String, required: true },
    rewardName: { type: String, required: false },
  },
  { timestamps: true }
);

TokenBoardSchema.index({ teacher: 1 });

export const TokenBoard = model<ITokenBoard>("TokenBoard", TokenBoardSchema);
