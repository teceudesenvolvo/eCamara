import React, { Component } from 'react';
import { db, auth } from '../../../firebaseConfig';
import { ref, onValue, get } from 'firebase/database';
import { FaUsers, FaVoteYea, FaClock, FaDesktop, FaMicrophone, FaVideo, FaVideoSlash } from "react-icons/fa";
import '../../../styles/FuturisticPanel.css';

class PainelSessao extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessao: null,
      parlamentares: [],
      loading: true,
      camaraId: this.props.match.params.camaraId || 'camara-teste',
      sessaoId: this.props.match.params.sessaoId || null,
      currentTime: new Date(),
      showVideo: true
    };
  }

  componentDidMount() {
    this.fetchSessaoData();
    this.fetchParlamentares();

    this.timer = setInterval(() => {
      this.setState({ currentTime: new Date() });
      this.forceUpdate();
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    if (this.sessaoUnsubscribe) this.sessaoUnsubscribe();
  }

  toggleVideo = () => {
    this.setState(prevState => ({ showVideo: !prevState.showVideo }));
  };

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

  fetchSessaoData = () => {
    const { camaraId, sessaoId } = this.state;
    if (!sessaoId) return;

    const sessaoRef = ref(db, `${camaraId}/sessoes/${sessaoId}`);
    this.sessaoUnsubscribe = onValue(sessaoRef, (snapshot) => {
      if (snapshot.exists()) {
        this.setState({ sessao: { id: snapshot.key, ...snapshot.val() }, loading: false });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  render() {
    const { sessao, parlamentares, loading, currentTime, showVideo } = this.state;

    if (loading) return <div className='hud-container' style={{ justifyContent: 'center', alignItems: 'center' }}><p>Sincronizando Sistema HUD...</p></div>;
    if (!sessao) return <div className='hud-container' style={{ justifyContent: 'center', alignItems: 'center' }}><p>Sessão não disponível.</p></div>;

    const presenca = sessao.presenca || {};
    const materias = sessao.itens || [];
    const materiaAtiva = materias.find(m => m.status === 'Em Votação');
    const votos = materiaAtiva?.votos || {};

    const counts = { sim: 0, nao: 0, abstencao: 0 };
    Object.values(votos).forEach(v => {
      if (counts.hasOwnProperty(v.voto)) counts[v.voto]++;
    });

    let timeLeft = 0;
    if (sessao.oradorAtual) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - sessao.oradorAtual.inicio) / 1000);
      timeLeft = Math.max(0, sessao.oradorAtual.tempo - elapsedSeconds);
    }

    const videoId = this.getYouTubeID(sessao.transmissaoUrl);
    const containerBg = !videoId ? '#000' : (showVideo ? '#000' : '#0000ff'); // Azul Chroma-Key quando oculto

    return (
      <div className='hud-container' style={{ backgroundColor: containerBg }}>
        {/* Camada 1: Transmissão em Background */}
        <div 
          className='hud-video-bg' 
          style={{ 
            opacity: showVideo ? 1 : 0, 
            transition: 'opacity 0.5s ease', 
            pointerEvents: showVideo ? 'all' : 'none' 
          }}
        >
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&iv_load_policy=3&modestbranding=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : (
            <div style={{ height: '100%', width: '100%', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FaDesktop size={100} style={{ opacity: 0.1 }} />
            </div>
          )}
        </div>

        {/* Camada 2: Overlay HUD */}
        <div className='hud-overlay-content'>
          <header className='hud-widget hud-header'>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '10px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--neon-cyan)', textTransform: 'uppercase' }}>{sessao.tipo} Nº {sessao.numero}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Câmara Municipal - Painel Digital</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {sessao.oradorAtual ? (
                <>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--neon-pink)' }}>Orador: {sessao.oradorAtual.nome}</div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: timeLeft < 30 ? 'var(--neon-pink)' : '#fff', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                    {this.formatCountdown(timeLeft)}
                  </div>
                </>
              ) : <div style={{ opacity: 0.2 }}><FaMicrophone size={30} /></div>}
            </div>

            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentTime.toLocaleDateString('pt-BR')}</div>
                <div style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem' }}><FaClock /> {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              </div>
              <button 
                onClick={this.toggleVideo} 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', color: 'var(--neon-cyan)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
                title={showVideo ? "Ocultar Vídeo" : "Exibir Vídeo"}
              >
                {showVideo ? <FaVideoSlash size={16} /> : <FaVideo size={16} />}
              </button>
            </div>
          </header>

          {/* Widgets Laterais */}
          <aside className='hud-widget'>
            <div className='section-title' style={{ marginBottom: '10px' }}><FaUsers /> Parlamentares ({Object.keys(presenca).length}/{parlamentares.length})</div>
            <div className='presence-scroll' style={{ maxHeight: 'calc(100% - 30px)' }}>
              {parlamentares.map(p => (
                <div key={p.id} className={`parlamentar-row ${presenca[p.id] ? 'presente' : ''}`} style={{ padding: '8px 0' }}>
                  <div className={`led-indicator ${presenca[p.id] ? 'active' : ''}`} style={{ width: '8px', height: '8px' }}></div>
                  <div style={{ fontSize: '0.9rem' }}>{p.nome}</div>
                </div>
              ))}
            </div>
          </aside>

          <div /> {/* Espaço central vazio para o vídeo */}

          <aside className='hud-widget' style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className='section-title'><FaVoteYea /> Placar de Votação</div>
            <div className='vote-tally-box' style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className='tally-item sim' style={{ padding: '10px' }}><div className='tally-value' style={{ fontSize: '1.8rem' }}>{counts.sim}</div><div className='tally-label'>Sim</div></div>
              <div className='tally-item nao' style={{ padding: '10px' }}><div className='tally-value' style={{ fontSize: '1.8rem' }}>{counts.nao}</div><div className='tally-label'>Não</div></div>
              <div className='tally-item abs' style={{ padding: '10px' }}><div className='tally-value' style={{ fontSize: '1.8rem' }}>{counts.abstencao}</div><div className='tally-label'>Abs.</div></div>
            </div>

            <div className='voters-gallery'>
              {counts.sim > 0 && (
                <div className='voters-group'>
                  <div className='group-label' style={{ color: 'var(--neon-green)', fontSize: '0.7rem' }}>Sim</div>
                  <div className='photos-grid'>
                    {Object.keys(votos).filter(uid => votos[uid].voto === 'sim').map(uid => {
                      const p = parlamentares.find(parl => parl.id === uid);
                      return <img key={uid} src={p?.foto || 'https://via.placeholder.com/50'} title={p?.nome} className='voter-photo sim' style={{ width: '35px', height: '35px' }} />;
                    })}
                  </div>
                </div>
              )}
              {counts.nao > 0 && (
                <div className='voters-group'>
                  <div className='group-label' style={{ color: 'var(--neon-pink)', fontSize: '0.7rem' }}>Não</div>
                  <div className='photos-grid'>
                    {Object.keys(votos).filter(uid => votos[uid].voto === 'nao').map(uid => {
                      const p = parlamentares.find(parl => parl.id === uid);
                      return <img key={uid} src={p?.foto || 'https://via.placeholder.com/50'} title={p?.nome} className='voter-photo nao' style={{ width: '35px', height: '35px' }} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <footer className='hud-widget hud-footer'>
            {materiaAtiva ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className='matter-badge' style={{ padding: '8px 15px', fontSize: '0.9rem' }}>Votando</div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{materiaAtiva.tipoMateria} {materiaAtiva.numero}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{materiaAtiva.ementa}</div>
                  </div>
                </div>
                
                {/* QR Code para a matéria */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '8px' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/materia/' + this.state.camaraId + '/' + (materiaAtiva.id || ''))}`} 
                    alt="QR Code Matéria" 
                    style={{ width: '60px', height: '60px', border: '2px solid #fff' }}
                  />
                  <div style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>SCAN PARA LER</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', width: '100%' }}>Aguardando Pauta</div>
            )}
          </footer>
        </div>
      </div>
    );
  }
}

export default PainelSessao;
