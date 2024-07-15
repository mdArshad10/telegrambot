import mongoose from "mongoose";
import { mongoURL } from "../constent.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${mongoURL}/telegramBot`
    );
    console.log(`MongoDB Connected: ${connectionInstance.connection.port}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
