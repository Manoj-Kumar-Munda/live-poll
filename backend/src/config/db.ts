import mongoose from "mongoose";
import type { Db, MongoClient } from "mongodb";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  const conn = await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected successfully: ${conn.connection.host}`);
}

export function getMongoClient(): MongoClient {
  const client = mongoose.connection.getClient();

  if (!client) {
    throw new Error("MongoDB not connected. Call connectDB() before using auth.");
  }

  return client;
}

export function getAuthDb(): Db {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB not connected. Call connectDB() before using auth.");
  }

  return db;
}
