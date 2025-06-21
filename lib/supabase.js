import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function upsertUser(user) {
  const { error } = await supabase
    .from("users")
    .upsert([user], { onConflict: ["id"] });

  if (error) throw error;
}

export async function insertDomain(userId, domain) {
  const { error } = await supabase
    .from("domains")
    .insert({ user_id: userId, domain });

  if (error) throw error;
}
