import React, { Component } from 'react';
import { FaBalanceScale, FaClock, FaUser, FaCheck, FaTimes, FaSearch, FaSpinner, FaGavel, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class AssistenciaJuridica extends Component {
    constructor(props) {
        super(props);
        this.state = {
            consultas: [],
            loading: true,
            searchTerm: '',
            filterType: 'Todos os Tipos',
            filterStatus: 'Todos os Status',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        if (token) {
            this.fetchConsultas();
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchConsultas = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/legal-assistance/${camaraId}`);
            const data = response.data || [];
            
            // Ordenar por data (mais recentes primeiro)
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
                this.setState({ consultas: data, loading: false });
            } else {
                this.setState({ consultas: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar consultas:", error);
            this.setState({ loading: false });
        }
    };

    handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/legal-assistance/${id}`, { 
                status: newStatus
            });
            alert(`Solicitação atualizada para: ${newStatus}`);
            this.fetchConsultas();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao processar atualização.");
        }
    };

    render() {
        const { consultas, loading, searchTerm, filterType, filterStatus } = this.state;

        const filteredConsultas = consultas.filter(item => {
            const matchesSearch = item.nomeCidadao?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.assunto?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'Todos os Tipos' || item.tipoCausa === filterType;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });

        // Estatísticas
        const stats = {
            total: consultas.length,
            pendentes: consultas.filter(c => c.status === 'Pendente').length,
            emAndamento: consultas.filter(c => c.status === 'Em Triagem' || c.status === 'Encaminhado').length,
            concluidos: consultas.filter(c => c.status === 'Concluído').length
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaBalanceScale style={{ color: 'var(--primary-color)' }} /> Assistência Jurídica
                            </h1>
                            <p className="dashboard-header-desc">Gestão de orientações jurídicas para cidadãos de baixa renda.</p>
                        </div>
                    </div>

                    {/* Cards de Métricas */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.pendentes}</h3>
                            <p>Novas Solicitações</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                            <h3 style={{ color: '#3498db' }}>{stats.emAndamento}</h3>
                            <p>Em Triagem/Análise</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.concluidos}</h3>
                            <p>Casos Encerrados</p>
                        </div>
                    </div>

                    {/* Barra de Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou descrição do caso..." 
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
                            <option>Direito de Família</option>
                            <option>Pequenas Causas</option>
                            <option>Direito do Consumidor</option>
                            <option>Previdenciário</option>
                            <option>Outros</option>
                        </select>
                        <select 
                            className="filter-select" 
                            value={filterStatus} 
                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                        >
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Em Triagem</option>
                            <option>Encaminhado</option>
                            <option>Concluído</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredConsultas.length > 0 ? filteredConsultas.map((item) => (
                                <div key={item.id} className="list-item" style={{ borderLeft: item.status === 'Pendente' ? '4px solid #ef6c00' : '4px solid #126B5E' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                <FaGavel /> {item.tipoCausa || 'Causa não especificada'}
                                            </span>
                                            <span className={`tag ${item.status === 'Pendente' ? 'tag-warning' : 'tag-success'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '600', marginBottom: '5px' }}>
                                            {item.nomeCidadao}
                                        </h3>
                                        <div className="list-item-meta" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaClock size={12} color="#666" /> <strong>Solicitado em:</strong> {new Date(item.dataPedido).toLocaleDateString()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaInfoCircle size={12} color="#666" /> <strong>Resumo:</strong> {item.assunto}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Em Triagem')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                Iniciar Triagem
                                            </button>
                                        )}
                                        {item.status === 'Em Triagem' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Encaminhado')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', background: '#3498db' }}
                                            >
                                                <FaCheck /> Encaminhar OAB/Defensoria
                                            </button>
                                        )}
                                        {(item.status === 'Encaminhado' || item.status === 'Em Triagem') && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Concluído')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaCheckCircle /> Concluir
                                            </button>
                                        )}
                                        {item.status !== 'Cancelado' && item.status !== 'Concluído' && (
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
                                    <p style={{ color: '#666' }}>Nenhuma solicitação de assistência jurídica encontrada.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default AssistenciaJuridica;
