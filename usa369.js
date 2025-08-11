const TelegramBot = require('node-telegram-bot-api');

const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';
const bot = new TelegramBot(token, { polling: true });

// مراحل ساخت پسورد (مثلا 6 مرحله)
const steps = [
  "مرحله 1: انتخاب یک حرف بزرگ (A-Z)",
  "مرحله 2: انتخاب یک حرف کوچک (a-z)",
  "مرحله 3: انتخاب یک عدد (0-9)",
  "مرحله 4: انتخاب یک نماد خاص (!@#$%^&*)",
  "مرحله 5: دوباره یک حرف بزرگ (A-Z)",
  "مرحله 6: دوباره یک عدد (0-9)"
];

// ذخیره چینش مراحل و موقعیت فعلی برای هر کاربر
let userSequences = {};
let userPositions = {};

// تابع شافل برای چینش تصادفی مراحل
function shuffleArray(arr) {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// دریافت پیام استارت
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // چینش تصادفی اعداد 0 تا 5 (شاخص مراحل)
  const sequence = shuffleArray([0,1,2,3,4,5]);

  userSequences[chatId] = sequence;
  userPositions[chatId] = 0;

  bot.sendMessage(chatId, "🚀 سلام! برای ساخت پسورد قدرتمند، مراحل زیر را به ترتیب انجام بده:\n\nبرای رفتن به مرحله بعد، دکمه «مرحله بعد» را بزن.", {
    reply_markup: {
      keyboard: [["▶️ مرحله بعد"]],
      resize_keyboard: true
    }
  });

  // فرستادن اولین مرحله
  bot.sendMessage(chatId, `📌 ${steps[sequence[0]]}`);
});

// دریافت پیام‌ها برای پیشرفت مراحل
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (!userSequences[chatId]) return; // اگر استارت نزده، کاری نکن

  if (msg.text === "▶️ مرحله بعد") {
    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      bot.sendMessage(chatId, `📌 ${steps[sequence[pos]]}`);
    } else {
      bot.sendMessage(chatId, "✅ تبریک! همه مراحل ساخت پسورد تموم شد. رمزت رو روی کاغذ داری! 🎉", {
        reply_markup: { remove_keyboard: true }
      });
      // حذف داده‌های کاربر
      delete userSequences[chatId];
      delete userPositions[chatId];
    }
  }
});
