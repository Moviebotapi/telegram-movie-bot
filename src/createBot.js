const logger = require('./logger');
const Telegraf = require('telegraf');
const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');

const { BOT_TOKEN } = process.env;

const createBot = (config = {}) => {
  const bot = new Telegraf(BOT_TOKEN, config);

  const messageConfig = { parse_mode: 'MarkdownV2' };

  const escapeMarkdown = (message = '') =>
    message
      .replace(/\|/g, '\\|')
      .replace(/\!/g, '\\!')
      .replace(/-/g, '\\-')
      .replace(/\[/g, '\\[')
      .replace(/`/g, '\\`')
      .replace(/\./g, '\\.');

  bot.use(Telegraf.log());

  bot.start((ctx) => {
    logger.log('Start command triggered');

    if (ctx.from.is_bot) {
      return ctx.reply(`Sorry, I only interact with humans!`);
    }

    return ctx.reply(`Hello, ${ctx.from.first_name}`);
  });

  bot.hears(/\/(m|movie) (.+)/, async (ctx) => {
    const movie = ctx.match[2];
    const chatId = ctx.message.chat.id;

    logger.log(`Movie command triggered with phrase '${movie}'`);

    if (ctx.from.is_bot) {
      return ctx.reply(`Sorry, I only interact with humans!`);
    }

    const sendMessage = async (message, options = {}) => {
      if (!message) {
        throw new Error('Telegraf does not allow empty message');
      }

      return ctx.telegram.sendMessage(chatId, escapeMarkdown(message), {
        ...messageConfig,
        ...options,
      });
    };

    try {
      await sendMessage(`_Looking for_ ${movie}...`);

      // Example URL for movie details (Replace with actual URL or API endpoint)
      const url = `${movie}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const title = $("div.banners-right > h1").text().trim();
      const imdb = $("div.jws-imdb").text().trim();
      const desc = $("div.description").text().trim(); // Changed selector to something more likely for description
      const year = $("span.video-years").text().trim();
      const duration = $("span.video-time").text().trim();
      const type1 = $("div.jws-category > a:nth-child(1)").text().trim();
      const type2 = $("div.jws-category > a:nth-child(2)").text().trim();
      const type3 = $("div.jws-category > a:nth-child(3)").text().trim();
      const image = $("div.jws-images > img").attr('src');

      const type = `${type1} | ${type2} | ${type3}`;

      const rawCaption = `*${title}*\n\n${imdb}\n\n${year}\n\n*Year:* ${duration}\n*Rated:* ${type}\n*Released:* ${desc}`;

      const caption = escapeMarkdown(rawCaption);

      return ctx.replyWithPhoto(image, { ...messageConfig, caption });
    } catch (error) {
      logger.error(error.message);
      return sendMessage(error.message);
    }
  });

  return bot;
};

module.exports = createBot;
