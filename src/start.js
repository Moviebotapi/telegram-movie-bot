require('dotenv').config()

const logger = require('./logger')

const { BOT_TOKEN, OMDB_API_KEY, NETLIFY } = process.env

if (!BOT_TOKEN) {
  logger.error('Fatal error: BOT_TOKEN environment variable is required!')
  process.exit()
}

if (!OMDB_API_KEY) {
  logger.error('Fatal error: OMDB_API_KEY environment variable is required!')
  process.exit()
}

if (NETLIFY) {
  require('./registerWebhook')
}
