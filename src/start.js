require('dotenv').config()

const logger = require('./logger')

const { BOT_TOKEN } = process.env

if (!BOT_TOKEN) {
  logger.error('Fatal error: BOT_TOKEN environment variable is required!')
  process.exit()
} else {
  require('./createBot')()
}
