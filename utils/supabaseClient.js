import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./config.js";

export const supabase = createClient(supabaseUrl, supabaseKey);
