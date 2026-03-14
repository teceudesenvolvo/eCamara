import { getDb } from "./firebase";
import { AtaJob } from "./ataJob";

export const ataJobService = {
  /**
   * Cria um novo registro de job na coleção 'ataJobs'.
   *
   * @param {string} storagePath Caminho do arquivo de áudio no Storage
   * @param {string} sessaoId ID da sessão legislativa
   * @return {Promise<string>} O ID do documento criado (jobId)
   */
  async createJob(storagePath: string, sessaoId: string): Promise<string> {
    const jobData: Omit<AtaJob, "id"> = {
      storagePath,
      sessaoId,
      status: "pending",
      createdAt: Date.now(),
    };

    const ref = getDb().ref("camara-teste/ataJobs").push();
    await ref.set(jobData);
    return ref.key as string;
  },
};
