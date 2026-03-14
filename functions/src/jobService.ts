import { getDb } from "./firebase";
import { AtaJob } from "./ataJob";

const JOBS_REF = "camara-teste/ataJobs";

export const jobService = {
  /**
   * Busca todos os jobs com status 'pending'.
   */
  async getPendingJobs(): Promise<AtaJob[]> {
    const snapshot = await getDb()
      .ref(JOBS_REF)
      .orderByChild("status")
      .equalTo("pending")
      .once("value");

    const jobs: AtaJob[] = [];
    snapshot.forEach((child) => {
      jobs.push({
        id: child.key as string,
        ...child.val(),
      });
    });

    return jobs;
  },

  /**
   * Atualiza o status de um job.
   * @param {string} jobId ID do job
   * @param {string} status Novo status
   */
  async updateJobStatus(jobId: string, status: AtaJob["status"]): Promise<void> {
    await getDb().ref(`${JOBS_REF}/${jobId}`).update({ status });
  },

  /**
   * Salva a transcrição gerada.
   * @param {string} jobId ID do job
   * @param {string} text Texto da transcrição
   */
  async saveTranscription(jobId: string, text: string): Promise<void> {
    await getDb().ref(`${JOBS_REF}/${jobId}`).update({ transcription: text });
  },

  /**
   * Salva a ata final gerada.
   * @param {string} jobId ID do job
   * @param {string} ata Texto da ata
   */
  async saveAta(jobId: string, ata: string): Promise<void> {
    await getDb().ref(`${JOBS_REF}/${jobId}`).update({ ata });
  },

  /**
   * Registra um erro no job e atualiza o status para 'error'.
   * @param {string} jobId ID do job
   * @param {string} error Mensagem de erro
   */
  async saveError(jobId: string, error: string): Promise<void> {
    await getDb().ref(`${JOBS_REF}/${jobId}`).update({
      status: "error",
      error,
    });
  },
};
