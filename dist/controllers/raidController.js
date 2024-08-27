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
exports.cancelRaid = cancelRaid;
exports.verifyRaid = verifyRaid;
const telegramService_1 = require("../services/telegramService");
const twitterService_1 = require("../services/twitterService");
const databaseService_1 = require("../services/databaseService");
const intervalStorage_1 = require("./intervalStorage");
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
            var _a;
            try {
                const metrics = yield (0, twitterService_1.fetchMetrics)(tweetUrl);
                const raidCompleted = metrics.likes >= likeGoal &&
                    metrics.comments >= commentGoal &&
                    metrics.retweets >= retweetGoal;
                yield (0, databaseService_1.updateRaidMetrics)(raidId, metrics, raidCompleted);
                yield (0, telegramService_1.updateRaidMessage)(chatId, messageId, `Raid update: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
                if (raidCompleted) {
                    clearInterval(interval);
                    (0, intervalStorage_1.clearRaidInterval)(messageId);
                    yield (0, telegramService_1.unlockChat)(chatId);
                    yield (0, telegramService_1.updateRaidMessage)(chatId, messageId, `Raid complete! ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
                }
            }
            catch (error) {
                if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
                    console.error("Rate limit exceeded. Retrying after a delay...");
                }
                else {
                    console.error("Error updating raid metrics:", error.message);
                    clearInterval(interval);
                    (0, intervalStorage_1.clearRaidInterval)(messageId);
                    yield (0, telegramService_1.unlockChat)(chatId);
                    yield (0, telegramService_1.updateRaidMessage)(chatId, messageId, `Raid failed due to error: ${error.message}`);
                }
            }
        }), 30000);
        (0, intervalStorage_1.setRaidInterval)(messageId, interval);
        return messageId;
    });
}
function cancelRaid(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const raid = yield (0, databaseService_1.fetchRaidByMessageId)(messageId);
            if (!raid) {
                console.error(`No active raid found for message ID: ${messageId}`);
                return;
            }
            (0, intervalStorage_1.clearRaidInterval)(messageId);
            yield (0, telegramService_1.unlockChat)(raid.message_id);
            yield (0, databaseService_1.updateRaidMetrics)(raid.id, { likes: raid.likes, comments: raid.comments, retweets: raid.retweets }, false);
            yield (0, telegramService_1.updateRaidMessage)(raid.message_id, raid.message_id, "Raid has been canceled.");
            console.log(`Raid canceled for message ID: ${messageId}`);
        }
        catch (error) {
            console.error("Error canceling raid:", error.message);
        }
    });
}
function verifyRaid(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const raid = yield (0, databaseService_1.fetchRaidByMessageId)(messageId);
            if (!raid) {
                console.error(`No active raid found for message ID: ${messageId}`);
                return;
            }
            if (raid.raid_completed) {
                console.log(`Raid for message ID ${messageId} is already completed.`);
                yield (0, telegramService_1.updateRaidMessage)(raid.message_id, raid.message_id, "Raid is already completed.");
                return;
            }
            const metrics = yield (0, twitterService_1.fetchMetrics)(raid.link);
            yield (0, telegramService_1.updateRaidMessage)(raid.message_id, raid.message_id, `Raid status update: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
            console.log(`Raid status verified for message ID: ${messageId}`);
        }
        catch (error) {
            console.error("Error verifying raid:", error.message);
        }
    });
}
