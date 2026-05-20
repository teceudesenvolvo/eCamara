import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Tabela
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

//Imagens

// Icones
import {
  FaFileAlt, FaMicrophone, FaClock, FaCheckCircle, FaFilePdf, FaScroll, FaQuoteLeft, FaFileSignature, FaDownload, FaTimes, FaUsers, FaMapMarkerAlt
} from "react-icons/fa";
import { Box, Chip, CircularProgress } from '@mui/material';


// Components
import { normalizeSession } from '../../utils/sessionNormalizer';

import api from '../../services/api.js';

class SessaoVirtual extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilters: false,
      sessao: null,
      loading: true,
      camaraId: this.props.match.params.camaraId || 'camara-teste',
      selectedMateria: null,
      showMateriaModal: false,
      showFilePopup: false,
      fileUrl: null,
      activeTab: 'todas',
    };
  }

  componentDidMount() {
    this.fetchSessaoData();
    // Inicia polling para dados em tempo real
    this.pollingInterval = setInterval(this.fetchSessaoData, 3000);

    this.uiTimer = setInterval(() => {
      this.forceUpdate();
    }, 1000);
  }

  fetchSessaoData = async () => {
    const { camaraId } = this.state;
    const { state } = this.props.location;
    const sessaoId = state ? state.sessaoId : null;

    if (!sessaoId) {
      if (this.state.loading) this.setState({ loading: false });
      return;
    }

    try {
      const [sessionResponse, usersResponse] = await Promise.all([
        api.get(`/session-detail/${sessaoId}`),
        api.get(`/users/council/${camaraId}`)
      ]);

      const usersData = usersResponse.data || [];
      const usersMap = new Map(usersData.map(user => [user.id || user.uid, user]));

      const normalized = normalizeSession(Array.isArray(sessionResponse.data) ? sessionResponse.data[0] : sessionResponse.data);

      if (normalized) {
        // Enriquecer a lista de presença com dados atualizados dos usuários (fotos e nomes)
        const presencaRaw = normalized.presenca || {};
        const presencaArray = Array.isArray(presencaRaw) ? presencaRaw : Object.values(presencaRaw);

        normalized.presenca = presencaArray.map(p => {
          const userId = p.userId || p.id || p.uid;
          const userProfile = usersMap.get(userId);
          return {
            ...p,
            foto: userProfile?.foto || userProfile?.avatar || userProfile?.photoURL || p.foto || p.avatar || p.photoURL || 'https://via.placeholder.com/150',
            nome: userProfile?.name || p.nome || 'Parlamentar'
          };
        });

        this.setState({ sessao: normalized, loading: false });
      } else {
        if (this.state.loading) this.setState({ loading: false });
      }
    } catch (error) {
      console.error("Erro ao buscar dados da sessão:", error);
      if (this.state.loading) this.setState({ loading: false });
    }
  }

  componentWillUnmount() {
    if (this.uiTimer) clearInterval(this.uiTimer);
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  countVotes = (votos) => {
    const counts = { sim: 0, nao: 0, abstencao: 0 };
    if (!votos) return counts;
    Object.values(votos).forEach(v => {
      const vKey = v.voto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (counts.hasOwnProperty(vKey)) counts[vKey]++;
      else if (vKey?.includes('abs')) counts.abstencao++;
    });
    return counts;
  };

  formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  toggleFilters = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  };

  handleOpenMateriaModal = (materia) => {
    this.setState({ selectedMateria: materia, showMateriaModal: true });
  };

  handleCloseMateriaModal = () => {
    this.setState({ showMateriaModal: false, selectedMateria: null });
  };

  openFilePopup = (url) => {
    this.setState({ fileUrl: url, showFilePopup: true });
  };

  closeFilePopup = () => {
    this.setState({ showFilePopup: false, fileUrl: null });
  };

  render() {
    const { sessao, loading, showMateriaModal, selectedMateria, user, userRole, activeTab } = this.state;

    if (loading) {
      return <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex' }}><p>Carregando sessão...</p></div>;
    }

    if (!sessao) {
      return <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex' }}><p>Sessão não encontrada.</p></div>;
    }

    const materiasRaw = sessao.matters || sessao.itens || [];
    const allMaterias = Array.isArray(materiasRaw) ? materiasRaw : Object.values(materiasRaw);

    // Extração dinâmica dos tipos de matérias presentes nesta sessão para as abas
    const uniqueMatterTypes = ['todas', ...new Set(allMaterias.map(m => m.tipoMateria).filter(Boolean))].sort();

    const materias = activeTab === 'todas'
      ? allMaterias
      : allMaterias.filter(m => (m.tipoMateria || '').toLowerCase() === activeTab.toLowerCase());

    const presencaRaw = sessao.presenca || [];
    const presenca = (Array.isArray(presencaRaw) ? presencaRaw : Object.values(presencaRaw)).map(p => ({
        ...p,
        foto: p.foto || p.avatar || p.photoURL || 'https://via.placeholder.com/150'
    }));

    return (
      <div className='App-header-modern'>
        <div className='home-content-wrapper'>
          <div className='sv-page-wrapper'>
            
            {/* ── HEADER APPLE STYLE ── */}
            <header className='sv-hero-header'>
              <div className='sv-meta-pills'>
                <span className={`sv-pill ${sessao.status === 'Aberta' ? 'sv-pill-live' : sessao.status === 'Encerrada' ? 'sv-pill-closed' : ''}`}>
                  {sessao.status === 'Aberta' && <span className='sv-live-dot'></span>}
                  {sessao.status}
                </span>
                <span className='sv-pill'><FaClock /> {sessao.data}</span>
                <span className='sv-pill'>{sessao.formato}</span>
                <span className='sv-pill'>{sessao.legislatura}ª Legislatura</span>
                {sessao.tipoSessao && <span className='sv-pill'>{sessao.tipoSessao}</span>}
                {sessao.metadata?.local && <span className='sv-pill'><FaMapMarkerAlt /> {sessao.metadata.local}</span>}
                
              </div>
              <h1 className='sv-title'>{sessao.tipo} nº {sessao.numero || 'S/N'}</h1>
            </header>

            {/* ── VIDEO HERO ── */}
            <section className='sv-video-hero'>
              <div className='sv-player-ratio'>
                <ReactPlayer 
                  className='react-player' 
                  url={sessao.urlTransmissao || sessao.transmissaoUrl || 'https://www.youtube.com/watch?v=PDtvNjcgqdI'} 
                  width='100%' 
                  height='100%' 
                  controls={true} 
                  playsinline={true}
                />
              </div>
            </section>

            {/* ── ACTION BAR (Apple-style Quick Actions) ── */}
            {(sessao.editalPath || sessao.ataHtml || sessao.storagePath) && (
              <div className='sv-action-bar glass-card'>
                <div className='sv-action-label'>
                   <FaScroll /> Documentos Oficiais
                </div>
                <div className='sv-action-buttons'>
                  {sessao.editalPath && (
                    <button className='sv-btn-action' onClick={() => this.openFilePopup(sessao.editalPath)}>
                      <FaFilePdf /> Edital
                    </button>
                  )}
                  {sessao.ataHtml && (
                    <button className='sv-btn-action' onClick={() => this.scrollToSection('ata-sessao')}>
                      <FaFileSignature /> Ata da Sessão
                    </button>
                  )}
                  {sessao.storagePath && (
                    <button className='sv-btn-action' onClick={() => this.openFilePopup(sessao.storagePath)}>
                      <FaDownload /> Gravação
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── TRIBUNA VIRTUAL ── */}
            {sessao.oradorAtual && (
              <div className='sv-tribuna-bar'>
                <div className='sv-tribuna-icon'><FaMicrophone /></div>
                <div className='sv-tribuna-info'>
                  <span className='sv-tribuna-label'>Orador na Tribuna</span>
                  <span className='sv-tribuna-name'>{sessao.oradorAtual.nome}</span>
                </div>
                <div className='sv-tribuna-timer'>
                    {(() => {
                      const now = Date.now();
                      const elapsedSeconds = Math.floor((now - sessao.oradorAtual.inicio) / 1000);
                      const timeLeft = Math.max(0, sessao.oradorAtual.tempo - elapsedSeconds);
                      return this.formatCountdown(timeLeft);
                    })()}
                </div>
              </div>
            )}

            {/* ── GRID DE CONTEÚDO ── */}
            <div className='sv-bottom-grid'>
              
              {/* Coluna Esquerda – Presença (Estilo Matérias) */}
              <aside className='sv-col-presenca'>
                <h2 className='sv-section-title'>
                  <FaUsers /> Vereadores Presentes
                  <span className='sv-count-badge'>{presenca.length}</span>
                </h2>
                {presenca.length === 0 ? (
                  <div className='sv-empty-state'>Nenhum vereador identificado.</div>
                ) : (
                  <div className='sv-presence-vertical-list no-hover-container'>
                    {presenca.map((parlamentar, idx) => (
                      <div key={parlamentar.uid || parlamentar.id || idx} className='sv-presence-card glass-card'>
                        <div className='sv-avatar-ring' style={{ width: '40px', height: '40px' }}>
                          <img src={parlamentar.foto || 'https://via.placeholder.com/150'} alt={parlamentar.nome} />
                        </div>
                        <div className='sv-presence-info'>
                          <span className='sv-presence-name'>{parlamentar.nome}</span>
                          <span className='sv-presence-role'>{parlamentar.partido || parlamentar.cargo || 'Vereador(a)'}</span>
                        </div>
                        <span className='sv-status-badge sv-badge-ok'>Conectado</span>
                      </div>
                    ))}
                  </div>
                )}
              </aside>

              {/* Coluna Direita – Matérias em Pauta */}
              <main className='sv-col-materias'>
              <h2 className='sv-section-title'>
                Matérias em Pauta
                <span className='sv-count-badge'>{allMaterias.length}</span>
              </h2>

              {/* Filtro por Abas (Scrollable no Mobile) */}
              {allMaterias.length > 0 && uniqueMatterTypes.length > 2 && (
                <div style={{ 
                  display: 'flex', 
                  background: 'rgba(255, 255, 255, 0.4)', 
                  borderRadius: '30px', 
                  padding: '5px', 
                  backdropFilter: 'blur(20px)', 
                  border: '1px solid rgba(255,255,255,0.6)', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                  overflowX: 'auto',
                  maxWidth: '100%',
                  marginBottom: '20px',
                  scrollbarWidth: 'none'
                }}>
                  {uniqueMatterTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => this.setState({ activeTab: type })}
                      style={{
                        background: activeTab === type ? '#fff' : 'transparent',
                        color: activeTab === type ? '#1a1a1a' : '#555',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '10px 20px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: activeTab === type ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {type === 'todas' ? 'Todas' : type}
                    </button>
                  ))}
                </div>
              )}

              {materias.length === 0 ? (
                <div className='sv-empty-state'>Nenhuma matéria em pauta.</div>
              ) : (
                <div className='sv-materias-list no-hover-container'>
                  {materias.map((materia, index) => {
                    const voteCounts = this.countVotes(materia.votos);
                    return (
                      <div
                        className='sv-materia-card glass-card'
                        key={materia.id || index}
                        onClick={() => this.handleOpenMateriaModal(materia)}
                      >
                        <div className='sv-materia-top'>
                          <div className='sv-materia-id'>
                            <FaFileAlt color='#126B5E' />
                            <span>{materia.tipoMateria} {materia.numero}/{materia.ano}</span>
                          </div>
                          <span className={`sv-status-badge ${materia.status === 'Em Votação' ? 'sv-badge-warn' : materia.status === 'Aprovada' ? 'sv-badge-ok' : 'sv-badge-neutral'}`}>
                            {materia.status || 'Pautada'}
                          </span>
                        </div>
                        <p className='sv-materia-ementa'>{materia.ementa || materia.titulo}</p>
                        <div className='sv-materia-meta'>
                          <span>{materia.autor}</span>
                          <span>·</span>
                          <span>{materia.regTramita}</span>
                        </div>
                        <div className='sv-vote-row'>
                          <div className='sv-vote-item sv-vote-sim'>
                            <span className='vote-circle vote-sim-circle'>{voteCounts.sim}</span>
                            <span>Sim</span>
                          </div>
                          <div className='sv-vote-item sv-vote-nao'>
                            <span className='vote-circle vote-nao-circle'>{voteCounts.nao}</span>
                            <span>Não</span>
                          </div>
                          <div className='sv-vote-item sv-vote-abs'>
                            <span className='vote-circle vote-abs-circle'>{voteCounts.abstencao}</span>
                            <span>Abst.</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </main>
            </div>

            {/* ── DOCUMENTAÇÃO DETALHADA ── */}
            <div className='sv-documentation-grid'>
              {sessao.ataHtml && (
                <section id='ata-sessao' className='sv-content-card glass-card'>
                  <div className='sv-card-header'>
                    <h2 className='sv-section-title'><FaFileSignature /> Ata da Sessão</h2>
                    <span className='sv-pill'>Consolidada</span>
                  </div>
                  <div className='sv-html-content' dangerouslySetInnerHTML={{ __html: sessao.ataHtml }} />
                </section>
              )}

              {sessao.transcription && (
                <section className='sv-content-card glass-card'>
                  <div className='sv-card-header'>
                    <h2 className='sv-section-title'><FaQuoteLeft /> Transcrição (IA)</h2>
                    <span className='sv-pill'>Automatizada</span>
                  </div>
                  <div className='sv-text-content'>
                    {sessao.transcription}
                  </div>
                </section>
              )}
            </div>

          </div>
        </div>

        {/* ── MODAL DE MATÉRIA ─────────────────────────────────────── */}
        {showMateriaModal && selectedMateria && (
          <div className='modal-overlay' style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <div className='modal-content' style={{ maxWidth: '700px', width: '90%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px) saturate(200%)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.9)', padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 28px 0' }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#126B5E' }}>
                    {selectedMateria.tipoMateria} {selectedMateria.numero}
                  </p>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1a1a1a', fontWeight: 700, lineHeight: 1.3 }}>{selectedMateria.titulo || selectedMateria.ementa}</h2>
                </div>
                <button onClick={this.handleCloseMateriaModal} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#555', flexShrink: 0, marginLeft: '15px' }}>×</button>
              </div>
              <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px 28px 28px' }}>
                <>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <span style={{ background: 'rgba(18,107,94,0.08)', color: '#126B5E', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>{selectedMateria.autor}</span>
                    <span style={{ background: 'rgba(0,0,0,0.05)', color: '#555', fontWeight: 600, padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>{selectedMateria.regTramita}</span>
                  </div>
                  <div style={{ background: 'rgba(18,107,94,0.04)', borderLeft: '4px solid #126B5E', borderRadius: '0 12px 12px 0', padding: '16px', marginBottom: '20px' }}>
                    <p style={{ margin: 0, fontStyle: 'italic', color: '#333', lineHeight: 1.6 }}>"{selectedMateria.ementa}"</p>
                  </div>
                  {selectedMateria.textoMateria && (
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                      <h4 style={{ margin: '0 0 12px', color: '#1a1a1a', fontWeight: 700 }}>Texto da Matéria</h4>
                      <div style={{ lineHeight: 1.7, color: '#444', fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: selectedMateria.textoMateria }} />
                    </div>
                  )}
                </>
              </div>
            </div>
          </div>
        )}

        {/* ── POPUP DE DOCUMENTOS ─────────────────────────────────── */}
        {this.state.showFilePopup && this.state.fileUrl && (
          <div className="pdf-popup-overlay" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <div className="pdf-popup-content" style={{ width: '90%', height: '90%', maxWidth: '1100px', padding: 0, overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <button className="pdf-popup-close-button" onClick={this.closeFilePopup} style={{ zIndex: 10001 }}>
                <FaTimes />
              </button>
              <iframe
                title="Visualizador de Arquivo"
                src={this.state.fileUrl}
                width="100%"
                height="100%"
                frameBorder="0"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SessaoVirtual;