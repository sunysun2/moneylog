import mongoose from "mongoose";

export function isValidMongoId(id: string): boolean {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return String(new mongoose.Types.ObjectId(id)) === id;
}
