import {httpsCallable} from "firebase/functions";
import {functions, db} from "./firebaseConfig";
import { ref, onValue, off } from "firebase/database";

// Referência para a função PÚBLICA (usada na Home)
const falarComIAPublico = httpsCallable(functions, "falarComCamaraAIPublico");

// Referência para a função PRIVADA (usada nas áreas logadas)
const falarComIAPrivado = httpsCallable(functions, "falarComCamaraAIPrivado");

// Referência para a função de Geração de Ata via YouTube
const gerarAtaYoutubeFunc = httpsCallable(functions, "gerarAtaViaYoutube");

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
 * Gera uma Ata Oficial a partir de uma URL de vídeo do YouTube.
 * @param {string} videoUrl A URL do vídeo do YouTube.
 * @return {Promise<string>} O texto da ata formatado em HTML.
 */
export const generateAtaFromYoutube = async (videoUrl: string): Promise<string> => {
  try {
    // Gera um ID de sessão temporário para o job
    const sessaoId = `assistente-${Date.now()}`;
    
    // 1. Inicia o Job no Backend
    const result = await gerarAtaYoutubeFunc({ videoUrl, sessaoId });
    const data = result.data as { success: boolean; jobId: string };
    const jobId = data.jobId;

    if (!jobId) throw new Error("Não foi possível iniciar o processamento.");

    // 2. Aguarda a conclusão (Escuta o Realtime Database)
    return new Promise((resolve, reject) => {
      const jobRef = ref(db, `camara-teste/ataJobs/${jobId}`);
      
      const listener = onValue(jobRef, (snapshot) => {
        const job = snapshot.val();
        if (!job) return;

        if (job.status === 'completed' && job.ata) {
          off(jobRef, 'value', listener); // Para de escutar
          resolve(job.ata);
        } else if (job.status === 'error') {
          off(jobRef, 'value', listener);
          reject(new Error(job.error || "Erro desconhecido durante o processamento."));
        }
      }, (error) => {
        off(jobRef, 'value', listener);
        reject(error);
      });
    });
  } catch (error) {
    console.error("Erro ao gerar ata via YouTube:", error);
    const msg = (error as Error).message || "Erro ao processar o vídeo.";
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