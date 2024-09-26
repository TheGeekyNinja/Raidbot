"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockChat = lockChat;
exports.unlockChat = unlockChat;
exports.sendRaidMessage = sendRaidMessage;
exports.updateRaidMessage = updateRaidMessage;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const config_1 = require("../config");
const bot = new node_telegram_bot_api_1.default(config_1.TELEGRAM_TOKEN, { polling: true });
let botId;
bot
    .getMe()
    .then((me) => {
    botId = me.id;
    console.log(`Bot started. ID: ${botId}`);
})
    .catch((error) => {
    console.error("Failed to get bot information:", error);
});
bot.on('new_chat_members', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const newMembers = msg.new_chat_members;
    if (!newMembers || !botId)
        return;
    for (const member of newMembers) {
        if (member.id === botId) {
            const chatId = msg.chat.id;
            const welcomeMessage = `Hello! Thanks for adding me to this group. I'm here to help manage raids. Use /startraid to begin!`;
            try {
                yield bot.sendMessage(chatId, welcomeMessage);
                console.log(`Bot was added to group ${chatId}. Sent welcome message.`);
            }
            catch (error) {
                console.error(`Failed to send welcome message to group ${chatId}:`, error.message);
            }
        }
    }
}));
/**
 * Locks the chat by restricting users from sending messages, polls, and other types of messages.
 * @param groupId The ID of the group to lock.
 */
function lockChat(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (botId) {
                yield bot.setChatPermissions(groupId, {
                    can_send_messages: false,
                    can_send_polls: false,
                    can_send_other_messages: false,
                    can_add_web_page_previews: false,
                });
                console.log(`Chat ${groupId} has been locked.`);
            }
            else {
                throw new Error("Bot ID is not available.");
            }
        }
        catch (error) {
            console.error(`Failed to lock chat ${groupId}:`, error.message);
        }
    });
}
/**
 * Unlocks the chat by restoring permissions to send messages, polls, and other types of messages.
 * @param groupId The ID of the group to unlock.
 */
function unlockChat(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (botId) {
                yield bot.setChatPermissions(groupId, {
                    can_send_messages: true,
                    can_send_polls: true,
                    can_send_other_messages: true,
                    can_add_web_page_previews: true,
                });
                console.log(`Chat ${groupId} has been unlocked.`);
            }
            else {
                throw new Error("Bot ID is not available.");
            }
        }
        catch (error) {
            console.error(`Failed to unlock chat ${groupId}:`, error.message);
        }
    });
}
/**
 * Sends a raid-related message to a specified chat and returns the message ID.
 * @param chatId The ID of the chat where the message should be sent.
 * @param text The text content of the message.
 * @returns The message ID of the sent message.
 */
function sendRaidMessage(chatId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const message = yield bot.sendMessage(chatId, text);
            console.log(`Raid message sent to chat ${chatId}. Message ID: ${message.message_id}`);
            return message.message_id;
        }
        catch (error) {
            console.error(`Failed to send raid message to chat ${chatId}:`, error.message);
            throw error;
        }
    });
}
// In-memory store to keep track of message content by message ID
const messageContentStore = {};
/**
 * Updates an existing raid-related message in a chat.
 * Tracks and skips updates if the content hasn't changed.
 * @param chatId The ID of the chat containing the message.
 * @param messageId The ID of the message to update.
 * @param newText The new text content for the message.
 */
function updateRaidMessage(chatId, messageId, newText) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the new text is different from the last saved text
            const lastMessageText = messageContentStore[messageId];
            if (lastMessageText !== newText) {
                // Update the message only if the content has changed
                yield bot.editMessageText(newText, { chat_id: chatId, message_id: messageId });
                console.log(`Raid message ${messageId} updated in chat ${chatId}.`);
                // Store the new message content
                messageContentStore[messageId] = newText;
            }
            else {
                console.log(`Raid message ${messageId} in chat ${chatId} is the same, skipping update.`);
            }
        }
        catch (error) {
            console.error(`Failed to update raid message ${messageId} in chat ${chatId}:`, error.message);
            throw error;
        }
    });
}
exports.default = bot;
