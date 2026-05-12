import React, { Component } from 'react';

// Material-UI Table Components
import Typography from '@mui/material/Typography'; // For the title
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../componets/PageHeader.jsx';
import { FaSpinner, FaTimes } from 'react-icons/fa';

// Firebase
import api from '../../services/api.js';

class NormasJuridicas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            normas: [],
            searchTerm: '',
            showFilters: true,
            loading: true,
            camaraId: this.props.match.params.camaraId || '',
            showModal: false,
            selectedNorma: null,
        };
    }

    componentDidMount() {
        this.fetchNormas();
    }

    fetchNormas = async () => {
        const { camaraId } = this.state;
        if (!camaraId) {
             this.setState({ loading: false });
             return;
        }

        try {
            // Busca da base de conhecimento configurada no painel admin via API
            const response = await api.get(`/councils/${camaraId}`);
            const councilData = response.data || {};
            const config = councilData.config || councilData.dadosConfig || {};
            const baseData = config['base-conhecimento'] || {};
            
            const fetchedNormas = [];

            // Mapeia a Lei Orgânica se existir
            if (baseData.leiOrganicaText) {
                fetchedNormas.push({
                    id: 'lei-organica',
                    tipo: 'Lei Orgânica',
                    numero: '',
                    ano: '',
                    data: 'Texto Consolidado',
                    descricao: 'Lei máxima do município. Estabelece as regras e competências locais e a organização dos poderes.',
                    status: 'Vigente',
                    imagem: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=60',
                    textoCompleto: baseData.leiOrganicaText,
                });
            }

            // Mapeia o Regimento Interno se existir
            if (baseData.regimentoText) {
                fetchedNormas.push({
                    id: 'regimento-interno',
                    tipo: 'Regimento Interno',
                    numero: '',
                    ano: '',
                    data: 'Texto Consolidado',
                    descricao: 'Conjunto de normas que regem o funcionamento interno da Câmara Municipal e o Processo Legislativo.',
                    status: 'Vigente',
                    imagem: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=60',
                    textoCompleto: baseData.regimentoText,
                });
            }

            this.setState({ normas: fetchedNormas, loading: false });
        } catch (error) {
            console.error("Erro ao buscar normas:", error);
            this.setState({ loading: false });
        }
    };

    // Handler for search input changes
    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    toggleFilters = () => {
        this.setState(prevState => ({ showFilters: !prevState.showFilters }));
    };

    handleOpenModal = (norma) => {
        this.setState({ showModal: true, selectedNorma: norma });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedNorma: null });
    };

    render() {
        const { normas, searchTerm, showFilters, loading, showModal, selectedNorma } = this.state;

        // Filter the normas array based on the search term
        const filteredNormas = normas.filter((norma) => {
            return Object.values(norma).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return (
            <div className='App-header-modern'>
                <div className='home-content-wrapper' style={{ gap: '30px' }}>
                   

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    )}

                    <div className="search-box-wrapper-openai" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: 'none', marginBottom: '10px', padding: '10px 5px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
                        <div style={{ flex: 1, padding: '5px 15px' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Pesquisar normas..."
                                value={searchTerm}
                                onChange={this.handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon style={{ color: '#555' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: 'transparent', '& fieldset': { border: 'none' } } }}
                            />
                        </div>
                    </div>

                    <h1 style={{ marginBottom: '10px', color: '#333' }}>Normas Jurídicas</h1>

                    <div className="modern-grid">
                        {filteredNormas.map((norma) => (
                            <div className="glass-card" key={norma.id} onClick={() => this.handleOpenModal(norma)} style={{ cursor: 'pointer', padding: '24px' }}>
                                <div className="card-content-modern">
                                    <span className="card-tag">{norma.data}</span>
                                    <h3 className="card-title-modern">
                                        {norma.tipo} {norma.numero ? `nº ${norma.numero}/${norma.ano}` : ''}
                                    </h3>
                                    <p className="card-desc-modern">{norma.descricao}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {!loading && filteredNormas.length === 0 && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Nenhuma norma encontrada.
                        </Typography>
                    )}

                    {showModal && selectedNorma && (
                        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '0', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(25px) saturate(200%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,1)' }}>
                                <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1a1a1a', fontWeight: '700' }}>{selectedNorma.tipo}</h2>
                                    <button onClick={this.handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>
                                        <FaTimes />
                                    </button>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '30px', textAlign: 'left', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.4)', borderRadius: '0 0 24px 24px', color: '#333', lineHeight: '1.6' }}>
                                    {selectedNorma.textoCompleto}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default NormasJuridicas;