const axios = require('axios');
const API_KEY = process.env.DYNADOT_API_KEY;
const AFFILIATE_LINK = "https://www.dynadot.com/?s=packieaffiliate";

async function registerDynadotDomain(domain) {
  try {
    const res = await axios.get("https://api.dynadot.com/api3.json", {
      params: {
        key: API_KEY,
        command: "register_domain",
        domain,
        duration: 1,
        payment: "account_prepaid"
      }
    });

    if (res.data.response.code === "Success") {
      return { success: true, domain };
    }

    return { success: false, message: res.data.response.message, link: AFFILIATE_LINK };
  } catch {
    return { success: false, message: "Dynadot error", link: AFFILIATE_LINK };
  }
}

module.exports = { registerDynadotDomain };
