import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoURI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;