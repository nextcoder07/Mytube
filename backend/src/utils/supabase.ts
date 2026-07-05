// src/utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import config from "../config/index";

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
