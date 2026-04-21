import React, { Component } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FaFileAlt, FaUserCheck, FaMicrophone, FaVoteYea, FaPlus, FaTrash, FaDesktop, FaUsers, FaClock, FaListUl } from "react-icons/fa";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';
import '../../../styles/FuturisticPanel.css';
import MateriaCard from '../../../componets/MateriaCard.jsx';

class SessaoPlenariaRestrita extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessao: null,
            loading: true,
            camaraId: this.props.match.params.camaraId || 'camara-teste',
            selectedMateria: null,
            showMateriaModal: false,
            user: null,
            userRole: null,
            parlamentares: [],
            currentTime: new Date(),
            showYieldTimeModal: false,
            selectedVereadorToYieldTo: null,
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            this.setState({ user, userRole: user.tipo?.toLowerCase() });
            this.fetchParlamentares();
            this.startPolling();
        } else {
            this.props.history.push(`/login/${this.state.camaraId}`);
        }

        this.uiTimer = setInterval(() => {
            this.setState({ currentTime: new Date() });
            this.checkTimeLimit();
        }, 1000);
    }

    componentWillUnmount() {
        if (this.uiTimer) clearInterval(this.uiTimer);
        if (this.pollingInterval) clearInterval(this.pollingInterval);
    }

    startPolling = () => {
        this.fetchSessaoData();
        this.pollingInterval = setInterval(this.fetchSessaoData, 3000);
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.state.sessao && prevState.sessao && JSON.stringify(prevState.sessao.itens) !== JSON.stringify(this.state.sessao.itens)) {
            this.checkAllVotings();
        }
    }

    // fetchUserRole is now handled in componentDidMount via localStorage

    fetchParlamentares = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/users/council/${camaraId}`);
            const allUsers = response.data || [];
            const parlamentares = allUsers.filter(u => u.tipo === 'vereador' || u.tipo === 'presidente');
            this.setState({ parlamentares });
        } catch (error) {
            console.error("Erro ao buscar parlamentares:", error);
        }
    };

    fetchSessaoData = async () => {
        const { state } = this.props.location;
        const sessaoId = state ? state.sessaoId : (this.props.match.params.sessaoId || null);

        if (!sessaoId) {
            this.setState({ loading: false });
            return;
        }

        try {
            const response = await api.get(`/session-detail/${sessaoId}`);
            if (response.data) {
                this.setState({ sessao: response.data, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar dados da sessão:", error);
        }
    };

    handleOpenMateriaModal = (materia) => {
        this.setState({ selectedMateria: materia, showMateriaModal: true });
    };

    handleCloseMateriaModal = () => {
        this.setState({ showMateriaModal: false, selectedMateria: null });
    };

    handleRegisterPresence = async () => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !user) return;
        
        try {
            const updatedPresenca = { ...sessao.presenca, [user.id]: { nome: user.name || user.displayName, presente: true, timestamp: new Date().toISOString() } };
            await api.patch(`/sessions/${sessao.id}`, { presenca: updatedPresenca });
            this.setState(prevState => ({ sessao: { ...prevState.sessao, presenca: updatedPresenca } }));
        } catch (error) {
            console.error("Erro ao registrar presença:", error);
        }
    };

    handleRequestToSpeak = async () => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !user) return;
        
        const currentQueue = sessao.filaDeInscritos || [];
        if (currentQueue.some(speaker => speaker.uid === user.id)) return;
        
        const parlamentar = this.state.parlamentares.find(p => p.id === user.id);
        const nome = parlamentar?.nome || user.name || user.displayName || 'Parlamentar';
        const newQueue = [...currentQueue, { uid: user.id, nome: nome, timestamp: new Date().toISOString() }];
        
        try {
            await api.patch(`/sessions/${sessao.id}`, { filaDeInscritos: newQueue });
            this.setState(prevState => ({ sessao: { ...prevState.sessao, filaDeInscritos: newQueue } }));
        } catch (error) {
            console.error("Erro ao solicitar palavra:", error);
        }
    };

    handleSetMateriaEmDiscussao = async (index) => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !sessao.itens || index === undefined) return;

        const updatedItens = sessao.itens.map((m, idx) => {
            if (m.status === 'Em Discussão' || m.status === 'Em Votação') {
                return { ...m, status: 'Encerrada Discussão/Votação' };
            }
            if (idx === index) {
                return { ...m, status: 'Em Discussão', spokenBy: {} };
            }
            return m;
        });

        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                itens: updatedItens,
                oradorAtual: null,
                filaDeInscritos: []
            });

            // Sincronizar status global das matérias envolvidas
            const targetMateria = sessao.itens[index];
            if (targetMateria.id) {
                await api.patch(`/legislative-matters/id/${targetMateria.id}`, { status: 'Em Discussão' });
            }

            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, itens: updatedItens, oradorAtual: null, filaDeInscritos: [] } 
            }));
        } catch (error) {
            console.error("Erro ao definir matéria em discussão:", error);
        }
    };

    handleSetMateriaEmVotacao = async (index) => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !sessao.itens || index === undefined) return;

        const updatedItens = sessao.itens.map((m, idx) => {
            if (m.status === 'Em Votação' || m.status === 'Em Discussão') {
                return { ...m, status: 'Encerrada' };
            }
            if (idx === index) {
                return { ...m, status: 'Em Votação' };
            }
            return m;
        });

        try {
            await api.patch(`/sessions/id/${sessao.id}`, { itens: updatedItens });

            const targetMateria = sessao.itens[index];
            if (targetMateria.id) {
                await api.patch(`/legislative-matters/id/${targetMateria.id}`, { status: 'Em Votação' });
            }

            this.setState(prevState => ({ sessao: { ...prevState.sessao, itens: updatedItens } }));
        } catch (error) {
            console.error("Erro ao definir matéria em votação:", error);
        }
    };

    handleVote = async (index, voto) => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !sessao.itens[index] || !user) return;

        const materia = sessao.itens[index];
        const updatedVotos = { ...materia.votos, [user.id]: { voto, nome: user.name || user.displayName, timestamp: new Date().toISOString() } };
        const updatedItens = sessao.itens.map((m, idx) => idx === index ? { ...m, votos: updatedVotos } : m);

        try {
            await api.patch(`/sessions/id/${sessao.id}`, { itens: updatedItens });
            this.setState(prevState => ({ sessao: { ...prevState.sessao, itens: updatedItens } }));
        } catch (error) {
            console.error("Erro ao votar:", error);
        }
    };

    handleOpenYieldTimeModal = () => {
        this.setState({ showYieldTimeModal: true, selectedVereadorToYieldTo: null });
    };

    handleCloseYieldTimeModal = () => {
        this.setState({ showYieldTimeModal: false, selectedVereadorToYieldTo: null });
    };

    // This function will be called by the current oradorAtual to yield their time
    // The president can also use this to force a yield.
    // The `yieldingSpeakerUid` is implicitly the current `user.uid` if a vereador is yielding.
    // If the president is doing it, it's the `sessao.oradorAtual.uid`.
    checkTimeLimit = () => {
        const { sessao, userRole } = this.state;
        const isAdmin = userRole === 'presidente' || userRole === 'vice-presidente';
        if (sessao?.oradorAtual && isAdmin) {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - sessao.oradorAtual.inicio) / 1000);
            const timeLeft = sessao.oradorAtual.tempo - elapsedSeconds;
            if (timeLeft <= 0) this.handleRemoveSpeaker(sessao.oradorAtual.uid);
        }
    };

    handleEndSession = async () => {
        if (window.confirm("Deseja realmente encerrar esta sessão oficialmente?")) {
            const { camaraId, sessao } = this.state;
            if (!sessao) return;
            try {
                await api.patch(`/sessions/id/${sessao.id}`, { status: 'Encerrada' });
                alert("Sessão encerrada com sucesso.");
                this.props.history.push(`/admin/sessoes/${camaraId}`);
            } catch (error) {
                console.error("Erro ao encerrar sessão:", error);
                alert("Erro ao encerrar sessão.");
            }
        }
    };

    formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    checkAllVotings = async () => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !sessao.itens) return;
        const presenca = sessao.presenca || {};
        const totalPresentes = Object.keys(presenca).length;
        if (totalPresentes === 0) return;

        let sessionUpdated = false;
        const updatedItens = await Promise.all(sessao.itens.map(async (materia, index) => {
            if (materia.status === 'Em Votação') {
                const votos = materia.votos || {};
                const totalVotes = Object.keys(votos).length;
                if (totalVotes >= totalPresentes) {
                    const voteCounts = { sim: 0, nao: 0, abstencao: 0 };
                    Object.values(votos).forEach(votoInfo => {
                        if (votoInfo.voto === 'sim') voteCounts.sim++;
                        if (votoInfo.voto === 'nao') voteCounts.nao++;
                        if (votoInfo.voto === 'abstencao') voteCounts.abstencao++;
                    });
                    const newStatus = voteCounts.sim > voteCounts.nao ? 'Aprovada' : 'Rejeitada';
                    
                    if (materia.id) {
                        await api.patch(`/legislative-matters/id/${materia.id}`, { status: newStatus });
                    }
                    sessionUpdated = true;
                    return { ...materia, status: newStatus };
                }
            }
            return materia;
        }));

        if (sessionUpdated) {
            try {
                await api.patch(`/sessions/id/${sessao.id}`, { itens: updatedItens });
                this.setState(prevState => ({ sessao: { ...prevState.sessao, itens: updatedItens } }));
            } catch (error) {
                console.error("Erro ao sincronizar status final:", error);
            }
        }
    }

    handleYieldTime = async () => {
        const { camaraId, sessao, selectedVereadorToYieldTo, parlamentares } = this.state;
        if (!sessao || !selectedVereadorToYieldTo) return;

        const materiaEmDiscussaoIndex = sessao.itens.findIndex(m => m.status === 'Em Discussão');
        if (materiaEmDiscussaoIndex === -1) {
            alert("Nenhuma matéria em discussão para ceder a vez.");
            return;
        }

        const yieldingSpeakerUid = sessao.oradorAtual?.uid;
        const targetVereador = parlamentares.find(p => p.id === selectedVereadorToYieldTo);

        if (!targetVereador) {
            alert("Vereador para ceder a vez não encontrado.");
            return;
        }

        const updatedItens = [...sessao.itens];
        if (yieldingSpeakerUid) {
            updatedItens[materiaEmDiscussaoIndex] = {
                ...updatedItens[materiaEmDiscussaoIndex],
                spokenBy: { ...updatedItens[materiaEmDiscussaoIndex].spokenBy, [yieldingSpeakerUid]: true }
            };
        }

        const oradorData = { uid: targetVereador.id, nome: targetVereador.nome, tempo: 300, inicio: Date.now() };
        const newQueue = (sessao.filaDeInscritos || []).filter(s => s.uid !== targetVereador.id);

        try {
            await api.patch(`/sessions/id/${sessao.id}`, { 
                itens: updatedItens,
                oradorAtual: oradorData,
                filaDeInscritos: newQueue
            });

            this.handleCloseYieldTimeModal();
            this.setState(prevState => ({
                sessao: { ...prevState.sessao, itens: updatedItens, oradorAtual: oradorData, filaDeInscritos: newQueue }
            }));
            alert(`${sessao.oradorAtual?.nome || 'O orador anterior'} cedeu a vez para ${targetVereador.nome}.`);
        } catch (error) {
            console.error("Erro ao ceder a vez:", error);
            alert("Erro ao ceder a vez.");
        }
    };

    handleGrantWord = async (speaker) => {
        const { camaraId, sessao, parlamentares } = this.state;
        if (!sessao) return;
        const nome = speaker.nome || speaker.name || parlamentares.find(p => p.id === speaker.uid)?.nome || 'Parlamentar';
        const oradorData = { uid: speaker.uid, nome: nome, tempo: 300, inicio: Date.now() };
        const newQueue = (sessao.filaDeInscritos || []).filter(s => s.uid !== speaker.uid);
        
        try {
            await api.patch(`/sessions/id/${sessao.id}`, { oradorAtual: oradorData, filaDeInscritos: newQueue });
            this.setState(prevState => ({ sessao: { ...prevState.sessao, oradorAtual: oradorData, filaDeInscritos: newQueue } }));
        } catch (error) {
            console.error("Erro ao conceder palavra:", error);
        }
    };

    handleAddTime = async () => {
        const { camaraId, sessao } = this.state;
        if (sessao.oradorAtual) {
            const newTime = (sessao.oradorAtual.tempo || 0) + 60;
            try {
                await api.patch(`/sessions/id/${sessao.id}`, { oradorAtual: { ...sessao.oradorAtual, tempo: newTime } });
                this.setState(prevState => ({ sessao: { ...prevState.sessao, oradorAtual: { ...prevState.sessao.oradorAtual, tempo: newTime } } }));
            } catch (error) {
                console.error("Erro ao adicionar tempo:", error);
            }
        }
    };

    handleRemoveSpeaker = async (speakerUid) => {
        const { camaraId, sessao } = this.state;
        const newQueue = (sessao.filaDeInscritos || []).filter(s => s.uid !== speakerUid);
        const updates = { filaDeInscritos: newQueue };
        if (sessao.oradorAtual && sessao.oradorAtual.uid === speakerUid) updates.oradorAtual = null;
        
        try {
            await api.patch(`/sessions/id/${sessao.id}`, updates);
            this.setState(prevState => ({ sessao: { ...prevState.sessao, ...updates } }));
        } catch (error) {
            console.error("Erro ao remover orador:", error);
        }
    };

    renderStatusBadge = (status) => {
        let className = 'status-badge ';
        switch (status) {
            case 'Em Votação': className += 'status-em-votacao'; break;
            case 'Em Discussão': className += 'status-em-votacao'; break; // Reusing style for now
            case 'Aprovada':
            case 'Rejeitada': className += 'status-rejeitada'; break;
            default: className += 'status-default';
        }
        return <span className={className}>{status || 'Tramitando'}</span>;
    };

    render() {
        const { sessao, loading, showMateriaModal, selectedMateria, user, userRole, parlamentares, currentTime, showYieldTimeModal, selectedVereadorToYieldTo } = this.state;

        if (loading) return <div className='admin-dashboard-container' style={{ justifyContent: 'center', alignItems: 'center' }}><p>Carregando Painel de Controle...</p></div>;
        if (!sessao) return <div className='admin-dashboard-container' style={{ justifyContent: 'center', alignItems: 'center' }}><p>Sessão não encontrada.</p></div>;

        const isAdmin = userRole === 'presidente' || userRole === 'vice-presidente';
        const materias = sessao.itens || [];
        const presenca = sessao.presenca || {};
        const filaDeInscritos = sessao.filaDeInscritos || [];
        const materiaEmDiscussao = materias.find(m => m.status === 'Em Discussão');
        const materiaEmVotacao = materias.find(m => m.status === 'Em Votação');

        let jitsiRoomName = `e-camara-sessao-${sessao.id}`;
        if (sessao.transmissaoUrl && sessao.transmissaoUrl.includes('meet.jit.si')) {
            jitsiRoomName = sessao.transmissaoUrl.substring(sessao.transmissaoUrl.lastIndexOf('/') + 1);
        }

        let timeLeft = 0;
        if (sessao.oradorAtual) {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - sessao.oradorAtual.inicio) / 1000);
            timeLeft = Math.max(0, sessao.oradorAtual.tempo - elapsedSeconds);
        }

        return (
            <div className='admin-dashboard-container'>
                <MenuDashboard />

                <div className='admin-main-grid'>
                    {/* Cabecalho */}
                    <header className='admin-header'>
                        <div>
                            <h2 style={{ margin: 0, color: '#126B5E' }}>{sessao.tipo} nº {sessao.numero}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold' }}>{currentTime.toLocaleDateString('pt-BR')}</div>
                                <div style={{ color: '#126B5E' }}><FaClock /> {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            {isAdmin && (
                                <button className="btn-danger" style={{ borderRadius: '8px', fontSize: '0.8rem', padding: '8px 15px' }} onClick={this.handleEndSession}>
                                    Encerrar Sessão
                                </button>
                            )}
                            <button className="btn-secondary" style={{ background: '#00695c', color: 'white', borderRadius: '8px' }} onClick={() => window.open(`/admin/painel-sessao/${this.state.camaraId}/${sessao.id}`, '_blank')}>
                                <FaDesktop /> Abrir Painel Votação
                            </button>
                        </div>
                    </header>

                    {/* Coluna 1: Participantes e Fila */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className='admin-card' style={{ flex: 1 }}>
                            <div className='admin-card-title'><FaUsers /> Parlamentares ({Object.keys(presenca).length}/{parlamentares.length})</div>
                            <div className='admin-scroll-area'>
                                {parlamentares.map(p => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f9f9f9' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: presenca[p.id] ? '#4caf50' : '#ccc', boxShadow: presenca[p.id] ? '0 0 5px #4caf50' : 'none' }}></span>
                                        <span style={{ fontSize: '0.9rem', opacity: presenca[p.id] ? 1 : 0.6 }}>{p.nome}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={this.handleRegisterPresence} disabled={presenca[user?.uid]}>
                                <FaUserCheck /> {presenca[user?.uid] ? 'Presença OK' : 'Marcar Presença'}
                            </button>
                        </div>

                        <div className='admin-card' style={{ height: '40%' }}>
                            <div className='admin-card-title'><FaListUl /> Fila de Oradores</div>
                            <div className='admin-scroll-area'>
                                {filaDeInscritos.length > 0 ? (
                                    filaDeInscritos.map((speaker, index) => (
                                        <div key={speaker.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                                            <span style={{ fontSize: '0.85rem' }}>{index + 1}. {speaker.nome}</span>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button className="btn-success" onClick={() => this.handleGrantWord(speaker)} style={{ padding: '4px 8px' }}><FaMicrophone size={12} /></button>
                                                    <button className="btn-danger" onClick={() => this.handleRemoveSpeaker(speaker.uid)} style={{ padding: '4px 8px' }}><FaTrash size={12} /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '10px' }}>Ninguém na fila.</p>}
                            </div>
                            <button className="btn-secondary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={this.handleRequestToSpeak}><FaPlus /> Solicitar Palavra</button>
                            {materiaEmDiscussao && (user?.uid === sessao.oradorAtual?.uid || isAdmin) && (
                                <button className="btn-secondary" onClick={this.handleOpenYieldTimeModal} style={{ marginTop: '10px', fontSize: '0.8rem' }}>Ceder a Vez</button>
                            )}
                        </div>
                    </aside>

                    {/* Coluna 2: Video e Orador Ativo */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className='admin-card' style={{ flex: 1, padding: 0, position: 'relative' }}>
                            <JitsiMeeting
                                roomName={jitsiRoomName}
                                configOverwrite={{ startWithAudioMuted: true, disableModeratorIndicator: true, startScreenSharing: false }}
                                getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; iframeRef.style.width = '100%'; iframeRef.style.borderRadius = '12px'; }}
                            />
                        </div>

                        <div className='admin-card' style={{ height: '200px', background: sessao.oradorAtual ? '#fffde7' : '#fff' }}>
                            <div className='admin-card-title'><FaMicrophone /> Orador na Tribuna</div>
                            {sessao.oradorAtual ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{sessao.oradorAtual.nome}</div>
                                        {isAdmin && (
                                            <button className="btn-secondary" onClick={this.handleAddTime} style={{ marginTop: '10px', fontSize: '0.8rem' }}><FaPlus /> Adicionar 1 Min</button>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '3.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: timeLeft < 30 ? '#d32f2f' : '#126B5E' }}>
                                        {this.formatCountdown(timeLeft)}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.3 }}>Tribuna Livre</div>
                            )}
                        </div>
                    </section>

                    {/* Coluna 3: Materias e Votos */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className='admin-card' style={{ flex: 1 }}>
                            <div className='admin-card-title'><FaFileAlt /> Pauta e Matérias</div>
                            <div className='admin-scroll-area'>
                                {materias.map((materia, index) => (
                                    <MateriaCard 
                                        key={materia.id || index}
                                        materia={materia}
                                        user={user}
                                        camaraId={this.state.camaraId}
                                        sessaoId={sessao.id}
                                        index={index}
                                        isAdmin={isAdmin}
                                        onOpenModal={this.handleOpenMateriaModal}
                                        onSetDiscussao={this.handleSetMateriaEmDiscussao}
                                        onSetVotacao={this.handleSetMateriaEmVotacao}
                                        
                                    />
                                ))}
                            </div>
                        </div>

                        <div className='admin-card' style={{ height: '35%', background: materiaEmVotacao ? '#e3f2fd' : '#fff' }}>
                            <div className='admin-card-title'><FaVoteYea /> Painel de Votos</div>
                            {materiaEmVotacao ? (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>VOTANDO: {materiaEmVotacao.tipoMateria} {materiaEmVotacao.numero}</div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                                            <div style={{ color: '#2e7d32' }}>Sim: {Object.values(materiaEmVotacao.votos || {}).filter(v => v.voto === 'sim').length}</div>
                                            <div style={{ color: '#c62828' }}>Não: {Object.values(materiaEmVotacao.votos || {}).filter(v => v.voto === 'nao').length}</div>
                                        </div>
                                    </div>
                                    <div className='admin-btn-group'>
                                        <button className="btn-success" onClick={() => this.handleVote(materias.indexOf(materiaEmVotacao), 'sim')}>SIM</button>
                                        <button className="btn-danger" onClick={() => this.handleVote(materias.indexOf(materiaEmVotacao), 'nao')}>NÃO</button>
                                        <button className="btn-secondary" onClick={() => this.handleVote(materias.indexOf(materiaEmVotacao), 'abstencao')} style={{ gridColumn: '1/3' }}>ABSTENÇÃO</button>
                                    </div>
                                </>
                            ) : <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '10px' }}>Aguardando início de votação.</p>}
                        </div>
                    </aside>
                </div>

                {showMateriaModal && selectedMateria && (
                    <div className="modal-overlay" onClick={this.handleCloseMateriaModal}>
                        <div className="admin-card modal-content" style={{ maxWidth: '800px', pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div className='admin-card-title'>{selectedMateria.titulo}</div>
                            <div className='admin-scroll-area' style={{ padding: '10px' }}>
                                <p><strong>Ementa:</strong> {selectedMateria.ementa}</p>
                                <div dangerouslySetInnerHTML={{ __html: selectedMateria.textoMateria }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default SessaoPlenariaRestrita;