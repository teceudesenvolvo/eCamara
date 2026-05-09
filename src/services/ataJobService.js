import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, set, push } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "../firebase";
import { initializeApp } from "firebase/app";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);
const functions = getFunctions(app, "southamerica-east1");

/**
 * Inicia o processo de geração de ata.
 * 1. Faz upload do áudio para o Firebase Storage.
 * 2. Chama a Cloud Function para criar o job.
 * @param {File} file Arquivo de áudio/vídeo
 * @param {string} camaraId ID da câmara
 * @returns {Promise<string>} ID do Job criado
 */
export const startAtaGenerationJob = async (file, camaraId = 'camara-teste') => {
    try {
        const storagePath = `atas/${camaraId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        console.log("Iniciando upload para Firebase Storage...");
        await uploadBytes(storageRef, file);
        console.log("Upload concluído.");

        const gerarAta = httpsCallable(functions, 'gerarAtaViaArquivo');
        const result = await gerarAta({ 
            storagePath, 
            sessaoId: `sessao_${Date.now()}` // ID temporário se não houver um específico
        });

        return result.data.jobId;
    } catch (error) {
        console.error("Erro ao iniciar job de ata:", error);
        throw error;
    }
};

/**
 * Escuta as atualizações de um job de ata no Realtime Database.
 * @param {string} jobId ID do Job
 * @param {Function} callback Função chamada a cada atualização de status
 * @returns {Function} Função para remover o listener (unsubscribe)
 */
export const listenToAtaJob = (jobId, callback) => {
    const jobRef = dbRef(database, `camara-teste/ataJobs/${jobId}`);
    
    const unsubscribe = onValue(jobRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log("Update do Job:", data.status);
            callback(data.status, data.result || data.error);
        }
    });

    return unsubscribe;
};
