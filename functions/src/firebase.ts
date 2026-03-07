import * as admin from "firebase-admin";

// Inicializa o Firebase Admin SDK
// Certifique-se de que as credenciais (GOOGLE_APPLICATION_CREDENTIALS) estejam configuradas no ambiente
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://camara-ai-default-rtdb.firebaseio.com",
  });
}

export const db = admin.database();
export const bucket = admin.storage().bucket();
