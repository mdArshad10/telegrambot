import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    tgId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    promptTokens: {
      type: Number,
      required: true,
    },
    completeTokens: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
