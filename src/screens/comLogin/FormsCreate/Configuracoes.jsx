import React, { Component } from 'react';
import { FaCog, FaBook, FaHistory, FaFileAlt, FaSave, FaUpload, FaGavel, FaSpinner } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import { db } from '../../../firebaseConfig';
import { ref, get, update } from 'firebase/database';

class Configuracoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'regimento',
            regimentoText: '',
            leiOrganicaText: '',
            materiasText: '',
            atasText: '',
            isSaving: false,
            loading: true,
            camaraId: 'camara-teste'
        };
    }

    componentDidMount() {
        // Extrai o camaraId da URL ou usa o padrão
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const camaraId = pathParts.length > 1 ? pathParts[1] : 'camara-teste';
        
        this.setState({ camaraId }, () => {
            this.fetchConfig();
        });
    }

    fetchConfig = async () => {
        const { camaraId } = this.state;
        const configRef = ref(db, `${camaraId}/dados-config/base-conhecimento`);
        try {
            const snapshot = await get(configRef);
            if (snapshot.exists()) {
                this.setState({ ...snapshot.val(), loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar configurações da base:", error);
            this.setState({ loading: false });
        }
    };

    handleSave = async () => {
        const { camaraId, regimentoText, leiOrganicaText, materiasText, atasText } = this.state;
        this.setState({ isSaving: true });
        
        const configRef = ref(db, `${camaraId}/dados-config/base-conhecimento`);
        const config = { regimentoText, leiOrganicaText, materiasText, atasText };
        
        try {
            await update(configRef, config);
            alert('Base de Conhecimento atualizada com sucesso! A IA agora utilizará estas informações para gerar documentos mais precisos.');
        } catch (error) {
            console.error("Erro ao salvar base de conhecimento:", error);
            alert('Erro ao salvar as configurações.');
        } finally {
            this.setState({ isSaving: false });
        }
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
                <div className="dashboard-header" style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#126B5E', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {activeTab === 'regimento' && <FaBook />}
                            {activeTab === 'lei_organica' && <FaGavel />}
                            {activeTab === 'materias' && <FaHistory />}
                            {activeTab === 'atas' && <FaFileAlt />}
                            {title}
                        </h2>
                        <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '0.95rem' }}>{description}</p>
                    </div>
                    <button className="btn-primary" onClick={this.handleSave} disabled={this.state.isSaving} style={{ height: '45px' }}>
                        {this.state.isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} {this.state.isSaving ? 'Salvando...' : 'Salvar Dados'}
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#333', fontSize: '0.9rem' }}>CONTEÚDO E REGRAS (PARA A IA)</label>
                    <textarea 
                        className="modal-textarea" 
                        rows="20"
                        placeholder={`Cole o conteúdo do ${title} aqui...`}
                        value={value}
                        onChange={(e) => this.setState({ [onChangeKey]: e.target.value })}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', lineHeight: '1.6', color: '#333', padding: '20px' }}
                    ></textarea>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#333', fontSize: '0.9rem' }}>UPLOAD DE DOCUMENTOS COMPLEMENTARES</label>
                    <div style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888', cursor: 'pointer', backgroundColor: '#fcfcfc', transition: 'all 0.2s' }}
                         onMouseOver={(e) => e.currentTarget.style.borderColor = '#126B5E'}
                         onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}>
                        <FaUpload size={30} style={{ marginBottom: '10px', color: '#126B5E' }} />
                        <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>Arraste arquivos aqui ou clique para selecionar</p>
                        <p style={{ fontSize: '0.8rem', margin: '8px 0 0 0' }}>(PDF, DOCX ou TXT)</p>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { activeTab, loading } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

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