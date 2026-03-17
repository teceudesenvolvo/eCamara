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

// Firebase
import { db } from '../../firebaseConfig';
import { ref, get, query, orderByChild } from 'firebase/database';

class Sessoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessoes: [],
            loading: true,
            filterText: {
                sessao: '',
                abertura: '',
                tipo: '',
                exercicio: '',
            },
            showFilters: false,
            camaraId: this.props.match.params.camaraId || 'camara-teste',
        };
    }

    componentDidMount() {
        this.fetchSessoes();
    }

    fetchSessoes = async () => {
        const { camaraId } = this.state;
        const sessoesRef = ref(db, `${camaraId}/sessoes`);
        const sessoesQuery = query(sessoesRef, orderByChild('createdAt'));

        const snapshot = await get(sessoesQuery);
        const sessoes = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => sessoes.push({ id: child.key, ...child.val() }));
        }
        this.setState({ sessoes: sessoes.reverse(), loading: false }); // reverse to show newest first
    }

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
        const { sessoes, filterText, showFilters, loading, camaraId } = this.state;

        const filteredSessoes = sessoes.filter((sessao) => {
            return Object.keys(filterText).every((key) => {
                const sessaoValue = String(sessao[key] || '').toLowerCase();
                const filterValue = filterText[key].toLowerCase();
                return sessaoValue.includes(filterValue);
            });
        });

        // Helper function to get unique values for select options
        const getUniqueValues = (key) => {
            return [...new Set(sessoes.map(item => item[key]))].filter(Boolean).sort();
        };

        const selectFields = ['data', 'tipo', 'exercicio'];

        return (
            <div className='App-header'>
                <div className='openai-section'>
                    <PageHeader 
                        title="Sessões Legislativas" 
                        onToggleFilters={this.toggleFilters} 
                        showPdfButton={false}
                        showPrintButton={false}
                    />

                    {loading && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Carregando sessões...
                        </Typography>
                    )}

                    {showFilters && (
                        <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                {['sessao', 'data', 'tipo', 'exercicio'].map((column) => (
                                    <Grid item xs={12} sm={6} md={3} key={column}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <Typography variant="caption" style={{ fontWeight: 'bold', color: '#555' }}>
                                                {column === 'sessao' ? 'Descrição' : column.charAt(0).toUpperCase() + column.slice(1)}
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
                            <div className="openai-card" key={sessao.id} onClick={() => this.props.history.push(`/sessao-virtual/${camaraId}`, { sessaoId: sessao.id })}>
                                <div className="card-content-openai">
                                    <span className="card-date">{sessao.data} • {new Date(sessao.createdAt).getFullYear()}</span>
                                    <h3>{sessao.tipo} nº {sessao.numero}</h3>
                                    <p>Clique para ver os detalhes</p>
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
