const logger = require('../src/logger')
const createBot = require('../src/createBot')

const bot = createBot({ telegram: { webhookReply: false } })

exports.handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body))
    return { statusCode: 200, body: '' }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 400,
      body: 'This endpoint is meant for bot and telegram communication',
    }
  }
}
