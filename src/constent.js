import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const mongoURL = process.env.MONGODB_URL;

const telegramAPI = process.env.TELEGRAM_API;
const googleAPI = process.env.GOOGLE_API_KEY;

export { mongoURL, telegramAPI, googleAPI };
