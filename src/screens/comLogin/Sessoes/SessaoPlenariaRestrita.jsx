import React, { Component } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FaFileAlt, FaUserCheck, FaMicrophone, FaVoteYea, FaPlus, FaTrash, FaDesktop, FaUsers, FaClock, FaListUl } from "react-icons/fa";
import { Box, CircularProgress, Avatar } from '@mui/material';
import Chip from '@mui/material/Chip';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';
import '../../../styles/FuturisticPanel.css';
import MateriaCard from '../../../componets/MateriaCard.jsx';
import { normalizeSession } from '../../../utils/sessionNormalizer';

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
            isSyncing: false, // Trava para evitar que o polling sobrescreva mudanças locais
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && (user.id || user.uid)) {
            const normalizedUser = { ...user, id: user.id || user.uid };
            this.setState({ user: normalizedUser, userRole: (user.role || user.tipo || '').toLowerCase() });
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
            const parlamentares = allUsers.filter(u => {
                const role = (u.role || u.tipo || u.tipoUsuario || '').toLowerCase();
                const cargo = (u.cargo || u.funcao || '').toLowerCase();
                return role.includes('vereador') || 
                       role.includes('parlamentar') || 
                       role.includes('presidente') || 
                       role.includes('admin') ||
                       cargo.includes('vereador') || 
                       cargo.includes('presidente') ||
                       cargo.includes('parlamentar');
            }).map(u => ({ 
                ...u, 
                id: u.id || u.uid || u._id,
                nome: u.nome || u.name || u.displayName || 'Parlamentar'
            }));

            // Se o filtro for muito restrito e não retornar ninguém, mostra todos os usuários da câmara
            const finalParlamentares = parlamentares.length > 0 ? parlamentares : allUsers.map(u => ({ 
                ...u, 
                id: u.id || u.uid || u._id,
                nome: u.nome || u.name || u.displayName || 'Usuário'
            }));
            
            this.setState({ parlamentares: finalParlamentares });
        } catch (error) {
            console.error("Erro ao buscar parlamentares:", error);
        }
    };

    fetchSessaoData = async () => {
        const { isSyncing } = this.state;
        if (isSyncing) return; // Se estivermos salvando algo, não buscamos dados para não dar conflito

        const sessaoId = this.props.match.params.sessaoId || null;
        if (!sessaoId) {
            this.setState({ loading: false });
            return;
        }

        try {
            const response = await api.get(`/session-detail/${sessaoId}`);
            const normalized = normalizeSession(Array.isArray(response.data) ? response.data[0] : response.data);
            if (normalized) {
                this.setState({ sessao: normalized, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar dados da sessão:", error);
        }
    };

    handleOpenMateriaModal = async (materia) => {
        if (!materia || !materia.id) return;
        
        this.setState({ selectedMateria: { ...materia, loading: true }, showMateriaModal: true });

        try {
            const response = await api.get(`/legislative-matter-detail/${materia.id}`);
            this.setState({ selectedMateria: { ...response.data, loading: false } });
        } catch (error) {
            console.error("Erro ao buscar detalhes da matéria:", error);
            const errorMsg = error.response?.data?.error || "Erro ao carregar detalhes.";
            alert(errorMsg);
            this.setState({ selectedMateria: { ...materia, loading: false } });
        }
    };

    handleCloseMateriaModal = () => {
        this.setState({ showMateriaModal: false, selectedMateria: null });
    };

    handleRegisterPresence = async () => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !user) return;
        const userId = user.id || user.uid;

        this.setState({ isSyncing: true });
        try {
            const updatedPresenca = { ...sessao.presenca, [userId]: { nome: user.nome || user.name || user.displayName, presente: true, timestamp: new Date().toISOString(), userId } };
            await api.patch(`/sessions/${sessao.id}`, { 
                presenca: updatedPresenca,
                metadata: { ...sessao.metadata, presenca: updatedPresenca }
            });
            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, presenca: updatedPresenca, metadata: { ...prevState.sessao.metadata, presenca: updatedPresenca } },
                isSyncing: false 
            }));
        } catch (error) {
            this.setState({ isSyncing: false });
            console.error("Erro ao registrar presença:", error);
        }
    };

    handleRequestToSpeak = async () => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !user) return;
        const userId = user.id || user.uid;
        const currentQueue = sessao.filaDeInscritos || [];
        if (currentQueue.some(speaker => (speaker.id || speaker.uid) === userId)) return;
        
        const parlamentar = this.state.parlamentares.find(p => (p.id || p.uid) === userId);
        const nome = parlamentar?.nome || user.name || user.displayName || 'Parlamentar';
        const newQueue = [...currentQueue, { id: userId, uid: userId, nome: nome, timestamp: new Date().toISOString() }];
        
        this.setState({ isSyncing: true });
        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                filaDeInscritos: newQueue,
                metadata: { ...sessao.metadata, filaDeInscritos: newQueue }
            });
            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, filaDeInscritos: newQueue, metadata: { ...prevState.sessao.metadata, filaDeInscritos: newQueue } },
                isSyncing: false 
            }));
        } catch (error) {
            this.setState({ isSyncing: false });
            console.error("Erro ao solicitar palavra:", error);
        }
    };

    handleSetMateriaEmDiscussao = async (index) => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !(sessao.matters || sessao.itens) || index === undefined) return;

        const currentMatters = sessao.matters || sessao.itens || [];
        const updatedItens = currentMatters.map((m, idx) => {
            if (m.status === 'Em Discussão' || m.status === 'Em Votação') {
                return { ...m, status: 'Encerrada Discussão/Votação' };
            }
            if (idx === index) {
                return { ...m, status: 'Em Discussão', spokenBy: {} };
            }
            return m;
        });

        this.setState({ isSyncing: true });
        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                matters: updatedItens,
                oradorAtual: null,
                filaDeInscritos: [],
                metadata: { 
                    ...sessao.metadata, 
                    matters: updatedItens,
                    itens: updatedItens,
                    oradorAtual: null,
                    filaDeInscritos: []
                }
            });

            // Sincronizar status global das matérias envolvidas
            const targetMateria = currentMatters[index];
            if (targetMateria.id) {
                const endpoint = (targetMateria.isAcessorio || targetMateria.isAccessory)
                    ? `/legislative-matters/accessory/${targetMateria.id}`
                    : `/legislative-matters/id/${targetMateria.id}`;
                await api.patch(endpoint, { status: 'Em Discussão' });
            }

            this.setState(prevState => ({
                sessao: { 
                    ...prevState.sessao, 
                    matters: updatedItens, 
                    itens: updatedItens, 
                    oradorAtual: null, 
                    filaDeInscritos: [],
                    metadata: { 
                        ...prevState.sessao.metadata, 
                        matters: updatedItens,
                        itens: updatedItens,
                        oradorAtual: null,
                        filaDeInscritos: []
                    }
                },
                isSyncing: false
            }), () => this.fetchSessaoData());
        } catch (error) {
            this.setState({ isSyncing: false });
            console.error("Erro ao definir matéria em discussão:", error);
        }
    };

    handleSetMateriaEmVotacao = async (index) => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !(sessao.matters || sessao.itens) || index === undefined) return;

        const currentMatters = sessao.matters || sessao.itens || [];
        const updatedItens = currentMatters.map((m, idx) => {
            if (m.status === 'Em Votação' || m.status === 'Em Discussão') {
                return { ...m, status: 'Encerrada' };
            }
            if (idx === index) {
                return { ...m, status: 'Em Votação' };
            }
            return m;
        });

        this.setState({ isSyncing: true });
        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                matters: updatedItens,
                metadata: { ...sessao.metadata, matters: updatedItens, itens: updatedItens }
            });

            const targetMateria = currentMatters[index];
            if (targetMateria.id) {
                const endpoint = (targetMateria.isAcessorio || targetMateria.isAccessory)
                    ? `/legislative-matters/accessory/${targetMateria.id}`
                    : `/legislative-matters/id/${targetMateria.id}`;
                await api.patch(endpoint, { status: 'Em Votação' });
            }
            
            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, matters: updatedItens, itens: updatedItens, metadata: { ...prevState.sessao.metadata, matters: updatedItens, itens: updatedItens } },
                isSyncing: false 
            }), () => this.fetchSessaoData());
        } catch (error) {
            this.setState({ isSyncing: false });
            console.error("Erro ao definir matéria em votação:", error);
        }
    };

    handleVote = async (index, voto) => {
        const { camaraId, sessao, user } = this.state;
        const currentMatters = sessao.matters || sessao.itens || [];
        if (!sessao || !currentMatters[index] || !user) return;

        const materia = currentMatters[index];
        const updatedVotos = { ...materia.votos, [user.id]: { voto, nome: user.name || user.displayName, timestamp: new Date().toISOString() } };
        const updatedItens = currentMatters.map((m, idx) => idx === index ? { ...m, votos: updatedVotos } : m);

        this.setState({ isSyncing: true });
        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                matters: updatedItens,
                metadata: { ...sessao.metadata, matters: updatedItens, itens: updatedItens }
            });
            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, matters: updatedItens, itens: updatedItens, metadata: { ...prevState.sessao.metadata, matters: updatedItens, itens: updatedItens } },
                isSyncing: false 
            }));
        } catch (error) {
            this.setState({ isSyncing: false });
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
        const { sessao, userRole, user, isSyncing } = this.state;
        const isAdmin = userRole === 'presidente' || userRole === 'admin' || userRole === 'superadmin' || user?.cargo?.toLowerCase().includes('presidente');

        if (sessao?.oradorAtual && isAdmin && !isSyncing) {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - sessao.oradorAtual.inicio) / 1000);
            const timeLeft = sessao.oradorAtual.tempo - elapsedSeconds;
            if (timeLeft <= 0) this.handleRemoveSpeaker(sessao.oradorAtual.id || sessao.oradorAtual.uid);
        }
    };

    handleEndSession = async () => {
        if (window.confirm("Deseja realmente encerrar esta sessão oficialmente?")) {
            const { camaraId, sessao } = this.state;
            if (!sessao) return;
            try {
                await api.patch(`/sessions/${sessao.id}`, { 
                    status: 'Encerrada',
                    metadata: {
                        ...sessao.metadata,
                        closedAt: new Date().toISOString()
                    }
                });
                alert("Sessão encerrada com sucesso.");
                this.props.history.push(`/admin/pautas-sessao/${camaraId}`);
            } catch (error) {
                console.error("Erro ao encerrar sessão:", error);
                const errorMsg = error.response?.data?.details || "Não foi possível encerrar a sessão.";
                alert("Erro: " + errorMsg);
            }
        }
    };

    formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    checkAllVotings = async () => {
        const { camaraId, sessao, isSyncing } = this.state;
        if (isSyncing) return;

        const currentMatters = sessao.matters || sessao.itens;
        if (!sessao || !currentMatters) return;
        const presenca = sessao.presenca || {};
        const totalPresentes = Object.keys(presenca).length;
        if (totalPresentes === 0) return;

        let sessionUpdated = false;
        const updatedItens = await Promise.all(currentMatters.map(async (materia, index) => {
            if (materia.status === 'Em Votação') {
                const votos = materia.votos || {};
                const totalVotes = Object.keys(votos).length;
                if (totalVotes >= totalPresentes) {
                    const voteCounts = { sim: 0, nao: 0, abstencao: 0 };
                    Object.values(votos).forEach(votoInfo => {
                        const vKey = votoInfo.voto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (voteCounts.hasOwnProperty(vKey)) voteCounts[vKey]++;
                        else if (vKey?.includes('abs')) voteCounts.abstencao++;
                    });
                    const newStatus = voteCounts.sim > voteCounts.nao ? 'Aprovada' : 'Rejeitada';
                    
                    if (materia.id) {
                        const endpoint = (materia.isAcessorio || materia.isAccessory)
                            ? `/legislative-matters/accessory/${materia.id}`
                            : `/legislative-matters/id/${materia.id}`;
                        await api.patch(endpoint, { status: newStatus });
                    }
                    sessionUpdated = true;
                    return { ...materia, status: newStatus };
                }
            }
            return materia;
        }));

        if (sessionUpdated) {
            this.setState({ isSyncing: true });
            try {
                await api.patch(`/sessions/${sessao.id}`, { 
                    matters: updatedItens,
                    metadata: { ...sessao.metadata, matters: updatedItens, itens: updatedItens }
                });
                this.setState(prevState => ({ 
                    sessao: { ...prevState.sessao, itens: updatedItens, matters: updatedItens, metadata: { ...prevState.sessao.metadata, matters: updatedItens, itens: updatedItens } },
                    isSyncing: false 
                }));
            } catch (error) {
                this.setState({ isSyncing: false });
                console.error("Erro ao sincronizar status final da votação:", error);
            }
        }
    }

    handleYieldTime = async () => {
        const { camaraId, sessao, selectedVereadorToYieldTo, parlamentares } = this.state;
        const currentMatters = sessao.matters || sessao.itens || [];
        if (!sessao || !selectedVereadorToYieldTo) return;

        const materiaEmDiscussaoIndex = currentMatters.findIndex(m => m.status === 'Em Discussão');
        if (materiaEmDiscussaoIndex === -1) {
            alert("Nenhuma matéria em discussão para ceder a vez.");
            return;
        }

        const yieldingSpeakerId = sessao.oradorAtual?.id || sessao.oradorAtual?.uid;

        const targetVereador = parlamentares.find(p => (p.id || p.uid) === selectedVereadorToYieldTo);

        if (!targetVereador) {
            alert("Vereador para ceder a vez não encontrado.");
            return;
        }

        const updatedItens = [...currentMatters];
        if (yieldingSpeakerId) {
            updatedItens[materiaEmDiscussaoIndex] = {
                ...updatedItens[materiaEmDiscussaoIndex],
                spokenBy: { ...updatedItens[materiaEmDiscussaoIndex].spokenBy, [yieldingSpeakerId]: true }
            };
        }

        this.setState({ isSyncing: true });
        const oradorData = { id: targetVereador.id, uid: targetVereador.id, nome: targetVereador.nome, tempo: 300, inicio: Date.now() };
        const newQueue = (sessao.filaDeInscritos || []).filter(s => (s.id || s.uid) !== targetVereador.id);

        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                matters: updatedItens,
                oradorAtual: oradorData,
                filaDeInscritos: newQueue,
                metadata: { 
                    ...sessao.metadata, 
                    matters: updatedItens,
                    itens: updatedItens,
                    oradorAtual: oradorData,
                    filaDeInscritos: newQueue
                }
            });

            this.setState(prevState => ({
                sessao: { 
                    ...prevState.sessao, 
                    itens: updatedItens, 
                    matters: updatedItens,
                    oradorAtual: oradorData, 
                    filaDeInscritos: newQueue,
                    metadata: { 
                        ...prevState.sessao.metadata, 
                        matters: updatedItens,
                        itens: updatedItens,
                        oradorAtual: oradorData,
                        filaDeInscritos: newQueue
                    }
                },
                showYieldTimeModal: false,
                selectedVereadorToYieldTo: null,
                isSyncing: false
            }), () => {
                alert(`${sessao.oradorAtual?.nome || 'O orador anterior'} cedeu a vez para ${targetVereador.nome}.`);
            });
        } catch (error) {
            this.setState({ isSyncing: false });
            console.error("Erro ao ceder a vez:", error);
            alert("Erro ao ceder a vez.");
        }
    };

    handleGrantWord = async (speaker) => {
        const { camaraId, sessao, parlamentares } = this.state;
        if (!sessao) return;
        const speakerId = speaker.id || speaker.uid;
        const nome = speaker.nome || speaker.name || parlamentares.find(p => (p.id || p.uid) === speakerId)?.nome || 'Parlamentar';
        const oradorData = { id: speakerId, uid: speakerId, nome: nome, tempo: 300, inicio: Date.now() };
        const newQueue = (sessao.filaDeInscritos || []).filter(s => (s.id || s.uid) !== speakerId);
        
        this.setState({ isSyncing: true });
        try {
            await api.patch(`/sessions/${sessao.id}`, { 
                oradorAtual: oradorData, 
                filaDeInscritos: newQueue,
                metadata: { ...sessao.metadata, oradorAtual: oradorData, filaDeInscritos: newQueue }
            });
            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, oradorAtual: oradorData, filaDeInscritos: newQueue, metadata: { ...prevState.sessao.metadata, oradorAtual: oradorData, filaDeInscritos: newQueue } },
                isSyncing: false 
            }));
        } catch (error) {
            this.setState({ isSyncing: false });
            console.error("Erro ao conceder palavra:", error);
        }
    };

    handleAddTime = async () => {
        const { camaraId, sessao } = this.state;
        if (sessao.oradorAtual) {
            const newTime = (sessao.oradorAtual.tempo || 0) + 60;
            const updatedOrador = { ...sessao.oradorAtual, tempo: newTime };
            try {
                await api.patch(`/sessions/${sessao.id}`, { 
                    oradorAtual: updatedOrador,
                    metadata: { ...sessao.metadata, oradorAtual: updatedOrador }
                });
                this.setState(prevState => ({ 
                    sessao: { ...prevState.sessao, oradorAtual: updatedOrador, metadata: { ...prevState.sessao.metadata, oradorAtual: updatedOrador } } 
                }));
            } catch (error) {
                console.error("Erro ao adicionar tempo:", error);
            }
        }
    };

    handleRemoveSpeaker = async (speakerUid) => {
        const { camaraId, sessao } = this.state;
        const newQueue = (sessao.filaDeInscritos || []).filter(s => (s.id || s.uid) !== speakerUid);
        const updates = { filaDeInscritos: newQueue };
        if (sessao.oradorAtual && (sessao.oradorAtual.id || sessao.oradorAtual.uid) === speakerUid) updates.oradorAtual = null;
        
        this.setState({ isSyncing: true });
        try {
            await api.patch(`/sessions/${sessao.id}`, {
                ...updates,
                metadata: { ...sessao.metadata, ...updates }
            });
            this.setState(prevState => ({ 
                sessao: { ...prevState.sessao, ...updates, metadata: { ...prevState.sessao.metadata, ...updates } },
                isSyncing: false 
            }));
        } catch (error) {
            this.setState({ isSyncing: false });
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

        const isAdmin = userRole === 'presidente' || userRole === 'admin' || userRole === 'superadmin' || this.state.user?.cargo?.toLowerCase().includes('presidente');
        const materias = sessao.itens || [];
        const presenca = sessao.presenca || {};
        const filaDeInscritos = sessao.filaDeInscritos || [];
        const materiaEmDiscussao = materias.find(m => m.status === 'Em Discussão');
        const materiaEmVotacao = materias.find(m => m.status === 'Em Votação');
        const oradorId = sessao.oradorAtual?.id || sessao.oradorAtual?.uid;
        const userId = user?.id || user?.uid;

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
                            <h2 style={{ margin: 0, color: '#126B5E' }}>{sessao.tipo}</h2>
                            <Typography variant="subtitle1" gutterBottom style={{ margin: '5px 0 0 0', color: '#666', textAlign: 'left', fontSize: '14px' }}>
                                <b>Data:</b> {sessao.data} | <b>Formato:</b> {sessao.formato} | <b>Legislatura:</b> {sessao.legislatura}ª | <b>Status:</b> {sessao.status}
                            </Typography>
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
                                {parlamentares.map((p, idx) => (
                                    <div key={p.id || `p-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Avatar 
                                                src={p.foto || p.avatar || p.photoURL} 
                                                alt={p.nome} 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    fontSize: '0.8rem',
                                                    border: presenca[p.id] ? '2px solid #4caf50' : '2px solid #ccc'
                                                }}
                                            >
                                                {p.nome?.charAt(0)}
                                            </Avatar>
                                            <span style={{ 
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: '10px', 
                                                height: '10px', 
                                                borderRadius: '50%', 
                                                background: presenca[p.id] ? '#4caf50' : '#ccc', 
                                                border: '2px solid white',
                                                boxShadow: presenca[p.id] ? '0 0 5px #4caf50' : 'none' 
                                            }}></span>
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: presenca[p.id] ? '600' : '400', opacity: presenca[p.id] ? 1 : 0.6 }}>{p.nome}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={this.handleRegisterPresence} disabled={presenca[user?.id]}>
                                <FaUserCheck /> {presenca[user?.id] ? 'Presença OK' : 'Marcar Presença'}
                            </button>
                        </div>

                        <div className='admin-card' style={{ height: '40%' }}>
                            <div className='admin-card-title'><FaListUl /> Fila de Oradores</div>
                            <div className='admin-scroll-area'>
                                {filaDeInscritos.length > 0 ? (
                                    filaDeInscritos.map((speaker, index) => (
                                        <div key={speaker.id || speaker.uid || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                                            <span style={{ fontSize: '0.85rem' }}>{index + 1}. {speaker.nome}</span>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button className="btn-success" onClick={() => this.handleGrantWord(speaker)} style={{ padding: '4px 8px' }}><FaMicrophone size={12} /></button>
                                                    <button className="btn-danger" onClick={() => this.handleRemoveSpeaker(speaker.id || speaker.uid)} style={{ padding: '4px 8px' }}><FaTrash size={12} /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '10px' }}>Ninguém na fila.</p>}
                            </div>
                            <button className="btn-secondary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={this.handleRequestToSpeak}><FaPlus /> Solicitar Palavra</button>
                            {materiaEmDiscussao && (userId === oradorId || isAdmin) && (
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
                                {selectedMateria.loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                                ) : (
                                    <>
                                        <p><strong>Autor:</strong> {selectedMateria.autor}</p>
                                        <p><strong>Tipo:</strong> {selectedMateria.tipoMateria}</p>
                                        <p><strong>Ementa:</strong> {selectedMateria.ementa}</p>
                                        <div dangerouslySetInnerHTML={{ __html: selectedMateria.textoMateria }} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Ceder Tempo */}
                {showYieldTimeModal && (
                    <div className="modal-overlay" onClick={this.handleCloseYieldTimeModal}>
                        <div className="admin-card modal-content" style={{ maxWidth: '400px', pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div className='admin-card-title'>Ceder a Vez</div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ fontSize: '0.85rem', marginBottom: '15px', color: '#666' }}>Selecione o parlamentar para quem deseja ceder a palavra:</p>
                                <select 
                                    className="modal-input" 
                                    value={selectedVereadorToYieldTo || ''} 
                                    onChange={(e) => this.setState({ selectedVereadorToYieldTo: e.target.value })}
                                    style={{ marginBottom: '20px', fontSize: '0.9rem' }}
                                >
                                    <option value="">Selecione um parlamentar...</option>
                                    {parlamentares.filter(p => (p.id || p.uid) !== userId).map(p => (
                                        <option key={p.id || p.uid} value={p.id || p.uid}>{p.nome}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={this.handleCloseYieldTimeModal}>Cancelar</button>
                                    <button className="btn-primary" style={{ fontSize: '0.8rem' }} onClick={this.handleYieldTime} disabled={!selectedVereadorToYieldTo}>Confirmar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default SessaoPlenariaRestrita;