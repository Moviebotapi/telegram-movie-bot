require('colors')

const logProgress = (msg) => console.info(`\n  ${msg}...\n`.cyan)

const logSuccess = (msg) => console.info(`\n  ${msg}\n`.green.bold)

const logError = (msg) => console.error(`\n  ${msg}\n`.red.bold)

const logger = { log: logProgress, success: logSuccess, error: logError }

module.exports = logger
