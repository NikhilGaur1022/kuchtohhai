// scripts/test-supabase.ts
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.rpc("version"); // ping-like dummy request
    if (error) {
      console.error("❌ Supabase is reachable but version RPC failed:", error);
    } else {
      console.log("✅ Supabase connection working. Version:", data);
    }
  } catch (err) {
    console.error("❌ Could not connect to Supabase at all:", err);
  }
}

testConnection();
