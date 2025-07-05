import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import paymentRoutes from "./routes/payment.js";
import logger from "./middleware/logger.js"; 
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

app.use(authRoutes);
app.use(uploadRoutes);
app.use(paymentRoutes);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/generate-portfolio", async (req, res) => {
  try {
    const { resumeText } = req.body;
    const gptRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a web designer." },
        { role: "user", content: `Generate an HTML about-me page for this resume:\n\n${resumeText}` },
      ],
    });

    const html = gptRes.choices[0].message.content;
    res.json({ html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resume processing failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
