import { jobService } from "./jobService";
import { youtubeService } from "./youtubeService";
import { transcriptionService } from "./transcriptionService";
import { ataService } from "./ataService";
import { getTempFilePath, cleanupFile } from "./tempFile";

export const workerService = {
  /**
   * Processa todos os jobs pendentes.
   * @return {Promise<number>} Número de jobs processados
   */
  async processPendingJobs(): Promise<number> {
    const jobs = await jobService.getPendingJobs();
    console.log(`[Worker] Encontrados ${jobs.length} jobs pendentes.`);

    for (const job of jobs) {
      await workerService.processJob(job.id, job.videoUrl);
    }

    return jobs.length;
  },

  /**
   * Executa o pipeline completo para um único job.
   * @param {string} jobId ID do job
   * @param {string} videoUrl URL do vídeo
   */
  async processJob(jobId: string, videoUrl: string): Promise<void> {
    console.log(`[Worker] Iniciando processamento do job ${jobId}...`);
    const audioPath = getTempFilePath(".mp3");

    try {
      // 1. Atualizar status para processing
      await jobService.updateJobStatus(jobId, "processing");

      // 2. Baixar áudio
      console.log(`[Worker] Baixando áudio para ${audioPath}...`);
      await youtubeService.downloadAudio(videoUrl, audioPath);

      // 3. Transcrever áudio
      console.log("[Worker] Transcrevendo áudio...");
      const transcription = await transcriptionService.transcribeAudio(audioPath);
      await jobService.saveTranscription(jobId, transcription);

      // 4. Gerar Ata
      console.log("[Worker] Gerando ata...");
      const ata = await ataService.generateAta(transcription);
      await jobService.saveAta(jobId, ata);

      // 5. Finalizar
      await jobService.updateJobStatus(jobId, "completed");
      console.log(`[Worker] Job ${jobId} concluído com sucesso!`);
    } catch (error) {
      console.error(`[Worker] Erro ao processar job ${jobId}:`, error);
      await jobService.saveError(jobId, (error as Error).message);
    } finally {
      // Limpeza de arquivos temporários
      cleanupFile(audioPath);
    }
  },
};
