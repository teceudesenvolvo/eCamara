import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import SlideFeacures from '../../componets/slideFeactures.jsx';
import '../../App.css';
import ChatAI from './ChatAI.jsx';
import { db } from '../../firebaseConfig';
import { ref, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            homeConfig: {},
            vereadores: [],
            agenda: [],
            isChatOpen: false,
            loading: true,
            camaraId: this.props.match.params.camaraId || 'camara-teste',
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        const { camaraId } = this.state;
        this.setState({ loading: true });

        try {
            // 1. Fetch home page configuration
            const configRef = ref(db, `${camaraId}/dados-config/home`);
            const configSnapshot = await get(configRef);
            const homeConfig = configSnapshot.exists() ? configSnapshot.val() : {};

            // 2. Fetch representatives (vereadores)
            const usersRef = ref(db, `${camaraId}/users`);
            // Client-side filtering to avoid needing a Firebase index for now.
            // This is less performant on large datasets but resolves the immediate error.
            const usersSnapshot = await get(usersRef);
            const vereadores = [];
            if (usersSnapshot.exists()) {
                usersSnapshot.forEach(child => {
                    const user = child.val();
                    if (user.tipo === 'vereador') {
                        vereadores.push({ id: child.key, ...user });
                    }
                });
            }

            // 3. Fetch recent matters for "Acontece na Câmara"
            const materiasRef = ref(db, `${camaraId}/materias`);
            // Fetches the last 3 created matters
            const materiasQuery = query(materiasRef, orderByChild('createdAt'), limitToLast(3));
            const materiasSnapshot = await get(materiasQuery);
            const agenda = [];
            if (materiasSnapshot.exists()) {
                materiasSnapshot.forEach(child => {
                    const materia = child.val();
                    // Use dataApresenta if available, otherwise fallback to createdAt
                    const data = new Date(materia.dataApresenta || materia.createdAt);
                    agenda.push({
                        id: child.key,
                        day: data.getDate(),
                        month: data.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
                        time: '19:00', // Placeholder time
                        title: materia.titulo || 'Matéria sem título',
                        location: 'Plenário Virtual', // Placeholder location
                        imagem: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=60' // Placeholder image
                    });
                });
            }

            this.setState({
                homeConfig,
                vereadores,
                agenda: agenda.reverse(), // Reverse to show newest first
                loading: false,
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
        const { homeConfig, agenda, vereadores, isChatOpen, loading, camaraId } = this.state;

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

                    {/* 4. Representatives Section */}
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
                    <ChatAI onClose={this.closeChat} city={homeConfig.cidade || camaraId} />
                )}
            </div>
        );
    }
}

export default HomePage;