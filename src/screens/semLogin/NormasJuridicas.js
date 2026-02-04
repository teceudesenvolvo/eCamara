import React, { Component } from 'react';

// Material-UI Table Components
import Typography from '@mui/material/Typography'; // For the title
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../componets/PageHeader';
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
                imagem: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=500&q=60'
            },
            {
                id: '2',
                tipo: 'Resolução Legislativa',
                numero: '4',
                ano: '2023',
                data: '5 de Outubro de 2023',
                descricao: 'Altera o art. 16 da Lei Orgânica do Município',
                status: 'Norma sem alterações posteriores.',
                imagem: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=500&q=60'
            },
            // Add more data as needed
        ],
        searchTerm: '', // State for the search input
        showFilters: false,
    };

    // Handler for search input changes
    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    toggleFilters = () => {
        this.setState(prevState => ({ showFilters: !prevState.showFilters }));
    };

    render() {
        const { normas, searchTerm, showFilters } = this.state;

        // Filter the normas array based on the search term
        const filteredNormas = normas.filter((norma) => {
            return Object.values(norma).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return (
            <div className='App-header'>
                <div className='openai-section'>
                    <PageHeader 
                        title="Normas Jurídicas" 
                        onToggleFilters={this.toggleFilters} 
                    />

                    {showFilters && (
                        <Box sx={{ mb: 4 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Pesquisar normas..."
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
                        {filteredNormas.map((norma) => (
                            <div className="openai-card" key={norma.id}>
                                <img src={norma.imagem} alt={norma.tipo} className="card-image" />
                                <div className="card-content-openai">
                                    <span className="card-date">{norma.data}</span>
                                    <h3>
                                        {norma.tipo} nº {norma.numero}/{norma.ano}
                                    </h3>
                                    <p>{norma.descricao}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredNormas.length === 0 && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Nenhuma norma encontrada.
                        </Typography>
                    )}
                </div>
            </div>
        );
    }
}

export default NormasJuridicas;
