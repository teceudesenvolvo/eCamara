import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const getApiKey = () => process.env.GEMINI_API_KEY;

// Variáveis para armazenar as instâncias (Singleton Pattern)
let genAIInstance: GoogleGenerativeAI | null = null;
let fileManagerInstance: GoogleAIFileManager | null = null;

export const getGenAI = () => {
  if (!genAIInstance) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no ambiente.");
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
};

export const getFileManager = () => {
  if (!fileManagerInstance) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no ambiente.");
    fileManagerInstance = new GoogleAIFileManager(apiKey);
  }
  return fileManagerInstance;
};

// Helper para obter o modelo padrão
export const getModel = () => { // Alterado para gemini-2.5-flash
  return getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
};
