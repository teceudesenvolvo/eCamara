import React, { Component } from 'react';
import { FaCommentDots, FaLightbulb, FaTools, FaSearch, FaSpinner, FaCheck, FaArchive, FaReply, FaUser, FaClock, FaEnvelope } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class FalarComVereador extends Component {
    constructor(props) {
        super(props);
        this.state = {
            solicitacoes: [],
            loading: true,
            searchTerm: '',
            filterType: 'Todos os Tipos',
            filterStatus: 'Todos os Status',
            camaraId: this.props.match.params.camaraId,
            userUid: null
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        
        if (token && user.id) {
            this.setState({ userUid: user.id }, () => {
                this.fetchSolicitacoes();
            });
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchSolicitacoes = async () => {
        const { camaraId, userUid } = this.state;
        
        try {
            const response = await api.get(`/messages/${camaraId}/${userUid}`);
            const data = response.data || [];
            
            // Ordenar por data (mais recentes primeiro)
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.setState({ solicitacoes: data, loading: false });
            } else {
                this.setState({ solicitacoes: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);
            this.setState({ loading: false });
        }
    };

    handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/messages/${id}`, { 
                status: newStatus
            });
            alert(`Status atualizado para: ${newStatus}`);
            this.fetchSolicitacoes();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao processar alteração.");
        }
    };

    render() {
        const { solicitacoes, loading, searchTerm, filterType, filterStatus } = this.state;

        const filteredData = solicitacoes.filter(item => {
            const matchesSearch = item.cidadaoNome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 item.assunto?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'Todos os Tipos' || item.tipo === filterType;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });

        // Estatísticas do Gabinete
        const stats = {
            total: solicitacoes.length,
            novas: solicitacoes.filter(s => s.status === 'Pendente').length,
            sugestoes: solicitacoes.filter(s => s.tipo === 'Sugestão de PL').length,
            providencias: solicitacoes.filter(s => s.tipo === 'Pedido de Providência').length
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaCommentDots style={{ color: 'var(--primary-color)' }} /> Mensagens ao Vereador
                            </h1>
                            <p className="dashboard-header-desc">Gerencie o contato direto com a comunidade e sugestões legislativas.</p>
                        </div>
                    </div>

                    {/* Cards de Resumo do Gabinete */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#ef6c00' }}>
                            <h3 style={{ color: '#ef6c00' }}>{stats.novas}</h3>
                            <p>Novas Mensagens</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.sugestoes}</h3>
                            <p>Sugestões de Projetos</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                            <h3 style={{ color: '#3498db' }}>{stats.providencias}</h3>
                            <p>Pedidos de Providência</p>
                        </div>
                    </div>

                    {/* Filtros e Busca */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome, assunto ou conteúdo..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select 
                            className="filter-select" 
                            value={filterType} 
                            onChange={(e) => this.setState({ filterType: e.target.value })}
                        >
                            <option>Todos os Tipos</option>
                            <option>Mensagem</option>
                            <option>Sugestão de PL</option>
                            <option>Pedido de Providência</option>
                        </select>
                        <select 
                            className="filter-select" 
                            value={filterStatus} 
                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                        >
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Lida</option>
                            <option>Respondida</option>
                            <option>Arquivada</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <div key={item.id} className="list-item" style={{ borderLeft: item.tipo === 'Sugestão de PL' ? '4px solid #126B5E' : item.tipo === 'Pedido de Providência' ? '4px solid #3498db' : '4px solid #666' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                {item.tipo === 'Sugestão de PL' ? <FaLightbulb /> : item.tipo === 'Pedido de Providência' ? <FaTools /> : <FaCommentDots />} {item.tipo}
                                            </span>
                                            <span className={`tag ${item.status === 'Pendente' ? 'tag-warning' : 'tag-neutral'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '700', marginBottom: '5px' }}>
                                            {item.assunto || 'Sem Assunto'}
                                        </h3>
                                        <p style={{ margin: '0 0 15px 0', color: '#444', fontSize: '0.95rem', background: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                                            {item.mensagem}
                                        </p>
                                        <div className="list-item-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUser size={12} color="#126B5E" /> <strong>Cidadão:</strong> {item.cidadaoNome}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaEnvelope size={12} color="#126B5E" /> <strong>E-mail:</strong> {item.cidadaoEmail}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaClock size={12} color="#666" /> {new Date(item.createdAt).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Lida')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                Marcar como Lida
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => window.location.href = `mailto:${item.cidadaoEmail}?subject=Resposta: ${item.assunto}`}
                                            className="btn-success" 
                                            style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                        >
                                            <FaReply /> Responder
                                        </button>
                                        {item.status !== 'Arquivada' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Arquivada')}
                                                className="btn-secondary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                                title="Arquivar"
                                            >
                                                <FaArchive />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666' }}>Nenhuma mensagem ou sugestão encontrada para os filtros selecionados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default FalarComVereador;
