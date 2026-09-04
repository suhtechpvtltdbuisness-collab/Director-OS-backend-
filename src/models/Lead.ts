import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const leadSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    product: { type: String, required: true },
    value: { type: Number, default: 0 },
    source: { type: String, default: "Website" },
    stage: { type: String, required: true },
    owner: { type: String, default: "" },
    updated: { type: String, default: "" },
  },
  { timestamps: true },
);

export type LeadDocument = InferSchemaType<typeof leadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Lead: Model<LeadDocument> =
  mongoose.models.Lead || mongoose.model<LeadDocument>("Lead", leadSchema);
