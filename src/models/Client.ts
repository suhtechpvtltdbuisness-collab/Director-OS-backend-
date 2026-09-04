import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const clientSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    product: { type: String, required: true },
    value: { type: Number, default: 0 },
    status: { type: String, required: true },
    since: { type: String, default: "" },
    contact: { type: String, default: "" },
  },
  { timestamps: true },
);

export type ClientDocument = InferSchemaType<typeof clientSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Client: Model<ClientDocument> =
  mongoose.models.Client || mongoose.model<ClientDocument>("Client", clientSchema);
