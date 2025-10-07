# AI-Product-Description

# 📖 Description

This is the backend service created by AnsonErvin Inc., used to generate unique product descriptions using the models in the ai-product-description package.
It provides a REST API (built with Restify) and uses Firebase Firestore for data persistence. The service now includes Stripe Payments API integration for handling subscription and payment processing.👉 This repo does not include a frontend — developers will need to connect their own client (e.g., Shopify App, Remix, React, or custom UI).

## ⚙️ Installation

1. Clone the repo

```
git clone https://github.com/your-repo/hey-ally-shopify-backend.git
cd hey-ally-shopify-backend
```

## 2. Install dependencies

npm install

## 3. Environment setup

Create a .env file in the root with the following values:
OpenAI

```
OPENAI_API_KEY=your_openai_key
```

# Firebase

Create a firebase.cert.json file in the lib directory with your Firebase service account credentials.
Stripe

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Note: Obtain your Stripe keys from the Stripe Dashboard. The webhook secret is required for handling payment events (e.g., subscription updates, payment success/failure).

## 🚀 Running the Backend

### Development

```
npm run dev
```

### Production

```
npm run build
npm start
```

# 🧪 Testing

Run backend tests:

```
npm test
```

### Tests cover:

Firestore connection
Collection existence (users, descriptions)
Live OpenAI API request
Stripe payment processing (e.g., subscription creation, webhook handling)

## 📌 Features

REST API for AI-generated product descriptions
Firestore storage for users & descriptions
Custom prompt support for varied outputs
Stripe Payments API for subscription management and payment processing
Works with any frontend (React, Shopify App, Next.js, etc.)
