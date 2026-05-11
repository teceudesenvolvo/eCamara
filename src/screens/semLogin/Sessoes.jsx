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

import api from '../../services/api';

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
            showFilters: true,
            activeTab: 'todas', // 'todas' ou 'abertas'
            camaraId: this.props.match.params.camaraId || 'camara-teste',
        };
    }

    componentDidMount() {
        this.fetchSessoes();
    }

    fetchSessoes = async () => {
        const { camaraId } = this.state;

        try {
            const response = await api.get(`/sessions/${camaraId}`);
            const sessoes = response.data;

            // O backend já retorna ordenado por data de criação decrescente
            // Se precisarmos manter a prioridade de "Abertas" no topo, fazemos aqui:
            const sortedSessoes = Array.isArray(sessoes) ? sessoes.sort((a, b) => {
                if (a.status === 'Aberta' && b.status !== 'Aberta') return -1;
                if (a.status !== 'Aberta' && b.status === 'Aberta') return 1;
                return 0; // Mantém a ordem do backend para o resto
            }) : [];

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

    getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    render() {
        const { sessoes, filterText, showFilters, loading, camaraId, activeTab } = this.state;

        const filteredSessoes = sessoes.filter((sessao) => {
            const matchesFilter = Object.keys(filterText).every((key) => {
                const sessaoValue = String(sessao[key] || '').toLowerCase();
                const filterValue = String(filterText[key] || '').toLowerCase();
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
            <div className='App-header-modern'>
                <div className='home-content-wrapper' style={{ gap: '30px' }}>
                   

                    {loading && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Carregando sessões...
                        </Typography>
                    )}

                    {!loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
                            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '30px', padding: '5px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                <button onClick={() => this.setState({ activeTab: 'todas' })} style={{ background: activeTab === 'todas' ? '#fff' : 'transparent', color: activeTab === 'todas' ? '#1a1a1a' : '#555', border: 'none', borderRadius: '25px', padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: activeTab === 'todas' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                                    Todas as Sessões
                                </button>
                                <button onClick={() => this.setState({ activeTab: 'abertas' })} style={{ background: activeTab === 'abertas' ? '#fff' : 'transparent', color: activeTab === 'abertas' ? '#1a1a1a' : '#555', border: 'none', borderRadius: '25px', padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: activeTab === 'abertas' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                                    Sessões Abertas
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="search-box-wrapper-openai" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: 'none', marginBottom: '10px', padding: '10px 5px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
                            {['numero', 'data', 'tipo', 'legislatura'].map((column, index, array) => (
                                <div key={column} style={{ flex: '1 1 calc(20% - 10px)', minWidth: '200px', borderRight: (index + 1) % 4 !== 0 && index !== array.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', padding: '5px 15px' }}>
                                    {selectFields.includes(column) ? (
                                        <TextField
                                            select
                                            name={column}
                                            value={filterText[column]}
                                            onChange={this.handleFilterChange}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            label={column === 'numero' ? 'Nº da Sessão' : column.charAt(0).toUpperCase() + column.slice(1)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: 'transparent', '& fieldset': { border: 'none' } }, '& .MuiInputLabel-root': { fontSize: '0.85rem', color: '#777' } }}
                                        >
                                            <MenuItem value=""><em>{column.charAt(0).toUpperCase() + column.slice(1)}: Todos</em></MenuItem>
                                            {getUniqueValues(column).map((option) => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </TextField>
                                    ) : (
                                        <TextField
                                            name={column}
                                            value={filterText[column]}
                                            onChange={this.handleFilterChange}
                                            placeholder={column === 'numero' ? 'Nº da Sessão' : column.charAt(0).toUpperCase() + column.slice(1)}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: 'transparent', '& fieldset': { border: 'none' } } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon fontSize="small" style={{ color: '#bbb' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                    </div>

                    <div className="modern-grid no-hover-container">
                        {filteredSessoes.map((sessao) => {
                            const videoId = this.getYouTubeID(sessao.transmissaoUrl);
                            const thumbUrl = videoId
                                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                : 'https://via.placeholder.com/480x270?text=Sessão+Sem+Vídeo';

                            return (
                                <div className="glass-card" key={sessao.id} onClick={() => this.props.history.push(`/sessao-virtual/${camaraId}`, { sessaoId: sessao.id })}>
                                    <div className="card-image-wrapper">
                                        <img src={thumbUrl} alt={sessao.tipo} className="card-image-modern" />
                                    </div>
                                    <div className="card-content-modern">
                                        <span className="card-tag">{sessao.data} • {sessao.status}</span>
                                        <h3 className="card-title-modern">
                                            {(sessao.tipo || '').includes('Sessão Plenária')
                                                ? sessao.tipo
                                                : `${sessao.tipo || 'Sessão'} nº ${sessao.numero || 'S/N'}`}
                                        </h3>
                                        <p className="card-desc-modern">Acompanhe os detalhes e os documentos pautados.</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredSessoes.length === 0 && (
                        <div style={{ width: '100%', textAlign: 'center', marginTop: '40px' }}>
                            <p style={{ color: '#555', fontSize: '1.2rem', fontWeight: 500 }}>
                                Nenhum resultado encontrado.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Sessoes;
