// lib/mongodb.ts
import mongoose from "mongoose";

let isConnected = false; // track connection

async function connectToDatabase() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "citywitty", // optional: set your DB name
    });
    isConnected = !!conn.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// Export with both names for backward compatibility
export default connectToDatabase;
export const dbConnect = connectToDatabase;