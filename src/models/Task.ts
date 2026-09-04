import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const taskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    product: { type: String, required: true },
    assignee: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    due: { type: String, default: "" },
  },
  { timestamps: true },
);

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Task: Model<TaskDocument> =
  mongoose.models.Task || mongoose.model<TaskDocument>("Task", taskSchema);
