import {httpsCallable} from "firebase/functions";
import {functions, db, storage} from "./firebaseConfig";
import { ref, onValue, off } from "firebase/database";
import { ref as storageRef, uploadBytes } from "firebase/storage";

// Referência para a função PÚBLICA (usada na Home)
const falarComIAPublico = httpsCallable(functions, "falarComCamaraAIPublico");

// Referência para a função PRIVADA (usada nas áreas logadas)
const falarComIAPrivado = httpsCallable(functions, "falarComCamaraAIPrivado");

// Referência para a função de Geração de Ata via Arquivo
const gerarAtaViaArquivoFunc = httpsCallable(functions, "gerarAtaViaArquivo");

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
 * Inicia o job de geração de ata a partir de um arquivo de áudio.
 * @param {File} file O arquivo de áudio selecionado.
 * @return {Promise<string>} O ID do job criado.
 */
export const startAtaGenerationJob = async (file: File): Promise<string> => {
  try {
    // Gera um ID de sessão temporário para o job
    const sessaoId = `assistente-${Date.now()}`;
    
    // 1. Upload do arquivo para o Firebase Storage
    const fileRef = storageRef(storage, `atas/temp/${sessaoId}_${file.name}`);
    await uploadBytes(fileRef, file);
    const storagePath = fileRef.fullPath;

    // 2. Inicia o Job no Backend passando o caminho do arquivo
    const result = await gerarAtaViaArquivoFunc({ storagePath, sessaoId });
    const data = result.data as { success: boolean; jobId: string };

    if (!data.jobId) {
      throw new Error("Não foi possível iniciar o processamento. O backend não retornou um ID de job.");
    }
    return data.jobId;
  } catch (error) {
    console.error("Erro ao gerar ata via arquivo:", error);
    const msg = (error as Error).message || "Erro ao processar o arquivo.";
    throw new Error(msg);
  }
};

/**
 * Escuta as atualizações de um job de ata no Realtime Database.
 * @param {string} jobId O ID do job para escutar.
 * @param {(status: string, data?: string) => void} onUpdate Callback acionado a cada atualização de status.
 * @return {() => void} Uma função para parar de escutar (unsubscribe).
 */
export const listenToAtaJob = (jobId: string, onUpdate: (status: string, data?: string) => void): () => void => {
  const jobRef = ref(db, `camara-teste/ataJobs/${jobId}`);
  const listener = onValue(jobRef, (snapshot) => {
    const job = snapshot.val();
    if (job) {
      onUpdate(job.status, job.ata || job.error);
    }
  });

  // Retorna uma função para que o componente possa se desinscrever do listener
  return () => off(jobRef, 'value', listener);
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
