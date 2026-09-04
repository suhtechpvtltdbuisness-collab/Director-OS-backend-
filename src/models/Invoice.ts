import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const invoiceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    client: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    dueDate: { type: String, default: "" },
    daysOverdue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type InvoiceDocument = InferSchemaType<typeof invoiceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Invoice: Model<InvoiceDocument> =
  mongoose.models.Invoice || mongoose.model<InvoiceDocument>("Invoice", invoiceSchema);
