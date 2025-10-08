// firebaseConfig.ts
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-cp0WqCa29oHwgGkJWhhbRln17k8y9T",
  authDomain: "conectamente-41d4f.firebaseapp.com",
  projectId: "conectamente-41d4f",
  storageBucket: "conectamente-41d4f.appspot.com",
  messagingSenderId: "355325606129",
  appId: "1:355325606129:web:11015df6a3f32fcfab5150"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

