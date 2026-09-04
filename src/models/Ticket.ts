import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ticketSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    client: { type: String, required: true },
    subject: { type: String, required: true },
    product: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    updated: { type: String, default: "" },
  },
  { timestamps: true },
);

export type TicketDocument = InferSchemaType<typeof ticketSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Ticket: Model<TicketDocument> =
  mongoose.models.Ticket || mongoose.model<TicketDocument>("Ticket", ticketSchema);
