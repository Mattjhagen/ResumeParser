// cloudflare.js
const axios = require('axios');

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN;

async function createSubdomainRecord(subdomain) {
  const fullDomain = `${subdomain}.${ROOT_DOMAIN}`;

  const res = await axios.post(
    `${CLOUDFLARE_API}/zones/${ZONE_ID}/dns_records`,
    {
      type: 'CNAME',
      name: fullDomain,
      content: ROOT_DOMAIN,
      ttl: 3600,
      proxied: true
    },
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data;
}

module.exports = { createSubdomainRecord };
