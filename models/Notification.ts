import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "alert" | "update" | "promotion" | "warning";
  target_audience: "user" | "merchant" | "franchise" | "all";
  target_ids?: mongoose.Types.ObjectId[]; // Optional specific recipients
  icon?: string;
  expires_at?: Date;
  is_active: boolean;
  is_read: boolean | mongoose.Types.ObjectId[]; // Can store read status or user IDs
  created_at: Date;
  additional_field?: Record<string, any>; // Flexible field for future data
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "alert", "update", "promotion", "warning"],
      default: "info",
    },
    target_audience: {
      type: String,
      enum: ["user", "merchant", "franchise", "all"],
      required: true,
    },
    target_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // or Merchant / Franchise based on context
      },
    ],
    icon: {
      type: String,
      default: "",
    },
    expires_at: {
      type: Date,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_read: {
      type: Schema.Types.Mixed, // can be boolean or array of ObjectIds
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    additional_field: {
      type: Schema.Types.Mixed, // flexible object for extra metadata
      default: {},
    },
  },
  {
    timestamps: false, // we already handle created_at manually
  }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
