import React, { Component } from 'react';
import { FaArrowLeft, FaDownload, FaCopy, FaEye } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../assets/logo.png';

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
            pdfData: null,
            showPdfPopup: false,
            camaraId: this.props.match.params.camaraId,
        };
    }

    componentDidMount() {
        this.loadLogo();
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
            const docRef = ref(db, `${this.props.match.params.camaraId}/documentos_administrativos/${docId}`);
            const snapshot = await get(docRef);

            if (snapshot.exists()) {
                this.setState({ documento: { id: docId, ...snapshot.val() }, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar documento:", error);
            this.setState({ loading: false });
        }
    };

    loadLogo = async () => {
        try {
            const getBase64 = async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            };
            const logoBase64 = await getBase64(logo);
            this.setState({ logoBase64 });
        } catch (error) {
            console.error("Erro ao carregar o logo para o PDF:", error);
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
        const { documento, logoBase64 } = this.state;
        if (!documento) return null;

        const content = [
            logoBase64 && { image: logoBase64, width: 70, alignment: 'center', margin: [0, 0, 0, 10] },
            { text: 'Câmara Municipal de Teste', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },
            { text: documento.tipo.toUpperCase(), style: 'subheader', alignment: 'center', bold: true, margin: [0, 0, 0, 20] },
            ...this.processHtmlToPdfMake(documento.conteudo)
        ];

        if (documento.status === 'Assinado') {
            content.push(
                { text: '\n\n\n____________________________________', alignment: 'center' },
                { text: 'Assinado Digitalmente', alignment: 'center', color: 'blue', fontSize: 10 }
            );
        }

        return {
            content: content,
            styles: {
                header: { fontSize: 16, bold: true },
                subheader: { fontSize: 14 }
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