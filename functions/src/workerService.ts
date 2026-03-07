import { jobService } from "./jobService";
import { storageService } from "./storageService";
import { audioService } from "./audioService";
import { transcriptionService } from "./transcriptionService";
import { ataService } from "./ataService";
import { getTempFilePath, getTempDir, cleanupFile, cleanupDir } from "./tempFile";

export const workerService = {
  /**
   * Processa todos os jobs pendentes.
   * @return {Promise<number>} Número de jobs processados
   */
  async processPendingJobs(): Promise<number> {
    const jobs = await jobService.getPendingJobs();
    console.log(`[Worker] Encontrados ${jobs.length} jobs pendentes.`);

    for (const job of jobs) {
      await workerService.processJob(job.id, job.storagePath);
    }

    return jobs.length;
  },

  /**
   * Executa o pipeline completo para um único job.
   * @param {string} jobId ID do job
   * @param {string} storagePath Caminho do arquivo no Storage
   */
  async processJob(jobId: string, storagePath: string): Promise<void> {
    console.log(`[Worker] Iniciando processamento do job ${jobId}...`);
    const rawAudioPath = getTempFilePath(".mp3"); // Assumindo que o upload pode ser mp3 ou outro formato
    const mp3AudioPath = getTempFilePath(".mp3");
    const chunksDir = getTempDir();

    try {
      // 1. Atualizar status para processing
      await jobService.updateJobStatus(jobId, "processing");

      // 2. Baixar áudio do Storage
      console.log("[Worker] Baixando arquivo do Storage...");
      await storageService.downloadFile(storagePath, rawAudioPath);

      // 3. Converter para MP3
      console.log("[Worker] Convertendo áudio para MP3...");
      await audioService.convertToMp3(rawAudioPath, mp3AudioPath);

      // 4. Dividir áudio em blocos
      console.log("[Worker] Dividindo áudio em blocos...");
      const chunks = await audioService.splitAudio(mp3AudioPath, chunksDir);
      console.log(`[Worker] Áudio dividido em ${chunks.length} blocos.`);

      // 5. Transcrever blocos
      console.log("[Worker] Transcrevendo blocos de áudio...");
      const transcription = await transcriptionService.transcribeChunks(chunks);
      await jobService.saveTranscription(jobId, transcription);

      // 6. Gerar Ata
      console.log("[Worker] Gerando ata...");
      const ata = await ataService.generateAta(transcription);
      await jobService.saveAta(jobId, ata);

      // 7. Finalizar
      await jobService.updateJobStatus(jobId, "completed");
      console.log(`[Worker] Job ${jobId} concluído com sucesso!`);

      // 8. Limpar Storage (Economia de espaço)
      await storageService.deleteFile(storagePath);
      console.log(`[Worker] Arquivo de áudio removido do Storage: ${storagePath}`);
    } catch (error) {
      console.error(`[Worker] Erro ao processar job ${jobId}:`, error);
      await jobService.saveError(jobId, (error as Error).message);
    } finally {
      // Limpeza de arquivos temporários
      cleanupFile(rawAudioPath);
      cleanupFile(mp3AudioPath);
      cleanupDir(chunksDir);
    }
  },
};
