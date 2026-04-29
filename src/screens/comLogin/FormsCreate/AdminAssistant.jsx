import React, { useState, useEffect } from 'react';
import { FaMagic, FaSpinner, FaDownload, FaCopy, FaPenNib, FaSave, FaMicrophone, FaUpload, FaEye } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import { sendMessageToAIPrivate } from '../../../aiService.ts';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import api from '../../../services/api.js';

pdfMake.vfs = pdfFonts.vfs;

// Definição dos campos para cada tipo de documento
const documentSchemas = {
    oficio: [
        { name: 'destinatario', label: 'Destinatário', placeholder: 'Ex: Exmo. Sr. Prefeito Municipal', type: 'text' },
        { name: 'cargoDestinatario', label: 'Cargo do Destinatário', placeholder: 'Ex: Prefeito de Aquiraz', type: 'text' },
        { name: 'assunto', label: 'Assunto Principal', placeholder: 'Ex: Solicitação de informações sobre obras', type: 'text' },
        { name: 'corpo', label: 'Corpo do Ofício (Pontos Principais)', placeholder: 'Descreva os pontos chave a serem abordados no ofício.', type: 'textarea' },
    ],
    ata: [
        { name: 'reuniao', label: 'Tipo de Reunião', placeholder: 'Ex: Reunião da Comissão de Finanças', type: 'text' },
        { name: 'dataHora', label: 'Data e Hora', placeholder: '', type: 'datetime-local' },
        { name: 'local', label: 'Local da Reunião', placeholder: 'Ex: Plenário da Câmara', type: 'text' },
        { name: 'participantes', label: 'Participantes Presentes', placeholder: 'Liste os nomes separados por vírgula', type: 'textarea' },
        { name: 'pauta', label: 'Pauta da Reunião', placeholder: 'Descreva os tópicos discutidos', type: 'textarea' },
    ],
    memorando: [
        { name: 'para', label: 'Para (Setor/Funcionário)', placeholder: 'Ex: Departamento de Compras', type: 'text' },
        { name: 'de', label: 'De (Setor/Funcionário)', placeholder: 'Ex: Gabinete da Presidência', type: 'text' },
        { name: 'assunto', label: 'Assunto', placeholder: 'Ex: Aquisição de novos equipamentos', type: 'text' },
        { name: 'solicitacao', label: 'Solicitação ou Informação', placeholder: 'Descreva o conteúdo do memorando.', type: 'textarea' },
    ],
    // Adicione outros tipos de documento aqui (Comunicado, Declaração, Convocação)
};

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
    ],
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'align'
];

const AdminAssistant = () => {
    const [docType, setDocType] = useState('oficio');
    const [formData, setFormData] = useState({});
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [progressStep, setProgressStep] = useState(0); // 0: Idle, 1: Iniciado, 2: Processando, 3: Concluído
    const [statusMessage, setStatusMessage] = useState(''); // Estado para armazenar a mensagem de status
    const [elapsedTime, setElapsedTime] = useState(0); // Tempo decorrido em segundos
    const [pdfData, setPdfData] = useState(null);
    const [showPdfPopup, setShowPdfPopup] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [camaraConfigs, setCamaraConfigs] = useState({
        baseConhecimento: {},
        layout: {},
        home: {},
        footer: {},
        logoBase64: null,
        councilName: '',
        camaraId: 'camara-teste'
    });
    const [attachment, setAttachment] = useState(null);
    const [loadingConfigs, setLoadingConfigs] = useState(true);

    // Atualiza o formulário quando o tipo de documento muda
    useEffect(() => {
        const initialData = documentSchemas[docType].reduce((acc, field) => {
            acc[field.name] = '';
            return acc;
        }, {});
        setFormData(initialData);
        setGeneratedContent(''); // Limpa o conteúdo gerado ao trocar de tipo
    }, [docType]);

    // Carregar configurações do Backend ao iniciar
    useEffect(() => {
        const fetchConfigs = async () => {
            const token = localStorage.getItem('@CamaraAI:token');
            const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

            if (!token || !user.id) return;

            // Pega o camaraId do usuário ou da URL
            const camaraId = user.camaraId || window.location.pathname.split('/').pop() || 'camara-teste';

            try {
                const response = await api.get(`/councils/${camaraId}`);
                
                // Extração robusta dos dados da câmara lidando com possíveis retornos em array
                const councilData = Array.isArray(response.data) ? response.data[0] : (response.data || {});
                const councilName = councilData.name || ''; // Usa o nome institucional
                const configData = councilData.config || councilData.dadosConfig || {};
                
                const layoutData = configData.layout || {};
                let logoB64 = null;
                if (layoutData.logoLight) {
                    logoB64 = await getBase64(layoutData.logoLight);
                }

                setCamaraConfigs({
                    camaraId,
                    councilName,
                    baseConhecimento: configData["base-conhecimento"] || {},
                    layout: layoutData,
                    home: configData.home || {},
                    footer: configData.footer || {},
                    logoBase64: logoB64
                });
            } catch (error) {
                console.error("Erro ao carregar configurações da Câmara:", error);
            } finally {
                setLoadingConfigs(false);
            }
        };

        const getBase64 = async (url) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return null;
            }
        };

        fetchConfigs();
    }, []);

    // Timer para o tempo decorrido
    useEffect(() => {
        let interval;
        if (audioLoading) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [audioLoading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment({
                    name: file.name,
                    base64: reader.result,
                    type: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedContent('');

        const { baseConhecimento } = camaraConfigs;

        // Constrói um prompt detalhado para a IA
        const fieldsDescription = Object.entries(formData)
            .map(([key, value]) => `- ${documentSchemas[docType].find(f => f.name === key)?.label}: ${value}`)
            .join('\n');

        const prompt = `
            Atue como um especialista em redação oficial e técnica legislativa brasileira.
            
            CONTEXTO LEGISLATIVO DA CASA:
            - Regimento Interno: ${baseConhecimento.regimentoText || 'Seguir normas padrão.'}
            - Lei Orgânica: ${baseConhecimento.leiOrganicaText || 'Seguir normas padrão.'}
            - Histórico/Jurisprudência: ${baseConhecimento.materiasText || ''}
            
            Use o contexto acima para garantir que a terminologia e os ritos citados no documento estejam corretos.

            Sua tarefa é gerar um documento oficial do tipo "${docType.toUpperCase()}" com base nas seguintes informações:

            ${fieldsDescription}

            Siga estritamente as normas de redação oficial, incluindo formatação, espaçamento, vocativo, fecho de cortesia e identificação do signatário.
            
            DIRETRIZES DE FORMATAÇÃO (IMPORTANTE):
            - O texto DEVE ser formatado exclusivamente em HTML.
            - Use tags <p> para cada parágrafo.
            - Use <strong> para negrito em títulos e destaques.
            - Use <br> para espaçamento adequado entre as seções.
            - Use <ul> e <li> para listas se necessário.
            - NÃO use Markdown (**, ##, -). Use apenas HTML.
            - Evite caracteres especiais desnecessários.
            - Evite ###
            - Crie paragráfos curtos e claros, com espaçamento adequado.
            - Mantenha a formalidade e o tom oficial em todo o documento.
            
            Gere o conteúdo do documento seguindo essas diretrizes e utilizando as informações fornecidas.
        `;

        try {
            const response = await sendMessageToAIPrivate(prompt, camaraConfigs.camaraId);
            setGeneratedContent(response);
        } catch (error) {
            console.error("Erro ao gerar documento:", error);
            setGeneratedContent(`<p style="color: red;">Erro ao gerar documento: ${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAudioGenerate = async () => {
        if (!audioFile) {
            alert('Por favor, selecione um arquivo de áudio.');
            return;
        }

        alert('A geração de ata por áudio está em processo de migração para a nova API Node.js. Por favor, utilize a geração manual ou anexe o texto da transcrição.');
        /*
        setAudioLoading(true);
        setProgressStep(1); // Job iniciado
        setStatusMessage('Iniciando upload...');
        setElapsedTime(0);

        try {
            const jobId = await startAtaGenerationJob(audioFile);
            console.log(`Job de ata iniciado com ID: ${jobId}`);

            const unsubscribe = listenToAtaJob(jobId, (status, data) => {
                console.log(`Status do Job ${jobId}: ${status}`);
                setStatusMessage(status); // Atualiza a mensagem de status na tela
                switch (status) {
                    case 'processing':
                        setProgressStep(2); // Processando
                        break;
                    case 'completed':
                        setProgressStep(3); // Concluído
                        
                        let finalContent = data;
                        try {
                            // Tenta interpretar a resposta como JSON para extrair metadados
                            const parsedData = JSON.parse(data);
                            if (parsedData.html && parsedData.metadata) {
                                finalContent = parsedData.html;
                                // Preenche os campos do formulário com os metadados extraídos
                                setFormData(prev => ({ ...prev, ...parsedData.metadata }));
                            }
                        } catch (e) {
                            console.warn("A resposta da IA não está em formato JSON estruturado, usando texto puro.", e);
                        }

                        setGeneratedContent(finalContent || '<p>Ata gerada com sucesso, mas o conteúdo está vazio.</p>');
                        setAudioLoading(false);
                        unsubscribe(); // Para de escutar
                        break;
                    case 'error':
                        alert(`Erro no processamento do áudio: ${data}`);
                        setAudioLoading(false);
                        setProgressStep(0);
                        unsubscribe(); // Para de escutar
                        break;
                    default:
                        break;
                }
            });
        } catch (error) {
            console.error("Erro Áudio:", error);
            alert(`Erro ao gerar ata: ${error.message}`);
            setAudioLoading(false);
            setProgressStep(0);
        }
        */
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- Funções de Documento ---

    const processHtmlToPdfMake = (html) => {
        if (!html) return [];
        const paragraphs = html.split(/<\/p>/gi);
        return paragraphs.map(p => {
            let text = p.replace(/<br\s*\/?>/gi, '\n');
            text = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
            if (!text) return null;
            return { text: text, margin: [0, 5, 0, 5], fontSize: 12, alignment: 'justify' };
        }).filter(Boolean);
    };

    const generateDocDefinition = () => {
        const { logoBase64, home, footer, camaraId, councilName } = camaraConfigs;

        const content = [
            logoBase64 ? { 
                image: logoBase64, 
                width: 70, 
                absolutePosition: { x: 480, y: 35 } 
            } : null,
            { text: councilName || home.titulo || 'Câmara Municipal', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
            footer.slogan && { text: footer.slogan, style: 'slogan', alignment: 'center', margin: [0, 0, 0, 15] },
            { text: docType.toUpperCase(), style: 'subheader', alignment: 'center', bold: true, margin: [0, 0, 0, 20] },
            ...processHtmlToPdfMake(generatedContent)
        ];

        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        const cityName = home.cidade || councilName || camaraId;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        const signatoryName = formData.de || user.name || '_________________________';

        // Adiciona bloco de encerramento e assinatura
        content.push(
            { text: '\n\n\n' }, // Espaçador
            { text: `${cityName}, ${formattedDate}.`, alignment: 'center' },
            { text: '\n\n\n\n' }, // Espaçador para assinatura
            { text: '________________________________', alignment: 'center' },
            { text: signatoryName, alignment: 'center', style: 'small', bold: true, margin: [0, 5, 0, 0] },
            { text: 'Emitente', alignment: 'center', style: 'small' }
        );

        const footerText = `📍 ${footer.address || ''} | 📞 ${footer.phone || ''}\n📧 ${footer.email || ''}\n${footer.copyright || ''}`;

        if (isSigned) {
            content.push({ text: `\n\nAssinado Digitalmente via Camara AI em: ${new Date().toLocaleString()}`, alignment: 'center', style: 'digitalSignatureInfo' });
        }

        return {
            content: content,
            footer: (currentPage, pageCount) => ({
                stack: [
                    { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: '#ccc' }] },
                    { text: footerText, style: 'footerStyle', alignment: 'center', margin: [0, 5, 0, 0] },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 40, 0] }
                ]
            }),
            styles: {
                header: { fontSize: 14, bold: true, color: '#333' },
                slogan: { fontSize: 9, italics: true, color: '#666' },
                subheader: { fontSize: 13, color: '#126B5E', marginTop: 10 },
                footerStyle: { fontSize: 8, color: '#777', lineHeight: 1.3 },
                small: {
                    fontSize: 9,
                    color: '#666'
                },
                digitalSignatureInfo: {
                    fontSize: 8,
                    color: '#007bff',
                    marginTop: 5,
                    italics: true
                },
            }
        };
    };

    const handleGeneratePDF = () => {
        const docDefinition = generateDocDefinition();
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBase64((data) => {
            setPdfData(data);
        });
    };

    const handleViewPDF = () => {
        handleGeneratePDF();
        setTimeout(() => setShowPdfPopup(true), 500);
    };

    const handleDownloadPDF = () => {
        const docDefinition = generateDocDefinition();
        pdfMake.createPdf(docDefinition).download(`${docType}_${Date.now()}.pdf`);
    };

    const handleCopyText = () => {
        const text = generatedContent.replace(/<[^>]+>/g, '');
        navigator.clipboard.writeText(text);
        alert('Texto copiado para a área de transferência!');
    };

    const handleSign = () => {
        const confirm = window.confirm("Deseja assinar digitalmente este documento?");
        if (confirm) {
            setIsSigned(true);
            alert("Documento assinado com sucesso!");
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!token || !user.id) {
            alert("Você precisa estar logado para salvar.");
            return;
        }
        if (!generatedContent) {
            alert("Não há conteúdo para salvar.");
            return;
        }
        const { camaraId } = camaraConfigs;

        const docData = {
            userId: user.id,
            tipo: docType.charAt(0).toUpperCase() + docType.slice(1),
            titulo: formData.assunto || formData.reuniao || 'Documento Sem Título',
            conteudo: generatedContent,
            createdAt: new Date().toISOString(),
            status: isSigned ? 'Assinado' : 'Rascunho',
            metadata: formData,
            attachment: attachment
        };

        try {
            await api.post(`/administrative-documents/${camaraId}`, docData);
            alert("Documento salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar documento. Verifique sua conexão.");
        }
    };

    const renderFormFields = () => {
        const schema = documentSchemas[docType];
        return schema.map(field => (
            <div key={field.name} className="mb-4">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1 label-form">{field.label}</label>
                {field.type === 'textarea' ? (
                    <textarea
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        rows="4"
                        className="modal-textarea"
                    />
                ) : (
                    <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="modal-input"
                    />
                )}
            </div>
        ));
    };

    if (loadingConfigs) {
        return (
            <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                <p style={{ marginTop: '20px', fontSize: '1rem', color: '#666' }}>Carregando inteligência da Câmara...</p>
            </div>
        );
    }

    return (
        <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
            <MenuDashboard />
            <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) 3fr', gap: '30px', alignItems: 'flex-start' }}>
                {/* Painel de Configuração (Esquerda) */}
                <div>
                    <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                        
                        <div>
                            <h1 className="dashboard-header-title" style={{ color: '#126B5E' }}>
                                Assistente Administrativo
                            </h1>
                            <p className="dashboard-header-desc">Gere documentos oficiais com assistência de IA.</p>
                        </div>
                    </div>
                    <div className="dashboard-card">
                        <div className="mb-6">
                            <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1 label-form">Tipo de Documento</label>
                            <select
                                id="docType"
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                className="modal-input"
                            >
                                <option value="oficio">Ofício</option>
                                <option value="ata">Ata de Reunião</option>
                                <option value="memorando">Memorando</option>
                                {/* Adicione outras opções aqui */}
                            </select>
                        </div>

                        {/* Seção Especial para Ata via Upload de Áudio */}
                        {docType === 'ata' && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-blue-600 mb-2 flex items-center gap-2 label-form">
                                    <FaMicrophone /> Gerar Ata via Áudio (Upload)
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="file" 
                                        accept="audio/*,video/*"
                                        className="modal-input flex-1"
                                        onChange={(e) => setAudioFile(e.target.files[0])}
                                        style={{ padding: '8px' }}
                                    />
                                    <button 
                                        onClick={handleAudioGenerate}
                                        disabled={audioLoading}
                                        className="btn-secondary"
                                        style={{ background: '#126B5E', color: 'white', border: 'none', whiteSpace: 'nowrap', marginTop: '10px' }}
                                    >
                                        {audioLoading ? <FaSpinner className="animate-spin" /> : <FaUpload />} 
                                        {audioLoading ? ' Processando...' : ' Enviar e Gerar'}
                                    </button>
                                </div>
                                
                                {/* Stepper de Progresso */}
                                {audioLoading && (
                                    <div className="mt-3 process-container">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1 process-text" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <span className={progressStep >= 1 ? "text-green-600 font-bold" : ""}>{statusMessage}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(progressStep / 3) * 100}%` }}></div>
                                        </div>
                                        <p style={{ color: '#555', textAlign: 'left', fontSize: '0.85rem', marginTop: '15px', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <FaSpinner style={{color: '#555'}} className="animate-spin" />
                                            Processando áudio e gerando ata. <br/> Tempo decorrido: {formatTime(elapsedTime)}. <br/> Por favor aguarde...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {renderFormFields()}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1 label-form">Anexar Documento de Referência (Opcional)</label>
                            <input type="file" className="modal-input" onChange={handleAttachmentChange} style={{ padding: '8px' }} />
                            {attachment && <p className="mt-1 text-xs text-green-600">📎 Arquivo pronto: {attachment.name}</p>}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ justifyContent: 'center', width: '100%', marginTop: '10px', padding: '12px' }}
                        >
                            {isLoading ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaMagic />
                            )}
                            {isLoading ? 'Gerando...' : 'Gerar Documento com IA'}
                        </button>
                    </div>
                </div>

                {/* Visualização do Documento (Direita) */}
                <div style={{ position: 'sticky', top: '40px' }}>
                    <div className="dashboard-card" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
                        {/* Barra de Ações do Documento */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid #e0e0e0', marginBottom: '15px' }}>
                            <button className="btn-secondary" onClick={handleViewPDF} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaEye style={{ marginRight: '8px' }} /> Visualizar PDF
                            </button>
                            <button className="btn-secondary" onClick={handleDownloadPDF} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaDownload style={{ marginRight: '8px' }} /> Baixar PDF
                            </button>
                            <button className="btn-secondary" onClick={handleCopyText} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaCopy style={{ marginRight: '8px' }} /> Copiar Texto
                            </button>
                            <button className="btn-secondary" onClick={handleSign} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaPenNib style={{ marginRight: '8px' }} /> Assinar
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                <FaSave style={{ marginRight: '8px' }} /> Salvar
                            </button>
                        </div>

                        {/* Editor de Texto */}
                        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                            <ReactQuill
                                theme="snow"
                                value={generatedContent}
                                onChange={setGeneratedContent}
                                className="full-page-quill-editor" // Usando classe existente para garantir altura
                                modules={modules}
                                formats={formats}
                                placeholder="O documento gerado pela IA aparecerá aqui..."
                            />
                        </div>
                    </div>

                    {/* Popup de Preview do PDF */}
                    {showPdfPopup && pdfData && (
                        <div className="pdf-popup-overlay">
                            <div className="pdf-popup-content">
                                <button className="pdf-popup-close-button" onClick={() => setShowPdfPopup(false)}>
                                    X
                                </button>
                                <iframe
                                    title="Preview PDF"
                                    src={`data:application/pdf;base64,${pdfData}`}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAssistant;
