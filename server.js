import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_API);
bot.start(async (ctx) => {
  console.log(ctx);
  await ctx.reply("welcome to the bot");
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
