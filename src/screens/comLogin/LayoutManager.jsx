import React, { Component } from 'react';
import MenuDashboard from '../../componets/menuDashboard.jsx';
import { FaPalette, FaHome, FaGavel, FaFileAlt, FaVideo, FaBook, FaUsers } from 'react-icons/fa';
import { db } from '../../firebaseConfig';
import { ref, get, update } from 'firebase/database';

// Componente para a aba da Home
const HomeLayoutEditor = ({ camaraId, layoutConfig, onLayoutChange, onSave }) => (
    <div className="dashboard-card">
        <h3 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Editando Layout da Página Inicial</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="editor-field">
                <label>Título Principal</label>
                <input name="titulo" type="text" className="modal-input" value={layoutConfig.titulo || ''} onChange={onLayoutChange} />
            </div>
            <div className="editor-field">
                <label>Slogan</label>
                <input name="slogan" type="text" className="modal-input" value={layoutConfig.slogan || ''} onChange={onLayoutChange} />
            </div>
            <div className="editor-field">
                <label>Cor Primária</label>
                <input name="corPrimaria" type="color" className="modal-input" value={layoutConfig.corPrimaria || '#126B5E'} onChange={onLayoutChange} style={{ padding: '5px', height: '45px' }} />
            </div>
            <div className="editor-field">
                <label>Cor de Destaque</label>
                <input name="corDestaque" type="color" className="modal-input" value={layoutConfig.corDestaque || '#FF740F'} onChange={onLayoutChange} style={{ padding: '5px', height: '45px' }} />
            </div>
            <div className="editor-field" style={{ gridColumn: '1 / -1' }}>
                <label>Logomarca da Câmara</label>
                <input type="file" className="modal-input" />
            </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'flex-start', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <button className="btn-primary" onClick={onSave}>Salvar Alterações da Home</button>
        </div>
    </div>
);

// Placeholder para outras abas
const GenericLayoutEditor = ({ pageName }) => (
    <div className="dashboard-card">
        <h3 style={{ color: '#126B5E' }}>Editando Layout de: {pageName}</h3>
        <p>Formulário de edição para a página de {pageName} virá aqui.</p>
    </div>
);

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
            },
            loading: true,
        };
    }

    componentDidMount() {
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

    fetchLayoutData = async (camaraId) => {
        if (!camaraId) return;
        this.setState({ loading: true });
        const layoutRef = ref(db, `${camaraId}/dados-config/layout`);
        const homeRef = ref(db, `${camaraId}/dados-config/home`);

        try {
            const layoutSnapshot = await get(layoutRef);
            const homeSnapshot = await get(homeRef);

            const layoutData = layoutSnapshot.exists() ? layoutSnapshot.val() : {};
            const homeData = homeSnapshot.exists() ? homeSnapshot.val() : {};

            this.setState({
                layoutConfig: {
                    titulo: homeData.titulo || `Câmara Municipal de ${camaraId}`,
                    slogan: homeData.slogan || 'Inteligência Artificial para uma legislação mais transparente e acessível.',
                    corPrimaria: layoutData.corPrimaria || '#126B5E',
                    corDestaque: layoutData.corDestaque || '#FF740F',
                },
                loading: false,
            });
        } catch (error) {
            console.error("Erro ao buscar dados de layout:", error);
            this.setState({ loading: false });
        }
    };

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
        const layoutRef = ref(db, `${selectedCamara}/dados-config/layout`);
        const homeRef = ref(db, `${selectedCamara}/dados-config/home`);

        try {
            // Save colors to layout node
            await update(layoutRef, {
                corPrimaria: layoutConfig.corPrimaria,
                corDestaque: layoutConfig.corDestaque,
            });
            // Save texts to home node
            await update(homeRef, {
                titulo: layoutConfig.titulo,
                slogan: layoutConfig.slogan,
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
            { name: 'Sessões', icon: <FaGavel /> },
            { name: 'Relatórios', icon: <FaFileAlt /> },
            { name: 'Sessão Virtual', icon: <FaVideo /> },
            { name: 'Normas', icon: <FaBook /> },
            { name: 'Comissões', icon: <FaUsers /> },
            { name: 'Matérias', icon: <FaFileAlt /> },
        ];

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
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
                            {activeTab === 'Home' && <HomeLayoutEditor camaraId={selectedCamara} layoutConfig={layoutConfig} onLayoutChange={this.handleLayoutChange} onSave={this.handleSaveLayout} />}
                            {activeTab !== 'Home' && <GenericLayoutEditor pageName={activeTab} />}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default LayoutManager;