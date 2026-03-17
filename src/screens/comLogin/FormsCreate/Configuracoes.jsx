import React, { Component } from 'react';
import { FaCog, FaBook, FaHistory, FaFileAlt, FaSave, FaUpload, FaGavel, FaSpinner, FaUsers, FaUserShield, FaPlus, FaPencilAlt, FaTimes, FaUserPlus, FaCopy } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import { db } from '../../../firebaseConfig';
import { query, orderByChild, equalTo, ref, get, update, push, set, remove } from 'firebase/database';

import { auth } from '../../../firebaseConfig';

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
            camaraId: this.props.match.params.camaraId,
            // State for new tabs
            users: [],
            comissoes: [],
            // State for commission management modals
            showComissaoModal: false,
            editingComissao: null,
            comissaoFormData: { nome: '', descricao: '', tipo: 'Permanente' },
            showAddMemberModal: false,
            commissionToUpdateMembers: null,
            newUserForCommission: '',
            newRoleForCommission: 'Membro',
            // State for User Invite
            showInviteModal: false,
            inviteType: 'vereador',
        };
    }

    componentDidMount() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                if (!this.state.camaraId || this.state.camaraId === this.props.match.params.camaraId) {
                    const userIndexRef = ref(db, `${this.props.match.params.camaraId}/users${user.uid}`);
                    const snapshot = await get(userIndexRef);
                    const camaraId = snapshot.exists() ? snapshot.val().camaraId : this.props.match.params.camaraId;
                    this.setState({ camaraId }, () => this.fetchConfig());
                } else {
                    this.fetchConfig();
                }
            }
        });
    }

    // --- Modal Handlers ---
    handleOpenInviteModal = () => {
        this.setState({ showInviteModal: true });
    }

    handleCloseInviteModal = () => {
        this.setState({ showInviteModal: false });
    }

    fetchConfig = async () => {

        const { camaraId } = this.state;

        try {

            const baseRef = ref(db, `${camaraId}/dados-config/base-conhecimento`);
            const usersRef = ref(db, `${camaraId}/users`);
            const comissoesRef = ref(db, `${camaraId}/comissoes`);

            const [baseSnapshot, usersSnapshot, comissoesSnapshot] = await Promise.all([
                get(baseRef),
                get(usersRef),
                get(comissoesRef)
            ]);

            let baseData = {};
            let usersList = [];
            let comissoesList = [];

            if (baseSnapshot.exists()) {
                baseData = baseSnapshot.val();
            }

            if (usersSnapshot.exists()) {
                usersSnapshot.forEach(child => {
                    usersList.push({
                        id: child.key,
                        ...child.val()
                    });
                });
            }

            if (comissoesSnapshot.exists()) {
                comissoesSnapshot.forEach(child => {
                    comissoesList.push({
                        id: child.key,
                        ...child.val()
                    });
                });
            }

            this.setState({
                regimentoText: baseData.regimentoText || '',
                leiOrganicaText: baseData.leiOrganicaText || '',
                materiasText: baseData.materiasText || '',
                atasText: baseData.atasText || '',
                users: usersList,
                comissoes: comissoesList,
                loading: false
            });

        } catch (error) {

            console.error("Erro ao buscar configurações:", error);

            this.setState({
                loading: false
            });

        }

    };

    handleSave = async () => {
        const { camaraId, regimentoText, leiOrganicaText, materiasText, atasText } = this.state;
        this.setState({ isSaving: true });
        const { camaraId: camaraIdUrl } = this.props.match.params.camaraId;
        const camaraIdParaSalvar = this.props.match.params.camaraId;// Prioriza o camaraId da URL, mas cai para o estado se não tiver

        const configRef = ref(db, `${camaraIdParaSalvar}/dados-config/base-conhecimento`);

        const config = { regimentoText, leiOrganicaText, materiasText, atasText, camaraId };

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

    // --- User and Commission Handlers (Moved from LayoutManager) ---

    handleUpdateUserType = async (userId, newType) => {
        const { camaraId } = this.state;
        try {
            const userRef = ref(db, `${camaraId}/users/${userId}`);
            await update(userRef, { tipo: newType });
            this.fetchConfig(); // Refetch to update UI
        } catch (error) {
            console.error("Erro ao atualizar tipo de usuário:", error);
        }
    };

    handleGenerateAndCopyInviteLink = () => {
        const { camaraId, inviteType } = this.state; // Removido inviteEmail pois não é mais usado no estado

        // Criar registro de convite no banco
        const convitesRef = ref(db, `${camaraId}/convites`);
        const newInviteRef = push(convitesRef);
        const inviteId = newInviteRef.key;
        const inviteLink = `${window.location.origin}/register?invite=${inviteId}&camara=${camaraId}`;

        const inviteData = {
            tipo: inviteType,
            createdAt: new Date().toISOString(),
            used: false
        };

        navigator.clipboard.writeText(inviteLink)
            .then(() => alert(`Link de convite criado e copiado!\n\nEnvie este link para o novo usuário.`))
            .catch(err => console.error('Erro ao copiar link: ', err));

        set(newInviteRef, inviteData);

        this.handleCloseInviteModal();
    };

    handleOpenComissaoModal = (comissao = null) => {
        if (comissao) {
            this.setState({
                showComissaoModal: true,
                editingComissao: comissao,
                comissaoFormData: { 
                    nome: comissao.nome, 
                    descricao: comissao.descricao,
                    tipo: comissao.tipo || 'Permanente'
                }
            });
        } else {
            this.setState({
                showComissaoModal: true,
                editingComissao: null,
                comissaoFormData: { nome: '', descricao: '', tipo: 'Permanente' }
            });
        }
    };

    handleCloseComissaoModal = () => {
        this.setState({ showComissaoModal: false, editingComissao: null });
    };

    handleComissaoFormChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            comissaoFormData: { ...prevState.comissaoFormData, [name]: value }
        }));
    };

    handleSaveComissao = async () => {
        const { camaraId, editingComissao, comissaoFormData } = this.state;
        if (!comissaoFormData.nome) {
            alert("O nome da comissão é obrigatório.");
            return;
        }
        try {
            if (editingComissao) {
                await update(ref(db, `${camaraId}/comissoes/${editingComissao.id}`), comissaoFormData);
            } else {
                await push(ref(db, `${camaraId}/comissoes`), comissaoFormData);
            }
            alert('Comissão salva com sucesso!');
            this.handleCloseComissaoModal();
            this.fetchConfig();
        } catch (error) {
            console.error("Erro ao salvar comissão:", error);
            alert("Erro ao salvar comissão.");
        }
    };

    handleOpenAddMemberModal = (comissao) => this.setState({ showAddMemberModal: true, commissionToUpdateMembers: comissao });
    handleCloseAddMemberModal = () => this.setState({ 
        showAddMemberModal: false, 
        commissionToUpdateMembers: null,
        newUserForCommission: '',
        newRoleForCommission: 'Membro'
    });

    handleAddMemberToCommission = async () => {
        const { camaraId, commissionToUpdateMembers, users, newUserForCommission, newRoleForCommission } = this.state;

        if (!newUserForCommission) {
            alert('Por favor, selecione um membro.');
            return;
        }

        const user = users.find(u => u.id === newUserForCommission);
        if (!user) {
            alert('Usuário selecionado não encontrado.');
            return;
        }

        const memberData = { id: user.id, nome: user.nome, foto: user.foto || '', cargo: newRoleForCommission };
        const memberRef = ref(db, `${camaraId}/comissoes/${commissionToUpdateMembers.id}/membros/${user.id}`);
        await set(memberRef, memberData);
        this.fetchConfig();
        this.handleCloseAddMemberModal();
    };

    handleRemoveMember = async (comissaoId, memberId) => {
        const { camaraId } = this.state;
        await remove(ref(db, `${camaraId}/comissoes/${comissaoId}/membros/${memberId}`));
        this.fetchConfig();
    };

    // --- Render Methods for New Tabs ---

    renderUserManagement = () => {
        const { camaraId, users, showInviteModal } = this.state;
        return (
            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--primary-color, #126B5E)', margin: 0 }}>Gestão de Usuários - {camaraId}</h3>
                    <button className="btn-primary" style={{ width: 'auto' }} onClick={this.handleOpenInviteModal}><FaUserPlus /> Convidar Membro</button>
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
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>Ativo</span>
                            </div>
                        </div>
                    )) : <p style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Nenhum usuário encontrado nesta câmara.</p>}
                </div>
            </div>
        );
    };

    renderComissoesManager = () => {
        const { comissoes, users, showAddMemberModal } = this.state;
        return (
            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--primary-color, #126B5E)', margin: 0 }}>Gerenciar Comissões</h3>
                    <button className="btn-primary" style={{ width: 'auto' }} onClick={() => this.handleOpenComissaoModal()}><FaPlus /> Nova Comissão</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {comissoes.map(comissao => (
                        <div key={comissao.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <h4 style={{ margin: 0, color: '#333' }}>{comissao.nome}</h4>
                                        <span className="tag tag-neutral" style={{padding: '3px 8px', fontSize: '0.7rem'}}>{comissao.tipo || 'Não definido'}</span>
                                    </div>
                                    
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#666' }}>{comissao.descricao}</p>
                                </div>
                                <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => this.handleOpenComissaoModal(comissao)}><FaPencilAlt /> Editar</button>
                            </div>
                            <div style={{ width: '100%', borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '15px' }}>
                                <h5 style={{ margin: '0 0 10px 0', color: '#555' }}>Membros</h5>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                    {comissao.membros && Object.values(comissao.membros).length > 0 ? Object.values(comissao.membros).map(membro => (
                                        <div key={membro.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', padding: '5px 10px', borderRadius: '8px' }}>
                                            <img src={membro.foto} alt={membro.nome} style={{ width: '25px', height: '25px', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{membro.nome} ({membro.cargo})</span>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }} onClick={() => this.handleRemoveMember(comissao.id, membro.id)}><FaTimes size={12} /></button>
                                        </div>
                                    )) : (
                                        <p style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>Nenhum membro.</p>
                                    )}
                                    <button
                                        onClick={() => this.handleOpenAddMemberModal(comissao)}
                                        style={{
                                            width: '35px', height: '35px', borderRadius: '50%', border: '2px dashed #ccc',
                                            background: 'none', cursor: 'pointer', color: '#aaa', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <FaUserPlus />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
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
            case 'usuarios':
                return this.renderUserManagement();
            case 'comissoes':
                // This will call the full render method for commissions
                return this.renderComissoesManager();
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
                    <button className="btn-primary" onClick={this.handleSave} disabled={this.state.isSaving} style={{ height: '45px', alignSelf: 'center' }}>
                        {this.state.isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} {this.state.isSaving ? 'Salvando...' : 'Salvar'}
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
        const { activeTab, loading, users, showInviteModal, showComissaoModal, showAddMemberModal } = this.state;

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
                                    <FaCog className="icon-primary" /> Configurações Gerais
                                </h1>
                                <p className="dashboard-header-desc">Base de Conhecimento da IA.</p>
                            </div>
                        </div>

                        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                            {[
                                { id: 'regimento', label: 'Regimento Interno', icon: <FaBook /> },
                                { id: 'lei_organica', label: 'Lei Orgânica', icon: <FaGavel /> },
                                { id: 'materias', label: 'Matérias Antigas', icon: <FaHistory /> },
                                { id: 'atas', label: 'Atas e Sessões', icon: <FaFileAlt /> },
                                { id: 'usuarios', label: 'Gestão de Usuários', icon: <FaUserShield /> },
                                { id: 'comissoes', label: 'Gestão de Comissões', icon: <FaUsers /> },
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
                                        borderLeft: activeTab === item.id ? '4px solid #126B5E' : '4px solid transparent',
                                        height: '20px',
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

                {/* Modals placed outside dashboard-content to avoid overflow/z-index issues */}

                {/* Modal de Convite */}
                {showInviteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '400px' }}>
                            <div className="modal-header">
                                <h2 style={{ margin: 0 }}>Convidar Novo Membro</h2>
                                <button onClick={this.handleCloseInviteModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}><FaTimes /></button>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Tipo de Acesso</label>
                                <select className="modal-input" value={this.state.inviteType} onChange={(e) => this.setState({ inviteType: e.target.value })}>
                                    <option value="admin">Administrador</option>
                                    <option value="vereador">Vereador</option>
                                    <option value="presidente">Presidente</option>
                                    <option value="presidente_comissao">Presidente Comissão</option>
                                    <option value="relator">Relator</option>
                                    <option value="juridico">Jurídico</option>
                                    <option value="secretario">Secretário</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button onClick={this.handleCloseInviteModal} className="btn-secondary">Cancelar</button>
                                <button onClick={this.handleGenerateAndCopyInviteLink} className="btn-primary">Gerar e Copiar Link</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para Criar/Editar Comissão */}
                {showComissaoModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '500px' }}>
                            <div className="modal-header">
                                <h2 style={{ margin: 0 }}>{this.state.editingComissao ? 'Editar Comissão' : 'Criar Nova Comissão'}</h2>
                                <button onClick={this.handleCloseComissaoModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}><FaTimes /></button>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Tipo de Comissão</label>
                                <select name="tipo" value={this.state.comissaoFormData.tipo} onChange={this.handleComissaoFormChange} className="modal-input">
                                    <option value="Permanente">Permanente</option>
                                    <option value="Temporária">Temporária</option>
                                    <option value="De Representação">De Representação</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Nome da Comissão</label>
                                <input type="text" name="nome" value={this.state.comissaoFormData.nome} onChange={this.handleComissaoFormChange} className="modal-input" placeholder="Ex: Comissão de Educação e Cultura" />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Descrição</label>
                                <textarea rows="4" name="descricao" value={this.state.comissaoFormData.descricao} onChange={this.handleComissaoFormChange} className="modal-textarea" placeholder="Descreva brevemente a finalidade da comissão..."></textarea>
                            </div>
                            <div className="modal-footer">
                                <button onClick={this.handleCloseComissaoModal} className="btn-secondary">Cancelar</button>
                                <button onClick={this.handleSaveComissao} className="btn-primary">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para Adicionar Membros */}
                {showAddMemberModal && this.state.commissionToUpdateMembers && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '500px' }}>
                            <div className="modal-header">
                                <h2 style={{ margin: 0 }}>Adicionar Membro a "{this.state.commissionToUpdateMembers.nome}"</h2>
                                <button onClick={this.handleCloseAddMemberModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}><FaTimes /></button>
                            </div>
                            <div style={{padding: '20px 0'}}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Selecionar Membro</label>
                                    <select 
                                        className="modal-input"
                                        value={this.state.newUserForCommission}
                                        onChange={(e) => this.setState({ newUserForCommission: e.target.value })}
                                    >
                                        <option value="">-- Escolha um usuário --</option>
                                        {users.filter(u => u.tipo === 'vereador').map(user => {
                                            const isMember = this.state.commissionToUpdateMembers.membros && Object.values(this.state.commissionToUpdateMembers.membros).some(m => m.id === user.id);
                                            return <option key={user.id} value={user.id} disabled={isMember}>{user.nome} {isMember ? '(Já é membro)' : ''}</option>
                                        })}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Cargo na Comissão</label>
                                    <select 
                                        className="modal-input"
                                        value={this.state.newRoleForCommission}
                                        onChange={(e) => this.setState({ newRoleForCommission: e.target.value })}
                                    >
                                        <option value="Membro">Membro (Vogal)</option>
                                        <option value="Presidente">Presidente</option>
                                        <option value="Vice-Presidente">Vice-Presidente</option>
                                        <option value="Relator">Relator</option>
                                        <option value="Suplente">Suplente</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={this.handleCloseAddMemberModal} className="btn-secondary">Cancelar</button>
                                <button onClick={this.handleAddMemberToCommission} className="btn-primary">Adicionar Membro</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Configuracoes;