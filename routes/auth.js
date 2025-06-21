import express from "express";
import { upsertUser } from "../lib/supabase.js";

const router = express.Router();

router.post("/auth/linkedin", async (req, res) => {
  const { id, email, name } = req.body;
  if (!id || !email || !name) return res.status(400).json({ error: "Missing user info" });

  try {
    await upsertUser({ id, email, name, is_paid: false, plan: "free" });
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Supabase error" });
  }
});

export default router;
