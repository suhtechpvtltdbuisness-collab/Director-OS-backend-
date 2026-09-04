import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const projectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    product: { type: String, required: true },
    owner: { type: String, required: true },
    health: { type: String, required: true },
    progress: { type: Number, default: 0 },
    deadline: { type: String, default: "" },
    deployStatus: { type: String, default: "Dev" },
    codeStatus: { type: String, default: "" },
    risk: { type: String, default: "Low" },
  },
  { timestamps: true },
);

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Project: Model<ProjectDocument> =
  mongoose.models.Project || mongoose.model<ProjectDocument>("Project", projectSchema);
