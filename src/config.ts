import * as dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN as string;
export const SUPABASE_URL = process.env.SUPABASE_URL as string;
export const SUPABASE_KEY = process.env.SUPABASE_KEY as string;
export const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN as string;
