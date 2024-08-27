import bot from "./services/telegramService";
import {
  startRaid,
  cancelRaid,
  verifyRaid,
} from "./controllers/raidController";

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

bot.onText(
  /\/startraid (\S+)(?: (\d+))?(?: (\d+))?(?: (\d+))?/,
  async (msg, match) => {
    const chatId = msg.chat.id;
    const tweetUrl = match![1];

    console.log("Received /startraid command with parameters:", match);

    try {
      const likeGoal = match![2] ? parseInt(match![2], 10) : 100;
      const commentGoal = match![3] ? parseInt(match![3], 10) : 50;
      const retweetGoal = match![4] ? parseInt(match![4], 10) : 20;

      if (isNaN(likeGoal) || isNaN(commentGoal) || isNaN(retweetGoal)) {
        throw new Error("Goals must be valid numbers.");
      }

      console.log(
        `Starting raid with URL: ${tweetUrl}, Goals - Likes: ${likeGoal}, Comments: ${commentGoal}, Retweets: ${retweetGoal}`
      );
      const messageId = await startRaid(
        chatId,
        tweetUrl,
        likeGoal,
        commentGoal,
        retweetGoal
      );
      bot.sendMessage(chatId, `Raid started with message ID: ${messageId}`);
    } catch (error: any) {
      console.error("Error processing command:", error.message);
      bot.sendMessage(chatId, `Error: ${error.message}`);
    }
  }
);

bot.onText(/\/cancelraid (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const messageId = parseInt(match![1], 10);

  console.log(`Received /cancelraid command for message ID: ${messageId}`);

  try {
    await cancelRaid(messageId);
    bot.sendMessage(
      chatId,
      `Raid for message ID ${messageId} has been canceled.`
    );
  } catch (error: any) {
    console.error("Error canceling raid:", error.message);
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
});

bot.onText(/\/verifyraid (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const messageId = parseInt(match![1], 10);

  console.log(`Received /verifyraid command for message ID: ${messageId}`);

  try {
    await verifyRaid(messageId);
    bot.sendMessage(
      chatId,
      `Raid for message ID ${messageId} has been verified.`
    );
  } catch (error: any) {
    console.error("Error verifying raid:", error.message);
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
});

console.log("RaidBot is running...");
