import api from './api.js';

/**
 * Inicia o job de geração de ata enviando um arquivo de áudio/vídeo para o backend.
 * O backend transcreve o áudio e gera a ata usando IA.
 *
 * @param {File} file        Arquivo de áudio ou vídeo
 * @param {string} camaraId  ID/slug da câmara
 * @param {string} sessaoId  ID opcional da sessão (usa timestamp se omitido)
 * @returns {Promise<string>} ID do Job criado no backend
 */
export const startAtaJobFromFile = async (file, camaraId = 'camara-teste', sessaoId) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('camaraId', camaraId);
    formData.append('sessaoId', sessaoId || `sessao_${Date.now()}`);

    console.log('[ataJobService] Enviando arquivo de áudio para o backend...', file.name);

    const response = await api.post('/ata/from-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000, // 2 minutos para uploads grandes
    });

    const { jobId } = response.data;
    if (!jobId) throw new Error('Backend não retornou um jobId.');
    console.log('[ataJobService] Job criado:', jobId);
    return jobId;
};

/**
 * Inicia o job de geração de ata a partir de uma URL do YouTube.
 * O backend usa a RapidAPI para baixar o MP3, transcreve e gera a ata.
 *
 * @param {string} youtubeUrl URL do vídeo no YouTube
 * @param {string} camaraId   ID/slug da câmara
 * @param {string} sessaoId   ID opcional da sessão
 * @returns {Promise<string>} ID do Job criado no backend
 */
export const startAtaJobFromYoutube = async (youtubeUrl, camaraId = 'camara-teste', sessaoId) => {
    if (!youtubeUrl || !youtubeUrl.trim()) {
        throw new Error('URL do YouTube é obrigatória.');
    }

    console.log('[ataJobService] Enviando URL do YouTube para o backend...', youtubeUrl);

    const response = await api.post('/ata/from-youtube', {
        youtubeUrl,
        camaraId,
        sessaoId: sessaoId || `sessao_${Date.now()}`,
    });

    const { jobId } = response.data;
    if (!jobId) throw new Error('Backend não retornou um jobId.');
    console.log('[ataJobService] Job criado:', jobId);
    return jobId;
};

/**
 * Faz polling do status de um job de ata no backend.
 * Chama o callback sempre que o status mudar, e para automaticamente
 * quando o job finaliza (completed / error).
 *
 * @param {string}   jobId      ID do Job retornado pelo backend
 * @param {Function} callback   (status: string, data: any) => void
 * @param {number}   [interval] Intervalo em ms entre cada verificação (padrão: 5000)
 * @returns {Function}          Função de cancelamento (call to stop polling)
 */
export const pollAtaJob = (jobId, callback, interval = 5000) => {
    let cancelled = false;
    let lastStatus = null;

    const check = async () => {
        if (cancelled) return;

        try {
            const response = await api.get(`/ata/job/${jobId}`);
            const { status, result, error } = response.data;

            // Só aciona o callback se o status mudou
            if (status !== lastStatus) {
                lastStatus = status;
                console.log(`[ataJobService] Job ${jobId} status: ${status}`);
                callback(status, result || error || null);
            }

            // Para o polling se o job terminou
            if (status === 'completed' || status === 'error') {
                cancelled = true;
                return;
            }
        } catch (err) {
            console.error('[ataJobService] Erro ao checar status do job:', err);
            // Continua tentando mesmo com falha pontual de rede
        }

        if (!cancelled) {
            setTimeout(check, interval);
        }
    };

    // Inicia a primeira verificação
    setTimeout(check, interval);

    // Retorna a função de cancelamento
    return () => {
        cancelled = true;
        console.log(`[ataJobService] Polling do job ${jobId} cancelado.`);
    };
};
