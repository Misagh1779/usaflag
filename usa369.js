const TelegramBot = require('node-telegram-bot-api');
const token = 'توکن_خودت';
const bot = new TelegramBot(token, { polling: true });

// گیف‌ها
const startGifFileId = 'CgACAgQAAxkBAAIBD2ibK_3eD8n6og4HewLo5MStAujjAAImGwACse_ZUP7TqlzVH2dbNgQ';
const finishGifFileId = 'CgACAgQAAxkBAAIBHWibMMJY7i_g3siwwcBcpss0HzhWAAIVFgACGP_ZUJ1D8jIOb8gxNgQ';

// ایموجی هر مرحله
const stepEmojis = ['🛡','🪓','🐦‍⬛','🔥','🌚','🃏','💜','😈'];

// مراحل
const allSteps = [
  { text: "یک پسورد 8 کاراکتری با حداقل یک اعداد ، حروف کوچک و بزرگ انگلیسی (Az) و حداقل یکی از کاراکتر های (( @ # - & / _ )) بسازید", emoji: stepEmojis[0] },
  { text: "یکی از اعداد بالا را انتخاب کنید و نماد رومی آن را به پسورد اضافه کنید", photo: 'AgACAgQAAxkBAAIBWWidtX4NNgvAR3bFbirNyd4-yte0AAJ4zTEbWbjpUKk6g4HoqUIMAQADAgADeQADNgQ', emoji: stepEmojis[1] },
  { text: "یکی از عناصر دو حرفی جدول مندلیف را به پسورد اضافه کنید", photo: 'AgACAgQAAxkBAAIBW2idta-YdpZTOMG-dG1OlGXqrHHXAAJ5zTEbWbjpUJ7MUf9RAzayAQADAgADeAADNgQ', emoji: stepEmojis[2] },
  { text: "با اضافه کردن یک عدد جمع اعداد درون پسورد را به مضربی از 3 تبدیل کنید", emoji: stepEmojis[3] },
  { text: "اسم یکی از کشور های درون لیست را به صورت کامل با یک ترتیب دلخواه از حروف کوچک و بزرگ به همراه یک عدد به پسورد اضافه کنید\nسپس\nحرف اول و آخر یک کشور دیگر را به اول و آخر پسورد اضافه کنید", photo: 'AgACAgQAAxkBAAIBXWidtdz6A16L9SFxXJy3Pjwa9p9EAAJ6zTEbWbjpUOh7qkbyIC-hAQADAgADeQADNgQ', emoji: stepEmojis[4] },
  { text: "یکی از حروف صدادار را انتخاب و از پسورد حذف کنید، سپس یکی از حروف صدادار را انتخاب و به 3 جای مختلف از پسورد اضافه کنید", photo: 'AgACAgQAAxkBAAIBX2idth7jxnX9F_fLLajvxi2zpWp-AAJ7zTEbWbjpUGECtz-GrXJzAQADAgADeAADNgQ', emoji: stepEmojis[5] },
  { text: "یکی از حروف صدا دار را انتخاب و با یکی از اعداد 0 تا 9 جایگزین کنید\n\nیکی از حروف بیصدا را انتخاب و با یکی از کاراکتر های ( @ # _ & ! ? ) جایگزین کنید", photo: 'AgACAgQAAxkBAAIBX2idth7jxnX9F_fLLajvxi2zpWp-AAJ7zTEbWbjpUGECtz-GrXJzAQADAgADeAADNgQ', emoji: stepEmojis[6] },
  { text: "یکی از اعداد ( 13  ،  14  ،  15  ،  16 ) را انتخاب و به تعداد آن از کاراکتر های پسورد جدا کنید", emoji: stepEmojis[7] }
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
    // حذف گیف شروع و پیام یادداشت
    if (userSequences[chatId] && userSequences[chatId].gifMessageId) {
      try { await bot.deleteMessage(chatId, userSequences[chatId].gifMessageId); } catch (e) {}
    }
    try { await bot.deleteMessage(chatId, messageId); } catch (e) {}

    // مرحله اول ثابت
    const firstStep = allSteps[0];
    // مراحل وسط تصادفی
    const middleSteps = shuffleArray(allSteps.slice(1, allSteps.length - 1));
    // مرحله آخر ثابت
    const lastStep = allSteps[allSteps.length - 1];

    const fullSequence = [firstStep, ...middleSteps, lastStep];
    userSequences[chatId] = fullSequence;
    userPositions[chatId] = 0;

    const step = fullSequence[0];
    if (step.photo) {
      await bot.sendPhoto(chatId, step.photo, { caption: `${step.emoji}\n\n${step.text}`, reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] } });
    } else {
      await bot.sendMessage(chatId, `${step.emoji}\n\n${step.text}`, { reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] } });
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
        await bot.sendPhoto(chatId, step.photo, { caption: `${step.emoji}\n\n${step.text}`, reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] } });
      } else {
        await bot.sendMessage(chatId, `${step.emoji}\n\n${step.text}`, { reply_markup: { inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]] } });
      }
    } else {
      await bot.sendAnimation(chatId, finishGifFileId, { caption: "پسووردت آماده س!" });
      delete userSequences[chatId];
      delete userPositions[chatId];
    }

    bot.answerCallbackQuery(query.id);
  }
});
