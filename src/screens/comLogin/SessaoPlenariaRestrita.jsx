import React, { Component } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FaFileAlt, FaUserCheck, FaMicrophone, FaVoteYea, FaPlus, FaTrash, FaDesktop, FaUsers, FaClock, FaListUl } from "react-icons/fa";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip'; 
import MenuDashboard from '../../componets/menuAdmin.jsx';
import HistoricoSessao from '../../componets/HistoricoSessao.jsx';
import { db, auth } from '../../firebaseConfig';
import { ref, get, onValue, update, set } from 'firebase/database';
import '../../styles/FuturisticPanel.css';

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
      currentTime: new Date()
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

  handleSetMateriaEmVotacao = async (index) => {
    const { camaraId, sessao } = this.state;
    if (!sessao || !sessao.itens || index === undefined) return;
    
    const updates = {};
    // Garantir que apenas UMA matéria esteja "Em Votação" por vez
    sessao.itens.forEach((m, idx) => {
       if (m.status === 'Em Votação') {
           updates[`${camaraId}/sessoes/${sessao.id}/itens/${idx}/status`] = 'Encerrada';
       }
    });
    updates[`${camaraId}/sessoes/${sessao.id}/itens/${index}/status`] = 'Em Votação';
    await update(ref(db), updates);
  };

  handleVote = async (index, voto) => {
    const { camaraId, sessao, user } = this.state;
    if (!sessao || !sessao.itens[index] || !user) return;
    const voteRef = ref(db, `${camaraId}/sessoes/${sessao.id}/itens/${index}/votos/${user.uid}`);
    await set(voteRef, { voto, nome: user.displayName, timestamp: new Date().toISOString() });
  };

  checkTimeLimit = () => {
    const { sessao, userRole } = this.state;
    if (sessao?.oradorAtual && userRole === 'presidente') {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - sessao.oradorAtual.inicio) / 1000);
        const timeLeft = sessao.oradorAtual.tempo - elapsedSeconds;
        if (timeLeft <= 0) this.handleRemoveSpeaker(sessao.oradorAtual.uid);
    }
  };

  formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  checkAllVotings = () => {
    const { camaraId, sessao } = this.state;
    if (!sessao || !sessao.itens) return;
    const presenca = sessao.presenca || {};
    const totalPresentes = Object.keys(presenca).length;
    if (totalPresentes === 0) return; 

    sessao.itens.forEach((materia, index) => {
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
                const materiaStatusRef = ref(db, `${camaraId}/sessoes/${sessao.id}/itens/${index}/status`);
                set(materiaStatusRef, newStatus);
            }
        }
    });
  }

  handleGrantWord = async (speaker) => {
    const { camaraId, sessao } = this.state; 
    if (!sessao) return;
    const nome = speaker.nome || speaker.name || this.state.parlamentares.find(p => p.id === speaker.uid)?.nome || 'Parlamentar';
    const oradorData = { uid: speaker.uid, nome: nome, tempo: 300, inicio: Date.now() };
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
      case 'Aprovada': className += 'status-aprovada'; break;
      case 'Rejeitada': className += 'status-rejeitada'; break;
      default: className += 'status-default';
    }
    return <span className={className}>{status || 'Tramitando'}</span>;
  };

  render() {
    const { sessao, loading, showMateriaModal, selectedMateria, user, userRole, parlamentares, currentTime } = this.state;

    if (loading) return <div className='admin-dashboard-container' style={{justifyContent: 'center', alignItems: 'center'}}><p>Carregando Painel de Controle...</p></div>;
    if (!sessao) return <div className='admin-dashboard-container' style={{justifyContent: 'center', alignItems: 'center'}}><p>Sessão não encontrada.</p></div>;

    const materias = sessao.itens || [];
    const presenca = sessao.presenca || {};
    const filaDeInscritos = sessao.filaDeInscritos || [];
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
                   <h2 style={{margin: 0, color: '#126B5E'}}>{sessao.tipo} nº {sessao.numero} <span style={{fontSize: '0.9rem', color: '#666', fontWeight: 'normal'}}>| Versão Dashboard Admin</span></h2>
                </div>
                <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                    <div style={{textAlign: 'right'}}>
                        <div style={{fontWeight: 'bold'}}>{currentTime.toLocaleDateString('pt-BR')}</div>
                        <div style={{color: '#126B5E'}}><FaClock /> {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <button className="btn-secondary" style={{ background: '#00695c', color: 'white', borderRadius: '8px' }} onClick={() => window.open(`/admin/painel-sessao/${this.state.camaraId}/${sessao.id}`, '_blank')}>
                        <FaDesktop /> Abrir Painel LED
                    </button>
                </div>
            </header>

            {/* Coluna 1: Participantes e Fila */}
            <aside style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div className='admin-card' style={{flex: 1}}>
                    <div className='admin-card-title'><FaUsers /> Parlamentares ({Object.keys(presenca).length}/{parlamentares.length})</div>
                    <div className='admin-scroll-area'>
                        {parlamentares.map(p => (
                            <div key={p.id} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f9f9f9'}}>
                                <span style={{width: '8px', height: '8px', borderRadius: '50%', background: presenca[p.id] ? '#4caf50' : '#ccc', boxShadow: presenca[p.id] ? '0 0 5px #4caf50' : 'none'}}></span>
                                <span style={{fontSize: '0.9rem', opacity: presenca[p.id] ? 1 : 0.6}}>{p.nome}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" style={{marginTop: '10px', fontSize: '0.8rem'}} onClick={this.handleRegisterPresence} disabled={presenca[user?.uid]}>
                        <FaUserCheck /> {presenca[user?.uid] ? 'Presença OK' : 'Marcar Presença'}
                    </button>
                </div>

                <div className='admin-card' style={{height: '40%'}}>
                    <div className='admin-card-title'><FaListUl /> Fila de Oradores</div>
                    <div className='admin-scroll-area'>
                        {filaDeInscritos.length > 0 ? (
                            filaDeInscritos.map((speaker, index) => (
                                <div key={speaker.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                                    <span style={{ fontSize: '0.85rem' }}>{index + 1}. {speaker.nome}</span>
                                    {userRole === 'presidente' && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button className="btn-success" onClick={() => this.handleGrantWord(speaker)} style={{ padding: '4px 8px' }}><FaMicrophone size={12}/></button>
                                            <button className="btn-danger" onClick={() => this.handleRemoveSpeaker(speaker.uid)} style={{ padding: '4px 8px' }}><FaTrash size={12}/></button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : <p style={{fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '10px'}}>Ninguém na fila.</p>}
                    </div>
                    <button className="btn-secondary" style={{marginTop: '10px', fontSize: '0.8rem'}} onClick={this.handleRequestToSpeak}><FaPlus /> Solicitar Palavra</button>
                </div>
            </aside>

            {/* Coluna 2: Video e Orador Ativo */}
            <section style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div className='admin-card' style={{flex: 1, padding: 0, position: 'relative'}}>
                     <JitsiMeeting
                        roomName={jitsiRoomName}
                        configOverwrite={{ startWithAudioMuted: true, disableModeratorIndicator: true, startScreenSharing: false }}
                        getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; iframeRef.style.width = '100%'; iframeRef.style.borderRadius = '12px'; }}
                    />
                </div>

                <div className='admin-card' style={{height: '200px', background: sessao.oradorAtual ? '#fffde7' : '#fff'}}>
                    <div className='admin-card-title'><FaMicrophone /> Orador na Tribuna</div>
                    {sessao.oradorAtual ? (
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%'}}>
                            <div style={{flex: 1}}>
                                <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>{sessao.oradorAtual.nome}</div>
                                {userRole === 'presidente' && (
                                    <button className="btn-secondary" onClick={this.handleAddTime} style={{marginTop: '10px', fontSize: '0.8rem'}}><FaPlus /> Adicionar 1 Min</button>
                                )}
                            </div>
                            <div style={{fontSize: '3.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: timeLeft < 30 ? '#d32f2f' : '#126B5E'}}>
                                {this.formatCountdown(timeLeft)}
                            </div>
                        </div>
                    ) : (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.3}}>Tribuna Livre</div>
                    )}
                </div>
            </section>

            {/* Coluna 3: Materias e Votos */}
            <aside style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div className='admin-card' style={{flex: 1}}>
                    <div className='admin-card-title'><FaFileAlt /> Pauta e Matérias</div>
                    <div className='admin-scroll-area'>
                        {materias.map((materia, index) => (
                            <div key={materia.id || index} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{materia.tipoMateria} {materia.numero}</span>
                                    {this.renderStatusBadge(materia.status)}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', cursor: 'pointer' }} onClick={() => this.handleOpenMateriaModal(materia)}>{materia.ementa}</p>
                                
                                {userRole === 'presidente' && materia.status !== 'Em Votação' && materia.status !== 'Aprovada' && materia.status !== 'Rejeitada' && (
                                    <button className="btn-secondary" style={{width: '100%', marginTop: '8px', fontSize: '0.75rem'}} onClick={() => this.handleSetMateriaEmVotacao(index)}>Colocar em Votação</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='admin-card' style={{height: '35%', background: materiaEmVotacao ? '#e3f2fd' : '#fff'}}>
                    <div className='admin-card-title'><FaVoteYea /> Painel de Votos</div>
                    {materiaEmVotacao ? (
                        <>
                            <div style={{textAlign: 'center', marginBottom: '15px'}}>
                                <div style={{fontSize: '0.8rem', fontWeight: 'bold'}}>VOTANDO: {materiaEmVotacao.tipoMateria} {materiaEmVotacao.numero}</div>
                                <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px'}}>
                                    <div style={{color: '#2e7d32'}}>Sim: {Object.values(materiaEmVotacao.votos || {}).filter(v => v.voto === 'sim').length}</div>
                                    <div style={{color: '#c62828'}}>Não: {Object.values(materiaEmVotacao.votos || {}).filter(v => v.voto === 'nao').length}</div>
                                </div>
                            </div>
                            <div className='admin-btn-group'>
                                <button className="btn-success" onClick={() => this.handleVote(materias.indexOf(materiaEmVotacao), 'sim')}>SIM</button>
                                <button className="btn-danger" onClick={() => this.handleVote(materias.indexOf(materiaEmVotacao), 'nao')}>NÃO</button>
                                <button className="btn-secondary" onClick={() => this.handleVote(materias.indexOf(materiaEmVotacao), 'abstencao')} style={{gridColumn: '1/3'}}>ABSTENÇÃO</button>
                            </div>
                        </>
                    ) : <p style={{fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '10px'}}>Aguardando início de votação.</p>}
                </div>
            </aside>
        </div>

        {showMateriaModal && selectedMateria && (
            <div className="modal-overlay" onClick={this.handleCloseMateriaModal}>
                <div className="admin-card modal-content" style={{ maxWidth: '800px', pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
                    <div className='admin-card-title'>{selectedMateria.titulo}</div>
                    <div className='admin-scroll-area' style={{padding: '10px'}}>
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