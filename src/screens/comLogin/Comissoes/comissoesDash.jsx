import React, { Component } from 'react';
import { FaUsers, FaArrowRight } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx'; // Reusing for member avatar
import api from '../../../services/api.js';

class ComissoesDash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comissoes: [],
            loading: true,
            camaraId: this.props.match.params.camaraId,
            userId: null
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            const camaraId = user.camaraId || this.props.match.params.camaraId || 'camara-teste';
            this.setState({ camaraId, userId: user.id });
            this.fetchComissoes(camaraId, user.id);
        } else {
            this.setState({ loading: false });
        }
    }

    fetchComissoes = async (camaraId, userId) => {
        try {
            const response = await api.get(`/commissions/${camaraId}`);
            const allComissoes = response.data || [];
            
            // Filtra para mostrar apenas as comissões das quais o usuário é membro
            const myComissoes = allComissoes.filter(c => 
                c.membros && Object.values(c.membros).some(m => m.id === userId)
            );
            this.setState({ comissoes: myComissoes, loading: false });
        } catch (error) {
            console.error("Erro ao buscar comissões:", error);
            this.setState({ loading: false });
        }
    };

    handleNavigateToDetails = (comissaoId) => {
        this.props.history.push(`/admin/comissao-detalhes/${this.props.match.params.camaraId}`, { comissaoId });
    };

    render() {
        const { comissoes, loading } = this.state;

        if (loading) {
            return <div className='App-header' style={{justifyContent: 'center'}}>Carregando suas comissões...</div>;
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    
                    {/* Header */}
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaUsers /> Minhas Comissões
                            </h1>
                            <p className="dashboard-header-desc">Acompanhe as pautas e deliberações das comissões em que você participa.</p>
                        </div>
                    </div>

                    {/* Grid de Comissões */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
                        {comissoes.length > 0 ? comissoes.map(comissao => (
                            <div key={comissao.id} className="dashboard-card dashboard-card-hover" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => this.handleNavigateToDetails(comissao.id)}>
                                <div style={{ padding: '25px', flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#126B5E', fontSize: '1.2rem' }}>{comissao.nome}</h3>
                                    <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{comissao.descricao}</p>
                                    
                                    <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '1rem', borderTop: '1px solid #eee', paddingTop: '15px' }}>Membros</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {comissao.membros && Object.values(comissao.membros).length > 0 ? Object.values(comissao.membros).map(membro => (
                                            <div key={membro.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={membro.foto} alt={membro.nome} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #07551a', background: '#fff' }} />
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{membro.nome}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{membro.cargo || 'Membro'}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>Nenhum membro adicionado.</p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '15px 25px', background: '#f8f9fa', borderTop: '1px solid #eee', textAlign: 'right' }}>
                                    <span style={{ color: '#126B5E', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                        Ver Pautas <FaArrowRight />
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="dashboard-card" style={{gridColumn: '1 / -1', textAlign: 'center', color: '#888'}}>
                                <p>Você ainda não faz parte de nenhuma comissão.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default ComissoesDash;