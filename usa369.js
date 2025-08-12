const TelegramBot = require('node-telegram-bot-api');

const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';
const bot = new TelegramBot(token, { polling: true });

// کل 13 مرحله با ایموجی‌ها
const allSteps = [
  "انتخاب یک حرف کوچک 🐦‍⬛",
  "انتخاب یک حرف بزرگ 🔥",
  "انتخاب یک عدد 🌚",
  "انتخاب یک نماد خاص 🃏",
  "دوباره یک حرف کوچک 💜",
  "دوباره یک عدد 😈",
  "یک حرف بزرگ دیگر 🐦‍⬛",
  "یک عدد دیگر 🔥",
  "یک نماد متفاوت 🌚",
  "یک حرف کوچک تصادفی 🃏",
  "یک عدد تصادفی 💜",
  "یک حرف بزرگ تصادفی 😈",
  "یک نماد خاص دیگر 🐦‍⬛"
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

  // اول 9 مرحله از بین 13 تا انتخاب می‌کنیم
  const selectedSteps = shuffleArray(allSteps).slice(0, 9);

  // حالا ترتیب همین 9 مرحله رو هم به هم می‌ریزیم
  const randomOrder = shuffleArray(selectedSteps);

  userSequences[chatId] = randomOrder;
  userPositions[chatId] = 0;

  bot.sendMessage(chatId, "🚀 سلام! برای ساخت پسورد، روی «مرحله بعد» بزن و کار رو انجام بده.", {
    reply_markup: {
      keyboard: [["▶️ مرحله بعد"]],
      resize_keyboard: true
    }
  });

  bot.sendMessage(chatId, randomOrder[0]);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (!userSequences[chatId]) return;

  if (msg.text === "▶️ مرحله بعد") {
    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      bot.sendMessage(chatId, sequence[pos]);
    } else {
      bot.sendMessage(chatId, "✅ همه مراحل انجام شد. پسوردت رو کامل کردی! 🎉", {
        reply_markup: { remove_keyboard: true }
      });
      delete userSequences[chatId];
      delete userPositions[chatId];
    }
  }
});
