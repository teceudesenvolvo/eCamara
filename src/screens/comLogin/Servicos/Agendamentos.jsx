import React, { Component } from 'react';
import { FaCalendarCheck, FaClock, FaUser, FaCheck, FaTimes, FaSearch, FaFilter, FaSpinner, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class Agendamentos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            agendamentos: [],
            loading: true,
            searchTerm: '',
            filterSector: 'Todos os Setores',
            filterStatus: 'Todos os Status',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        if (token) {
            this.fetchAgendamentos();
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchAgendamentos = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/appointments/${camaraId}`);
            const data = response.data || [];
            
            // Ordenar por data e hora (mais próximos primeiro)
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(`${a.data} ${a.hora}`) - new Date(`${b.data} ${b.hora}`));
                this.setState({ agendamentos: data, loading: false });
            } else {
                this.setState({ agendamentos: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
            this.setState({ loading: false });
        }
    };

    handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}`, { status: newStatus });
            alert(`Status atualizado para ${newStatus}`);
            this.fetchAgendamentos();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    render() {
        const { agendamentos, loading, searchTerm, filterSector, filterStatus } = this.state;

        const filteredAgendamentos = agendamentos.filter(item => {
            const matchesSearch = item.nomeCidadao?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.assunto?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSector = filterSector === 'Todos os Setores' || item.setor === filterSector;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            return matchesSearch && matchesSector && matchesStatus;
        });

        // Estatísticas
        const hoje = new Date().toLocaleDateString('pt-BR');
        const stats = {
            totalHoje: agendamentos.filter(a => a.data === hoje).length,
            pendentes: agendamentos.filter(a => a.status === 'Pendente').length,
            concluidos: agendamentos.filter(a => a.status === 'Concluído').length
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaCalendarCheck style={{ color: 'var(--primary-color)' }} /> Gestão de Agendamentos
                            </h1>
                            <p className="dashboard-header-desc">Administre o fluxo de visitas e atendimentos presenciais.</p>
                        </div>
                    </div>

                    {/* Cards de Métricas */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.totalHoje}</h3>
                            <p>Agendados para Hoje</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#ef6c00' }}>
                            <h3 style={{ color: '#ef6c00' }}>{stats.pendentes}</h3>
                            <p>Aguardando Confirmação</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.concluidos}</h3>
                            <p>Atendimentos Concluídos</p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por cidadão ou assunto..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select 
                            className="filter-select" 
                            value={filterSector} 
                            onChange={(e) => this.setState({ filterSector: e.target.value })}
                        >
                            <option>Todos os Setores</option>
                            <option>Secretaria Geral</option>
                            <option>Gabinete Presidência</option>
                            <option>Departamento Jurídico</option>
                            <option>Recursos Humanos</option>
                            <option>Contabilidade</option>
                        </select>
                        <select 
                            className="filter-select" 
                            value={filterStatus} 
                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                        >
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Confirmado</option>
                            <option>Concluído</option>
                            <option>Cancelado</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredAgendamentos.length > 0 ? filteredAgendamentos.map((item) => (
                                <div key={item.id} className="list-item" style={{ borderLeft: item.status === 'Pendente' ? '4px solid #ef6c00' : '4px solid #2e7d32' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                <FaClock /> {item.data} às {item.hora}
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
                                                <FaBuilding size={12} color="#126B5E" /> <strong>Setor:</strong> {item.setor}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUser size={12} color="#126B5E" /> <strong>Assunto:</strong> {item.assunto}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Confirmado')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                                title="Confirmar Agendamento"
                                            >
                                                <FaCheck /> Confirmar
                                            </button>
                                        )}
                                        {item.status === 'Confirmado' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Concluído')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                                title="Finalizar Atendimento"
                                            >
                                                <FaCheckCircle /> Concluir
                                            </button>
                                        )}
                                        {item.status !== 'Cancelado' && item.status !== 'Concluído' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Cancelado')}
                                                className="btn-danger" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', background: 'none', border: '1px solid #d32f2f', color: '#d32f2f' }}
                                                title="Cancelar"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666' }}>Nenhum agendamento encontrado para os filtros selecionados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Agendamentos;
