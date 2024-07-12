import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    tgId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Events = model("Event", eventSchema);
