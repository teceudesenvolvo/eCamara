import React, { Component } from 'react';
import { 
    FaBullhorn, FaSearch, FaSpinner, FaCheck, FaTimes, 
    FaUserSecret, FaReply, FaArchive, FaEye, FaFilter, 
    FaExclamationTriangle, FaLightbulb, FaThumbsUp, FaInfoCircle 
} from 'react-icons/fa';
import { ref, onValue, update } from 'firebase/database';
import { auth, db } from '../../../firebaseConfig';
import MenuDashboard from '../../../componets/menuAdmin.jsx';

class Ouvidoria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            manifestacoes: [],
            loading: true,
            searchTerm: '',
            filterType: 'Todos os Tipos',
            filterStatus: 'Todos os Status',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.fetchManifestacoes();
            } else {
                this.props.history.push('/login/' + this.state.camaraId);
            }
        });
    }

    fetchManifestacoes = () => {
        const { camaraId } = this.state;
        const ouvidoriaRef = ref(db, `${camaraId}/ouvidoria/manifestacoes`);

        onValue(ouvidoriaRef, (snapshot) => {
            const data = [];
            if (snapshot.exists()) {
                Object.entries(snapshot.val()).forEach(([key, val]) => {
                    data.push({ id: key, ...val });
                });
            }
            // Ordenar por data (mais recentes primeiro)
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.setState({ manifestacoes: data, loading: false });
        });
    };

    handleUpdateStatus = async (id, newStatus) => {
        const { camaraId } = this.state;
        try {
            await update(ref(db, `${camaraId}/ouvidoria/manifestacoes/${id}`), { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            alert(`Protocolo atualizado para: ${newStatus}`);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao processar alteração.");
        }
    };

    render() {
        const { manifestacoes, loading, searchTerm, filterType, filterStatus } = this.state;

        const filteredData = manifestacoes.filter(item => {
            const matchesSearch = 
                (item.protocolo && item.protocolo.toLowerCase().includes(searchTerm.toLowerCase())) || 
                (item.assunto && item.assunto.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (!item.isAnonymous && item.nomeCidadao?.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesType = filterType === 'Todos os Tipos' || item.tipo === filterType;
            const matchesStatus = filterStatus === 'Todos os Status' || item.status === filterStatus;
            
            return matchesSearch && matchesType && matchesStatus;
        });

        // Estatísticas
        const stats = {
            novas: manifestacoes.filter(m => m.status === 'Pendente').length,
            emAnalise: manifestacoes.filter(m => m.status === 'Em Análise').length,
            denuncias: manifestacoes.filter(m => m.tipo === 'Denúncia').length,
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaBullhorn style={{ color: 'var(--primary-color)' }} /> Ouvidoria Legislativa
                            </h1>
                            <p className="dashboard-header-desc">Gerencie manifestações e garanta a transparência municipal.</p>
                        </div>
                    </div>

                    {/* Cards de Estatísticas */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#ef6c00' }}>
                            <h3 style={{ color: '#ef6c00' }}>{stats.novas}</h3>
                            <p>Novas Manifestações</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.emAnalise}</h3>
                            <p>Em Análise Técnica</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#d32f2f' }}>
                            <h3 style={{ color: '#d32f2f' }}>{stats.denuncias}</h3>
                            <p>Denúncias Registradas</p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por protocolo, assunto ou cidadão..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select className="filter-select" value={filterType} onChange={(e) => this.setState({ filterType: e.target.value })}>
                            <option>Todos os Tipos</option>
                            <option>Reclamação</option>
                            <option>Denúncia</option>
                            <option>Sugestão</option>
                            <option>Elogio</option>
                        </select>
                        <select className="filter-select" value={filterStatus} onChange={(e) => this.setState({ filterStatus: e.target.value })}>
                            <option>Todos os Status</option>
                            <option>Pendente</option>
                            <option>Em Análise</option>
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
                                <div key={item.id} className="list-item" style={{ borderLeft: item.tipo === 'Denúncia' ? '4px solid #d32f2f' : '4px solid #126B5E' }}>
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">
                                                {item.tipo === 'Denúncia' && <FaExclamationTriangle />}
                                                {item.tipo === 'Sugestão' && <FaLightbulb />}
                                                {item.tipo === 'Elogio' && <FaThumbsUp />}
                                                {item.tipo}
                                            </span>
                                            <span className="tag tag-neutral">
                                                Protocolo: {item.protocolo}
                                            </span>
                                            {item.isAnonymous && (
                                                <span className="tag tag-warning" style={{ color: '#856404', background: '#fff3cd' }}>
                                                    <FaUserSecret /> Anônimo
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="list-item-title" style={{ fontWeight: '700', marginBottom: '5px' }}>
                                            {item.assunto}
                                        </h3>
                                        <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                                            {item.isAnonymous ? 'Identidade protegida por lei' : `Enviado por: ${item.nomeCidadao}`}
                                        </p>
                                        <div className="list-item-meta">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaInfoCircle size={12} /> Status: <strong>{item.status}</strong>
                                            </span>
                                            <span style={{ color: '#ccc' }}>|</span>
                                            <span>{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>

                                    <div className="list-item-actions" style={{ gap: '10px' }}>
                                        {item.status === 'Pendente' && (
                                            <button 
                                                onClick={() => this.handleUpdateStatus(item.id, 'Em Análise')}
                                                className="btn-primary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            >
                                                <FaEye /> Analisar
                                            </button>
                                        )}
                                        <button 
                                            className="btn-success" 
                                            style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                            onClick={() => this.handleUpdateStatus(item.id, 'Respondida')}
                                        >
                                            <FaReply /> Responder
                                        </button>
                                        {item.status !== 'Arquivada' && (
                                            <button 
                                                className="btn-secondary" 
                                                style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                                title="Arquivar"
                                                onClick={() => this.handleUpdateStatus(item.id, 'Arquivada')}
                                            >
                                                <FaArchive />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: '#666' }}>Nenhuma manifestação encontrada com os filtros aplicados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Ouvidoria;
