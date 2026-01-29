import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaRobot, FaUsers, FaGavel, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
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
        const { city, stats, latestLaw, agenda, isChatOpen } = this.state;

        return (
            <div className='App-header'>
                <div className='Home-Dach'>
                    
                    {/* 1. Hero Section (Destaque Principal) */}
                    <div className="hero-section-new">
                        <h1>O Futuro do Legislativo chegou em {city}.</h1>
                        <p>Legislação inteligente, participação direta e transparência total com Inteligência Artificial.</p>
                        <div className="hero-buttons">
                            <Link to="/Materias" className="btn-hero btn-citizen">Sou Cidadão: Ver Projetos</Link>
                            <Link to="/login" className="btn-hero btn-parliament">Acesso Parlamentar</Link>
                        </div>
                    </div>

                     {/* 2. Busca Inteligente por Voz ou Texto */}
                    <div className="smart-search-section">
                        <h2>O que você quer saber sobre sua cidade?</h2>
                        <div className="search-box-wrapper">
                            <input 
                                type="text" 
                                className="smart-search-input" 
                                placeholder="Ex: O que a cidade tem de leis sobre proteção animal?"
                                onFocus={this.openChat} 
                            />
                            <button className="smart-search-btn"><FaSearch /></button>
                        </div>
                        <p className="search-hint">A IA faz a varredura e entrega um resumo explicado, convidando você a participar.</p>
                    </div>

                    {/* 3. Painel de Transparência em Tempo Real */}
                    <div className="transparency-panel">
                        <div className="widget-card">
                            <FaRobot className="widget-icon" />
                            <h3>{stats.aiLaws}</h3>
                            <p>leis criadas com auxílio de IA este ano.</p>
                        </div>
                        <div className="widget-card">
                            <FaUsers className="widget-icon" />
                            <h3>{stats.votes}</h3>
                            <p>cidadãos votaram nas consultas públicas esta semana.</p>
                        </div>
                        <div className="widget-card latest-law">
                            <div className="latest-law-header">
                                <FaGavel className="widget-icon" />
                                <span>Última Lei Sancionada</span>
                            </div>
                            <h4>{latestLaw.number}</h4>
                            <p className="ai-summary">Resumo IA: {latestLaw.summary}</p>
                        </div>
                    </div>


                    {/* 4. Agenda Legislativa (Substituindo Como Funciona) */}
                    <div className="agenda-section">
                        <h2>Agenda Legislativa</h2>
                        <div className="agenda-container">
                            {agenda.map(item => (
                                <div className="agenda-card" key={item.id}>
                                    <div className="agenda-date">
                                        <span className="agenda-day">{item.day}</span>
                                        <span className="agenda-month">{item.month}</span>
                                    </div>
                                    <div className="agenda-info">
                                        <span className="agenda-time"><FaClock style={{marginRight: '5px'}}/> {item.time}</span>
                                        <h3 className="agenda-title">{item.title}</h3>
                                        <span className="agenda-location"><FaMapMarkerAlt style={{marginRight: '5px'}}/> {item.location}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                </div>

                {/* Popup do Chat AI */}
                {isChatOpen && (
                    <div className="chat-popup-overlay">
                        <ChatAI onClose={this.closeChat} />
                    </div>
                )}
            </div>
        );
    }
}

export default HomePage;
