const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const webappUrl = process.env.DOMAIN + '/?userId=' + userId;
  bot.sendMessage(chatId, 'Open CPA Fly Mini App: ' + webappUrl);
});

console.log('Bot started');
