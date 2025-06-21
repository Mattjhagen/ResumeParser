// server.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
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

    const prompt = `Use the resume content below to generate a clean, responsive 'About Me' personal website in HTML format. Use a hacker-style, terminal-themed color scheme and make it suitable for freelancers and digital nomads.\n\nResume:\n${enrichedText}`;

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
