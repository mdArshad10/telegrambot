import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { connectDB } from "./src/config/db.js";
import { User } from "./src/model/User.js";
import { Event } from "./src/model/Event.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const bot = new Telegraf(process.env.TELEGRAM_API);

connectDB();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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
  // make openAI API call
  try {
    // const result = await model.generateContent({
    //   message: [
    //     {
    //       role: "system",
    //       content:
    //         "Act as a senior copywriter, you write highly engaging posts for linkedIn, facebook and twitter using provided thoughts/events through the day.",
    //     },
    //     {
    //       role: "user",
    //       content: `Write like a human, for human. Craft three engaging social media posts tailored for linkedIn, facebook and twitter and twitter audiences. Use simple language. Use given time labels just to understand the order of the event, don't mention the iem in the posts, Each post should creatively highlight the following events. Ensure the tone is conversational an Impactful. Focus on Engaging the respective platforms's audience. encouraging interaction, and driving interest in the events:
    //     ${events.map((event) => event.message).join(", ")}
    //     `,
    //     },
    //   ],
    //   generationConfig: {
    //     maxOutputTokens: 100,
    //   },
    // });

    const msg = `Act as a senior copywriter, you write highly engaging posts for linkedIn, facebook and twitter using provided thoughts/events through the day.
    Write like a human, for human. Craft three engaging social media posts tailored for linkedIn, facebook and twitter and twitter audiences. Use simple language. Use given time labels just to understand the order of the event, don't mention the iem in the posts, Each post should creatively highlight the following events. Ensure the tone is conversational an Impactful. Focus on Engaging the respective platforms's audience. encouraging interaction, and driving interest in the events:
        ${events.map((event) => event.message).join(", ")}
    `;

    // store token count

    const result = await model.generateContent(msg);
    const response = result.response;

    const text = response.text();
    console.log(text);
    // send response
    await ctx.reply("doing something");

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
