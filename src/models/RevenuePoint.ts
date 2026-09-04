import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const revenuePointSchema = new Schema(
  {
    month: { type: String, required: true },
    revenue: { type: Number, required: true },
    target: { type: Number, required: true },
  },
  { timestamps: true },
);

export type RevenuePointDocument = InferSchemaType<typeof revenuePointSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RevenuePoint: Model<RevenuePointDocument> =
  mongoose.models.RevenuePoint ||
  mongoose.model<RevenuePointDocument>("RevenuePoint", revenuePointSchema);
