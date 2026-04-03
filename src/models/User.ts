import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type PlanType = "individual" | "family" | "company";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "teacher" | "admin";
  paymentSuccessfull: boolean;
  isVerified: boolean;
  profileImage?: string;
  plan: {
    type: PlanType;
    childLimit: number;
  };
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },

    paymentSuccessfull: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String },

    plan: {
      type: {
        type: String,
        enum: ["", "individual", "family", "company"],
        default: "",
      },
      childLimit: { type: Number, default: 5 },
    } as any, // 👈 key fix
  },
  { timestamps: true }
);

// hash password before save
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema);
