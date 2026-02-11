# 🎤 AI Tech Interview – Project Showcase

[![Language](https://img.shields.io/badge/Language-TypeScript-blue.svg)]()  
[![Platform](https://img.shields.io/badge/Platform-Web-orange.svg)]()  
[![Status](https://img.shields.io/badge/Status-Showcase-lightgrey.svg)]()

**AI Tech Interview** is a portfolio project designed to demonstrate **full-stack development, AI integration, and interactive real-time systems**.  
It simulates a **technical interview platform** where users can practice coding, behavioral, and live voice-based interview questions with feedback powered by **OpenAI Realtime** and **Supabase**.

This project is **not intended for reuse** but serves as a **public demonstration** for hiring managers, collaborators, and educators to evaluate.

> **Author:** Alanna Matundan  
> **Purpose:** Portfolio · Educational Review · Demonstration Only

---

## ✨ Highlights

- Built with **Supabase** for authentication, storage, and edge functions
- Live interview mode with:
  - **Voice capture & transcription** (Whisper)
  - **Realtime feedback** using OpenAI’s Realtime API
  - **Pause / Resume / Disconnect controls** for natural flow
- Multiple question types:
  - **Coding** with in-browser editor + test runner
  - **Behavioral / Theory** with text answers
  - **Live voice questions** with transcript display
- Quick Feedback mode:
  - Instant evaluation after each answer
  - Or deferred full review at the end of the session
- Organized **modular architecture** with clear separation of backend (Supabase functions), frontend (React/Next.js), and shared utils
- Demonstrates end-to-end skills: **real-time audio streaming, API bridging, UI/UX design, and secure secrets management**

---


### 🎥 Watch the Demo ✨

[![Watch Demo](https://img.youtube.com/vi/JQwXc9wWWIs/hqdefault.jpg)](https://www.youtube.com/watch?v=JQwXc9wWWIs)

💖 Click the thumbnail to watch!



---

## 🧰 Tech Stack

- **Languages:** TypeScript, JavaScript, HTML5, CSS3
- **Frontend:** React, Next.js, TailwindCSS
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **AI Integration:** OpenAI GPT-4o Realtime + Whisper transcription
- **Version Control:** Git + GitHub

---

## 🚀 Getting Started

### Prerequisites

- Node.js + npm
- Supabase project (with keys available in Project Settings → API)
- OpenAI API key (for Realtime / Whisper features)

### Environment Variables

This project requires a `.env` file. An example is provided as `.env.example`.

1. Copy the example file:
   ```bash
   cp .env.example .env
   Fill in your own keys:
   ```

.env :

VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_xxxxxxxxxxxxxxxxx"
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
Keep .env private (it’s already in .gitignore).

Set the same environment variables in your hosting platform (Vercel, Netlify, etc.).

```bash
Run Locally

# Clone the repository
git clone https://github.com/LovelyShades/AI-Tech-Interview.git
cd AI-Tech-Interview

# Install dependencies
npm install

# Start local dev server
npm run dev
📖 Usage Policy
This repository is for viewing and reference only:

✅ You may view the source code for educational review

❌ You may not copy, reuse, or redistribute any code or assets

❌ You may not integrate this project into personal, academic, or commercial work

🧱 Project Structure

root_/
├── supabase/functions/   # Edge functions (realtime interview, evaluation)
├── utils/                # Realtime client, audio helpers
├── components/           # React UI components (LiveInterviewPanel, AnswerPanel)
├── public/               # Static assets (images, css, js)
├── docs/                 # GIFs / showcase assets
└── README.md             # Documentation
📚 What This Project Demonstrates
Integration of AI realtime APIs with a custom WebSocket bridge

Handling live audio streaming + transcription in the browser

Designing interactive UI/UX for interview practice

Implementing Supabase Auth (Google Sign-In optional)

Structured, scalable project organization suitable for portfolio use

📄 License
This project is shared under a Custom No-Use License:

✅ You may view and reference the code

❌ You may not copy, reuse, or redistribute it

❌ You may not use it in personal, academic, or commercial projects

For collaboration or licensing inquiries, please contact:
📧 rosealanna18@gmail.com

👩‍💻 Author
Alanna Matundan
Full-stack developer · AI integration · Frontend design · Supabase + OpenAI bridging

© 2025 Alanna Matundan. All rights reserved.
```
