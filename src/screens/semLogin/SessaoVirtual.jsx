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
  FaFileAlt
} from "react-icons/fa";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';


// Components
import HistoricoSessao from '../../componets/HistoricoSessao.jsx';

// Firebase
import { db } from '../../firebaseConfig';
import { ref, get, onValue, update } from 'firebase/database';
import { auth } from '../../firebaseConfig';

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
    };
  }

  componentDidMount() {
    this.fetchSessaoData();
  }

  fetchSessaoData = async () => {
    const { camaraId } = this.state;
    const { state } = this.props.location;
    const sessaoId = state ? state.sessaoId : null;

    if (!sessaoId) {
      this.setState({ loading: false });
      return;
    }

    const sessaoRef = ref(db, `${camaraId}/sessoes/${sessaoId}`);
    onValue(sessaoRef, (snapshot) => {
        if (snapshot.exists()) {
            this.setState({ sessao: { id: snapshot.key, ...snapshot.val() }, loading: false });
        } else {
            this.setState({ loading: false });
        }
    });
  }

  toggleFilters = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  };

  handleOpenMateriaModal = (materia) => {
    this.setState({ selectedMateria: materia, showMateriaModal: true });
  };

  handleCloseMateriaModal = () => {
    this.setState({ showMateriaModal: false, selectedMateria: null });
  };

  render() {
    const { sessao, loading, showMateriaModal, selectedMateria, user, userRole } = this.state;

    if (loading) {
      return <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}><p>Carregando sessão...</p></div>;
    }

    if (!sessao) {
      return <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}><p>Sessão não encontrada.</p></div>;
    }

    const materias = sessao.itens || [];

    return (

      <div className='App-header' >
        <div className='sessao-virtual-container'>
          <Typography variant="h4" component="h1" gutterBottom style={{ marginBottom: '30px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
            {sessao.tipo} nº {sessao.numero}
          </Typography>

          <div className='sessao-virtual-main-content'>
            <div className='sessao-virtual-video-wrapper'>
              <div className='player-wrapper'>
                <ReactPlayer className='react-player' url={sessao.transmissaoUrl || 'https://www.youtube.com/watch?v=PDtvNjcgqdI'} width='100%' height='100%' controls={true} />
              </div>
            </div>
            <div className='sessao-virtual-historico-wrapper'>
              <HistoricoSessao sessao={sessao} />
            </div>
          </div>

          <div className='sessao-virtual-materias-wrapper'>
            
            
            <Grid container spacing={2} justifyContent="flex-start">
              {materias.map((materia, index) => (
                <Grid item xs={12} key={materia.id || index}>
                  <Card elevation={2} sx={{ borderRadius: '12px', transition: '0.3s', '&:hover': { boxShadow: 4 }, cursor: 'pointer' }} onClick={() => this.handleOpenMateriaModal(materia)}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaFileAlt color="#126B5E" />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {materia.tipoMateria} {materia.numero}
                          </Typography>
                        </Box>
                        <Chip label={materia.status || 'Em Votação'} size="small" color={materia.status === 'Em Votação' ? 'warning' : 'default'} />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 3 }}>
                        Autor: {materia.autor} | Tramitação: {materia.regTramita}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="vote-circle vote-sim-circle">{materia.votos?.sim || 0}</span> <Typography variant="caption">Sim</Typography></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="vote-circle vote-nao-circle">{materia.votos?.nao || 0}</span> <Typography variant="caption">Não</Typography></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="vote-circle vote-abs-circle">{materia.votos?.abs || 0}</span> <Typography variant="caption">Abstenção</Typography></div>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>

          {showMateriaModal && selectedMateria && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedMateria.titulo}</h2>
                  <button onClick={this.handleCloseMateriaModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
                </div>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '15px' }}>
                  <p><strong>Autor:</strong> {selectedMateria.autor}</p>
                  <p><strong>Tipo:</strong> {selectedMateria.tipoMateria}</p>
                  <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h4 style={{ marginTop: 0, color: '#126B5E' }}>Ementa</h4>
                    <p style={{ fontStyle: 'italic' }}>"{selectedMateria.ementa}"</p>
                    <h4 style={{ marginTop: '20px', color: '#126B5E' }}>Texto da Matéria</h4>
                    <div dangerouslySetInnerHTML={{ __html: selectedMateria.textoMateria }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SessaoVirtual;