import React, { Component } from 'react';
import { FaUsers, FaFileAlt, FaCheck, FaTimes, FaPlus, FaCalendarCheck, FaUserTag, FaPenFancy, FaRobot, FaEye, FaSpinner, FaVideo } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import { TextField, Button, Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid, Divider } from '@mui/material';
import api from '../../../services/api.js';
import { sendMessageToAIPrivate } from '../../../aiService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

class ComissaoDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comissao: null,
            materias: [],
            reunioes: [],
            loading: true,
            userRole: 'Visitante',
            camaraId: this.props.match.params.camaraId, // Será atualizado
            comissaoId: null,
            activeTab: 'pautas',
            // State for meeting creation modal
            showReuniaoModal: false,
            novaReuniaoData: '',
            novaReuniaoTipo: 'Presencial',
            novaReuniaoLocal: '',
            novaReuniaoPauta: '',
            novaReuniaoMaterias: [], // Novo estado para as matérias selecionadas

            // State for Relator Designation (Presidente)
            showDesignateModal: false,
            designatingMateria: null,
            selectedRelatorId: '',

            // State for Parecer (Relator)
            showParecerModal: false,
            parecerMateria: null,
            parecerText: '',
            parecerVoto: 'Favorável',
            isGeneratingParecer: false,
            
            // Novos campos para formulário otimizado IA
            parecerLegalidade: '',
            parecerMerito: '',
            parecerObservacoes: '',
            showIAForm: false, // Toggle para mostrar formulário de orientação

            // State for Voting
            votingMateria: null,
            memberVote: 'Favorável',
            votoEmSeparadoFile: null
        };
    }

    modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'align'
    ];

    // Processa o HTML do editor para criar parágrafos formatados no PDF
    processHtmlToPdfMake = (html) => {
        if (!html) return [{ text: "Não foi fornecida fundamentação.", style: 'bodyText' }];
        // ... (implementação similar à de JuizoMateria.jsx ou AddMaterias.jsx)
    };

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!token || !user.id) {
            this.props.history.push(`/login/${this.state.camaraId}`);
            return;
        }

        const { state } = this.props.location || {};
        const comissaoId = state ? state.comissaoId : (this.props.match.params.comissaoId || null);

        if (!comissaoId) {
            this.setState({ loading: false, error: "ID da comissão não fornecido." });
            return;
        }

        const camaraId = user.camaraId || this.props.match.params.camaraId;

        this.setState({ camaraId, comissaoId, currentUser: user }, () => {
            this.fetchComissaoDetails();
        });
    }

    fetchComissaoDetails = async () => {
        const { camaraId, comissaoId, currentUser } = this.state;
        this.setState({ loading: true });

        try {
            const response = await api.get(`/commission-detail/${comissaoId}`);
            if (response.data) {
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                const comissaoData = { ...data, id: data.id || data._id, nome: data.name || data.nome };

                let userRole = 'Visitante';
                if (currentUser && comissaoData.membros) {
                    const membrosNormalized = (Array.isArray(comissaoData.membros) ? comissaoData.membros : Object.values(comissaoData.membros))
                        .map(m => ({ ...m, id: m.id || m._id, nome: m.nome || m.name }));

                    const membro = membrosNormalized.find(m => m.id === currentUser.id);
                    if (membro) userRole = membro.cargo;
                    comissaoData.membros = membrosNormalized;
                }

                this.setState({ comissao: comissaoData, userRole }, () => {
                    // Se o endpoint commission-detail já trouxer as reuniões, 
                    // podemos extraí-las diretamente para evitar uma segunda chamada.
                    if (comissaoData.reunioes) {
                        const normalizedReunioes = (Array.isArray(comissaoData.reunioes) ? comissaoData.reunioes : Object.values(comissaoData.reunioes))
                            .map(r => ({ ...r, id: r.id || r._id }));
                        this.setState({ reunioes: normalizedReunioes });
                    } else {
                        this.fetchReunioes();
                    }
                    this.fetchMaterias();
                });
            } else {
                this.setState({ loading: false, error: "Comissão não encontrada." });
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da comissão:", error);
            this.setState({ loading: false, error: "Erro ao buscar detalhes da comissão." });
        }
    };


    fetchMaterias = async () => {
        const { camaraId, comissao } = this.state;
        if (!comissao) return;

        try {
            const response = await api.get(`/legislative-matters/${camaraId}`);
            const allMaterias = response.data || [];

            const materiasDaComissao = allMaterias.filter(m => {
                if (m.status === `Encaminhado à ${comissao.nome}`) return true;
                if (m.relatorId && comissao.membros && Object.values(comissao.membros).some(mem => mem.id === m.relatorId)) {
                    return m.status.startsWith('Em Análise pelo Relator') ||
                        m.status === 'Parecer Emitido - Aguardando Votação' ||
                        m.status === 'Aprovado na Comissão' ||
                        m.status === 'Rejeitado na Comissão';
                }
                return false;
            });
            this.setState({ materias: materiasDaComissao, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias da comissão:", error);
            this.setState({ loading: false, error: "Erro ao buscar matérias da comissão." });
        }
    };

    fetchReunioes = async () => {
        const { comissaoId } = this.state;
        if (!comissaoId) return;

        try {
            // Supondo que as reuniões sejam buscadas por comissão
            const response = await api.get(`/commissions/id/${comissaoId}/meetings`);
            const rawData = response.data;
            const reunioesList = (Array.isArray(rawData) ? rawData : (rawData?.meetings || Object.values(rawData || {})))
                .filter(r => r)
                .map(r => ({ ...r, id: r.id || r._id }));

            reunioesList.sort((a, b) => new Date(b.data) - new Date(a.data));
            this.setState({ reunioes: reunioesList });
        } catch (error) {
            console.error("Erro ao buscar reuniões:", error);
        }
    };

    handleUpdateMateriaStatus = async (materiaId, newStatus) => {
        try {
            await api.patch(`/legislative-matters/id/${materiaId}`, { status: newStatus });
            alert(`Matéria atualizada para: ${newStatus}`);
            this.fetchMaterias();
        } catch (error) {
            console.error("Erro ao atualizar status da matéria:", error);
        }
    };

    // --- Voting Methods ---

    handleOpenVoting = (materia) => {
        this.setState({ showVotingModal: true, votingMateria: materia, memberVote: 'Favorável' });
    };

    handleVotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Armazena o arquivo real; não converte para Base64
            this.setState({ votoEmSeparadoFile: file });
        }
    };

    handleCastVote = async () => {
        const { votingMateria, memberVote, votoEmSeparadoFile, currentUser, camaraId } = this.state;
        if (!currentUser) return;

        const signatureMetadata = {
            nome: currentUser.name || currentUser.displayName || 'Membro',
            email: currentUser.email,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        const voteData = {
            voto: memberVote,
            data: new Date().toISOString(),
            nome: currentUser.name || currentUser.displayName || 'Membro',
            signature: signatureMetadata
        };

        // Upload do arquivo de voto em separado para o Supabase
        if (memberVote === 'Voto em Separado' && votoEmSeparadoFile) {
            try {
                const formData = new FormData();
                formData.append('file', votoEmSeparadoFile, votoEmSeparadoFile.name);
                formData.append('slug', camaraId);
                formData.append('userId', currentUser.id || 'anonymous');
                formData.append('ref', `voto_${votingMateria.id}_${currentUser.id}`);
                const uploadResponse = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                voteData.parecerUrl = uploadResponse.data.url;
                console.log('[Upload] Voto em Separado URL:', voteData.parecerUrl);
            } catch (uploadError) {
                console.warn('[Upload] Falha no upload do voto em separado:', uploadError);
            }
        }

        try {
            const updatedVotos = { ...votingMateria.votosComissao, [currentUser.id]: voteData };
            await api.patch(`/legislative-matters/id/${votingMateria.id}`, { votosComissao: updatedVotos });
            this.setState({ showVotingModal: false, votingMateria: null, memberVote: 'Favorável', votoEmSeparadoFile: null });
            this.fetchMaterias();
        } catch (error) {
            console.error("Erro ao computar voto:", error);
        }
    };

    handleFinalizeVoting = async (materiaId, resultado) => {
        try {
            await api.patch(`/legislative-matters/id/${materiaId}`, {
                status: resultado === 'Aprovado' ? 'Aprovado na Comissão' : 'Rejeitado na Comissão',
                dataVotacaoComissao: new Date().toISOString()
            });
            this.fetchMaterias();
        } catch (error) {
            console.error("Erro ao finalizar votação:", error);
        }
    };


    // --- Meeting Modal Methods ---

    handleOpenReuniaoModal = () => {
        this.setState({ showReuniaoModal: true });
    };

    handleCloseReuniaoModal = () => {
        this.setState({
            showReuniaoModal: false,
            novaReuniaoData: '',
            novaReuniaoTipo: 'Presencial',
            novaReuniaoLocal: '',
            novaReuniaoPauta: '',
            novaReuniaoMaterias: [],
        });
    };

    handleMateriaSelect = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        this.setState({ novaReuniaoMaterias: selectedIds });
    };

    handleCreateReuniao = async () => {
        const { camaraId, comissaoId, novaReuniaoData, novaReuniaoTipo, novaReuniaoLocal, novaReuniaoPauta, materias, novaReuniaoMaterias } = this.state;

        if (!novaReuniaoData) {
            alert("Por favor, preencha a data da reunião.");
            return;
        }

        if (novaReuniaoMaterias.length === 0 && !novaReuniaoPauta) {
            alert("A reunião deve ter pelo menos uma matéria selecionada ou um tópico na pauta.");
            return;
        }

        const pautasSelecionadas = materias.filter(m => novaReuniaoMaterias.includes(m.id));
        const pautaMateriasTexto = pautasSelecionadas.map((m, index) => `${index + 1}. ${m.tipoMateria} ${m.numero}: ${m.titulo}`).join('\n');

        let pautaFinal = '';
        if (pautaMateriasTexto) {
            pautaFinal += `Matérias para Deliberação:\n${pautaMateriasTexto}`;
        }
        if (novaReuniaoPauta) {
            pautaFinal += `${pautaFinal ? '\n\n' : ''}Outros Tópicos:\n${novaReuniaoPauta}`;
        }

        let reuniaoData = {
            data: novaReuniaoData,
            tipo: novaReuniaoTipo,
            pauta: pautaFinal,
            materiasPautadas: pautasSelecionadas.map(m => ({ id: m.id, titulo: m.titulo, numero: m.numero })),
            status: 'Agendada',
            createdAt: new Date().toISOString(),
        };

        if (novaReuniaoTipo === 'Virtual') {
            const roomName = `camara-ai-${camaraId}-${comissaoId}-${Date.now()}`;
            reuniaoData.url = `https://meet.jit.si/${roomName}`;
        } else {
            reuniaoData.local = novaReuniaoLocal || 'A definir';
        }

        try {
            await api.post(`/commissions/id/${comissaoId}/meetings`, reuniaoData);
            alert('Reunião criada com sucesso!');
            this.handleCloseReuniaoModal();
            this.fetchReunioes();
        } catch (error) {
            console.error("Erro ao criar reunião:", error);
            alert('Erro ao criar reunião.');
        }
    };

    // --- Relator Designation Methods (Presidente) ---
    handleOpenDesignate = (materia) => {
        this.setState({ showDesignateModal: true, designatingMateria: materia, selectedRelatorId: '' });
    };

    handleDesignateRelator = async () => {
        const { designatingMateria, selectedRelatorId, comissao } = this.state;
        if (!selectedRelatorId) return alert("Selecione um relator.");

        const relatorMember = Object.values(comissao.membros).find(m => m.id === selectedRelatorId);
        if (!relatorMember) return;

        try {
            await api.patch(`/legislative-matters/id/${designatingMateria.id}`, {
                relatorId: relatorMember.id,
                relatorNome: relatorMember.nome,
                status: `Em Análise pelo Relator (${relatorMember.nome})`
            });
            alert(`Relator ${relatorMember.nome} designado com sucesso.`);
            this.setState({ showDesignateModal: false, designatingMateria: null });
            this.fetchMaterias();
        } catch (error) {
            console.error("Erro ao designar relator:", error);
        }
    };

    // --- Parecer Creation Methods (Relator) ---
    handleOpenParecer = (materia) => {
        this.setState({
            showParecerModal: true,
            parecerMateria: materia,
            parecerText: materia.parecerComissao || '',
            parecerVoto: materia.votoRelator || 'Favorável',
            parecerLegalidade: '',
            parecerMerito: '',
            parecerObservacoes: '',
        });
    };

    handleGenerateParecerAI = async () => {
        const { parecerMateria, comissao, parecerVoto } = this.state;
        this.setState({ isGeneratingParecer: true });

        const prompt = `
            Atue como Relator da ${comissao.nome}.
            Sua tarefa é redigir um Parecer Técnico legislativo sobre a seguinte matéria:
            Título: ${parecerMateria.titulo}
            Ementa: ${parecerMateria.ementa}
            Tipo: ${parecerMateria.tipoMateria}
            Autor: ${parecerMateria.autor}

            Considerações sobre Legalidade: ${this.state.parecerLegalidade || 'Nenhuma.'}
            Considerações sobre Mérito: ${this.state.parecerMerito || 'Nenhuma.'}

            Seu voto é: ${parecerVoto}.

            Estrutura do Parecer:
            1. Relatório: Breve resumo do que trata a matéria.
            2. Fundamentação: Análise técnica sobre a legalidade, constitucionalidade e mérito do projeto. Argumente a favor do seu voto (${parecerVoto}).
            3. Conclusão do Relator: Voto final explícito.

            Use linguagem formal, técnica e impessoal. Formate em HTML com parágrafos <p> e negritos <strong>.
            
            INSTRUÇÕES CRÍTICAS DE FORMATAÇÃO:
            - Responda APENAS com o conteúdo HTML do parecer.
            - NÃO inclua nenhum texto conversacional, introduções ou blocos de código markdown.
            - Use SOMENTE as tags <p> e <strong> para formatação.
            - Não inclua tags de estrutura como <html>, <body> ou <head>.
        `;

        try {
            const { camaraId } = this.state;
            const response = await sendMessageToAIPrivate(prompt, camaraId);

            // Limpeza robusta
            let cleanedResponse = response.replace(/```html|```/g, '').trim();
            const firstP = cleanedResponse.indexOf('<p>');
            const lastP = cleanedResponse.lastIndexOf('</p>');
            if (firstP !== -1 && lastP !== -1) {
                cleanedResponse = cleanedResponse.substring(firstP, lastP + 4);
            }

            this.setState({ parecerText: cleanedResponse, isGeneratingParecer: false });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ isGeneratingParecer: false });
            alert("Erro ao gerar parecer com IA.");
        }
    };

    handleSaveParecer = async () => {
        const { parecerMateria, parecerText, parecerVoto } = this.state;
        if (!parecerText) return alert("O texto do parecer não pode estar vazio.");

        try {
            await api.patch(`/legislative-matters/id/${parecerMateria.id}`, {
                parecerComissao: parecerText,
                votoRelator: parecerVoto,
                status: 'Parecer Emitido - Aguardando Votação',
                dataParecer: new Date().toISOString()
            });
            alert("Parecer salvo e emitido com sucesso.");
            this.setState({ showParecerModal: false, parecerMateria: null });
            this.fetchMaterias();
        } catch (error) {
            console.error("Erro ao salvar parecer:", error);
        }
    };

    render() {
        const { camaraId, comissao, materias, reunioes, loading, error, activeTab, showReuniaoModal, novaReuniaoData, novaReuniaoTipo, novaReuniaoLocal, novaReuniaoPauta, novaReuniaoMaterias, userRole,
            showDesignateModal, showParecerModal, isGeneratingParecer, parecerText, parecerVoto, designatingMateria, showVotingModal, votingMateria, memberVote, votoEmSeparadoFile } = this.state;



        if (loading) {
            return <div className='App-header' style={{ justifyContent: 'center' }}>Carregando detalhes da comissão...</div>;
        }

        if (error) {
            return <div className='App-header' style={{ justifyContent: 'center' }}>{error}</div>;
        }

        console.log("Comissão:", comissao);
        if (!comissao) {
            return <div className='App-header' style={{ justifyContent: 'center' }}>Comissão não encontrada.</div>;
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title"><FaUsers /> {comissao.nome}</h1>
                            <p className="dashboard-header-desc">{comissao.descricao}</p>
                        </div>
                        <button className="btn-primary" style={{ width: 'auto' }} onClick={this.handleOpenReuniaoModal}>
                            <FaPlus /> Criar Reunião
                        </button>
                    </div>

                    {/* Abas de Navegação */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
                        <button onClick={() => this.setState({ activeTab: 'pautas' })} className={`tab-button ${activeTab === 'pautas' ? 'active' : ''}`} style={{ padding: '10px 20px', background: activeTab === 'pautas' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'pautas' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaFileAlt /> Pautas para Deliberação
                        </button>
                        <button onClick={() => this.setState({ activeTab: 'reunioes' })} className={`tab-button ${activeTab === 'reunioes' ? 'active' : ''}`} style={{ padding: '10px 20px', background: activeTab === 'reunioes' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'reunioes' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCalendarCheck /> Reuniões Agendadas
                        </button>
                        <button onClick={() => this.setState({ activeTab: 'relatoria' })} className={`tab-button ${activeTab === 'relatoria' ? 'active' : ''}`} style={{ padding: '10px 20px', background: activeTab === 'relatoria' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'relatoria' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaPenFancy /> Minha Relatoria
                        </button>
                        <button onClick={() => this.setState({ activeTab: 'votacao' })} className={`tab-button ${activeTab === 'votacao' ? 'active' : ''}`} style={{ padding: '10px 20px', background: activeTab === 'votacao' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'votacao' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCheck /> Votação
                        </button>
                    </div>

                    {/* Conteúdo da Aba Ativa */}
                    {activeTab === 'pautas' && (
                        <div className="dashboard-card">
                            <h3 style={{ margin: '0 0 20px 0', color: '#126B5E' }}>Pautas para Deliberação</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {materias.length > 0 ? materias.map(materia => (
                                    <div key={materia.id} className="list-item">
                                        <div className="list-item-content">
                                            <div className="list-item-header">
                                                <span className="tag tag-primary">{materia.tipoMateria} {materia.numero}</span>
                                            </div>
                                            <h3 className="list-item-title" style={{ margin: '5px 0' }}>{materia.titulo}</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0' }}>
                                                <strong>Autor:</strong> {materia.autor} <br />
                                                <strong>Status:</strong> {materia.status} <br />
                                                {materia.relatorNome && <span style={{ color: '#126B5E' }}><strong>Relator:</strong> {materia.relatorNome}</span>}
                                            </p>
                                        </div>
                                        <div className="list-item-actions">
                                            {/* Ações do Presidente: Designar Relator */}
                                            {userRole === 'Presidente' && !materia.relatorId && (
                                                <button className="btn-secondary" onClick={() => this.handleOpenDesignate(materia)} style={{ fontSize: '0.8rem' }}>
                                                    <FaUserTag /> Designar Relator
                                                </button>
                                            )}

                                            {/* Ações do Relator: Emitir Parecer */}
                                            {this.state.currentUser && materia.relatorId === this.state.currentUser.id && !materia.parecerComissao && (
                                                <button className="btn-primary" onClick={() => this.handleOpenParecer(materia)} style={{ fontSize: '0.8rem' }}>
                                                    <FaPenFancy /> Emitir Parecer
                                                </button>
                                            )}

                                            {/* Ações Gerais: Ver Parecer */}
                                            {materia.parecerComissao && (
                                                <button className="btn-secondary" onClick={() => this.handleOpenParecer(materia)} style={{ fontSize: '0.8rem' }}>
                                                    <FaEye /> Ver Parecer
                                                </button>
                                            )}

                                            {/* Ações de Votação (Para quando estiver em pauta de reunião, ou atalho para Presidente) */}
                                            {userRole === 'Presidente' && materia.status.includes('Aguardando Votação') && (
                                                <button className="btn-success" onClick={() => this.handleUpdateMateriaStatus(materia.id, 'Aprovado na Comissão')} style={{ fontSize: '0.8rem' }}>
                                                    <FaCheck /> Aprovar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhuma pauta pendente para esta comissão.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reunioes' && (
                        <div className="dashboard-card">
                            <h3 style={{ margin: '0 0 20px 0', color: '#126B5E' }}>Reuniões Agendadas</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {reunioes.length > 0 ? reunioes.map(reuniao => {
                                    // Tratamento para evitar "Invalid Date"
                                    const dateObj = new Date(reuniao.data);
                                    const formattedDate = !isNaN(dateObj.getTime())
                                        ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        : (reuniao.data || 'Data não informada');

                                    return (
                                        <div
                                            key={reuniao.id}
                                            className="list-item"
                                            style={{
                                                cursor: (reuniao.tipo === 'Virtual') ? 'pointer' : 'default',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onClick={() => {
                                                if (reuniao.tipo === 'Virtual') {
                                                    const targetCamaraId = camaraId && camaraId !== 'undefined' ? camaraId : (this.props.match.params.camaraId || 'camara');
                                                    this.props.history.push(`/admin/reuniao-virtual/${targetCamaraId}/${comissao.id}/${reuniao.id}`);
                                                }
                                            }}
                                        >
                                            <div className="list-item-content">
                                                <div className="list-item-header">
                                                    <span className="tag tag-primary">{formattedDate}</span>
                                                    <span className={`tag ${reuniao.status === 'Agendada' ? 'tag-warning' : 'tag-success'}`}>{reuniao.status}</span>
                                                </div>
                                                <h3 className="list-item-title">{reuniao.tipo}</h3>
                                                <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>
                                                    <strong>Pauta:</strong><br />{reuniao.pauta}
                                                </p>
                                                {!reuniao.url && reuniao.local && (
                                                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0' }}>Local: {reuniao.local}</p>
                                                )}
                                            </div>
                                            <div className="list-item-actions">
                                                {reuniao.tipo === 'Virtual' && (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const targetCamaraId = camaraId && camaraId !== 'undefined' ? camaraId : (this.props.match.params.camaraId || 'camara');
                                                            this.props.history.push(`/admin/reuniao-virtual/${targetCamaraId}/${comissao.id}/${reuniao.id}`);
                                                        }}
                                                    >
                                                        <FaVideo /> Abrir Reunião
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhuma reunião agendada para esta comissão.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'relatoria' && (
                        <div className="dashboard-card">
                            <h3 style={{ margin: '0 0 20px 0', color: '#126B5E' }}>Minhas Relatorias</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {materias.filter(m => m.relatorId === this.state.currentUser?.id).length > 0 ?
                                    materias.filter(m => m.relatorId === this.state.currentUser?.id).map(materia => (
                                        <div key={materia.id} className="list-item">
                                            <div className="list-item-content">
                                                <div className="list-item-header">
                                                    <span className="tag tag-primary">{materia.tipoMateria} {materia.numero}</span>
                                                    <span className="tag tag-warning">{materia.status}</span>
                                                </div>
                                                <h3 className="list-item-title" style={{ margin: '5px 0' }}>{materia.titulo}</h3>
                                                <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0' }}>
                                                    <strong>Ementa:</strong> {materia.ementa}
                                                </p>
                                            </div>
                                            <div className="list-item-actions">
                                                {!materia.parecerComissao ? (
                                                    <button className="btn-primary" onClick={() => this.handleOpenParecer(materia)} style={{ fontSize: '0.8rem' }}>
                                                        <FaPenFancy /> Redigir Parecer
                                                    </button>
                                                ) : (
                                                    <button className="btn-secondary" onClick={() => this.handleOpenParecer(materia)} style={{ fontSize: '0.8rem' }}>
                                                        <FaEye /> Editar/Ver Parecer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Você não possui matérias designadas para relatoria.</p>
                                    )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'votacao' && (
                        <div className="dashboard-card">
                            <h3 style={{ margin: '0 0 20px 0', color: '#126B5E' }}>Votação de Pareceres</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {materias.filter(m => m.status && (m.status.includes('Aguardando Votação') || m.status === 'Parecer Emitido - Aguardando Votação')).length > 0 ?
                                    materias.filter(m => m.status && (m.status.includes('Aguardando Votação') || m.status === 'Parecer Emitido - Aguardando Votação')).map(materia => (
                                        <div key={materia.id} className="list-item">
                                            <div className="list-item-content">
                                                <div className="list-item-header">
                                                    <span className="tag tag-primary">{materia.tipoMateria} {materia.numero}</span>
                                                    <span className="tag tag-success">Pronto para Votação</span>
                                                </div>
                                                <h3 className="list-item-title" style={{ margin: '5px 0' }}>{materia.titulo}</h3>
                                                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                                    <p style={{ fontSize: '0.85rem', color: '#333', margin: 0 }}><strong>Parecer do Relator ({materia.relatorNome}):</strong> {materia.votoRelator}</p>
                                                </div>

                                                {/* Exibição dos Votos Parciais */}
                                                {materia.votosComissao && (
                                                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
                                                        <strong>Votos Computados: </strong>
                                                        {Object.values(materia.votosComissao).length} / {Object.keys(comissao.membros || {}).length}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="list-item-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                {/* Botão de Voto para Membros */}
                                                {this.state.currentUser && comissao.membros && Object.values(comissao.membros).some(m => m.id === this.state.currentUser.id) && (
                                                    <button className="btn-primary" onClick={() => this.handleOpenVoting(materia)} style={{ fontSize: '0.8rem' }}>
                                                        <FaCheck /> Votar
                                                    </button>
                                                )}

                                                {/* Botão de Encerrar para Presidente */}
                                                {userRole === 'Presidente' && (
                                                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                        <button className="btn-success" onClick={() => this.handleFinalizeVoting(materia.id, 'Aprovado')} style={{ fontSize: '0.7rem', padding: '5px 10px' }}>
                                                            Aprovar
                                                        </button>
                                                        <button className="btn-danger" onClick={() => this.handleFinalizeVoting(materia.id, 'Rejeitado')} style={{ fontSize: '0.7rem', padding: '5px 10px' }}>
                                                            Rejeitar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhuma matéria aguardando votação no momento.</p>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Modal para Criar Reunião */}
                    {showReuniaoModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '500px' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0 }}>Agendar Nova Reunião</h2>
                                    <button onClick={this.handleCloseReuniaoModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                                </div>

                                <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                                    <div>
                                        <label className="label-form">Data e Hora</label>
                                        <input
                                            type="datetime-local"
                                            className="modal-input"
                                            value={novaReuniaoData}
                                            onChange={(e) => this.setState({ novaReuniaoData: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-form">Tipo de Reunião</label>
                                        <select
                                            className="modal-input"
                                            value={novaReuniaoTipo}
                                            onChange={(e) => this.setState({ novaReuniaoTipo: e.target.value })}
                                        >
                                            <option value="Presencial">Presencial</option>
                                            <option value="Virtual">Virtual (Jitsi)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-form">Matérias para Pauta</label>
                                        <select
                                            multiple
                                            className="modal-input"
                                            style={{ height: '150px' }}
                                            value={novaReuniaoMaterias}
                                            onChange={this.handleMateriaSelect}
                                        >
                                            {materias.length > 0 ? materias.map(materia => (
                                                <option key={materia.id} value={materia.id}>
                                                    {materia.tipoMateria} {materia.numero} - {materia.titulo}
                                                </option>
                                            )) : (
                                                <option disabled>Nenhuma matéria pendente nesta comissão</option>
                                            )}
                                        </select>
                                    </div>
                                    {novaReuniaoTipo === 'Presencial' && (
                                        <div>
                                            <label className="label-form">Local</label>
                                            <input
                                                type="text"
                                                className="modal-input"
                                                placeholder="Ex: Plenário da Câmara"
                                                value={novaReuniaoLocal}
                                                onChange={(e) => this.setState({ novaReuniaoLocal: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="label-form">Outros Tópicos da Pauta</label>
                                        <textarea rows="3" className="modal-textarea" placeholder="Descreva outros tópicos a serem discutidos..." value={novaReuniaoPauta} onChange={(e) => this.setState({ novaReuniaoPauta: e.target.value })} />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={this.handleCloseReuniaoModal}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleCreateReuniao}>Agendar Reunião</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Designar Relator */}
                    {showDesignateModal && designatingMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '400px' }}>
                                <h3 className="modal-header">Designar Relator</h3>
                                <p style={{ marginBottom: '15px' }}>Matéria: {designatingMateria.titulo}</p>
                                <label className="label-form">Selecione o Relator:</label>
                                <select className="modal-input" value={this.state.selectedRelatorId} onChange={(e) => this.setState({ selectedRelatorId: e.target.value })}>
                                    <option value="">Selecione...</option>
                                    {comissao.membros && (Array.isArray(comissao.membros) ? comissao.membros : Object.values(comissao.membros)).map(membro => (
                                        <option key={membro.id} value={membro.id}>{membro.nome || membro.name}</option>
                                    ))}
                                </select>
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={() => this.setState({ showDesignateModal: false })}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleDesignateRelator}>Salvar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Elaborar Parecer */}
                    {showParecerModal && this.state.parecerMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '90%', maxWidth: '1200px', padding: '30px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #eee' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#126B5E', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FaPenFancy /> Elaborar Parecer
                                    </Typography>
                                    <Button onClick={() => this.setState({ showParecerModal: false })} sx={{ minWidth: 0, p: 1, borderRadius: '50%' }}>
                                        <FaTimes size={20} color="#666" />
                                    </Button>
                                </Box>

                                <Box sx={{ mb: 3, p: 2, background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #126B5E' }}>
                                    <Typography variant="body1" sx={{ color: '#333', fontStyle: 'italic', lineHeight: 1.6 }}>
                                        "{this.state.parecerMateria.ementa}"
                                    </Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    {/* Coluna de Configuração da IA */}
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ p: 3, borderRadius: '16px', border: '1px solid #eef2f6', backgroundColor: '#fff' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <FaRobot color="#FF740F" /> Assistente de Parecer (IA)
                                            </Typography>

                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Voto do Relator</label>
                                                <select
                                                    className="process-text"
                                                    value={parecerVoto}
                                                    onChange={(e) => this.setState({ parecerVoto: e.target.value })}
                                                >
                                                    <option value="Favorável">Favorável</option>
                                                    <option value="Contrário">Contrário</option>
                                                    <option value="Com Emendas">Com Emendas</option>
                                                </select>
                                            </div>

                                            <TextField
                                                label="Foco na Legalidade/Constitucionalidade"
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={this.state.parecerLegalidade}
                                                onChange={(e) => this.setState({ parecerLegalidade: e.target.value })}
                                                placeholder="Ex: Verificar vício de iniciativa, competência..."
                                                sx={{ mb: 2 }}
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />

                                            <TextField
                                                label="Foco no Mérito/Impacto Social"
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={this.state.parecerMerito}
                                                onChange={(e) => this.setState({ parecerMerito: e.target.value })}
                                                placeholder="Ex: Benefícios para a comunidade, alinhamento com PPA..."
                                                sx={{ mb: 2 }}
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />

                                            <TextField
                                                label="Observações Adicionais para a IA"
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={this.state.parecerObservacoes}
                                                onChange={(e) => this.setState({ parecerObservacoes: e.target.value })}
                                                placeholder="Ex: Mencionar a Lei X, citar jurisprudência Y..."
                                                sx={{ mb: 3 }}
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={isGeneratingParecer ? <CircularProgress size={20} color="inherit" /> : <FaRobot />}
                                                onClick={this.handleGenerateParecerAI}
                                                disabled={isGeneratingParecer}
                                                sx={{
                                                    backgroundColor: '#FF740F',
                                                    '&:hover': { backgroundColor: '#e6680d' },
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    py: 1.2
                                                }}
                                            >
                                                {isGeneratingParecer ? 'IA Redigindo...' : 'Gerar Minuta com IA'}
                                            </Button>
                                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#999', textAlign: 'center' }}>
                                                A IA usará estas informações para fundamentar o parecer.
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Coluna do Editor de Texto */}
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
                                            Texto do Parecer
                                        </Typography>
                                        <Box sx={{ border: '1px solid #d1d9e0', borderRadius: '12px', overflow: 'hidden', backgroundColor: isGeneratingParecer ? '#f8f9fa' : '#fff' }}>
                                            <ReactQuill
                                                theme="snow"
                                                value={parecerText}
                                                onChange={(content) => this.setState({ parecerText: content })}
                                                modules={this.modules}
                                                formats={this.formats}
                                                placeholder={isGeneratingParecer ? "Aguarde, a IA está elaborando uma sugestão de parecer..." : "Escreva ou edite o parecer aqui..."}
                                                readOnly={isGeneratingParecer}
                                                style={{ height: '400px' }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                                            <Button variant="outlined" onClick={() => this.setState({ showParecerModal: false })} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={this.handleSaveParecer}
                                                disabled={!parecerText}
                                                sx={{
                                                    backgroundColor: '#126B5E',
                                                    '&:hover': { backgroundColor: '#0e554a' },
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    px: 4
                                                }}
                                            >
                                                Salvar e Emitir Parecer
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    )}

                    {/* Modal de Votação */}
                    {showVotingModal && votingMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '400px' }}>
                                <h3 className="modal-header">Votar Parecer</h3>
                                <p style={{ marginBottom: '15px' }}>Matéria: {votingMateria.titulo}</p>
                                <label className="label-form">Seu Voto:</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{
                                            backgroundColor: memberVote === 'Favorável' ? '#e8f5e9' : '#fff',
                                            color: memberVote === 'Favorável' ? '#2e7d32' : '#666',
                                            borderColor: memberVote === 'Favorável' ? '#2e7d32' : '#ccc'
                                        }}
                                        onClick={() => this.setState({ memberVote: 'Favorável' })}
                                    >
                                        <FaCheck /> Favorável
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        style={{
                                            backgroundColor: memberVote === 'Contrário' ? '#ffebee' : '#fff',
                                            color: memberVote === 'Contrário' ? '#c62828' : '#666',
                                            borderColor: memberVote === 'Contrário' ? '#c62828' : '#ccc'
                                        }}
                                        onClick={() => this.setState({ memberVote: 'Contrário' })}
                                    >
                                        <FaTimes /> Contrário
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        style={{
                                            backgroundColor: memberVote === 'Abstenção' ? '#f5f5f5' : '#fff',
                                            color: memberVote === 'Abstenção' ? '#333' : '#666',
                                            borderColor: memberVote === 'Abstenção' ? '#333' : '#ccc'
                                        }}
                                        onClick={() => this.setState({ memberVote: 'Abstenção' })}
                                    >
                                        Abster-se
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        style={{
                                            backgroundColor: memberVote === 'Voto em Separado' ? '#e3f2fd' : '#fff',
                                            color: memberVote === 'Voto em Separado' ? '#1565c0' : '#666',
                                            borderColor: memberVote === 'Voto em Separado' ? '#1565c0' : '#ccc'
                                        }}
                                        onClick={() => this.setState({ memberVote: 'Voto em Separado' })}
                                    >
                                        <FaFileAlt /> Voto em Separado
                                    </button>
                                </div>

                                {memberVote === 'Voto em Separado' && (
                                    <div style={{ marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
                                        <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Anexar Parecer Próprio (PDF)</label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="modal-input"
                                            onChange={this.handleVotoFileChange}
                                        />
                                        {votoEmSeparadoFile && (
                                            <p style={{ fontSize: '0.8rem', color: '#126B5E', marginTop: '5px' }}>
                                                Arquivo selecionado: {votoEmSeparadoFile.name}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={() => this.setState({ showVotingModal: false })}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleCastVote}>Confirmar Voto</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ComissaoDetails;