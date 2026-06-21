import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

const DEFAULT_CATEGORIES = ["엔터테인먼트", "교육", "게임", "뷰티", "기타"];
const DEFAULT_COUNTRIES = ["한국", "미국", "일본", "기타"];

export interface IChannelPreference extends Document {
  categories: string[];
  countries: string[];
  templates: string[];
  ownerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelPreferenceSchema = new Schema<IChannelPreference>(
  {
    categories: { type: [String], default: DEFAULT_CATEGORIES },
    countries: { type: [String], default: DEFAULT_COUNTRIES },
    templates: { type: [String], default: [] },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development" && mongoose.models.ChannelPreference) {
  mongoose.deleteModel("ChannelPreference");
}

export const ChannelPreference: Model<IChannelPreference> =
  mongoose.models.ChannelPreference ??
  mongoose.model<IChannelPreference>("ChannelPreference", ChannelPreferenceSchema);

export { DEFAULT_CATEGORIES, DEFAULT_COUNTRIES };
