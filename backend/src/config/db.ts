import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connects to the MongoDB database using the URI configured in the environment.
 * If the connection fails, it throws an error to be handled by the startup handler.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    throw error;
  }
};
