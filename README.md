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

## 🎬 Showcase
<p align="center">
  <img src="docs/gifs/live_interview.gif" alt="Live Interview"><br>
  <em>Speaking into the live interview panel with transcript preview</em>
</p>

<p align="center">
  <img src="docs/gifs/coding_mode.gif" alt="Coding Mode"><br>
  <em>Solving a coding question with test feedback</em>
</p>

<p align="center">
  <img src="docs/gifs/feedback.gif" alt="Feedback"><br>
  <em>Quick feedback highlighting strengths and improvements</em>
</p>

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
- Supabase project (with secrets configured)  
- OpenAI API key  

### Run Locally
```bash
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
│
├── supabase/functions/   # Edge functions (realtime interview, evaluation)
├── utils/                # Realtime client, audio helpers
├── components/           # React UI components (LiveInterviewPanel, AnswerPanel)
├── public/               # Static assets (images, css, js)
├── docs/                 # GIFs / showcase assets
└── README.md             # Documentation

📚 What This Project Demonstrates
Ability to integrate AI realtime APIs with a custom WebSocket bridge

Handling live audio streaming and transcription in the browser

Designing interactive UI/UX for interview practice

Implementing Supabase auth (Google Sign-In optional, not required)

Structured, scalable project organization for a portfolio-grade project

📄 License
This project is shared under a Custom No-Use License:

✅ You may view and reference the code
❌ You may not copy, reuse, or redistribute it
❌ You may not use it in personal, academic, or commercial projects

For collaboration or licensing inquiries, please contact:
📧 rosealanna18@gmail.com

👩‍💻 Author
Alanna Matundan — full-stack development, AI integration, frontend design, Supabase + OpenAI bridging

© 2025 Alanna Matundan. All rights reserved.
