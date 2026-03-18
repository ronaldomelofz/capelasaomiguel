// Cliente Supabase — inicialização (lazy)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

let _client = null;
export function getSupabase() {
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("SEU_PROJETO") || SUPABASE_ANON_KEY.includes("sua_anon")) {
      throw new Error("Configure o Supabase em js/supabase-config.js. Veja SUPABASE_SETUP.md");
    }
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
