# RaidBot

**RaidBot** is a Telegram bot designed to manage and track Twitter raids within a Telegram group. It allows users to initiate, monitor, and cancel raids by tracking engagement metrics (likes, comments, and retweets) on a specified tweet.

## Features

- Lock and unlock Telegram group chats during a raid.
- Automatically track metrics from Twitter (likes, comments, retweets) for a specific tweet.
- Periodically update the raid status in the Telegram group.
- Cancel or verify the status of ongoing raids.
- Automatically handle group subscription and message management.
- In-memory message content tracking to avoid redundant updates.

## Requirements

- Node.js
- Telegram Bot API Token
- Supabase credentials (or another database)
- Twitter API credentials

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/raidbot.git
    cd raidbot
    ```

2. Install dependencies:

    ```bash
    yarn install
    ```

3. Create a `.env` file in the project root and add your credentials:

    ```bash
    TELEGRAM_TOKEN=your-telegram-token
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-key
    TWITTER_BEARER_TOKEN=your-twitter-bearer-token
    ```

4. Run the bot:

    ```bash
    yarn tsc && node dist/index.js
    ```

## Functionality

### Commands

- `/startraid <tweet_url> <like_goal> <comment_goal> <retweet_goal>`
    - Starts a new raid on a specific tweet, tracking the likes, comments, and retweets. The Telegram group will be locked, and periodic updates will be provided.
    - **Example**: `/startraid https://x.com/user/status/1234567890 1000 500 300`

- `/cancelraid <message_id>`
    - Cancels an ongoing raid, unlocking the chat and informing the group that the raid was canceled.
    - **Example**: `/cancelraid 123`

- `/verifyraid <message_id>`
    - Verifies the current status of the raid by fetching the latest metrics from Twitter.
    - **Example**: `/verifyraid 123`

### Automatic Features

- **Group Subscription**: When the bot is added to a group, it automatically saves the group information (ID and name) to the `group_subscriptions` table in the database.
  
- **Metrics Tracking**: The bot fetches the metrics for a tweet (likes, comments, retweets) from the Twitter API every 30 seconds and updates the group.

- **Message Content Tracking**: The bot tracks message content in memory to avoid redundant updates, preventing errors when the message content has not changed.

## Code Structure

- `index.ts`: Main file to handle commands and bot logic.
- `services/telegramService.ts`: Handles Telegram API interactions (sending messages, locking/unlocking chats).
- `services/twitterService.ts`: Fetches metrics from Twitter API.
- `services/databaseService.ts`: Handles interactions with the Supabase database.
- `intervalStorage.ts`: Stores intervals for ongoing raids, allowing them to be stopped when necessary.

## Database Structure

### Tables

1. **raids**
    - Tracks ongoing raids with fields like `id`, `message_id`, `link`, `likes`, `comments`, `retweets`, `raid_completed`, and `last_updated`.

2. **handles**
    - Tracks the Twitter handle and the Telegram username that initiated the raid with fields like `twitter_handle` and `telegram_username`.

3. **group_subscriptions**
    - Stores group information with fields like `group_id` and `group_name`.

## Error Handling

- The bot gracefully handles API rate limits and errors from both Telegram and Twitter. If an error occurs while fetching metrics or updating messages, the raid will be stopped, and the group will be informed of the failure.

## Future Improvements

- Persistent storage for message content (currently in-memory).
- Improved error handling and retry logic for Twitter API rate limits.
- Multi-language support.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
