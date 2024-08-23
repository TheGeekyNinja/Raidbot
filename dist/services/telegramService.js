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
bot.getMe().then((me) => {
    botId = me.id;
    console.log(`Bot started. ID: ${botId}`);
});
function lockChat(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (botId) {
            yield bot.setChatPermissions(groupId, {
                can_send_messages: false,
                can_send_polls: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
            });
        }
        else {
            console.error("Bot ID is not available.");
        }
    });
}
function unlockChat(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (botId) {
            yield bot.setChatPermissions(groupId, {
                can_send_messages: true,
                can_send_polls: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true,
            });
        }
        else {
            console.error("Bot ID is not available.");
        }
    });
}
function sendRaidMessage(chatId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = yield bot.sendMessage(chatId, text);
        return message.message_id;
    });
}
function updateRaidMessage(chatId, messageId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        yield bot.editMessageText(text, { chat_id: chatId, message_id: messageId });
    });
}
exports.default = bot;
