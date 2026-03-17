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
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';

class NormasJuridicas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            normas: [],
            searchTerm: '',
            showFilters: false,
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
            // Busca da base de conhecimento configurada no painel admin
            const normasRef = ref(db, `${camaraId}/dados-config/base-conhecimento`);
            const snapshot = await get(normasRef);
            
            const fetchedNormas = [];

            if (snapshot.exists()) {
                const data = snapshot.val();

                // Mapeia a Lei Orgânica se existir
                if (data.leiOrganicaText) {
                    fetchedNormas.push({
                        id: 'lei-organica',
                        tipo: 'Lei Orgânica',
                        numero: '',
                        ano: '',
                        data: 'Texto Consolidado',
                        descricao: 'Lei máxima do município. Estabelece as regras e competências locais e a organização dos poderes.',
                        status: 'Vigente',
                        imagem: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=60',
                        textoCompleto: data.leiOrganicaText,
                    });
                }

                // Mapeia o Regimento Interno se existir
                if (data.regimentoText) {
                    fetchedNormas.push({
                        id: 'regimento-interno',
                        tipo: 'Regimento Interno',
                        numero: '',
                        ano: '',
                        data: 'Texto Consolidado',
                        descricao: 'Conjunto de normas que regem o funcionamento interno da Câmara Municipal e o Processo Legislativo.',
                        status: 'Vigente',
                        imagem: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=60',
                        textoCompleto: data.regimentoText,
                    });
                }
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
            <div className='App-header'>
                <div className='openai-section'>
                    <PageHeader 
                        title="Normas Jurídicas" 
                        onToggleFilters={this.toggleFilters} 
                    />

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    )}

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
                            <div className="openai-card" key={norma.id} onClick={() => this.handleOpenModal(norma)} style={{ cursor: 'pointer' }}>
                                <div className="card-content-openai">
                                    <span className="card-date">{norma.data}</span>
                                    <h3>
                                        {norma.tipo} {norma.numero ? `nº ${norma.numero}/${norma.ano}` : ''}
                                    </h3>
                                    <p>{norma.descricao}</p>
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
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedNorma.tipo}</h2>
                                    <button onClick={this.handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>
                                        <FaTimes />
                                    </button>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', textAlign: 'left', whiteSpace: 'pre-wrap', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', color: '#333' }}>
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