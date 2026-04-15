import React, { Component } from 'react';
import { 
    FaFemale, FaSearch, FaSpinner, FaCheck, FaTimes, 
    FaExclamationTriangle, FaHandsHelping, FaUserShield, 
    FaPhoneSlash, FaBalanceScale, FaInfoCircle, FaCheckCircle, FaEye, FaShareAlt
} from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class ProcuradoriaMulher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            denuncias: [],
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
            this.fetchDenuncias();
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchDenuncias = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/womens-procuratorate/${camaraId}`);
            const data = response.data || [];
            
            // Ordenar por prioridade (Alertas de Pânico primeiro) e depois por data
            if (Array.isArray(data)) {
                data.sort((a, b) => {
                    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                this.setState({ denuncias: data, loading: false });
            } else {
                this.setState({ denuncias: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar denúncias:", error);
            this.setState({ loading: false });
        }
    };

    handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/womens-procuratorate/${id}`, { 
                status: newStatus
            });
            alert(`Status atualizado para: ${newStatus}`);
            this.fetchDenuncias();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao processar atualização.");
        }
    };

    render() {
        const { denuncias, loading, searchTerm, filterType, filterStatus } = this.state;

        const filteredData = denuncias.filter(item => {
            const matchesSearch = 
                item.protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (!item.isAnonymous && item.nomeVitima?.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesType = filterType === 'Todos os Tipos' || item.tipoViolencia === filterType;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            
            return matchesSearch && matchesType && matchesStatus;
        });

        // Estatísticas Críticas
        const stats = {
            urgentes: denuncias.filter(d => d.isUrgent && d.status !== 'Finalizado').length,
            emAcompanhamento: denuncias.filter(d => d.status === 'Em Acompanhamento').length,
            concluidos: denuncias.filter(d => d.status === 'Finalizado').length,
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaFemale style={{ color: '#e91e63' }} /> Procuradoria da Mulher
                            </h1>
                            <p className="dashboard-header-desc">Gestão de acolhimento, denúncias e rede de proteção à mulher.</p>
                        </div>
                    </div>

                    {/* Cards de Monitoramento Crítico */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#d32f2f', background: stats.urgentes > 0 ? '#fff5f5' : '#fff' }}>
                            <h3 style={{ color: '#d32f2f' }}>{stats.urgentes}</h3>
                            <p>Alertas de Urgência</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#1565c0' }}>
                            <h3 style={{ color: '#1565c0' }}>{stats.emAcompanhamento}</h3>
                            <p>Em Acompanhamento</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.concluidos}</h3>
                            <p>Casos Resolvidos</p>
                        </div>
                    </div>

                    {/* Barra de Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por protocolo ou nome (se não anônimo)..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select className="filter-select" value={filterType} onChange={(e) => this.setState({ filterType: e.target.value })}>
                            <option>Todos os Tipos</option>
                            <option>Violência Física</option>
                            <option>Violência Psicológica</option>
                            <option>Violência Patrimonial</option>
                            <option>Discriminação no Trabalho</option>
                            <option>Assédio</option>
                        </select>
                        <select className="filter-select" value={filterStatus} onChange={(e) => this.setState({ filterStatus: e.target.value })}>
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Em Triagem</option>
                            <option>Encaminhado</option>
                            <option>Em Acompanhamento</option>
                            <option>Finalizado</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#e91e63" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <div key={item.id} className="list-item" style={{ borderLeft: item.isUrgent ? '6px solid #d32f2f' : '4px solid #e91e63' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary" style={{ background: '#fce4ec', color: '#ad1457' }}>
                                                {item.tipoViolencia}
                                            </span>
                                            <span className="tag tag-neutral">Protocolo: {item.protocolo}</span>
                                            {item.isUrgent && (
                                                <span className="tag tag-danger" style={{ animation: 'pulse 2s infinite' }}>
                                                    <FaExclamationTriangle /> URGENTE
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '700', marginBottom: '5px' }}>
                                            {item.isAnonymous ? 'Vítima: Identidade Preservada (Anônimo)' : `Vítima: ${item.nomeVitima}`}
                                        </h3>
                                        <div className="list-item-meta" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaInfoCircle size={12} color="#666" /> <strong>Relato:</strong> {item.descricaoDenuncia}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
                                                Registrado em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Em Triagem')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', background: '#e91e63' }}
                                            >
                                                <FaEye /> Iniciar Triagem
                                            </button>
                                        )}
                                        {item.status === 'Em Triagem' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Encaminhado')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', background: '#1565c0' }}
                                            >
                                                <FaShareAlt /> Encaminhar Rede
                                            </button>
                                        )}
                                        {(item.status === 'Encaminhado' || item.status === 'Em Acompanhamento') && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Finalizado')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaCheckCircle /> Finalizar Caso
                                            </button>
                                        )}
                                        <button 
                                            className="btn-secondary" 
                                            style={{ padding: '8px 15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            title="Suporte Jurídico"
                                        >
                                            <FaBalanceScale />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666' }}>Nenhum registro encontrado na Procuradoria da Mulher.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ProcuradoriaMulher;
