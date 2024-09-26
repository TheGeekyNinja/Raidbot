import {
  lockChat,
  unlockChat,
  sendRaidMessage,
  updateRaidMessage,
} from "../services/telegramService";
import { fetchMetrics } from "../services/twitterService";
import {
  createRaid,
  updateRaidMetrics,
  fetchRaidByMessageId,
} from "../services/databaseService";
import { setRaidInterval, clearRaidInterval } from "./intervalStorage";

const messageContentStore: Record<number, string> = {};
export async function startRaid(chatId: number, tweetUrl: string, likeGoal: number, commentGoal: number, retweetGoal: number) {
  await lockChat(chatId);


  const initialMessageText = `Raid started on tweet ${tweetUrl}`;
  const messageId = await sendRaidMessage(chatId, initialMessageText);
  
  messageContentStore[messageId] = initialMessageText;

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
      const raidCompleted = metrics.likes >= likeGoal && metrics.comments >= commentGoal && metrics.retweets >= retweetGoal;


      const newText = `Raid update: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`;


      await updateRaidMessage(chatId, messageId, newText);

      if (raidCompleted) {
        clearInterval(interval);
        clearRaidInterval(messageId);
        await unlockChat(chatId);
        await updateRaidMessage(chatId, messageId, `Raid complete! ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`);
      }
    } catch (error: any) {
      console.error("Error updating raid metrics:", error.message);
      clearInterval(interval);
      clearRaidInterval(messageId);
      await unlockChat(chatId);
      await updateRaidMessage(chatId, messageId, `Raid failed due to error: ${error.message}`);
    }
  }, 30000); 

  setRaidInterval(messageId, interval);
  return messageId;
}



export async function cancelRaid(messageId: number) {
  try {
    const raid = await fetchRaidByMessageId(messageId);

    if (!raid) {
      console.error(`No active raid found for message ID: ${messageId}`);
      return;
    }

    clearRaidInterval(messageId);
    await unlockChat(raid.message_id);
    await updateRaidMetrics(
      raid.id,
      { likes: raid.likes, comments: raid.comments, retweets: raid.retweets },
      false
    );
    await updateRaidMessage(
      raid.message_id,
      raid.message_id,
      "Raid has been canceled."
    );

    console.log(`Raid canceled for message ID: ${messageId}`);
  } catch (error: any) {
    console.error("Error canceling raid:", error.message);
  }
}

export async function verifyRaid(messageId: number) {
  try {
    const raid = await fetchRaidByMessageId(messageId);

    if (!raid) {
      console.error(`No active raid found for message ID: ${messageId}`);
      return;
    }

    if (raid.raid_completed) {
      console.log(`Raid for message ID ${messageId} is already completed.`);
      await updateRaidMessage(
        raid.message_id,
        raid.message_id,
        "Raid is already completed."
      );
      return;
    }

    const metrics = await fetchMetrics(raid.link);
    await updateRaidMessage(
      raid.message_id,
      raid.message_id,
      `Raid status update: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.retweets} retweets`
    );

    console.log(`Raid status verified for message ID: ${messageId}`);
  } catch (error: any) {
    console.error("Error verifying raid:", error.message);
  }
}
