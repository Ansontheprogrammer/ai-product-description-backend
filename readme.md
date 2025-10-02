# Hey Ally – Shopify AI Descriptions (Backend)

## 📖 Description

This is the **backend service** for Hey Ally, an AI-powered Shopify assistant that generates unique product descriptions using **OpenAI GPT models**.

It provides a **REST API** (built with Restify) and uses **Firebase Firestore** for data persistence.  
👉 This repo does **not include a frontend** — developers will need to connect their own client (e.g., Shopify App, Remix, React, or custom UI).

---

## ⚙️ Installation

### 1. Clone the repo

bash

```
git clone https://github.com/your-repo/hey-ally-shopify-backend.git
cd hey-ally-shopify-backend
```

### 2. Install dependencies

```
npm install
```

### 3. Environment setup

Create a .env file in the root with the following values:

# OpenAI

```
OPENAI_API_KEY=your_openai_key
```

# Firebase

```
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 🚀 Running the Backend

# Development

```
npm run dev
```

# Production

```
npm run build
npm start
```

# 🧪 Testing

Run backend tests:

```
npm test
```

Tests cover:

Firestore connection

Collection existence (users, descriptions)

Live OpenAI API request

# 📌 Features

REST API for AI-generated product descriptions

Firestore storage for users & descriptions

Custom prompt support for varied outputs

Works with any frontend (React, Shopify App, Next.js, etc.)
