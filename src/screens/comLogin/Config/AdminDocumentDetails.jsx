import React, { Component } from 'react';
import { FaArrowLeft, FaDownload, FaCopy, FaEye } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../../assets/logo.png';
import LogoIcon from '../../../assets/logo-camaraai-icon.png';
import Assinatura from '../../../componets/Assinatura.jsx';
import { Box } from '@mui/material';

pdfMake.vfs = pdfFonts.vfs;

// Schemas para mapear chaves para rótulos legíveis
const documentSchemas = {
    oficio: [
        { name: 'destinatario', label: 'Destinatário' },
        { name: 'cargoDestinatario', label: 'Cargo do Destinatário' },
        { name: 'assunto', label: 'Assunto Principal' },
        { name: 'corpo', label: 'Corpo do Ofício (Resumo)' },
    ],
    ata: [
        { name: 'reuniao', label: 'Tipo de Reunião' },
        { name: 'dataHora', label: 'Data e Hora' },
        { name: 'local', label: 'Local da Reunião' },
        { name: 'participantes', label: 'Participantes' },
        { name: 'pauta', label: 'Pauta' },
    ],
    memorando: [
        { name: 'para', label: 'Para' },
        { name: 'de', label: 'De' },
        { name: 'assunto', label: 'Assunto' },
        { name: 'solicitacao', label: 'Solicitação' },
    ],
};

class AdminDocumentDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documento: null,
            loading: true,
            error: null,
            logoBase64: null,
            homeConfig: {},
            councilName: '',
            footerConfig: {},
            pdfData: null,
            previewPdfUrl: null,
            showPdfPopup: false,
            camaraAILogoBase64: null,
            camaraId: (props.match && props.match.params && props.match.params.camaraId) || '',
        };
    }

    componentDidMount() {
        this.fetchDocumento();
        this.fetchConfigsAndLogo();
    }

    getCurrentCamaraId = () => {
        const urlCamaraId = this.props.match?.params?.camaraId;
        if (urlCamaraId) {
            return urlCamaraId;
        }

        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        return user.camaraId || '';
    }

    normalizeDocumento = (doc) => {
        if (!doc) return null;

        let metadata = doc.metadata || doc.meta || {};
        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch (e) {
                metadata = { raw: metadata };
            }
        }

        return {
            ...doc,
            id: doc.id || doc._id || doc.documentId || 'N/A',
            tipo: doc.tipo || doc.category || doc.type || 'Documento',
            titulo: doc.titulo || doc.title || doc.name || 'Documento sem título',
            title: doc.title || doc.titulo || doc.name || 'Documento sem título',
            category: doc.category || doc.tipo || doc.type || '',
            conteudo: doc.conteudo || doc.content || doc.body || doc.text || '',
            resumo: doc.resumo || doc.summary || doc.description || '',
            status: doc.status || 'Rascunho',
            metadata,
            createdAt: doc.createdAt || doc.created_at || new Date().toISOString(),
            isSigned: doc.isSigned === true || doc.isSigned === 'true' || doc.status === 'Assinado',
            attachment: doc.attachment || doc.refAttachment || doc.file || null,
            userName: doc.userName || doc.name || doc.user?.name || '',
            fileUrl: doc.fileUrl || doc.pdfUrl || null,
            pdfUrl: doc.pdfUrl || doc.fileUrl || null,
        };
    }

    fetchDocumento = async () => {
        const { docId } = this.props.match.params;
        const camaraId = this.getCurrentCamaraId();
        console.log(`[Debug] Iniciando busca do documento ID: ${docId} para camaraId: ${camaraId}`);

        if (!docId) {
            this.setState({ loading: false, error: 'ID do documento não fornecido na URL.' });
            return;
        }

        const normalizeAndSet = (rawData) => {
            if (!rawData) return false;
            const normalized = this.normalizeDocumento(rawData);
            console.log('[Debug] Documento normalizado:', normalized);
            this.setState({ documento: normalized, loading: false, error: null });
            return true;
        };

        try {
            const response = await api.get(`/administrative-documents/${docId}`);
            console.log('[Debug] Documento raw response:', response.data);

            let rawData = response.data;
            if (rawData && rawData.data) rawData = rawData.data;

            if (Array.isArray(rawData)) {
                const found = rawData.find(item => item.id === docId || item._id === docId || item.documentId === docId);
                rawData = found || null;
            }

            if (rawData && normalizeAndSet(rawData)) {
                return;
            }

            if (camaraId) {
                console.log('[Debug] Fazendo fallback: buscando lista de documentos da câmara', camaraId);
                const listResponse = await api.get(`/administrative-documents/${camaraId}`);
                let listData = listResponse.data;
                if (listData && listData.data) listData = listData.data;
                if (Array.isArray(listData)) {
                    const found = listData.find(item => item.id === docId || item._id === docId || item.documentId === docId);
                    if (found && normalizeAndSet(found)) return;
                }
            }

            this.setState({ loading: false, error: 'Documento não encontrado no servidor.' });
        } catch (error) {
            console.error("[Error] Erro ao buscar documento:", error);
            const status = error.response?.status;
            if (status === 404 && camaraId) {
                try {
                    console.log('[Debug] Fallback 404: consultando lista de documentos da câmara', camaraId);
                    const listResponse = await api.get(`/administrative-documents/${camaraId}`);
                    let listData = listResponse.data;
                    if (listData && listData.data) listData = listData.data;
                    if (Array.isArray(listData)) {
                        const found = listData.find(item => item.id === docId || item._id === docId || item.documentId === docId);
                        if (found && normalizeAndSet(found)) return;
                    }
                } catch (listError) {
                    console.error('[Error] Fallback ao buscar lista de documentos:', listError);
                }
            }
            this.setState({
                loading: false,
                error: status === 404 ? 'Documento não encontrado (404).' : 'Erro de conexão ao buscar documento.'
            });
        }
    };

    fetchConfigsAndLogo = async () => {
        const camaraId = this.getCurrentCamaraId();
        if (!camaraId) {
            console.warn('CamaraId não definido. Pulando busca de configurações.');
            return;
        }

        try {
            const response = await api.get(`/councils/${camaraId}`);

            // Extração robusta dos dados da câmara lidando com possíveis retornos em array
            const councilData = Array.isArray(response.data) ? response.data[0] : (response.data || {});
            const councilName = councilData.name || ''; // Usa o nome institucional
            const configData = councilData.config || councilData.dadosConfig || {};

            const layoutData = configData.layout || {};

            if (layoutData.logoLight) {
                this.getBase64(layoutData.logoLight).then(logoBase64 => this.setState({ logoBase64 }));
            }

            // Carrega a logo da CâmaraAI para o bloco de assinatura
            const camaraAILogoB64 = await this.getBase64(LogoIcon);

            this.setState({
                camaraId,
                councilName,
                camaraAILogoBase64: camaraAILogoB64,
                homeConfig: configData.home || {},
                footerConfig: configData.footer || {}
            });
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) {
                console.warn(`Council config para '${camaraId}' não encontrada (404).`, error);
                this.setState({ camaraId });
                return;
            }
            console.error("Erro ao carregar configurações:", error);
        }
    };

    getBase64 = async (url) => {
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

    processHtmlToPdfMake = (html) => {
        if (!html) return [];
        const paragraphs = html.split(/<\/p>/gi);
        return paragraphs.map(p => {
            let text = p.replace(/<br\s*\/?>/gi, '\n');
            text = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
            if (!text) return null;
            return { text: text, margin: [0, 5, 0, 5], fontSize: 12, alignment: 'justify' };
        }).filter(Boolean);
    };

    generateDocDefinition = () => {
        const { documento, logoBase64, homeConfig, footerConfig, camaraId, councilName, camaraAILogoBase64 } = this.state;
        if (!documento) return null;

        const content = [
            logoBase64 ? {
                image: logoBase64,
                width: 70,
                absolutePosition: { x: 480, y: 35 }
            } : null,
            { text: councilName || homeConfig.titulo || 'Câmara Municipal', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
            footerConfig.slogan && { text: footerConfig.slogan, style: 'slogan', alignment: 'center', margin: [0, 0, 0, 15] },
            { text: (documento.tipo || 'DOCUMENTO').toUpperCase(), style: 'subheader', alignment: 'center', bold: true, margin: [0, 0, 0, 20] },
            ...this.processHtmlToPdfMake(documento.conteudo)
        ];

        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        const cityName = homeConfig.cidade || councilName || camaraId;
        const signatoryName = documento.metadata?.de || 'Emitente';
        const isSigned = documento.status === 'Assinado' || documento.isSigned === true || documento.isSigned === 'true';
        const signatureMetadata = documento.signatureMetadata;

        // Adiciona bloco de encerramento e assinatura
        content.push(
            { text: '\n\n\n' }, // Espaçador
            { text: `${cityName}, ${formattedDate}.`, alignment: 'center' },
            { text: '\n\n\n\n' }, // Espaçador para assinatura
            { text: '________________________________', alignment: 'center' },
            { text: signatoryName, alignment: 'center', style: 'small', bold: true, margin: [0, 5, 0, 0] },
            { text: 'Emitente', alignment: 'center', style: 'small' }
        );

        // 🔥 🔐 ASSINATURA DIGITAL (SEM CAIXA) no PDF
        if (isSigned && signatureMetadata) {
            content.push(
                { text: '\n\n' },
                {
                    columns: [
                        camaraAILogoBase64 ? { image: camaraAILogoBase64, width: 50 } : { text: '' },
                        {
                            width: '*',
                            stack: [
                                { text: 'Documento assinado digitalmente', style: 'signatureHeader' },
                                { text: (signatureMetadata.nome || signatoryName).toUpperCase(), style: 'signatureName' },
                                { text: `Data: ${new Date(signatureMetadata.timestamp || documento.createdAt).toLocaleString('pt-BR')}`, style: 'signatureDetail' },
                                { text: `IP: ${signatureMetadata.ip || '0.0.0.0'}`, style: 'signatureDetail' },
                                { text: 'Assinado via CâmaraAI', style: 'signatureAI' },
                                {
                                    text: `Verifique em: https://verificador.camaraai.com/${signatureMetadata.hash || documento.id}`,
                                    link: `https://verificador.camaraai.com/${signatureMetadata.hash || documento.id}`,
                                    style: 'signatureLink'
                                }
                            ]
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 20, 0, 10]
                }
            );
        }

        const footerText = `📍 ${footerConfig.address || ''} | 📞 ${footerConfig.phone || ''}\n📧 ${footerConfig.email || ''}\n${footerConfig.copyright || ''}`;

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
                small: { fontSize: 9, color: '#666' },
                signatureHeader: { fontSize: 8, bold: true, color: '#666' },
                signatureName: { fontSize: 10, bold: true, color: '#000' },
                signatureDetail: { fontSize: 8, color: '#444' },
                signatureAI: { fontSize: 8, italics: true, color: '#126B5E' },
                signatureLink: { fontSize: 7, color: '#0066cc' }
            }
        };
    };

    handleGeneratePDF = () => {
        const { documento } = this.state;
        const previewUrl = documento?.pdfUrl || documento?.fileUrl;

        if (!documento) return;
        if (!documento.conteudo && previewUrl) {
            this.setState({ previewPdfUrl: previewUrl, pdfData: null, showPdfPopup: true });
            return;
        }

        const docDefinition = this.generateDocDefinition();
        if (!docDefinition) return;
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBase64((data) => {
            this.setState({ pdfData: data, previewPdfUrl: null, showPdfPopup: true });
        });
    };

    handleDownloadPDF = () => {
        const { documento } = this.state;
        const previewUrl = documento?.pdfUrl || documento?.fileUrl;

        if (previewUrl && !documento.conteudo) {
            window.open(previewUrl, '_blank');
            return;
        }

        const docDefinition = this.generateDocDefinition();
        if (!docDefinition) return;
        pdfMake.createPdf(docDefinition).download(`${this.state.documento.tipo || 'documento'}_${Date.now()}.pdf`);
    };

    handleCopyText = () => {
        const { documento } = this.state;
        if (!documento) return;
        const text = (documento.conteudo || '').replace(/<[^>]+>/g, '');
        if (!text) {
            alert('Não há texto disponível para copiar.');
            return;
        }
        navigator.clipboard.writeText(text);
        alert('Texto copiado para a área de transferência!');
    };

    getLabel = (key) => {
        const { documento } = this.state;
        if (!documento || !documento.tipo) return key;
        const type = documento.tipo.toLowerCase();
        const schema = documentSchemas[type] || [];
        if (schema) {
            const field = schema.find(f => f.name === key);
            if (field) return field.label;
        }
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    };

    render() {
        const { documento, loading, error, showPdfPopup, pdfData, camaraId } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <p>Carregando documento...</p>
                </div>
            );
        }

        if (error || !documento) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <MenuDashboard />
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                        <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>{error || 'Documento não encontrado.'}</p>
                        <button onClick={() => this.props.history.push(`/admin/assistente-admin/${camaraId}`)} className="btn-primary" style={{ margin: '20px auto' }}>Voltar para a Lista</button>
                    </div>
                </div>
            );
        }

        const signatoryName = documento.metadata?.de || 'Emitente';

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content">
                    <div className="dashboard-header">

                        <div>
                            <h1 className="dashboard-header-title">{documento.titulo}</h1>
                            <p className="dashboard-header-desc">{(documento.tipo || 'Documento')} - Criado em {new Date(documento.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <button className="btn-secondary" onClick={this.handleGeneratePDF} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaEye style={{ marginRight: '8px' }} /> Visualizar PDF
                            </button>
                            <button className="btn-secondary" onClick={this.handleDownloadPDF} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaDownload style={{ marginRight: '8px' }} /> Baixar PDF
                            </button>
                            <button className="btn-secondary" onClick={this.handleCopyText} style={{ background: '#4a5568', color: 'white', border: 'none' }}>
                                <FaCopy style={{ marginRight: '8px' }} /> Copiar Texto
                            </button>
                        </div>

                        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                            <h3 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', marginTop: 0 }}>Detalhes do Documento</h3>

                            <div style={{ display: 'block', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', fontSize: '0.85rem', marginBottom: '5px', marginTop: '20px' }}>Título</label>
                                    <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', color: '#333', fontSize: '1rem' }}>
                                        {documento.title || documento.titulo}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', fontSize: '0.85rem', marginBottom: '5px', marginTop: '20px' }}>Tipo</label>
                                    <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', color: '#333', fontSize: '1rem' }}>
                                        {documento.tipo}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', fontSize: '0.85rem', marginBottom: '5px', marginTop: '20px' }}>Criado em</label>
                                    <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', color: '#333', fontSize: '1rem' }}>
                                        {new Date(documento.createdAt).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                            </div>

                            {documento.metadata ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {Object.entries(documento.metadata).map(([key, value]) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontWeight: 'bold', color: '#555', fontSize: '0.85rem', marginBottom: '5px' }}>
                                                {this.getLabel(key)}
                                            </label>
                                            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', color: '#333', fontSize: '1rem' }}>
                                                {value || <span style={{ color: '#999', fontStyle: 'italic' }}>Não informado</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    {documento.attachment && (
                                        <div style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ margin: 0, fontWeight: 'bold', color: '#166534', fontSize: '0.9rem' }}>Anexo Vinculado</p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d' }}>{documento.attachment.name}</p>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                style={{ width: 'auto', padding: '8px 15px', fontSize: '0.8rem', background: '#16a34a' }}
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = documento.attachment.base64;
                                                    link.download = documento.attachment.name;
                                                    link.click();
                                                }}
                                            >
                                                <FaDownload /> Baixar Anexo
                                            </button>
                                        </div>
                                    )}

                                    <p style={{ fontSize: '0.9rem', color: '#555' }}>Este documento não possui metadados estruturados para exibição.</p>
                                    <p style={{ fontSize: '0.9rem', color: '#555' }}>Utilize a opção "Visualizar PDF" para ver o conteúdo completo.</p>
                                </div>
                            )}

                            {documento.conteudo ? (
                                <div style={{ marginTop: '30px' }}>
                                    <h3 style={{ color: '#126B5E', marginBottom: '15px' }}>Conteúdo do Documento</h3>
                                    <div style={{ background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '20px', color: '#333', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}
                                        dangerouslySetInnerHTML={{ __html: documento.conteudo }}
                                    />
                                </div>
                            ) : documento.resumo ? (
                                <div style={{ marginTop: '30px' }}>
                                    <h3 style={{ color: '#126B5E', marginBottom: '15px' }}>Resumo do Documento</h3>
                                    <div style={{ background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '20px', color: '#333', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                        {documento.resumo}
                                    </div>
                                </div>
                            ) : null}

                            {(documento.status === 'Assinado' || documento.isSigned) && (
                                <Box sx={{ mt: 4, pt: 2, borderTop: '1px dashed #eee' }}>
                                    <Assinatura
                                        signerName={documento.signatureMetadata?.nome || signatoryName}
                                        date={documento.signatureMetadata?.timestamp || documento.createdAt}
                                        ip={documento.signatureMetadata?.ip || '0.0.0.0'}
                                        hash={documento.signatureMetadata?.hash || documento.id || 'ABC123XYZ'}
                                    />
                                </Box>
                            )}
                        </div>
                    </div>

                    {/* Popup de Preview do PDF */}
                    {showPdfPopup && (pdfData || this.state.previewPdfUrl) && (
                        <div className="pdf-popup-overlay">
                            <div className="pdf-popup-content">
                                <button className="pdf-popup-close-button" onClick={() => this.setState({ showPdfPopup: false })}>
                                    X
                                </button>
                                <iframe
                                    title="Preview PDF"
                                    src={this.state.previewPdfUrl ? this.state.previewPdfUrl : `data:application/pdf;base64,${pdfData}`}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default AdminDocumentDetails;