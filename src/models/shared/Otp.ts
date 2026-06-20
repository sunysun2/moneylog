import { Schema } from "mongoose";

export const OtpSchema = new Schema(
  {
    label: { type: String, default: "" },
    secret: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

export type OtpEntry = {
  label: string;
  secret: string;
  notes: string;
};
