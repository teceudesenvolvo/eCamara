import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import SlideFeacures from '../componets/slideFeactures';
import '../App.css';
import ChatAI from './ChatAI';

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Configuração dinâmica da Câmara (simulando API/Config)
            city: 'Blumenau',
            uf: 'SC',
            stats: {
                aiLaws: 127,
                votes: 842
            },
            latestLaw: {
                number: 'Lei nº 4.521/2026',
                summary: 'Institui o programa de incentivo à inovação tecnológica nas escolas municipais, prevendo verba para robótica e IA.'
            },
            agenda: [
                { id: 1, day: '14', month: 'JUN', time: '14:00', title: 'Sessão Ordinária', location: 'Plenário Virtual' },
                { id: 2, day: '15', month: 'JUN', time: '09:00', title: 'Comissão de Finanças', location: 'Sala das Comissões' },
                { id: 3, day: '16', month: 'JUN', time: '19:00', title: 'Audiência Pública: Saúde', location: 'Auditório Principal' }
            ],
            isChatOpen: false,
        };
    }

    openChat = () => {
        this.setState({ isChatOpen: true });
    }

    closeChat = () => {
        this.setState({ isChatOpen: false });
    }

    render() {
        const { city, agenda, isChatOpen } = this.state;

        return (
            <div className='App-header'>
                <div className='Home-Dach'>
                    
                    {/* 1. Hero Section (Gradient Style) */}
                    <div className="hero-section-new">
                        <div className="hero-content-openai">
                            <h1>Camara AI</h1>
                            <p>Inteligência Artificial para uma legislação mais transparente e acessível em {city}.</p>
                            <div className="hero-buttons-openai">
                                <Link to="/Materias" className="btn-openai btn-primary">Explorar Projetos</Link>
                                <Link to="/login" className="btn-openai btn-secondary">Acesso Restrito</Link>
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
                            <Link to="/sessoes" className="view-all-link">Ver tudo <FaArrowRight /></Link>
                        </div>
                        <div className="openai-grid">
                            {agenda.map(item => (
                                <div className="openai-card" key={item.id}>
                                    <div className="card-image-placeholder"></div>
                                    <div className="card-content-openai">
                                        <span className="card-date">{item.day} {item.month} • {item.time}</span>
                                        <h3>{item.title}</h3>
                                        <p>{item.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Representatives Section */}
                    <div className="openai-section">
                        <div className="section-header-openai">
                            <h2>Nossos Representantes</h2>
                        </div>
                        <div className='HomeDesktopCarrosel'>
                            <SlideFeacures />
                        </div>
                    </div>
                    
                </div>

                {/* Popup do Chat AI */}
                {isChatOpen && (
                    <ChatAI onClose={this.closeChat} />
                )}
            </div>
        );
    }
}

export default HomePage;
