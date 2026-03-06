import {httpsCallable} from "firebase/functions";
import {functions} from "./firebaseConfig";

// Referência para a função PÚBLICA (usada na Home)
const falarComIAPublico = httpsCallable(functions, "falarComCamaraAIPublico");

// Referência para a função PRIVADA (usada nas áreas logadas)
const falarComIAPrivado = httpsCallable(functions, "falarComCamaraAIPrivado");

/**
 * Envia uma mensagem para a Cloud Function PÚBLICA (sem autenticação).
 * @param {string} message O texto a ser enviado para o modelo Gemini.
 * @return {Promise<string>} A resposta em texto da IA.
 */
export const sendMessageToAIPublic = async (message: string): Promise<string> => {
  try {
    const result = await falarComIAPublico({message});
    const aiResponse = (result.data as { response: string }).response;
    return aiResponse;
  } catch (error) {
    console.error("Erro ao chamar a Cloud Function 'falarComCamaraAIPublico':", error);
    // A HttpsError do Firebase já vem com uma mensagem amigável.
    const msg = (error as Error).message || "Erro ao se comunicar com a IA.";
    throw new Error(msg);
  }
};

/**
 * Envia uma mensagem para a Cloud Function PRIVADA (com autenticação).
 * @param {string} message O texto a ser enviado para o modelo Gemini.
 * @return {Promise<string>} A resposta em texto da IA.
 */
export const sendMessageToAIPrivate = async (message: string): Promise<string> => {
  try {
    const result = await falarComIAPrivado({message});
    const aiResponse = (result.data as { response: string }).response;
    return aiResponse;
  } catch (error) {
    console.error("Erro ao chamar a Cloud Function 'falarComCamaraAIPrivado':", error);
    const msg = (error as Error).message || "Erro ao se comunicar com a IA.";
    throw new Error(msg);
  }
};