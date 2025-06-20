# PacMac Resume Site 🚐

This project generates personal websites from resumes with Supabase Auth, OpenAI GPT-4, and Cloudflare subdomains.

---

## 🌍 Live Features

- Google login via Supabase
- Upload `.pdf` or `.txt` resumes
- AI formats resume into HTML About Me
- Saves each to `username.pacmacmobile.com`
- Admin dashboard to manage users

---

## 🧠 Tech Stack

- Node.js (Express)
- Supabase (Auth + DB)
- OpenAI API (GPT-4)
- Cloudflare DNS API
- HTML + CSS (Kali themed UI)

---

## 🚀 Setup

```bash
git clone https://github.com/YOURNAME/pacmac-resume-site.git
cd pacmac-resume-site
npm install
cp .env.example .env
# fill in your secrets
npm start
