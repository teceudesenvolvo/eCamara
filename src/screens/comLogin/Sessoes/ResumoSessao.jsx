import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { FaFileAlt, FaUsers, FaCheckCircle, FaInfoCircle, FaCalendarAlt, FaArrowLeft, FaVideo, FaVoteYea, FaUser } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class ResumoSessao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessao: null,
            loading: true,
            camaraId: this.props.match.params.camaraId,
            parlamentares: [],
            selectedMateria: null,
            showMateriaModal: false,
            selectedParlamentar: null,
            showParlamentarModal: false,
        };
    }

    componentDidMount() {
        this.fetchSessao();
        this.fetchParlamentares();
    }

    fetchSessao = async () => {
        const { state } = this.props.location;
        const sessaoId = state ? state.sessaoId : null;

        if (!sessaoId) {
            this.setState({ loading: false });
            return;
        }

        try {
            const response = await api.get(`/session-detail/${sessaoId}`);
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            if (data) {
                this.setState({ sessao: { ...data, id: data.id || data._id }, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar sessão:", error);
            this.setState({ loading: false });
        }
    };

    fetchParlamentares = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/users/council/${camaraId}`);
            const allUsers = response.data || [];
            const parlamentares = allUsers.filter(u => u.tipo === 'vereador' || u.tipo === 'presidente');
            this.setState({ parlamentares });
        } catch (error) {
            console.error("Erro ao buscar parlamentares:", error);
        }
    };

    getVoteCounts = (votos) => {
        const counts = { sim: 0, nao: 0, abstencao: 0 };
        if (!votos) return counts;
        Object.values(votos).forEach(v => {
            if (v.voto === 'sim') counts.sim++;
            else if (v.voto === 'nao') counts.nao++;
            else if (v.voto === 'abstencao' || v.voto === 'abstencão') counts.abstencao++;
        });
        return counts;
    };

    handleOpenMateriaModal = (materia) => {
        this.setState({ selectedMateria: materia, showMateriaModal: true });
    };

    handleCloseMateriaModal = () => {
        this.setState({ showMateriaModal: false, selectedMateria: null });
    };

    handleOpenParlamentarModal = (parlamentar) => {
        this.setState({ selectedParlamentar: parlamentar, showParlamentarModal: true });
    };

    handleCloseParlamentarModal = () => {
        this.setState({ showParlamentarModal: false, selectedParlamentar: null });
    };

    render() {
        const { sessao, loading, parlamentares, showMateriaModal, selectedMateria, showParlamentarModal, selectedParlamentar } = this.state;

        if (loading) return <div className='App-header' style={{ justifyContent: 'center' }}><p>Carregando resumo...</p></div>;
        if (!sessao) return <div className='App-header' style={{ justifyContent: 'center' }}><p>Sessão não encontrada.</p></div>;

        const materias = sessao.itens || [];
        const presenca = sessao.presenca || {};
        const presenceList = Object.keys(presenca).map(uid => {
            return parlamentares.find(p => p.id === uid);
        }).filter(Boolean);

        return (
            <div className='App-header' style={{ marginLeft: '-10px', width: '100%', alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5', height: '100vh', overflow: 'hidden' }}>
                <MenuDashboard />
                <div className='dashboard-content' style={{ width: '100%', height: '100%', padding: '40px', overflowY: 'auto' }}>
                    <div className='dashboard-header' style={{ marginBottom: '30px' }}>
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaCheckCircle /> {sessao.tipo} - {sessao.data}
                            </h1>
                            <p className="dashboard-header-desc">Status Final: {sessao.status}</p>
                        </div>
                    </div>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            {sessao.transmissaoUrl && (
                                <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
                                    <div className='player-wrapper' style={{ borderRadius: 0, width: '100%', background: '#000' }}>
                                        <ReactPlayer 
                                            className='react-player' 
                                            url={sessao.transmissaoUrl} 
                                            width='100%' 
                                            height='100%' 
                                            controls={true} 
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="dashboard-card">
                                <h3 style={{ marginTop: 0, color: '#126B5E', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <FaFileAlt /> Matérias Deliberadas
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {materias.length > 0 ? materias.map((materia, index) => (
                                        <Card key={index} variant="outlined" sx={{ borderRadius: '10px', cursor: 'pointer' }} onClick={() => this.handleOpenMateriaModal(materia)}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {materia.tipoMateria} {materia.numero}
                                                    </Typography>
                                                    <Chip 
                                                        label={materia.status || 'Finalizada'} 
                                                        color={materia.status === 'Aprovada' || materia.status === 'Aprovado' ? 'success' : materia.status === 'Rejeitada' || materia.status === 'Rejeitado' ? 'error' : 'default'}
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {materia.ementa}
                                                </Typography>
                                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                                    {(() => {
                                                        const counts = this.getVoteCounts(materia.votos);
                                                        return (
                                                            <>
                                                                <Chip size="small" icon={<FaVoteYea />} label={`Sim: ${counts.sim}`} color="success" variant="outlined" />
                                                                <Chip size="small" icon={<FaVoteYea />} label={`Não: ${counts.nao}`} color="error" variant="outlined" />
                                                                <Chip size="small" icon={<FaVoteYea />} label={`Abs: ${counts.abstencao}`} variant="outlined" />
                                                            </>
                                                        );
                                                    })()}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    )) : <p>Nenhuma matéria registrada nesta sessão.</p>}
                                </div>
                            </div>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <div className="dashboard-card" style={{ marginBottom: '20px' }}>
                                <h3 style={{ marginTop: 0, color: '#126B5E', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <FaUsers /> Lista de Presença
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-start' }}>
                                    {presenceList.length > 0 ? presenceList.map((p) => (
                                        <div 
                                            key={p.id} 
                                            style={{ cursor: 'pointer', textAlign: 'center' }}
                                            onClick={() => this.handleOpenParlamentarModal(p)}
                                            title={p.nome}
                                        >
                                            {p.foto ? (
                                                <img 
                                                    src={p.foto} 
                                                    alt={p.nome} 
                                                    style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #126B5E', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ccc' }}>
                                                    <FaUser color="#999" />
                                                </div>
                                            )}
                                        </div>
                                    )) : <p style={{ fontStyle: 'italic', color: '#999', width: '100%' }}>Nenhum registro de presença.</p>}
                                </div>
                            </div>
                        
                        </Grid>
                    </Grid>

                    {showMateriaModal && selectedMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '700px' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedMateria.tipoMateria} nº {selectedMateria.numero}</h2>
                                    <button onClick={this.handleCloseMateriaModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
                                </div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '15px', textAlign: 'left' }}>
                                    <p><strong>Autor:</strong> {selectedMateria.autor}</p>
                                    <p><strong>Ementa:</strong> {selectedMateria.ementa}</p>
                                    <div style={{ marginTop: '20px' }} dangerouslySetInnerHTML={{ __html: selectedMateria.textoMateria }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {showParlamentarModal && selectedParlamentar && (
                        <div className="modal-overlay" onClick={this.handleCloseParlamentarModal}>
                            <div className="modal-content" style={{ maxWidth: '350px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Dados do Parlamentar</h2>
                                    <button onClick={this.handleCloseParlamentarModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
                                </div>
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <img 
                                        src={selectedParlamentar.foto} 
                                        alt={selectedParlamentar.nome} 
                                        style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 0 }}>{selectedParlamentar.nome}</Typography>
                                    <Chip label={selectedParlamentar.tipo || 'Vereador'} color="primary" variant="outlined" />
                                    {selectedParlamentar.partido && <Typography variant="body2" color="text.secondary">Partido: {selectedParlamentar.partido}</Typography>}
                                </Box>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ResumoSessao;