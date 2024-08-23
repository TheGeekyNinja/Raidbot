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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRaid = startRaid;
const telegramService_1 = require("../services/telegramService");
const twitterService_1 = require("../services/twitterService");
const databaseService_1 = require("../services/databaseService");
function startRaid(chatId, tweetUrl, likeGoal, commentGoal, retweetGoal) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, telegramService_1.lockChat)(chatId);
        const messageId = yield (0, telegramService_1.sendRaidMessage)(chatId, `Raid started on tweet ${tweetUrl}`);
        const raid = yield (0, databaseService_1.createRaid)({
            link: tweetUrl,
            message_id: messageId,
            likes: 0,
            comments: 0,
            retweets: 0,
            chat_locked: true,
        });
        if (!raid || raid.length === 0) {
            console.error("Failed to create a raid in the database.");
            return;
        }
        const raidId = raid[0].id;
        const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const metrics = yield (0, twitterService_1.fetchMetrics)(tweetUrl);
                yield (0, databaseService_1.updateRaidMetrics)(raidId, metrics);
                yield (0, telegramService_1.updateRaidMessage)(chatId, messageId, `Raid update: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
                if (metrics.likes >= likeGoal && metrics.comments >= commentGoal && metrics.retweets >= retweetGoal) {
                    clearInterval(interval);
                    yield (0, telegramService_1.unlockChat)(chatId);
                    yield (0, telegramService_1.updateRaidMessage)(chatId, messageId, `Raid complete! ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
                }
            }
            catch (error) {
                console.error("Error updating raid metrics:", error.message);
                clearInterval(interval);
                yield (0, telegramService_1.unlockChat)(chatId);
                yield (0, telegramService_1.updateRaidMessage)(chatId, messageId, `Raid failed due to error: ${error.message}`);
            }
        }), 5000);
    });
}
