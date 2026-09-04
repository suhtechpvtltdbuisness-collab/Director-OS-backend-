import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const documentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    folder: { type: String, required: true },
    name: { type: String, required: true },
    owner: { type: String, default: "" },
    updated: { type: String, default: "" },
  },
  { timestamps: true },
);

export type DocumentDoc = InferSchemaType<typeof documentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DocumentModel: Model<DocumentDoc> =
  mongoose.models.DocumentItem ||
  mongoose.model<DocumentDoc>("DocumentItem", documentSchema);
