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
        this.setState({ materials: session.itens, loading: false });
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

    return (
      <div className='app-container'>
        <div className='main-content'>
          <div className='filter-section'>
            <div className='session-selector'>
              <select value={selectedSessionId} onChange={this.handleSessionChange} disabled={sessionsLoading}>
                <option value="">{sessionsLoading ? 'Carregando sessões...' : 'Selecionar Sessão'}</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.tipo} nº {s.numero} ({new Date(s.data).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            {selectedSession && (
              <div className='status-indicators'>
                <div className={`status-item ${selectedSession.status === 'Encerrada' ? 'gray' : 'green'}`}>
                  {materials.length}
                </div>
                <div className='status-text'>{selectedSession.status}</div>
                <div className='status-text'>{selectedSession.tipo}</div>
                <div className='status-text'>{new Date(selectedSession.data).getFullYear()}</div>
                <div className='status-text'>{new Date(selectedSession.data).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          <div className='materials-section' style={{ minHeight: '400px', position: 'relative' }}>
            <h2 style={{ color: '#126B5E', borderBottom: '2px solid #126B5E', paddingBottom: '10px' }}>Matérias da Sessão</h2>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <FaSpinner className="animate-spin" size={40} color="#126B5E" />
              </div>
            ) : materials.length > 0 ? (
              materials.map((material, index) => {
                const votos = material.votos || {};
                const sim = Object.values(votos).filter(v => v.voto === 'sim').length;
                const nao = Object.values(votos).filter(v => v.voto === 'nao').length;
                const abs = Object.values(votos).filter(v => v.voto === 'abstencao').length;
                
                return (
                  <div className='material-card' key={material.id || index}>
                    <div className='material-details'>
                      <a href={`/materia/${this.state.camaraId}/${material.id}`} className='material-code'>
                        {material.tipoMateria} {material.numero}/{material.ano}
                      </a>
                      <p className='material-description'>
                        <strong>Ementa:</strong> {material.ementa}
                        <br />
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>PROMOVENTE: {material.autor || material.tipoAutor || '-'}</span>
                      </p>
                    </div>

                    <div className='vote-summary'>
                      <p style={{ fontWeight: 'bold', color: '#126B5E' }}>Resultado da Votação</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '0.9rem' }}>
                        <span>Sim: <strong>{sim}</strong></span>
                        <span>Não: <strong>{nao}</strong></span>
                        <span>Abst: <strong>{abs}</strong></span>
                        <span>Total: <strong>{sim + nao + abs}</strong></span>
                      </div>
                    </div>

                    <div className='voting-results'>
                      <div className='vote-actions'>
                        <button
                          className={`button-aprovado ${material.status === 'Rejeitada' ? 'button-rejeitado' : material.status === 'Pendente' ? 'button-pendente' : ''}`}
                          style={{
                            backgroundColor: material.status === 'Aprovada' ? '#4caf50' : material.status === 'Rejeitada' ? '#f44336' : '#ffa000',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            width: '120px'
                          }}
                        >
                          {material.status || 'Pendente'}
                        </button>
                        <a href={`/materia/${this.state.camaraId}/${material.id}`} className='link-ver-votos' style={{ fontSize: '0.85rem', marginTop: '5px', display: 'block', textAlign: 'center' }}>
                          Ver detalhes
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: '#999' }}>
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