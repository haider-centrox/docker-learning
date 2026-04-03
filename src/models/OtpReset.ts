import mongoose, { Model, Schema, Document } from "mongoose";

export interface IOtpResetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  otp: string;
}

const otpResetSchema: Schema<IOtpResetDocument> = new Schema<IOtpResetDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OtpReset: Model<IOtpResetDocument> = mongoose.model<IOtpResetDocument>(
  "OtpReset",
  otpResetSchema
);
export default OtpReset;
