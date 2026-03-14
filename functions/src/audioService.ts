import * as fs from "fs";
import * as path from "path";

export const audioService = {
  /**
   * Converte um arquivo de áudio para MP3.
   * O ffmpeg é carregado sob demanda para evitar erros de inicialização global.
   * @param {string} inputPath Caminho do arquivo de entrada
   * @param {string} outputPath Caminho do arquivo de saída
   */
  async convertToMp3(inputPath: string, outputPath: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpeg = require("fluent-ffmpeg");
    console.log(`[Audio] Convertendo para MP3: ${inputPath}`);
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("mp3")
        .on("end", () => {
          console.log(`[Audio] Conversão concluída: ${outputPath}`);
          resolve();
        })
        .on("error", (err: Error) => {
          console.error("[Audio] Erro na conversão:", err);
          reject(err);
        })
        .save(outputPath);
    });
  },

  /**
   * Divide o arquivo de áudio em blocos de aproximadamente 10 minutos.
   * O ffmpeg é carregado sob demanda.
   * @param {string} filePath Caminho do arquivo de áudio
   * @param {string} outputDir Diretório onde os blocos serão salvos
   * @return {Promise<string[]>} Array com os caminhos dos arquivos gerados
   */
  async splitAudio(filePath: string, outputDir: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpeg = require("fluent-ffmpeg");
    console.log(`[Audio] Dividindo áudio em blocos: ${filePath}`);
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions([
          "-f segment",
          "-segment_time 600", // 10 minutos em segundos
          "-c copy",
        ])
        .output(path.join(outputDir, "chunk-%03d.mp3"))
        .on("end", () => {
          console.log("[Audio] Divisão concluída.");
          // Lista os arquivos gerados no diretório
          fs.readdir(outputDir, (err, files) => {
            if (err) {
              reject(err);
              return;
            }
            const chunks = files
              .filter((file) => file.startsWith("chunk-") && file.endsWith(".mp3"))
              .map((file) => path.join(outputDir, file))
              .sort(); // Garante a ordem correta
            resolve(chunks);
          });
        })
        .on("error", (err: Error) => {
          console.error("[Audio] Erro na divisão:", err);
          reject(err);
        })
        .run();
    });
  },
};
