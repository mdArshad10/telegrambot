import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { connectDB } from "./config/db.js";
import { User } from "./model/User.js";
import { Events } from "./model/Event.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { googleAPI, telegramAPI } from "./constent.js";

const bot = new Telegraf(telegramAPI);

connectDB();

const genAI = new GoogleGenerativeAI(googleAPI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      Hey! ${from.first_name}, Welcome. I will be writing highly engaging social media posts for you 🚀 Just keep feeding me with the events throught the day. Let's shine on Social media ✨
      `);
  } catch (error) {
    console.log(error);
    await ctx.reply("some error" + error.message);
  }
});

bot.command("generate", async (ctx) => {
  const from = ctx.update.message.from;

  const { message_id } = await ctx.reply(`
    Hey ${from.first_name}, kindly wait for a moment. I am creating posts for you🚀⏳.
    `);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // get events for the user
  const events = await Events.find({
    tgId: from.id,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (events.length == 0) {
    await ctx.deleteMessage(message_id);
    await ctx.reply("No events for the day.");
    return;
  }

  try {
    // make API Calls in google generative AI
    const msg = `Act as a senior copywriter, you write highly engaging posts for linkedIn, facebook and twitter using provided thoughts/events through the day.
    Write like a human, for human. Craft three engaging social media posts tailored for linkedIn, facebook and twitter and twitter audiences. Use simple language. Use given time labels just to understand the order of the event, don't mention the iem in the posts, Each post should creatively highlight the following events. Ensure the tone is conversational an Impactful. Focus on Engaging the respective platforms's audience. encouraging interaction, and driving interest in the events:
        ${events.map((event) => event.message).join(", ")}
    `;

    const result = await model.generateContent(msg);
    const response = result.response;

    const text = response.text();

    // store token count
    await User.findOneAndUpdate(
      { tgId: from.id },
      {
        $inc: {
          promptTokens: response.usageMetadata.promptTokenCount,
          completeTokens: response.usageMetadata.totalTokenCount,
        },
      }
    );

    // send response
    await ctx.reply(text);

    // delete message
    await ctx.deleteMessage(message_id);
  } catch (error) {
    console.log(error);
    await ctx.reply("facing some error  connecting with google api");
  }
});

bot.on(message("text"), async (ctx) => {
  const from = ctx.update.message.from;
  const message = ctx.update.message.text;
  try {
    console.log(`User ${from.first_name} said: ${message}`);
    await Events.create({
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
