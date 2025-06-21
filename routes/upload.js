// /routes/upload.js
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import path from "path";
import { extractTextFromPDF } from "../lib/pdf.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    const pdfBuffer = await fs.readFile(req.file.path);
    const text = await extractTextFromPDF(pdfBuffer);
    const truncated = text.slice(0, 3000);

    const gptRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a web designer." },
        { role: "user", content: `Generate an HTML about-me page from this resume:\n\n${truncated}` },
      ],
    });

    const html = gptRes.choices[0].message.content;
    const fileName = `${req.file.filename}.html`;
    const outputPath = path.join("public", "generated", fileName);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, "utf-8");

    res.json({ site: `/generated/${fileName}` });
  } catch (err) {
    console.error("❌ Resume Upload Failed:", err);
    res.status(500).json({ error: "Resume processing failed" });
  }
});

export default router;
