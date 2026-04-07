import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IStudent extends Document {
  name: string;
  age: number;
  email: string;
  code: string; // 4-digit PIN (hashed)
  role: "student";
  profileImage?: string;
  teacher: Types.ObjectId;
  linkedFromTeacher?: {
    teacherId: Types.ObjectId;
    teacherStudentId: Types.ObjectId;
  } | null;
  compareCode(candidate: string): Promise<boolean>;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    age: { type: Number, required: false },
    email: { type: String, required: true, unique: true, lowercase: true },
    code: { type: String, required: true },
    role: { type: String, enum: ["student"], default: "student" },
    profileImage: { type: String, required: false },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    linkedFromTeacher: {
      teacherId: { type: Schema.Types.ObjectId, ref: "User" },
      teacherStudentId: { type: Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

StudentSchema.pre<IStudent>("save", async function (next) {
  if (!this.isModified("code")) return next();
  const salt = await bcrypt.genSalt(10);
  this.code = await bcrypt.hash(this.code, salt);
  next();
});

StudentSchema.methods.compareCode = async function (candidate: string) {
  return bcrypt.compare(candidate, this.code);
};

export const Student = model<IStudent>("Student", StudentSchema);
