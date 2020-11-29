const escapeMarkdown = (message = '') =>
  message
    .replace(/\|/g, '\\|')
    .replace(/\!/g, '\\!')
    .replace(/-/g, '\\-')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`')
    .replace(/\./g, '\\.')

module.exports = escapeMarkdown
