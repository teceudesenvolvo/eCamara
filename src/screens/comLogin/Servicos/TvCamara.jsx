import React, { Component } from 'react';
import { 
    FaTv, FaYoutube, FaChartLine, FaCalendarAlt, FaSearch, 
    FaSpinner, FaPlayCircle, FaPlus, FaVideo, FaEye, 
    FaUsers, FaClock, FaEdit, FaTrash 
} from 'react-icons/fa';
import { ref, onValue, update, remove } from 'firebase/database';
import { auth, db } from '../../../firebaseConfig';
import MenuDashboard from '../../../componets/menuAdmin.jsx';

class TvCamara extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videos: [],
            programacao: [],
            loading: true,
            searchTerm: '',
            activeTab: 'repositorio', // 'repositorio' ou 'grade'
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.fetchTvData();
            } else {
                this.props.history.push('/login/' + this.state.camaraId);
            }
        });
    }

    fetchTvData = () => {
        const { camaraId } = this.state;
        const tvRef = ref(db, `${camaraId}/tv_camara`);

        onValue(tvRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const videos = data.videos ? Object.entries(data.videos).map(([key, val]) => ({ id: key, ...val })) : [];
                const programacao = data.programacao ? Object.entries(data.programacao).map(([key, val]) => ({ id: key, ...val })) : [];
                
                // Ordenar vídeos por data (mais recentes primeiro)
                videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                this.setState({ videos, programacao, loading: false });
            } else {
                this.setState({ loading: false });
            }
        });
    };

    getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    render() {
        const { videos, programacao, loading, searchTerm, activeTab } = this.state;

        const filteredVideos = videos.filter(v => 
            v.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Estatísticas Simuladas (Poderiam vir de uma API do YouTube ou DB)
        const stats = {
            totalViews: "12.4k",
            subscribers: "850",
            liveNow: "Sessão Ordinária",
            totalVideos: videos.length
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaTv style={{ color: '#FF0000' }} /> TV Câmara Administrador
                            </h1>
                            <p className="dashboard-header-desc">Gerencie transmissões, vídeos e a grade de programação oficial.</p>
                        </div>
                        <button className="btn-primary" style={{ background: '#FF0000', borderColor: '#FF0000' }}>
                            <FaYoutube /> Vincular Vídeo YouTube
                        </button>
                    </div>

                    {/* Painel de Métricas de Audiência */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#FF0000' }}>
                            <h3 style={{ color: '#FF0000' }}>{stats.totalViews}</h3>
                            <p>Visualizações (30 dias)</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.subscribers}</h3>
                            <p>Inscritos no Canal</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#FF740F' }}>
                            <h3 style={{ color: '#FF740F' }}>{stats.totalVideos}</h3>
                            <p>Vídeos no Repositório</p>
                        </div>
                    </div>

                    {/* Abas de Navegação */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
                        <button 
                            onClick={() => this.setState({ activeTab: 'repositorio' })}
                            style={{ padding: '15px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'repositorio' ? '#126B5E' : '#666', borderBottom: activeTab === 'repositorio' ? '3px solid #126B5E' : 'none', fontWeight: 'bold' }}
                        >
                            <FaVideo /> Repositório de Vídeos
                        </button>
                        <button 
                            onClick={() => this.setState({ activeTab: 'grade' })}
                            style={{ padding: '15px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'grade' ? '#126B5E' : '#666', borderBottom: activeTab === 'grade' ? '3px solid #126B5E' : 'none', fontWeight: 'bold' }}
                        >
                            <FaCalendarAlt /> Grade de Programação
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'repositorio' ? (
                                <div className="repositorio-section">
                                    <div className="dashboard-filter-bar" style={{ marginBottom: '20px' }}>
                                        <div className="search-input-wrapper">
                                            <FaSearch className="search-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar por título do vídeo ou categoria..." 
                                                className="search-input"
                                                value={searchTerm}
                                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                        {filteredVideos.map((video) => {
                                            const videoId = this.getYouTubeID(video.url);
                                            return (
                                                <div key={video.id} className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <img 
                                                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                                            alt={video.titulo} 
                                                            style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                                                        />
                                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                                            <span className="tag tag-primary">{video.categoria}</span>
                                                        </div>
                                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: '#fff', fontSize: '1.5rem' }}>
                                                            <FaPlayCircle />
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '15px' }}>
                                                        <h3 style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: '700' }}>{video.titulo}</h3>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                                                <FaClock /> {new Date(video.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <button className="btn-secondary" style={{ padding: '5px' }}><FaEdit /></button>
                                                                <button className="btn-danger" style={{ padding: '5px', background: 'none', color: '#d32f2f', border: '1px solid #d32f2f' }}><FaTrash /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="grade-section">
                                    <div className="dashboard-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <h3 style={{ margin: 0, color: '#126B5E' }}>Programação Semanal</h3>
                                            <button className="btn-primary" style={{ fontSize: '0.8rem' }}><FaPlus /> Novo Horário</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {programacao.length > 0 ? programacao.map((item) => (
                                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '4px solid #FF740F' }}>
                                                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                                            <strong style={{ display: 'block', fontSize: '1.1rem' }}>{item.horario}</strong>
                                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.diaSemana}</span>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: 0, color: '#333' }}>{item.programa}</h4>
                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{item.descricao}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <span className={`tag ${item.tipo === 'Ao Vivo' ? 'tag-danger' : 'tag-neutral'}`}>{item.tipo}</span>
                                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#126B5E' }}><FaEdit /></button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhuma grade de programação definida.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default TvCamara;
