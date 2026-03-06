import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const youtubeService = {
  /**
   * Baixa o áudio de um vídeo do YouTube usando yt-dlp.
   * @param {string} videoUrl URL do vídeo
   * @param {string} outputPath Caminho onde o arquivo de áudio será salvo
   */
  async downloadAudio(videoUrl: string, outputPath: string): Promise<void> {
    console.log(`[YouTube] Iniciando download: ${videoUrl}`);

    // Comando para baixar apenas o áudio, converter para mp3 e salvar no caminho especificado
    // -x: Extrair áudio
    // --audio-format mp3: Converter para MP3
    // -o: Caminho de saída
    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${videoUrl}"`;

    try {
      const { stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`[YouTube] Aviso durante download: ${stderr}`);
      }
      console.log(`[YouTube] Download concluído: ${outputPath}`);
    } catch (error) {
      console.error("[YouTube] Erro no download:", error);
      throw new Error(`Falha ao baixar áudio do YouTube: ${(error as Error).message}`);
    }
  },
};
