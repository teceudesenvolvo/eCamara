import React, { Component } from 'react';

// Material-UI Table Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

// Icons
import SearchIcon from '@mui/icons-material/Search';

class Sessoes extends Component {
    state = {
        sessoes: [
            {
                sessao: '1ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '23/03/2025',
                tipo: 'Ordinária',
                exercicio: '2025',
            },
            {
                sessao: '13ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '14/12/2023',
                tipo: 'Ordinária',
                exercicio: '2023',
            },
            {
                sessao: '3ª Sessão Extraordinária do 1º Semestre de 2024 da 4ª Sessão Legislativa da 19ª Legislatura',
                abertura: '05/07/2024',
                tipo: 'Extraordinária',
                exercicio: '2024',
            },
            {
                sessao: '2ª Sessão Solene de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '01/09/2023',
                tipo: 'Solene',
                exercicio: '2023',
            },
        ],
        filterText: {
            sessao: '',
            abertura: '',
            tipo: '',
            exercicio: '',
        },
    };

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

        const filteredSessoes = sessoes.filter((sessao) => {
            return Object.keys(filterText).every((key) => {
                const sessaoValue = String(sessao[key]).toLowerCase();
                const filterValue = filterText[key].toLowerCase();
                return sessaoValue.includes(filterValue);
            });
        });

        // Helper function to get unique values for select options
        const getUniqueValues = (key) => {
            return [...new Set(sessoes.map(item => item[key]))].filter(Boolean).sort();
        };

        const selectFields = ['abertura', 'tipo', 'exercicio'];

        return (
            <div className='App-header'>
                <div className='favoritos agendarConsulta' style={{ padding: '40px', width: '100%', maxWidth: '1200px', boxSizing: 'border-box' }}>
                    <Typography variant="h4" component="h1" gutterBottom style={{ marginBottom: '30px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
                        Sessões Legislativas
                    </Typography>
                    
                    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <TableContainer sx={{ maxHeight: 800 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {/* Columns with filters */}
                                        {['sessao', 'abertura', 'tipo', 'exercicio'].map((column) => (
                                            <TableCell 
                                                key={column}
                                                align="left"
                                                style={{ backgroundColor: '#126B5E', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '20px' }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {column.charAt(0).toUpperCase() + column.slice(1)}
                                                    {selectFields.includes(column) ? (
                                                        <TextField
                                                            select
                                                            name={column}
                                                            value={filterText[column]}
                                                            onChange={this.handleFilterChange}
                                                            variant="outlined"
                                                            size="small"
                                                            fullWidth
                                                            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' }, backgroundColor: '#fff', borderRadius: '8px' } }}
                                                        >
                                                            <MenuItem value="">
                                                                <em>Todos</em>
                                                            </MenuItem>
                                                            {getUniqueValues(column).map((option) => (
                                                                <MenuItem key={option} value={option}>
                                                                    {option}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    ) : (
                                                        <TextField
                                                        name={column}
                                                        value={filterText[column]}
                                                        onChange={this.handleFilterChange}
                                                        placeholder={`Buscar...`}
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <SearchIcon fontSize="small" style={{ color: '#999' }} />
                                                                </InputAdornment>
                                                            ),
                                                            style: { backgroundColor: '#fff', borderRadius: '8px', fontSize: '0.875rem' }
                                                        }}
                                                        sx={{ 
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': { border: 'none' },
                                                            } 
                                                        }}
                                                    />
                                                    )}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSessoes.map((sessao) => (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={sessao.sessao} // Using sessao as key since id is removed
                                            sx={{ '&:hover': { backgroundColor: '#f9f9f9' }, cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        >
                                            <TableCell component="th" scope="row" align="left" style={{ fontWeight: '500', padding: '20px' }}>
                                                <a href='/sessao-virtual' className="sessao-link" style={{ color: '#126B5E', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    {sessao.sessao}
                                                </a>
                                            </TableCell>
                                            <TableCell align="left" style={{ padding: '20px' }}>{sessao.abertura}</TableCell>
                                            <TableCell align="left" style={{ padding: '20px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px', 
                                                    backgroundColor: sessao.tipo === 'Ordinária' ? '#e3f2fd' : '#fff3e0',
                                                    color: sessao.tipo === 'Ordinária' ? '#1565c0' : '#ef6c00',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    display: 'inline-block'
                                                }}>
                                                    {sessao.tipo}
                                                </span>
                                            </TableCell>
                                            <TableCell align="left" style={{ padding: '20px' }}>{sessao.exercicio}</TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredSessoes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" style={{ padding: '30px', color: '#666' }}>
                                                Nenhum resultado encontrado.
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

export default Sessoes;