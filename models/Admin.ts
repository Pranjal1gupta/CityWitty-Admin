// import mongoose from "mongoose";

// const AdminSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true },
//   phone: { type: String, default: "" },
//   address: { type: String, default: "" },
//   role: { type: String, default: "admin" },
//   lastLogin: { type: Date, default: Date.now },
// }, { timestamps: true, strict: false });

// export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);


import mongoose, { Schema, Document, Model } from "mongoose";

interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
  lastLogin?: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    role: { type: String, default: "admin" },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true, strict: false }
);

// 👇 Remove casting to avoid potential runtime issues
const Admin =
  mongoose.models.Admin ||
  mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
