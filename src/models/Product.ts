import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    tagline: { type: String, default: "" },
    status: { type: String, required: true },
    health: { type: String, required: true },
    mrr: { type: Number, default: 0 },
    clients: { type: Number, default: 0 },
    stage: { type: String, default: "" },
    marketingStage: { type: String, default: "" },
    owner: { type: String, default: "" },
    launched: { type: String, default: "" },
  },
  { timestamps: true },
);

export type ProductDocument = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", productSchema);
