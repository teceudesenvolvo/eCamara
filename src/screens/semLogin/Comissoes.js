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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';

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

class Comissoes extends Component {
    state = {
        comissoes: rows,
        searchTerm: '',
    };

    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    render() {
        const { comissoes, searchTerm } = this.state;

        const filteredComissoes = comissoes.filter(comissao => {
            return Object.values(comissao).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return (

            <div className='App-header' >
                <div className='favoritos agendarConsulta' style={{ padding: '40px', width: '100%', maxWidth: '1200px', boxSizing: 'border-box' }}>
                    <Typography variant="h4" component="h1" gutterBottom style={{ marginBottom: '30px', color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
                        Comissões Legislativas
                    </Typography>

                    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Pesquisar comissões..."
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
                                        {['Nome', 'Sigla', 'Criação', 'Extinção', 'Tipo', 'Situação'].map((column) => (
                                            <TableCell key={column} align="left" style={{ backgroundColor: '#126B5E', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '20px' }}>
                                                {column}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredComissoes.map((row, index) => (
                                        <TableRow hover key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                                            <TableCell style={{ padding: '20px', fontWeight: '500' }}>{row.nome}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{row.sigla}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{row.criacao}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{row.extincao}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>{row.tipo}</TableCell>
                                            <TableCell style={{ padding: '20px' }}>
                                                <span className={`status-tag ${row.situacao === 'Ativa' ? 'status-ativa' : 'status-inativa'}`}>
                                                    {row.situacao}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredComissoes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" style={{ padding: '30px', color: '#666' }}>
                                                Nenhuma comissão encontrada.
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

export default Comissoes;