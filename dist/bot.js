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

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
telegramService_1.default.onText(/\/startraid (\S+)(?: (\d+))?(?: (\d+))?(?: (\d+))?/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const tweetUrl = match[1];
    console.log('Received /startraid command with parameters:', match);
    try {
        const likeGoal = match[2] ? parseInt(match[2], 10) : 100;
        const commentGoal = match[3] ? parseInt(match[3], 10) : 50;
        const retweetGoal = match[4] ? parseInt(match[4], 10) : 20;
        if (isNaN(likeGoal) || isNaN(commentGoal) || isNaN(retweetGoal)) {
            throw new Error("Goals must be valid numbers.");
        }
        console.log(`Starting raid with URL: ${tweetUrl}, Goals - Likes: ${likeGoal}, Comments: ${commentGoal}, Retweets: ${retweetGoal}`);
        yield (0, raidController_1.startRaid)(chatId, tweetUrl, likeGoal, commentGoal, retweetGoal);
    }
    catch (error) {
        console.error('Error processing command:', error.message);
        telegramService_1.default.sendMessage(chatId, `Error: ${error.message}`);
    }
}));
console.log('RaidBot is running...');
