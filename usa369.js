const TelegramBot = require('node-telegram-bot-api');

const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';

const bot = new TelegramBot(token, { polling: true });

const steps = [
  { text: "🔠 یک حرف بزرگ (A-Z) انتخاب کن", validate: msg => /^[A-Z]$/.test(msg) },
  { text: "🔡 یک حرف کوچک (a-z) انتخاب کن", validate: msg => /^[a-z]$/.test(msg) },
  { text: "🔢 یک عدد (0-9) انتخاب کن", validate: msg => /^[0-9]$/.test(msg) },
  { text: "🔣 یک نماد خاص مثل !@#$%^&* انتخاب کن", validate: msg => /^[!@#$%^&*]$/.test(msg) },
  { text: "🔠 دوباره یک حرف بزرگ (A-Z) انتخاب کن", validate: msg => /^[A-Z]$/.test(msg) },
  { text: "🔢 دوباره یک عدد (0-9) انتخاب کن", validate: msg => /^[0-9]$/.test(msg) }
];

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

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userSteps[chatId] = shuffleArray(steps);
  userIndex[chatId] = 0;

  bot.sendMessage(chatId, "🎯 سلام! بیاید یک پسورد قوی بسازیم.\n\nلطفا فقط کاراکتر خواسته شده رو ارسال کن.", {
    reply_markup: {
      remove_keyboard: true
    }
  });

  // ارسال اولین مرحله
  bot.sendMessage(chatId, userSteps[chatId][userIndex[chatId]].text);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // اگر کاربر هنوز مرحله‌ای نداره یا پیامش دستور استارت هست نادیده بگیر
  if (!userSteps[chatId] || msg.text === '/start') return;

  const currentStep = userSteps[chatId][userIndex[chatId]];

  if (currentStep.validate(msg.text)) {
    // ورودی درست بود، مرحله بعد
    userIndex[chatId]++;
    if (userIndex[chatId] < userSteps[chatId].length) {
      bot.sendMessage(chatId, userSteps[chatId][userIndex[chatId]].text);
    } else {
      bot.sendMessage(chatId, "✅ تبریک! همه مراحل انجام شد و پسوردت کامل است. 🎉");
      delete userSteps[chatId];
      delete userIndex[chatId];
    }
  } else {
    // ورودی اشتباه بود، پیام خطا بده و مجدد همان مرحله را ارسال کن
    bot.sendMessage(chatId, `⚠️ ورودی نامعتبر است! لطفا فقط ${currentStep.text} را ارسال کن.`);
  }
});
