import React, { Component } from 'react';
import { FaPlus, FaCog, FaFileAlt, FaCalendarAlt, FaUserTie, FaExchangeAlt, FaSearch, FaSpinner, FaFileSignature, FaTimes, FaLayerGroup } from 'react-icons/fa';
import api from '../../../services/api';
import MenuDashboard from '../../../componets/menuAdmin.jsx';

class loginDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            materias: [],
            loading: true,
            searchTerm: '',
            filterStatus: 'Todos os Status',
            filterType: 'Todos',
            filterYear: 'Todos',
            activeTab: 'myMatters', // 'myMatters' ou 'subscribedMatters'
            subscribedMaterias: [],
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            this.fetchMaterias(user, this.state.camaraId);
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchMaterias = async (user, camaraIdParam) => {
        const camaraId = camaraIdParam || this.state.camaraId;
        this.setState({ loading: true });

        try {
            const response = await api.get(`/legislative-matters/${camaraId}`);
            const allMaterias = response.data;

            const myMaterias = [];
            const subscribedMaterias = [];

            if (Array.isArray(allMaterias)) {
                allMaterias.forEach((materia) => {
                    // Adaptando para os nomes de campos prováveis do backend (authorId ou userId)
                    const mAuthorId = materia.authorId || materia.userId;

                    // Se a matéria é do usuário logado
                    if (mAuthorId === user.id) {
                        myMaterias.push(materia);
                    }

                    // Se o usuário subscreveu a matéria (e não é a própria matéria dele)
                    // Nota: O backend pode retornar subscricoes como um array ou objeto
                    const hasSubscribed = Array.isArray(materia.subscricoes)
                        ? materia.subscricoes.some(s => s.userId === user.id)
                        : (materia.subscricoes && materia.subscricoes[user.id]);

                    if (hasSubscribed && mAuthorId !== user.id) {
                        subscribedMaterias.push(materia);
                    }
                });
            }

            // Ordenar as matérias por data de criação (mais recente primeiro)
            myMaterias.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            subscribedMaterias.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            this.setState({ materias: myMaterias, subscribedMaterias, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias:", error);
            this.setState({ loading: false });
        }
    };

    render() {
        const { materias, subscribedMaterias, loading, searchTerm, filterStatus, filterType, filterYear, activeTab } = this.state;

        const currentMateriasList = activeTab === 'myMatters' ? materias : subscribedMaterias;

        // Extrair anos únicos para o filtro
        const years = [...new Set(currentMateriasList.map(m => m.ano))].filter(Boolean).sort((a, b) => b - a);

        // Filtragem local
        const filteredMaterias = currentMateriasList.filter(materia => {
            const matchesSearch =
                (materia.titulo && materia.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (materia.numero && materia.numero.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (materia.autor && materia.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (materia.tipoMateria && materia.tipoMateria.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === 'Todos os Status' || materia.status === filterStatus;
            const matchesType = filterType === 'Todos' || materia.tipoMateria === filterType;
            const matchesYear = filterYear === 'Todos' || materia.ano === filterYear;

            return matchesSearch && matchesStatus && matchesType && matchesYear;
        });

        // Contadores
        const countTotal = currentMateriasList.length;
        const countPL = currentMateriasList.filter(m => m.tipoMateria === 'Projeto de Lei').length;
        const countIndicacao = currentMateriasList.filter(m => m.tipoMateria === 'Indicação').length;
        const countRequerimento = currentMateriasList.filter(m => m.tipoMateria === 'Requerimento').length;
        const countMocao = currentMateriasList.filter(m => m.tipoMateria === 'Moção').length;
        const countDecreto = currentMateriasList.filter(m => m.tipoMateria === 'Projeto de Decreto Legislativo').length;

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content" style={{ marginLeft: '5%', marginRight: '2%' }}>

                    {/* Header da Página */}
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title" style={{ fontSize: '1rem' }}>
                                <FaCog style={{ color: 'var(--primary-color)' }} /> Minhas Matérias
                            </h1>
                            <p className="dashboard-header-desc">Gerencie suas matérias.</p>
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

                    {/* Stats Cards com Mini-gráficos */}
                    <div className="dashboard-grid-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                        <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                            <div>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Total de Matérias</p>
                                <h3 style={{ margin: '2px 0 0 0', color: '#126B5E', fontSize: '1.4rem' }}>{countTotal}</h3>
                            </div>
                            <div style={{ width: '40px', height: '30px' }}>
                                <svg width="40" height="30" viewBox="0 0 60 40">
                                    <rect x="0" y="15" width="8" height="25" fill="#126B5E" opacity="0.3" rx="2" />
                                    <rect x="12" y="5" width="8" height="35" fill="#126B5E" opacity="0.5" rx="2" />
                                    <rect x="24" y="20" width="8" height="20" fill="#126B5E" opacity="0.7" rx="2" />
                                    <rect x="36" y="10" width="8" height="30" fill="#126B5E" rx="2" />
                                    <rect x="48" y="25" width="8" height="15" fill="#126B5E" opacity="0.6" rx="2" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                            <div>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Projetos de Lei</p>
                                <h3 style={{ margin: '2px 0 0 0', color: '#f57c00', fontSize: '1.4rem' }}>{countPL}</h3>
                            </div>
                            <div style={{ width: '40px', height: '30px' }}>
                                <svg width="40" height="30" viewBox="0 0 60 40">
                                    <path d="M0 35 L12 20 L24 25 L36 10 L48 15 L60 5" fill="none" stroke="#f57c00" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                            <div>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Indicações</p>
                                <h3 style={{ margin: '2px 0 0 0', color: '#2e7d32', fontSize: '1.4rem' }}>{countIndicacao}</h3>
                            </div>
                            <div style={{ width: '40px', height: '30px' }}>
                                <svg width="40" height="30" viewBox="0 0 60 40">
                                    <rect x="0" y="25" width="8" height="15" fill="#2e7d32" opacity="0.3" rx="2" />
                                    <rect x="12" y="20" width="8" height="20" fill="#2e7d32" opacity="0.5" rx="2" />
                                    <rect x="24" y="10" width="8" height="30" fill="#2e7d32" opacity="0.7" rx="2" />
                                    <rect x="36" y="5" width="8" height="35" fill="#2e7d32" rx="2" />
                                    <rect x="48" y="15" width="8" height="25" fill="#2e7d32" opacity="0.6" rx="2" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                            <div>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Requerimentos</p>
                                <h3 style={{ margin: '2px 0 0 0', color: '#0288d1', fontSize: '1.4rem' }}>{countRequerimento}</h3>
                            </div>
                            <div style={{ width: '40px', height: '30px' }}>
                                <svg width="40" height="30" viewBox="0 0 60 40">
                                    <rect x="0" y="10" width="8" height="30" fill="#0288d1" opacity="0.3" rx="2" />
                                    <rect x="12" y="25" width="8" height="15" fill="#0288d1" opacity="0.5" rx="2" />
                                    <rect x="24" y="5" width="8" height="35" fill="#0288d1" rx="2" />
                                    <rect x="36" y="20" width="8" height="20" fill="#0288d1" opacity="0.7" rx="2" />
                                    <rect x="48" y="15" width="8" height="25" fill="#0288d1" opacity="0.6" rx="2" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                            <div>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Moções / Decretos</p>
                                <h3 style={{ margin: '2px 0 0 0', color: '#8e24aa', fontSize: '1.4rem' }}>{countMocao + countDecreto}</h3>
                            </div>
                            <div style={{ width: '40px', height: '30px' }}>
                                <svg width="40" height="30" viewBox="0 0 60 40">
                                    <path d="M0 10 L12 30 L24 15 L36 35 L48 5 L60 25" fill="none" stroke="#8e24aa" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </div>
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

                    {/* Filtros e Busca Otimizados */}
                    <div className="dashboard-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '25px' }}>
                        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                            <div className="search-input-wrapper" style={{ flex: 1 }}>
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar por número, título ou ementa..."
                                    value={searchTerm}
                                    onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                    className="search-input"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button
                                className="btn-secondary"
                                style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', height: '45px' }}
                                onClick={() => this.setState({ searchTerm: '', filterStatus: 'Todos os Status', filterType: 'Todos', filterYear: 'Todos' })}
                            >
                                <FaTimes /> Limpar Filtros
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo de Matéria</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => this.setState({ filterType: e.target.value })}
                                    className="filter-select"
                                    style={{ width: '100%', margin: 0 }}
                                >
                                    <option value="Todos">Todos os Tipos</option>
                                    <option value="Projeto de Lei">Projeto de Lei</option>
                                    <option value="Indicação">Indicação</option>
                                    <option value="Requerimento">Requerimento</option>
                                    <option value="Moção">Moção</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => this.setState({ filterStatus: e.target.value })}
                                    className="filter-select"
                                    style={{ width: '100%', margin: 0 }}
                                >
                                    <option>Todos os Status</option>
                                    <option>Aguardando Parecer</option>
                                    <option>Em Tramitação</option>
                                    <option>Sancionado</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ano / Exercício</label>
                                <select
                                    value={filterYear}
                                    onChange={(e) => this.setState({ filterYear: e.target.value })}
                                    className="filter-select"
                                    style={{ width: '100%', margin: 0 }}
                                >
                                    <option value="Todos">Todos os Anos</option>
                                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                        </div>
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