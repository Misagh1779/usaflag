const TelegramBot = require('node-telegram-bot-api');
const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';  // توکن بات رو اینجا بذار
const bot = new TelegramBot(token, { polling: true });

// شناسه فایل گیف شروع
const startGifFileId = 'CgACAgQAAxkBAAIBD2ibK_3eD8n6og4HewLo5MStAujjAAImGwACse_ZUP7TqlzVH2dbNgQ';
// شناسه فایل گیف پایان (اینو جایگزین کردیم)
const finishGifFileId = 'CgACAgQAAxkBAAIBHWibMMJY7i_g3siwwcBcpss0HzhWAAIVFgACGP_ZUJ1D8jIOb8gxNgQ';

const allSteps = [
  "🐦‍⬛ انتخاب یک حرف کوچک",
  "🔥 انتخاب یک حرف بزرگ",
  "🌚 انتخاب یک عدد",
  "🃏 انتخاب یک نماد خاص\nمثال: ! @ # $ % & * ?",
  "💜 دوباره یک حرف کوچک",
  "😈 دوباره یک عدد",
  "🐯 انتخاب یک حرف بزرگ دیگر",
  "🦉 انتخاب یک عدد دیگر",
  "❄️ انتخاب یک نماد متفاوت\nمثال: ^ & * ( ) _ - +",
  "🗡 انتخاب یک حرف کوچک تصادفی",
  "🕯 انتخاب یک عدد تصادفی",
  "🛡 انتخاب یک حرف بزرگ تصادفی",
  "🪓 انتخاب یک نماد خاص دیگر\nمثال: { } [ ] : ; < >"
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
    // پیام یادآوری
    await bot.sendMessage(chatId, "روی کاغذ یادداشت کن. یادت نره!");

    // حذف پیام گیف شروع
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

    // ویرایش پیام آماده‌ام به مرحله اول
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
      const summary = sequence.map((s, i) => `${i + 1}. ${s}`).join("\n");
      await bot.editMessageText(`✅ همه مراحل انجام شد!\n\nمراحل شما:\n${summary}`, {
        chat_id: chatId,
        message_id: messageId
      });

      await bot.sendAnimation(chatId, finishGifFileId, {
        caption: 'پسووردت آماده س!'
      });

      delete userSequences[chatId];
      delete userPositions[chatId];
    }
    bot.answerCallbackQuery(query.id);
  }
});
