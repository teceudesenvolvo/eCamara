import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuração global para limitar instâncias e controlar custos
// Embora setGlobalOptions funcione, definir a região explicitamente na função
// é mais robusto e evita problemas de configuração.
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

    // 2. Validação da chave de API no ambiente do servidor
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error(
        "A variável de ambiente GEMINI_API_KEY não está definida no servidor.",
      );
      throw new HttpsError("internal", "Configuração do servidor incompleta.");
    }

    // 3. Validação da mensagem enviada pelo cliente
    const userMessage = request.data.message;
    if (!userMessage || typeof userMessage !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A propriedade 'message' é obrigatória e deve ser um texto.",
      );
    }

    try {
      const logMessage = `Iniciando chamada para a IA com a mensagem: "${userMessage.substring(0, 30)}..."`;
      logger.info(logMessage);
      const genAI = new GoogleGenerativeAI(apiKey);
      // Usando o modelo gemini-1.5-flash que é mais rápido e estável
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      });
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
    // 1. Validação da chave de API no ambiente do servidor
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error(
        "A variável de ambiente GEMINI_API_KEY não está definida no servidor.",
      );
      throw new HttpsError("internal", "Configuração do servidor incompleta.");
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
      const msg = `[PÚBLICO] Iniciando chamada para a IA com a mensagem: "${userMessage.substring(0, 30)}..."`;
      logger.info(msg);

      const systemInstruction = `
            Você é um assistente legislativo da Câmara Municipal.

            Funções:
            - responder cidadãos sobre leis municipais
            - explicar projetos de lei
            - gerar documentos legislativos
            - orientar sobre funcionamento da Câmara

            Use linguagem clara, formal e institucional.
            Nunca invente leis inexistentes.
            Se não souber a informação, diga que precisa consultar o setor responsável.
            `;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
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
