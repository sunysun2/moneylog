import mongoose, { Schema, type Document, type Model } from "mongoose";

export type SignupRequestStatus = "pending" | "approved" | "rejected";

export interface ISignupRequest extends Document {
  loginId: string;
  passwordHash: string;
  nickname: string;
  status: SignupRequestStatus;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SignupRequestSchema = new Schema<ISignupRequest>(
  {
    loginId: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    nickname: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

SignupRequestSchema.index({ loginId: 1, status: 1 });

export const SignupRequest: Model<ISignupRequest> =
  mongoose.models.SignupRequest ??
  mongoose.model<ISignupRequest>("SignupRequest", SignupRequestSchema);
