require('dotenv').config()

const request = require('request')
const { logError, logSuccess } = require('./utils/logger')

const { NETLIFY, DEPLOY_URL, BOT_TOKEN } = process.env

if (!NETLIFY) {
  return
}

const setWebHookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${DEPLOY_URL}/api/bot`

request(setWebHookUrl, (error, response, body) => {
  if (error || response.statusCode !== 200) {
    return logError(
      `Webhook registration to ${DEPLOY_URL} failed: ${response.statusCode}: ${
        error || body
      }`
    )
  }

  logSuccess(`Ruccessfully registered webhook to ${DEPLOY_URL}`)
})
