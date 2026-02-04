import React, { Component } from 'react';

// Material-UI Table Components
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../componets/PageHeader';

class Sessoes extends Component {
    state = {
        sessoes: [
            {
                sessao: '1ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '23/03/2025',
                tipo: 'Ordinária',
                exercicio: '2025',
                imagem: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=500&q=60'
            },
            {
                sessao: '13ª Sessão Ordinária do 2º Semestre de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '14/12/2023',
                tipo: 'Ordinária',
                exercicio: '2023',
                imagem: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=60'
            },
            {
                sessao: '3ª Sessão Extraordinária do 1º Semestre de 2024 da 4ª Sessão Legislativa da 19ª Legislatura',
                abertura: '05/07/2024',
                tipo: 'Extraordinária',
                exercicio: '2024',
                imagem: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=60'
            },
            {
                sessao: '2ª Sessão Solene de 2023 da 3ª Sessão Legislativa da 19ª Legislatura',
                abertura: '01/09/2023',
                tipo: 'Solene',
                exercicio: '2023',
                imagem: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=60'
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
                <div className='openai-section'>
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
                    
                    <div className="openai-grid">
                        {filteredSessoes.map((sessao) => (
                            <div className="openai-card" key={sessao.sessao} onClick={() => window.location.href = '/sessao-virtual'}>
                                <img src={sessao.imagem} alt={sessao.sessao} className="card-image" />
                                <div className="card-content-openai">
                                    <span className="card-date">{sessao.abertura} • {sessao.exercicio}</span>
                                    <h3>{sessao.sessao}</h3>
                                    <p>{sessao.tipo}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredSessoes.length === 0 && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Nenhum resultado encontrado.
                        </Typography>
                    )}
                </div>
            </div>
        );
    }
}

export default Sessoes;