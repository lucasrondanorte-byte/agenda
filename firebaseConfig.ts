import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔧 Configuración de mi proyecto real (copiada desde Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyB-cp0WqCa29oHwgGkJWhhbRln17k8y9T",
  authDomain: "conectamente-41d4f.firebaseapp.com",
  projectId: "conectamente-41d4f",
  storageBucket: "conectamente-41d4f.appspot.com",
  messagingSenderId: "355325606129",
  appId: "1:355325606129:web:11015df6a3f32fcfab5150"
};

// 🚀 Inicializa Firebase (Firebase modular SDK v9+)
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("✅ Firebase inicializado correctamente:", app.name);
