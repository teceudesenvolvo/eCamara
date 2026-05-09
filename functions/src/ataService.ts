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
      Você é um sistema especialista em processamento de sessões legislativas municipais brasileiras.
      Seu objetivo é transformar a transcrição de uma sessão plenária em uma ATA OFICIAL estruturada, clara e juridicamente adequada, além de gerar um resumo executivo.

      Sua resposta DEVE ser estritamente um objeto JSON válido com a seguinte estrutura:
      {
        "metadata": {
          "reuniao": "Tipo da reunião identificada (ex: Sessão Ordinária, Extraordinária)",
          "dataHora": "Data e hora identificada no formato YYYY-MM-DDThh:mm",
          "local": "Local da reunião identificado",
          "participantes": "Lista de nomes dos vereadores presentes",
          "pauta": "Resumo sucinto da pauta discutida"
        },
        "transcription": "A transcrição completa e corrigida que foi fornecida",
        "ataHtml": "O texto da ATA OFICIAL formatado em HTML (texto corrido, formal, institucional)",
        "summaryHtml": "O RESUMO EXECUTIVO formatado em HTML (até 10 linhas + lista de projetos votados)"
      }

      REGRAS PARA A ATA OFICIAL (ataHtml):
      - Use linguagem formal, institucional e impessoal.
      - Formato: Texto corrido (não em tópicos).
      - Seções Obrigatórias: 
        1. ABERTURA DA SESSÃO
        2. PRESENÇA DOS VEREADORES
        3. EXPEDIENTE
        4. USO DA TRIBUNA
        5. ORDEM DO DIA
        6. DISCUSSÃO E VOTAÇÃO DE PROJETOS
        7. CONSIDERAÇÕES FINAIS
        8. ENCERRAMENTO
      - Siga o padrão: "Aos [dia] dias do mês de [mês] de [ano], às [hora], no plenário da Câmara Municipal de [cidade]..."
      - Use tags HTML: <p>, <h3> para seções, <strong> para nomes e resultados.

      REGRAS PARA O RESUMO EXECUTIVO (summaryHtml):
      - Resumo em até 10 linhas com os principais acontecimentos.
      - Lista de projetos votados com seus respectivos resultados.
      - Use tags HTML: <p>, <ul>, <li>.

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
