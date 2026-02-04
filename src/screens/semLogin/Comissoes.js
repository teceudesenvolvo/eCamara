import React, { Component } from 'react';

//Imagens

// Icones

// Components

// Tabela
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import PageHeader from '../../componets/PageHeader';

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
        showFilters: false,
    };

    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    toggleFilters = () => {
        this.setState(prevState => ({ showFilters: !prevState.showFilters }));
    };

    render() {
        const { comissoes, searchTerm, showFilters } = this.state;

        const filteredComissoes = comissoes.filter(comissao => {
            return Object.values(comissao).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return (

            <div className='App-header' >
                <div className='favoritos agendarConsulta' style={{ padding: '0 40px 40px 40px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <PageHeader 
                        title="Comissões Legislativas" 
                        onToggleFilters={this.toggleFilters} 
                    />

                    {showFilters && (
                        <Box sx={{ mb: 4 }}>
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
                                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                            />
                        </Box>
                    )}

                    <Grid container spacing={3} justifyContent="flex-start">
                        {filteredComissoes.map((row, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card elevation={3} sx={{ height: '100%', borderRadius: '12px', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                    <CardContent sx={{ textAlign: 'left', p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#333', lineHeight: 1.2 }}>
                                                {row.nome}
                                            </Typography>
                                            <Chip 
                                                label={row.situacao} 
                                                size="small" 
                                                className={row.situacao === 'Ativa' ? 'status-ativa' : 'status-inativa'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                            {row.sigla} • {row.tipo}
                                        </Typography>
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>Criação:</strong> {row.criacao}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>Extinção:</strong> {row.extincao}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {filteredComissoes.length === 0 && (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                                    Nenhuma comissão encontrada.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </div>
            </div>
        );
    }
}

export default Comissoes;