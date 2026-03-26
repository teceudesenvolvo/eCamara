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
import { ref, get } from 'firebase/database';

class Sessoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessoes: [],
            loading: true,
            filterText: {
                numero: '',
                data: '',
                tipo: '',
                legislatura: '',
            },
            showFilters: false,
            activeTab: 'todas', // 'todas' ou 'abertas'
            camaraId: this.props.match.params.camaraId || 'camara-teste',
        };
    }

    componentDidMount() {
        this.fetchSessoes();
    }

    fetchSessoes = async () => {
        const { camaraId } = this.state;
        const sessoesRef = ref(db, `${camaraId}/sessoes`);
        
        try {
            const snapshot = await get(sessoesRef);
            const sessoes = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => sessoes.push({ id: child.key, ...child.val() }));
            }
            // Ordena manualmente: primeiro as abertas, depois por data de criação decrescente
            const sortedSessoes = sessoes.sort((a, b) => {
                if (a.status === 'Aberta' && b.status !== 'Aberta') return -1;
                if (a.status !== 'Aberta' && b.status === 'Aberta') return 1;
                return (b.createdAt || 0) - (a.createdAt || 0);
            });
            this.setState({ sessoes: sortedSessoes, loading: false });
        } catch (error) {
            console.error("Erro ao buscar sessões:", error);
            this.setState({ loading: false });
        }
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
        const { sessoes, filterText, showFilters, loading, camaraId, activeTab } = this.state;

        const filteredSessoes = sessoes.filter((sessao) => {
            const matchesFilter = Object.keys(filterText).every((key) => {
                const sessaoValue = String(sessao[key] || '').toLowerCase();
                const filterValue = filterText[key].toLowerCase();
                return sessaoValue.includes(filterValue);
            });

            if (!matchesFilter) return false;

            if (activeTab === 'abertas') return (sessao.status || '').toLowerCase() === 'aberta';

            return true;
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

                    {!loading && (
                         <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', gap: 2 }}>
                            <button className={`tab-button ${activeTab === 'todas' ? 'active' : ''}`} onClick={() => this.setState({ activeTab: 'todas' })} style={{fontWeight: activeTab === 'todas' ? 'bold' : 'normal', color: activeTab === 'todas' ? '#126B5E' : '#555', borderBottom: activeTab === 'todas' ? '2px solid #126B5E' : '2px solid transparent', padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer'}}>
                                Todas as Sessões
                            </button>
                            <button className={`tab-button ${activeTab === 'abertas' ? 'active' : ''}`} onClick={() => this.setState({ activeTab: 'abertas' })} style={{fontWeight: activeTab === 'abertas' ? 'bold' : 'normal', color: activeTab === 'abertas' ? '#126B5E' : '#555', borderBottom: activeTab === 'abertas' ? '2px solid #126B5E' : '2px solid transparent', padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer'}}>
                                Sessões Abertas
                            </button>
                        </Box>
                    )}

                    {showFilters && (
                        <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                {['numero', 'data', 'tipo', 'legislatura'].map((column) => (
                                    <Grid item xs={12} sm={6} md={3} key={column}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <Typography variant="caption" style={{ fontWeight: 'bold', color: '#555' }}>
                                                {column === 'numero' ? 'Nº da Sessão' : column.charAt(0).toUpperCase() + column.slice(1)}
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
                            <div className="openai-card" key={sessao.id} onClick={() => this.props.history.push(`/sessao-virtual/${camaraId}`, { sessaoId: sessao.id })} style={{cursor: 'pointer'}}>
                                <div className="card-content-openai">
                                    <span className="card-date">{sessao.data} • {new Date(sessao.createdAt).getFullYear()}</span>
                                    <h3>
                                        {sessao.tipo.includes('Sessão Plenária') 
                                            ? sessao.tipo 
                                            : `${sessao.tipo} nº ${sessao.numero}`}
                                    </h3>
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
