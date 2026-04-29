import React, { Component } from 'react';
import { FaGavel, FaSearch, FaTimes, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPenFancy, FaMagic, FaFileAlt, FaEye, FaSpinner, FaHistory, FaUserTie, FaCalendarAlt, FaExchangeAlt } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../../assets/logo.png';
import { generateParecer, sendMessageToAIPrivate } from '../../../aiService';
import api from '../../../services/api';

pdfMake.vfs = pdfFonts.vfs;

class JuizoMateria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            filterStatus: 'Todos',
            filterType: 'Todos',
            filterYear: 'Todos',
            selectedMateria: null,
            parecerText: '',
            logoBase64: null,
            isGeneratingParecer: false,
            materias: [],
            loading: true,
            camaraId: this.props.match.params.camaraId,
            homeConfig: {},
            councilName: '',
            footerConfig: {},
            viewingMateria: null,
            showDetailModal: false,
            showPdfPopup: false,
            pdfData: null
        };
    }

    componentDidMount() {

        const camaraId = this.props.match.params.camaraId;

        this.setState({ camaraId });
        this.fetchConfigsAndLogo();
        this.fetchMaterias(camaraId);
    }

    fetchMaterias = async (camaraId) => {
        this.setState({ loading: true });
        try {
            const response = await api.get(`/legislative-matters/${camaraId}`);
            const materias = response.data || [];
            
            // Ordenar por mais recentes
            materias.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.setState({ materias, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias para parecer:", error);
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

            if (configData.layout?.logoLight) {
                this.getBase64(configData.layout.logoLight).then(logoBase64 => this.setState({ logoBase64 }));
            } else {
                this.getBase64(logo).then(logoBase64 => this.setState({ logoBase64 }));
            }

            this.setState({
                homeConfig: configData.home || {},
                councilName,
                footerConfig: configData.footer || {}
            });
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        }
    };

    handleOpenParecer = (materia) => {
        this.setState({ selectedMateria: materia, parecerText: '' });
    };

    handleViewDetail = (materia) => {
        this.setState({ viewingMateria: materia, showDetailModal: true });
    };

    handleCloseDetail = () => {
        this.setState({ viewingMateria: null, showDetailModal: false });
    };

    handleCloseParecer = () => {
        this.setState({ selectedMateria: null });
    };

    closePdfPopup = () => {
        this.setState({ showPdfPopup: false, pdfData: null });
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

    // Gera o blob do PDF do parecer para uso local ou upload
    generateParecerPDFBlob = (materia, parecerText, decisao, signatureMetadata) => {
        return new Promise((resolve) => {
            const docDefinition = this.getDocDefinition(materia, parecerText, decisao, signatureMetadata);
            pdfMake.createPdf(docDefinition).getBlob((blob) => {
                resolve(blob);
            });
        });
    };

    // Gera Base64 localmente (apenas para visualização no popup)
    generateParecerPDFBase64 = (materia, parecerText, decisao, signatureMetadata) => {
        return new Promise((resolve) => {
            const docDefinition = this.getDocDefinition(materia, parecerText, decisao, signatureMetadata);
            pdfMake.createPdf(docDefinition).getBase64((data) => {
                resolve(data);
            });
        });
    };

    handleSubmitParecer = async (decisao) => {
        const { selectedMateria, parecerText, camaraId } = this.state;
        if (!selectedMateria) return;

        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        const signatureMetadata = {
            nome: user.name || 'Procurador',
            email: user.email,
            timestamp: new Date().toISOString()
        };

        // Gerar blob para upload e Base64 para preview local
        const [pdfBlob, pdfBase64] = await Promise.all([
            this.generateParecerPDFBlob(selectedMateria, parecerText, decisao, signatureMetadata),
            this.generateParecerPDFBase64(selectedMateria, parecerText, decisao, signatureMetadata)
        ]);

        // Upload do PDF para o Supabase via endpoint genérico
        let parecerPdfUrl = null;
        try {
            const formData = new FormData();
            formData.append('file', pdfBlob, `parecer_${selectedMateria.protocolo || selectedMateria.id}.pdf`);
            formData.append('slug', camaraId);
            formData.append('userId', user.id || 'anonymous');
            formData.append('ref', `parecer_${selectedMateria.id}`);
            const uploadResponse = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            parecerPdfUrl = uploadResponse.data.url;
            console.log('[Upload] Parecer PDF URL:', parecerPdfUrl);
        } catch (uploadError) {
            console.warn('[Upload] Falha no upload do parecer. Continuando sem URL:', uploadError);
        }

        const newStatus = decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário';
        const parecerUpdateData = {
            status: newStatus,
            parecer: parecerText || "Não foi fornecida fundamentação.",
            decisao: decisao,
            parecerDate: new Date().toISOString(),
            parecerPdfUrl: parecerPdfUrl, // Salva URL, não Base64
            parecerSignatureMetadata: signatureMetadata
        };

        try {
            await api.patch(`/legislative-matters/id/${selectedMateria.id}`, parecerUpdateData);
            this.setState(prevState => ({
                materias: prevState.materias.map(m => m.id === selectedMateria.id ? { ...m, ...parecerUpdateData } : m),
                pdfData: pdfBase64, // Preview local
                showPdfPopup: true,
                selectedMateria: null
            }));
        } catch (error) {
            console.error("Erro ao salvar parecer:", error);
            alert("Ocorreu um erro ao salvar o parecer. Tente novamente.");
        }
    };

    handleGenerateParecerWithAI = async () => {
        const { selectedMateria, camaraId } = this.state;
        if (!selectedMateria) return;

        this.setState({ isGeneratingParecer: true, parecerText: '' });

        const prompt = `Atue como um Procurador Jurídico de uma Câmara Municipal. Elabore um parecer técnico-jurídico completo sobre a constitucionalidade e legalidade do seguinte projeto:
        - Tipo: ${selectedMateria.tipo}
        - Número: ${selectedMateria.numero}
        - Autor: ${selectedMateria.autor}
        - Ementa: "${selectedMateria.ementa}"

        Sua análise deve abordar:
        1.  **Competência Legislativa:** O município tem competência para legislar sobre o tema?
        2.  **Vício de Iniciativa:** O projeto foi proposto pelo poder correto (Legislativo ou Executivo)? Ele cria despesas para o Executivo sem indicar a fonte de custeio?
        3.  **Aspectos Formais:** A redação segue a técnica legislativa (Lei Complementar 95/98)?
        4.  **Aspectos Materiais:** O conteúdo do projeto conflita com a Constituição Federal, Estadual ou a Lei Orgânica do Município?

        Estruture o parecer com as seções: I - RELATÓRIO, II - ANÁLISE JURÍDICA, e III - CONCLUSÃO.
        Na conclusão, opine de forma clara pela constitucionalidade/legalidade ou inconstitucionalidade/ilegalidade da matéria.
        Use uma linguagem formal e técnica. Não utilize tags HTML (como <p>, <br>, etc) nem formatação Markdown.`;

        try {
            const response = await sendMessageToAIPrivate(prompt, camaraId);
            this.setState({ parecerText: response, isGeneratingParecer: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ parecerText: "Erro ao gerar parecer. Tente novamente.", isGeneratingParecer: false });
        }
    };

    getDocDefinition = (materia, parecerText, decisao, signatureMetadata = null) => {
        const { logoBase64, homeConfig, footerConfig, camaraId, councilName } = this.state;
        const dataAtual = new Date().toLocaleDateString('pt-BR');

        const cityName = homeConfig.cidade || councilName || camaraId;
        const footerText = `📍 ${footerConfig.address || ''} | 📞 ${footerConfig.phone || ''}\n📧 ${footerConfig.email || ''}\n${footerConfig.copyright || ''}`;

        return {
            content: [
                logoBase64 ? { 
                    image: logoBase64, 
                    width: 70, 
                    absolutePosition: { x: 480, y: 35 } 
                } : null,
                { text: councilName || homeConfig.titulo || 'Câmara Municipal', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
                { text: 'Procuradoria Jurídica', style: 'subheader', alignment: 'center', marginBottom: 30 },

                { text: 'PARECER JURÍDICO', style: 'title', alignment: 'center' },

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
                    layout: {
                        hLineWidth: () => 1, vLineWidth: () => 1,
                        hLineColor: () => '#ccc', vLineColor: () => '#ccc',
                    }
                },

                { text: 'I - RELATÓRIO', style: 'sectionHeader' },
                { text: `Trata-se de análise jurídica do ${materia.tipo} nº ${materia.numero}, de autoria do(a) ${materia.autor}, que visa a dispor sobre "${materia.ementa}". A matéria foi encaminhada a esta Procuradoria para verificação de sua constitucionalidade e legalidade.`, style: 'bodyText' },

                { text: 'II - ANÁLISE JURÍDICA', style: 'sectionHeader' },
                { text: parecerText || "Não foi fornecida fundamentação.", style: 'bodyText' },

                { text: 'III - CONCLUSÃO', style: 'sectionHeader' },
                { text: ['Diante do exposto, esta Procuradoria Jurídica opina pela ', { text: decisao === 'favoravel' ? 'CONSTITUCIONALIDADE e LEGALIDADE' : 'INCONSTITUCIONALIDADE e ILEGALIDADE', bold: true }, ' da proposição, nos termos da análise apresentada.'], style: 'bodyText' },

                { text: `\n\n${cityName}, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },

                { text: '\n\n\n\n________________________________', style: 'signature', alignment: 'center' },
                { text: 'Procurador Jurídico', style: 'signatureName', alignment: 'center' },
                { text: 'OAB/XX 123.456', style: 'signatureOAB', alignment: 'center' },
                signatureMetadata && {
                    text: [
                        { text: '\nASSINATURA DIGITAL\n', bold: true, fontSize: 10 },
                        { text: `Assinado por: ${signatureMetadata.nome} (${signatureMetadata.email})\n`, fontSize: 8 },
                        { text: `Data/Hora: ${new Date(signatureMetadata.timestamp).toLocaleString()}`, fontSize: 8 }
                    ],
                    alignment: 'center',
                    style: 'digitalSignatureInfo'
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
                title: { fontSize: 14, bold: true, marginBottom: 20 },
                infoBox: { margin: [0, 0, 0, 20] },
                infoText: { fontSize: 10, margin: [5, 2, 5, 2] },
                sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 5 },
                bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 },
                signature: { fontSize: 11 },
                signatureName: { fontSize: 11, bold: true },
                signatureOAB: { fontSize: 10, color: '#555' },
                footerStyle: { fontSize: 8, color: '#777', lineHeight: 1.3 },
                digitalSignatureInfo: { fontSize: 8, color: '#007bff', marginTop: 10, italics: true, background: '#f0f8ff', padding: 5, borderRadius: 4 }
            }
        };
    };

    openParecerPDF = (materia, parecerText, decisao) => {
        const docDefinition = this.getDocDefinition(materia, parecerText, decisao);
        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data, showPdfPopup: true });
        });
    };


    render() {
        const { searchTerm, filterStatus, filterType, filterYear, materias, selectedMateria, isGeneratingParecer, parecerText, loading, showDetailModal, viewingMateria, showPdfPopup, pdfData } = this.state;

        // Filtros
        const filteredMaterias = materias.filter(m => {
            const matchesSearch =
                (m.titulo && m.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.numero && m.numero.includes(searchTerm)) ||
                (m.autor && m.autor.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === 'Todos' || (m.status && m.status.includes(filterStatus));
            const matchesType = filterType === 'Todos' || m.tipoMateria === filterType;
            const matchesYear = filterYear === 'Todos' || m.ano === filterYear;

            return matchesSearch && matchesStatus && matchesType && matchesYear;
        });

        // Extrair anos únicos para o filtro
        const years = [...new Set(materias.map(m => m.ano))].filter(Boolean).sort((a, b) => b - a);

        // Contadores para os Cards de Stats
        const countAguardando = materias.filter(m => m.status && m.status.includes('Aguardando Parecer')).length;
        const countParecerEmitido = materias.filter(m => m.decisao || (m.status && m.status.includes('Parecer') && !m.status.includes('Aguardando'))).length;
        const countVotadas = materias.filter(m => m.status === 'votada' || m.status === 'Sancionado' || m.status === 'Despachado' || m.status === 'Arquivado').length;

        if (loading && materias.length === 0) {
            return <div className='App-header' style={{ justifyContent: 'center' }}><FaSpinner className="animate-spin" size={40} color="#126B5E" /></div>;
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">

                    {selectedMateria ? (
                        // --- PÁGINA DE PARECER (Substitui o Modal) ---
                        <div className="dashboard-card">
                            <div className="dashboard-header" style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaGavel /> Emitir Parecer Jurídico
                                    </h2>
                                    <p style={{ color: '#666', margin: '5px 0 0 0' }}>Análise de constitucionalidade e legalidade.</p>
                                </div>
                                <button onClick={this.handleCloseParecer} className="btn-secondary">
                                    Voltar para Lista
                                </button>
                            </div>

                            {/* Detalhes da Matéria */}
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #126B5E' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Matéria</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{selectedMateria.tipoMateria} {selectedMateria.numero}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Autor</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{selectedMateria.autor}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Ementa</p>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#444' }}>"{selectedMateria.ementa}"</p>
                                </div>
                            </div>

                            {/* Área de Edição do Parecer */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>Fundamentação Jurídica</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => this.handleViewDetail(selectedMateria)}
                                            className="btn-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaFileAlt /> Ver Texto Original
                                        </button>
                                        <button
                                            onClick={() => this.openParecerPDF(selectedMateria, parecerText, 'favoravel')} // A decisão aqui é só para preview
                                            className="btn-secondary"
                                        >
                                            <FaEye style={{ marginRight: '8px', color: '#555' }} />
                                            Visualizar PDF
                                        </button>
                                        <button
                                            onClick={this.handleGenerateParecerWithAI}
                                            disabled={isGeneratingParecer}
                                            className="btn-primary"
                                            style={{ color: '#fff', borderColor: '#126B5E' }}
                                        >
                                            <FaMagic style={{ marginRight: '8px', color: '#fff' }} />
                                            {isGeneratingParecer ? 'Gerando...' : 'Sugerir com IA'}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    rows="20"
                                    className="modal-textarea"
                                    style={{
                                        background: isGeneratingParecer ? '#f5f5f5' : '#fff',
                                        border: '1px solid #ccc',
                                        padding: '15px',
                                        fontSize: '1rem',
                                        lineHeight: '1.5',
                                        color: '#333' // Texto escuro para contraste
                                    }}
                                    placeholder={isGeneratingParecer ? "Aguarde, a IA está elaborando uma sugestão de parecer..." : "Escreva aqui a fundamentação jurídica..."}
                                    value={parecerText}
                                    onChange={(e) => this.setState({ parecerText: e.target.value })}
                                    readOnly={isGeneratingParecer}
                                ></textarea>
                            </div>

                            {/* Ações */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <button
                                    onClick={() => this.handleSubmitParecer('contrario')}
                                    className="btn-danger"
                                    style={{ padding: '12px 25px', fontSize: '1rem' }}
                                >
                                    <FaTimesCircle style={{ marginRight: '8px' }} /> Parecer Contrário
                                </button>
                                <button
                                    onClick={() => this.handleSubmitParecer('favoravel')}
                                    className="btn-success"
                                    style={{ padding: '12px 25px', fontSize: '1rem' }}
                                >
                                    <FaCheckCircle style={{ marginRight: '8px' }} /> Parecer Favorável
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- LISTAGEM DE MATÉRIAS ---
                        <>
                            {/* Header */}
                            <div className="dashboard-header">
                                <div>
                                    <h1 className="dashboard-header-title">
                                        <FaGavel style={{ color: 'var(--primary-color)' }} /> Triagem e Pareceres
                                    </h1>
                                <p className="dashboard-header-desc">Gestão jurídica e legislativa das matérias em tramitação.</p>
                                </div>

                            </div>

                            {/* Stats Cards */}
                            <div className="dashboard-grid-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Aguardando Parecer</p>
                                        <h3 style={{ margin: '2px 0 0 0', color: '#f57c00', fontSize: '1.4rem' }}>{countAguardando}</h3>
                                    </div>
                                    <div style={{ width: '40px', height: '30px' }}>
                                        <svg width="40" height="30" viewBox="0 0 60 40">
                                            <rect x="0" y="20" width="8" height="20" fill="#f57c00" opacity="0.3" rx="2" />
                                            <rect x="12" y="10" width="8" height="30" fill="#f57c00" opacity="0.5" rx="2" />
                                            <rect x="24" y="25" width="8" height="15" fill="#f57c00" opacity="0.7" rx="2" />
                                            <rect x="36" y="5" width="8" height="35" fill="#f57c00" rx="2" />
                                            <rect x="48" y="15" width="8" height="25" fill="#f57c00" opacity="0.6" rx="2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Pareceres Emitidos</p>
                                        <h3 style={{ margin: '2px 0 0 0', color: '#126B5E', fontSize: '1.4rem' }}>{countParecerEmitido}</h3>
                                    </div>
                                    <div style={{ width: '40px', height: '30px' }}>
                                        <svg width="40" height="30" viewBox="0 0 60 40">
                                            <rect x="0" y="5" width="8" height="35" fill="#126B5E" opacity="0.3" rx="2" />
                                            <rect x="12" y="15" width="8" height="25" fill="#126B5E" opacity="0.5" rx="2" />
                                            <rect x="24" y="10" width="8" height="30" fill="#126B5E" opacity="0.7" rx="2" />
                                            <rect x="36" y="20" width="8" height="20" fill="#126B5E" rx="2" />
                                            <rect x="48" y="8" width="8" height="32" fill="#126B5E" opacity="0.6" rx="2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Matérias Votadas</p>
                                        <h3 style={{ margin: '2px 0 0 0', color: '#2e7d32', fontSize: '1.4rem' }}>{countVotadas}</h3>
                                    </div>
                                    <div style={{ width: '40px', height: '30px' }}>
                                        <svg width="40" height="30" viewBox="0 0 60 40">
                                            <path d="M0 35 L12 25 L24 30 L36 10 L48 20 L60 5" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Filtros e Busca Otimizados */}
                            <div className="dashboard-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '25px' }}>
                                <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                                        <FaSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por número, ementa ou autor..."
                                            value={searchTerm}
                                            onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                            className="search-input"
                                            style={{ width: '100%', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', height: '45px' }}
                                        onClick={() => this.setState({ searchTerm: '', filterStatus: 'Todos', filterType: 'Todos', filterYear: 'Todos' })}
                                    >
                                        <FaTimes /> Limpar Filtros
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo de Matéria</label>
                                        <select
                                            value={filterType}
                                            onChange={(e) => this.setState({ filterType: e.target.value })}
                                            className="filter-select"
                                            style={{ width: '100%', margin: 0 }}
                                        >
                                            <option value="Todos">Todos os Tipos</option>
                                            <option value="requerimento">Requerimento</option>
                                            <option value="projeto de lei">Projeto de Lei</option>
                                            <option value="indicacao">Indicação</option>
                                            <option value="mocao">Moção</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status do Processo</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                                            className="filter-select"
                                            style={{ width: '100%', margin: 0 }}
                                        >
                                            <option value="Todos">Todos os Status</option>
                                            <option value="Aguardando Parecer">Aguardando Parecer</option>
                                            <option value="Em Análise">Em Análise</option>
                                            <option value="Parecer Favorável">Parecer Favorável</option>
                                            <option value="Parecer Contrário">Parecer Contrário</option>
                                            <option value="votada">Votadas</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ano / Exercício</label>
                                        <select
                                            value={filterYear}
                                            onChange={(e) => this.setState({ filterYear: e.target.value })}
                                            className="filter-select"
                                            style={{ width: '100%', margin: 0 }}
                                        >
                                            <option value="Todos">Todos os Anos</option>
                                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Grid de Matérias (3 por linha) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                                {filteredMaterias.map((materia) => (
                                    <div key={materia.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderLeft: (materia.decisao === 'contrario') ? '5px solid #d32f2f' : (materia.decisao === 'favoravel' ? '5px solid #2e7d32' : '5px solid #f57c00') }}>
                                        <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#126B5E' }}>
                                                    <FaFileAlt size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.0rem' }}>{materia.tipoMateria} {materia.numero}</h3>
                                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Protocolo: {materia.protocolo}</span>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: materia.status === 'Aguardando Parecer' ? '#fff3e0' : (materia.decisao === 'favoravel' ? '#e8f5e9' : (materia.decisao === 'contrario' ? '#ffebee' : '#f5f5f5')),
                                                color: materia.status === 'Aguardando Parecer' ? '#ef6c00' : (materia.decisao === 'favoravel' ? '#2e7d32' : (materia.decisao === 'contrario' ? '#d32f2f' : '#666'))
                                            }}>
                                                {materia.status}
                                            </span>
                                        </div>

                                        <div style={{ padding: '20px', flex: 1 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                                    <FaUserTie style={{ color: '#aaa' }} />
                                                    <span><strong>Autor:</strong> {materia.autor}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                                    <FaCalendarAlt style={{ color: '#aaa' }} />
                                                    <span><strong>Apresentação:</strong> {materia.dataApresenta || 'Não informada'}</span>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        <strong>Ementa:</strong> {materia.ementa}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ flex: 1, color: '#666', fontSize: '0.85rem' }}
                                                onClick={() => this.handleViewDetail(materia)}
                                            >
                                                <FaEye /> Ver Tudo
                                            </button>
                                            {materia.parecerDate ? (
                                                <button
                                                    className="btn-primary" 
                                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                                    onClick={() => this.openParecerPDF(materia, materia.parecer, materia.decisao)}
                                                >
                                                    <FaFileAlt /> Visualizar
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                                    onClick={() => this.handleOpenParecer(materia)}
                                                >
                                                    <FaPenFancy /> Analisar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- POPUP DE VISUALIZAÇÃO DA MATÉRIA --- */}
                    {showDetailModal && viewingMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{viewingMateria.titulo}</h2>
                                    <button onClick={this.handleCloseDetail} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
                                </div>
                                <div style={{ overflowY: 'auto', paddingRight: '15px', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                        <p style={{ margin: 0 }}><strong>Tipo:</strong> {viewingMateria.tipoMateria}</p>
                                        <p style={{ margin: 0 }}><strong>Número:</strong> {viewingMateria.numero}</p>
                                        <p style={{ margin: 0 }}><strong>Autor:</strong> {viewingMateria.autor}</p>
                                        <p style={{ margin: 0 }}><strong>Protocolo:</strong> {viewingMateria.protocolo}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Ementa</h4>
                                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px', lineHeight: '1.5' }}>{viewingMateria.ementa}</p>

                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Texto da Proposição</h4>
                                        <div
                                            className="materia-content-view"
                                            style={{ lineHeight: '1.6', color: '#333', fontSize: '1rem' }}
                                            dangerouslySetInnerHTML={{ __html: viewingMateria.textoMateria }}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <button className="btn-secondary" onClick={this.handleCloseDetail}>Fechar Visualização</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- POPUP DE PREVIEW DO PDF --- */}
                    {showPdfPopup && pdfData && (
                        <div className="pdf-popup-overlay">
                            <div className="pdf-popup-content">
                                <button className="pdf-popup-close-button" onClick={this.closePdfPopup}>
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


export default JuizoMateria;