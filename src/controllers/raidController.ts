import { lockChat, unlockChat, sendRaidMessage, updateRaidMessage } from '../services/telegramService';
import { fetchMetrics } from '../services/twitterService';
import { createRaid, updateRaidMetrics, Raid } from '../services/databaseService';

export async function startRaid(chatId: number, tweetUrl: string, likeGoal: number, commentGoal: number, retweetGoal: number) {
  await lockChat(chatId);

  const messageId = await sendRaidMessage(chatId, `Raid started on tweet ${tweetUrl}`);

  const raid = await createRaid({
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

  const interval = setInterval(async () => {
    try {
      const metrics = await fetchMetrics(tweetUrl);
      await updateRaidMetrics(raidId, metrics);

      await updateRaidMessage(chatId, messageId, `Raid update: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);

      if (metrics.likes >= likeGoal && metrics.comments >= commentGoal && metrics.retweets >= retweetGoal) {
        clearInterval(interval);
        await unlockChat(chatId);
        await updateRaidMessage(chatId, messageId, `Raid complete! ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
      }
    } catch (error:any) {
      console.error("Error updating raid metrics:", error.message);
      clearInterval(interval);
      await unlockChat(chatId);
      await updateRaidMessage(chatId, messageId, `Raid failed due to error: ${error.message}`);
    }
  }, 5000);
}
