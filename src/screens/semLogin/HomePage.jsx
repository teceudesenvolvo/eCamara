import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import SlideFeacures from '../../componets/slideVereadores.jsx';
import '../../App.css';
import ChatAI from './ChatAI.jsx';
import api from '../../services/api.js';
import { normalizeSessionList } from '../../utils/sessionNormalizer';


class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            homeConfig: {},
            vereadores: [],
            agenda: [],
            sessoes: [],
            isChatOpen: false,
            loading: true,
            camaraId: this.props.match.params.camaraId || 'master',
            itemsLimit: 4,
        };
    }

    componentDidMount() {
        this.fetchData();
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        const width = window.innerWidth;
        let limit = 4;
        if (width > 1800) limit = 10;
        else if (width > 1200) limit = 6;
        else if (width > 992) limit = 4;
        
        if (limit !== this.state.itemsLimit) {
            this.setState({ itemsLimit: limit });
        }
    };

    getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    fetchData = async () => {
        const { camaraId } = this.state;
        if (!camaraId || camaraId === ':camaraId' || camaraId === 'camara-teste') return;

        // Persiste o ID da câmara no localStorage para manter o contexto mesmo que a conexão com o banco oscile
        localStorage.setItem('@CamaraAI:councilId', camaraId);

        this.setState({ loading: true });

        try {
            // Fetch data from multiple endpoints via the new API
            const [councilResponse, usersResponse, mattersResponse, sessionsResponse] = await Promise.all([
                api.get(`/councils/${camaraId}`),
                api.get(`/users/council/${camaraId}`).catch(() => api.get(`/users/${camaraId}`)),
                api.get(`/legislative-matters/${camaraId}`),
                api.get(`/sessions/${camaraId}`)
            ]);

            // 1. Home page configuration
            const councilData = councilResponse.data || {};
            const config = councilData.config || councilData.dadosConfig || {};
            const homeConfig = config.home || {};
            const layout = config.layout || {};
            const primaryColor = layout.corPrimaria || '#126B5E';

            // 2. Representatives (vereadores)
            const vereadores = (usersResponse.data || [])
                .filter(u => {
                    const role = (u.role || u.tipo || '').toLowerCase();
                    const cargo = (u.cargo || '').toLowerCase();
                    return role === 'vereador' || role === 'presidente' || role === 'parlamentar' ||
                        cargo.includes('vereador') || cargo.includes('presidente');
                })
                .map(u => ({
                    ...u,
                    foto: u.foto || u.avatar || u.photoURL || 'https://via.placeholder.com/150'
                }));

            // 3. Recent matters for "Acontece na Câmara"
            const agendaRaw = mattersResponse.data || [];
            agendaRaw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const agenda = agendaRaw.slice(0, 8).map(materia => {
                const data = new Date(materia.dataApresenta || materia.createdAt);
                return {
                    id: materia.id,
                    day: data.getDate(),
                    month: data.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
                    time: materia.hora || '19:00',
                    title: materia.titulo || materia.ementa || 'Matéria sem título',
                    location: 'Plenário Virtual',
                    imagem: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=60'
                };
            });

            // 4. Buscar sessões recentes
            const sessoes = normalizeSessionList(sessionsResponse.data);
            sessoes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            this.setState({
                homeConfig,
                vereadores,
                agenda,
                sessoes: sessoes.slice(0, 8),
                loading: false,
            }, () => {
                // Aplica a cor primária do banco de dados ao root do documento
                document.documentElement.style.setProperty('--primary-color', primaryColor);
            });

        } catch (error) {
            console.error("Erro ao buscar dados da câmara:", error);
            this.setState({ loading: false });
        }
    }

    openChat = () => {
        this.setState({ isChatOpen: true });
    }

    closeChat = () => {
        this.setState({ isChatOpen: false });
    }

    render() {
        const { homeConfig, agenda, vereadores, sessoes, isChatOpen, loading, camaraId, itemsLimit } = this.state;

        if (loading) {
            return (
                <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ color: '#333', fontSize: '1.2rem', fontWeight: 500, backdropFilter: 'blur(10px)', padding: '20px 40px', borderRadius: '30px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>Carregando dados da câmara...</p>
                </div>
            );
        }

        return (
            <div className='App-header-modern'>
                <div className='home-content-wrapper'>

                    {/* 1. Hero Section (Gradient Style) */}
                    <div className="hero-section-new">
                        <div className="hero-content-modern">
                            <h1>{homeConfig.titulo || 'Camara AI'}</h1>
                            <p style={{ color: '#ffffff !important' }}>{homeConfig.slogan || `Inteligência Artificial para uma legislação mais transparente e acessível em ${camaraId}.`}</p>
                            <div className="hero-buttons-modern">
                                <Link to={`/materias/${camaraId}`} className="btn-modern btn-primary-modern">Explorar Projetos</Link>
                                <Link to={`/login/${camaraId}`} className="btn-modern btn-secondary-modern">Acesso Restrito</Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. Search Bar Floating */}
                    <div className="openai-search-container">
                        <div className="search-box-wrapper-openai">
                            <input
                                type="text"
                                className="smart-search-input-modern"
                                placeholder="Pergunte sobre leis, sessões ou vereadores..."
                                onFocus={this.openChat}
                            />
                            <button className="smart-search-btn-modern"><FaSearch /></button>
                        </div>
                    </div>

                    {/* 3. Content Grid (Agenda & Updates) */}
                    <div className="openai-section">
                        <div className="section-header-openai">
                            <h2>Acontece na Câmara</h2>
                            <Link to={`/materias/${camaraId}`} className="view-all-link">Ver tudo <FaArrowRight /></Link>
                        </div>
                        <div className="modern-grid">
                            {agenda.length > 0 ? agenda.slice(0, itemsLimit).map(item => (
                                <div className="glass-card" key={item.id} onClick={() => this.props.history.push(`/materia/${camaraId}/${item.id}`)}>
                                    <div className="card-content-modern">
                                        <span className="card-tag">{item.day} {item.month} • {item.time}</span>
                                        <h3 className="card-title-modern">{item.title}</h3>
                                        <p className="card-desc-modern">{item.location}</p>
                                    </div>
                                </div>
                            )) : <p style={{ color: '#555', textAlign: 'center', width: '100%', fontWeight: 500 }}>Nenhuma matéria votada recentemente.</p>}
                        </div>
                    </div>

                    {/* 4. Sessoes Plenarias */}
                    <div className="openai-section">
                        <div className="section-header-openai">
                            <h2>Sessões Plenárias</h2>
                            <Link to={`/sessoes/${camaraId}`} className="view-all-link">Ver tudo <FaArrowRight /></Link>
                        </div>
                        <div className="modern-grid no-hover-container">
                            {sessoes.length > 0 ? sessoes.slice(0, itemsLimit).map(sessao => {
                                const videoId = this.getYouTubeID(sessao.urlTransmissao || sessao.transmissaoUrl);
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
                                            <h3 className="card-title-modern">{sessao.tipo} nº {sessao.numero}</h3>
                                            <p className="card-desc-modern">Acompanhe os detalhes da sessão</p>
                                        </div>
                                    </div>
                                );
                            }) : <p style={{ color: '#555', textAlign: 'center', width: '100%', fontWeight: 500 }}>Nenhuma sessão plenária registrada recentemente.</p>}
                        </div>
                    </div>

                    {/* 5. Representatives Section */}
                    <div className="openai-section">
                        <div className="section-header-openai">
                            <h2>Nossos Representantes</h2>
                        </div>
                        <div className='HomeDesktopCarrosel'>
                            <SlideFeacures vereadores={vereadores} />
                        </div>
                    </div>

                </div>

                {/* Popup do Chat AI */}
                {isChatOpen && (
                    <ChatAI onClose={this.closeChat} city={camaraId} />
                )}
            </div>
        );
    }
}

export default HomePage;