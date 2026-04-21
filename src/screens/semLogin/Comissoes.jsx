import React, { Component } from 'react';

//Imagens

// Icones
import { FaSpinner, FaTimes, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';

// Components

// Tabela
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../../componets/PageHeader.jsx';

import api from '../../services/api.js';

class Comissoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comissoes: [],
            searchTerm: '',
            showFilters: false,
            loading: true,
            camaraId: this.props.match.params.camaraId || '',
            showModal: false,
            selectedComissao: null
        };
    }

    componentDidMount() {
        this.fetchComissoes();
    }

    fetchComissoes = async () => {
        const { camaraId } = this.state;
        if (!camaraId) {
             this.setState({ loading: false });
             return;
        }

        try {
            const response = await api.get(`/commissions/${camaraId}`);
            const data = response.data || [];
            
            const fetchedComissoes = data.map((val) => ({
                id: val.id,
                nome: val.name || val.nome || 'Comissão sem nome',
                sigla: val.sigla || (val.name || val.nome)?.substring(0, 4).toUpperCase() || 'COM',
                criacao: val.createdAt ? new Date(val.createdAt).toLocaleDateString('pt-BR') : '-',
                tipo: val.tipo || 'Permanente',
                situacao: val.status || 'Ativa',
                descricao: val.descricao || '',
                imagem: val.imagem || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=500&q=60',
                membros: val.membros ? (Array.isArray(val.membros) ? val.membros : Object.values(val.membros)) : [],
                reunioes: val.reunioes ? (Array.isArray(val.reunioes) ? val.reunioes : Object.values(val.reunioes)) : []
            }));

            this.setState({ comissoes: fetchedComissoes, loading: false });
        } catch (error) {
            console.error("Erro ao buscar comissões:", error);
            this.setState({ loading: false });
        }
    };

    handleSearchChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    toggleFilters = () => {
        this.setState(prevState => ({ showFilters: !prevState.showFilters }));
    };

    handleOpenModal = (comissao) => {
        this.setState({ showModal: true, selectedComissao: comissao });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedComissao: null });
    };

    render() {
        const { comissoes, searchTerm, showFilters, loading, showModal, selectedComissao } = this.state;

        const filteredComissoes = comissoes.filter(comissao => {
            return Object.values(comissao).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return (

            <div className='App-header' >
                <div className='openai-section'>
                    <PageHeader 
                        title="Comissões Legislativas" 
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
                                placeholder="Pesquisar comissões..."
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
                        {filteredComissoes.map((row) => (
                            <div className="openai-card" key={row.id} onClick={() => this.handleOpenModal(row)} style={{ cursor: 'pointer' }}>
                                <div className="card-content-openai">
                                    <span className="card-date">{row.situacao} • {row.tipo}</span>
                                    <h3>{row.nome}</h3>
                                    <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '10px' }}>{row.descricao}</p>
                                    
                                    {/* Preview de Membros no Card */}
                                    {row.membros && row.membros.length > 0 && (
                                        <div style={{ display: 'flex', marginTop: '10px', alignItems: 'center' }}>
                                            {row.membros.slice(0, 4).map((membro, index) => (
                                                <img key={index} src={membro.foto || 'https://via.placeholder.com/30'} alt={membro.nome} title={`${membro.nome} - ${membro.cargo}`} 
                                                     style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: index > 0 ? '-10px' : '0' }} />
                                            ))}
                                            {row.membros.length > 4 && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666', border: '2px solid #fff', marginLeft: '-10px' }}>+{row.membros.length - 4}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {!loading && filteredComissoes.length === 0 && (
                        <Typography variant="body1" align="center" style={{ padding: '30px', color: '#666' }}>
                            Nenhuma comissão encontrada.
                        </Typography>
                    )}

                    {/* Modal de Detalhes da Comissão */}
                    {showModal && selectedComissao && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
                                <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ margin: 0, color: '#126B5E' }}>{selectedComissao.nome}</h2>
                                    <button onClick={this.handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>
                                        <FaTimes />
                                    </button>
                                </div>
                                
                                <div style={{ padding: '20px', overflowY: 'auto' }}>
                                    <div style={{ marginBottom: '25px' }}>
                                        <h4 style={{ color: '#555', borderBottom: '2px solid #126B5E', paddingBottom: '5px', display: 'inline-block', marginTop: 0 }}>Sobre a Comissão</h4>
                                        <p style={{ marginTop: '10px', lineHeight: '1.6', color: '#666' }}>{selectedComissao.descricao || 'Sem descrição disponível.'}</p>
                                    </div>

                                    <div style={{ marginBottom: '25px' }}>
                                        <h4 style={{ color: '#555', borderBottom: '2px solid #126B5E', paddingBottom: '5px', display: 'inline-block', marginTop: 0 }}>Membros</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                                            {selectedComissao.membros.length > 0 ? selectedComissao.membros.map((membro, index) => (
                                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                                                    <img src={membro.foto || 'https://via.placeholder.com/50'} alt={membro.nome} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>{membro.nome}</p>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#126B5E' }}>{membro.cargo}</p>
                                                    </div>
                                                </div>
                                            )) : <p style={{ color: '#999' }}>Nenhum membro cadastrado.</p>}
                                        </div>
                                    </div>

                                    {selectedComissao.reunioes && selectedComissao.reunioes.length > 0 && (
                                        <div>
                                            <h4 style={{ color: '#555', borderBottom: '2px solid #126B5E', paddingBottom: '5px', display: 'inline-block', marginTop: 0 }}>Próximas Reuniões</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                                                {selectedComissao.reunioes.sort((a,b) => new Date(b.data) - new Date(a.data)).map((reuniao, idx) => (
                                                    <div key={idx} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                                                                <FaCalendarAlt color="#126B5E" />
                                                                <strong>{new Date(reuniao.data).toLocaleDateString()} às {new Date(reuniao.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                                                            </div>
                                                            <span className={`tag ${reuniao.status === 'Agendada' ? 'tag-warning' : 'tag-success'}`}>{reuniao.status}</span>
                                                        </div>
                                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#555' }}><strong>Pauta:</strong> {reuniao.pauta}</p>
                                                        {reuniao.tipo === 'Virtual' ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#007bff' }}><FaVideo /> Reunião Virtual</div>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#666' }}><FaMapMarkerAlt /> {reuniao.local || 'Local a definir'}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Comissoes;