import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/telegramBot`
    );
    console.log(`MongoDB Connected: ${connectionInstance.connection.port}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
