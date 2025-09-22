import mongoose, { Schema, Document, models } from "mongoose";


export interface ICareerApplication extends Document {
 applicationId: string;          // ✅ NEW
    fullName: string;
  email: string;
  phone: string;
  dob: Date;
  position: string;
  joiningAvailability: string;
  houseNo: string;
  area: string;
  city: string;
  state: string;
  country: string;
  experience?: number;              // optional
  qualificationDegree: string;
  qualificationPercent: number;
  resumeUrl?: string;    
  resumePublicId?: string; // ✅ add this    
    status: "Selected" | "Pending" | "Called for Interview" | "Rejected"; // ✅ NEW       // will store file URL or path
  expectedSalary?: number;       // ✅ NEW
    createdAt: Date;
}

const CareerSchema = new Schema<ICareerApplication>(
  {
    
     applicationId: {
  type: String,
  required: true,
  unique: true,
  default: () => `APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
},
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    position: { type: String, required: true },
    joiningAvailability: { type: String, required: true },
    houseNo: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    experience: { type: Number, default: null },
    qualificationDegree: { type: String, required: true },
    qualificationPercent: { type: Number, required: true },
    resumeUrl: { type: String }, 
    resumePublicId: { type: String }, // store Cloudinary public_id
    status: {
      type: String,
      enum: ["Selected", "Pending", "Called for Interview", "Rejected"], // ✅ restrict values
      default: "Pending", // ✅ default status
    },
    expectedSalary: { type: Number, default: null }, // ✅ optional expected salary
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Avoid model overwrite in dev (Next.js hot reload)
export default models.CareerApplication ||
  mongoose.model<ICareerApplication>("CareerApplication", CareerSchema);
