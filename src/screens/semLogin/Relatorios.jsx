import React, { Component } from 'react';
import api from '../../services/api.js';
import { FaSpinner } from 'react-icons/fa';

class Relatorios extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      selectedSessionId: '',
      materials: [],
      loading: true,
      sessionsLoading: true,
      camaraId: this.props.match.params.camaraId || '',
    };
  }

  componentDidMount() {
    this.fetchSessions();
  }

  fetchSessions = async () => {
    const { camaraId } = this.state;
    if (!camaraId) {
      this.setState({ sessionsLoading: false, loading: false });
      return;
    }

    try {
      const response = await api.get(`/sessions/${camaraId}`);
      const sessions = response.data || [];
      this.setState({ 
        sessions: sessions.sort((a,b) => new Date(b.data) - new Date(a.data)), 
        sessionsLoading: false,
        loading: false 
      });
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
      this.setState({ sessionsLoading: false, loading: false });
    }
  };

  handleSessionChange = (e) => {
    const sessionId = e.target.value;
    this.setState({ selectedSessionId: sessionId, loading: true }, () => {
      if (sessionId) {
        this.fetchSessionDetails(sessionId);
      } else {
        this.setState({ materials: [], loading: false });
      }
    });
  };

  fetchSessionDetails = async (sessionId) => {
    try {
      const response = await api.get(`/session-detail/${sessionId}`);
      const session = response.data;
      if (session && session.itens) {
        const materials = Array.isArray(session.itens) ? session.itens : Object.values(session.itens);
        this.setState({ materials, loading: false });
      } else {
        this.setState({ materials: [], loading: false });
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da sessão:", error);
      this.setState({ materials: [], loading: false });
    }
  };

  render() {
    const { materials, sessions, selectedSessionId, loading, sessionsLoading } = this.state;
    const selectedSession = sessions.find(s => s.id === selectedSessionId);
    
    const aprovadas = materials.filter(m => m.status === 'Aprovada').length;
    const rejeitadas = materials.filter(m => m.status === 'Rejeitada').length;

    return (
      <div className='App-header-modern'>
        <div className='home-content-wrapper'>
          <div className="search-box-wrapper-openai" style={{ width: '100%', maxWidth: 'none', marginBottom: '40px', padding: '20px', borderRadius: '24px' }}>
            <div className='session-selector' style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <select value={selectedSessionId} onChange={this.handleSessionChange} disabled={sessionsLoading} style={{ flex: 1, minWidth: '300px', padding: '12px 20px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.7)', fontSize: '1rem', color: '#333', outline: 'none' }}>
                <option value="">{sessionsLoading ? 'Carregando sessões...' : 'Selecionar Sessão'}</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.tipo} nº {s.numero} ({new Date(s.data).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            {selectedSession && (
              <div className='status-indicators' style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '10px 20px', borderRadius: '12px' }}>
                <div className={`status-item ${selectedSession.status === 'Encerrada' ? 'gray' : 'green'}`} style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1a1a1a', width: 'auto', padding: '0 10px', borderRadius: '20px' }}>
                  {materials.length} Matérias
                </div>
                <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }}></div>
                <div className='status-text' style={{ fontWeight: 700, color: selectedSession.status === 'Encerrada' ? '#666' : '#2e7d32' }}>{selectedSession.status}</div>
                {selectedSession.status === 'Encerrada' && (
                  <>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }}></div>
                    <div className='status-text' style={{ color: '#2e7d32', fontWeight: 600 }}>{aprovadas} Aprovadas</div>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }}></div>
                    <div className='status-text' style={{ color: '#d32f2f', fontWeight: 600 }}>{rejeitadas} Rejeitadas</div>
                  </>
                )}
                <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }}></div>
                <div className='status-text' style={{ color: '#555' }}>{selectedSession.tipo}</div>
                <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }}></div>
                <div className='status-text' style={{ color: '#555' }}>{new Date(selectedSession.data).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          <div className='materials-section no-hover-container' style={{ minHeight: '400px', position: 'relative' }}>
            <h2 style={{ color: '#126B5E', borderBottom: '2px solid #126B5E', paddingBottom: '10px' }}>Matérias da Sessão</h2>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <FaSpinner className="animate-spin" size={40} color="#126B5E" />
              </div>
            ) : materials.length > 0 ? (
              materials.map((material, index) => {
                const votos = material.votos || {};
                // Normalização de string para garantir a contagem mesmo com acentos ou variações
                const getVotoNorm = (v) => v?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const sim = Object.values(votos).filter(v => getVotoNorm(v.voto) === 'sim').length;
                const nao = Object.values(votos).filter(v => getVotoNorm(v.voto) === 'nao').length;
                const abs = Object.values(votos).filter(v => getVotoNorm(v.voto)?.includes('abs')).length;

                return (
                  <div className='glass-card' key={material.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                    <div className='material-details' style={{ flex: '2', minWidth: '300px' }}>
                      <a href={`/materia/${this.state.camaraId}/${material.id}`} className='material-code' style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', display: 'block', marginBottom: '10px' }}>
                        {material.tipoMateria} {material.numero}/{material.ano}
                      </a>
                      <p className='material-description' style={{ color: '#555', lineHeight: '1.5', margin: 0 }}>
                        <strong style={{ color: '#333' }}>Ementa:</strong> {material.ementa}
                        <br />
                        <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600, marginTop: '5px', display: 'inline-block' }}>PROMOVENTE: {material.autor || material.tipoAutor || '-'}</span>
                      </p>
                    </div>

                    <div className='vote-summary' style={{ flex: '1', minWidth: '200px', background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
                      <p style={{ fontWeight: '700', color: '#126B5E', margin: '0 0 10px 0', fontSize: '0.95rem' }}>Resultado da Votação</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem', color: '#333' }}>
                        <span>Sim: <strong>{sim}</strong></span>
                        <span>Não: <strong>{nao}</strong></span>
                        <span>Abst: <strong>{abs}</strong></span>
                        <span>Total: <strong>{sim + nao + abs}</strong></span>
                      </div>
                    </div>

                    <div className='voting-results' style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                      <span
                        style={{
                          backgroundColor: material.status === 'Aprovada' ? 'rgba(76, 175, 80, 0.1)' : material.status === 'Rejeitada' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 160, 0, 0.1)',
                          color: material.status === 'Aprovada' ? '#2e7d32' : material.status === 'Rejeitada' ? '#d32f2f' : '#ff8f00',
                          border: `1px solid ${material.status === 'Aprovada' ? '#4caf50' : material.status === 'Rejeitada' ? '#f44336' : '#ffa000'}`,
                          padding: '8px 20px',
                          borderRadius: '20px',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                      >
                        {material.status || 'Pendente'}
                      </span>
                      <a href={`/materia/${this.state.camaraId}/${material.id}`} style={{ fontSize: '0.9rem', color: '#126B5E', fontWeight: 600, textDecoration: 'none' }}>
                        Ver detalhes
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: '#888', fontSize: '1.2rem', fontWeight: 500 }}>
                {selectedSessionId ? 'Nenhuma matéria encontrada nesta sessão.' : 'Selecione uma sessão para visualizar os relatórios.'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Relatorios;