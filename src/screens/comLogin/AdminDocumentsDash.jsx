import React, { Component } from 'react';
import { FaPlus, FaFileAlt, FaSearch, FaSpinner, FaFilePdf } from 'react-icons/fa';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { auth, db } from '../../firebaseConfig';
import MenuDashboard from '../../componets/menuDashboard.jsx';

class AdminDocumentsDash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentos: [],
            loading: true,
            searchTerm: ''
        };
    }

    componentDidMount() {
        this.fetchDocumentos();
    }

    fetchDocumentos = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docsRef = ref(db, 'camara-teste/documentos_administrativos');
                const q = query(docsRef, orderByChild('userId'), equalTo(user.uid));
                const snapshot = await get(q);
                const documentos = [];
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        documentos.push({ id: childSnapshot.key, ...childSnapshot.val() });
                    });
                }
                // Ordenar por data (mais recente primeiro)
                documentos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.setState({ documentos, loading: false });
            } catch (error) {
                console.error("Erro ao buscar documentos:", error);
                this.setState({ loading: false });
            }
        } else {
            setTimeout(() => {
                if (auth.currentUser) this.fetchDocumentos();
                else this.setState({ loading: false });
            }, 1000);
        }
    };

    render() {
        const { documentos, loading, searchTerm } = this.state;

        const filteredDocs = documentos.filter(doc => 
            (doc.titulo && doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (doc.tipo && doc.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            onClick={() => this.props.history.push('/assistente-admin/novo')}
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
                                <div key={doc.id} className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => alert('Visualização detalhada em breve!')}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span className="tag tag-primary">{doc.tipo}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', color: '#333' }}>{doc.titulo || 'Sem título'}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{doc.resumo || 'Documento gerado via Assistente.'}</p>
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