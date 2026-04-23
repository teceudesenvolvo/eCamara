import React, { Component } from 'react';
import { FaBalanceScale, FaSearch, FaCheckCircle, FaTimesCircle, FaArchive, FaPaperPlane, FaFileAlt, FaGavel, FaMagic, FaInbox, FaDownload, FaEye, FaFilePdf, FaInfoCircle, FaParagraph, FaCalendarAlt } from 'react-icons/fa';
import MenuDashboard from "../../../componets/menuAdmin.jsx";
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../../assets/logo.png';
import { sendMessageToAIPrivate } from '../../../aiService';
import api from '../../../services/api.js';

pdfMake.vfs = pdfFonts.vfs;

class JuizoPresidente extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Pendentes',
            searchTerm: '',
            selectedMateria: null,
            despachoText: '',
            isGeneratingDespacho: false,
            selectedComissao: '',
            // PDF and Signature state
            logoBase64: null,
            showPasswordModal: false,
            passwordInput: '',
            passwordError: '',
            pendingAction: null,
            comissoesDisponiveis: [],
            materias: [],
            loading: true,
            homeConfig: {},
            footerConfig: {},
            camaraId: this.props.match.params.camaraId,
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            const camaraId = user.camaraId || this.props.match.params.camaraId || 'camara-teste';
            this.setState({ camaraId }, () => {
                this.fetchConfigsAndLogo();
                this.fetchMaterias(camaraId);
                this.fetchComissoes(camaraId);
            });
        }
    }

    fetchMaterias = async (camaraId) => {
        this.setState({ loading: true });
        try {
            const response = await api.get(`/legislative-matters/${camaraId}`);
            const materias = response.data || [];
            this.setState({ materias, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias para despacho:", error);
            this.setState({ loading: false });
        }
    };

    fetchComissoes = async (camaraId) => {
        try {
            const response = await api.get(`/commissions/${camaraId}`);
            const comissoesData = response.data || [];
            const comissoes = comissoesData.map(c => c.nome).filter(Boolean);
            this.setState({ comissoesDisponiveis: comissoes });
        } catch (error) {
            console.error("Erro ao buscar comissões:", error);
        }
    };

    fetchConfigsAndLogo = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/councils/${camaraId}`);
            const configData = response.data || {};
            const layoutData = configData.layout || {};
            
            if (layoutData.logoLight) {
                this.getBase64(layoutData.logoLight).then(logoBase64 => this.setState({ logoBase64 }));
            } else {
                this.getBase64(logo).then(logoBase64 => this.setState({ logoBase64 }));
            }

            this.setState({
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

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab, selectedMateria: null });
    };

    handleSearchChange = (e) => {
        this.setState({ searchTerm: e.target.value });
    };

    handleSelectMateria = (materia) => {
        this.setState({ selectedMateria: materia, despachoText: '', selectedComissao: '', isGeneratingDespacho: false });
    };

    handleDownloadOriginalPDF = () => {
        const { selectedMateria } = this.state;
        if (!selectedMateria) return;

        // Suporta URL do Supabase (novo) e fallback Base64 (legado)
        if (selectedMateria.pdfUrl || selectedMateria.anexoUrl) {
            window.open(selectedMateria.pdfUrl || selectedMateria.anexoUrl, '_blank');
        } else if (selectedMateria.pdfBase64) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${selectedMateria.pdfBase64}`;
            link.download = `Materia_${String(selectedMateria.numero).replace('/', '-')}_Original.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("PDF original não disponível.");
        }
    };

    handleCloseDetails = () => {
        this.setState({ selectedMateria: null });
    };

    openPasswordModal = (action) => {
        const { selectedComissao } = this.state;
        if (action === 'Encaminhado às Comissões' && !selectedComissao) {
            alert("Por favor, selecione uma comissão para encaminhar a matéria.");
            return;
        }
        this.setState({ showPasswordModal: true, pendingAction: action, passwordInput: '', passwordError: '' });
    };

    handleSubmitDespacho = async (novoStatus, signatureData) => {
        const { selectedMateria, selectedComissao, despachoText, camaraId } = this.state;
        if (!selectedMateria) return;

        let statusFinal = novoStatus;
        if (novoStatus === 'Encaminhado às Comissões') {
            if (!selectedComissao) {
                alert("Por favor, selecione uma comissão para encaminhar a matéria.");
                return;
            }
            statusFinal = `Encaminhado à ${selectedComissao}`;
        }

        const despachoData = {
            status: statusFinal,
            despachoPresidente: despachoText || `Despacho padrão para: ${statusFinal}`,
            despachoDate: new Date().toISOString(),
            despachoSignatureMetadata: signatureData
        };

        try {
            await api.patch(`/legislative-matters/${selectedMateria.id}`, despachoData);
            this.generateDespachoPDF(selectedMateria, despachoText, statusFinal, signatureData);

            // Atualiza a lista local
            this.setState(prevState => ({
                materias: prevState.materias.map(m => m.id === selectedMateria.id ? { ...m, ...despachoData } : m),
                selectedMateria: null
            }));
        } catch (error) {
            console.error("Erro ao salvar despacho:", error);
            alert("Ocorreu um erro ao salvar o despacho.");
        }
    };

    generateHash = async (content) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    confirmSignature = async () => {
        const { passwordInput, despachoText } = this.state;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!user.email || !passwordInput) {
            this.setState({ passwordError: 'Senha necessária.' });
            return;
        }

        try {
            // Em uma implementação real, o backend verificaria a senha antes de assinar.
            // Por enquanto, validamos que o usuário está presente e simulamos a assinatura.
            const signatureData = {
                nome: user.name || 'Presidente',
                email: user.email,
                timestamp: new Date().toISOString(),
                ip: '0.0.0.0', // Simplificado
                userAgent: navigator.userAgent,
                documentHash: await this.generateHash(despachoText || '')
            };

            this.handleSubmitDespacho(this.state.pendingAction, signatureData);
            this.setState({ showPasswordModal: false });
        } catch (error) {
            console.error("Erro na assinatura:", error);
            this.setState({ passwordError: 'Ocorreu um erro ao processar a assinatura.' });
        }
    };

    handlePasswordChange = (e) => {
        this.setState({ passwordInput: e.target.value });
    };
    handleGenerateDespachoWithAI = async () => {
        const { selectedMateria, selectedComissao } = this.state;
        if (!selectedMateria) return;

        this.setState({ isGeneratingDespacho: true, despachoText: '' });

        // --- Lógica Aprimorada para Contexto da Decisão ---
        let promptContext = '';

        // Cenário 1: Matéria já aprovada na comissão
        if (selectedMateria.status === 'Aprovado na Comissão') {
            promptContext = `A matéria já foi aprovada pela comissão competente. O despacho deve, portanto, encaminhá-la para votação em Plenário.`;
        } 
        // Cenário 2: É um Requerimento
        else if (selectedMateria.tipo === 'Requerimento') {
            if (selectedMateria.decisaoParecer === 'favoravel') {
                promptContext = `Trata-se de um Requerimento com parecer favorável. O despacho pode ser para 'Deferimento' (Despachado) ou para 'Inclusão em Pauta' para votação em Plenário. Elabore um texto para o despacho de deferimento simples.`;
            } else {
                promptContext = `Trata-se de um Requerimento com parecer contrário. O despacho deve ser para o arquivamento da matéria.`;
            }
        }
        // Cenário 3: Matéria geral (Projeto de Lei, etc.)
        else {
            if (selectedComissao) {
                promptContext = `A intenção é encaminhar a matéria para a seguinte comissão: ${selectedComissao}. O despacho deve formalizar este encaminhamento.`;
            } else if (selectedMateria.decisaoParecer === 'contrario') {
                promptContext = `O parecer da procuradoria foi contrário. O despacho deve, portanto, fundamentar o arquivamento da matéria.`;
            } else {
                promptContext = `O parecer foi favorável. O despacho padrão é encaminhar para as comissões competentes. Elabore um texto genérico para encaminhamento, mesmo que uma comissão específica não tenha sido selecionada ainda.`;
            }
        }
        // --- Fim da Lógica Aprimorada ---

        const prompt = `Atue como o Presidente da Câmara Municipal. Redija um despacho de admissibilidade formal e técnico para a seguinte matéria:
        - Tipo: ${selectedMateria.tipo}
        - Número: ${selectedMateria.numero}
        - Ementa: "${selectedMateria.ementa}"
        - Parecer da Procuradoria: "${selectedMateria.parecer}" (${selectedMateria.decisaoParecer})
        
        Contexto da decisão: ${promptContext}

        O texto deve ser direto, formal e consistente com o contexto fornecido. Não use markdown nem tags HTML.`;

        try {
            const response = await sendMessageToAIPrivate(prompt, camaraId);
            this.setState({ despachoText: response, isGeneratingDespacho: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ despachoText: "Erro ao gerar despacho. Tente novamente.", isGeneratingDespacho: false });
        }
    };

    generateDespachoPDF = (materia, despachoText, statusFinal, signatureData) => {
        const { logoBase64, homeConfig, footerConfig, camaraId } = this.state;
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        
        const cityName = homeConfig.cidade || camaraId.charAt(0).toUpperCase() + camaraId.slice(1);
        const footerText = `📍 ${footerConfig.address || ''} | 📞 ${footerConfig.phone || ''}\n📧 ${footerConfig.email || ''}\n${footerConfig.copyright || ''}`;

        const docDefinition = {
            content: [
                logoBase64 && { 
                    image: logoBase64, width: 60, alignment: 'center', margin: [0, 0, 0, 5] 
                },
                { text: homeConfig.titulo || 'Câmara Municipal', style: 'header', alignment: 'center' },
                footerConfig.slogan && { text: footerConfig.slogan, style: 'slogan', alignment: 'center', margin: [0, 0, 0, 15] },
                { text: 'Gabinete da Presidência', style: 'subheader', alignment: 'center', marginBottom: 30 },

                { text: 'DESPACHO DE ADMISSIBILIDADE', style: 'title', alignment: 'center' },

                {
                    style: 'infoBox',
                    table: {
                        widths: ['*'],
                        body: [
                            [[
                                { text: `Matéria: ${materia.tipo} nº ${materia.numero}`, style: 'infoText' },
                                { text: `Ementa: ${materia.ementa}`, style: 'infoText' },
                                { text: `Autor: ${materia.autor}`, style: 'infoText' },
                            ]]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },

                { text: 'I - DO PARECER JURÍDICO', style: 'sectionHeader' },
                { text: `A Procuradoria Jurídica desta Casa emitiu parecer opinando pela ${materia.decisaoParecer === 'favoravel' ? 'constitucionalidade e legalidade' : 'inconstitucionalidade e ilegalidade'} da matéria, nos seguintes termos: "${materia.parecer}"`, style: 'bodyText' },

                { text: 'II - DO DESPACHO', style: 'sectionHeader', margin: [0, 10, 0, 5] },
                { text: despachoText || 'Considerando o parecer da Procuradoria Jurídica e a competência desta Presidência, decido pelo trâmite a seguir.', style: 'bodyText' },

                { text: 'III - DECISÃO', style: 'sectionHeader', margin: [0, 10, 0, 5] },
                { text: [ 'Diante do exposto, determino o: ', { text: statusFinal.toUpperCase(), bold: true }], style: 'bodyText' },

                { text: `\n\n${cityName}, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },

                { text: '\n\n\n\n________________________________', style: 'signature', alignment: 'center' },
                { text: 'Presidente da Câmara', style: 'signatureName', alignment: 'center' },
                { 
                    text: [
                        { text: 'ASSINATURA DIGITAL\n', bold: true, fontSize: 10 },
                        { text: `Assinado por: ${signatureData?.nome} (${signatureData?.email})\n`, fontSize: 8 },
                        { text: `Data/Hora: ${new Date(signatureData?.timestamp).toLocaleString()}\n`, fontSize: 8 },
                        { text: `IP: ${signatureData?.ip} | Hash: ${signatureData?.documentHash?.substring(0, 20)}...`, fontSize: 8 }
                    ], 
                    alignment: 'center', style: 'digitalSignatureInfo' 
                }
            ].filter(Boolean),
            footer: (currentPage, pageCount) => ({
                stack: [
                    { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: '#ccc' }] },
                    { text: footerText, style: 'footerStyle', alignment: 'center', margin: [0, 5, 0, 0] },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 40, 0] }
                ]
            }),
            styles: {
                header: { fontSize: 14, bold: true, color: '#333' }, 
                subheader: { fontSize: 13, color: '#126B5E', marginTop: 10 },
                slogan: { fontSize: 9, italics: true, color: '#666' },
                title: { fontSize: 14, bold: true, marginBottom: 20 }, 
                infoBox: { margin: [0, 0, 0, 20] },
                infoText: { fontSize: 10, margin: [5, 2, 5, 2] }, 
                sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 5, color: '#126B5E' },
                bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 }, 
                signature: { fontSize: 11 },
                signatureName: { fontSize: 11, bold: true },
                footerStyle: { fontSize: 8, color: '#777', lineHeight: 1.3 },
                digitalSignatureInfo: { fontSize: 8, color: '#007bff', marginTop: 10, italics: true, background: '#f0f8ff', padding: 5, borderRadius: 4 }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };

    renderActionButtons = () => {
        const { selectedMateria } = this.state;
        if (!selectedMateria) return null;

        // Regra 3: Matéria aprovada na comissão -> Enviar para Plenário
        if (selectedMateria.status === 'Aprovado na Comissão') {
            return (
                <button 
                    key="btn-plenario"
                    onClick={() => this.openPasswordModal('Enviado para Plenário')}
                    className="btn-primary" style={{ flex: 1 }}
                >
                    <FaPaperPlane /> Enviar para Plenário
                </button>
            );
        }

        // Regra do Parecer Favorável ou Aguardando: Arquivar, Comissões ou Plenário
        if (selectedMateria.status === 'Parecer Favorável' || selectedMateria.status === 'Aguardando Despacho da Presidência') {
            return (
                <>
                    <button 
                        key="btn-arquivar"
                        onClick={() => this.openPasswordModal('Arquivado')}
                        className="btn-danger" style={{ flex: 1 }}
                    >
                        <FaArchive /> Arquivar
                    </button>
                    <button 
                        key="btn-comissao"
                        onClick={() => this.openPasswordModal('Encaminhado às Comissões')}
                        className="btn-primary"
                    >
                        <FaPaperPlane /> Enviar para Comissão
                    </button>
                    <button 
                        key="btn-plenario-f"
                        onClick={() => this.openPasswordModal('Enviado para Plenário')}
                        className="btn-success" style={{ flex: 1 }}
                    >
                        <FaCheckCircle /> Enviar para Plenário
                    </button>
                </>
            );
        }

        // Regra 2: Requerimento -> Despachar ou Enviar para Plenário
        if (selectedMateria.tipo === 'Requerimento') {
            return (
                <>
                    <button 
                        key="btn-despachar"
                        onClick={() => this.openPasswordModal('Despachado')}
                        className="btn-success" style={{ flex: 1 }}
                    >
                        <FaCheckCircle /> Despachar
                    </button>
                    <button 
                        key="btn-plenario-req"
                        onClick={() => this.openPasswordModal('Enviado para Plenário')}
                        className="btn-primary" style={{ flex: 1 }}
                    >
                        <FaPaperPlane /> Enviar para Plenário
                    </button>
                </>
            );
        }

        // Regra 1 (Geral): Arquivar ou Enviar para Comissão
        return (
            <>
                <button 
                    key="btn-arquivar-g"
                    onClick={() => this.openPasswordModal('Arquivado')}
                    className="btn-danger" style={{ flex: 1 }}
                >
                    <FaArchive /> Arquivar
                </button>
                <button 
                    key="btn-comissao-g"
                    onClick={() => this.openPasswordModal('Encaminhado às Comissões')}
                    className="btn-primary" style={{ flex: 1 }}
                >
                    <FaPaperPlane /> Enviar para Comissão
                </button>
            </>
        );
    };

    render() {
        const { materias, activeTab, searchTerm, selectedMateria, showPasswordModal, passwordInput, passwordError } = this.state;

        const getFilteredMaterias = () => {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            let filtered = [];

            switch (activeTab) {
                case 'Comissão':
                    filtered = materias.filter(m => m.status.includes('Encaminhado à'));
                    break;
                case 'Plenário':
                    filtered = materias.filter(m => m.status === 'Enviado para Plenário');
                    break;
                case 'Finalizadas':
                    filtered = materias.filter(m => m.status.includes('Arquivado') || m.status === 'Despachado');
                    break;
                case 'Pendentes':
                default:
                    filtered = materias.filter(m => 
                        m.status === 'Aguardando Despacho da Presidência' ||
                        m.status === 'Parecer Favorável' || 
                        m.status === 'Aprovado na Comissão'
                    );
                    break;
            }

            if (searchTerm) {
                return filtered.filter(m => 
                    m.ementa.toLowerCase().includes(lowercasedSearchTerm) ||
                    m.numero.toLowerCase().includes(lowercasedSearchTerm) ||
                    m.autor.toLowerCase().includes(lowercasedSearchTerm)
                );
            }
            return filtered;
        };

        const materiasFiltradas = getFilteredMaterias();

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header" style={{ marginBottom: '30px' }}>
                        <div>
                            <h1 className="dashboard-header-title" style={{ fontSize: '20px' }}>
                                <FaBalanceScale style={{ fontSize: '20px', color: 'var(--primary-color)' }} /> Juízo da Presidência
                            </h1>
                            <p style={{ fontSize: '15px'}} className="dashboard-header-desc">Gerenciamento de admissibilidade e despachos legislativos.</p>
                        </div>
                    </div>

                    {/* --- Navegação por Abas e Busca --- */}
                    <div className="dashboard-card" style={{ padding: '10px 20px', marginBottom: '30px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {['Pendentes', 'Comissão', 'Plenário', 'Finalizadas'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => this.handleTabChange(tab)}
                                    style={{ 
                                        padding: '12px 25px', 
                                        fontSize: '0.9rem', 
                                        border: 'none', 
                                        background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                                        color: activeTab === tab ? '#fff' : '#666',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="search-input-wrapper" style={{ flex: '0 1 400px', margin: 0 }}>
                                <FaSearch className="search-icon" />
                                <input 
                                    type="text"
                                    placeholder="Pesquisar matéria..."
                                    className="search-input"
                                    style={{ background: '#f8f9fa' }}
                                    value={searchTerm}
                                    onChange={this.handleSearchChange}
                                />
                        </div>
                    </div>

                    {/* --- Lista de Matérias em Grid --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                        {materiasFiltradas.length > 0 ? materiasFiltradas.map((materia) => (
                            <div 
                                key={materia.id} 
                                className="dashboard-card dashboard-card-hover" 
                                style={{ 
                                    padding: '25px',
                                    cursor: 'pointer',
                                    borderRadius: '20px',
                                    borderLeft: `6px solid ${materia.decisaoParecer === 'contrario' ? '#d32f2f' : '#4CAF50'}`,
                                    margin: 0
                                }}
                                onClick={() => this.handleSelectMateria(materia)}
                            >
                                <div className="list-item-header" style={{ marginBottom: '15px', justifyContent: 'space-between' }}>
                                    <span className="tag tag-primary" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>{materia.tipo} {materia.numero}</span>
                                    <span className={`tag ${materia.status.includes('Aguardando') || materia.status.includes('Aprovado') ? 'tag-warning' : 'tag-neutral'}`} style={{ fontSize: '0.7rem' }}>{materia.status}</span>
                                </div>
                                <p className="list-item-title" style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '15px', height: '3em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{materia.ementa}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <div>
                                        <span style={{ color: '#888' }}>Autor:</span> <strong style={{ color: '#444' }}>{materia.autor}</strong>
                                    </div>
                                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Analisar <FaGavel /></span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: '#999', background: 'transparent', borderRadius: '24px' }}>
                                <FaInbox size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                <p style={{ fontSize: '13px', opacity: 0.3 }}>Nenhuma matéria encontrada nesta categoria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Popup (Modal) de Detalhes --- */}
                {selectedMateria && (
                    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <div className="modal-content" style={{ width: '900px', maxWidth: '95vw', padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
                            <div style={{ height: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '30px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10 }}>
                                    <div>
                                        <h2 style={{ margin: 0, color: '#126B5E', fontSize: '1.4rem', textAlign: 'left' }}>Analise de Admissibilidade</h2>
                                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem', textAlign: 'left' }}>{selectedMateria.tipo} {selectedMateria.numero} - {selectedMateria.autor}</p>
                                    </div>
                                    <button onClick={this.handleCloseDetails} style={{ background: '#f0f2f5', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                                </div>

                                <div style={{ padding: '30px' }}>
                                    {/* Resumo e Grid de Dados */}
                                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #ccc', marginBottom: '25px' }}>
                                        <p style={{ margin: 0, lineHeight: '1.6', color: '#333', fontStyle: 'italic', fontSize: '1rem', textAlign: 'left' }}>"{selectedMateria.ementa}"</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                                        <div style={{ textAlign: 'left', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Protocolo</label>
                                            <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: '#333' }}>{selectedMateria.protocolo || 'N/A'}</p>
                                        </div>
                                        <div style={{ textAlign: 'left', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Matéria Polêmica?</label>
                                            <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: selectedMateria.materiaPolemica === 'Sim' ? '#d32f2f' : '#333' }}>{selectedMateria.materiaPolemica || 'Não'}</p>
                                        </div>
                                        <div style={{ textAlign: 'left', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Tipo de Lei</label>
                                            <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: '#333' }}>{selectedMateria.isComplementar ? 'Lei Complementar' : 'Lei Ordinária'}</p>
                                        </div>
                                    </div>

                                    {/* Ações do PDF - suporta URL (Supabase) e fallback Base64 (legado) */}
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ flex: 1, height: '45px' }}
                                            onClick={() => {
                                                const url = selectedMateria.pdfUrl || selectedMateria.anexoUrl;
                                                if (url) window.open(url, '_blank');
                                                else if (selectedMateria.pdfBase64) window.open(`data:application/pdf;base64,${selectedMateria.pdfBase64}`);
                                                else alert('PDF original não disponível.');
                                            }}
                                        >
                                            <FaEye /> Ver PDF Original
                                        </button>
                                        <button className="btn-secondary" onClick={this.handleDownloadOriginalPDF} style={{ flex: 1, height: '45px' }}>
                                            <FaDownload /> Baixar Arquivo
                                        </button>
                                    </div>

                                {/* Parecer Jurídico */}
                                <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: `4px solid ${selectedMateria.decisaoParecer === 'contrario' ? '#d32f2f' : '#4CAF50'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h4 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaBalanceScale color={selectedMateria.decisaoParecer === 'contrario' ? '#d32f2f' : '#4CAF50'} /> Parecer da Procuradoria
                                        </h4>
                                        {selectedMateria.parecerDate && <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(selectedMateria.parecerDate).toLocaleDateString()}</span>}
                                    </div>
                                    <div style={{ 
                                        maxHeight: '150px', 
                                        overflowY: 'auto', 
                                        fontSize: '0.9rem', 
                                        color: '#555', 
                                        lineHeight: '1.4',
                                        background: '#fff',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #eee'
                                    }}>
                                        {selectedMateria.parecer || "Nenhum parecer jurídico registrado até o momento."}
                                    </div>
                                </div>

                                {/* Texto Integral (Collapse style / Scroll) */}
                                <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                                    <h4 style={{ fontSize: '1rem', color: '#126B5E', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <FaParagraph /> Texto Integral da Proposição
                                    </h4>
                                    <div style={{ 
                                        background: '#fafafa', 
                                        padding: '15px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #eee', 
                                        maxHeight: '200px', 
                                        overflowY: 'auto',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        color: '#2c3e50'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedMateria.textoMateria }}
                                    />
                                </div>

                                {/* Formulário de Decisão */}
                                <div style={{ borderTop: '2px solid #f0f2f5', paddingTop: '20px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ textAlign: 'left', display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                                        <FaInbox /> Encaminhar para:
                                    </label>
                                    <select
                                        className="modal-input"
                                        value={this.state.selectedComissao}
                                        onChange={(e) => this.setState({ selectedComissao: e.target.value })}
                                        style={{ background: '#fff' }}
                                    >
                                        <option value="">Selecione uma comissão...</option>
                                        {this.state.comissoesDisponiveis.map((comissao, index) => (
                                            <option key={index} value={comissao}>{comissao}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#333' }}>Texto do Despacho</label>
                                        <button 
                                            onClick={this.handleGenerateDespachoWithAI}
                                            disabled={this.state.isGeneratingDespacho}
                                            className="btn-secondary"
                                            style={{ padding: '8px 15px', color: '#126B5E', borderColor: '#126B5E', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaMagic style={{color: '#126B5E'}} /> {this.state.isGeneratingDespacho ? 'Gerando...' : 'Sugerir com IA'}
                                        </button>
                                    </div>
                                    <textarea 
                                        rows="4" 
                                        className="modal-textarea"
                                        style={{ color: '#000', backgroundColor: this.state.isGeneratingDespacho ? '#f5f5f5' : '#fff' }}
                                        placeholder={this.state.isGeneratingDespacho ? "Aguarde, a IA está redigindo o despacho..." : "Ex: Encaminhe-se às comissões competentes para análise..."}
                                        value={this.state.despachoText}
                                        onChange={(e) => this.setState({ despachoText: e.target.value })}
                                        readOnly={this.state.isGeneratingDespacho}
                                    ></textarea>
                                </div>
                                </div>
                                </div>
                                <div className="modal-footer" style={{ padding: '20px 30px', background: '#f8f9fa', borderTop: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>{this.renderActionButtons()}</div>
                                </div>
                            </div>
                            </div>
                    </div>
                )}

                    {/* Modal de Senha para Assinatura */}
                    {showPasswordModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                                <h3>Assinatura Digital do Despacho</h3>
                                <p style={{ marginBottom: '20px' }}>Digite sua senha para assinar e oficializar o despacho.</p>
                                
                                <input 
                                    type="password" 
                                    className="modal-input"
                                    style={{ marginBottom: '10px' }}
                                    placeholder="Sua senha (ex: 123456)"
                                    value={passwordInput}
                                    onChange={this.handlePasswordChange}
                                />
                                
                                {passwordError && <p style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{passwordError}</p>}

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                                    <button className="btn-secondary" onClick={() => this.setState({ showPasswordModal: false, passwordError: '' })}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.confirmSignature}>Assinar e Despachar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        );
    }
}

export default JuizoPresidente;