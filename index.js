require('dotenv').config()
require('colors')

const { BOT_TOKEN, OMDB_API_KEY } = process.env

const logProgress = (message) => console.info(`\n  ${message}...\n`.cyan)
const logSuccess = (message) => console.info(`\n  ${message}\n`.green.bold)
const logError = (message) => console.error(`\n  ${message}\n`.red.bold)

if (!BOT_TOKEN) {
  logError('Fatal error: BOT_TOKEN environment variable is required!')
  process.exit()
}

if (!OMDB_API_KEY) {
  logError('Fatal error: OMDB_API_KEY environment variable is required!')
  process.exit()
}

logProgress('Starting movie finder bot')

const TelegramBot = require('node-telegram-bot-api')
const request = require('request')

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

const escapeMarkdown = (message = '') =>
  message
    .replace(/\|/g, '\\|')
    .replace(/\!/g, '\\!')
    .replace(/-/g, '\\-')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`')
    .replace(/\./g, '\\.')

bot.onText(/\/(m|movie) (.+)/, async (msg, match) => {
  const movie = match[2]
  const chatId = msg.chat.id

  const sendMessage = (message, options = {}) => {
    if (!message) {
      return
    }
    bot.sendMessage(chatId, escapeMarkdown(message), {
      parse_mode: 'MarkdownV2',
      ...options,
    })
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

    bot
      .sendPhoto(chatId, res.Poster, { caption, parse_mode: 'MarkdownV2' })
      .catch((err) => sendMessage(err.message))
  })
})

// Setting up app is needed since Heroku requires PORT to be bound within 60 seconds of deployment
const express = require('express')
const port = process.env.PORT || 3000

express().listen(port, () => logSuccess('Started movie finder bot'))
