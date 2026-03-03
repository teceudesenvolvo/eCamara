import React, { Component } from 'react';
import { FaCog, FaBook, FaHistory, FaFileAlt, FaSave, FaUpload, FaGavel } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';

class Configuracoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'regimento',
            regimentoText: '',
            leiOrganicaText: '',
            materiasText: '',
            atasText: '',
            isSaving: false
        };
    }

    componentDidMount() {
        // Carrega configurações salvas (Simulação de persistência)
        const savedConfig = localStorage.getItem('camara_ai_config');
        if (savedConfig) {
            this.setState(JSON.parse(savedConfig));
        }
    }

    handleSave = () => {
        this.setState({ isSaving: true });
        
        // Salva no localStorage para persistir entre recarregamentos
        const { regimentoText, leiOrganicaText, materiasText, atasText } = this.state;
        const config = { regimentoText, leiOrganicaText, materiasText, atasText };
        localStorage.setItem('camara_ai_config', JSON.stringify(config));
        
        setTimeout(() => {
            this.setState({ isSaving: false });
            alert('Base de Conhecimento atualizada com sucesso! A IA agora utilizará estas informações para gerar documentos mais precisos.');
        }, 1000);
    };

    renderContent = () => {
        const { activeTab, regimentoText, leiOrganicaText, materiasText, atasText } = this.state;

        let title, description, value, onChangeKey;

        switch (activeTab) {
            case 'regimento':
                title = 'Regimento Interno';
                description = 'Cole aqui o texto completo do Regimento Interno da Câmara. A IA usará isso para validar ritos, prazos e competências.';
                value = regimentoText;
                onChangeKey = 'regimentoText';
                break;
            case 'lei_organica':
                title = 'Lei Orgânica';
                description = 'Cole o texto da Lei Orgânica do Município. Fundamental para análise de constitucionalidade e competência municipal.';
                value = leiOrganicaText;
                onChangeKey = 'leiOrganicaText';
                break;
            case 'materias':
                title = 'Histórico de Matérias';
                description = 'Insira resumos ou textos de matérias antigas para que a IA verifique duplicidades e mantenha a coerência legislativa.';
                value = materiasText;
                onChangeKey = 'materiasText';
                break;
            case 'atas':
                title = 'Atas e Sessões';
                description = 'Base de conhecimento sobre decisões tomadas em sessões anteriores e jurisprudência da casa.';
                value = atasText;
                onChangeKey = 'atasText';
                break;
            default:
                return null;
        }

        return (
            <div className="dashboard-card">
                <div className="dashboard-header" style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#126B5E', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {activeTab === 'regimento' && <FaBook />}
                            {activeTab === 'lei_organica' && <FaGavel />}
                            {activeTab === 'materias' && <FaHistory />}
                            {activeTab === 'atas' && <FaFileAlt />}
                            {title}
                        </h2>
                        <p style={{ color: '#666', margin: '5px 0 0 0' }}>{description}</p>
                    </div>
                    <button className="btn-primary" onClick={this.handleSave} disabled={this.state.isSaving}>
                        <FaSave /> {this.state.isSaving ? 'Salvando...' : 'Salvar Base de Conhecimento'}
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Conteúdo de Texto (Para Treinamento da IA)</label>
                    <textarea 
                        className="modal-textarea" 
                        rows="20"
                        placeholder={`Cole o conteúdo do ${title} aqui...`}
                        value={value}
                        onChange={(e) => this.setState({ [onChangeKey]: e.target.value })}
                        style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                    ></textarea>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Upload de Arquivos (PDF/DOCX)</label>
                    <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '30px', textAlign: 'center', color: '#888', cursor: 'pointer', backgroundColor: '#fafafa' }}>
                        <FaUpload size={30} style={{ marginBottom: '10px', color: '#126B5E' }} />
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>Arraste arquivos aqui ou clique para selecionar</p>
                        <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0' }}>(O processamento de arquivos PDF para extração de texto será implementado em breve)</p>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { activeTab } = this.state;

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    
                    {/* Sidebar de Navegação */}
                    <div style={{ flex: 1, maxWidth: '300px' }}>
                        <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                            <div>
                                <h1 className="dashboard-header-title">
                                    <FaCog className="icon-primary" /> Configurações
                                </h1>
                                <p className="dashboard-header-desc">Base de Conhecimento da IA.</p>
                            </div>
                        </div>

                        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                            {[
                                { id: 'regimento', label: 'Regimento Interno', icon: <FaBook /> },
                                { id: 'lei_organica', label: 'Lei Orgânica', icon: <FaGavel /> },
                                { id: 'materias', label: 'Matérias Antigas', icon: <FaHistory /> },
                                { id: 'atas', label: 'Atas e Sessões', icon: <FaFileAlt /> }
                            ].map(item => (
                                <div 
                                    key={item.id}
                                    className="list-item" 
                                    style={{ 
                                        margin: 0, 
                                        borderRadius: 0, 
                                        borderBottom: '1px solid #eee', 
                                        cursor: 'pointer', 
                                        background: activeTab === item.id ? '#e0f2f1' : 'white',
                                        borderLeft: activeTab === item.id ? '4px solid #126B5E' : '4px solid transparent'
                                    }}
                                    onClick={() => this.setState({ activeTab: item.id })}
                                >
                                    <div className="list-item-content" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span className={activeTab === item.id ? 'icon-primary' : ''} style={{ color: activeTab === item.id ? '#126B5E' : '#888' }}>
                                            {item.icon}
                                        </span>
                                        <span style={{ fontWeight: '600', color: activeTab === item.id ? '#126B5E' : '#333' }}>{item.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Área de Conteúdo */}
                    <div style={{ flex: 2 }}>
                        {this.renderContent()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Configuracoes;