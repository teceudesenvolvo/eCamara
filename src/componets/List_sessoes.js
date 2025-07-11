import React, { Component } from 'react';

// Material-UI Table Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


class ProductsList_minhaConsultas extends Component {
    state = {
        sessoes: [ // Renamed 'processos' to 'sessoes' for clarity
            {
                id: '1',
                sessao: '1ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '23/03/2025',
                tipo: 'Ordinária',
                exercicio: '2025',
                materias: '15',
            },
            {
                id: '2',
                sessao: '1ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '23/03/2025',
                tipo: 'Ordinária',
                exercicio: '2025',
                materias: '15',
            },
            {
                id: '3',
                sessao: '1ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '23/03/2025',
                tipo: 'Ordinária',
                exercicio: '2025',
                materias: '15',
            },
        ]
    }

    render() {
        const { sessoes } = this.state;

        return (
            <div className="sessoes-table-wrapper"> {/* Wrapper for overall layout */}
                <TableContainer component={Paper} className='sessoes-table-container'>
                    <Table sx={{ minWidth: 650 }} aria-label="sessoes table">
                        <TableHead className='sessoes-table-header'>
                            <TableRow>
                                <TableCell align="left">ID</TableCell> {/* Align left as per image */}
                                <TableCell align="left">Sessão</TableCell>
                                <TableCell align="left">Abertura</TableCell>
                                <TableCell align="left">Tipo</TableCell>
                                <TableCell align="left">Exercício</TableCell>
                                <TableCell align="left">Matérias</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessoes.map((sessao) => (
                                <TableRow
                                    key={sessao.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" align="left">
                                        {sessao.id}
                                    </TableCell>
                                    <TableCell align="left">
                                        <a href='/sessao-virtual' className="sessao-link">
                                            {sessao.sessao}
                                        </a>
                                    </TableCell>
                                    <TableCell align="left">{sessao.abertura}</TableCell>
                                    <TableCell align="left">{sessao.tipo}</TableCell>
                                    <TableCell align="left">{sessao.exercicio}</TableCell>
                                    <TableCell align="left">{sessao.materias}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

export default ProductsList_minhaConsultas;
