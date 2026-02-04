import React, { Component } from 'react';

//Imagens

// Icones

// Components

// Tabela
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../componets/PageHeader';

// Dados da tabela
function createData(nome, sigla, criacao, extincao, tipo, situacao, imagem) {
  return { nome, sigla, criacao, extincao, tipo, situacao, imagem};
}

const rows = [
  createData('Comissão Especial de Revisão das Leis', 'COMESPLeis', '10/01/2023', '12/02/2023', 'Comissão Especial', 'Desativada', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=500&q=60'),
  createData('Comissão Especial de Revisão das Leis', 'COMESPLeis', '10/01/2023', '-', 'Comissão Especial', 'Ativa', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=500&q=60'),
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
                <div className='openai-section'>
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

                    <div className="openai-grid">
                        {filteredComissoes.map((row, index) => (
                            <div className="openai-card" key={index}>
                                <img src={row.imagem} alt={row.nome} className="card-image" />
                                <div className="card-content-openai">
                                    <span className="card-date">{row.situacao} • {row.criacao}</span>
                                    <h3>{row.nome}</h3>
                                    <p>{row.sigla} • {row.tipo}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredComissoes.length === 0 && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Nenhuma comissão encontrada.
                        </Typography>
                    )}
                </div>
            </div>
        );
    }
}

export default Comissoes;