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
exports.fetchMetrics = fetchMetrics;
const twitter_api_v2_1 = require("twitter-api-v2");
const config_1 = require("../config");
const twitterClient = new twitter_api_v2_1.TwitterApi(config_1.TWITTER_BEARER_TOKEN);
function fetchMetrics(tweetUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
            if (!tweetIdMatch) {
                console.error("Tweet URL provided does not contain a valid tweet ID:", tweetUrl);
                throw new Error("Invalid tweet URL format. Please ensure it includes 'status/<tweet_id>'.");
            }
            const tweetId = tweetIdMatch[1];
            const tweet = yield twitterClient.v2.singleTweet(tweetId, {
                "tweet.fields": "public_metrics",
            });
            const metrics = tweet.data.public_metrics;
            if (!metrics) {
                console.error("Metrics not available for the tweet ID:", tweetId);
                throw new Error("Metrics not available for this tweet.");
            }
            return {
                likes: metrics.like_count || 0,
                comments: metrics.reply_count || 0,
                retweets: metrics.retweet_count || 0,
            };
        }
        catch (error) {
            console.error("Error fetching metrics:", error);
            throw error;
        }
    });
}
