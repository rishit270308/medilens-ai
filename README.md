# MediLens AI — Multimodal EHR Digitizer, Vernacular Voice Translator & Clinical Decision Support System

[![HackBase GCET](https://img.shields.io/badge/Event-Hackdays%202.0-blue)](https://unstop.com)
[![Tracks](https://img.shields.io/badge/Tracks-Healthcare%20%7C%20AI%2FML-emerald)](#)
[![Google Gemini API](https://img.shields.io/badge/Powered%20By-Google%20Gemini%201.5%20Flash-4285F4)](#)

> Developed for **Hackdays 2.0** by **Team Hackathoners** at Galgotias College of Engineering & Technology (GCET) in collaboration with Major League Hacking (MLH).

---

## 🌟 Submission Links
- **GitHub Repository:** `https://github.com/rishit270308/medilens-ai.git`
- **Live Demo Link:** `https://medilens-ai-beta.vercel.app/`

---

## 👥 Team Hackathoners
- **Rishit Khare** — Lead Developer & AI/ML Architecture
- **Ritika Mishra** — Full-Stack Systems & UI Architecture

---

## 📌 Problem Statement & Relevance
Over 800 million Indian outpatient encounters annually rely on unstandardized, cursive handwritten prescriptions and dense diagnostic lab PDFs. Standard OCR engines fail on cursive doctor handwriting, and non-English speaking patients lack accessible explanations in their native language, leading to adverse drug reactions and non-compliance.

## 💡 Proposed Solution
MediLens AI is an end-to-end multimodal health platform powered by **Google Gemini 1.5 Flash**:
1. Deciphers cursive handwriting and pathology lab values directly from camera uploads.
2. Extracts clinical data into strict, deterministic JSON schemas (Medicine Name, Dosage, Frequency, Food Timings).
3. Cross-checks active salts against OpenFDA contraindication registries to flag toxicities.
4. Translates instructions into Gujarati, Marathi, and Hindi with Web Speech audio synthesis.

---

## 🛠️ Tech Stack & Public APIs
- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons, Web Speech API
- **Backend / Routing:** Next.js Serverless API Routes (Node.js runtime)
- **AI Core:** Google Gemini API (`gemini-1.5-flash`) via `@google/genai`
- **Data & Safety Check:** OpenFDA Drug Contraindication Database
- **Hosting:** Vercel Edge Cloud

---

## 🚀 Local Installation & Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Add your Google Gemini API key to .env.local:
# GEMINI_API_KEY=your_gemini_api_key_here

# 3. Start development server
npm run dev
