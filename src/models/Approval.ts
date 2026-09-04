import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const approvalSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    requestedBy: { type: String, required: true },
    risk: { type: String, required: true },
    detail: { type: String, default: "" },
    status: { type: String, required: true },
  },
  { timestamps: true },
);

export type ApprovalDocument = InferSchemaType<typeof approvalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Approval: Model<ApprovalDocument> =
  mongoose.models.Approval || mongoose.model<ApprovalDocument>("Approval", approvalSchema);
