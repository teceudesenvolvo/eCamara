import React, { Component } from 'react';

//Imagens

// Icones

// Components

// Tabela
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Dados da tabela
function createData(nome, sigla, criacao, extincao, tipo, situacao) {
  return { nome, sigla, criacao, extincao, tipo, situacao};
}

const rows = [
  createData('Comissão Especial de Revisão das Leis', 'COMESPLeis', '10/01/2023', '12/02/2023', 'Comissão Especial', 'Desativada'),
  createData('Comissão Especial de Revisão das Leis', 'COMESPLeis', '10/01/2023', '-', 'Comissão Especial', 'Ativa'),
  ];


// Components

//mudança de páginas

class categorias extends Component {
    render() {
        return (

            <div className='App-header' >
            <div className='favoritos agendarConsulta'>
            {/* <h1>Comissões</h1> */}
               {/* A tabela de matérias */}

<TableContainer component={Paper} className='tabela-design'>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead className='tabela-header'>
          <TableRow>
            <TableCell align="center">Nome</TableCell>
            <TableCell align="center">Sigla</TableCell>
            <TableCell align="center">Criação</TableCell>
            <TableCell align="center">Extinção</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="center">Situação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">{row.nome}</TableCell>
              <TableCell align="center">{row.sigla}</TableCell>
              <TableCell align="center">{row.criacao}</TableCell>
              <TableCell align="center">{row.extincao}</TableCell>
              <TableCell align="center">{row.tipo}</TableCell>
              <TableCell align="center">{row.situacao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
            </div>
          </div>
        );
    }
}

export default categorias;