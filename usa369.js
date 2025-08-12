const TelegramBot = require('node-telegram-bot-api');
const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0';
const bot = new TelegramBot(token, { polling: true });

bot.on('animation', (msg) => {
  console.log("GIF File ID:", msg.animation.file_id);
  bot.sendMessage(msg.chat.id, `🎯 File ID شما:\n${msg.animation.file_id}`);
});


const gifFileId = 'CgACAgQAAxkBAAIBD2ibK_3eD8n6og4HewLo5MStAujjAAImGwACse_ZUP7TqlzVH2dbNgQ';

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

  bot.sendAnimation(chatId, gifFileId).then((sentGif) => {
    bot.sendMessage(chatId, "آیا آماده‌اید برای ساخت یک پسورد ساسانی؟", {
      reply_markup: {
        inline_keyboard: [[{ text: "✅ آماده‌ام", callback_data: "start_steps" }]]
      }
    });

    // ذخیره message_id گیف برای حذف بعدی
    userSequences[chatId] = { gifMessageId: sentGif.message_id };
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (query.data === "start_steps") {
    // حذف پیام گیف اول
    if (userSequences[chatId] && userSequences[chatId].gifMessageId) {
      try {
        await bot.deleteMessage(chatId, userSequences[chatId].gifMessageId);
      } catch (e) {
        // اگر حذف نشد، مشکلی نیست
      }
    }

    // انتخاب ۹ مرحله از ۱۳ و ترتیب تصادفی
    const selectedSteps = shuffleArray(allSteps).slice(0, 9);
    const randomOrder = shuffleArray(selectedSteps);

    // ذخیره توابع برای مراحل
    userSequences[chatId] = randomOrder;
    userPositions[chatId] = 0;

    const text = `مرحله 1 از ${randomOrder.length}\n\n${randomOrder[0]}`;

    // ویرایش پیام «آماده ام» به پیام مرحله اول
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]]
      }
    });

    // جواب به callback query برای حذف علامت ساعت در تلگرام
    bot.answerCallbackQuery(query.id);
  }
  else if (query.data === "next_step") {
    if (!userSequences[chatId]) return;

    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      const text = `مرحله ${pos + 1} از ${sequence.length}\n\n${sequence[pos]}`;
      bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]]
        }
      });
    } else {
      const summary = sequence.map((s, i) => `${i + 1}. ${s}`).join("\n");
      bot.editMessageText(`✅ همه مراحل انجام شد!\n\nمراحل شما:\n${summary}`, {
        chat_id: chatId,
        message_id: messageId
      });
      delete userSequences[chatId];
      delete userPositions[chatId];
    }
    bot.answerCallbackQuery(query.id);
  }
});
