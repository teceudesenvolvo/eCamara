import React, { Component } from 'react';
import { 
    FaBriefcase, FaSearch, FaSpinner, FaCheck, FaTimes, 
    FaStore, FaGavel, FaFileInvoiceDollar, FaChartLine,
    FaInfoCircle, FaCheckCircle, FaUserTie, FaBuilding
} from 'react-icons/fa';
import { ref, onValue, update } from 'firebase/database';
import { auth, db } from '../../../firebaseConfig';
import MenuDashboard from '../../../componets/menuAdmin.jsx';

class SalaEmpreendedor extends Component {
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
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.fetchSolicitacoes();
            } else {
                this.props.history.push('/login/' + this.state.camaraId);
            }
        });
    }

    fetchSolicitacoes = () => {
        const { camaraId } = this.state;
        const refSolicitacoes = ref(db, `${camaraId}/sala_empreendedor/solicitacoes`);

        onValue(refSolicitacoes, (snapshot) => {
            const data = [];
            if (snapshot.exists()) {
                Object.entries(snapshot.val()).forEach(([key, val]) => {
                    data.push({ id: key, ...val });
                });
            }
            // Ordenar por data (mais recentes primeiro)
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.setState({ solicitacoes: data, loading: false });
        });
    };

    handleUpdateStatus = async (id, newStatus) => {
        const { camaraId } = this.state;
        try {
            await update(ref(db, `${camaraId}/sala_empreendedor/solicitacoes/${id}`), { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            alert(`Solicitação atualizada para: ${newStatus}`);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao processar atualização.");
        }
    };

    render() {
        const { solicitacoes, loading, searchTerm, filterCategory, filterStatus } = this.state;

        const filteredData = solicitacoes.filter(item => {
            const matchesSearch = 
                item.empreendedorNome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.empresaNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = filterCategory === 'Todas as Categorias' || item.categoria === filterCategory;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });

        // Estatísticas
        const stats = {
            novas: solicitacoes.filter(s => s.status === 'Pendente').length,
            emAtendimento: solicitacoes.filter(s => s.status === 'Em Atendimento').length,
            concluidas: solicitacoes.filter(s => s.status === 'Concluído').length,
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaBriefcase style={{ color: 'var(--primary-color)' }} /> Sala do Empreendedor
                            </h1>
                            <p className="dashboard-header-desc">Gestão de serviços ao MEI e orientações para o desenvolvimento econômico local.</p>
                        </div>
                    </div>

                    {/* Cards de Métricas */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#ef6c00' }}>
                            <h3 style={{ color: '#ef6c00' }}>{stats.novas}</h3>
                            <p>Novas Solicitações</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.emAtendimento}</h3>
                            <p>Em Consultoria</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.concluidas}</h3>
                            <p>Serviços Finalizados</p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por empreendedor, empresa ou assunto..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select className="filter-select" value={filterCategory} onChange={(e) => this.setState({ filterCategory: e.target.value })}>
                            <option>Todas as Categorias</option>
                            <option>Abertura MEI</option>
                            <option>Guia DAS / Impostos</option>
                            <option>Declaração Anual (DASN)</option>
                            <option>Licitações Municipais</option>
                            <option>Crédito / Financiamento</option>
                        </select>
                        <select className="filter-select" value={filterStatus} onChange={(e) => this.setState({ filterStatus: e.target.value })}>
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Em Atendimento</option>
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
                                <div key={item.id} className="list-item" style={{ borderLeft: item.categoria === 'Licitações Municipais' ? '4px solid #1565c0' : '4px solid #126B5E' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                {item.categoria === 'Abertura MEI' && <FaStore />}
                                                {item.categoria === 'Licitações Municipais' && <FaGavel />}
                                                {item.categoria === 'Guia DAS / Impostos' && <FaFileInvoiceDollar />}
                                                {item.categoria === 'Crédito / Financiamento' && <FaChartLine />}
                                                {item.categoria}
                                            </span>
                                            <span className={`tag ${item.status === 'Pendente' ? 'tag-warning' : item.status === 'Concluído' ? 'tag-success' : 'tag-primary'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '700', marginBottom: '5px' }}>
                                            {item.empresaNome || 'Pessoa Física / Futura Empresa'}
                                        </h3>
                                        <div className="list-item-meta" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUserTie size={12} color="#126B5E" /> <strong>Solicitante:</strong> {item.empreendedorNome}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaInfoCircle size={12} color="#666" /> <strong>Descrição:</strong> {item.descricao}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
                                                Registrado em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Em Atendimento')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                Iniciar Atendimento
                                            </button>
                                        )}
                                        {item.status === 'Em Atendimento' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Concluído')}
                                                className="btn-success" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaCheckCircle /> Concluir Serviço
                                            </button>
                                        )}
                                        {item.status !== 'Concluído' && item.status !== 'Cancelado' && (
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
                                    <p style={{ color: '#666' }}>Nenhuma solicitação encontrada na Sala do Empreendedor.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default SalaEmpreendedor;
