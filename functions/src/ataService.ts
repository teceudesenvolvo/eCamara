import { getModel } from "./gemini";

export const ataService = {
  /**
   * Gera uma Ata Legislativa a partir de um texto de transcrição.
   * @param {string} transcription Texto transcrito da sessão
   * @return {Promise<string>} JSON string com html e metadados
   */
  async generateAta(transcription: string): Promise<string> {
    console.log("[Ata] Gerando ata legislativa...");

    const prompt = `
      Você é um secretário legislativo especializado em câmaras municipais brasileiras.
      Com base na transcrição abaixo, gere uma ATA DE SESSÃO LEGISLATIVA formal e completa.

      Sua resposta DEVE ser estritamente um objeto JSON válido com a seguinte estrutura:
      {
        "metadata": {
          "reuniao": "Tipo da reunião identificada (ex: Sessão Ordinária, Extraordinária)",
          "dataHora": "Data e hora identificada no formato YYYY-MM-DDThh:mm (ex: 2024-03-15T14:00)",
          "local": "Local da reunião identificado",
          "participantes": "Lista de nomes dos vereadores presentes separados por vírgula",
          "pauta": "Resumo sucinto da pauta discutida"
        },
        "html": "O texto completo da ata formatado em HTML"
      }

      DIRETRIZES PARA O CAMPO "html":
      - Use tags <p> para cada parágrafo.
      - Use <h3> para os títulos das seções (ex: <h3>ABERTURA</h3>).
      - Use <strong> para destacar nomes de vereadores e resultados (ex: <strong>APROVADO</strong>).
      - Use <ul> e <li> para listas (presença, matérias).
      - NÃO use Markdown (como **, ##, -). Use apenas tags HTML.
      - Evite caracteres especiais desnecessários.

      Transcrição:
      ${transcription}
    `;

    const result = await getModel().generateContent(prompt);
    let text = result.response.text();
    // Limpeza para garantir JSON válido caso o modelo envolva em markdown
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
    return text;
  },
};
