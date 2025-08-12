const TelegramBot = require('node-telegram-bot-api');
const token = '8388235601:AAFF6-QQFvrurlkVQXHbNQy5QPzWE9sPEo0'; // توکن خودت رو اینجا بذار
const bot = new TelegramBot(token, { polling: true });

const gifFileId = 'CgACAgQAAxkBAAIBD2ibK_3eD8n6og4HewLo5MStAujjAAImGwACse_ZUP7TqlzVH2dbNgQ';

const allSteps = [
  "🐦‍⬛ انتخاب یک حرف کوچک",
  "🔥 انتخاب یک حرف بزرگ",
  "🌚 انتخاب یک عدد",
  "🃏 انتخاب یک نماد خاص\nمثال: ! @ # $ % & * ?",
  "💜 دوباره یک حرف کوچک",
  "😈 دوباره یک عدد",
  "🐦‍⬛ یک حرف بزرگ دیگر",
  "🔥 یک عدد دیگر",
  "🌚 یک نماد متفاوت\nمثال: ^ & * ( ) _ - +",
  "🃏 یک حرف کوچک تصادفی",
  "💜 یک عدد تصادفی",
  "😈 یک حرف بزرگ تصادفی",
  "🐦‍⬛ یک نماد خاص دیگر\nمثال: { } [ ] : ; < >"
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

  bot.sendAnimation(chatId, gifFileId, {
    reply_markup: {
      inline_keyboard: [[{ text: "✅ آماده‌ام", callback_data: "start_steps" }]]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (query.data === "start_steps") {
    // انتخاب ۹ مرحله از ۱۳ تا و ترتیب تصادفی
    const selectedSteps = shuffleArray(allSteps).slice(0, 9);
    const randomOrder = shuffleArray(selectedSteps);

    userSequences[chatId] = randomOrder;
    userPositions[chatId] = 0;

    const text = `مرحله 1 از ${randomOrder.length}\n${randomOrder[0]}`;

    bot.editMessageMedia({
      type: 'animation',
      media: gifFileId,
      caption: text,
      parse_mode: 'Markdown'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]]
      }
    });
  }
  else if (query.data === "next_step") {
    if (!userSequences[chatId]) return;

    userPositions[chatId]++;
    const pos = userPositions[chatId];
    const sequence = userSequences[chatId];

    if (pos < sequence.length) {
      const text = `مرحله ${pos + 1} از ${sequence.length}\n${sequence[pos]}`;
      bot.editMessageCaption(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: "▶️ مرحله بعد", callback_data: "next_step" }]]
        }
      });
    } else {
      const summary = sequence.map((s, i) => `${i + 1}. ${s}`).join("\n");
      bot.editMessageCaption(`✅ همه مراحل انجام شد!\n\nمراحل شما:\n${summary}`, {
        chat_id: chatId,
        message_id: messageId
      });
      delete userSequences[chatId];
      delete userPositions[chatId];
    }
  }
});
