require('dotenv').config()

const { logError, logProgress, logSuccess } = require('./utils/logger')
const escapeMarkdown = require('./utils/escapeMarkdown')

const { BOT_TOKEN, OMDB_API_KEY } = process.env

if (!BOT_TOKEN) {
  logError('Fatal error: BOT_TOKEN environment variable is required!')
  process.exit()
}

if (!OMDB_API_KEY) {
  logError('Fatal error: OMDB_API_KEY environment variable is required!')
  process.exit()
}

logProgress('Starting movie finder bot')

const Telegraf = require('telegraf')
const fetch = require('node-fetch')

const config = { telegram: { webhookReply: false } }

const bot = new Telegraf(BOT_TOKEN, config)

bot.use(Telegraf.log())

bot.start((ctx) => {
  logProgress('Start command triggered')

  if (ctx.from.is_bot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }

  return ctx.reply(`Hello, ${ctx.from.first_name}`)
})

bot.hears(/\/(m|movie) (.+)/, async (ctx) => {
  const movie = ctx.match[2]
  const chatId = ctx.message.chat.id

  console.log(`Movie command triggered with phrase '${movie}'`)

  if (ctx.from.is_bot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }

  const sendMessage = async (message, options = {}) => {
    if (!message) {
      return
    }

    return ctx.telegram.sendMessage(chatId, escapeMarkdown(message), {
      parse_mode: 'MarkdownV2',
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

    return ctx.replyWithPhoto(res.Poster, { caption, parse_mode: 'MarkdownV2' })
  } catch (error) {
    logError(error.message)
    return sendMessage(error.message)
  }
})

exports.handler = async (event) => {
  try {
    console.log('handler fired')
    console.log(event)
    await bot.handleUpdate(JSON.parse(event.body))
    return { statusCode: 200, body: '' }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 400,
      body: 'This endpoint is meant for bot and telegram communication',
    }
  }
}

logSuccess('Movie finder bot started')
