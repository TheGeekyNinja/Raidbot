import { TwitterApi } from 'twitter-api-v2';
import { TWITTER_BEARER_TOKEN } from '../config';

const twitterClient = new TwitterApi(TWITTER_BEARER_TOKEN);

export async function fetchMetrics(tweetUrl: string) {
  try {
    const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
    if (!tweetIdMatch) {
      console.error("Tweet URL provided does not contain a valid tweet ID:", tweetUrl);
      throw new Error("Invalid tweet URL format. Please ensure it includes 'status/<tweet_id>'.");
    }
    const tweetId = tweetIdMatch[1];

    const tweet = await twitterClient.v2.singleTweet(tweetId, { "tweet.fields": "public_metrics" });
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
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}
