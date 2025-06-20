require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const { createSubdomainRecord } = require('./cloudflare');
const { registerDynadotDomain } = require('./dynadot');
const app = express();
const upload = multer({ dest: 'uploads/' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve public profile via subdomain
app.use(async (req, res, next) => {
  const sub = req.subdomains?.[0];
  if (sub && sub !== 'www') {
    const { data } = await supabase.from('about_pages').select('html').eq('slug', sub).single();
    return data?.html ? res.send(data.html) : res.status(404).send('Not found');
  }
  next();
});

// LinkedIn login via Supabase
app.get('/login/linkedin', async (req, res) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin',
    options: { redirectTo: `${process.env.PUBLIC_URL}/linkedin-callback` }
  });
  res.redirect(data.url);
});

// LinkedIn GPT-4 generator
app.post('/generate-from-linkedin', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const authed = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: userData } = await authed.auth.getUser();
  const meta = userData?.user?.user_metadata || {};
  const email = userData?.user?.email;
  const slug = email.split('@')[0].replace(/\W/g, '');

  const prompt = `
  Format into HTML About Me:

  Name: ${meta.name || ''}
  Headline: ${meta.headline || ''}
  Location: ${meta.location || ''}
  Industry: ${meta.industry || ''}
  `;

  const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert formatter.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const html = (await gptRes.json()).choices?.[0]?.message?.content;
  await supabase.from('about_pages').upsert({ slug, email, html });
  await createSubdomainRecord(slug);

  res.send({ previewUrl: `https://${slug}.${process.env.ROOT_DOMAIN}` });
});

// Resume file upload
app.post('/upload-resume', upload.single('resumeFile'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const authed = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: userData } = await authed.auth.getUser();
  const email = userData?.user?.email;
  const slug = email.split('@')[0].replace(/\W/g, '');

  let resumeText = '';
  const file = req.file;
  if (file.mimetype === 'application/pdf') {
    resumeText = (await pdfParse(await fs.readFile(file.path))).text;
  } else {
    resumeText = await fs.readFile(file.path, 'utf8');
  }

  const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Format resume into About Me HTML.' },
        { role: 'user', content: resumeText }
      ]
    })
  });

  const html = (await aiRes.json()).choices?.[0]?.message?.content;
  await supabase.from('about_pages').upsert({ slug, email, html });
  await createSubdomainRecord(slug);

  res.send({ previewUrl: `https://${slug}.${process.env.ROOT_DOMAIN}` });
});

// Optional domain registration
app.post('/register-domain', async (req, res) => {
  const { domain } = req.body;
  const result = await registerDynadotDomain(domain);
  res.send(result);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
