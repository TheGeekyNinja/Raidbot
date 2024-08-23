import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_TOKEN } from '../config';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

let botId: number | undefined;

bot.getMe().then((me) => {
  botId = me.id;
  console.log(`Bot started. ID: ${botId}`);
});

export async function lockChat(groupId: number) {
  if (botId) {
    await bot.setChatPermissions(groupId, {
      can_send_messages: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
    });
  } else {
    console.error("Bot ID is not available.");
  }
}

export async function unlockChat(groupId: number) {
  if (botId) {
    await bot.setChatPermissions(groupId, {
      can_send_messages: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });
  } else {
    console.error("Bot ID is not available.");
  }
}

export async function sendRaidMessage(chatId: number, text: string): Promise<number> {
  const message = await bot.sendMessage(chatId, text);
  return message.message_id;
}

export async function updateRaidMessage(chatId: number, messageId: number, text: string) {
  await bot.editMessageText(text, { chat_id: chatId, message_id: messageId });
}

export default bot;