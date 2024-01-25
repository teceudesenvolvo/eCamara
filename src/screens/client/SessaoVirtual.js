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




class categorias extends Component {
  render() {
    return (

      <div className='App-header' >

        <div className='agendarConsulta'>

          <div className='section-header-sessao-virtual'>
            <div className='videoPlayerTramissao'>
              <ReactPlayer className='videoPlayer-view' url='https://www.youtube.com/watch?v=KBWvFODawj0' />
            </div>
            
            <HistoricoSessao />
          </div>
        </div>


{/* A tabela de matérias */}

<TableContainer component={Paper} className='tabela-design'>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead className='tabela-header'>
          <TableRow>
            <TableCell align="center">Protocolo</TableCell>
            <TableCell align="center">Materia</TableCell>
            <TableCell align="center">Situação</TableCell>
            <TableCell align="center"><FaRegCheckCircle/></TableCell>
            <TableCell align="center"><FaRegTimesCircle/></TableCell>
            <TableCell align="center"><FaBan/></TableCell>
            <TableCell align="center">Autor</TableCell>
            <TableCell align="center">Apresentação</TableCell>
            <TableCell align="center">Tramitação</TableCell>
            <TableCell align="center">Exercício</TableCell>
            <TableCell align="center">Votação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">{row.numero}</TableCell>
              <TableCell align="center">{row.materia}</TableCell>
              <TableCell align="center">{row.situacao}</TableCell>
              <TableCell align="center" className='votos voto-sim'>{row.votoSim}</TableCell>
              <TableCell align="center" className='votos voto-nao'>{row.votoNao}</TableCell>
              <TableCell align="center" className='votos voto-branco'>{row.semVoto}</TableCell>
              <TableCell align="center">{row.autor}</TableCell>
              <TableCell align="center">{row.apresentacao}</TableCell>
              <TableCell align="center">{row.tramitacao}</TableCell>
              <TableCell align="center">{row.exercicio}</TableCell>
              <TableCell align="center">{row.data}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>


      </div>
    );
  }
}

export default categorias;