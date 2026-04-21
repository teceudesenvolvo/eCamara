import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import SlideFeacures from '../../componets/slideFeactures.jsx';
import '../../App.css';
import ChatAI from './ChatAI.jsx';
import api from '../../services/api.js';


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
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    fetchData = async () => {
        const { camaraId } = this.state;
        if (!camaraId || camaraId === ':camaraId' || camaraId === 'camara-teste') return;

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
            const vereadores = (usersResponse.data || []).filter(u => u.tipo === 'vereador');

            // 3. Recent matters for "Acontece na Câmara"
            const agendaRaw = mattersResponse.data || [];
            agendaRaw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const agenda = agendaRaw.slice(0, 3).map(materia => {
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
            const sessoes = sessionsResponse.data || [];
            sessoes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            this.setState({
                homeConfig,
                vereadores,
                agenda,
                sessoes: sessoes.slice(0, 3),
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
        const { homeConfig, agenda, vereadores, sessoes, isChatOpen, loading, camaraId } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <p>Carregando dados da câmara...</p>
                </div>
            );
        }

        return (
            <div className='App-header'>
                <div className='Home-Dach'>

                    {/* 1. Hero Section (Gradient Style) */}
                    <div className="hero-section-new">
                        <div className="hero-content-openai">
                            <h1>{homeConfig.titulo || 'Camara AI'}</h1>
                            <p>{homeConfig.slogan || `Inteligência Artificial para uma legislação mais transparente e acessível em ${camaraId}.`}</p>
                            <div className="hero-buttons-openai">
                                <Link to={`/materias/${camaraId}`} className="btn-openai btn-primary">Explorar Projetos</Link>
                                <Link to={`/login/${camaraId}`} className="btn-openai btn-secondary">Acesso Restrito</Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. Search Bar Floating */}
                    <div className="openai-search-container">
                        <div className="search-box-wrapper-openai">
                            <input
                                type="text"
                                className="smart-search-input-openai"
                                placeholder="Pergunte sobre leis, sessões ou vereadores..."
                                onFocus={this.openChat}
                            />
                            <button className="smart-search-btn-openai"><FaSearch /></button>
                        </div>
                    </div>

                    {/* 3. Content Grid (Agenda & Updates) */}
                    <div className="openai-section">
                        <div className="section-header-openai">
                            <h2>Acontece na Câmara</h2>
                            <Link to={`/materias/${camaraId}`} className="view-all-link">Ver tudo <FaArrowRight /></Link>
                        </div>
                        <div className="openai-grid">
                            {agenda.length > 0 ? agenda.map(item => (
                                <div className="openai-card" key={item.id} onClick={() => this.props.history.push(`/materia/${camaraId}/${item.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className="card-content-openai">
                                        <span className="card-date">{item.day} {item.month} • {item.time}</span>
                                        <h3>{item.title}</h3>
                                        <p>{item.location}</p>
                                    </div>
                                </div>
                            )) : <p>Nenhuma matéria votada recentemente.</p>}
                        </div>
                    </div>

                    {/* 4. Sessoes Plenarias */}
                    <div className="openai-section">
                        <div className="section-header-openai">
                            <h2>Sessões Plenárias</h2>
                            <Link to={`/sessoes/${camaraId}`} className="view-all-link">Ver tudo <FaArrowRight /></Link>
                        </div>
                        <div className="openai-grid">
                            {sessoes.length > 0 ? sessoes.map(sessao => {
                                const videoId = this.getYouTubeID(sessao.transmissaoUrl);
                                const thumbUrl = videoId 
                                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                    : 'https://via.placeholder.com/480x270?text=Sessão+Sem+Vídeo';
                                
                                return (
                                    <div className="openai-card" key={sessao.id} onClick={() => this.props.history.push(`/sessao-virtual/${camaraId}`, { sessaoId: sessao.id })} style={{ cursor: 'pointer' }}>
                                        <img src={thumbUrl} alt={sessao.tipo} className="card-image" />
                                        <div className="card-content-openai">
                                            <span className="card-date">{sessao.data} • {sessao.status}</span>
                                            <h3>{sessao.tipo} nº {sessao.numero}</h3>
                                            <p>Clique para acompanhar os detalhes</p>
                                        </div>
                                    </div>
                                );
                            }) : <p>Nenhuma sessão plenária registrada recentemente.</p>}
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