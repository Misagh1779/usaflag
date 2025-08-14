const TelegramBot = require('node-telegram-bot-api');
const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0'; // توکن خودت
const bot = new TelegramBot(token, { polling: true });

// گیف‌ها
const startGifFileId = 'CgACAgQAAxkBAAIBD2ibK_3eD8n6og4HewLo5MStAujjAAImGwACse_ZUP7TqlzVH2dbNgQ';
const finishGifFileId = 'CgACAgQAAxkBAAIBHWibMMJY7i_g3siwwcBcpss0HzhWAAIVFgACGP_ZUJ1D8jIOb8gxNgQ';

// مراحل با ایموجی و عکس (متن فقط پشت‌صحنه)
const allSteps = [
  { text: "یک پسورد 8 کاراکتری ...", emoji: "🛡" },
  { text: "یکی از اعداد بالا را انتخاب کنید ...", emoji: "🪓", photo: 'AgACAgQAAxkBAAIBWWidtX4NNgvAR3bFbirNyd4-yte0AAJ4zTEbWbjpUKk6g4HoqUIMAQADAgADeQADNgQ' },
  { text: "یکی از عناصر دو حرفی جدول مندلیف ...", emoji: "🐦‍⬛", photo: 'AgACAgQAAxkBAAIBW2idta-YdpZTOMG-dG1OlGXqrHHXAAJ5zTEbWbjpUJ7MUf9RAzayAQADAgADeAADNgQ' },
  { text: "با اضافه کردن یک عدد جمع اعداد ...", emoji: "🔥" },
  { text: "اسم یکی از کشورها ...", emoji: "🌚", photo: 'AgACAgQAAxkBAAIBXWidtdz6A16L9SFxXJy3Pjwa9p9EAAJ6zTEbWbjpUOh7qkbyIC-hAQADAgADeQADNgQ' },
  { text: "یکی از حروف صدادار را حذف و ...", emoji: "🃏", photo: 'AgACAgQAAxkBAAIBX2idth7jxnX9F_fLLajvxi2zpWp-AAJ7zTEbWbjpUGECtz-GrXJzAQADAgADeAADNgQ' },
  { text: "یکی از حروف صدادار و بیصدا را جایگزین ...", emoji: "💜", photo: 'AgACAgQAAxkBAAIBX2idth7jxnX9F_fLLajvxi2zpWp-AAJ7zTEbWbjpUGECtz-GrXJzAQADAgADeAADNgQ' },
  { text: "یکی از اعداد (13,14,15,16) ...", emoji: "😈" }
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
    // حذف پیام "روی کاغذ یادداشت کن"
    try { await bot.deleteMessage(chatId, messageId); } catch (e) {}

    // حذف گیف شروع
    if (userSequences[chatId] && userSequences[chatId].gifMessageId) {
      try { await bot.deleteMessage(chatId, userSequences[chatId].gifMessageId); } catch (e) {}
    }

    // مرحله اول همیشه ثابت
    const firstStep = allSteps[0];
    const middleSteps = shuffleArray(allSteps.slice(1, allSteps.length - 1));
    const lastStep = allSteps[allSteps.length - 1];

    const sequence = [firstStep, ...middleSteps, lastStep];
    userSequences[chatId] = sequence;
    userPositions[chatId] = 0;

    const step = sequence[0];
    if (step.photo) {
      await bot.sendPhoto(chatId, step.photo, { caption: `مرحله 1 از ${sequence.length}\n\n${step.emoji}`, reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] }});
    } else {
      await bot.sendMessage(chatId, `مرحله 1 از ${sequence.length}\n\n${step.emoji}`, { reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] }});
    }

    bot.answerCallbackQuery(query.id);
  }
  else if (query.data === "next_step") {
    if (!userSequences[chatId]) return;

    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      const step = sequence[pos];
      try { await bot.deleteMessage(chatId, messageId); } catch (e) {}
      if (step.photo) {
        await bot.sendPhoto(chatId, step.photo, { caption: `مرحله ${pos + 1} از ${sequence.length}\n\n${step.emoji}`, reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] }});
      } else {
        await bot.sendMessage(chatId, `مرحله ${pos + 1} از ${sequence.length}\n\n${step.emoji}`, { reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] }});
      }
    } else {
      await bot.sendAnimation(chatId, finishGifFileId, { caption: "پسووردت آماده س!" });
      delete userSequences[chatId];
      delete userPositions[chatId];
    }
    bot.answerCallbackQuery(query.id);
  }
});
