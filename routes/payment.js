const express = require("express");
const fetch = require("node-fetch");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/checkout", async (req, res) => {
  const { domain, userId } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `Custom Domain: ${domain}` },
        unit_amount: 1500,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `https://pacmacmobile.com/success?domain=${domain}&user=${userId}`,
    cancel_url: `https://pacmacmobile.com/cancel`,
    metadata: { domain, userId }
  });

  res.json({ url: session.url });
});

router.post("/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { domain } = session.metadata;

    try {
      const dynadot = await fetch(`https://api.dynadot.com/api3.json?key=${process.env.DYNADOT_API_KEY}&command=register_domain&domain=${domain}&duration=1`, {
        method: "GET",
      });

      const result = await dynadot.json();
      if (result.Response.Status !== "success") throw new Error(result.Response.Status);

      console.log(`✅ Domain ${domain} registered`);
    } catch (err) {
      console.error("Dynadot registration failed:", err);
    }
  }

  res.sendStatus(200);
});

module.exports = router;
