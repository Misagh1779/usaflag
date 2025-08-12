const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN';  // توکن خودت رو اینجا بذار
const bot = new TelegramBot(token, { polling: true });

// شناسه فایل گیف شروع و پایان
const startGifFileId = 'CgACAgQAAxkBAAIBD2ibK_3eD8n6og4HewLo5MStAujjAAImGwACse_ZUP7TqlzVH2dbNgQ';
const finishGifFileId = 'CgACAgQAAxkBAAIBHWibMMJY7i_g3siwwcBcpss0HzhWAAIVFgACGP_ZUJ1D8jIOb8gxNgQ';

const allSteps = [
  "🐦‍⬛ انتخاب یک حرف کوچک",
  "🔥 انتخاب یک حرف بزرگ",
  "🌚 انتخاب یک عدد",
  "🃏 انتخاب یک نماد خاص\nمثال: ! @ # $ % & * ?",
  "💜  یک حرف کوچک",
  "😈  یک عدد",
  "🐯 انتخاب یک حرف بزرگ ",
  "🦉 انتخاب یک عدد ",
  "❄️ انتخاب یک نماد \nمثال: ^ & * ( ) _ - +",
  "🗡 انتخاب یک حرف کوچک تصادفی",
  "🕯 انتخاب یک عدد تصادفی",
  "🛡 انتخاب یک حرف بزرگ تصادفی",
  "🪓 انتخاب یک نماد خاص \nمثال: { } [ ] : ; < >"
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

  bot.sendAnimation(chatId, startGifFileId).then((sentGif) => {
    bot.sendMessage(chatId, "آیا آماده‌اید برای ساخت یک پسورد ساسانی؟", {
      reply_markup: {
        inline_keyboard: [[{ text: "✅ آماده‌ام", callback_data: "start_steps" }]]
      }
    });

    userSequences[chatId] = { gifMessageId: sentGif.message_id };
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (query.data === "start_steps") {
    // پیام یادآوری با دکمه اوکی
    await bot.editMessageText("روی کاغذ یادداشت کن. یادت نره!", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [[{ text: "اوکی", callback_data: "start_process" }]]
      }
    });

    bot.answerCallbackQuery(query.id);
  }
  else if (query.data === "start_process") {
    // حذف پیام گیف شروع اگر وجود دارد
    if (userSequences[chatId] && userSequences[chatId].gifMessageId) {
      try {
        await bot.deleteMessage(chatId, userSequences[chatId].gifMessageId);
      } catch (e) {}
    }

    // انتخاب ۹ مرحله رندوم از ۱۳ مرحله
    const selectedSteps = shuffleArray(allSteps).slice(0, 9);
    const randomOrder = shuffleArray(selectedSteps);

    userSequences[chatId] = randomOrder;
    userPositions[chatId] = 0;

    const text = `مرحله 1 از ${randomOrder.length}\n\n${randomOrder[0]}`;

    // نمایش اولین مرحله
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]]
      }
    });

    bot.answerCallbackQuery(query.id);
  }
  else if (query.data === "next_step") {
    if (!userSequences[chatId]) return;

    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      const text = `مرحله ${pos + 1} از ${sequence.length}\n\n${sequence[pos]}`;
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]]
        }
      });
    } else {
      // فقط گیف پایان و پیام
      await bot.editMessageText('پسووردت آماده س!', {
        chat_id: chatId,
        message_id: messageId
      });

      await bot.sendAnimation(chatId, finishGifFileId);

      delete userSequences[chatId];
      delete userPositions[chatId];
    }
    bot.answerCallbackQuery(query.id);
  }
});
