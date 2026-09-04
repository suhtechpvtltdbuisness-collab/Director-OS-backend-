import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const campaignSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    product: { type: String, required: true },
    channel: { type: String, default: "" },
    budget: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    status: { type: String, required: true },
    start: { type: String, default: "" },
    end: { type: String, default: "" },
  },
  { timestamps: true },
);

export type CampaignDocument = InferSchemaType<typeof campaignSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Campaign: Model<CampaignDocument> =
  mongoose.models.Campaign || mongoose.model<CampaignDocument>("Campaign", campaignSchema);
