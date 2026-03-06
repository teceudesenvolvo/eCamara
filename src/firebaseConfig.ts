import {initializeApp, getApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getFunctions} from "firebase/functions";

// Suas credenciais do Firebase para o projeto web (são seguras para expor)
const firebaseConfig = {
  apiKey: "AIzaSyA_tebhYRyY8nbNmYMXuB4-iDzUnO1f0PA",
  authDomain: "camara-ai.firebaseapp.com",
  databaseURL: "https://camara-ai-default-rtdb.firebaseio.com",
  projectId: "camara-ai",
  storageBucket: "camara-ai.firebasestorage.app",
  messagingSenderId: "397063571401",
  appId: "1:397063571401:web:08be8cf8beb4a0b7b20a18"
};

// Inicializa o Firebase de forma segura (evita reinicialização)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
// IMPORTANT: Especifique a região da sua função. Se não especificou, o padrão
// é 'us-central1'. Para projetos no Brasil, 'southamerica-east1' (São Paulo)
// é recomendado.
export const functions = getFunctions(app, "southamerica-east1");