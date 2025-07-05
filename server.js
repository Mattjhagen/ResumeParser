// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const { saveUserDomain } = require('./saveDomain');
const { validateResume, validateDomain } = require('./validators');
const OpenAI = require('openai');
const multer = require('multer');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Supabase OAuth + Resume Parser API running!');
});

app.post('/generate-portfolio', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';
    if (req.file) {
      if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: req.file.path });
        resumeText = result.value;
      } else if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        resumeText = data.text;
      } else if (req.file.mimetype === 'text/plain') {
        resumeText = fs.readFileSync(req.file.path, 'utf8');
      }
      fs.unlinkSync(req.file.path); // Clean up the uploaded file
    } else {
      resumeText = req.body.resumeText;
    }

    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a web designer.' },
        { role: 'user', content: `Generate an HTML about-me page for this resume. At the bottom of the generated HTML, include a footer with a prominent link that says 'Create Your Own Portfolio' and points to '/resume-generator.html'. The design should be modern and professional. Also include a section with the id "domain-registration" that allows the user to claim a subdomain. The form should have an input with the id "domainInput" and a button with the text "Register Domain". The form should call the "register" function on submit.\n\n${resumeText}` },
      ],
    });

    const html = gptRes.choices[0].message.content;
    res.json({ html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Resume processing failed' });
  }
});

app.post('/register-domain', async (req, res) => {
  const { email, domain } = req.body;
  await saveUserDomain(email, 'subdomain', domain);
  res.json({ message: 'Domain saved!' });
});

app.get('/login', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',

    options: {
      redirectTo: `${process.env.PUBLIC_URL || 'https://packiepresents.onrender.com'}/callback`
    }
  });

  if (error || !data?.url) {
    console.error('OAuth redirect error:', error?.message || 'No URL returned');
    return res.status(500).send('Auth error');
  }

  res.redirect(data.url);
});

app.get('/callback', (req, res) => {
  res.redirect('/signup.html');
});

app.post('/parse-resume', validateResume, async (req, res) => {
  try {
    const resumeText = req.body.resumeText;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume formatter. Format the resume into a professional About Me HTML page.'
          },
          {
            role: 'user',
            content: resumeText
          }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();
    const formattedContent = data.choices?.[0]?.message?.content || 'No response from OpenAI.';

    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Your About Me Page</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: auto; padding: 2em; line-height: 1.6; }
          h2 { margin-top: 2em; text-align: center; }
          .cta { text-align: center; margin-top: 3em; }
          a.cta-link {
            display: inline-block;
            text-decoration: none;
            font-size: 1.1em;
            color: #00ffff;
            background: #000;
            padding: 0.75em 1.5em;
            border: 2px solid #00ffff;
            border-radius: 8px;
          }
          a.cta-link:hover {
            background: #00ffff;
            color: #000;
          }
        </style>
      </head>
      <body>
        ${formattedContent}
        <div class="cta">
          <h2>Claim Your Digital Presence</h2>
          <a class="cta-link" href="/login">Sign in with Google via Supabase</a>
        </div>
      </body>
      </html>
    `;

    res.send(fullHTML);
  } catch (err) {
    console.error('Resume error:', err.message);
    res.status(500).send('Error parsing resume.');
  }
});

app.post('/save-domain', validateDomain, async (req, res) => {
  const { email, type, domain } = req.body;
  await saveUserDomain(email, type, domain);
  res.send('Domain saved!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
