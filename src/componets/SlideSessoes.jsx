import React, { Component } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { withRouter } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { ref, get } from 'firebase/database';
import { FaPlayCircle, FaCalendarAlt } from 'react-icons/fa';
import '@splidejs/react-splide/css';

class SlideSessoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessoes: [],
            loading: true
        };
    }

    componentDidMount() {
        this.fetchSessoes();
    }

    getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    fetchSessoes = async () => {
        const { camaraId } = this.props.match.params;
        if (!camaraId) return;

        try {
            const sessoesRef = ref(db, `${camaraId}/sessoes`);
            const snapshot = await get(sessoesRef);
            
            if (snapshot.exists()) {
                const data = [];
                snapshot.forEach(child => {
                    data.push({ id: child.key, ...child.val() });
                });
                // Ordena por data mais recente
                data.sort((a, b) => {
                    const dateA = a.data.split('/').reverse().join('');
                    const dateB = b.data.split('/').reverse().join('');
                    return dateB.localeCompare(dateA);
                });
                this.setState({ sessoes: data, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar sessões:", error);
            this.setState({ loading: false });
        }
    };

    render() {
        const { sessoes, loading } = this.state;
        const { camaraId } = this.props.match.params;

        if (loading) return <p style={{ textAlign: 'center', padding: '20px', color: '#86868b' }}>Sincronizando transmissões...</p>;
        if (sessoes.length === 0) return null;

        return (
            <div className="splide-container">
                <div className="section-header-openai" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h2 className='section-header-openai h2'>Sessões Plenárias</h2>
                    <button onClick={() => this.props.history.push(`/sessoes/${camaraId}`)} style={{ background: 'none', border: 'none', color: '#007aff', fontWeight: 600, cursor: 'pointer' }}>Ver todas</button>
                </div>

                <Splide 
                    options={{ 
                        type: 'slide', 
                        perPage: 4, 
                        perMove: 1, 
                        gap: '1rem', 
                        pagination: false, 
                        arrows: true, 
                        breakpoints: { 
                            1024: { perPage: 2 },
                            768: { perPage: 1 } 
                        } 
                    }}
                >
                    {sessoes.slice(0, 6).map((sessao) => {
                        const videoId = this.getYouTubeID(sessao.transmissaoUrl);
                        const thumbUrl = videoId 
                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            : 'https://via.placeholder.com/480x270?text=Transmissao+Indisponivel';

                        return (
                            <SplideSlide key={sessao.id} className="representative-card-slide">
                                <div className="session-card-home" onClick={() => this.props.history.push(`/sessao-virtual/${camaraId}`, { sessaoId: sessao.id })} style={{ borderTop: '4px solid #126B5E', borderRadius: '12px' }}>
                                    <div className="session-thumb-wrapper">
                                        <img src={thumbUrl} alt={sessao.tipo} className="session-thumb" />
                                        <div className="play-overlay"><FaPlayCircle size={48} color="#fff" /></div>
                                        <div className="session-status-tag">{sessao.status}</div>
                                    </div>
                                    <div className="session-card-content">
                                        <p className="session-date-home"><FaCalendarAlt size={12} /> {sessao.data}</p>
                                        <h3 className="session-title-home">{sessao.tipo}</h3>
                                        <p className="session-subtitle-home">Sessão nº {sessao.numero}</p>
                                    </div>
                                </div>
                            </SplideSlide>
                        );
                    })}
                </Splide>
            </div>
        );
    }
}

export default withRouter(SlideSessoes);