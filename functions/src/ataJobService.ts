import * as admin from "firebase-admin";
import { AtaJob } from "./ataJob";

// Inicializa o Firebase Admin SDK se ainda não estiver inicializado
// Isso é necessário para acessar o Realtime Database com privilégios de admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

export const ataJobService = {
  /**
   * Cria um novo registro de job na coleção 'ataJobs'.
   *
   * @param {string} videoUrl URL do vídeo do YouTube
   * @param {string} sessaoId ID da sessão legislativa
   * @return {Promise<string>} O ID do documento criado (jobId)
   */
  async createJob(videoUrl: string, sessaoId: string): Promise<string> {
    const jobData: Omit<AtaJob, "id"> = {
      videoUrl,
      sessaoId,
      status: "pending",
      createdAt: Date.now(),
    };

    const ref = db.ref("camara-teste/ataJobs").push();
    await ref.set(jobData);
    return ref.key as string;
  },
};
