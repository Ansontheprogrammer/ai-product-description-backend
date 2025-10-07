// Import the functions you need from the SDKs you need
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import * as dotenv from "dotenv";
/// Load enviroment variables.
dotenv.config();
let serviceAccount;
if (process.env.NODE_ENV === "production") {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require("../firebase.cert.json");
}
initializeApp({
  credential: cert(serviceAccount),
});

// ✅ Get Firestore instance
export const db = getFirestore();
