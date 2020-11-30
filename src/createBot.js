const logger = require('./logger')
const Telegraf = require('telegraf')

const { BOT_TOKEN, OMDB_API_KEY } = process.env

const createBot = (config = {}) => {
  const bot = new Telegraf(BOT_TOKEN, config)

  const messageConfig = { parse_mode: 'MarkdownV2' }

  const escapeMarkdown = (message = '') =>
    message
      .replace(/\|/g, '\\|')
      .replace(/\!/g, '\\!')
      .replace(/-/g, '\\-')
      .replace(/\[/g, '\\[')
      .replace(/`/g, '\\`')
      .replace(/\./g, '\\.')

  bot.use(Telegraf.log())

  bot.start((ctx) => {
    logger.log('Start command triggered')

    if (ctx.from.is_bot) {
      return ctx.reply(`Sorry I only interact with humans!`)
    }

    return ctx.reply(`Hello, ${ctx.from.first_name}`)
  })

  bot.hears(/\/(m|movie) (.+)/, async (ctx) => {
    const movie = ctx.match[2]
    const chatId = ctx.message.chat.id

    logger.log(`Movie command triggered with phrase '${movie}'`)

    if (ctx.from.is_bot) {
      return ctx.reply(`Sorry I only interact with humans!`)
    }

    const sendMessage = async (message, options = {}) => {
      if (!message) {
        return
      }

      return ctx.telegram.sendMessage(chatId, escapeMarkdown(message), {
        ...messageConfig,
        ...options,
      })
    }

    const url = `http://www.omdbapi.com/?apiKey=${OMDB_API_KEY}&t=${movie}`

    await sendMessage(`_Looking for_ ${movie}...`)

    try {
      const response = await fetch(url)
      const res = await response.json()

      if (res.Error) {
        throw new Error(res.Error)
      }

      const ratings = res.Ratings.map(
        (rating) => `*${rating.Source}:* ${rating.Value}`
      ).join('\n')

      const rawCaption = `*${res.Title}*\n\n${res.Plot}\n\n${ratings}\n\n*Year:* ${res.Year}\n*Rated:* ${res.Rated}\n*Released:* ${res.Released}\n*Runtime:* ${res.Runtime}\n*Genre:* ${res.Genre}\n*Director:* ${res.Director}`

      const caption = escapeMarkdown(rawCaption)

      return ctx.replyWithPhoto(res.Poster, { ...messageConfig, caption })
    } catch (error) {
      logger.error(error.message)
      return sendMessage(error.message)
    }
  })

  return bot
}

module.exports = createBot
