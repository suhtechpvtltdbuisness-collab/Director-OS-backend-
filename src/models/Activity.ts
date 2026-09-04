import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const activitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    time: { type: String, required: true },
    actor: { type: String, required: true },
    action: { type: String, required: true },
    area: { type: String, required: true },
  },
  { timestamps: true },
);

export type ActivityDocument = InferSchemaType<typeof activitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Activity: Model<ActivityDocument> =
  mongoose.models.Activity || mongoose.model<ActivityDocument>("Activity", activitySchema);
