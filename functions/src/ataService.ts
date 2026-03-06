import { model } from "./gemini";

export const ataService = {
  /**
   * Gera uma Ata Legislativa a partir de um texto de transcrição.
   * @param {string} transcription Texto transcrito da sessão
   * @return {Promise<string>} Texto da Ata formatada
   */
  async generateAta(transcription: string): Promise<string> {
    console.log("[Ata] Gerando ata legislativa...");

    const prompt = `
      Você é um secretário legislativo especializado em câmaras municipais brasileiras.
      Com base na transcrição abaixo, gere uma ATA DE SESSÃO LEGISLATIVA formal e completa.

      Estruture o documento com os seguintes tópicos:
      1. Abertura da sessão (Data, horário, local, presidência)
      2. Vereadores presentes (Liste os nomes identificados)
      3. Matérias apresentadas (Resumo do expediente)
      4. Discussões (Resumo dos debates e oradores)
      5. Votações (Resultados das deliberações)
      6. Encerramento

      Transcrição:
      ${transcription}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  },
};
