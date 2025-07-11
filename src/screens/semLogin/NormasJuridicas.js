import React, { Component } from 'react';

// Material-UI Table Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField'; // Import TextField for search input
import InputAdornment from '@mui/material/InputAdornment'; // For search icon
import Typography from '@mui/material/Typography'; // For the title

import SearchIcon from '@mui/icons-material/Search'; // Import a search icon

// You might need a CSS file for custom styles, e.g., NormasJuridicas.css
// import './NormasJuridicas.css'; 

class categorias extends Component {
    state = {
        normas: [
            {
                id: '1',
                tipo: 'Emenda de Revisão à Lei Orgânica',
                numero: '4',
                ano: '2023',
                data: '5 de Outubro de 2023',
                descricao: 'Altera o art. 16 da Lei Orgânica do Município',
                status: 'Norma sem alterações posteriores.',
            },
            {
                id: '2',
                tipo: 'Resolução Legislativa',
                numero: '4',
                ano: '2023',
                data: '5 de Outubro de 2023',
                descricao: 'Altera o art. 16 da Lei Orgânica do Município',
                status: 'Norma sem alterações posteriores.',
            },
            // Add more data as needed
        ],
        searchTerm: '', // State for the search input
    };

    // Handler for search input changes
    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    render() {
        const { normas, searchTerm } = this.state;

        // Filter the normas array based on the search term
        const filteredNormas = normas.filter((norma) => {
            return Object.values(norma).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return (
            <div className='App-header'>
                <div className='favoritos agendarConsulta' style={{ padding: '20px' }}>
                    <Typography variant="h5" component="h1" gutterBottom style={{ marginBottom: '20px' }}>
                        Normas Jurídicas
                    </Typography>

                    {/* Search Bar */}
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Pesquisar"
                        value={searchTerm}
                        onChange={this.handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3, borderRadius: '8px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />

                    <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="normas juridicas table">
                            <TableHead sx={{ backgroundColor: '#e0e5e9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Número</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Ano</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Data</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Descrição</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredNormas.map((norma) => (
                                    <TableRow
                                        key={norma.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8f9fa' } }}
                                    >
                                        <TableCell>
                                            <a href="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                                                {norma.tipo}
                                            </a>
                                        </TableCell>
                                        <TableCell>{norma.numero}</TableCell>
                                        <TableCell>{norma.ano}</TableCell>
                                        <TableCell>{norma.data}</TableCell>
                                        <TableCell>{norma.descricao}</TableCell>
                                        <TableCell>{norma.status}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredNormas.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Nenhuma norma encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        );
    }
}

export default categorias;
