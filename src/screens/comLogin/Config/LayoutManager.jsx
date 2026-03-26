import React, { Component } from 'react';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import { FaPalette, FaHome, FaCog, FaSave } from 'react-icons/fa';
import { db } from '../../../firebaseConfig';
import { ref, get, update } from 'firebase/database';
import { auth } from '../../../firebaseConfig';

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
        const layoutRef = ref(db, `${this.props.match.params.camaraId}/dados-config/layout`);
        const homeRef = ref(db, `${this.props.match.params.camaraId}/dados-config/home`);
        const footerRef = ref(db, `${this.props.match.params.camaraId}/dados-config/footer`);

        console.log("Buscando dados para câmara:", this.props.match.params.camaraId);
     
        try {
            // Busca todos os dados em paralelo para melhor performance
            const [layoutSnapshot, homeSnapshot, footerSnapshot] = await Promise.all([
                get(layoutRef),
                get(homeRef),
                get(footerRef),
            ]);

            const layoutData = layoutSnapshot.exists() ? layoutSnapshot.val() : {};
            const homeData = homeSnapshot.exists() ? homeSnapshot.val() : {};
            const footerData = footerSnapshot.exists() ? footerSnapshot.val() : {};

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

    componentDidMount() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const camaraIdFromUrl = this.props.match?.params?.camaraId;

                if (camaraIdFromUrl) {
                    this.setState({ selectedCamara: camaraIdFromUrl }, () => this.fetchLayoutData(camaraIdFromUrl));
                } else {
                    const userIndexRef = ref(db, `users_index/${user.uid}`);
                    const snapshot = await get(userIndexRef);
                    // Se o usuário não for admin geral, força a seleção apenas da câmara dele
                    const userCamaraId = snapshot.exists() ? snapshot.val().camaraId : 'camara-teste';
                    
                    // Aqui assumimos que LayoutManager deve gerenciar apenas a câmara do usuário logado
                    this.setState({ selectedCamara: userCamaraId }, () => this.fetchLayoutData(userCamaraId));
                }
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedCamara !== this.state.selectedCamara) {
            this.fetchLayoutData(this.state.selectedCamara);
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

    handleSaveLayout = async () => {
        const { selectedCamara, layoutConfig } = this.state;
        if (!selectedCamara) {
            alert("Nenhuma câmara selecionada.");
            return;
        }
        const layoutRef = ref(db, `${this.props.match.params.camaraId}/dados-config/layout`);
        const homeRef = ref(db, `${this.props.match.params.camaraId}/dados-config/home`);
        const footerRef = ref(db, `${this.props.match.params.camaraId}/dados-config/footer`);

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
        const { activeTab, selectedCamara, camaras, layoutConfig, loading } = this.state;

        const tabs = [
            { name: 'Home', icon: <FaHome /> },
            { name: 'Rodapé', icon: <FaPalette /> },
            { name: 'Geral', icon: <FaCog /> },
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
                        {/* Removido seletor de câmaras, agora gerencia apenas a câmara do usuário */}
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
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default LayoutManager;