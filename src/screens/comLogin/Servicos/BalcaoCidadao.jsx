import React, { Component } from 'react';
import { FaIdCard, FaClipboardList, FaMapMarkerAlt, FaInfoCircle, FaSearch, FaSpinner, FaTools, FaCheckCircle, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../../services/api';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
class BalcaoCidadao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            solicitacoes: [],
            loading: true,
            searchTerm: '',
            filterCategory: 'Todas as Categorias',
            filterStatus: 'Todos os Status',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        if (token) {
            this.fetchSolicitacoes();
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchSolicitacoes = async () => {
        const { camaraId } = this.state;
        this.setState({ loading: true });

        try {
            const response = await api.get(`/citizen-services/${camaraId}`);
            const data = response.data;
            
            // Ordenar por data de criação (mais recentes primeiro)
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.setState({ solicitacoes: data, loading: false });
            } else {
                this.setState({ solicitacoes: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar solicitações:", error);
            this.setState({ loading: false });
        }
    };

    handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/citizen-services/${id}`, { 
                status: newStatus
            });
            alert(`Solicitação atualizada com sucesso para: ${newStatus}`);
            this.fetchSolicitacoes(); // Recarregar a lista
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao atualizar o chamado.");
        }
    };

    render() {
        const { solicitacoes, loading, searchTerm, filterCategory, filterStatus } = this.state;

        const filteredData = solicitacoes.filter(item => {
            const matchesSearch = item.cidadaoNome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'Todas as Categorias' || item.categoria === filterCategory;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        });

        // Estatísticas para o Dashboard
        const stats = {
            total: solicitacoes.length,
            pendentes: solicitacoes.filter(s => s.status === 'Pendente').length,
            emAndamento: solicitacoes.filter(s => s.status === 'Em Processamento').length,
            concluidos: solicitacoes.filter(s => s.status === 'Concluído').length
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaIdCard style={{ color: 'var(--primary-color)' }} /> Balcão-Cidadão
                            </h1>
                            <p className="dashboard-header-desc">Administre documentos, serviços urbanos e informações municipais.</p>
                        </div>
                    </div>

                    {/* Cards de Resumo */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#ef6c00' }}>
                            <h3 style={{ color: '#ef6c00' }}>{stats.pendentes}</h3>
                            <p>Novos Pedidos</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#1565c0' }}>
                            <h3 style={{ color: '#1565c0' }}>{stats.emAndamento}</h3>
                            <p>Em Processamento</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.concluidos}</h3>
                            <p>Pedidos Finalizados</p>
                        </div>
                    </div>

                    {/* Filtros de Pesquisa */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome do cidadão ou detalhe do pedido..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select 
                            className="filter-select" 
                            value={filterCategory} 
                            onChange={(e) => this.setState({ filterCategory: e.target.value })}
                        >
                            <option>Todas as Categorias</option>
                            <option>Emissão de Documento</option>
                            <option>Serviços Urbanos</option>
                            <option>Informação Geral</option>
                        </select>
                        <select 
                            className="filter-select" 
                            value={filterStatus} 
                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                        >
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Em Processamento</option>
                            <option>Concluído</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <div key={item.id} className="list-item" style={{ borderLeft: item.categoria === 'Serviços Urbanos' ? '4px solid #126B5E' : '4px solid #FF740F' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                {item.categoria === 'Serviços Urbanos' ? <FaTools /> : <FaIdCard />} {item.categoria}
                                            </span>
                                            <span className={`tag ${item.status === 'Pendente' ? 'tag-warning' : item.status === 'Concluído' ? 'tag-success' : 'tag-primary'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '600', marginBottom: '5px' }}>
                                            {item.cidadaoNome}
                                        </h3>
                                        <div className="list-item-meta" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaClipboardList size={12} color="#666" /> <strong>Pedido:</strong> {item.tipoDetalhado || item.descricao}
                                            </span>
                                            {item.endereco && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaMapMarkerAlt size={12} color="#666" /> <strong>Localização:</strong> {item.endereco}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaInfoCircle size={12} color="#666" /> <strong>Solicitado em:</strong> {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Em Processamento')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                Iniciar Atendimento
                                            </button>
                                        )}
                                        {item.status === 'Em Processamento' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Concluído')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaCheckCircle /> Finalizar
                                            </button>
                                        )}
                                        {item.status !== 'Concluído' && item.status !== 'Cancelado' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Cancelado')}
                                                className="btn-danger" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', background: 'none', border: '1px solid #d32f2f', color: '#d32f2f' }}
                                            >
                                                <FaTimes /> Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666' }}>Nenhuma solicitação encontrada no Balcão-Cidadão.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default BalcaoCidadao;
