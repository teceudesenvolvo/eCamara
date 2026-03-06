import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

setGlobalOptions({ maxInstances: 10, region: "southamerica-east1" });

/**
 * Tipo mínimo esperado da resposta do Gemini
 */
type GeminiResponse = {
  response: {
    text: () => string;
  };
};

/**
 * Interface mínima do modelo Gemini
 */
interface GeminiModel {
  generateContent: (input: unknown) => Promise<GeminiResponse>;
}

/**
 * Executa chamada ao Gemini com retry automático
 *
 * @param {GeminiModel} model Instância do modelo Gemini
 * @param {unknown} prompt Conteúdo enviado ao modelo
 * @return {Promise<string>} Texto retornado pela IA
 */
async function gerarComRetry(
  model: GeminiModel,
  prompt: unknown
): Promise<string> {
  const MAX_TENTATIVAS = 3;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (error: unknown) {
      logger.error(`Erro na tentativa ${tentativa}`, { error });

      if (tentativa === MAX_TENTATIVAS) {
        throw error;
      }

      const err = error as { status?: number };

      if (err?.status === 429 || err?.status === 500 || err?.status === 503) {
        const delay = Math.pow(2, tentativa) * 1000;

        logger.warn(`Retry em ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error("Falha ao gerar conteúdo.");
}

/**
 * Função PRIVADA para interagir com a IA
 * Exige autenticação do usuário
 */
export const falarComCamaraAIPrivado = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "O usuário precisa estar autenticado para usar esta função."
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.error(
        "A variável de ambiente GEMINI_API_KEY não está definida no servidor."
      );
      throw new HttpsError(
        "internal",
        "Configuração do servidor incompleta."
      );
    }

    const userMessage = request.data.message;

    if (!userMessage || typeof userMessage !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A propriedade 'message' é obrigatória e deve ser um texto."
      );
    }

    try {
      logger.info(
        `Iniciando chamada IA PRIVADA: "${userMessage.substring(0, 30)}..."`
      );

      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      }) as unknown as GeminiModel;

      const text = await gerarComRetry(model, {
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      });

      return { response: text };
    } catch (error) {
      logger.error("Erro na chamada da API do Gemini:", { error });

      throw new HttpsError(
        "internal",
        "Erro ao processar a resposta da IA."
      );
    }
  }
);

/**
 * Função PÚBLICA para interagir com a IA
 * Usada no chat público da Câmara
 */
export const falarComCamaraAIPublico = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.error(
        "A variável de ambiente GEMINI_API_KEY não está definida no servidor."
      );

      throw new HttpsError(
        "internal",
        "Configuração do servidor incompleta."
      );
    }

    const userMessage = request.data.message;

    if (!userMessage || typeof userMessage !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A propriedade 'message' é obrigatória e deve ser um texto."
      );
    }

    try {
      logger.info(
        `[PÚBLICO] Chamada IA: "${userMessage.substring(0, 30)}..."`
      );

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
      }) as unknown as GeminiModel;

      const text = await gerarComRetry(model, userMessage);

      return { response: text };
    } catch (error) {
      logger.error("[PÚBLICO] Erro na chamada da API do Gemini:", { error });

      throw new HttpsError(
        "internal",
        "Erro ao processar a resposta da IA."
      );
    }
  }
);

