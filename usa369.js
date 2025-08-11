const TelegramBot = require('node-telegram-bot-api');

const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';
const bot = new TelegramBot(token, { polling: true });

// مراحل با سوال و ایموجی‌های اختصاصی تو
const steps = [
  "انتخاب یک حرف کوچک 🐦‍⬛",
  "انتخاب یک حرف بزرگ 🔥",
  "انتخاب یک عدد 🌚",
  "انتخاب یک نماد خاص 🃏",
  "انتخاب یک حرف کوچک 💜",
  "انتخاب یک عدد 😈"
];

let userSequences = {};
let userPositions = {};

function shuffleArray(arr) {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const sequence = shuffleArray([0,1,2,3,4,5]);

  userSequences[chatId] = sequence;
  userPositions[chatId] = 0;

  bot.sendMessage(chatId, "🚀 سلام! برای ساخت پسورد، هر بار روی «مرحله بعد» بزن و سوال رو انجام بده.", {
    reply_markup: {
      keyboard: [["▶️ مرحله بعد"]],
      resize_keyboard: true
    }
  });

  bot.sendMessage(chatId, steps[sequence[0]]);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (!userSequences[chatId]) return;

  if (msg.text === "▶️ مرحله بعد") {
    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      bot.sendMessage(chatId, steps[sequence[pos]]);
    } else {
      bot.sendMessage(chatId, "✅ تبریک! همه مراحل تمام شد. پسوردت رو روی کاغذ داری. 🎉", {
        reply_markup: { remove_keyboard: true }
      });
      delete userSequences[chatId];
      delete userPositions[chatId];
    }
  }
});
