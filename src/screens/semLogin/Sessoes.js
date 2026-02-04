import React, { Component } from 'react';

// Material-UI Table Components
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageHeader from '../../componets/PageHeader';

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
        showFilters: false,
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

    toggleFilters = () => {
        this.setState(prevState => ({ showFilters: !prevState.showFilters }));
    };

    render() {
        const { sessoes, filterText, showFilters } = this.state;

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
                <div className='favoritos agendarConsulta' style={{ padding: '0 40px 40px 40px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <PageHeader 
                        title="Sessões Legislativas" 
                        onToggleFilters={this.toggleFilters} 
                        showPdfButton={false}
                        showPrintButton={false}
                    />

                    {showFilters && (
                        <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                {['sessao', 'abertura', 'tipo', 'exercicio'].map((column) => (
                                    <Grid item xs={12} sm={6} md={3} key={column}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <Typography variant="caption" style={{ fontWeight: 'bold', color: '#555' }}>
                                                {column.charAt(0).toUpperCase() + column.slice(1)}
                                            </Typography>
                                            {selectFields.includes(column) ? (
                                                <TextField
                                                    select
                                                    name={column}
                                                    value={filterText[column]}
                                                    onChange={this.handleFilterChange}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    sx={{ bgcolor: '#fff' }}
                                                >
                                                    <MenuItem value=""><em>Todos</em></MenuItem>
                                                    {getUniqueValues(column).map((option) => (
                                                        <MenuItem key={option} value={option}>{option}</MenuItem>
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
                                                    sx={{ bgcolor: '#fff' }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon fontSize="small" style={{ color: '#999' }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                    
                    <Grid container spacing={2} justifyContent="flex-start">
                        {filteredSessoes.map((sessao) => (
                            <Grid item key={sessao.sessao}>
                                <Card elevation={0} sx={{ 
                                    width: 200, 
                                    height: 200, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'space-between', 
                                    p: 2, 
                                    borderRadius: '12px', 
                                    border: '1px solid #e0e0e0', 
                                    transition: '0.3s', 
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderColor: 'transparent' } 
                                }}>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#666', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>
                                            <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                                {sessao.abertura}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={sessao.tipo} 
                                            size="small" 
                                            sx={{ 
                                                backgroundColor: sessao.tipo === 'Ordinária' ? 'rgba(21, 101, 192, 0.08)' : 'rgba(239, 108, 0, 0.08)',
                                                color: sessao.tipo === 'Ordinária' ? '#1565c0' : '#ef6c00',
                                                fontWeight: 'bold',
                                                borderRadius: '6px',
                                                height: '20px',
                                                fontSize: '0.65rem'
                                            }} 
                                        />
                                    </Box>

                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                                        <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5, color: '#2c3e50', fontSize: '0.9rem', display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 }}>
                                            {sessao.sessao}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Exercício: {sessao.exercicio}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ width: '100%' }}>
                                        <Button 
                                            component="a" 
                                            href="/sessao-virtual" 
                                            endIcon={<ArrowForwardIcon sx={{ fontSize: '1rem !important' }} />} 
                                            variant="text" 
                                            size="small"
                                            fullWidth
                                            sx={{ 
                                                borderRadius: '8px', 
                                                textTransform: 'none', 
                                                fontWeight: 'bold',
                                                color: '#126B5E',
                                                backgroundColor: 'rgba(18, 107, 94, 0.04)',
                                                padding: '6px 12px',
                                                fontSize: '0.8rem',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(18, 107, 94, 0.1)'
                                                }
                                            }}
                                        >
                                            Ver
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                        {filteredSessoes.length === 0 && (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
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

export default Sessoes;