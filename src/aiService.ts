import api from "./services/api";

/**
 * Envia uma mensagem para o chat de IA (pública ou privada).
 * @param {string} message - Texto a enviar.
 * @param {string} slug - Slug da câmara (ex: "paraipaba").
 * @param {string} [context] - Contexto opcional da conversa.
 * @return {Promise<string>} Resposta em texto da IA.
 */
export const sendMessageToAIPublic = async (
  message: string,
  slug: string = "master",
  context?: string
): Promise<string> => {
  if (!message || !message.trim()) {
    throw new Error("A mensagem enviada para a IA não pode estar vazia.");
  }

  try {
    // Garante que o slug seja válido para a rota multi-tenant
    const councilSlug = (slug && slug !== ':camaraId') ? slug : "master";
    const response = await api.post(`/ai/chat/${councilSlug}`, { message, context });
    return response.data.response || response.data.text || response.data;
  } catch (error: any) {
    console.error("Erro ao chamar IA Pública:", error);
    throw new Error(error.response?.data?.message || "Erro ao se comunicar com a IA.");
  }
};

/**
 * Envia uma mensagem para o chat de IA (privada, requer autenticação).
 * @param {string} message - Texto a enviar.
 * @param {string} slug - Slug da câmara (ex: "paraipaba").
 * @param {string} [context] - Contexto opcional da conversa.
 * @return {Promise<string>} Resposta em texto da IA.
 */
export const sendMessageToAIPrivate = async (
  message: string,
  slug?: string,
  context?: string
): Promise<string> => {
  if (!message || !message.trim()) {
    throw new Error("A mensagem enviada para a IA não pode estar vazia.");
  }

  try {
    // Prioriza o slug passado, senão busca no localStorage do usuário autenticado
    const user = JSON.parse(localStorage.getItem("@CamaraAI:user") || "{}");
    const councilSlug = (slug && slug !== ':camaraId') ? slug : (user.council || "master");

    const response = await api.post(`/ai/chat/${councilSlug}`, { message, context });
    return response.data.response || response.data.text || response.data;
  } catch (error: any) {
    console.error("Erro ao chamar IA Privada:", error);
    throw new Error(error.response?.data?.message || "Erro ao se comunicar com a IA.");
  }
};

/**
 * Gera uma ata a partir de uma transcrição e metadados.
 * @param {string} slug - Slug da câmara.
 * @param {string} transcription - Texto completo da sessão.
 * @param {object} metadata - Dados da sessão (date, sessionType).
 * @return {Promise<any>} Resultado do processamento.
 */
export const processAta = async (slug: string, transcription: string, metadata: any): Promise<any> => {
  if (!transcription) {
    throw new Error("A transcrição é necessária para gerar a ata.");
  }

  const user = JSON.parse(localStorage.getItem("@CamaraAI:user") || "{}");
  const councilSlug = (slug && slug !== ':camaraId') ? slug : (user.council || "master");

  try {
    const response = await api.post(`/process-ata/${slug}`, {
      transcription,
      metadata,
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao processar ata:", error);
    throw new Error(error.response?.data?.message || "Erro ao gerar ata.");
  }
};

/**
 * Gera um parecer legislativo sobre uma matéria.
 * @param {string} slug - Slug da câmara.
 * @param {string} title - Título da matéria.
 * @param {string} description - Descrição/corpo da matéria.
 * @return {Promise<string>} Texto do parecer gerado.
 */
export const generateParecer = async (slug: string, title: string, description: string): Promise<string> => {
  const user = JSON.parse(localStorage.getItem("@CamaraAI:user") || "{}");
  const councilSlug = (slug && slug !== ':camaraId') ? slug : (user.council || "master");

  try {
    const response = await api.post(`/ai/parecer/${slug}`, { title, description });
    return response.data.parecer || response.data.response || response.data.text || response.data;
  } catch (error: any) {
    console.error("Erro ao gerar parecer:", error);
    throw new Error(error.response?.data?.message || "Erro ao gerar parecer.");
  }
};

/**
 * Analisa tecnicamente uma matéria antes de ser protocolada.
 * @param {string} title - Título da matéria.
 * @param {string} description - Descrição da matéria.
 * @return {Promise<{ aprovado: boolean, analise: string }>} Resultado da análise.
 */
export const analisarMateria = async (
  title: string,
  description: string
): Promise<{ aprovado: boolean; analise: string }> => {
  try {
    const response = await api.post(`/ai/analisar-materia`, { title, description });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao analisar matéria:", error);
    throw new Error(error.response?.data?.message || "Erro ao analisar matéria.");
  }
};
