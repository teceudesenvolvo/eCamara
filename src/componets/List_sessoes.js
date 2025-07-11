import React, { Component } from 'react';

// Material-UI Table Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField'; // Import TextField for filter inputs
import InputAdornment from '@mui/material/InputAdornment'; // For search icon

import SearchIcon from '@mui/icons-material/Search'; // Import a search icon

class ProductsList_minhaConsultas extends Component {
    state = {
        sessoes: [
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
                sessao: '13ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '14/12/2023',
                tipo: 'Ordinária',
                exercicio: '2023',
                materias: '20',
            },
            {
                id: '3',
                sessao: '3ª Sessão Extraordinária do 1º Semestre de 2024 da 4ª Sessão Legislativa da 19ª Legislatura',
                abertura: '05/07/2024',
                tipo: 'Extraordinária',
                exercicio: '2024',
                materias: '10',
            },
            {
                id: '4',
                sessao: '2ª Sessão Solene de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '01/09/2023',
                tipo: 'Solene',
                exercicio: '2023',
                materias: '5',
            },
        ],
        // State to hold filter text for each column
        filterText: {
            id: '',
            sessao: '',
            abertura: '',
            tipo: '',
            exercicio: '',
            materias: '',
        },
    };

    // Handler for filter input changes
    handleFilterChange = (event) => {
        const { name, value } = event.target;
        this.setState((prevState) => ({
            filterText: {
                ...prevState.filterText,
                [name]: value,
            },
        }));
    };

    render() {
        const { sessoes, filterText } = this.state;

        // Filter the sessoes array based on filterText
        const filteredSessoes = sessoes.filter((sessao) => {
            return Object.keys(filterText).every((key) => {
                // Convert both the sessao value and filter text to lowercase for case-insensitive search
                const sessaoValue = String(sessao[key]).toLowerCase();
                const filterValue = filterText[key].toLowerCase();
                return sessaoValue.includes(filterValue);
            });
        });

        return (
            <div className="sessoes-table-wrapper">
                <TableContainer component={Paper} className='sessoes-table-container'>
                    <Table sx={{ minWidth: 650 }} aria-label="sessoes table">
                        <TableHead className='sessoes-table-header'>
                            <TableRow>
                                {/* ID Column Header with Filter */}
                                <TableCell align="left">
                                    ID
                                    <TextField
                                        name="id"
                                        value={filterText.id}
                                        onChange={this.handleFilterChange}
                                        placeholder="Filtrar ID"
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}
                                    />
                                </TableCell>
                                {/* Sessão Column Header with Filter */}
                                <TableCell align="left">
                                    Sessão
                                    <TextField
                                        name="sessao"
                                        value={filterText.sessao}
                                        onChange={this.handleFilterChange}
                                        placeholder="Filtrar Sessão"
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}
                                    />
                                </TableCell>
                                {/* Abertura Column Header with Filter */}
                                <TableCell align="left">
                                    Abertura
                                    <TextField
                                        name="abertura"
                                        value={filterText.abertura}
                                        onChange={this.handleFilterChange}
                                        placeholder="Filtrar Abertura"
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}
                                    />
                                </TableCell>
                                {/* Tipo Column Header with Filter */}
                                <TableCell align="left">
                                    Tipo
                                    <TextField
                                        name="tipo"
                                        value={filterText.tipo}
                                        onChange={this.handleFilterChange}
                                        placeholder="Filtrar Tipo"
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}
                                    />
                                </TableCell>
                                {/* Exercício Column Header with Filter */}
                                <TableCell align="left">
                                    Exercício
                                    <TextField
                                        name="exercicio"
                                        value={filterText.exercicio}
                                        onChange={this.handleFilterChange}
                                        placeholder="Filtrar Exercício"
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}
                                    />
                                </TableCell>
                                {/* Matérias Column Header with Filter */}
                                <TableCell align="left">
                                    Matérias
                                    <TextField
                                        name="materias"
                                        value={filterText.materias}
                                        onChange={this.handleFilterChange}
                                        placeholder="Filtrar Matérias"
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 1, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSessoes.map((sessao) => (
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
                            {filteredSessoes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhum resultado encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

export default ProductsList_minhaConsultas;
