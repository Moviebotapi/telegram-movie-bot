const logProgress = (msg) => console.info(`\n  ${msg}...\n`.cyan)

const logSuccess = (msg) => console.info(`\n  ${msg}\n`.green.bold)

const logError = (msg) => console.error(`\n  ${msg}\n`.red.bold)

module.exports = { logProgress, logSuccess, logError }
