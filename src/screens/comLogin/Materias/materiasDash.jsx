import React, { Component } from 'react';
import { FaPlus, FaFileAlt, FaCalendarAlt, FaUserTie, FaExchangeAlt, FaSearch, FaSpinner, FaFileSignature } from 'react-icons/fa';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { auth, db } from '../../../firebaseConfig';

// Components
import MenuDashboard from '../../../componets/menuAdmin.jsx';

class loginDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            materias: [],
            loading: true,
            searchTerm: '',
            filterStatus: 'Todos os Status',
            activeTab: 'myMatters', // 'myMatters' ou 'subscribedMatters'
            subscribedMaterias: [],
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Prioriza o ID da URL, mas pode validar com o do usuário se necessário
                let camaraId = this.state.camaraId;
                if (!camaraId) {
                     const userIndexRef = ref(db, `users_index/${user.uid}`);
                     const snapshot = await get(userIndexRef);
                     camaraId = this.props.match.params.camaraId;
                     this.setState({ camaraId:this.props.match.params.camaraId });
                }
                this.fetchMaterias(user, camaraId);

            } else {
                this.props.history.push('/login');
            }
        });
    }

    fetchMaterias = async (user, camaraIdParam) => {
        const camaraId = camaraIdParam || this.state.camaraId;
        if (user && camaraId) {
            try {
                const allMateriasRef = ref(db, `${camaraId}/materias`);
                const allMateriasSnapshot = await get(allMateriasRef);
                
                const myMaterias = [];
                const subscribedMaterias = [];

                if (allMateriasSnapshot.exists()) {
                    allMateriasSnapshot.forEach((childSnapshot) => {
                        const materia = { id: childSnapshot.key, ...childSnapshot.val() };
                        
                        // Se a matéria é do usuário logado
                        if (materia.userId === user.uid) {
                            myMaterias.push(materia);
                        }
                        
                        // Se o usuário subscreveu a matéria (e não é a própria matéria dele)
                        if (materia.subscricoes && materia.subscricoes[user.uid] && materia.userId !== user.uid) {
                            subscribedMaterias.push(materia);
                        }
                    });
                }
                
                // Ordenar as matérias por data de criação (mais recente primeiro)
                myMaterias.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                subscribedMaterias.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

                this.setState({ materias: myMaterias, subscribedMaterias, loading: false });
            } catch (error) {
                console.error("Erro ao buscar matérias:", error);
                this.setState({ loading: false });
            }
        }
    };

    render() {
        const { materias, subscribedMaterias, loading, searchTerm, filterStatus, activeTab } = this.state;

        const currentMateriasList = activeTab === 'myMatters' ? materias : subscribedMaterias;

        // Filtragem local
        const filteredMaterias = currentMateriasList.filter(materia => {
            const matchesSearch = 
                (materia.titulo && materia.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (materia.numero && materia.numero.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (materia.tipoMateria && materia.tipoMateria.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = filterStatus === 'Todos os Status' || materia.status === filterStatus;

            return matchesSearch && matchesStatus;
        });

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    
                    {/* Header da Página */}
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">Matérias</h1>
                            <p className="dashboard-header-desc">Gerencie suas proposições legislativas</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn-secondary" 
                                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#126B5E', color: '#126B5E' }}
                                onClick={() => this.props.history.push('/admin/documentos-acessorios/' + this.state.camaraId)}
                            >
                                <FaFileSignature /> Solicitar Urgencia de Matéria
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{ width: 'auto' }}
                                onClick={() => this.props.history.push('/admin/protocolar-materia/' + this.state.camaraId)}
                            >
                                <FaPlus /> Nova Matéria
                            </button>
                        </div>
                    </div>

                    {/* Abas de Navegação */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '30px' }}>
                        <button 
                            onClick={() => this.setState({ activeTab: 'myMatters' })} 
                            className={`tab-button ${activeTab === 'myMatters' ? 'active' : ''}`} 
                            style={{ padding: '10px 20px', background: activeTab === 'myMatters' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'myMatters' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaFileAlt /> Minhas Matérias
                        </button>
                        <button 
                            onClick={() => this.setState({ activeTab: 'subscribedMatters' })} 
                            className={`tab-button ${activeTab === 'subscribedMatters' ? 'active' : ''}`} 
                            style={{ padding: '10px 20px', background: activeTab === 'subscribedMatters' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'subscribedMatters' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaExchangeAlt /> Matérias Subscritas
                        </button>
                    </div>

                    {/* Barra de Filtros (Visual) */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text"  
                                placeholder="Buscar por número, tipo ou status..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <select className="filter-select" value={filterStatus} onChange={(e) => this.setState({ filterStatus: e.target.value })}>
                            <option>Todos os Status</option>
                            <option>Aguardando Parecer</option>
                            <option>Em Tramitação</option>
                            <option>Sancionado</option>
                        </select>
                    </div>

                    {/* Grid de Cards */}
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', width: '100%' }}>
                            <FaSpinner className="icon-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                            {filteredMaterias.length > 0 ? filteredMaterias.map((row) => (
                                <div key={row.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#126B5E' }}>
                                            <FaFileAlt size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#333', fontSize: '1.0rem' }}>{row.tipoMateria} {row.numero}</h3>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>{row.dataApresenta}</span>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: '5px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 'bold',
                                        background: row.status === 'Sancionado' ? '#e8f5e9' : '#fff3e0',
                                        color: row.status === 'Sancionado' ? '#2e7d32' : '#ef6c00'
                                    }}>
                                        {row.status}
                                    </span>
                                </div>

                                <div style={{ padding: '20px', flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                            <FaUserTie style={{ color: '#aaa' }} /> 
                                            <span><strong>Autor:</strong> {row.autor}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                            <FaExchangeAlt style={{ color: '#aaa' }} /> 
                                            <span><strong>Tramitação:</strong> {row.regTramita}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                            <FaCalendarAlt style={{ color: '#aaa' }} /> 
                                            <span><strong>Exercício:</strong> {row.ano}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                                    <button className="btn-secondary" style={{ width: '100%', color: '#126B5E', borderColor: '#126B5E' }}
                                    onClick={() => this.props.history.push(`/admin/materia-detalhes/${this.state.camaraId}`, { materiaId: row.id })}
                                    onMouseOver={(e) => { e.target.style.background = '#126B5E'; e.target.style.color = 'white'; }}
                                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#126B5E'; }}
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                            )) : (
                                <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center' }}>Nenhuma matéria encontrada.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default loginDashboard;