import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_TOKEN } from "../config";

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

let botId: number | undefined;

bot
  .getMe()
  .then((me) => {
    botId = me.id;
    console.log(`Bot started. ID: ${botId}`);
  })
  .catch((error) => {
    console.error("Failed to get bot information:", error);
  });

bot.on('new_chat_members', async (msg) => {
  const newMembers = msg.new_chat_members;

  if (!newMembers || !botId) return;

  for (const member of newMembers) {
    if (member.id === botId) {

      const chatId = msg.chat.id;
      const welcomeMessage = `Hello! Thanks for adding me to this group. I'm here to help manage raids. Use /startraid to begin!`;

      try {
        await bot.sendMessage(chatId, welcomeMessage);
        console.log(`Bot was added to group ${chatId}. Sent welcome message.`);
      } catch (error: any) {
        console.error(`Failed to send welcome message to group ${chatId}:`, error.message);
      }
    }
  }
});

/**
 * Locks the chat by restricting users from sending messages, polls, and other types of messages.
 * @param groupId The ID of the group to lock.
 */
export async function lockChat(groupId: number) {
  try {
    if (botId) {
      await bot.setChatPermissions(groupId, {
        can_send_messages: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
      });
      console.log(`Chat ${groupId} has been locked.`);
    } else {
      throw new Error("Bot ID is not available.");
    }
  } catch (error: any) {
    console.error(`Failed to lock chat ${groupId}:`, error.message);
  }
}

/**
 * Unlocks the chat by restoring permissions to send messages, polls, and other types of messages.
 * @param groupId The ID of the group to unlock.
 */
export async function unlockChat(groupId: number) {
  try {
    if (botId) {
      await bot.setChatPermissions(groupId, {
        can_send_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
      });
      console.log(`Chat ${groupId} has been unlocked.`);
    } else {
      throw new Error("Bot ID is not available.");
    }
  } catch (error: any) {
    console.error(`Failed to unlock chat ${groupId}:`, error.message);
  }
}

/**
 * Sends a raid-related message to a specified chat and returns the message ID.
 * @param chatId The ID of the chat where the message should be sent.
 * @param text The text content of the message.
 * @returns The message ID of the sent message.
 */
export async function sendRaidMessage(
  chatId: number,
  text: string
): Promise<number> {
  try {
    const message = await bot.sendMessage(chatId, text);
    console.log(
      `Raid message sent to chat ${chatId}. Message ID: ${message.message_id}`
    );
    return message.message_id;
  } catch (error: any) {
    console.error(
      `Failed to send raid message to chat ${chatId}:`,
      error.message
    );
    throw error;
  }
}

/**
 * Updates an existing raid-related message in a chat.
 * @param chatId The ID of the chat containing the message.
 * @param messageId The ID of the message to update.
 * @param text The new text content for the message.
 */
export async function updateRaidMessage(
  chatId: number,
  messageId: number,
  text: string
) {
  try {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId });
    console.log(`Raid message ${messageId} updated in chat ${chatId}.`);
  } catch (error: any) {
    console.error(
      `Failed to update raid message ${messageId} in chat ${chatId}:`,
      error.message
    );
    throw error;
  }
}

export default bot;
