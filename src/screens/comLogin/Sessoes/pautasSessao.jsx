import React, { Component } from 'react';
import { FaCalendarAlt, FaPlus, FaList, FaCheckCircle, FaPrint, FaTrash, FaFileAlt, FaMagic, FaVideo, FaLink, FaPencilAlt, FaTimes, FaSearch, FaEye, FaArrowLeft, FaInfoCircle, FaGavel } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import GerenciarSessao from './GerenciarSessao.jsx'; // Importa o novo componente
import { sendMessageToAIPrivate } from '../../../aiService.js';
import api from '../../../services/api.js';

pdfMake.vfs = pdfFonts.vfs;

class PautasSessao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessoes: [],
            activeTab: 'gerenciar',
            showModal: false,
            selectedSessaoId: null,
            novaData: '',
            novoTipo: 'Sessão Ordinária',
            novaLegislatura: '',
            novoNumeroPlenaria: '',
            novoTipoDeSessao: 'Presencial', // Presencial, Remota, Híbrida
            novaTransmissaoUrl: '',
            materiasDisponiveis: [],
            documentosAcessoriosDisponiveis: [],
            selectedDocumentoToAdd: '',
            selectedMateriaToAdd: '',
            isGeneratingEdital: false,
            editalText: '',
            isFinalizing: false,
            selectedMonth: '',
            roteiroPdfUrl: null, // Novo estado para armazenar a URL do PDF gerado
            isEditingUrl: false,
            editedTransmissaoUrl: '',
            homeConfig: {},
            footerConfig: {},
            logoBase64: null,
            camaraId: this.props.match.params.camaraId,
            viewingMateriaForDetail: null, // Mantido aqui para o modal ser controlado pelo pai
            materiaSearchTerm: ''
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            const camaraId = user.camaraId || this.props.match.params.camaraId || 'camara-teste';
            this.setState({ camaraId }, () => {
                this.fetchConfigsAndLogo();
                this.fetchSessoes();
                this.fetchMateriasDisponiveis();
                this.fetchDocumentosAcessorios();
            });
        }
    }

    fetchSessoes = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/sessions/${camaraId}`);
            const sessoes = response.data || [];
            this.setState({ sessoes });
        } catch (error) {
            console.error("Erro ao buscar sessões:", error);
        }
    };

    fetchMateriasDisponiveis = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/legislative-matters/${camaraId}`);
            const materias = response.data || [];
            const materiasDisponiveis = materias.filter(m => m.status === 'Enviado para Plenário');
            this.setState({ materiasDisponiveis });
        } catch (error) {
            console.error("Erro ao buscar matérias disponíveis:", error);
        }
    };

    fetchDocumentosAcessorios = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/legislative-matters/${camaraId}/accessories`);
            const docs = response.data || [];
            const disponiveis = docs.filter(doc => doc.status === 'Protocolado');
            this.setState({ documentosAcessoriosDisponiveis: disponiveis });
        } catch (error) {
            console.error("Erro ao buscar documentos acessórios:", error);
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
            } else if (layoutData.logo) {
                this.getBase64(layoutData.logo).then(logoBase64 => this.setState({ logoBase64 }));
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

    handleOpenModal = () => {
        this.setState({ 
            showModal: true, selectedSessaoId: null, novaData: '', novoTipo: 'Sessão Ordinária', 
            novaTransmissaoUrl: '', novoTipoDeSessao: 'Presencial', novaLegislatura: '', novoNumeroPlenaria: '' 
        });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false });
    };

    handleCreateSessao = async () => {
        const { novaData, novoTipo, sessoes, novaTransmissaoUrl, camaraId, novoTipoDeSessao, novaLegislatura, novoNumeroPlenaria, homeConfig } = this.state;
        if (!novaData || !novaLegislatura || !novoNumeroPlenaria) {
            alert("Por favor, preencha a data, legislatura e o número da sessão.");
            return;
        }
        const year = new Date(novaData).getFullYear();
        const sessoesDoAno = sessoes.filter(s => s.data.endsWith(`/${year}`)).length;

        let finalTransmissaoUrl = novaTransmissaoUrl || '';
        if ((novoTipoDeSessao === 'Remota' || novoTipoDeSessao === 'Híbrida') && !finalTransmissaoUrl) {
            const jitsiRoomName = `e-camara-${camaraId}-${Date.now()}`;
            finalTransmissaoUrl = `https://meet.jit.si/${jitsiRoomName}`;
        }

        const cityName = homeConfig.cidade || camaraId;
        const nomeSessaoFormatado = `${novoNumeroPlenaria}ª Sessão Plenária da ${novaLegislatura}ª Legislatura da Câmara Municipal de ${cityName}`;

        const newSessao = {
            data: novaData.split('-').reverse().join('/'),
            tipo: nomeSessaoFormatado,
            categoria: novoTipo,
            numero: `${sessoesDoAno + 1}/${year}`,
            legislatura: novaLegislatura,
            numeroPlenaria: novoNumeroPlenaria,
            tipoDeSessao: novoTipoDeSessao,
            transmissaoUrl: finalTransmissaoUrl,
            status: 'Em Elaboração',
            itens: [],
            edital: ''
        };
        try {
            await api.post(`/sessions/${camaraId}`, newSessao);
            this.setState({ showModal: false });
            this.fetchSessoes();
        } catch (error) {
            console.error("Erro ao criar sessão:", error);
            alert("Erro ao criar sessão.");
        }
    };

    handleCloseDetails = () => {
        this.setState({ selectedSessaoId: null, roteiroPdfUrl: null });
    };

    handleSelectSessao = (sessao) => {
        this.setState({
            selectedSessaoId: sessao.id,
            editalText: sessao.edital || '', 
            roteiroPdfUrl: null, // Reseta o PDF ao selecionar nova sessão
            isEditingUrl: false, // Reseta o modo de edição da URL
            editedTransmissaoUrl: sessao.transmissaoUrl || '', // Define a URL atual para edição
        });
    };

    handleAddItem = async (materiaIdFromParam = null) => {
        const { selectedSessaoId, sessoes, selectedMateriaToAdd, materiasDisponiveis, camaraId } = this.state;
        const materiaId = materiaIdFromParam || selectedMateriaToAdd;
        if (!materiaId || !selectedSessaoId) return;

        const selectedSessao = sessoes.find(s => s.id === selectedSessaoId);
        if (!selectedSessao) return;

        const materia = materiasDisponiveis.find(m => m.id.toString() === materiaId.toString());
        if (materia) {
            const currentItens = selectedSessao.itens || [];
            if (currentItens.some(item => item.id === materia.id)) {
                alert("Esta matéria já foi adicionada a esta sessão.");
                return;
            }

            const updatedItens = [...currentItens, materia];

            try {
                await api.patch(`/sessions/id/${selectedSessaoId}`, { itens: updatedItens });
                await api.patch(`/legislative-matters/id/${materia.id}`, { status: 'Em Pauta' });

                this.setState(prevState => ({
                    sessoes: prevState.sessoes.map(s => s.id === selectedSessaoId ? { ...s, itens: updatedItens } : s),
                    selectedMateriaToAdd: '',
                    materiaSearchTerm: ''
                }));
            } catch (error) {
                console.error("Erro ao adicionar item:", error);
                alert("Erro ao adicionar item à sessão.");
            }
        }
    };

    handleAddAcessorio = async () => {
        const { selectedSessaoId, sessoes, selectedDocumentoToAdd, documentosAcessoriosDisponiveis, camaraId } = this.state;
        if (!selectedDocumentoToAdd || !selectedSessaoId) return;

        const selectedSessao = sessoes.find(s => s.id === selectedSessaoId);
        if (!selectedSessao) return;

        const doc = documentosAcessoriosDisponiveis.find(d => d.id === selectedDocumentoToAdd);
        if (doc) {
            const currentItens = selectedSessao.itens || [];
            if (currentItens.some(item => item.id === doc.id)) {
                alert("Este requerimento já foi adicionado.");
                return;
            }

            const itemNormalizado = {
                id: doc.id,
                titulo: doc.titulo || 'Requerimento de Urgência',
                ementa: "Requerimento de Urgência vinculado à matéria de referência.",
                autor: doc.autorNome || 'Autor não informado',
                tipoMateria: 'Requerimento',
                isAcessorio: true
            };

            const updatedItens = [...currentItens, itemNormalizado];

            try {
                await api.patch(`/sessions/id/${selectedSessaoId}`, { itens: updatedItens });
                await api.patch(`/legislative-matters/accessory/id/${doc.id}`, { status: 'Em Pauta' });
                
                this.setState(prevState => ({
                    sessoes: prevState.sessoes.map(s => s.id === selectedSessaoId ? { ...s, itens: updatedItens } : s),
                    selectedDocumentoToAdd: ''
                }));
            } catch (error) {
                console.error("Erro ao adicionar acessório:", error);
            }
        }
    };

    handleRemoveItem = async (itemId) => {
        const { selectedSessaoId, sessoes, camaraId } = this.state;
        if (!selectedSessaoId) return;

        const selectedSessao = sessoes.find(s => s.id === selectedSessaoId);
        if (!selectedSessao) return;

        const itemToRemove = (selectedSessao.itens || []).find(i => i.id === itemId);
        const updatedItens = (selectedSessao.itens || []).filter(i => i.id !== itemId);

        try {
            await api.patch(`/sessions/id/${selectedSessaoId}`, { itens: updatedItens });
            
            if (itemToRemove) {
                const isAcessorio = itemToRemove.isAcessorio;
                if (isAcessorio) {
                    await api.patch(`/legislative-matters/accessory/id/${itemId}`, { status: 'Protocolado' });
                } else {
                    await api.patch(`/legislative-matters/id/${itemId}`, { status: 'Enviado para Plenário' });
                }
            }

            this.setState(prevState => ({
                sessoes: prevState.sessoes.map(s => s.id === selectedSessaoId ? { ...s, itens: updatedItens } : s)
            }));
        } catch (error) {
            console.error("Erro ao remover item:", error);
            alert("Erro ao remover item da sessão.");
        }
    };

    handleOpenSessao = async () => {
        const { selectedSessaoId } = this.state;
        if (!selectedSessaoId) return;

        if (window.confirm("Tem certeza que deseja ABRIR esta sessão? Ela ficará visível publicamente como 'Aberta' e permitirá a interação dos vereadores.")) {
            try {
                await api.patch(`/sessions/id/${selectedSessaoId}`, { status: 'Aberta' });
                this.setState(prevState => ({
                    sessoes: prevState.sessoes.map(s => s.id === selectedSessaoId ? { ...s, status: 'Aberta' } : s)
                }));
                alert('Sessão aberta com sucesso!');
            } catch (error) {
                console.error("Erro ao abrir sessão:", error);
                alert("Erro ao abrir sessão.");
            }
        }
    };

    handleFinalizeSessao = async () => {
        const { selectedSessaoId, sessoes } = this.state;
        const selectedSessao = sessoes.find(s => s.id === selectedSessaoId);
        if (!selectedSessao) return;
    
        this.setState({ isFinalizing: true });
    
        const itensTexto = (selectedSessao.itens || []).map((item, index) => `${index + 1}. ${item.titulo} (${item.autor})`).join('\n');
    
        const REGIMENTO_INTERNO_ROTEIRO = `
        1. Abertura: Verificação de quórum e invocação da proteção de Deus pelo Presidente.
        2. Expediente: Leitura da ata da sessão anterior para aprovação, seguida da leitura de correspondências e ofícios recebidos.
        3. Pequeno Expediente: Espaço de 5 minutos para cada Vereador inscrito falar sobre temas de livre escolha.
        4. Ordem do Dia: Votação das matérias incluídas na pauta. Para cada matéria, o rito é:
            a. Anúncio da matéria.
            b. Leitura do parecer da comissão competente.
            c. Discussão (fala dos Vereadores inscritos).
            d. Encaminhamento de votação (orientação dos líderes de bancada).
            e. Processo de votação (nominal ou simbólica).
            f. Proclamação do resultado pelo Presidente.
        5. Grande Expediente: Espaço de 15 minutos para cada Vereador inscrito discursar sobre temas previamente definidos.
        6. Encerramento: Considerações finais e encerramento da sessão pelo Presidente.
        `;
    
        const prompt = `Atue como Secretário Legislativo da Câmara Municipal. Sua tarefa é gerar o roteiro completo e formal para a ${selectedSessao.tipo} nº ${selectedSessao.numero}, a ser realizada em ${selectedSessao.data}.
    
        Use o seguinte Regimento Interno para estruturar o roteiro da sessão:
        --- REGIMENTO INTERNO (ROTEIRO DA SESSÃO) ---
        ${REGIMENTO_INTERNO_ROTEIRO}
        --- FIM DO REGIMENTO ---
    
        As matérias a serem votadas na Ordem do Dia são:
        ${itensTexto || "Nenhuma matéria cadastrada na ordem do dia."}
    
        Com base no regimento e na lista de matérias, gere o documento "Roteiro da Sessão" completo, detalhando cada fase e incluindo os nomes das matérias nos locais apropriados da Ordem do Dia. O texto deve ser formal e pronto para ser lido pelo Presidente da Câmara. Não use markdown.`;
    
        try {
            const roteiroText = await sendMessageToAIPrivate(prompt);
            this.generateRoteiroPDF(selectedSessao, roteiroText, true); // Passa true para armazenar em vez de abrir
        } catch (error) {
            console.error("Erro na IA:", error);
            alert("Erro ao gerar roteiro com IA.");
        } finally {
            this.setState({ isFinalizing: false });
        }
    };

    generateRoteiroPDF = (sessao, roteiroText, storeUrl = false) => {
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
                { text: `ROTEIRO DA ${sessao.tipo.toUpperCase()} Nº ${sessao.numero}`, style: 'title', alignment: 'center' },
                { text: `Data: ${sessao.data}`, style: 'subheader', alignment: 'center', marginBottom: 30 },
                { text: 'ROTEIRO DA SESSÃO', style: 'sectionHeader' },
                { text: roteiroText, style: 'bodyText' },
                { text: `\n\n${cityName}, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },
            ].filter(Boolean),
            footer: (currentPage, pageCount) => ({
                stack: [
                    { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: '#ccc' }] },
                    { text: footerText, style: 'footerStyle', alignment: 'center', margin: [0, 5, 0, 0] },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 40, 0] }
                ]
            }),
            styles: { header: { fontSize: 14, bold: true, color: '#333' }, slogan: { fontSize: 9, italics: true, color: '#666' }, subheader: { fontSize: 12, color: '#555' }, title: { fontSize: 14, bold: true, marginTop: 20, marginBottom: 5 }, sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 10, color: '#126B5E' }, bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 },
            footerStyle: { fontSize: 8, color: '#777', lineHeight: 1.3 }
            }
        };
    
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        if (storeUrl) {
            pdfDocGenerator.getDataUrl((dataUrl) => {
                this.setState({ roteiroPdfUrl: dataUrl });
            });
        } else {
            pdfDocGenerator.open();
        }
    };

    handleGenerateEditalWithAI = async () => {
        const { selectedSessaoId, sessoes } = this.state;
        const selectedSessao = sessoes.find(s => s.id === selectedSessaoId);
        if (!selectedSessao) return;

        this.setState({ isGeneratingEdital: true, editalText: '' });

        const itensTexto = (selectedSessao.itens || []).map((item, index) => `${index + 1}. ${item.titulo} (${item.autor})`).join('\n');

        const prompt = `Atue como Presidente da Câmara Municipal. Redija um Edital de Convocação formal para a ${selectedSessao.tipo} nº ${selectedSessao.numero}, a ser realizada no dia ${selectedSessao.data}.
        
        A Ordem do Dia será:
        ${itensTexto || "Nenhuma matéria cadastrada na ordem do dia."}

        O texto deve seguir a estrutura padrão de editais legislativos, convocando os Senhores Vereadores, mencionando o horário regimental (ou definir 19h) e o local (Plenário da Câmara). Finalize com a data e assinatura. Não use markdown.`;

        try {
            const response = await sendMessageToAIPrivate(prompt);
            this.setState({ editalText: response, isGeneratingEdital: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ editalText: "Erro ao gerar edital.", isGeneratingEdital: false });
        }
    };

    handleUrlInputChange = (e) => {
        this.setState({ editedTransmissaoUrl: e.target.value });
    };

    handleSaveUrl = async () => {
        const { selectedSessaoId, editedTransmissaoUrl, camaraId } = this.state;
        if (!selectedSessaoId) return;

        try {
            await api.patch(`/sessions/id/${selectedSessaoId}`, { transmissaoUrl: editedTransmissaoUrl });
            this.setState(prevState => ({
                isEditingUrl: false,
                sessoes: prevState.sessoes.map(s => s.id === selectedSessaoId ? { ...s, transmissaoUrl: editedTransmissaoUrl } : s)
            }));
            alert('URL da transmissão atualizada com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar URL:", error);
            alert("Erro ao atualizar a URL da transmissão.");
        }
    };

    // Método para atualizar o estado do componente pai a partir do filho
    setParentState = (newState) => {
        this.setState(newState);
    };

    renderGerenciarSessoes = () => {
        const {
            sessoes, selectedSessaoId, selectedMonth, showModal,
            novaData, novaLegislatura, novoNumeroPlenaria, novoTipo, novoTipoDeSessao, novaTransmissaoUrl,
            materiasDisponiveis, documentosAcessoriosDisponiveis, editalText, isGeneratingEdital, isFinalizing, roteiroPdfUrl,
            isEditingUrl, editedTransmissaoUrl, materiaSearchTerm, viewingMateriaForDetail
        } = this.state;

        const selectedSessao = sessoes.find(s => s.id === selectedSessaoId);
        if (selectedSessaoId) {
            return (
                <GerenciarSessao
                    sessao={selectedSessao}
                    materiasDisponiveis={materiasDisponiveis}
                    documentosAcessoriosDisponiveis={documentosAcessoriosDisponiveis}
                    editalText={editalText}
                    isGeneratingEdital={isGeneratingEdital}
                    isFinalizing={isFinalizing}
                    roteiroPdfUrl={roteiroPdfUrl}
                    isEditingUrl={isEditingUrl}
                    editedTransmissaoUrl={editedTransmissaoUrl}
                    materiaSearchTerm={materiaSearchTerm}
                    viewingMateriaForDetail={viewingMateriaForDetail}
                    handleCloseDetails={this.handleCloseDetails}
                    handleOpenSessao={this.handleOpenSessao}
                    handleFinalizeSessao={this.handleFinalizeSessao}
                    handleGenerateEditalWithAI={this.handleGenerateEditalWithAI}
                    handleUrlInputChange={this.handleUrlInputChange}
                    handleSaveUrl={this.handleSaveUrl}
                    handleAddItem={this.handleAddItem}
                    handleAddAcessorio={this.handleAddAcessorio}
                    handleRemoveItem={this.handleRemoveItem}
                    setParentState={this.setParentState} // Passa o método para o filho atualizar o estado do pai
                />
            );
        }

        const sortedSessoes = [...sessoes].sort((a, b) => {
            const [dayA, monthA, yearA] = a.data.split('/');
            const [dayB, monthB, yearB] = b.data.split('/');
            return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
        });

        const groupedSessoes = [];
        sortedSessoes.forEach(sessao => {
            const [day, month, year] = sessao.data.split('/');
            const key = new Date(year, month - 1, day).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            let group = groupedSessoes.find(g => g.month === formattedKey);
            if (!group) { group = { month: formattedKey, sessoes: [] }; groupedSessoes.push(group); }
            group.sessoes.push(sessao);
        });

        const availableMonths = groupedSessoes.map(g => g.month);
        const currentMonth = selectedMonth || (availableMonths[0] || '');
        const displayedSessoes = groupedSessoes.find(g => g.month === currentMonth)?.sessoes || [];

        return (
            <div style={{ animation: 'fadeIn 0.5s' }}>
                <div className="dashboard-header" style={{ marginBottom: '30px' }}>
                    <div>
                        <h1 className="dashboard-header-title"><FaCalendarAlt /> Gerenciar Sessões</h1>
                        <p className="dashboard-header-desc">Selecione uma sessão para organizar a ordem do dia e gerar o roteiro.</p>
                    </div>
                    <button className="btn-primary" onClick={this.handleOpenModal}><FaPlus /> Nova Sessão</button>
                </div>

                <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '15px 25px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#666' }}>Filtrar Mês:</span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {availableMonths.map(m => (
                            <button 
                                key={m} 
                                onClick={() => this.setState({ selectedMonth: m })}
                                style={{ 
                                    padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                    background: currentMonth === m ? 'var(--primary-color)' : '#f0f2f5',
                                    color: currentMonth === m ? '#fff' : '#666',
                                    fontWeight: '600', transition: '0.3s'
                                }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                    {displayedSessoes.map(sessao => (
                                        <div 
                                            key={sessao.id} 
                                            className="dashboard-card dashboard-card-hover" 
                                            style={{ 
                                                cursor: 'pointer', margin: 0, padding: '25px', borderRadius: '20px',
                                                borderLeft: `6px solid ${sessao.status === 'Aberta' ? '#2e7d32' : (sessao.status === 'Em Elaboração' ? '#ef6c00' : '#126B5E')}`
                                            }}
                                            onClick={() => this.handleSelectSessao(sessao)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <span className="tag tag-primary">Sessão {sessao.numero}</span>
                                                <span className={`tag ${sessao.status === 'Aberta' ? 'tag-success' : 'tag-warning'}`}>{sessao.status}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '700', marginBottom: '15px', height: '3.5em', overflow: 'hidden' }}>{sessao.tipo}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                                <span style={{ color: '#666' }}><FaCalendarAlt /> {sessao.data}</span>
                                                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Gerenciar <FaArrowLeft style={{ transform: 'rotate(180deg)' }} /></span>
                                            </div>
                                        </div>
                    ))}
                    {sessoes.length === 0 && <p style={{ gridColumn: '1/-1', color: '#666', textAlign: 'center' }}>Nenhuma sessão cadastrada.</p>}
                </div>

                {/* Modal Create Permanecido conforme original mas com z-index alto */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '400px' }}>
                                <h2 className="modal-header">Nova Sessão</h2>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Data da Sessão</label>
                                    <input type="date" className="modal-input" value={novaData} onChange={(e) => this.setState({ novaData: e.target.value })} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Legislatura (Ex: 20)</label>
                                    <input type="number" className="modal-input" value={novaLegislatura} onChange={(e) => this.setState({ novaLegislatura: e.target.value })} placeholder="Ex: 20" />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Número da Sessão Plenária (Ex: 1959)</label>
                                    <input type="number" className="modal-input" value={novoNumeroPlenaria} onChange={(e) => this.setState({ novoNumeroPlenaria: e.target.value })} placeholder="Ex: 1959" />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Tipo de Sessão</label>
                                    <select className="modal-input" value={novoTipo} onChange={(e) => this.setState({ novoTipo: e.target.value })}>
                                        <option>Sessão Ordinária</option>
                                        <option>Sessão Extraordinária</option>
                                        <option>Sessão Solene</option>
                                        <option>Audiência Pública</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Formato da Sessão</label>
                                    <select className="modal-input" value={novoTipoDeSessao} onChange={(e) => this.setState({ novoTipoDeSessao: e.target.value })}>
                                        <option>Presencial</option>
                                        <option>Híbrida</option>
                                        <option>Remota</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>URL da Transmissão (YouTube/Facebook)</label>
                                    <div style={{position: 'relative'}}>
                                        <FaLink style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa'}} />
                                        <input 
                                            type="text" 
                                            className="modal-input" 
                                            style={{paddingLeft: '35px'}}
                                            placeholder="https://www.youtube.com/watch?v=..." 
                                            value={novaTransmissaoUrl} 
                                            onChange={(e) => this.setState({ novaTransmissaoUrl: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={this.handleCloseModal}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleCreateSessao}>Criar</button>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        );
    }

    renderSessoesList = (status, title, subtitle) => {
        const { sessoes, camaraId } = this.state;
        const filteredSessoes = sessoes.filter(s => 
            Array.isArray(status) ? status.includes(s.status) : s.status === status
        );

        return (
            <div className="dashboard-card" style={{ animation: 'fadeIn 0.5s' }}>
                <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                    <div>
                        <h1 className="dashboard-header-title">{title}</h1>
                        <p className="dashboard-header-desc">{subtitle}</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {filteredSessoes.length > 0 ? filteredSessoes.map(sessao => (
                        <div 
                            key={sessao.id} 
                            className="openai-card" 
                            style={{ cursor: 'pointer', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                            onClick={() => {
                                const isClosed = ['Publicada', 'Encerrada'].includes(sessao.status);
                                const path = isClosed ? `/admin/resumo-sessao/${camaraId}` : `/admin/sessao-plenaria/${camaraId}`;
                                this.props.history.push(path, { sessaoId: sessao.id });
                            }}
                        >
                            <div className="card-content-openai">
                                <span className="card-date">{sessao.data} • {sessao.tipo}</span>
                                <h3>Sessão nº {sessao.numero}</h3>
                                <p style={{ color: '#126B5E', fontWeight: '600', marginTop: '10px' }}>Clique para visualizar</p>
                            </div>
                        </div>
                    )) : (
                        <div style={{ color: '#888', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
                            Nenhuma sessão encontrada com o status "{Array.isArray(status) ? status.join(' ou ') : status}".
                        </div>
                    )}
                </div>
            </div>
        );
    }

    render() {
        const { activeTab } = this.state;

        const tabStyle = { padding: '15px 25px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', color: '#888', borderBottom: '3px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' };
        const activeTabStyle = { ...tabStyle, fontWeight: '700', color: '#126B5E', borderBottom: '3px solid #126B5E' };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content" style={{width: '100%'}}>
                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '30px' }}>
                        <button className='btgManagerSection' onClick={() => this.setState({ activeTab: 'gerenciar' })} style={activeTab === 'gerenciar' ? activeTabStyle : tabStyle}>
                            <FaList /> Gerenciar Sessões
                        </button>
                        <button className='btgManagerSection' onClick={() => this.setState({ activeTab: 'abertas' })} style={activeTab === 'abertas' ? activeTabStyle : tabStyle}>
                            <FaVideo /> Sessões Abertas
                        </button>
                        <button className='btgManagerSection' onClick={() => this.setState({ activeTab: 'fechadas' })} style={activeTab === 'fechadas' ? activeTabStyle : tabStyle}>
                            <FaCheckCircle /> Sessões Finalizadas
                        </button>
                    </div>

                    {activeTab === 'gerenciar' && this.renderGerenciarSessoes()}
                    {activeTab === 'abertas' && this.renderSessoesList('Aberta', 'Sessões Abertas', 'Acompanhe e participe das sessões em andamento.')}
                    {activeTab === 'fechadas' && this.renderSessoesList(['Publicada', 'Encerrada'], 'Sessões Finalizadas', 'Consulte o histórico de sessões já realizadas.')}
                </div>
            </div>
        );
    }
}

export default PautasSessao;