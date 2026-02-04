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
import PageHeader from '../../componets/PageHeader';


// Components
import HistoricoSessao from '../../componets/HistoricoSessao';

// Dados da tabela
function createData(numero, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data ) {
  return { numero, materia, situacao, votoSim, votoNao, semVoto, autor, apresentacao, tramitacao, exercicio, data};
}

const rows = [
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
  createData('4', 'IND 4/2024', 'Em Votação', 1, 10, 5, 'Teste', 'Escrita', 'Ordinária', 2024, '10/01/2024'),
];




class SessaoVirtual extends Component {
  state = {
    showFilters: false,
  };

  toggleFilters = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  };

  render() {
    return (

      <div className='App-header' >
        <div className='sessao-virtual-container'>
          <Typography variant="h4" component="p" gutterBottom style={{ marginBottom: '30px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
            Sessão Virtual ao Vivo
          </Typography>

          <div className='sessao-virtual-main-content'>
            <div className='sessao-virtual-video-wrapper'>
              <div className='player-wrapper'>
                <ReactPlayer className='react-player' url='https://www.youtube.com/watch?v=KBWvFODawj0' width='100%' height='100%' controls={true} />
              </div>
            </div>
            <div className='sessao-virtual-historico-wrapper'>
              <HistoricoSessao />
            </div>
          </div>

          <div className='sessao-virtual-materias-wrapper'>
            <PageHeader 
                title="Matérias em Votação" 
                onToggleFilters={this.toggleFilters} 
            />
            
            <Grid container spacing={2} justifyContent="flex-start">
              {rows.map((row, index) => (
                <Grid item xs={12} key={index}>
                  <Card elevation={2} sx={{ borderRadius: '12px', transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaFileAlt color="#126B5E" />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {row.materia}
                          </Typography>
                        </Box>
                        <Chip label={row.situacao} size="small" color={row.situacao === 'Em Votação' ? 'warning' : 'default'} />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 3 }}>
                        Protocolo: {row.numero} | Autor: {row.autor} | Tramitação: {row.tramitacao}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="vote-circle vote-sim-circle">{row.votoSim}</span> <Typography variant="caption">Sim</Typography></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="vote-circle vote-nao-circle">{row.votoNao}</span> <Typography variant="caption">Não</Typography></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="vote-circle vote-abs-circle">{row.semVoto}</span> <Typography variant="caption">Abstenção</Typography></div>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

export default SessaoVirtual;