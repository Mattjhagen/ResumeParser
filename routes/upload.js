import express from "express";
import multer from "multer";
import fs from "fs/promises";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    const pdf = await fs.readFile(req.file.path);
    const text = await pdfParse(pdf);
    const content = text.text.slice(0, 3000);

    const gptRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a web designer." },
        { role: "user", content: `Generate an HTML about-me page for this resume:\n\n${content}` },
      ],
    });

    const html = gptRes.choices[0].message.content;
    await fs.writeFile(`public/generated/${req.file.filename}.html`, html);

    res.json({ site: `/generated/${req.file.filename}.html` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resume processing failed" });
  }
});

export default router;
