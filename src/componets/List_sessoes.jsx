import React, { Component } from 'react';

// Material-UI Table Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField'; // Import TextField for filter inputs
import InputAdornment from '@mui/material/InputAdornment'; // For search icon

import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search'; // Import a search icon
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PageHeader from './PageHeader';

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
            sessao: '',
            abertura: '',
            tipo: '',
            exercicio: '',
            materias: '',
        },
        showFilters: false,
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

    toggleFilters = () => {
        this.setState(prevState => ({ showFilters: !prevState.showFilters }));
    };

    render() {
        const { sessoes, filterText, showFilters } = this.state;

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
                <div className='sessoes-table-container' style={{ width: '100%', maxWidth: '1200px' }}>
                    <PageHeader 
                        title="Minhas Sessões" 
                        onToggleFilters={this.toggleFilters} 
                    />
                    
                    {showFilters && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                            <Grid container spacing={2}>
                                {['sessao', 'abertura', 'tipo', 'exercicio', 'materias'].map((column) => (
                                    <Grid item xs={12} sm={6} md={2.4} key={column}>
                                        <TextField
                                            name={column}
                                            value={filterText[column]}
                                            onChange={this.handleFilterChange}
                                            placeholder={`Filtrar ${column.charAt(0).toUpperCase() + column.slice(1)}`}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    <Grid container spacing={2} justifyContent="flex-start">
                        {filteredSessoes.map((sessao) => (
                            <Grid item xs={12} key={sessao.id}>
                                <Card elevation={1} sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                                                <a href='/sessao-virtual' className="sessao-link" style={{ textDecoration: 'none', color: '#126B5E' }}>
                                                    {sessao.sessao}
                                                </a>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Abertura: {sessao.abertura} | Exercício: {sessao.exercicio}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip label={sessao.tipo} size="small" color="primary" variant="outlined" />
                                            <Chip label={`${sessao.materias} Matérias`} size="small" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {filteredSessoes.length === 0 && (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
                                    Nenhum resultado encontrado.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </div>
            </div>
        );
    }
}

export default ProductsList_minhaConsultas;
