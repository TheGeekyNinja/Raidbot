
import bot from './services/telegramService';
import { startRaid } from './controllers/raidController';

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

bot.onText(/\/startraid (\S+)(?: (\d+))?(?: (\d+))?(?: (\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const tweetUrl = match![1];
  
    console.log('Received /startraid command with parameters:', match);

    try {
        const likeGoal = match![2] ? parseInt(match![2], 10) : 100;
        const commentGoal = match![3] ? parseInt(match![3], 10) : 50;
        const retweetGoal = match![4] ? parseInt(match![4], 10) : 20;

        if (isNaN(likeGoal) || isNaN(commentGoal) || isNaN(retweetGoal)) {
            throw new Error("Goals must be valid numbers.");
        }

        console.log(`Starting raid with URL: ${tweetUrl}, Goals - Likes: ${likeGoal}, Comments: ${commentGoal}, Retweets: ${retweetGoal}`);
        await startRaid(chatId, tweetUrl, likeGoal, commentGoal, retweetGoal);
    } catch (error: any) {
        console.error('Error processing command:', error.message);
        bot.sendMessage(chatId, `Error: ${error.message}`);
    }
});

  
console.log('RaidBot is running...');
