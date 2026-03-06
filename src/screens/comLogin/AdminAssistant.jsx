import React, { useState, useEffect } from 'react';
import { FaMagic, FaSpinner, FaDownload, FaCopy, FaPenNib, FaSave, FaYoutube, FaCheck } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MenuDashboard from '../../componets/menuDashboard.jsx';
import { sendMessageToAIPrivate, generateAtaFromYoutube } from '../../aiService';

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

const AdminAssistant = () => {
    const [docType, setDocType] = useState('oficio');
    const [formData, setFormData] = useState({});
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeLoading, setYoutubeLoading] = useState(false);
    const [progressStep, setProgressStep] = useState(0); // 0: Idle, 1: Extraindo, 2: Analisando, 3: Formatando

    // Atualiza o formulário quando o tipo de documento muda
    useEffect(() => {
        const initialData = documentSchemas[docType].reduce((acc, field) => {
            acc[field.name] = '';
            return acc;
        }, {});
        setFormData(initialData);
        setGeneratedContent(''); // Limpa o conteúdo gerado ao trocar de tipo
    }, [docType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedContent('');

        // Constrói um prompt detalhado para a IA
        const fieldsDescription = Object.entries(formData)
            .map(([key, value]) => `- ${documentSchemas[docType].find(f => f.name === key)?.label}: ${value}`)
            .join('\n');

        const prompt = `
            Atue como um especialista em redação oficial e técnica legislativa.
            Sua tarefa é gerar um documento oficial do tipo "${docType.toUpperCase()}" com base nas seguintes informações:

            ${fieldsDescription}

            Siga estritamente as normas de redação oficial, incluindo formatação, espaçamento, vocativo, fecho de cortesia e identificação do signatário.
            A resposta deve ser em formato de texto simples, com parágrafos bem definidos.
        `;

        try {
            const response = await sendMessageToAIPrivate(prompt);
            // Simplesmente substitui quebras de linha por parágrafos HTML para o editor
            const htmlResponse = response.split('\n').map(p => `<p>${p}</p>`).join('');
            setGeneratedContent(htmlResponse);
        } catch (error) {
            console.error("Erro ao gerar documento:", error);
            setGeneratedContent(`<p style="color: red;">Erro ao gerar documento: ${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYoutubeGenerate = async () => {
        if (!youtubeUrl) {
            alert('Por favor, insira a URL do vídeo do YouTube.');
            return;
        }

        setYoutubeLoading(true);
        setProgressStep(1); // Extraindo áudio/legenda

        // Simulação de progresso visual enquanto a Cloud Function processa
        // O Gemini Flash é rápido, mas vídeos longos podem demorar um pouco
        const stepTimer = setTimeout(() => {
            if (youtubeLoading) setProgressStep(2); // Analisando falas
        }, 2500);

        try {
            const htmlContent = await generateAtaFromYoutube(youtubeUrl);
            
            setProgressStep(3); // Formatando
            setTimeout(() => {
                setGeneratedContent(htmlContent);
                setYoutubeLoading(false);
                setProgressStep(0);
            }, 800);

        } catch (error) {
            console.error("Erro YouTube:", error);
            alert(`Erro ao gerar ata: ${error.message}`);
            setYoutubeLoading(false);
            setProgressStep(0);
        } finally {
            clearTimeout(stepTimer);
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

                        {/* Seção Especial para Ata via YouTube */}
                        {docType === 'ata' && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-red-600 mb-2 flex items-center gap-2 label-form">
                                    <FaYoutube /> Gerar Ata via Transmissão (YouTube)
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        placeholder="Cole o link da live aqui (ex: https://youtube.com/...)"
                                        className="modal-input flex-1"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleYoutubeGenerate}
                                        disabled={youtubeLoading}
                                        className="btn-secondary"
                                        style={{ background: '#cc0000', color: 'white', border: 'none', whiteSpace: 'nowrap' }}
                                    >
                                        {youtubeLoading ? <FaSpinner className="animate-spin" /> : <FaMagic />} 
                                        {youtubeLoading ? ' Processando...' : ' Gerar com IA'}
                                    </button>
                                </div>
                                
                                {/* Stepper de Progresso */}
                                {youtubeLoading && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span className={progressStep >= 1 ? "text-green-600 font-bold" : ""}>1. Extraindo Legenda</span>
                                            <span className={progressStep >= 2 ? "text-green-600 font-bold" : ""}>2. Analisando Falas</span>
                                            <span className={progressStep >= 3 ? "text-green-600 font-bold" : ""}>3. Formatando Ata</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(progressStep / 3) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {renderFormFields()}

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
                            <button className="btn-secondary" style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaDownload style={{ marginRight: '8px' }} /> Baixar PDF
                            </button>
                            <button className="btn-secondary" style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaCopy style={{ marginRight: '8px' }} /> Copiar Texto
                            </button>
                            <button className="btn-secondary" style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaPenNib style={{ marginRight: '8px' }} /> Assinar
                            </button>
                            <button className="btn-primary">
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
                                modules={{ toolbar: false }}
                                placeholder="O documento gerado pela IA aparecerá aqui..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAssistant;
