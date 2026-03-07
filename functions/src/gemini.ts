import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY não configurada no ambiente global. Certifique-se de que ela esteja disponível na execução da função.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");
export const fileManager = new GoogleAIFileManager(apiKey || "");

// Modelo padrão para geração de texto
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
