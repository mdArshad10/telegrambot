import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { connectDB } from "./src/config/db.js";
import { User } from "./src/model/User.js";
import { Event } from "./src/model/Event.js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const bot = new Telegraf(process.env.TELEGRAM_API);

connectDB();

bot.start(async (ctx) => {
  const from = ctx.update.message.from;
  try {
    await User.findOneAndUpdate(
      { tgId: from.id },
      {
        $setOnInsert: {
          tgId: from.id,
          firstName: from.first_name,
          lastName: from.last_name,
          username: from.first_name + from.last_name,
          isBot: from.is_bot,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    await ctx.reply(`
      Hey! ${from.first_name}, Welcome. I will be writing highly engaging social media posts for you 🚀 Just keep 
      feeding me with the events throught the day. Let's shine on Social media ✨
      `);
  } catch (error) {
    console.log(error);
    await ctx.reply("some error" + error.message);
  }
});

bot.command("generate", async (ctx) => {
  const from = ctx.update.message.from;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // get events for the user
  const events = await Event.find({
    tgId: from.id,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (events.length == 0) {
    await ctx.reply("No events for the day.");
    return;
  }

  console.log("Events", events);
  // make openAI API call

  // store token count

  // send response

  await ctx.reply("doing something");
});

bot.on(message("text"), async (ctx) => {
  const from = ctx.update.message.from;
  const message = ctx.update.message.text;
  try {
    console.log(`User ${from.first_name} said: ${message}`);
    await Event.create({
      message,
      tgId: from.id,
    });
    await ctx.reply(
      `Notes 👍, Kep texting me your thoughts. To generate the posts, Just enter the comment: /generate`
    );
  } catch (error) {
    console.log(error);
    await ctx.reply("Facing some difficulties, plz try again later.");
  }
});


bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
