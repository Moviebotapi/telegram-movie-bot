require('dotenv').config()

const fetch = require('node-fetch')
const { logError, logSuccess } = require('./utils/logger')

const { NETLIFY, DEPLOY_URL, BOT_TOKEN } = process.env

if (!NETLIFY) {
  return
}

const setWebHookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${DEPLOY_URL}/api/bot`

fetch(setWebHookUrl).then(
  () => logSuccess(`Ruccessfully registered webhook to ${DEPLOY_URL}`),
  (error) =>
    logError(`Webhook registration to ${DEPLOY_URL} failed: ${error.message}`)
)
