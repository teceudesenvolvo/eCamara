import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onValueCreated } from "firebase-functions/v2/database";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import { ataJobService } from "./ataJobService";
import { workerService } from "./workerService";
import { genAI } from "./gemini";

setGlobalOptions({ maxInstances: 10, region: "southamerica-east1" });

/**
 * Função PRIVADA para interagir com a IA. Exige autenticação.
 * Usada nas áreas logadas do sistema.
 */
export const falarComCamaraAIPrivado = onCall(
  { secrets: ["GEMINI_API_KEY"] },
  async (request) => {
    // 1. Validação de autenticação do usuário
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "O usuário precisa estar autenticado para usar esta função.",
      );
    }

    // 2. Validação da mensagem enviada pelo cliente
    const userMessage = request.data.message;
    if (!userMessage || typeof userMessage !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A propriedade 'message' é obrigatória e deve ser um texto.",
      );
    }

    try {
      const logMessage = `[PRIVADO] Iniciando chamada para a IA com a mensagem: "${userMessage.substring(0, 30)}..."`;
      logger.info(logMessage);
      // Usa o cliente importado do gemini.ts. A chave é gerenciada lá.
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Ajustado para modelo válido

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      return { response: text };
    } catch (error) {
      logger.error("Erro na chamada da API do Gemini:", error);
      throw new HttpsError("internal", "Erro ao processar a resposta da IA.");
    }
  });

/**
 * Função PÚBLICA para interagir com a IA. NÃO exige autenticação.
 * Usada no chat da Home Page.
 */
export const falarComCamaraAIPublico = onCall(
  { secrets: ["GEMINI_API_KEY"] },
  async (request) => {
    // 1. Validação da mensagem enviada pelo cliente
    const userMessage = request.data.message;
    if (!userMessage || typeof userMessage !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A propriedade 'message' é obrigatória e deve ser um texto.",
      );
    }

    try {
      const msg = `[PÚBLICO] Iniciando chamada para a IA com a mensagem: "${userMessage.substring(0, 30)}..."`;
      logger.info(msg);

      const systemInstruction = "Você é o 'Camara AI', um assistente virtual " +
        "da Câmara Municipal. Sua função é responder perguntas dos cidadãos " +
        "sobre leis municipais, projetos em tramitação, sessões plenárias e " +
        "o trabalho dos vereadores. Use uma linguagem clara, objetiva e " +
        "neutra.";

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // Ajustado para modelo válido (2.5 ainda não é publico padrão)
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      return { response: text };
    } catch (error) {
      logger.error("[PÚBLICO] Erro na chamada da API do Gemini:", error);
      throw new HttpsError("internal", "Erro ao processar a resposta da IA.");
    }
  },
);

/**
 * Função para iniciar o processo de geração de Ata via Arquivo de Áudio (Assíncrono).
 * Recebe o caminho do arquivo no Storage e o ID da sessão, valida e cria um job no Firestore.
 * O processamento real será feito por um worker que escuta a coleção 'ataJobs'.
 */
export const gerarAtaViaArquivo = onCall(
  {
    region: "southamerica-east1",
    maxInstances: 10,
  },
  async (request) => {
    // 1. Validação de autenticação
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "O usuário precisa estar autenticado para solicitar a geração de ata."
      );
    }

    const { storagePath, sessaoId } = request.data;

    // 2. Validação de dados obrigatórios
    if (!storagePath || !sessaoId) {
      throw new HttpsError(
        "invalid-argument",
        "Os campos 'storagePath' e 'sessaoId' são obrigatórios."
      );
    }

    try {
      logger.info(`Criando job de ata para sessão ${sessaoId} e arquivo ${storagePath}`);

      // 4. Criação do Job no Firestore via Service
      const jobId = await ataJobService.createJob(storagePath, sessaoId);

      return { success: true, jobId };
    } catch (error) {
      logger.error("Erro ao criar job de ata:", error);
      throw new HttpsError("internal", "Erro interno ao criar o job de processamento.");
    }
  }
);

/**
 * Gatilho automático: Processa a Ata assim que o job é criado no banco.
 * Substitui a necessidade de um worker externo.
 * Usando v2 (Node 24) em us-central1 para compatibilidade com o trigger do banco.
 */
export const processarAtaOnCreate = onValueCreated(
  {
    ref: "camara-teste/ataJobs/{jobId}",
    region: "us-central1", // Região padrão para triggers de banco Gen 2
    timeoutSeconds: 540, // 9 minutos para processar vídeos longos
    memory: "2GiB", // Mais memória para o download/processamento
    secrets: ["GEMINI_API_KEY"],
  },
  async (event) => {
    const jobId = event.params.jobId;
    const jobData = event.data.val();

    // Apenas processa se o status for 'pending'
    if (!jobData || jobData.status !== "pending") {
      return;
    }

    try {
      logger.info(`[Trigger] Iniciando processamento do job ${jobId}`);
      await workerService.processJob(jobId, jobData.storagePath);
    } catch (error) {
      logger.error(`[Trigger] Erro fatal no job ${jobId}:`, error);
    }
  }
);
