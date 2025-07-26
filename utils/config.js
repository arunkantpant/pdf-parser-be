import dotenv from "dotenv";

dotenv.config();

export const openaiApiKey = process.env.OPENAI_API_KEY;
export const supabaseUrl = process.env.SUPABASE_URL;
export const supabaseKey = process.env.SUPABASE_KEY;
export const port = process.env.PORT || 5050;
