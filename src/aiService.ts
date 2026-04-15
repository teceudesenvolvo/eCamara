import api from "./services/api";

/**
 * Envia uma mensagem para a IA (PÚBLICO).
 * @param {string} message O texto a ser enviado.
 * @return {Promise<string>} A resposta em texto da IA.
 */
export const sendMessageToAIPublic = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/process-chat/public', { message });
    return response.data.response;
  } catch (error: any) {
    console.error("Erro ao chamar IA Pública:", error);
    throw new Error(error.response?.data?.message || "Erro ao se comunicar com a IA.");
  }
};

/**
 * Gera uma ata a partir de uma transcrição e metadados.
 * @param {string} slug Slug da câmara.
 * @param {string} transcription Texto completo da sessão.
 * @param {object} metadata Dados da sessão (data, tipo).
 * @return {Promise<any>} Resultado do processamento.
 */
export const processAta = async (slug: string, transcription: string, metadata: any): Promise<any> => {
  try {
    const response = await api.post(`/process-ata/${slug}`, {
      transcription,
      metadata
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao processar ata:", error);
    throw new Error(error.response?.data?.message || "Erro ao gerar ata.");
  }
};

/**
 * Envia uma mensagem para a IA (PRIVADO).
 * @param {string} message O texto a ser enviado.
 * @return {Promise<string>} A resposta em texto da IA.
 */
export const sendMessageToAIPrivate = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/process-chat/private', { message });
    return response.data.response;
  } catch (error: any) {
    console.error("Erro ao chamar IA Privada:", error);
    throw new Error(error.response?.data?.message || "Erro ao se comunicar com a IA.");
  }
};
