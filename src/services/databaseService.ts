import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY } from "../config";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface Raid {
  id: string;
  link: string;
  message_id: number;
  likes: number;
  comments: number;
  retweets: number;
  chat_locked: boolean;
  last_updated: string;
  raid_completed: boolean;
}

/**
 * Saves the group subscription information to the group_subscriptions table.
 * @param groupId The ID of the group.
 * @param groupName The name of the group.
 */
export async function saveGroupSubscription(groupId: number, groupName: string) {
  try {
    const { data, error } = await supabase
      .from("groupsubscriptions")
      .insert([{ group_id: groupId, group_name: groupName }]);

    if (error) {
      throw new Error(`Failed to save group subscription: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error saving group subscription:", err);
    throw err;
  }
}

/**
 * Saves the Twitter handle and Telegram username to the handles table.
 * @param twitterHandle The Twitter handle extracted from the raid link.
 * @param telegramUsername The Telegram username or name of the user who initiated the raid.
 */
export async function saveHandle(twitterHandle: string, telegramUsername: string) {
  try {
    const { data, error } = await supabase
      .from("handles")
      .insert([{ twitter_handle: twitterHandle, telegram_username: telegramUsername }]);

    if (error) {
      throw new Error(`Failed to save handle: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error saving handle:", err);
    throw err;
  }
}

export async function createRaid(
  raid: Omit<Raid, "id" | "last_updated" | "raid_completed">
): Promise<Raid[]> {
  try {
    const { data, error } = await supabase
      .from("raids")
      .insert([{ ...raid, raid_completed: false }])
      .select();

    if (error) {
      console.error("Error inserting raid:", error.message);
      throw new Error("Error inserting raid");
    }

    return data as Raid[];
  } catch (err) {
    console.error("Error creating raid:", err);
    throw err;
  }
}

export async function updateRaidMetrics(
  raidId: string,
  metrics: { likes: number; comments: number; retweets: number },
  raidCompleted: boolean = false
) {
  try {
    await supabase
      .from("raids")
      .update({
        likes: metrics.likes,
        comments: metrics.comments,
        retweets: metrics.retweets,
        last_updated: new Date().toISOString(),
        raid_completed: raidCompleted,
      })
      .eq("id", raidId);
  } catch (error) {
    console.error("Error updating raid metrics:", error);
  }
}

export async function fetchRaidByMessageId(
  messageId: number
): Promise<Raid | null> {
  try {
    const { data, error } = await supabase
      .from("raids")
      .select("*")
      .eq("message_id", messageId)
      .single();

    if (error) {
      console.error("Error fetching raid by message ID:", error.message);
      return null;
    }

    return data as Raid;
  } catch (err) {
    console.error("Error in fetchRaidByMessageId:", err);
    return null;
  }
}
