import React, { Component } from 'react';
import { FaBalanceScale, FaSearch, FaCheckCircle, FaTimesCircle, FaArchive, FaPaperPlane, FaFileAlt, FaGavel, FaMagic, FaInbox, FaDownload, FaEye, FaFilePdf, FaInfoCircle, FaParagraph, FaCalendarAlt } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../assets/logo.png';
import { sendMessageToAIPrivate } from '../../aiService';
import { db } from '../../firebaseConfig';
import { ref, query, get, update, onValue } from 'firebase/database';
import { auth } from '../../firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

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
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userIndexRef = ref(db, `users_index/${user.uid}`);
                const snapshot = await get(userIndexRef);
                const camaraId = snapshot.exists() ? snapshot.val().camaraId : this.props.match.params.camaraId;
                this.setState({ camaraId }, () => this.fetchConfigsAndLogo());
                this.fetchMaterias(camaraId);
                this.fetchComissoes(camaraId);
            }
        });
    }

    fetchMaterias = (camaraId) => {
        this.setState({ loading: true });
        const materiasRef = ref(db, `${this.props.match.params.camaraId}/materias`);
        // Usar onValue para atualizações em tempo real
        onValue(materiasRef, (snapshot) => {
            const materias = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    materias.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
            }
            this.setState({ materias, loading: false });
        }, (error) => {
            console.error("Erro ao buscar matérias para despacho:", error);
            this.setState({ loading: false });
        });
    };

    fetchComissoes = (camaraId) => {
        const comissoesRef = ref(db, `${camaraId}/comissoes`);
        console.log("Buscando comissões para camaraId:", camaraId);
        onValue(comissoesRef, (snapshot) => {
            const comissoes = [];
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const data = child.val();
                    if (data.nome) comissoes.push(data.nome);
                });
            }
            this.setState({ comissoesDisponiveis: comissoes });
        });
    };

    fetchConfigsAndLogo = async () => {
        const { camaraId } = this.state;
        try {
            const [layoutSnap, homeSnap, footerSnap] = await Promise.all([
                get(ref(db, `${camaraId}/dados-config/layout`)),
                get(ref(db, `${camaraId}/dados-config/home`)),
                get(ref(db, `${camaraId}/dados-config/footer`))
            ]);

            const layoutData = layoutSnap.val() || {};
            
            if (layoutData.logoLight) {
                this.getBase64(layoutData.logoLight).then(logoBase64 => this.setState({ logoBase64 }));
            } else {
                this.getBase64(logo).then(logoBase64 => this.setState({ logoBase64 }));
            }

            this.setState({
                homeConfig: homeSnap.val() || {},
                footerConfig: footerSnap.val() || {}
            });
            const getBase64 = async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            };
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
        if (selectedMateria && selectedMateria.pdfBase64) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${selectedMateria.pdfBase64}`;
            link.download = `Materia_${selectedMateria.numero.replace('/', '-')}_Original.pdf`;
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
            despachoSignatureMetadata: signatureData // Salva metadados
        };

        try {
            const materiaRef = ref(db, `${this.props.match.params.camaraId}/materias/${selectedMateria.id}`);
            await update(materiaRef, despachoData);

            this.generateDespachoPDF(selectedMateria, despachoText, statusFinal, signatureData);

            // A atualização do estado será feita automaticamente pelo listener `onValue`
            this.setState({ selectedMateria: null });
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
        const user = auth.currentUser;

        if (!user || !passwordInput) {
            this.setState({ passwordError: 'Senha necessária.' });
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, passwordInput);
            await reauthenticateWithCredential(user, credential);

            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const hash = await this.generateHash(despachoText || '');

            const signatureData = {
                nome: user.displayName || 'Presidente',
                email: user.email,
                timestamp: new Date().toISOString(),
                ip: ipData.ip,
                userAgent: navigator.userAgent,
                documentHash: hash
            };

            this.handleSubmitDespacho(this.state.pendingAction, signatureData);
            this.setState({ showPasswordModal: false });
        } catch (error) {
            console.error("Erro na reautenticação ou assinatura:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                this.setState({ passwordError: 'Senha incorreta. Verifique e tente novamente.' });
            } else {
                this.setState({ passwordError: 'Ocorreu um erro. Verifique sua conexão ou tente mais tarde.' });
            }
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

        O texto deve ser direto, formal e consistente com o contexto fornecido. Não use markdown.`;

        try {
            const response = await sendMessageToAIPrivate(prompt);
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
                    onClick={() => this.openPasswordModal('Enviado para Plenário')}
                    className="btn-primary"
                >
                    <FaPaperPlane /> Enviar para Plenário
                </button>
            );
        }

        // Regra do Parecer Favorável: Arquivar, Comissões ou Plenário
        if (selectedMateria.status === 'Parecer Favorável') {
            return (
                <>
                    <button 
                        onClick={() => this.openPasswordModal('Arquivado')}
                        className="btn-danger"
                    >
                        <FaArchive /> Arquivar
                    </button>
                    <button 
                        onClick={() => this.openPasswordModal('Encaminhado às Comissões')}
                        className="btn-primary"
                    >
                        <FaPaperPlane /> Enviar para Comissão
                    </button>
                    <button 
                        onClick={() => this.openPasswordModal('Enviado para Plenário')}
                        className="btn-success"
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
                        onClick={() => this.openPasswordModal('Despachado')}
                        className="btn-success"
                    >
                        <FaCheckCircle /> Despachar
                    </button>
                    <button 
                        onClick={() => this.openPasswordModal('Enviado para Plenário')}
                        className="btn-primary"
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
                    onClick={() => this.openPasswordModal('Arquivado')}
                    className="btn-danger"
                >
                    <FaArchive /> Arquivar
                </button>
                <button 
                    onClick={() => this.openPasswordModal('Encaminhado às Comissões')}
                    className="btn-primary"
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

                <div className="dashboard-content" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    {/* --- Coluna da Esquerda: Lista e Filtros --- */}
                    <div style={{ flex: 1, maxWidth: '500px' }}>
                        {/* Header */}
                        <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                            <div>
                                <h1 className="dashboard-header-title">
                                    <FaBalanceScale /> Juízo
                                </h1>
                                <p className="dashboard-header-desc">Despachos da Presidência.</p>
                            </div>
                        </div>

                        {/* Search and Tabs */}
                        <div className="dashboard-card" style={{ padding: '15px', marginBottom: '20px' }}>
                            <div className="search-input-wrapper" style={{ marginBottom: '15px' }}>
                                <FaSearch className="search-icon" />
                                <input 
                                    type="text"
                                    placeholder="Buscar matérias..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={this.handleSearchChange}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['Pendentes', 'Comissão', 'Plenário', 'Finalizadas'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => this.handleTabChange(tab)}
                                        className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
                                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lista de Matérias */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '10px' }}>
                            {materiasFiltradas.length > 0 ? materiasFiltradas.map((materia) => (
                                <div 
                                    key={materia.id} 
                                    className="list-item dashboard-card-hover" 
                                    style={{ 
                                        flexDirection: 'column', 
                                        alignItems: 'flex-start', 
                                        padding: '15px', 
                                        cursor: 'pointer',
                                        borderLeft: `4px solid ${selectedMateria && selectedMateria.id === materia.id ? '#FF740F' : (materia.decisaoParecer === 'contrario' ? '#d32f2f' : '#4CAF50')}`
                                    }}
                                    onClick={() => this.handleSelectMateria(materia)}
                                >
                                    <div className="list-item-header" style={{ marginBottom: '5px' }}>
                                        <span className="tag tag-primary">{materia.tipo} {materia.numero}</span>
                                        <span className={`tag ${materia.status.includes('Aguardando') || materia.status.includes('Aprovado') ? 'tag-warning' : 'tag-neutral'}`}>{materia.status}</span>
                                    </div>
                                    <p className="list-item-title" style={{ fontSize: '1rem', margin: 0 }}>{materia.ementa}</p>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', color: '#888' }}>
                                    <p>Nenhuma matéria encontrada nesta aba.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Coluna da Direita: Detalhes e Ações --- */}
                    <div style={{ flex: 1.5, position: 'sticky', top: '40px', height: 'calc(100vh - 80px)' }}>
                        {selectedMateria ? (
                            <div className="dashboard-card" style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                <h2 className="modal-header" style={{ justifyContent: 'flex-start' }}>
                                    Despacho da Matéria
                                </h2>
                                
                                {/* Resumo e Texto Original */}
                                <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <span className="tag tag-primary">{selectedMateria.tipo} {selectedMateria.numero}</span>
                                        <span className="tag tag-neutral"><FaCalendarAlt size={12} /> {selectedMateria.dataApresenta}</span>
                                    </div>
                                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #ccc', marginBottom: '15px' }}>
                                        <p style={{ margin: 0, lineHeight: '1.5', color: '#333', fontStyle: 'italic', fontSize: '0.95rem' }}>"{selectedMateria.ementa}"</p>
                                    </div>
                                    
                                    {/* Grid de Dados Técnicos */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Protocolo</label>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{selectedMateria.protocolo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Objeto</label>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{selectedMateria.objeto || 'Não informado'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Matéria Polêmica?</label>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{selectedMateria.materiaPolemica || 'Não'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Tipo de Lei</label>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{selectedMateria.isComplementar ? 'Lei Complementar' : 'Lei Ordinária'}</p>
                                        </div>
                                    </div>

                                    {/* Ações do PDF Original */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                        <button className="btn-secondary" onClick={() => window.open(`data:application/pdf;base64,${selectedMateria.pdfBase64}`)} style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                                            <FaEye /> Ver PDF Original
                                        </button>
                                        <button className="btn-secondary" onClick={this.handleDownloadOriginalPDF} style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
                                            <FaDownload /> Baixar PDF
                                        </button>
                                    </div>
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
                                        {selectedMateria.parecer}
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

                                <div className="modal-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                    {this.renderActionButtons()}
                                </div>
                            </div>
                        ) : (
                            <div className="dashboard-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#888', textAlign: 'center' }}>
                                <FaInbox size={50} style={{ marginBottom: '20px' }} />
                                <h3>Selecione uma matéria</h3>
                                <p>Clique em uma matéria na lista à esquerda para ver os detalhes e realizar o despacho.</p>
                            </div>
                        )}
                    </div>

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
            </div>
        );
    }
}

export default JuizoPresidente;