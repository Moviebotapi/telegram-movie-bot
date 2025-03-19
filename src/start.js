require('dotenv').config()

const logger = require('./logger')

const { BOT_TOKEN, NETLIFY } = process.env

if (!BOT_TOKEN) {
  logger.error('Fatal error: BOT_TOKEN environment variable is required!')
  process.exit()
} 

if (NETLIFY) {  
  require('./registerWebhook')
} else {  
  require('./createBot')()
}
