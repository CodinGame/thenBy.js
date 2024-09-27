// This file is not named .eslintrc.js to avoid being picked up by @nx/eslint for the whole project
module.exports = {
  root: true,
  extends: ['@codingame/eslint-config', 'prettier'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**']
}
