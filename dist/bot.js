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
const telegramService_1 = __importDefault(require("./services/telegramService"));
const raidController_1 = require("./controllers/raidController");
const databaseService_1 = require("./services/databaseService"); // Import function to save group subscriptions
let botId;
// Fetch the bot's details when it starts to get its ID
telegramService_1.default.getMe().then((me) => {
    botId = me.id;
    console.log(`Bot started. ID: ${botId}`);
}).catch((error) => {
    console.error("Failed to get bot information:", error);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
// Event listener for when the bot is added to a group
telegramService_1.default.on('new_chat_members', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const newMembers = msg.new_chat_members;
    const chat = msg.chat;
    if (newMembers && botId) {
        for (const member of newMembers) {
            if (member.id === botId) {
                // The bot has been added to the group
                const groupId = chat.id;
                const groupName = chat.title || "Unnamed Group";
                try {
                    yield (0, databaseService_1.saveGroupSubscription)(groupId, groupName);
                    console.log(`Bot added to group ${groupName} (${groupId}). Subscription saved.`);
                }
                catch (error) {
                    console.error('Failed to save group subscription:', error.message);
                }
            }
        }
    }
}));
telegramService_1.default.onText(/\/startraid (\S+)(?: (\d+))?(?: (\d+))?(?: (\d+))?/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const chatId = msg.chat.id;
    const tweetUrl = match[1];
    const twitterHandleMatch = tweetUrl.match(/https?:\/\/(?:www\.)?x\.com\/([^\/]+)\/status\/\d+/i);
    const twitterHandle = twitterHandleMatch ? twitterHandleMatch[1] : null;
    const telegramUsername = ((_a = msg.from) === null || _a === void 0 ? void 0 : _a.username) || `${((_b = msg.from) === null || _b === void 0 ? void 0 : _b.first_name) || ''} ${((_c = msg.from) === null || _c === void 0 ? void 0 : _c.last_name) || ''}`.trim();
    if (twitterHandle && telegramUsername) {
        try {
            yield (0, databaseService_1.saveHandle)(twitterHandle, telegramUsername);
            console.log(`Saved handle: Twitter - ${twitterHandle}, Telegram - ${telegramUsername}`);
        }
        catch (error) {
            console.error('Failed to save handle:', error.message);
        }
    }
    else {
        console.error('Could not extract Twitter handle or Telegram username.');
    }
    console.log("Received /startraid command with parameters:", match);
    try {
        const likeGoal = match[2] ? parseInt(match[2], 10) : 100;
        const commentGoal = match[3] ? parseInt(match[3], 10) : 50;
        const retweetGoal = match[4] ? parseInt(match[4], 10) : 20;
        if (isNaN(likeGoal) || isNaN(commentGoal) || isNaN(retweetGoal)) {
            throw new Error("Goals must be valid numbers.");
        }
        console.log(`Starting raid with URL: ${tweetUrl}, Goals - Likes: ${likeGoal}, Comments: ${commentGoal}, Retweets: ${retweetGoal}`);
        const messageId = yield (0, raidController_1.startRaid)(chatId, tweetUrl, likeGoal, commentGoal, retweetGoal);
        telegramService_1.default.sendMessage(chatId, `Raid started with message ID: ${messageId}`);
    }
    catch (error) {
        console.error("Error processing command:", error.message);
        telegramService_1.default.sendMessage(chatId, `Error: ${error.message}`);
    }
}));
telegramService_1.default.onText(/\/cancelraid (\d+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const messageId = parseInt(match[1], 10);
    console.log(`Received /cancelraid command for message ID: ${messageId}`);
    try {
        yield (0, raidController_1.cancelRaid)(messageId);
        telegramService_1.default.sendMessage(chatId, `Raid for message ID ${messageId} has been canceled.`);
    }
    catch (error) {
        console.error("Error canceling raid:", error.message);
        telegramService_1.default.sendMessage(chatId, `Error: ${error.message}`);
    }
}));
telegramService_1.default.onText(/\/verifyraid (\d+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const messageId = parseInt(match[1], 10);
    console.log(`Received /verifyraid command for message ID: ${messageId}`);
    try {
        yield (0, raidController_1.verifyRaid)(messageId);
        telegramService_1.default.sendMessage(chatId, `Raid for message ID ${messageId} has been verified.`);
    }
    catch (error) {
        console.error("Error verifying raid:", error.message);
        telegramService_1.default.sendMessage(chatId, `Error: ${error.message}`);
    }
}));
console.log("RaidBot is running...");
