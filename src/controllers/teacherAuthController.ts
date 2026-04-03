import e, { Request, Response } from "express";
import { User } from "../models/User";
import { generateOtp } from "../utils/otp";
import { sendEmail } from "../utils/mailer";
import OtpReset from "../models/OtpReset";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  uploadImageToS3,
  deleteImageFromS3,
  updateImageInS3,
} from "../utils/s3";
dotenv.config();

// SIGNUP
export const signup = async (req: Request, res: Response) => {
  try {
    console.log(req)
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    console.log("🚀 ~ signup ~ existingUser:", existingUser)

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    let user = existingUser;

    if (!existingUser) {
      user = new User({
        name,
        email,
        password,
        role: "teacher",
        isVerified: false,
      });
      await user.save();
    }
    await OtpReset.deleteMany({ userId: user!._id });

    const signupOtp = generateOtp(4);

    const generatedOtp = new OtpReset({
      userId: user!._id,
      otp: signupOtp,
    });
    await generatedOtp.save();

    // Send email
    await sendEmail(
      email,
      "Verify your account OTP",
      `<p>Your OTP: <b>${signupOtp}</b></p>`
    );

    return res.status(201).json({
      message: existingUser
        ? "Email not verified. A new OTP has been sent to your email."
        : "Registered successfully. OTP sent to email.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// RESEND SIGNUP OTP
export const resendSignupOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    // Remove previous OTPs
    await OtpReset.deleteMany({ userId: user._id });

    // Generate new OTP
    const otp = generateOtp(4);

    await new OtpReset({
      userId: user._id,
      otp,
    }).save();

    // Send email
    await sendEmail(
      email,
      "Resend Account Verification OTP",
      `<p>Your verification OTP is: <b>${otp}</b></p>`
    );

    return res.json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("🚀 ~ resendSignupOtp ~ error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// RESEND PASSWORD RESET OTP
export const resendResetOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" });

    // Remove old OTPs
    await OtpReset.deleteMany({ userId: user._id });

    const otp = generateOtp(4);

    await new OtpReset({
      userId: user._id,
      otp,
    }).save();

    await sendEmail(
      email,
      "Resend Password Reset OTP",
      `<p>Your password reset OTP is: <b>${otp}</b></p>`
    );

    res.json({ message: "Password reset OTP resent successfully", otp : otp, email: email });
  } catch (error) {
    console.error("🚀 ~ resendResetOtp ~ error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Signup OTP
export const verifySignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });
    const otpRecord = await OtpReset.findOne({ userId: user._id, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
    await OtpReset.deleteMany({ userId: user._id });
    user.isVerified = true;
    await user.save();
    const accessToken = Jwt.sign(
      {
        role: user.role,
        _id: user._id,
      },
      process.env.JWT_SEC as string
    );
    return res.status(200).json({
      message: "User Verified",
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    console.log("🚀 ~ verifySignupOtp ~ error:", error)
    res.status(500).json({ message: "Server error" });
  }
};

export const buyPlan = async (req: Request, res: Response) => {
  const { paymentSuccessfull, plan } = req.body;
  const user = await User.findById({
    _id: req.user?._id,
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.paymentSuccessfull = paymentSuccessfull;
  user.plan.type = plan;
  if (plan === "individual") user.plan.childLimit = 5;
  else if (plan === "family") user.plan.childLimit = 15;
  else if (plan === "company") user.plan.childLimit = 30;
  await user.save();
  const accessToken = Jwt.sign(
    {
      role: user.role,
      _id: user._id,
    },
    process.env.JWT_SEC as string
  );
  res.json({
    message: "Plan updated successfully",
    data: {
      accessToken,
      user,
    },
  });
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  if (!user.isVerified)
    return res.status(403).json({ message: "Email not verified" });

  const token = Jwt.sign(
    {
      role: user.role,
      _id: user._id,
    },
    process.env.JWT_SEC as string
  );
  res.json({
    message: "Login successfully",
    data: {
      accessToken: token,
      user,
    },
  });
};

// Password Reset - Request (generate reset OTP)
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.isVerified)
    return res.status(403).json({ message: "Email not verified" });
  await user.save();
  const resetOtp = generateOtp(4);
  const generatedOtp = new OtpReset({
    userId: user._id,
    otp: resetOtp,
  });
  await generatedOtp.save();
  await sendEmail(
    email,
    "Password Reset OTP",
    `<p>Your password reset OTP: <b>${resetOtp}</b>`
  );

  res.json({ message: "Reset OTP sent to email" });
};

// Verify reset OTP
export const verifyResetOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const otpRecord = await OtpReset.findOne({ userId: user._id, otp });
  if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
  res.json({ message: "OTP verified. You can set new password.", otp : otp, email: email });
};

// Set new password (after verifying otp)
export const setNewPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const otpRecord = await OtpReset.findOne({ userId: user._id, otp });
  if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
  await OtpReset.deleteMany({ userId: user._id });
  user.password = newPassword;
  await user.save();

  res.json({ message: "Password reset successfully" });
};

// Edit Account
export const editAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { name, email } = req.body;
    console.log(req.file);
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Handle profile image upload
    if (req.file) {
      const file = req.file;
      const fileName = file.originalname;
      const mimetype = file.mimetype;

      // Validate file type
      if (!mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image files are allowed" });
      }

      // Update or upload new profile image
      const imageUrl = await updateImageInS3(
        user.profileImage || null,
        file.buffer,
        fileName,
        mimetype
      );

      user.profileImage = imageUrl;
    }

    await user.save();

    // Generate new token with updated info
    const token = Jwt.sign(
      {
        role: user.role,
        _id: user._id,
      },
      process.env.JWT_SEC as string
    );

    // Return user without password
    const { password, ...userObject } = user.toObject();

    res.json({
      message: "Account updated successfully",
      data: {
        accessToken: token,
        user: userObject,
      },
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete profile image from S3 if exists
    if (user.profileImage) {
      try {
        await deleteImageFromS3(user.profileImage);
      } catch (error) {
        console.error("Error deleting profile image:", error);
        // Continue with account deletion even if image deletion fails
      }
    }

    // Delete all OTPs associated with the user
    await OtpReset.deleteMany({ userId: user._id });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
};
