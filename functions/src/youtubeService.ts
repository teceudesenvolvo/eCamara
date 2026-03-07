import ytdl from "@distube/ytdl-core";
import * as fs from "fs";

export const youtubeService = {
  /**
   * Baixa o áudio de um vídeo do YouTube usando ytdl-core.
   * @param {string} videoUrl URL do vídeo
   * @param {string} outputPath Caminho onde o arquivo de áudio será salvo
   */
  async downloadAudio(videoUrl: string, outputPath: string): Promise<void> {
    console.log(`[YouTube] Iniciando download: ${videoUrl}`);

    return new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, {
        quality: "highestaudio",
        filter: "audioonly",
      });

      stream.pipe(fs.createWriteStream(outputPath));

      stream.on("end", () => {
        console.log(`[YouTube] Download concluído: ${outputPath}`);
        resolve();
      });

      stream.on("error", (error) => {
        console.error("[YouTube] Erro no download:", error);
        reject(new Error(`Falha ao baixar áudio do YouTube: ${error.message}`));
      });
    });
  },
};
