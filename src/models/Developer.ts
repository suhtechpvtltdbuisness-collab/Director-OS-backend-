import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const developerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    avatarColor: { type: String, default: "#3B82F6" },
    workload: { type: Number, default: 0 },
    status: { type: String, required: true },
    attendance: { type: String, required: true },
    location: { type: String, default: "" },
    task: { type: String, default: "" },
    blockers: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type DeveloperDocument = InferSchemaType<typeof developerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Developer: Model<DeveloperDocument> =
  mongoose.models.Developer ||
  mongoose.model<DeveloperDocument>("Developer", developerSchema);
