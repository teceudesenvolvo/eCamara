import { getBucket } from "./firebase";

export const storageService = {
  /**
   * Baixa um arquivo do Firebase Storage para o sistema de arquivos local.
   * @param {string} storagePath Caminho do arquivo no Storage (ex: atas/audio.mp3)
   * @param {string} destination Caminho local onde o arquivo será salvo
   */
  async downloadFile(storagePath: string, destination: string): Promise<void> {
    console.log(`[Storage] Baixando arquivo: ${storagePath} para ${destination}`);
    await getBucket().file(storagePath).download({
      destination,
    });
    console.log("[Storage] Download concluído.");
  },

  /**
   * Deleta um arquivo do Firebase Storage.
   * @param {string} storagePath Caminho do arquivo no Storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    console.log(`[Storage] Deletando arquivo: ${storagePath}`);
    await getBucket().file(storagePath).delete();
  },
};
