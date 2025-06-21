// lib/supabase.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function upsertUser(user) {
  const { id, email, name, is_paid = false, plan = "free" } = user;

  const { error } = await supabase.from("users").upsert([
    { id, email, name, is_paid, plan }
  ]);

  if (error) throw new Error(`Supabase upsertUser error: ${error.message}`);
}

async function insertDomain(userId, domainName, isCustom = false) {
  const { error } = await supabase.from("domains").insert([
    { user_id: userId, domain_name: domainName, is_custom: isCustom }
  ]);

  if (error) throw new Error(`Supabase insertDomain error: ${error.message}`);
}

async function getUserById(id) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) throw new Error(`Supabase getUser error: ${error.message}`);
  return data;
}

module.exports = {
  upsertUser,
  insertDomain,
  getUserById,
};
