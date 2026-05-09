export const parseSessionDate = (dateString) => {
    if (!dateString) return new Date(0);
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // DD/MM/YYYY
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    // Trata YYYY-MM-DD garantindo que use o fuso local para evitar perda de 1 dia no sort/display
    if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
    }

    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
};

export const normalizeSession = (s) => {
    if (!s || typeof s !== 'object') return null;
    
    const id = s.id || s._id || s.sessaoId || s.sessionId || '';
    let metadata = s.metadata || {};

    // Robustez: Trata metadata caso venha como string JSON da API
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch (e) {
            metadata = {};
        }
    }

    const sessionDate = [metadata.dataSessao, s.dataSessao, s.data, s.date, s.sessionDate].find(v => v && v !== "") || "";
    const numero = [metadata.numeroSessao, s.numeroSessao, s.numero, s.numeroPlenaria, s.plenaryNumber].find(v => v && v !== "") || "";

    const numPlenaria = [metadata.numeroSessao, s.numeroSessao, s.numeroPlenaria, s.numero].find(v => v && v !== "") || "";
    const legislatura = [metadata.legislatura, s.legislatura, s.legislature, s.sessionLegislature, s.legislaturaAtual].find(v => v && v !== "") || '';
    const formatoSessao = [metadata.formatoSessao, s.formatoSessao, s.formato, s.tipoDeSessao, s.format].find(v => v && v !== "") || "Presencial";
    const tipoSessao = [metadata.tipoSessao, s.tipoSessao, s.categoria, s.tipo].find(v => v && v !== "") || "Sessão";

    let titulo = s.tipo || s.titulo || s.title || s.name || s.session_name || s.sessionTitle || '';

    const isGeneric = !titulo || titulo === tipoSessao || !titulo.includes('Legislatura') || titulo.startsWith('Sessão nº');
    
    if (isGeneric) {
        const numberLabel = numero || numPlenaria || '---';
        const dateLabel = sessionDate || 'Data não informada';
        const legislaturaLabel = legislatura ? `${legislatura}ª Legislatura` : 'Legislatura não informada';
        const sessionTypeLabel = tipoSessao || 'Sessão';
        titulo = `${numberLabel}ª ${sessionTypeLabel} da ${legislaturaLabel} - ${dateLabel} - ${formatoSessao || 'Presencial'}`;
    }

    // Lógica robusta para itens: prioriza metadata se contiver dados, caso contrário usa a raiz
    const itens = (metadata.itens && Array.isArray(metadata.itens) && metadata.itens.length > 0) ? metadata.itens : 
                  (metadata.matters && Array.isArray(metadata.matters) && metadata.matters.length > 0) ? metadata.matters :
                  (Array.isArray(s.itens) && s.itens.length > 0) ? s.itens : 
                  (Array.isArray(s.matters) ? s.matters : []);

    // Extrai campos de tempo real do metadata se não estiverem na raiz
    const presenca = s.presenca || metadata.presenca || {};
    const filaDeInscritos = s.filaDeInscritos || metadata.filaDeInscritos || [];
    const oradorAtual = s.oradorAtual || metadata.oradorAtual || null;
    const logs = s.logs || metadata.logs || [];

    return {
        ...s,
        id,
        metadata, // Garante que metadata seja um objeto
        numero: numero || numPlenaria,
        data: sessionDate,
        tipo: titulo,
        itens: itens,
        matters: itens, // Garante que a pauta também esteja acessível via 'matters'
        presenca,
        filaDeInscritos,
        oradorAtual,
        logs,
        edital: metadata.edital || s.edital || '',
        // Recupera o caminho do edital e dados de assinatura do metadata ou raiz
        editalPdfUrl: s.editalPath || metadata.editalPath || metadata.editalPdfUrl || s.editalPdfUrl || metadata.pdfUrl || null,
        isSignedEdital: metadata.isSignedEdital || s.isSignedEdital || false,
        editalSignatureMetadata: metadata.editalSignatureMetadata || s.editalSignatureMetadata || null
    };
};

export const normalizeSessionList = (rawData) => {
    let dataToProcess = rawData;
    
    if (dataToProcess && dataToProcess.data && Array.isArray(dataToProcess.data)) {
        dataToProcess = dataToProcess.data;
    }

    const dataArray = Array.isArray(dataToProcess)
        ? dataToProcess
        : (dataToProcess?.sessions || dataToProcess?.sessoes || (dataToProcess && typeof dataToProcess === 'object' ? Object.values(dataToProcess) : []));

    return dataArray
        .filter(s => s && typeof s === 'object')
        .map(normalizeSession);
};
