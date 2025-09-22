import mongoose, { Schema, Document, models } from "mongoose";

export interface IJobPost extends Document {
  postName: string;
  description: string;
  minQualification: string;
  salary?: string;
  openings?: number;
  locations: string[];
  applicationDeadline?: Date;
  workType?: "Remote" | "On-site" | "Hybrid";
  createdAt: Date;
  updatedAt: Date;
}

const JobPostSchema = new Schema<IJobPost>(
  {
    postName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    minQualification: { type: String, required: true, trim: true },
    salary: { type: String, trim: true },
    openings: { type: Number, min: 1 },
    locations: [{ type: String, trim: true }],
    applicationDeadline: { type: Date },
    workType: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
    },
  },
  { timestamps: true }
);

// Avoid model overwrite in dev (Next.js hot reload)
export default models.JobPost ||
  mongoose.model<IJobPost>("JobPost", JobPostSchema);
