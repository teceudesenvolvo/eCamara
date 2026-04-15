import React, { Component } from 'react';
import { 
    FaGraduationCap, FaVideo, FaChalkboardTeacher, FaFilePdf, 
    FaSearch, FaPlus, FaUsers, FaClock, FaSpinner, FaEdit, FaTrash 
} from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

class EscolaLegislativo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cursos: [],
            loading: true,
            searchTerm: '',
            filterCategory: 'Todas as Categorias',
            camaraId: this.props.match.params.camaraId
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        if (token) {
            this.fetchCursos();
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    fetchCursos = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/legislative-school/${camaraId}`);
            const data = response.data || [];
            
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.setState({ cursos: data, loading: false });
            } else {
                this.setState({ cursos: [], loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
            this.setState({ loading: false });
        }
    };

    handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este conteúdo educacional?")) {
            try {
                await api.delete(`/legislative-school/id/${id}`);
                alert("Conteúdo removido com sucesso.");
                this.fetchCursos();
            } catch (error) {
                console.error("Erro ao excluir:", error);
            }
        }
    };

    render() {
        const { cursos, loading, searchTerm, filterCategory } = this.state;

        const filteredCursos = cursos.filter(item => {
            const matchesSearch = item.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.instrutor?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'Todas as Categorias' || item.categoria === filterCategory;
            return matchesSearch && matchesCategory;
        });

        // Estatísticas do Dashboard
        const stats = {
            totalCursos: cursos.filter(c => c.categoria === 'Curso').length,
            totalWebinars: cursos.filter(c => c.categoria === 'Webinar' || c.categoria === 'Palestra').length,
            totalInscritos: cursos.reduce((acc, curr) => acc + (curr.inscritosCount || 0), 0)
        };

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaGraduationCap style={{ color: 'var(--primary-color)' }} /> Escola do Legislativo
                            </h1>
                            <p className="dashboard-header-desc">Gerencie cursos, palestras e materiais didáticos para a comunidade.</p>
                        </div>
                        <button className="btn-primary" style={{ width: 'auto' }}>
                            <FaPlus /> Novo Conteúdo
                        </button>
                    </div>

                    {/* Cards de Métricas Educacionais */}
                    <div className="dashboard-grid-stats">
                        <div className="stat-card" style={{ borderLeftColor: '#126B5E' }}>
                            <h3 style={{ color: '#126B5E' }}>{stats.totalCursos}</h3>
                            <p>Cursos Ativos</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#FF740F' }}>
                            <h3 style={{ color: '#FF740F' }}>{stats.totalWebinars}</h3>
                            <p>Webinars & Palestras</p>
                        </div>
                        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
                            <h3 style={{ color: '#2e7d32' }}>{stats.totalInscritos}</h3>
                            <p>Total de Inscritos</p>
                        </div>
                    </div>

                    {/* Barra de Busca e Filtros */}
                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por título ou instrutor..." 
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
                            <option>Curso</option>
                            <option>Webinar</option>
                            <option>Palestra</option>
                            <option>Material Didático</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {filteredCursos.length > 0 ? filteredCursos.map((item) => (
                                <div key={item.id} className="dashboard-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <span className="tag tag-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                {item.categoria === 'Curso' && <FaChalkboardTeacher />}
                                                {item.categoria === 'Webinar' && <FaVideo />}
                                                {item.categoria === 'Material Didático' && <FaFilePdf />}
                                                {item.categoria}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                                <FaClock /> {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#333', fontWeight: '700' }}>
                                            {item.titulo}
                                        </h3>
                                        
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.descricao}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.85rem', color: '#555' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaChalkboardTeacher color="#126B5E" /> {item.instrutor}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUsers color="#126B5E" /> {item.inscritosCount || 0} inscritos
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="btn-secondary" 
                                            style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                                            onClick={() => alert("Funcionalidade de edição em desenvolvimento")}
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button 
                                            className="btn-danger" 
                                            style={{ flex: 1, fontSize: '0.8rem', padding: '8px', background: 'none', color: '#d32f2f', border: '1px solid #d32f2f' }}
                                            onClick={() => this.handleDelete(item.id)}
                                        >
                                            <FaTrash /> Excluir
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '15px' }}>
                                    <p style={{ color: '#666' }}>Nenhum conteúdo educacional encontrado para os filtros aplicados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default EscolaLegislativo;
