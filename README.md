<div align="center">
  <img src="public/pwa-512x512.png" alt="Finora Logo" width="120" />
  <h1>Finora: Premium Finance Tracker</h1>
  <p><strong>Military-grade secure, AI-powered, offline-first personal finance dashboard.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  </p>
</div>

<hr />

## ✨ The Next-Generation Finance App

Finora is not just another expense tracker. It is a **Progressive Web App (PWA)** engineered to deliver a native-like experience directly in your browser without the need for an App Store. Designed with a focus on speed, privacy, and cutting-edge features.

## 🚀 Killer Features

*   **📷 AI Smart Receipt Scanner**: Point your camera at any receipt, and the embedded **Tesseract AI** will automatically extract the store name and total amount. *(Works 100% offline in your browser!)*
*   **🔐 Native Biometric Vault**: Lock your financial data behind a military-grade security vault. Uses **WebAuthn API** to integrate directly with your device's native **FaceID, TouchID, Windows Hello, or PIN** for seamless offline security.
*   **🔮 AI Cashflow Forecaster**: Uses your recurring habits and variable spending averages to project your net worth up to 6 months into the future.
*   **⚡ Offline-First Architecture**: No cloud needed. Your data is stored securely on your device. It works flawlessly in airplane mode.
*   **📱 Installable PWA**: Click "Install" in your browser to add it to your home screen. It functions exactly like a native app with a locked viewport and standalone UI.
*   **🌍 Multi-Currency & Bilingual**: Automatically converts 7+ currencies on the fly and seamlessly switches between English and Indonesian.
*   **📈 Full Portfolio Tracking**: Track not just cash, but Debts, Budgets, Subscriptions, and Investments (Stocks, Crypto, Gold).

## 🛠️ Tech Stack

*   **Frontend Framework**: React 18 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: TailwindCSS v3 + shadcn/ui components
*   **Data Validation**: Zod + React Hook Form
*   **Charts & Visuals**: Recharts
*   **AI OCR**: Tesseract.js
*   **PWA**: vite-plugin-pwa (with autoUpdate and Workbox)

## 💻 Quick Start (Local Development)

To run Finora locally and experience the blazing fast UI:

```bash
# 1. Clone the repository
git clone https://github.com/HansZknight/Finora-Finance-Tracking-Application.git
cd Finora-Finance-Tracking-Application

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 📦 Deployment (Vercel)

This project is highly optimized for serverless platforms like Vercel.

1. Connect your GitHub repository to Vercel.
2. The Build Command is automatically detected as `npm run build`.
3. Output directory is `dist`.
4. Deploy!

*(Because it's a PWA, any new push to `main` will instantly force-update client apps thanks to the Workbox `skipWaiting` configuration).*

## 🔒 Privacy Guarantee

Finora is built on the philosophy of absolute privacy. We **do not** collect your financial data. All transactions, goals, budgets, and biometric credentials remain securely encrypted and stored entirely on your local device.

---
<div align="center">
  <sub>Built with ❤️ by Finora Team</sub>
</div>
