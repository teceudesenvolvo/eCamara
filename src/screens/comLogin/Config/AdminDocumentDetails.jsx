import React, { Component } from 'react';
import { FaArrowLeft, FaDownload, FaCopy, FaEye } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../../assets/logo.png';

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
            logoBase64: null,
            homeConfig: {},
            councilName: '',
            footerConfig: {},
            pdfData: null,
            showPdfPopup: false,
            camaraId: this.props.match.params.camaraId,
        };
    }

    componentDidMount() {
        this.fetchConfigs();
        this.fetchDocumento();
    }

    fetchDocumento = async () => {
        const { state } = this.props.location || {};
        const docId = state ? state.docId : null;

        if (!docId) {
            this.setState({ loading: false });
            return;
        }

        try {
            const response = await api.get(`/administrative-documents/id/${docId}`);
            if (response.data) {
                this.setState({ documento: response.data, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar documento:", error);
            this.setState({ loading: false });
        }
    };

    fetchConfigsAndLogo = async () => {
        const { camaraId } = this.state;
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
            // Removido fallback para logo padrão local para respeitar a identidade visual da câmara

            this.setState({
                councilName,
                homeConfig: configData.home || {},
                footerConfig: configData.footer || {}
            });
        } catch (error) {
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
        const { documento, logoBase64, homeConfig, footerConfig, camaraId, councilName } = this.state;
        if (!documento) return null;

        const content = [
            logoBase64 ? { 
                image: logoBase64, 
                width: 70, 
                absolutePosition: { x: 480, y: 35 } 
            } : null,
            { text: councilName || homeConfig.titulo || 'Câmara Municipal', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
            footerConfig.slogan && { text: footerConfig.slogan, style: 'slogan', alignment: 'center', margin: [0, 0, 0, 15] },
            { text: documento.tipo.toUpperCase(), style: 'subheader', alignment: 'center', bold: true, margin: [0, 0, 0, 20] },
            ...this.processHtmlToPdfMake(documento.conteudo)
        ];

        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        const cityName = homeConfig.cidade || councilName || camaraId;
        const signatoryName = (documento.metadata && documento.metadata.de) ? documento.metadata.de : 'Emitente';

        // Adiciona bloco de encerramento e assinatura
        content.push(
            { text: '\n\n\n' }, // Espaçador
            { text: `${cityName}, ${formattedDate}.`, alignment: 'center' },
            { text: '\n\n\n\n' }, // Espaçador para assinatura
            { text: '________________________________', alignment: 'center' },
            { text: signatoryName, alignment: 'center', style: 'small', bold: true, margin: [0, 5, 0, 0] },
            { text: 'Emitente', alignment: 'center', style: 'small' }
        );

        if (documento.status === 'Assinado') {
            content.push({ text: `\n\nAssinado Digitalmente via Camara AI em: ${new Date(documento.createdAt).toLocaleString()}`, alignment: 'center', style: 'digitalSignatureInfo' });
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

    handleGeneratePDF = () => {
        const docDefinition = this.generateDocDefinition();
        if (!docDefinition) return;
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBase64((data) => {
            this.setState({ pdfData: data, showPdfPopup: true });
        });
    };

    handleDownloadPDF = () => {
        const docDefinition = this.generateDocDefinition();
        if (!docDefinition) return;
        pdfMake.createPdf(docDefinition).download(`${this.state.documento.tipo}_${Date.now()}.pdf`);
    };

    handleCopyText = () => {
        const { documento } = this.state;
        if (!documento) return;
        const text = documento.conteudo.replace(/<[^>]+>/g, '');
        navigator.clipboard.writeText(text);
        alert('Texto copiado para a área de transferência!');
    };

    getLabel = (key) => {
        const { documento } = this.state;
        if (!documento || !documento.tipo) return key;
        const type = documento.tipo.toLowerCase();
        const schema = documentSchemas[type];
        if (schema) {
            const field = schema.find(f => f.name === key);
            if (field) return field.label;
        }
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    };

    render() {
        const { documento, loading, showPdfPopup, pdfData } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <p>Carregando documento...</p>
                </div>
            );
        }

        if (!documento) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <p>Documento não encontrado.</p>
                    <button onClick={() => this.props.history.goBack()} className="btn-back">Voltar</button>
                </div>
            );
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        
                        <div>
                            <h1 className="dashboard-header-title">{documento.titulo}</h1>
                            <p className="dashboard-header-desc">{documento.tipo} - Criado em {new Date(documento.createdAt).toLocaleDateString()}</p>
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
                            
                            {documento.metadata ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {Object.entries(documento.metadata).map(([key, value]) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontWeight: 'bold', color: '#555', fontSize: '0.85rem', marginBottom: '5px' }}>
                                                {this.getLabel(key)}
                                            </label>
                                            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', color: '#333', fontSize: '1rem' }}>
                                                {value || <span style={{color: '#999', fontStyle: 'italic'}}>Não informado</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#000 !important' }}>
                            
                            {/* Exibição de Anexo Base64 se existir */}
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

                                    <p style={{ fontSize: '0.9rem', color: '#555'}}>Este documento não possui metadados estruturados para exibição.</p>
                                    <p style={{ fontSize: '0.9rem', color: '#555'}}>Utilize a opção "Visualizar PDF" para ver o conteúdo completo.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popup de Preview do PDF */}
                    {showPdfPopup && pdfData && (
                        <div className="pdf-popup-overlay">
                            <div className="pdf-popup-content">
                                <button className="pdf-popup-close-button" onClick={() => this.setState({ showPdfPopup: false })}>
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
        );
    }
}

export default AdminDocumentDetails;