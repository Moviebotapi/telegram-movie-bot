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
const request = require('request')

const bot = new Telegraf(BOT_TOKEN)

bot.start((ctx) => {
  if (ctx.from.is_bot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }

  ctx.reply(`Hello, ${ctx.from.first_name}`)
})

bot.hears(/\/(m|movie) (.+)/, async (ctx) => {
  if (ctx.from.is_bot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }

  const movie = ctx.match[2]

  const sendMessage = (message, options = {}) => {
    if (!message) {
      return
    }

    ctx.reply(escapeMarkdown(message), { parse_mode: 'MarkdownV2', ...options })
  }

  const url = `http://www.omdbapi.com/?apiKey=${OMDB_API_KEY}&t=${movie}`

  await sendMessage(`_Looking for_ ${movie}...`)

  request(url, (error, response, body) => {
    const res = JSON.parse(body)

    if (res.Error) {
      return sendMessage(res.Error)
    }

    const ratings = res.Ratings.map(
      (rating) => `*${rating.Source}:* ${rating.Value}`
    ).join('\n')

    const rawCaption = `*${res.Title}*\n\n${res.Plot}\n\n${ratings}\n\n*Year:* ${res.Year}\n*Rated:* ${res.Rated}\n*Released:* ${res.Released}\n*Runtime:* ${res.Runtime}\n*Genre:* ${res.Genre}\n*Director:* ${res.Director}`

    const caption = escapeMarkdown(rawCaption)

    ctx
      .replyWithPhoto(res.Poster, { caption, parse_mode: 'MarkdownV2' })
      .catch((err) => sendMessage(err.message))
  })
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
