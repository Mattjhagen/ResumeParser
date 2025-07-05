import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const sitesDir = path.join(__dirname, 'sites');

// Ensure the 'sites' directory exists
fs.mkdir(sitesDir, { recursive: true });

// --- Cloudflare API Helper ---
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'yourdomain.com'; // Fallback
const RENDER_SERVICE_URL = process.env.RENDER_EXTERNAL_URL; // e.g., your-app.onrender.com

async function createDnsRecord(subdomain) {
  const url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
  const headers = {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    type: 'CNAME',
    name: subdomain,
    content: RENDER_SERVICE_URL,
    proxied: true, // Use Cloudflare's proxy
    ttl: 1, // 1 = Automatic
  });

  const response = await fetch(url, { method: 'POST', headers, body });
  const data = await response.json();

  if (!data.success) {
    console.error('Cloudflare API Error:', data.errors);
    throw new Error(`Failed to create DNS record: ${data.errors[0].message}`);
  }
  return data.result;
}

// Define API providers and their initialization logic
const apiProviders = [
  {
    name: "gemini",
    apiKey: process.env.GEMINI_API_KEY,
    initClient: (key) => new GoogleGenerativeAI(key),
    extractData: async (client, prompt) => {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      return JSON.parse(jsonMatch ? jsonMatch[1] : text);
    },
    isQuotaError: (error) => error.status === 400 || error.status === 429, // Generic bad request or quota
  },
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    initClient: (key) => new OpenAI({ apiKey: key }),
    extractData: async (client, prompt) => {
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "" }, // User content is part of the prompt now
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
      return JSON.parse(completion.choices[0].message.content || "{}");
    },
    isQuotaError: (error) => error.status === 429 || error.code === 'insufficient_quota',
  },
];

async function extractResumeData(resumeText) {
    const basePrompt = `You are a highly accurate data extraction AI. Your sole purpose is to extract structured data from the provided resume text. Analyze the content to infer the candidate's industry, primary role, and personality based on the language used. You MUST return ONLY a JSON object with the exact structure below. Do NOT include any conversational text, markdown outside the JSON, or any other characters.\n\n{\n  "name": "Full Name",\n  "title": "Professional Title/Role",\n  "summary": "Professional summary",\n  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],\n  "skills": ["skill1", "skill2"],\n  "education": [{"institution": "", "degree": "", "year": ""}],\n  "contact": {"email": "", "phone": "", "linkedin": "", "website": ""},\n  "industry": "Inferred industry (e.g., Technology, Healthcare, Finance)",\n  "role": "Inferred primary role (e.g., Software Engineer, Project Manager, Marketing Specialist)",\n  "personality": "Brief analysis of the candidate's personality based on the tone and language of the cover letter or summary (e.g., 'Driven and results-oriented', 'Creative and collaborative')."\n}\n\nResume Text:\n${resumeText}`;

  for (const providerConfig of apiProviders) {
    if (!providerConfig.apiKey) {
      console.warn(`Skipping ${providerConfig.name} provider: API key not set.`);
      continue;
    }

    try {
      console.log(`Attempting to extract data using ${providerConfig.name} provider...`);
      const client = providerConfig.initClient(providerConfig.apiKey);
      const result = await providerConfig.extractData(client, basePrompt);
      return result;
    } catch (error) {
      if (providerConfig.isQuotaError(error)) {
        console.warn(`Quota or invalid key error with ${providerConfig.name}: ${error.message}. Trying next provider...`);
      } else {
        console.error(`Error with ${providerConfig.name}: ${error.message}`);
        throw error; // Re-throw if it's not a quota/invalid key error
      }
    }
  }
  throw new Error("All configured AI providers failed to extract resume data.");
}

async function generatePortfolioHtml(resumeData) {
    const prompt = `\n    You are a world-class web developer and designer. Your task is to create a stunning, professional, and highly personalized one-page portfolio website using only HTML and CSS. You will be given a JSON object containing a candidate's resume data, including their inferred industry, role, and personality.\n\n    **Your Goal:**\n    Generate a complete, single HTML file with embedded CSS that is beautiful, functional, and perfectly tailored to the candidate's profile.\n\n    **Design Principles:**\n    1.  **Personality-Driven Design:** The design MUST reflect the candidate's inferred 'personality'.\n        *   If 'Creative', use artistic fonts, vibrant colors, and unique layouts.\n        *   If 'Professional' or 'Corporate', use clean lines, modern sans-serif fonts, and a more traditional but elegant layout.\n        *   If 'Tech-focused', consider a dark mode, monospace fonts, and a sleek, modern aesthetic.\n    2.  **Industry-Specific Aesthetics:** The color palette and overall feel should align with the candidate's 'industry'.\n        *   **Tech:** Blues, dark grays, electric greens.\n        *   **Healthcare:** Greens, blues, clean whites.\n        *   **Finance:** Navy, gold, silver, deep grays.\n        *   **Creative/Marketing:** Bold, vibrant, and unconventional colors.\n    3.  **Hero Section CTA:** The first thing a user sees (the "hero section") MUST be a clear and compelling Call to Action (CTA). It should feature the candidate's name, title, and a primary contact method (email or LinkedIn).\n    4.  **Responsive Design:** The CSS must include media queries to ensure the site looks great on both desktop and mobile devices.\n    5.  **Structure and Content:**\n        *   Use the provided JSON data to populate all sections: About Me, Experience, Skills, Education, and Contact.\n        *   Display skills in a visually appealing way (e.g., tags, grids).\n        *   The contact section should include all available contact information.\n    6.  **"Create Your Own" Button:** You MUST embed a small, unobtrusive, floating "Create Your Own AI Portfolio" button on the bottom-right of the page.\n        *   It should be fixed, so it stays in place while scrolling.\n        *   Style it with a subtle, modern look that complements the overall design.\n        *   The button must link to `https://${ROOT_DOMAIN}`.\n\n    **Output Requirements:**\n    *   You MUST return ONLY a single, complete HTML file.\n    *   The CSS MUST be embedded within a \`<style>\` tag in the HTML \`<head>\`.\n    *   Do NOT include any markdown, comments, or other text outside of the final HTML document.\n    *   The HTML should be well-structured and semantically correct.\n\n    **Candidate JSON Data:**\n    \`\`\`json\n    ${JSON.stringify(resumeData, null, 2)}\n    \`\`\`\n    `;

  for (const providerConfig of apiProviders) {
    if (!providerConfig.apiKey) {
      console.warn(`Skipping ${providerConfig.name} provider for HTML generation: API key not set.`);
      continue;
    }

    try {
      console.log(`Attempting to generate portfolio HTML using ${providerConfig.name} provider...`);
      const client = providerConfig.initClient(providerConfig.apiKey);
      
      if (providerConfig.name === "openai") {
        const completion = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a world-class web developer and designer." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
        });
        return completion.choices[0].message.content;
      } else if (providerConfig.name === "gemini") {
         const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
         const result = await model.generateContent(prompt);
         const response = await result.response;
         return response.text();
      }

    } catch (error) {
      console.error(`Error with ${providerConfig.name} during HTML generation: ${error.message}`);
    }
  }
  throw new Error("All configured AI providers failed to generate the portfolio HTML.");
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Dynamic Subdomain & Static Asset Handling ---
app.use(async (req, res, next) => {
  const hostname = req.hostname;
  
  // Check if it's a subdomain of our root domain
  if (hostname.endsWith(`.${ROOT_DOMAIN}`) && hostname !== ROOT_DOMAIN) {
    const subdomain = hostname.split('.')[0];
    const sitePath = path.join(sitesDir, `${subdomain}.html`);
    
    try {
      await fs.access(sitePath); // Check if file exists
      res.sendFile(sitePath);
    } catch (error) {
      // If the file doesn't exist, it's not a generated site.
      // You might want to redirect to the main page or show a 404.
      res.status(404).send('Site not found.');
    }
  } else if (hostname === ROOT_DOMAIN || hostname === RENDER_SERVICE_URL) {
    // It's a request to the main app, serve static files or the index.html
    express.static(__dirname)(req, res, next);
  } else {
    next();
  }
});


// --- API Endpoint for Portfolio Generation ---
app.post('/api/generate-portfolio', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required.' });
    }

    const resumeData = await extractResumeData(resumeText);
    const portfolioHtml = await generatePortfolioHtml(resumeData);

    // Generate a unique subdomain
    const subdomain = `${resumeData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-5)}`;
    const siteUrl = `https://${subdomain}.${ROOT_DOMAIN}`;

    // Save the HTML to a file
    const filePath = path.join(sitesDir, `${subdomain}.html`);
    await fs.writeFile(filePath, portfolioHtml);

    // Create DNS record
    await createDnsRecord(subdomain);

    // Return the new URL to the client
    res.json({ portfolioUrl: siteUrl, portfolioHtml: portfolioHtml });

  } catch (error) {
    console.error('Server-side portfolio generation error:', error);
    res.status(500).json({ message: 'Failed to generate portfolio.', error: error.message });
  }
});

// Fallback for the main site's index.html
app.get('*', (req, res) => {
  if (req.hostname === ROOT_DOMAIN || req.hostname === RENDER_SERVICE_URL) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
      res.status(404).send('Not Found');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;