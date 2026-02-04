import React, { Component } from 'react';

// Material-UI Table Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
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
                <PageHeader 
                    title="Normas Jurídicas" 
                    onToggleFilters={this.toggleFilters} 
                />
                <div className='favoritos agendarConsulta' style={{ padding: '0 40px 40px 40px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

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

                    <Grid container spacing={3} justifyContent="flex-start">
                        {filteredNormas.map((norma) => (
                            <Grid item xs={12} sm={6} md={4} key={norma.id}>
                                <Card elevation={3} sx={{ height: '100%', borderRadius: '12px', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                    <CardContent sx={{ textAlign: 'left', p: 3 }}>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#126B5E', mb: 1 }}>
                                            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {norma.tipo} nº {norma.numero}/{norma.ano}
                                            </a>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {norma.data}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            {norma.descricao}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', color: '#666', fontStyle: 'italic', borderTop: '1px solid #eee', pt: 1 }}>
                                            {norma.status}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {filteredNormas.length === 0 && (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                                    Nenhuma norma encontrada.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </div>
            </div>
        );
    }
}

export default NormasJuridicas;
