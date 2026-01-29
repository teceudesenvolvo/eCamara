import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Tabela
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

//Imagens


// Icones
import { 
  FaBan,
  FaRegCheckCircle,
  FaRegTimesCircle,

} from "react-icons/fa";


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
            <Typography variant="h5" component="h2" gutterBottom style={{ marginTop: '40px', marginBottom: '20px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
              Matérias em Votação
            </Typography>
            <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {['Protocolo', 'Matéria', 'Situação', <FaRegCheckCircle/>, <FaRegTimesCircle/>, <FaBan/>, 'Autor', 'Apresentação', 'Tramitação', 'Exercício', 'Votação'].map((column, index) => (
                        <TableCell key={index} align="left" style={{ backgroundColor: '#126B5E', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '20px' }}>
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow hover key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell style={{ padding: '20px' }}>{row.numero}</TableCell>
                        <TableCell style={{ padding: '20px', fontWeight: '500' }}>{row.materia}</TableCell>
                        <TableCell style={{ padding: '20px' }}>{row.situacao}</TableCell>
                        <TableCell style={{ padding: '20px' }}><span className="vote-circle vote-sim-circle">{row.votoSim}</span></TableCell>
                        <TableCell style={{ padding: '20px' }}><span className="vote-circle vote-nao-circle">{row.votoNao}</span></TableCell>
                        <TableCell style={{ padding: '20px' }}><span className="vote-circle vote-abs-circle">{row.semVoto}</span></TableCell>
                        <TableCell style={{ padding: '20px' }}>{row.autor}</TableCell>
                        <TableCell style={{ padding: '20px' }}>{row.apresentacao}</TableCell>
                        <TableCell style={{ padding: '20px' }}>{row.tramitacao}</TableCell>
                        <TableCell style={{ padding: '20px' }}>{row.exercicio}</TableCell>
                        <TableCell style={{ padding: '20px' }}>{row.data}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

export default SessaoVirtual;