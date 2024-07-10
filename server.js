import { Telegraf } from "telegraf";
import { connectDB } from "./src/config/db.js";
import { User } from "./src/model/User.js";

const bot = new Telegraf(process.env.TELEGRAM_API);
bot.start(async (ctx) => {
  try {
    console.log(ctx);
    const from = ctx.update.message;
    await User.findOneAndUpdate(
      { tgId: from.tgId },
      {
        tgId: from.tgId,
        firstName: from.firstName,
        lastName: from.lastName,
        username: from.username,
        isBot: from.isBot,
      },
      {
        new: true,
        upsert: true,
      }
    );
    await ctx.reply(`
      Hey! ${from.firstName}, Welcome. I will be writing highly engaging social media posts for you 🚀 Just keep 
      feeding me with the events throught the day. Let's shine on Social media ✨
      `);
  } catch (error) {
    console.log(error);
    await ctx.reply("some error" + error.message);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
