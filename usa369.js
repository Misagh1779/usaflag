const TelegramBot = require('node-telegram-bot-api');

// توکن رباتت رو اینجا قرار بده
const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';

// ساخت ربات با Polling
const bot = new TelegramBot(token, { polling: true });

// مراحل (میتونی این متن‌ها رو تغییر بدی به مراحل واقعی ساخت پسورد)
const steps = [
  "🔠 انتخاب یک حرف بزرگ (A-Z)",
  "🔡 انتخاب یک حرف کوچک (a-z)",
  "🔢 انتخاب یک عدد",
  "🔣 انتخاب یک نماد خاص (@, #, $, ...)",
  "🔠 دوباره یک حرف بزرگ",
  "🔢 دوباره یک عدد"
];

// ذخیره اطلاعات کاربران
let userSteps = {};
let userIndex = {};

// تابع شافل (برای ترتیب تصادفی بدون تکرار)
function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// شروع ربات
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userSteps[chatId] = shuffleArray(steps);
  userIndex[chatId] = 0;

  bot.sendMessage(chatId, "🎯 سلام! بیاید با هم یک پسورد قدرتمند بسازیم.\n\nبرای شروع روی «مرحله بعد» بزنید.", {
    reply_markup: {
      keyboard: [["▶️ مرحله بعد"]],
      resize_keyboard: true
    }
  });
});

// پردازش دکمه مرحله بعد
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "▶️ مرحله بعد" && userSteps[chatId]) {
    const currentStep = userSteps[chatId][userIndex[chatId]];
    bot.sendMessage(chatId, `📍 مرحله ${userIndex[chatId] + 1} از ${userSteps[chatId].length}:\n${currentStep}`);

    userIndex[chatId]++;

    if (userIndex[chatId] >= userSteps[chatId].length) {
      bot.sendMessage(chatId, "✅ همه مراحل تمام شد! پسوردت رو روی کاغذ داری. 💪", {
        reply_markup: {
          remove_keyboard: true
        }
      });
      delete userSteps[chatId];
      delete userIndex[chatId];
    }
  }
});
