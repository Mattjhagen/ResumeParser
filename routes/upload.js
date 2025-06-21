// routes/upload.js
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import OpenAI from "openai";
import { extractTextFromPDF } from "../lib/pdf.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    const buffer = await fs.readFile(req.file.path);
    const content = (await extractTextFromPDF(buffer)).slice(0, 3000); // limit

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
