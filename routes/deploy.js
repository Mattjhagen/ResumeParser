const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN;

router.post("/create-subdomain", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required." });

  const subdomain = `${username}.${ROOT_DOMAIN}`;
  const renderTarget = "your-app-name.onrender.com"; // Update this

  try {
    const resp = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "CNAME",
        name: username,
        content: renderTarget,
        ttl: 3600,
        proxied: true,
      }),
    });

    const data = await resp.json();
    if (!data.success) throw new Error(JSON.stringify(data.errors));

    res.json({ subdomain: `https://${subdomain}` });
  } catch (err) {
    console.error("Cloudflare Subdomain Error:", err);
    res.status(500).json({ error: "Failed to create subdomain." });
  }
});

module.exports = router;
