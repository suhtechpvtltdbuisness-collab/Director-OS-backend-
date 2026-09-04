import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const alertSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    severity: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, default: "" },
    area: { type: String, default: "" },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type AlertDocument = InferSchemaType<typeof alertSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Alert: Model<AlertDocument> =
  mongoose.models.Alert || mongoose.model<AlertDocument>("Alert", alertSchema);
