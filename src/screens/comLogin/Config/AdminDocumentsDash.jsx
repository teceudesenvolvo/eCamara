import React, { Component } from 'react';
import { FaPlus, FaFileAlt, FaSearch, FaSpinner, FaFilePdf, FaEye, FaUserTie } from 'react-icons/fa';
import api from '../../../services/api.js';
import MenuDashboard from '../../../componets/menuAdmin.jsx';

class AdminDocumentsDash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentos: [],
            loading: true,
            searchTerm: '',
            camaraId: (props.match && props.match.params && props.match.params.camaraId) || '',
        };
    }

    componentDidMount() {
        this.checkAuthAndFetch();
    }

    checkAuthAndFetch = async () => {
        try {
            const token = localStorage.getItem('@CamaraAI:token');
            if (!token) {
                this.props.history.push(`/login/${this.state.camaraId}`);
                return;
            }

            let user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
            if (!user || !user.id) {
                const response = await api.get('/auth/me');
                user = response.data;
                if (user && user.id) {
                    localStorage.setItem('@CamaraAI:user', JSON.stringify(user));
                }
            }

            if (user && user.id) {
                await this.fetchDocumentos(user);
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro na autenticação:", error);
            localStorage.removeItem('@CamaraAI:token');
            localStorage.removeItem('@CamaraAI:user');
            this.props.history.push(`/login/${this.state.camaraId}`);
        }
    };

    fetchDocumentos = async (user) => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/administrative-documents/${camaraId}`);
            const allDocs = response.data || [];
            
            // Administradores veem tudo da câmara. Usuários comuns veem apenas seus documentos.
            const documentos = (user.role === 'admin' || user.role === 'superadmin') 
                ? allDocs 
                : allDocs.filter(doc => doc.userId === user.id);

            // Ordenar por data (mais recente primeiro)
            documentos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.setState({ documentos, loading: false });
        } catch (error) {
            console.error("Erro ao buscar documentos:", error);
            this.setState({ loading: false });
        }
    };

    render() {
        const { documentos, loading, searchTerm } = this.state;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        const filteredDocs = documentos.filter(doc => 
            (doc.title || doc.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.category || doc.tipo || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">Documentos Administrativos</h1>
                            <p className="dashboard-header-desc">Gerencie ofícios, atas e memorandos gerados pela IA.</p>
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ width: 'auto' }}
                            onClick={() => this.props.history.push(`/admin/assistente-admin/novo/${this.props.match.params.camaraId}`)}
                        >
                            <FaPlus /> Novo Documento
                        </button>
                    </div>

                    <div className="dashboard-filter-bar">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text"  
                                placeholder="Buscar documentos..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                            <FaSpinner className="animate-spin" size={30} color="#126B5E" />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {filteredDocs.map((doc) => (
                                // Ajustado para incluir o prefixo /admin e o camaraId exigido pela rota no App.jsx
                            <div key={doc.id} className="dashboard-card dashboard-card-hover" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => this.props.history.push(`/admin/assistente-admin/detalhes/${this.state.camaraId}/${doc.id}`)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span className="tag tag-primary">{doc.category || doc.tipo}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a', textAlign: 'left' }}>
                                        {doc.title || doc.titulo || 'Sem título'}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 15px 0', textAlign: 'left', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                                        {doc.resumo || 'Documento administrativo oficial gerado via Assistente Legislativo.'}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#999' }}>
                                            <FaUserTie /> {doc.userName || (doc.userId === user.id ? 'Você' : 'Outro Membro')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {(doc.fileUrl || doc.pdfUrl) && <FaFilePdf color="#d32f2f" size={16} title="Possui arquivo PDF" />}
                                            <FaEye color="#126B5E" size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredDocs.length === 0 && <p style={{ color: '#666' }}>Nenhum documento encontrado.</p>}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default AdminDocumentsDash;