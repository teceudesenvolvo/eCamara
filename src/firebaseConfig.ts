import {initializeApp, getApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFunctions} from "firebase/functions";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Suas credenciais do Firebase para o projeto web (são seguras para expor)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa o Firebase de forma segura (evita reinicialização)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getDatabase(app); // Alterado para Realtime Database
export const storage = getStorage(app);
// IMPORTANT: Especifique a região da sua função. Se não especificou, o padrão
// é 'us-central1'. Para projetos no Brasil, 'southamerica-east1' (São Paulo)
// é recomendado.
export const functions = getFunctions(app, "southamerica-east1");
