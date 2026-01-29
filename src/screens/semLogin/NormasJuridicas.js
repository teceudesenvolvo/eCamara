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

class NormasJuridicas extends Component {
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
                <div className='favoritos agendarConsulta' style={{ padding: '40px', width: '100%', maxWidth: '1200px', boxSizing: 'border-box' }}>
                    <Typography variant="h4" component="h1" gutterBottom style={{ marginBottom: '30px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
                        Normas Jurídicas
                    </Typography>

                    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Pesquisar em normas jurídicas..."
                            value={searchTerm}
                            onChange={this.handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ margin: '20px', width: 'calc(100% - 40px)' }}
                        />
                        <TableContainer sx={{ maxHeight: 800 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {['Tipo', 'Número', 'Ano', 'Data', 'Descrição', 'Status'].map(column => (
                                            <TableCell key={column} align="left" style={{ backgroundColor: '#126B5E', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '20px' }}>
                                                {column}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredNormas.map((norma) => (
                                        <TableRow hover key={norma.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                                            <TableCell style={{ padding: '20px' }}>
                                                <a href="/" style={{ color: '#126B5E', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    {norma.tipo}
                                                </a>
                                            </TableCell>
                                            <TableCell style={{ padding: '20px' }}>{norma.numero}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{norma.ano}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{norma.data}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{norma.descricao}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{norma.status}</TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredNormas.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" style={{ padding: '30px', color: '#666' }}>
                                                Nenhuma norma encontrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default NormasJuridicas;
