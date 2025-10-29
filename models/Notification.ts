import mongoose, { Schema, Document } from "mongoose";

export interface IReadStatus {
  target_id: mongoose.Types.ObjectId | string;
  target_type: "user" | "merchant" | "franchise";
  read: boolean;
  read_at?: Date | null;
}

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "alert" | "update" | "promotion" | "warning" | "pending actions";
  status: "draft" | "sent" | "unsent";
  target_audience: "user" | "merchant" | "franchise" | "all";
  target_ids?: string[];
  icon?: string;
  link?: string;
  is_read: IReadStatus[];
  additional_field?: Record<string, any>;
  expires_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["info", "alert", "update", "promotion", "warning", "pending actions"],
      default: "info",
    },
    status: {
      type: String,
      enum: ["draft", "sent", "unsent"],
      default: "draft",
    },
    target_audience: {
      type: String,
      enum: ["user", "merchant", "franchise", "all"],
      required: true,
    },
    target_ids: [String],
    icon: { type: String, default: "" },
    link: { type: String, default: "" },

    // 👇 Read tracking for each recipient
    is_read: [
      {
        target_id: {
          type: String, // or String if your IDs vary
        },
        target_type: {
          type: String,
          enum: ["user", "merchant", "franchise", "all"],
        },
        read: {
          type: Boolean,
          default: false,
        },
        read_at: {
          type: Date,
          default: null,
        },
      },
    ],

    additional_field: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    expires_at: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
