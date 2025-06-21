// /routes/payment.js
import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

router.post("/create-checkout-session", async (req, res) => {
  const { user } = req.body;

  if (!user?.id || !user?.email || !user?.name) {
    return res.status(400).json({ error: "Missing user info" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PacMac Pro Site",
              description: "Custom domain + premium features",
            },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.PUBLIC_URL}/success.html`,
      cancel_url: `${process.env.PUBLIC_URL}/cancel.html`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        username: user.name,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

export default router;
