const fetch = require('node-fetch')
const logger = require('./logger')

const { NETLIFY, DEPLOY_URL, BOT_TOKEN } = process.env

if (!NETLIFY) {
  return
}

const setWebHookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${DEPLOY_URL}/api/bot`

fetch(setWebHookUrl).then(
  () => logger.success(`Ruccessfully registered webhook to ${DEPLOY_URL}`),
  (error) =>
    logger.error(
      `Webhook registration to ${DEPLOY_URL} failed: ${error.message}`
    )
)
