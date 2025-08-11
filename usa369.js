const TelegramBot = require('node-telegram-bot-api');

// جایگزین کردن با توکن جدید و امن شما
const token = 'YOUR_NEW_BOT_TOKEN';

// ساخت ربات با polling
const bot = new TelegramBot(token, { polling: true });

// لیست مراحل (میتونی متن هر مرحله رو به جای عدد بذاری)
const steps = [
  "مرحله 1: یک حرف بزرگ انتخاب کن",
  "مرحله 2: یک حرف کوچک انتخاب کن",
  "مرحله 3: یک عدد انتخاب کن",
  "مرحله 4: یک نماد خاص انتخاب کن",
  "مرحله 5: دوباره یک حرف بزرگ انتخاب کن",
  "مرحله 6: دوباره یک عدد انتخاب کن"
];

// ذخیره ترتیب مراحل برای هر کاربر
let userSteps = {};
let userIndex = {};

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// وقتی کاربر /start می‌زند
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // ترتیب مراحل تصادفی
  userSteps[chatId] = shuffleArray(steps);
  userIndex[chatId] = 0;

  bot.sendMessage(chatId, "سلام! بیاید پسورد بسازیم 😎", {
    reply_markup: {
      keyboard: [["مرحله بعد"]],
      resize_keyboard: true
    }
  });

  // اولین مرحله رو نشون بده
  bot.sendMessage(chatId, userSteps[chatId][userIndex[chatId]]);
});

// وقتی کاربر "مرحله بعد" می‌زند
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "مرحله بعد" && userSteps[chatId]) {
    userIndex[chatId]++;

    if (userIndex[chatId] < userSteps[chatId].length) {
      bot.sendMessage(chatId, userSteps[chatId][userIndex[chatId]]);
    } else {
      bot.sendMessage(chatId, "✅ همه مراحل تمام شد! پسوردت رو داری 😁", {
        reply_markup: {
          remove_keyboard: true
        }
      });

      // پاک کردن داده کاربر بعد پایان
      delete userSteps[chatId];
      delete userIndex[chatId];
    }
  }
});
