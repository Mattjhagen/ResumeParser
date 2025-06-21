const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { upsertUser, insertDomain } = require("../lib/supabase");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

// Raw body parser for webhook
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.user_id;
    const userEmail = session.customer_email;
    const username = session.metadata.username;

    try {
      await upsertUser({
        id: userId,
        email: userEmail,
        name: username,
        is_paid: true,
        plan: "pro"
      });

      await insertDomain(userId, `${username}.com`, true);
      return res.status(200).send("User and domain provisioned");
    } catch (err) {
      console.error("Supabase update failed", err);
      return res.status(500).send("DB error");
    }
  }

  res.sendStatus(200);
});

module.exports = router;
