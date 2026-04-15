import React, { Component } from 'react';
import { 
    FaGavel, FaSearch, FaSpinner, FaCheck, FaTimes, 
    FaFileInvoiceDollar, FaHandshake, FaUserTie, FaBuilding,
    FaInfoCircle, FaDownload, FaBook, FaCheckCircle
} from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class Procon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacoes: [],
            loading: true,
            searchTerm: '',
            filterStatus: 'Todos os Status',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        if (token) {
            this.fetchReclamacoes();
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchReclamacoes = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/procon/${camaraId}`);
            const data = response.data || [];
            
            // Ordenar por data (mais recentes primeiro)
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.setState({ reclamacoes: data, loading: false });
            } else {
                this.setState({ reclamacoes: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar reclamações:", error);
            this.setState({ loading: false });
        }
    };

    handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/procon/${id}`, { 
                status: newStatus
            });
            alert(`Status da reclamação atualizado para: ${newStatus}`);
            this.fetchReclamacoes();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao processar alteração.");
        }
    };

    render() {
        const { reclamacoes, loading, searchTerm, filterStatus } = this.state;

        const filteredData = reclamacoes.filter(item => {
            const matchesSearch = 
                item.cidadaoNome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.empresaNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assunto?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        });

        // Estatísticas
        const stats = {
            novas: reclamacoes.filter(r => r.status === 'Pendente').length,
            mediacao: reclamacoes.filter(r => r.status === 'Em Mediação').length,
            resolvidas: reclamacoes.filter(r => r.status === 'Resolvido').length,
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaGavel style={{ color: 'var(--primary-color)' }} /> Defesa do Consumidor (PROCON)
                            </h1>
                            <p className="dashboard-header-desc">Gerencie reclamações, mediações e orientações ao consumidor municipal.</p>
                        </div>
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #126B5E', color: '#126B5E' }}>
                            <FaBook /> Código do Consumidor
                        </button>
                    </div>

                    {/* Cards de Métricas */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#ef6c00' }}>
                            <h3 style={{ color: '#ef6c00' }}>{stats.novas}</h3>
                            <p>Novas Reclamações</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.mediacao}</h3>
                            <p>Em Mediação</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.resolvidas}</h3>
                            <p>Casos Resolvidos</p>
                        </div>
                    </div>

                    {/* Barra de Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por cidadão, empresa ou assunto..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select className="filter-select" value={filterStatus} onChange={(e) => this.setState({ filterStatus: e.target.value })}>
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Em Mediação</option>
                            <option>Resolvido</option>
                            <option>Não Resolvido</option>
                            <option>Cancelado</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <div key={item.id} className="list-item" style={{ borderLeft: item.status === 'Resolvido' ? '4px solid #2e7d32' : item.status === 'Pendente' ? '4px solid #ef6c00' : '4px solid #126B5E' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                <FaBuilding /> {item.empresaNome}
                                            </span>
                                            <span className={`tag ${item.status === 'Pendente' ? 'tag-warning' : item.status === 'Resolvido' ? 'tag-success' : 'tag-primary'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '700', marginBottom: '5px' }}>
                                            {item.assunto}
                                        </h3>
                                        <div className="list-item-meta" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUserTie size={12} color="#126B5E" /> <strong>Consumidor:</strong> {item.cidadaoNome}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaInfoCircle size={12} color="#666" /> <strong>Resumo:</strong> {item.descricao}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
                                                Registrado em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                                            </span>
                                        </div>

                                        {item.anexoUrl && (
                                            <div style={{ marginTop: '15px' }}>
                                                <button 
                                                    onClick={() => window.open(item.anexoUrl)}
                                                    className="btn-secondary" 
                                                    style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', background: '#f8f9fa' }}
                                                >
                                                    <FaDownload /> Ver Comprovante / Contrato
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Em Mediação')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaHandshake /> Iniciar Mediação
                                            </button>
                                        )}
                                        {item.status === 'Em Mediação' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Resolvido')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaCheckCircle /> Resolvido
                                            </button>
                                        )}
                                        {item.status !== 'Resolvido' && item.status !== 'Cancelado' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Cancelado')}
                                                className="btn-danger" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', background: 'none', border: '1px solid #d32f2f', color: '#d32f2f' }}
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666' }}>Nenhuma reclamação do PROCON encontrada para os filtros aplicados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Procon;
