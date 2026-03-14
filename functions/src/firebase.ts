import * as admin from "firebase-admin";
import type { Bucket } from "@google-cloud/storage";

// Variáveis para armazenar as instâncias (Singleton Pattern)
let storageBucketInstance: Bucket | null = null;
let dbInstance: admin.database.Database | null = null;

const initApp = () => {
  // This is the most robust way to initialize in a complex environment.
  // It tries to get the default app, and if it fails (throws), it initializes it.
  try {
    admin.app();
  } catch (e) {
    admin.initializeApp({
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://camara-ai-default-rtdb.firebaseio.com",
      storageBucket: "camara-ai.appspot.com",
    });
  }
};

export const getDb = () => {
  if (!dbInstance) {
    initApp();
    dbInstance = admin.database();
  }
  return dbInstance;
};

export const getBucket = () => {
  if (!storageBucketInstance) {
    initApp();
    storageBucketInstance = admin.storage().bucket() as unknown as Bucket;
  }
  return storageBucketInstance;
};
