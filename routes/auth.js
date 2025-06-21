// /routes/auth.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { upsertUser } from "../lib/supabase.js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get("/linkedin", async (req, res) => {
  const { user } = req.query; // Assume frontend stores user info locally after LinkedIn login

  if (!user?.id || !user?.email || !user?.name) {
    return res.status(400).json({ error: "Missing LinkedIn user info" });
  }

  try {
    await upsertUser({
      id: user.id,
      email: user.email,
      name: user.name,
      is_paid: false,
      plan: "free",
    });
    res.redirect("/public");
  } catch (err) {
    console.error("Auth error", err);
    res.status(500).json({ error: "LinkedIn login failed" });
  }
});

export default router;
