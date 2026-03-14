import React, { Component } from 'react';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import { FaPalette, FaHome, FaUsers, FaCog, FaUserShield, FaSave, FaUserPlus } from 'react-icons/fa';
import { db } from '../../firebaseConfig';
import { ref, get, update } from 'firebase/database';

class LayoutManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Home',
            selectedCamara: '',
            camaras: [],
            layoutConfig: {
                titulo: '',
                slogan: '',
                corPrimaria: '#126B5E',
                corDestaque: '#FF740F',
                logo: '',
                footerSlogan: '',
                footerAddress: '',
                footerPhone: '',
                footerEmail: '',
                footerCopyright: '',
            },
            loading: true,
        };
    }

    fetchLayoutData = async (camaraId) => {
        if (!camaraId) return;
        this.setState({ loading: true });
        const layoutRef = ref(db, `${camaraId}/dados-config/layout`);
        const homeRef = ref(db, `${camaraId}/dados-config/home`);
        const footerRef = ref(db, `${camaraId}/dados-config/footer`);
        const usersRef = ref(db, `${camaraId}/users`);

        console.log("Buscando dados para câmara:", camaraId);
     
        try {
            // Busca todos os dados em paralelo para melhor performance
            const [layoutSnapshot, homeSnapshot, footerSnapshot, usersSnapshot] = await Promise.all([
                get(layoutRef),
                get(homeRef),
                get(footerRef),
                get(usersRef)
            ]);

            const layoutData = layoutSnapshot.exists() ? layoutSnapshot.val() : {};
            const homeData = homeSnapshot.exists() ? homeSnapshot.val() : {};
            const footerData = footerSnapshot.exists() ? footerSnapshot.val() : {};
            const usersList = [];
            if (usersSnapshot.exists()) {
                Object.entries(usersSnapshot.val()).forEach(([key, val]) => {
                    usersList.push({ id: key, ...val });
                });
            }

            this.setState({
                layoutConfig: {
                    ...this.state.layoutConfig,
                    titulo: homeData.titulo || `Câmara Municipal de ${camaraId}`,
                    slogan: homeData.slogan || 'Inteligência Artificial para uma legislação mais transparente e acessível.',
                    corPrimaria: layoutData.corPrimaria || '#126B5E',
                    corDestaque: layoutData.corDestaque || '#FF740F',
                    logo: layoutData.logo || '',
                    footerSlogan: footerData.slogan || '',
                    footerAddress: footerData.address || '',
                    footerPhone: footerData.phone || '',
                    footerEmail: footerData.email || '',
                    footerCopyright: footerData.copyright || footerData.footerCopyright || '',
                },
                users: usersList,
                loading: false
            });
        } catch (error) {
            console.error("Erro ao buscar dados de layout:", error);
            this.setState({ loading: false });
        }
    };

    // --- Componentes das Abas (Internal Methods) ---
    
    renderHomeLayoutEditor = () => {
        const { layoutConfig } = this.state;
        console.log("Renderizando editor de Home com config:", this.state);
        return (
            <div className="dashboard-card">
                <h3 style={{ color: 'var(--primary-color, #126B5E)', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Conteúdo da Página Inicial</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="editor-field">
                        <label>Título Principal</label>
                        <input name="titulo" type="text" className="modal-input" value={layoutConfig.titulo || ''} onChange={this.handleLayoutChange} placeholder="Ex: Câmara Municipal de Nome da Cidade" />
                    </div>
                    <div className="editor-field">
                        <label>Slogan</label>
                        <input name="slogan" type="text" className="modal-input" value={layoutConfig.slogan || ''} onChange={this.handleLayoutChange} placeholder="Ex: Transparência e inovação" />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-start', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <button className="btn-primary" onClick={this.handleSaveLayout}><FaSave /> Salvar Alterações</button>
                </div>
            </div>
        );
    };

    renderGeneralSettingsEditor = () => {
        const { layoutConfig } = this.state;
        return (
            <div className="dashboard-card">
                <h3 style={{ color: 'var(--primary-color, #126B5E)', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Identidade Visual e Marca</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="editor-field" style={{ gridColumn: '1 / -1' }}>
                        <label>URL da Logomarca (PNG transparente recomendado)</label>
                        <input name="logo" type="text" className="modal-input" value={layoutConfig.logo || ''} onChange={this.handleLayoutChange} placeholder="https://exemplo.com/logo.png" />
                        {layoutConfig.logo && <div style={{ marginTop: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}><img src={layoutConfig.logo} alt="Preview Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} /></div>}
                    </div>
                    <div className="editor-field">
                        <label>Cor Primária (Sidebar e Cabeçalho)</label>
                        <input name="corPrimaria" type="color" className="modal-input" value={layoutConfig.corPrimaria || '#126B5E'} onChange={this.handleLayoutChange} style={{ padding: '5px', height: '45px' }} />
                    </div>
                    <div className="editor-field">
                        <label>Cor de Destaque (Botões e Destaques)</label>
                        <input name="corDestaque" type="color" className="modal-input" value={layoutConfig.corDestaque || '#FF740F'} onChange={this.handleLayoutChange} style={{ padding: '5px', height: '45px' }} />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-start', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <button className="btn-primary" onClick={this.handleSaveLayout}><FaSave /> Salvar Configurações Gerais</button>
                </div>
            </div>
        );
    };

    renderFooterLayoutEditor = () => {
        const { layoutConfig } = this.state;
        return (
            <div className="dashboard-card">
                <h3 style={{ color: 'var(--primary-color, #126B5E)', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Informações do Rodapé</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="editor-field" style={{ gridColumn: '1 / -1' }}>
                        <label>Slogan do Rodapé</label>
                        <input name="footerSlogan" type="text" className="modal-input" value={layoutConfig.footerSlogan || ''} onChange={this.handleLayoutChange} placeholder="Ex: Inteligência Artificial a serviço da cidadania." />
                    </div>
                    <div className="editor-field">
                        <label>Endereço</label>
                        <input name="footerAddress" type="text" className="modal-input" value={layoutConfig.footerAddress || ''} onChange={this.handleLayoutChange} placeholder="Rua, Número, Bairro" />
                    </div>
                    <div className="editor-field">
                        <label>Telefone</label>
                        <input name="footerPhone" type="text" className="modal-input" value={layoutConfig.footerPhone || ''} onChange={this.handleLayoutChange} placeholder="(00) 0000-0000" />
                    </div>
                    <div className="editor-field">
                        <label>Email de Contato</label>
                        <input name="footerEmail" type="email" className="modal-input" value={layoutConfig.footerEmail || ''} onChange={this.handleLayoutChange} placeholder="contato@camara.gov.br" />
                    </div>
                    <div className="editor-field" style={{ gridColumn: '1 / -1' }}>
                        <label>Texto de Copyright</label>
                        <input name="footerCopyright" type="text" className="modal-input" value={layoutConfig.footerCopyright || ''} onChange={this.handleLayoutChange} placeholder="Ex: © 2026 Câmara Municipal. Desenvolvido por Blu Sistemas" />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-start', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <button className="btn-primary" onClick={this.handleSaveLayout}><FaSave /> Salvar Alterações do Rodapé</button>
                </div>
            </div>
        );
    };

    renderUserManagement = () => {
        const { selectedCamara, users } = this.state;
        return (
            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--primary-color, #126B5E)', margin: 0 }}>Gestão de Usuários - {selectedCamara}</h3>
                    <button className="btn-primary" style={{ width: 'auto' }}><FaUserShield /> Convidar Membro</button>
                </div>
                <div className="matters-list-container" style={{ width: '100%', boxShadow: 'none', border: '1px solid #eee' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 20px', background: '#f8f9fa', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span>Nome / Email</span>
                        <span>Tipo de Acesso</span>
                        <span style={{ textAlign: 'right' }}>Ações</span>
                    </div>
                    {users && users.length > 0 ? users.map(user => (
                        <div key={user.id} className="matter-item" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{user.nome || 'Usuário sem nome'}</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{user.email}</p>
                            </div>
                            <div>
                                <select className="modal-input" style={{ padding: '5px', fontSize: '0.85rem' }} value={user.tipo || 'cidadao'} onChange={(e) => this.handleUpdateUserType(user.id, e.target.value)}>
                                    <option value="cidadao">Cidadão</option>
                                    <option value="vereador">Vereador</option>
                                    <option value="procurador">Procuradoria</option>
                                    <option value="presidente">Presidente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.7rem' }}>Resetar Senha</button>
                            </div>
                        </div>
                    )) : <p style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Nenhum usuário encontrado nesta câmara.</p>}
                </div>
            </div>
        );
    };

    componentDidMount() {
        console.log(this.state);
        this.fetchCamaras();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedCamara !== this.state.selectedCamara) {
            this.fetchLayoutData(this.state.selectedCamara);
        }
    }

    fetchCamaras = async () => {
        const rootRef = ref(db, '/');
        try {
            const snapshot = await get(rootRef);
            if (snapshot.exists()) {
                const camaraIds = Object.keys(snapshot.val());
                const camaras = camaraIds.map(id => ({ id: id, name: id.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) }));
                this.setState({ 
                    camaras, 
                    selectedCamara: camaras.length > 0 ? camaras[0].id : '' 
                }, () => {
                    if (this.state.selectedCamara) {
                        this.fetchLayoutData(this.state.selectedCamara);
                    } else {
                        this.setState({ loading: false });
                    }
                });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar lista de câmaras:", error);
            this.setState({ loading: false });
        }
    }

    

    handleLayoutChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            layoutConfig: {
                ...prevState.layoutConfig,
                [name]: value,
            }
        }));
    };

    handleUpdateUserType = async (userId, newType) => {
        const { selectedCamara } = this.state;
        try {
            const userRef = ref(db, `${selectedCamara}/users/${userId}`);
            await update(userRef, { tipo: newType });
            this.fetchLayoutData(selectedCamara);
        } catch (error) {
            console.error("Erro ao atualizar tipo de usuário:", error);
        }
    };

    handleSaveLayout = async () => {
        const { selectedCamara, layoutConfig } = this.state;
        if (!selectedCamara) {
            alert("Nenhuma câmara selecionada.");
            return;
        }
        const layoutRef = ref(db, `${selectedCamara}/dados-config/layout`);
        const homeRef = ref(db, `${selectedCamara}/dados-config/home`);
        const footerRef = ref(db, `${selectedCamara}/dados-config/footer`);

        try {
            // Save colors to layout node
            await update(layoutRef, {
                corPrimaria: layoutConfig.corPrimaria,
                corDestaque: layoutConfig.corDestaque,
                logo: layoutConfig.logo,
            });
            // Save texts to home node
            await update(homeRef, {
                titulo: layoutConfig.titulo,
                slogan: layoutConfig.slogan,
            });
            // Save footer data to footer node
            await update(footerRef, {
                slogan: layoutConfig.footerSlogan,
                address: layoutConfig.footerAddress,
                phone: layoutConfig.footerPhone,
                email: layoutConfig.footerEmail,
                copyright: layoutConfig.footerCopyright || layoutConfig.footerCopyright,
            });
            alert('Layout salvo com sucesso!');
        } catch (error) {
            console.error("Erro ao salvar layout:", error);
            alert('Erro ao salvar layout.');
        }
    };

    render() {
        const { activeTab, selectedCamara, camaras, layoutConfig, loading, users } = this.state;

        const tabs = [
            { name: 'Home', icon: <FaHome /> },
            { name: 'Rodapé', icon: <FaPalette /> },
            { name: 'Geral', icon: <FaCog /> },
            { name: 'Usuários', icon: <FaUserShield /> },
        ];

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard logo={layoutConfig.logo} />
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title"><FaPalette /> Gerenciador de Layouts</h1>
                            <p className="dashboard-header-desc">Configure a aparência e o conteúdo de cada câmara.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontWeight: '600', color: '#555' }}>Editando:</label>
                            <select 
                                className="filter-select" 
                                value={selectedCamara} 
                                onChange={(e) => this.setState({ selectedCamara: e.target.value })}
                            >
                                {camaras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Abas de Navegação */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
                        {tabs.map(tab => (
                            <button 
                                key={tab.name}
                                onClick={() => this.setState({ activeTab: tab.name })}
                                style={{
                                    padding: '15px 20px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === tab.name ? 'bold' : 'normal',
                                    color: activeTab === tab.name ? '#126B5E' : '#555',
                                    borderBottom: activeTab === tab.name ? '3px solid #126B5E' : '3px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </div>

                    {/* Conteúdo da Aba Ativa */}
                    {loading ? <p>Carregando configurações...</p> : (
                        <>
                            {activeTab === 'Home' && this.renderHomeLayoutEditor()}
                            {activeTab === 'Rodapé' && this.renderFooterLayoutEditor()}
                            {activeTab === 'Geral' && this.renderGeneralSettingsEditor()}
                            {activeTab === 'Usuários' && this.renderUserManagement()}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default LayoutManager;