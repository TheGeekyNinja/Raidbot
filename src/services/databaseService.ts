import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

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
  }

 export async function createRaid(raid: Omit<Raid, 'id' | 'last_updated'>): Promise<Raid[]> {
    try {
      const { data, error } = await supabase
        .from('raids')
        .insert([raid])
        .select();
  
      if (error) {
        console.error('Error inserting raid:', error.message);
        throw new Error('Error inserting raid');
      }
  
      return data as Raid[];
    } catch (err) {
      console.error('Error creating raid:', err);
      throw err;
    }
  }
  

  export async function updateRaidMetrics(raidId: string, metrics: { likes: number, comments: number, retweets: number }) {
    try {
      await supabase
        .from('raids')
        .update({
          likes: metrics.likes,
          comments: metrics.comments,
          retweets: metrics.retweets,
          last_updated: new Date().toISOString(),
        })
        .eq('id', raidId);
    } catch (error) {
      console.error('Error updating raid metrics:', error);
    }
  }
  
