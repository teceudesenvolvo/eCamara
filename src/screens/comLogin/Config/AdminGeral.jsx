import React, { Component } from 'react';
import api from '../../../services/api.js';
import { FaBuilding, FaPlus, FaLock, FaSignOutAlt, FaCheckCircle, FaTrash, FaExternalLinkAlt, FaUserPlus, FaUsers, FaTimes, FaCopy, FaCogs } from 'react-icons/fa';

class AdminGeral extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: false,
            showLoginModal: true,
            activeTab: 'camaras', // 'camaras' ou 'admins'

            email: '',
            password: '',
            error: '',
            loading: false,

            // Formulário de Nova Câmara
            camaraName: '',
            camaraCity: '',
            camaraState: '',
            camaraId: '', // Slug (ID do banco de dados)
            creating: false,

            existingCamaras: [],

            // Formulário de Admin Local
            adminName: '',
            adminEmail: '',
            adminPassword: '',
            selectedCamaraForAdmin: '',

            // Modal de Usuários da Câmara
            showUserModal: false,
            selectedCamaraForUsers: null,
            camaraUsers: [],
            loadingUsers: false,
            modalAdminName: '',
            modalAdminEmail: '',
            modalAdminPassword: '',

            // Modal de Módulos (Páginas de Serviço)
            showModulesModal: false,
            modulesConfig: {}
        };
    }

    componentDidMount() {
        this.checkAuth();
    }

    checkAuth = () => {
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');
        const token = localStorage.getItem('@CamaraAI:token');

        if (token && (user.role === 'superadmin' || user.email === 'root@blutecnologias.com.br' || user.email === 'admin@blutecnologias.com.br')) {
            this.setState({ isAuthenticated: true, showLoginModal: false });
            this.fetchCamaras();
        } else {
            this.setState({ isAuthenticated: false, showLoginModal: true });
        }
    }

    fetchCamaras = async () => {
        try {
            const response = await api.get('/councils');
            const data = response.data || [];

            const camarasList = data.map(camara => {
                const config = camara.config || camara.dadosConfig || {};
                return {
                    id: camara.id,
                    slug: camara.slug,
                    name: config.home?.titulo || camara.name || camara.slug,
                    city: config.home?.cidade || '',
                    state: config.home?.estado || '',
                    createdAt: camara.createdAt
                };
            });

            this.setState({ existingCamaras: camarasList });
        } catch (error) {
            console.error("Erro ao buscar câmaras:", error);
        }
    }

    handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = this.state;

        if (!email || !password) {
            this.setState({ error: 'Preencha usuário e senha.' });
            return;
        }

        this.setState({ loading: true, error: '' });

        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data;

            if (user.role === 'superadmin' || user.email === 'root@blutecnologias.com.br' || user.email === 'admin@blutecnologias.com.br') {
                localStorage.setItem('@CamaraAI:token', token);
                localStorage.setItem('@CamaraAI:user', JSON.stringify(user));
                this.setState({ isAuthenticated: true, showLoginModal: false, loading: false });
                this.fetchCamaras();
            } else {
                this.setState({ error: 'Acesso negado. Apenas o super admin pode acessar esta página.', loading: false });
            }
        } catch (error) {
            this.setState({ error: 'Erro ao fazer login. Verifique suas credenciais.', loading: false });
        }
    };

    handleLogout = async () => {
        localStorage.removeItem('@CamaraAI:token');
        localStorage.removeItem('@CamaraAI:user');
        this.setState({ isAuthenticated: false, showLoginModal: true, email: '', password: '' });
    }

    generateId = (name) => {
        return name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
            .trim()
            .replace(/\s+/g, "-"); // Substitui espaços por hifens
    }

    handleNameChange = (e) => {
        const name = e.target.value;
        this.setState({
            camaraName: name,
            camaraId: this.generateId(name)
        });
    }

    handleCreateCamara = async () => {
        const { camaraName, camaraCity, camaraState, camaraId } = this.state;

        if (!camaraName || !camaraCity || !camaraState || !camaraId) {
            alert("Preencha todos os campos.");
            return;
        }

        this.setState({ creating: true });

        try {
            // Estrutura Inicial da Nova Câmara
            const newCamaraData = {
                name: camaraName,
                slug: camaraId,
                config: {
                    "home": {
                        "titulo": camaraName,
                        "slogan": "Transparência e Inovação Legislativa com IA.",
                        "cidade": camaraCity,
                        "state": camaraState
                    },
                    "layout": {
                        "corPrimaria": "#126B5E",
                        "corDestaque": "#FF740F",
                        "logo": "https://via.placeholder.com/150?text=Logo"
                    },
                    "footer": {
                        "address": `${camaraCity} - ${camaraState}`,
                        "copyright": `© ${new Date().getFullYear()} ${camaraName} - Powered by Blu Tecnologias`
                    },
                    "base-conhecimento": {
                        "regimentoText": "Insira o regimento interno aqui...",
                        "leiOrganicaText": "Insira a lei orgânica aqui..."
                    }
                }
            };

            await api.post('/councils', newCamaraData);

            alert(`Câmara "${camaraName}" criada com sucesso!`);
            this.setState({
                camaraName: '',
                camaraCity: '',
                camaraState: '',
                camaraId: '',
                creating: false
            });
            this.fetchCamaras();

        } catch (error) {
            console.error("Erro ao criar câmara:", error);
            alert("Erro ao criar câmara: " + (error.response?.data?.message || error.message));
            this.setState({ creating: false });
        }
    }

    handleDeleteCamara = async (id) => {
        if (window.confirm(`Tem certeza que deseja EXCLUIR a câmara "${id}"? Esta ação não pode ser desfeita e apagará TODOS os dados.`)) {
            try {
                await api.delete(`/councils/id/${id}`);
                alert("Câmara excluída com sucesso.");
                this.fetchCamaras();
            } catch (error) {
                console.error("Erro ao excluir câmara:", error);
                alert("Erro ao excluir câmara.");
            }
        }
    }

    handleCreateLocalAdmin = async (e) => {
        e.preventDefault();
        const { adminName, adminEmail, adminPassword, selectedCamaraForAdmin } = this.state;

        if (!adminName || !adminEmail || !adminPassword || !selectedCamaraForAdmin) {
            alert("Preencha todos os campos para criar o administrador.");
            return;
        }

        this.setState({ creating: true });

        try {
            await api.post('/auth/register', {
                email: adminEmail,
                name: adminName,
                password: adminPassword,
                role: 'admin',
                councilSlug: selectedCamaraForAdmin
            });

            alert(`Administrador criado com sucesso!`);

            this.setState({
                adminName: '',
                adminEmail: '',
                adminPassword: '',
                selectedCamaraForAdmin: '',
                creating: false
            });

        } catch (error) {
            console.error("Erro ao criar admin:", error);
            alert("Erro ao criar administrador: " + (error.response?.data?.message || error.message));
            this.setState({ creating: false });
        }
    }

    renderAdminTab = () => {
        const { existingCamaras, adminName, adminEmail, adminPassword, selectedCamaraForAdmin, creating } = this.state;

        return (
            <div style={{ textAlign: 'left', animation: 'fadeIn 0.5s' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', color: '#333' }}>Criar Administrador Local</h3>
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Cria uma conta com privilégios de <strong>Administrador</strong> para a câmara selecionada e atritua uma senha inicial.
                </p>

                <div style={{ maxWidth: '600px' }}>
                    <div className="mb-4" style={{ marginBottom: '15px' }}>
                        <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Selecione a Câmara</label>
                        <select
                            className="modal-input"
                            value={selectedCamaraForAdmin}
                            onChange={(e) => this.setState({ selectedCamaraForAdmin: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {existingCamaras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="mb-4" style={{ marginBottom: '15px' }}>
                        <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Nome do Responsável</label>
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Nome Completo"
                            value={adminName}
                            onChange={(e) => this.setState({ adminName: e.target.value })}
                        />
                    </div>

                    <div className="mb-4" style={{ marginBottom: '15px' }}>
                        <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>E-mail Institucional</label>
                        <input
                            type="email"
                            className="modal-input"
                            placeholder="admin@camara.leg.br"
                            value={adminEmail}
                            onChange={(e) => this.setState({ adminEmail: e.target.value })}
                        />
                    </div>

                    <div className="mb-4" style={{ marginBottom: '25px' }}>
                        <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Senha Inicial</label>
                        <input
                            type="password"
                            className="modal-input"
                            placeholder="Senha forte"
                            value={adminPassword}
                            onChange={(e) => this.setState({ adminPassword: e.target.value })}
                        />
                    </div>

                    <button className="btn-primary" onClick={this.handleCreateLocalAdmin} disabled={creating} style={{ padding: '12px 25px' }}>
                        {creating ? 'Criando...' : <><FaUserPlus /> Cadastrar Administrador</>}
                    </button>
                </div>
            </div>
        );
    }

    handleOpenUserModal = async (camaraId) => {
        this.setState({
            showUserModal: true,
            selectedCamaraForUsers: camaraId,
            camaraUsers: [],
            loadingUsers: true,
            modalAdminName: '',
            modalAdminEmail: '',
            modalAdminPassword: ''
        });

        try {
            const response = await api.get(`/users/council/${camaraId}`);
            this.setState({ camaraUsers: response.data || [], loadingUsers: false });
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            this.setState({ loadingUsers: false });
        }
    }

    handleOpenModulesModal = async (camaraId) => {
        this.setState({
            showModulesModal: true,
            selectedCamaraForModules: camaraId,
            loadingModules: true
        });

        try {
            const response = await api.get(`/councils/${camaraId}`);
            const config = response.data?.config || response.data?.dadosConfig || {};
            const modulesConfig = config.modulos_ativos || {
                agendamentos: false,
                assistenciaJuridica: false,
                balcaoCidadao: false,
                escolaLegislativo: false,
                falarComVereador: false,
                ouvidoria: false,
                procon: false,
                procuradoriaMulher: false,
                salaEmpreendedor: false,
                tvCamara: false
            };
            this.setState({ modulesConfig, loadingModules: false });
        } catch (error) {
            console.error("Erro ao carregar módulos:", error);
            this.setState({ loadingModules: false });
        }
    }

    handleToggleModule = (moduleId) => {
        this.setState(prevState => ({
            modulesConfig: {
                ...prevState.modulesConfig,
                [moduleId]: !prevState.modulesConfig[moduleId]
            }
        }));
    }

    handleSaveModules = async () => {
        const { selectedCamaraForModules, modulesConfig } = this.state;
        try {
            const response = await api.get(`/councils/${selectedCamaraForModules}`);
            const currentConfig = response.data?.config || response.data?.dadosConfig || {};
            const updatedConfig = { ...currentConfig, modulos_ativos: modulesConfig };

            await api.patch(`/councils/${selectedCamaraForModules}`, { config: updatedConfig });
            alert("Configurações de módulos salvas com sucesso!");
            this.setState({ showModulesModal: false });
        } catch (error) {
            console.error("Erro ao salvar módulos:", error);
            alert("Erro ao salvar configurações.");
        }
    }

    handleCloseUserModal = () => {
        this.setState({ showUserModal: false, selectedCamaraForUsers: null });
    }

    handleCreateAdminModal = async () => {
        const { selectedCamaraForUsers, modalAdminName, modalAdminEmail, modalAdminPassword } = this.state;
        if (!modalAdminName || !modalAdminEmail || !modalAdminPassword) {
            alert("Preencha nome, email e senha.");
            return;
        }

        try {
            await api.post('/auth/register', {
                email: modalAdminEmail,
                name: modalAdminName,
                password: modalAdminPassword,
                role: 'admin',
                councilSlug: selectedCamaraForUsers
            });
            alert("Administrador criado com sucesso.");
            this.setState({ modalAdminName: '', modalAdminEmail: '', modalAdminPassword: '' });
            this.handleOpenUserModal(selectedCamaraForUsers);
        } catch (error) {
            console.error("Erro ao criar admin:", error);
            alert("Erro ao criar admin.");
        }
    }

    render() {
        const { isAuthenticated, showLoginModal, email, password, error, loading, camaraName, camaraCity, camaraState, camaraId, creating, existingCamaras, activeTab, showUserModal, camaraUsers, loadingUsers, modalAdminName, modalAdminEmail, modalAdminPassword, selectedCamaraForUsers } = this.state;

        if (!isAuthenticated) {
            return (
                <div className="App-header" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {showLoginModal && (
                        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
                            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
                                <h2 style={{ color: '#126B5E', marginBottom: '10px' }}><FaLock /> Admin Geral</h2>
                                <p style={{ marginBottom: '25px', color: '#666' }}>Área restrita à Blu Tecnologias.</p>

                                <form onSubmit={this.handleLogin}>
                                    <input
                                        type="email"
                                        className="modal-input"
                                        placeholder="root@blutecnologias.com.br"
                                        value={email}
                                        onChange={(e) => this.setState({ email: e.target.value })}
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <input
                                        type="password"
                                        className="modal-input"
                                        placeholder="Senha de Acesso"
                                        value={password}
                                        onChange={(e) => this.setState({ password: e.target.value })}
                                        style={{ marginBottom: '20px' }}
                                    />
                                    {error && <p style={{ color: '#d32f2f', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>}

                                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                                        {loading ? 'Autenticando...' : 'Acessar Painel'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="App-header" style={{ justifyContent: 'flex-start', paddingTop: '50px', background: '#f0f2f5' }}>
                <div className="dashboard-card" style={{ width: '90%', maxWidth: '800px', position: 'relative', padding: '40px' }}>
                    <div style={{ position: 'absolute', top: '30px', right: '30px' }}>
                        <button onClick={this.handleLogout} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 15px', background: '#fff' }}>
                            <FaSignOutAlt /> Sair
                        </button>
                    </div>

                    <h1 style={{ color: '#126B5E', marginBottom: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBuilding /> Painel Admin Geral
                    </h1>
                    <p style={{ color: '#666', marginBottom: '40px', textAlign: 'left' }}>Gerenciamento de Câmaras Municipais</p>

                    {/* --- Navegação por Abas Superior --- */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '30px' }}>
                        <button
                            onClick={() => this.setState({ activeTab: 'camaras' })}
                            style={{
                                padding: '12px 25px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === 'camaras' ? '700' : '500',
                                color: activeTab === 'camaras' ? '#126B5E' : '#888',
                                borderBottom: activeTab === 'camaras' ? '3px solid #126B5E' : '3px solid transparent',
                                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
                            }}
                        >
                            <FaBuilding /> Câmaras
                        </button>
                        <button
                            onClick={() => this.setState({ activeTab: 'admins' })}
                            style={{
                                padding: '12px 25px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === 'admins' ? '700' : '500',
                                color: activeTab === 'admins' ? '#126B5E' : '#888',
                                borderBottom: activeTab === 'admins' ? '3px solid #126B5E' : '3px solid transparent',
                                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
                            }}
                        >
                            <FaUserPlus /> Administradores
                        </button>
                    </div>

                    {activeTab === 'camaras' ? (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', color: '#333', textAlign: 'left' }}>Criar Nova Câmara</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', textAlign: 'left' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Nome da Câmara</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="Ex: Câmara Municipal de Salvador"
                                        value={camaraName}
                                        onChange={this.handleNameChange}
                                    />
                                </div>

                                <div>
                                    <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Cidade</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="Salvador"
                                        value={camaraCity}
                                        onChange={(e) => this.setState({ camaraCity: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>Estado (UF)</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="BA"
                                        value={camaraState}
                                        onChange={(e) => this.setState({ camaraState: e.target.value })}
                                        maxLength={2}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label-form" style={{ display: 'block', marginBottom: '8px' }}>ID do Sistema (Slug)</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        value={camaraId}
                                        readOnly
                                        style={{ background: '#f5f5f5', color: '#666' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>Este ID será usado na URL (ex: e-camara.com/home/<strong>{camaraId || '...'}</strong>)</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn-primary" onClick={this.handleCreateCamara} disabled={creating} style={{ padding: '12px 25px' }}>
                                    {creating ? 'Processando...' : <><FaCheckCircle /> Criar Câmara</>}
                                </button>
                            </div>

                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', marginTop: '50px', color: '#333', textAlign: 'left' }}>Câmaras Gerenciadas ({existingCamaras.length})</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {existingCamaras.map(camara => (
                                    <div key={camara.id} className="dashboard-card" style={{ padding: '20px', margin: 0, borderLeft: '4px solid #126B5E' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.1rem' }}>{camara.name}</h4>
                                            <a href={`/home/${camara.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#126B5E' }} title="Acessar Portal">
                                                <FaExternalLinkAlt />
                                            </a>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 5px 0' }}>ID: <strong>{camara.id}</strong></p>
                                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 15px 0' }}>
                                            {camara.city && `${camara.city} - ${camara.state}`}
                                            {camara.createdAt && <span style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>Criada em: {new Date(camara.createdAt).toLocaleDateString()}</span>}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                            <button
                                                onClick={() => this.handleOpenUserModal(camara.id)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <FaUsers /> Usuários
                                            </button>
                                            <button
                                                onClick={() => this.handleOpenModulesModal(camara.id)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', background: '#e3f2fd', color: '#1565c0', borderColor: '#bbdefb' }}
                                            >
                                                <FaCogs /> Módulos
                                            </button>
                                            <button
                                                onClick={() => this.handleDeleteCamara(camara.id)}
                                                className="btn-danger"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                            >
                                                <FaTrash /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {existingCamaras.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma câmara encontrada.</p>}
                            </div>
                        </div>
                    ) : (
                        this.renderAdminTab()
                    )}

                </div>

                {/* Modal de Gestão de Usuários da Câmara */}
                {showUserModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                            <div className="modal-header">
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaUsers /> Usuários: {selectedCamaraForUsers}
                                </h2>
                                <button onClick={this.handleCloseUserModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            {/* Seção Criar Admin */}
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#126B5E' }}>Criar Novo Admin</h4>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input type="text" className="modal-input" placeholder="Nome" value={modalAdminName} onChange={(e) => this.setState({ modalAdminName: e.target.value })} style={{ flex: 1 }} />
                                    <input type="email" className="modal-input" placeholder="Email" value={modalAdminEmail} onChange={(e) => this.setState({ modalAdminEmail: e.target.value })} style={{ flex: 1 }} />
                                    <input type="password" className="modal-input" placeholder="Senha" value={modalAdminPassword} onChange={(e) => this.setState({ modalAdminPassword: e.target.value })} style={{ flex: 1 }} />
                                </div>
                                <button className="btn-primary" onClick={this.handleCreateAdminModal} style={{ width: '100%' }}>Cadastrar Administrador</button>
                            </div>

                            {/* Lista de Usuários */}
                            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>Usuários Cadastrados ({camaraUsers.length})</h4>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {loadingUsers ? (
                                    <p>Carregando...</p>
                                ) : (
                                    camaraUsers.length > 0 ? (
                                        camaraUsers.map(user => (
                                            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{user.nome}</p>
                                                    <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>{user.email}</p>
                                                </div>
                                                <span className={`tag ${user.tipo === 'admin' ? 'tag-primary' : 'tag-neutral'}`}>
                                                    {user.tipo}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhum usuário encontrado.</p>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Configuração de Módulos (Serviços) */}
                {this.state.showModulesModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                            <div className="modal-header">
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCogs /> Módulos de Serviço: {this.state.selectedCamaraForModules}
                                </h2>
                                <button onClick={() => this.setState({ showModulesModal: false })} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
                            </div>

                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'left' }}>
                                Selecione quais páginas do módulo de <strong>Serviços</strong> estarão disponíveis para esta câmara:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '30px' }}>
                                <h4 style={{ margin: '10px 0 5px 0', fontSize: '0.9rem', color: '#126B5E', textTransform: 'uppercase' }}>Legislativo</h4>
                                {[
                                    { id: 'protocolar', label: 'Protocolar Matéria' },
                                    { id: 'parecer', label: 'Parecer Jurídico (Procuradoria)' },
                                    { id: 'presidencia', label: 'Juízo da Presidência' },
                                    { id: 'comissoes', label: 'Gestão de Comissões' },
                                    { id: 'sessoes', label: 'Gestão de Sessões' },
                                    { id: 'assistente', label: 'Assistente Legislativo IA' },
                                ].map(module => (
                                    <label key={module.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={this.state.modulesConfig[module.id] || false}
                                            onChange={() => this.handleToggleModule(module.id)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontWeight: '500', color: '#333' }}>{module.label}</span>
                                    </label>
                                ))}

                                <h4 style={{ margin: '20px 0 5px 0', fontSize: '0.9rem', color: '#126B5E', textTransform: 'uppercase' }}>Serviços ao Cidadão</h4>
                                {[
                                    { id: 'agendamentos', label: 'Agendamentos' },
                                    { id: 'assistenciaJuridica', label: 'Assistência Jurídica' },
                                    { id: 'balcaoCidadao', label: 'Balcão-Cidadão' },
                                    { id: 'escolaLegislativo', label: 'Escola do Legislativo' },
                                    { id: 'falarComVereador', label: 'Falar com Vereador' },
                                    { id: 'ouvidoria', label: 'Ouvidoria' },
                                    { id: 'procon', label: 'Procon' },
                                    { id: 'procuradoriaMulher', label: 'Procuradoria da Mulher' },
                                    { id: 'salaEmpreendedor', label: 'Sala do Empreendedor' },
                                    { id: 'tvCamara', label: 'TV Câmara' }
                                ].map(module => (
                                    <label key={module.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={this.state.modulesConfig[module.id] || false}
                                            onChange={() => this.handleToggleModule(module.id)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontWeight: '500', color: '#333' }}>{module.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-secondary" onClick={() => this.setState({ showModulesModal: false })} style={{ flex: 1 }}>Cancelar</button>
                                <button className="btn-primary" onClick={this.handleSaveModules} style={{ flex: 1, justifyContent: 'center' }}>
                                    Salvar Configuração
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default AdminGeral;