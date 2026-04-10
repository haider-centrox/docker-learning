import { Schema, model, Document, Types } from "mongoose";

export interface IStudentSocialNarrative extends Document {
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  socialNarrativeId: string; // external ID from frontend
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSocialNarrativeSchema = new Schema<IStudentSocialNarrative>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    socialNarrativeId: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

StudentSocialNarrativeSchema.index({ student: 1 });
StudentSocialNarrativeSchema.index({ teacher: 1 });

export const StudentSocialNarrative = model<IStudentSocialNarrative>("StudentSocialNarrative", StudentSocialNarrativeSchema);
