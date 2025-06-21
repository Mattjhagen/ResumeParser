// server.js
import express from "express";
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const deployRoutes = require("./routes/deploy");
const paymentRoutes = require("./routes/payment");
const webhookRoute = require("./routes/webhook");
import paymentRoutes from "./routes/payment.js";
import dotenv from "dotenv";
app.use("/payment", paymentRoutes);

app.use("/", webhookRoute);


app.use("/deploy", deployRoutes);
app.use("/payment", paymentRoutes);
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.json());

app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const resumeText = fs.readFileSync(filePath, "utf8");

    const accessToken = req.body.accessToken;
    const enrichedText = accessToken
      ? `${resumeText}\n\nLinkedIn Token: ${accessToken}`
      : resumeText;

const prompt = `
Analyze the following resume and determine:
1. Their professional background
2. Key personality traits (e.g. driven, adventurous, methodical)
3. Ideal tone (e.g. professional, minimalist, playful, edgy)
4. Thematic design (e.g. dark terminal, tech-futuristic, minimal Zen, travel blog style)

Then, based on this analysis, generate a fully responsive, mobile-friendly HTML5 'About Me' personal website. Use custom fonts, layout, and colors that reflect their personality.

Embed their story and strengths into the content in a way that feels like them speaking to a visitor.

Respond with a complete, ready-to-host HTML file.

Resume:
${enrichedText}
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const json = await openaiRes.json();
    const html = json.choices?.[0]?.message?.content;

    if (!html || !html.includes("<html")) {
      return res.status(500).json({ error: "OpenAI failed to generate HTML." });
    }

    const fileName = `${Date.now()}-site.html`;
    const outPath = path.join(__dirname, "public", "sites", fileName);

    fs.writeFileSync(outPath, html);

    res.json({ site: `/sites/${fileName}` });
  } catch (err) {
    console.error("Resume Upload Error:", err);
    res.status(500).json({ error: "Failed to process resume." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
