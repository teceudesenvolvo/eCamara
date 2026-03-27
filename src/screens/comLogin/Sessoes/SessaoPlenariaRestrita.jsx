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
import { db, auth } from '../../../firebaseConfig';
import { ref, get, onValue, update, set } from 'firebase/database';
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
        this.unsubscribeAuth = auth.onAuthStateChanged(user => {
            this.setState({ user });
            if (user) {
                this.fetchUserRole(user.uid);
            } else {
                this.props.history.push(`/login/${this.state.camaraId}`);
            }
            this.fetchParlamentares();
            this.fetchSessaoData();
        });

        this.uiTimer = setInterval(() => {
            this.setState({ currentTime: new Date() });
            this.checkTimeLimit();
        }, 1000);
    }

    componentWillUnmount() {
        if (this.unsubscribeAuth) this.unsubscribeAuth();
        if (this.uiTimer) clearInterval(this.uiTimer);
        if (this.sessaoUnsubscribe) this.sessaoUnsubscribe();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.sessao && prevState.sessao && JSON.stringify(prevState.sessao.itens) !== JSON.stringify(this.state.sessao.itens)) {
            this.checkAllVotings();
        }
    }

    fetchUserRole = async (uid) => {
        const { camaraId } = this.state;
        const userRef = ref(db, `${camaraId}/users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            this.setState({ userRole: snapshot.val().tipo?.toLowerCase() });
        }
    }

    fetchParlamentares = async () => {
        const { camaraId } = this.state;
        const usersRef = ref(db, `${camaraId}/users`);
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const allUsers = [];
            snapshot.forEach(child => {
                allUsers.push({ id: child.key, ...child.val() });
            });
            const parlamentares = allUsers.filter(u => u.tipo === 'vereador' || u.tipo === 'presidente');
            this.setState({ parlamentares });
        }
    }

    fetchSessaoData = async () => {
        const { camaraId } = this.state;
        const { state } = this.props.location;
        const sessaoId = state ? state.sessaoId : (this.props.match.params.sessaoId || null);

        if (!sessaoId) {
            this.setState({ loading: false });
            return;
        }

        const sessaoRef = ref(db, `${camaraId}/sessoes/${sessaoId}`);
        this.sessaoUnsubscribe = onValue(sessaoRef, (snapshot) => {
            if (snapshot.exists()) {
                this.setState({ sessao: { id: snapshot.key, ...snapshot.val() }, loading: false });
            } else {
                this.setState({ loading: false });
            }
        });
    }

    handleOpenMateriaModal = (materia) => {
        this.setState({ selectedMateria: materia, showMateriaModal: true });
    };

    handleCloseMateriaModal = () => {
        this.setState({ showMateriaModal: false, selectedMateria: null });
    };

    handleRegisterPresence = async () => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !user) return;
        const presenceRef = ref(db, `${camaraId}/sessoes/${sessao.id}/presenca/${user.uid}`);
        try {
            await set(presenceRef, { nome: user.displayName, presente: true, timestamp: new Date().toISOString() });
        } catch (error) {
            console.error("Erro ao registrar presença:", error);
        }
    };

    handleRequestToSpeak = async () => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !user) return;
        const speakerQueueRef = ref(db, `${camaraId}/sessoes/${sessao.id}/filaDeInscritos`);
        const snapshot = await get(speakerQueueRef);
        const currentQueue = snapshot.val() || [];
        if (currentQueue.some(speaker => speaker.uid === user.uid)) return;
        const parlamentar = this.state.parlamentares.find(p => p.id === user.uid);
        const nome = parlamentar?.nome || user.displayName || 'Parlamentar';
        const newQueue = [...currentQueue, { uid: user.uid, nome: nome, timestamp: new Date().toISOString() }];
        await set(speakerQueueRef, newQueue);
    };

    handleSetMateriaEmDiscussao = async (index) => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !sessao.itens || index === undefined) return;

        const materia = sessao.itens[index];
        const updates = {};

        // 1. Encerrar qualquer matéria anterior que esteja "Em Discussão" ou "Em Votação"
        sessao.itens.forEach((m, idx) => {
            if (m.status === 'Em Discussão' || m.status === 'Em Votação') {
                updates[`/${camaraId}/sessoes/${sessao.id}/itens/${idx}/status`] = 'Encerrada Discussão/Votação'; // New status for clarity
                if (m.id) {
                    const path = m.isAcessorio ? `documentos_acessorios/${m.id}` : `materias/${m.id}`;
                    updates[`/${camaraId}/${path}/status`] = 'Encerrada Discussão/Votação';
                }
            }
        });

        // 2. Definir nova matéria "Em Discussão" no nível da sessão
        updates[`/${camaraId}/sessoes/${sessao.id}/itens/${index}/status`] = 'Em Discussão';
        updates[`/${camaraId}/sessoes/${sessao.id}/itens/${index}/spokenBy`] = {}; // Initialize spokenBy for this matter

        // 3. Sincronizar com o nó global de matérias
        if (materia.id) {
            const path = materia.isAcessorio ? `documentos_acessorios/${materia.id}` : `materias/${materia.id}`;
            updates[`/${camaraId}/${path}/status`] = 'Em Discussão';
            updates[`/${camaraId}/${path}/spokenBy`] = {};
            console.log(`Sincronizando status global para ${materia.isAcessorio ? 'acessório' : 'matéria'} ${materia.id}: Em Discussão`);
        }

        // 4. Limpar orador atual e fila de inscritos para a nova discussão
        updates[`${camaraId}/sessoes/${sessao.id}/oradorAtual`] = null;
        updates[`${camaraId}/sessoes/${sessao.id}/filaDeInscritos`] = [];

        await update(ref(db), updates);
    };

    handleSetMateriaEmVotacao = async (index) => {
        const { camaraId, sessao } = this.state;
        if (!sessao || !sessao.itens || index === undefined) return;

        const materia = sessao.itens[index];
        const updates = {};

        // 1. Encerrar matéria anterior que esteja "Em Votação" ou "Em Discussão"
        sessao.itens.forEach((m, idx) => {
            if (m.status === 'Em Votação' || m.status === 'Em Discussão') {
                updates[`/${camaraId}/sessoes/${sessao.id}/itens/${idx}/status`] = 'Encerrada';
                if (m.id) {
                    const path = m.isAcessorio ? `documentos_acessorios/${m.id}` : `materias/${m.id}`;
                    updates[`/${camaraId}/${path}/status`] = 'Encerrada';
                }
            }
        });

        // 2. Definir nova matéria "Em Votação" no nível da sessão
        updates[`/${camaraId}/sessoes/${sessao.id}/itens/${index}/status`] = 'Em Votação';

        // 3. Sincronizar com o nó global de matérias (para aparecer no materiasDash)
        if (materia.id) {
            const path = materia.isAcessorio ? `documentos_acessorios/${materia.id}` : `materias/${materia.id}`;
            updates[`/${camaraId}/${path}/status`] = 'Em Votação';
            console.log(`Sincronizando status global para ${materia.isAcessorio ? 'acessório' : 'matéria'} ${materia.id}: Em Votação`);
        }

        await update(ref(db), updates);
    };

    handleVote = async (index, voto) => {
        const { camaraId, sessao, user } = this.state;
        if (!sessao || !sessao.itens[index] || !user) return;
        const voteRef = ref(db, `/${camaraId}/sessoes/${sessao.id}/itens/${index}/votos/${user.uid}`);
        await set(voteRef, { voto, nome: user.displayName, timestamp: new Date().toISOString() });
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
                await update(ref(db, `/${camaraId}/sessoes/${sessao.id}`), { status: 'Encerrada' });
                alert("Sessão encerrada com sucesso.");
                // Opcional: Redirecionar para o dashboard da camara
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

        for (const [index, materia] of sessao.itens.entries()) { // Use for...of for async operations
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

                    const updates = {};
                    updates[`/${camaraId}/sessoes/${sessao.id}/itens/${index}/status`] = newStatus;
                    if (materia.id) {
                        const path = materia.isAcessorio ? `documentos_acessorios/${materia.id}` : `materias/${materia.id}`;
                        updates[`/${camaraId}/${path}/status`] = newStatus;
                        console.log(`Sincronizando status global final para ${materia.isAcessorio ? 'acessório' : 'matéria'} ${materia.id}: ${newStatus}`);
                    }
                    try {
                        await update(ref(db), updates);
                    } catch (error) {
                        console.error("Erro ao sincronizar status final:", error);
                    }
                }
            }
        }
    }

    handleYieldTime = async () => {
        const { camaraId, sessao, user, selectedVereadorToYieldTo, parlamentares, userRole } = this.state;
        if (!sessao || (!user && userRole !== 'presidente') || !selectedVereadorToYieldTo) return;

        const materiaEmDiscussao = sessao.itens.find(m => m.status === 'Em Discussão');
        if (!materiaEmDiscussao) {
            alert("Nenhuma matéria em discussão para ceder a vez.");
            return;
        }

        const yieldingSpeakerUid = sessao.oradorAtual?.uid; // The current speaker is yielding
        const targetVereador = parlamentares.find(p => p.id === selectedVereadorToYieldTo);

        if (!targetVereador) {
            alert("Vereador para ceder a vez não encontrado.");
            return;
        }

        const updates = {};

        // 1. Mark the yielding vereador as having spoken on this matter
        if (yieldingSpeakerUid) {
            updates[`/${camaraId}/sessoes/${sessao.id}/itens/${sessao.itens.indexOf(materiaEmDiscussao)}/spokenBy/${yieldingSpeakerUid}`] = true;
            if (materiaEmDiscussao.id) {
                const path = materiaEmDiscussao.isAcessorio ? `documentos_acessorios/${materiaEmDiscussao.id}` : `materias/${materiaEmDiscussao.id}`;
                updates[`/${camaraId}/${path}/spokenBy/${yieldingSpeakerUid}`] = true;
            }
        }

        // 2. Set the target vereador as the new current speaker with a fresh 5 minutes
        const oradorData = { uid: targetVereador.id, nome: targetVereador.nome, tempo: 300, inicio: Date.now() }; // 5 minutes
        updates[`${camaraId}/sessoes/${sessao.id}/oradorAtual`] = oradorData;

        // 3. Remove the target vereador from the queue if they were there
        const currentQueue = sessao.filaDeInscritos || [];
        updates[`${camaraId}/sessoes/${sessao.id}/filaDeInscritos`] = currentQueue.filter(s => s.uid !== targetVereador.id);

        try {
            await update(ref(db), updates);
            this.handleCloseYieldTimeModal();
            alert(`${sessao.oradorAtual?.nome || 'O orador anterior'} cedeu a vez para ${targetVereador.nome}.`);
        } catch (error) {
            console.error("Erro ao ceder a vez:", error);
            alert("Erro ao ceder a vez.");
        }
    };

    handleGrantWord = async (speaker) => {
        const { camaraId, sessao } = this.state;
        if (!sessao) return;
        const nome = speaker.nome || speaker.name || this.state.parlamentares.find(p => p.id === speaker.uid)?.nome || 'Parlamentar';
        const oradorData = { uid: speaker.uid, nome: nome, tempo: 300, inicio: Date.now() }; // 5 minutes
        const updates = {};
        updates[`${camaraId}/sessoes/${sessao.id}/oradorAtual`] = oradorData;
        const currentQueue = sessao.filaDeInscritos || [];
        updates[`${camaraId}/sessoes/${sessao.id}/filaDeInscritos`] = currentQueue.filter(s => s.uid !== speaker.uid);
        await update(ref(db), updates);
    };

    handleAddTime = async () => {
        const { camaraId, sessao } = this.state;
        if (sessao.oradorAtual) {
            const newTime = (sessao.oradorAtual.tempo || 0) + 60;
            await update(ref(db, `${camaraId}/sessoes/${sessao.id}/oradorAtual`), { tempo: newTime });
        }
    };

    handleRemoveSpeaker = async (speakerUid) => {
        const { camaraId, sessao } = this.state;
        const updates = {};
        const filaDeInscritos = sessao.filaDeInscritos || [];
        updates[`${camaraId}/sessoes/${sessao.id}/filaDeInscritos`] = filaDeInscritos.filter(s => s.uid !== speakerUid);
        if (sessao.oradorAtual && sessao.oradorAtual.uid === speakerUid) updates[`${camaraId}/sessoes/${sessao.id}/oradorAtual`] = null;
        await update(ref(db), updates);
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