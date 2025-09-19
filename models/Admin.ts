import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  role: { type: String, default: "admin" },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true, strict: false });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
