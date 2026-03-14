import { getFileManager, getModel } from "./gemini";
import { FileState } from "@google/generative-ai/server";

export const transcriptionService = {
  /**
   * Transcreve um arquivo de áudio usando o Google Gemini.
   * @param {string} filePath Caminho do arquivo de áudio local
   * @return {Promise<string>} Texto transcrito
   */
  async transcribeAudio(filePath: string): Promise<string> {
    console.log(`[Transcription] Iniciando upload para Gemini: ${filePath}`);

    // 1. Upload do arquivo para o Google AI File Manager
    const uploadResponse = await getFileManager().uploadFile(filePath, {
      mimeType: "audio/mp3",
      displayName: "Audio Sessão Legislativa Chunk",
    });

    const fileUri = uploadResponse.file.uri;
    console.log(`[Transcription] Upload concluído. URI: ${fileUri}`);

    // 2. Aguardar processamento do arquivo pelo Google
    let file = await getFileManager().getFile(uploadResponse.file.name);
    while (file.state === FileState.PROCESSING) {
      console.log("[Transcription] Processando arquivo de áudio...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await getFileManager().getFile(uploadResponse.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Falha no processamento do áudio pelo Gemini.");
    }

    console.log("[Transcription] Arquivo pronto. Solicitando transcrição...");

    // 3. Solicitar transcrição
    const result = await getModel().generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Transcreva este áudio com precisão, identificando os oradores se possível." },
    ]);

    return result.response.text();
  },

  /**
   * Transcreve múltiplos blocos de áudio e concatena o resultado.
   * @param {string[]} chunks Array com caminhos dos arquivos de áudio
   * @return {Promise<string>} Texto completo transcrito
   */
  async transcribeChunks(chunks: string[]): Promise<string> {
    let fullTranscription = "";
    for (const chunkPath of chunks) {
      console.log(`[Transcription] Processando bloco: ${chunkPath}`);
      const chunkText = await transcriptionService.transcribeAudio(chunkPath);
      fullTranscription += chunkText + "\n\n";
    }
    return fullTranscription;
  },
};
