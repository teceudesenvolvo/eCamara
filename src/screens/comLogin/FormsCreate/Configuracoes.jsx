import React, { Component } from 'react';
import { FaCog, FaBook, FaHistory, FaFileAlt, FaSave, FaUpload, FaGavel, FaSpinner, FaUsers, FaUserShield, FaPlus, FaPencilAlt, FaTimes, FaUserPlus, FaPalette, FaImage, FaLock } from 'react-icons/fa';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import api from '../../../services/api.js';

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
            permissoes: {}, // Armazena a matriz de permissões
            // Layout Config
            layoutConfig: {
                logoLight: '',
                logoDark: '',
                corPrimaria: '#126B5E',
                corDestaque: '#FF740F'
            }
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            const camaraId = this.props.match.params.camaraId || user.camaraId;
            this.setState({ camaraId }, () => this.fetchConfig());
        }
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
        if (!camaraId) return;

        try {
            const [councilResponse, usersResponse, comissoesResponse] = await Promise.all([
                api.get(`/councils/${camaraId}`),
                api.get(`/users/council/${camaraId}`),
                api.get(`/commissions/${camaraId}`)
            ]);

            const councilData = councilResponse.data || {};
            const config = councilData.config || councilData.dadosConfig || {};
            
            const baseData = config['base-conhecimento'] || {};
            const layoutData = { ...this.state.layoutConfig, ...(config.layout || {}) };
            const permissoesData = config.permissoes || {};
            
            const usersList = usersResponse.data || [];
            const comissoesList = comissoesResponse.data || [];

            this.setState({
                regimentoText: baseData.regimentoText || '',
                regimentoFile: baseData.regimentoFile || null,
                leiOrganicaText: baseData.leiOrganicaText || '',
                leiOrganicaFile: baseData.leiOrganicaFile || null,
                materiasText: baseData.materiasText || '',
                materiasFile: baseData.materiasFile || null,
                atasText: baseData.atasText || '',
                atasFile: baseData.atasFile || null,
                users: usersList,
                comissoes: comissoesList,
                layoutConfig: layoutData,
                permissoes: permissoesData,
                loading: false
            });

        } catch (error) {
            console.error("Erro ao buscar configurações:", error);
            this.setState({ loading: false });
        }
    };

    handleSave = async () => {
        const { camaraId, regimentoText, regimentoFile, leiOrganicaText, leiOrganicaFile, materiasText, materiasFile, atasText, atasFile, layoutConfig, permissoes } = this.state;
        this.setState({ isSaving: true });

        try {
            // Fetch current config to merge
            const response = await api.get(`/councils/${camaraId}`);
            const currentConfig = response.data?.config || response.data?.dadosConfig || {};

            const updatedConfig = {
                ...currentConfig,
                "base-conhecimento": {
                    regimentoText, regimentoFile,
                    leiOrganicaText, leiOrganicaFile,
                    materiasText, materiasFile,
                    atasText, atasFile
                },
                layout: layoutConfig,
                permissoes: permissoes
            };

            await api.patch(`/councils/${camaraId}`, { config: updatedConfig });
            alert('Configurações atualizadas com sucesso! A IA agora utilizará estas informações para gerar documentos mais precisos.');
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alert('Erro ao salvar as configurações.');
        } finally {
            this.setState({ isSaving: false });
        }
    };

    // --- User and Commission Handlers (Moved from LayoutManager) ---

    handleUpdateUserType = async (userId, newType) => {
        try {
            await api.patch(`/users/${userId}`, { tipo: newType });
            this.fetchConfig();
        } catch (error) {
            console.error("Erro ao atualizar tipo de usuário:", error);
        }
    };

    handleUpdateUserCargo = async (userId, newCargo) => {
        try {
            await api.patch(`/users/${userId}`, { cargo: newCargo });
            this.fetchConfig();
        } catch (error) {
            console.error("Erro ao atualizar cargo do usuário:", error);
        }
    };

    togglePermission = (roleId, actionId, value) => {
        this.setState(prevState => ({
            permissoes: {
                ...prevState.permissoes,
                [roleId]: { ...(prevState.permissoes[roleId] || {}), [actionId]: value }
            }
        }));
    };

    handleGenerateAndCopyInviteLink = async () => {
        const { camaraId, inviteType } = this.state;

        try {
            const response = await api.post('/users/invite', {
                role: inviteType,
                camaraId
            });
            
            const inviteLink = `${window.location.origin}/register?invite=${response.data.id}&camara=${camaraId}`;
            
            await navigator.clipboard.writeText(inviteLink);
            alert(`Link de convite criado e copiado!\n\nEnvie este link para o novo usuário.`);
            
            this.handleCloseInviteModal();
            this.fetchConfig();
        } catch (error) {
            console.error("Erro ao gerar convite:", error);
            alert("Erro ao gerar convite.");
        }
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
                await api.patch(`/commissions/${editingComissao.id}`, comissaoFormData);
            } else {
                await api.post('/commissions', { ...comissaoFormData, camaraId });
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

        try {
            const currentMembers = commissionToUpdateMembers.membros || {};
            const updatedMembers = {
                ...currentMembers,
                [user.id]: { id: user.id, nome: user.nome, foto: user.foto || '', cargo: newRoleForCommission }
            };

            await api.patch(`/commissions/${commissionToUpdateMembers.id}`, { membros: updatedMembers });
            this.fetchConfig();
            this.handleCloseAddMemberModal();
        } catch (error) {
            console.error("Erro ao adicionar membro:", error);
            alert("Erro ao adicionar membro.");
        }
    };

    handleRemoveMember = async (comissaoId, memberId) => {
        try {
            const comissao = this.state.comissoes.find(c => c.id === comissaoId);
            if (!comissao) return;

            const updatedMembers = { ...comissao.membros };
            delete updatedMembers[memberId];

            await api.patch(`/commissions/${comissaoId}`, { membros: updatedMembers });
            this.fetchConfig();
        } catch (error) {
            console.error("Erro ao remover membro:", error);
        }
    };

    // --- File Upload Handlers ---

    handleBaseFileChange = (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            if (file.type === 'application/json') {
                try {
                    const jsonContent = JSON.parse(content);
                    this.setState({ [key + 'File']: jsonContent });
                } catch (error) {
                    alert('Erro ao processar arquivo JSON. Verifique a formatação.');
                }
            } else if (file.type === 'application/pdf') {
                // content is already base64 data URL
                this.setState({ [key + 'File']: content });
            } else {
                alert('Formato não suportado. Use JSON ou PDF.');
            }
        };

        if (file.type === 'application/json') {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    };

    handleLogoUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'image/png') {
            alert('Por favor, carregue apenas imagens PNG.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            this.setState(prevState => ({ layoutConfig: { ...prevState.layoutConfig, [type]: base64 } }));
        };
        reader.readAsDataURL(file);
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
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', padding: '10px 20px', background: '#f8f9fa', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span>Nome / Email</span>
                        <span>Tipo de Acesso</span>
                        <span>Cargo Institucional</span>
                        <span style={{ textAlign: 'right' }}>Ações</span>
                    </div>
                    {users && users.length > 0 ? users.map(user => (
                        <div key={user.id} className="matter-item" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', alignItems: 'center' }}>
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
                            <div>
                                <select
                                    className="modal-input"
                                    style={{ padding: '5px', fontSize: '0.85rem' }}
                                    value={user.cargo || ''}
                                    onChange={(e) => this.handleUpdateUserCargo(user.id, e.target.value)}
                                >
                                    <option value="">Selecione um Cargo...</option>
                                    <optgroup label="Agentes Políticos">
                                        <option value="Vereador">Vereador</option>
                                        <option value="Presidente">Presidente</option>
                                        <option value="Vice-Presidente">Vice-Presidente</option>
                                        <option value="1º Secretário">1º Secretário</option>
                                        <option value="2º Secretário">2º Secretário</option>
                                    </optgroup>
                                    <optgroup label="Apoio Legislativo">
                                        <option value="Chefe de Gabinete">Chefe de Gabinete</option>
                                        <option value="Assessor Parlamentar">Assessor Parlamentar</option>
                                        <option value="Assessor de Comunicação">Assessor de Comunicação</option>
                                    </optgroup>
                                    <optgroup label="Administrativos e Técnicos">
                                        <option value="Diretor Geral">Diretor Geral</option>
                                        <option value="Procurador Jurídico">Procurador Jurídico</option>
                                        <option value="Contador">Contador</option>
                                        <option value="Agente Legislativo">Agente Legislativo</option>
                                        <option value="Controlador Interno">Controlador Interno</option>
                                        <option value="Operador de Painel">Operador de Painel</option>
                                        <option value="Taquígrafo">Taquígrafo</option>
                                    </optgroup>
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

    renderPermissionsManager = () => {
        const { permissoes, isSaving } = this.state;

        const roles = [
            { id: 'admin', label: 'Admin' },
            { id: 'Presidente', label: 'Presidência' },
            { id: 'Vereador', label: 'Vereadores' },
            { id: 'Procurador Jurídico', label: 'Procuradoria' },
            { id: 'Secretário', label: 'Secretaria' },
            { id: 'Operador de Painel', label: 'Painelista' }
        ];

        const actions = [
            { id: 'create_materia', label: 'Protocolar Matérias' },
            { id: 'view_parecer', label: 'Emitir Parecer Jurídico' },
            { id: 'sign_despacho', label: 'Assinar Despachos' },
            { id: 'manage_sessions', label: 'Gerenciar Pautas' },
            { id: 'control_panel', label: 'Controlar Painel de Votos' },
            { id: 'admin_config', label: 'Configurações do Sistema' }
        ];

        return (
            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <h3 style={{ color: 'var(--primary-color, #126B5E)', margin: 0 }}>Matriz de Permissões</h3>
                    <button className="btn-primary" onClick={this.handleSave} disabled={isSaving}>
                        {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} Salvar Alterações
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Módulo / Funcionalidade</th>
                                {roles.map(role => (
                                    <th key={role.id} style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>{role.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {actions.map(action => (
                                <tr key={action.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontWeight: '600', color: '#555' }}>{action.label}</td>
                                    {roles.map(role => (
                                        <td key={`${role.id}-${action.id}`} style={{ padding: '12px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={role.id === 'admin' ? true : (permissoes[role.id]?.[action.id] || false)}
                                                disabled={role.id === 'admin'}
                                                onChange={(e) => this.togglePermission(role.id, action.id, e.target.checked)}
                                                style={{ width: '18px', height: '18px', cursor: role.id === 'admin' ? 'default' : 'pointer' }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '20px', padding: '15px', background: '#e0f2f1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaLock color="#126B5E" />
                    <p style={{ margin: 0, color: '#004d40', fontSize: '0.8rem' }}>
                        <strong>Dica de Segurança:</strong> As alterações de permissão entram em vigor no próximo login do usuário. Cargos de tipo 'Admin' possuem acesso irrestrito por padrão.
                    </p>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h4 style={{ margin: 0, color: '#333' }}>{comissao.nome}</h4>
                                        <span className="tag tag-neutral" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>{comissao.tipo || 'Não definido'}</span>
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

    renderLayoutManager = () => {
        const { layoutConfig, isSaving } = this.state;
        return (
            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <h3 style={{ color: 'var(--primary-color, #126B5E)', margin: '0' }}>Identidade Visual</h3>
                    <button className="btn-primary" onClick={this.handleSave} disabled={isSaving} style={{ height: '45px' }}>
                        {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
                        <h4 style={{ color: '#333' }}>Logo (Fundo Claro)</h4>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Usada em cabeçalhos e fundos brancos. Formato PNG.</p>

                        <div style={{ margin: '20px 0', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px dashed #ccc' }}>
                            {layoutConfig.logoLight ? <img src={layoutConfig.logoLight} alt="Logo Light" style={{ maxHeight: '80px' }} /> : <FaImage size={30} color="#ccc" />}
                        </div>

                        <input type="file" accept="image/png" id="logoLight" style={{ display: 'none' }} onChange={(e) => this.handleLogoUpload(e, 'logoLight')} />
                        <label htmlFor="logoLight" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}><FaUpload /> Carregar Logo</label>
                    </div>

                    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center', background: '#333' }}>
                        <h4 style={{ color: '#fff' }}>Logo (Fundo Escuro)</h4>
                        <p style={{ fontSize: '0.8rem', color: '#ccc' }}>Usada em menus laterais e fundos escuros. Formato PNG.</p>

                        <div style={{ margin: '20px 0', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #666' }}>
                            {layoutConfig.logoDark ? <img src={layoutConfig.logoDark} alt="Logo Dark" style={{ maxHeight: '80px' }} /> : <FaImage size={30} color="#666" />}
                        </div>

                        <input type="file" accept="image/png" id="logoDark" style={{ display: 'none' }} onChange={(e) => this.handleLogoUpload(e, 'logoDark')} />
                        <label htmlFor="logoDark" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block', background: '#555', color: '#fff', border: 'none' }}><FaUpload /> Carregar Logo</label>
                    </div>
                </div>
            </div>
        );
    };

    renderContent = () => {
        const { activeTab, regimentoText, leiOrganicaText, materiasText, atasText, regimentoFile, leiOrganicaFile, materiasFile, atasFile } = this.state;

        let title, description, value, onChangeKey;

        switch (activeTab) {
            case 'regimento':
                title = 'Regimento Interno';
                description = 'Cole aqui o texto completo do Regimento Interno da Câmara. A IA usará isso para validar ritos, prazos e competências.';
                value = regimentoText;
                onChangeKey = 'regimentoText';
                // fileKey = 'regimento';
                break;
            case 'lei_organica':
                title = 'Lei Orgânica';
                description = 'Cole o texto da Lei Orgânica do Município. Fundamental para análise de constitucionalidade e competência municipal.';
                value = leiOrganicaText;
                onChangeKey = 'leiOrganicaText';
                // fileKey = 'leiOrganica';
                break;
            case 'materias':
                title = 'Histórico de Matérias';
                description = 'Insira resumos ou textos de matérias antigas para que a IA verifique duplicidades e mantenha a coerência legislativa.';
                value = materiasText;
                onChangeKey = 'materiasText';
                // fileKey = 'materias';
                break;
            case 'atas':
                title = 'Atas e Sessões';
                description = 'Base de conhecimento sobre decisões tomadas em sessões anteriores e jurisprudência da casa.';
                value = atasText;
                onChangeKey = 'atasText';
                // fileKey = 'atas';
                break;
            case 'usuarios':
                return this.renderUserManagement();
            case 'comissoes':
                // This will call the full render method for commissions
                return this.renderComissoesManager();
                break;
            case 'layout':
                return this.renderLayoutManager();
            case 'permissoes':
                return this.renderPermissionsManager();
            default:
                return null;
        }

        const fileKey = activeTab === 'regimento' ? 'regimento' : activeTab === 'lei_organica' ? 'leiOrganica' : activeTab === 'materias' ? 'materias' : 'atas';
        const fileValue = this.state[`${fileKey}File`];

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
                    <div style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888', cursor: 'pointer', backgroundColor: '#fcfcfc', transition: 'all 0.2s', position: 'relative' }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#126B5E'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}>

                        <input type="file" accept=".json,.pdf" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={(e) => this.handleBaseFileChange(e, fileKey)} />

                        <FaUpload size={30} style={{ marginBottom: '10px', color: '#126B5E' }} />
                        <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{fileValue ? 'Arquivo carregado (Pronto para salvar)' : 'Arraste arquivos aqui ou clique para selecionar'}</p>
                        <p style={{ fontSize: '0.8rem', margin: '8px 0 0 0' }}>
                            {fileValue ? (typeof fileValue === 'string' ? '(PDF Base64 Carregado)' : '(Objeto JSON Carregado)') : '(JSON ou PDF)'}
                        </p>
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
                <div className="dashboard-content">
                    <div className="dashboard-header" style={{ marginBottom: '30px' }}>
                        <div>
                            <h1 className="dashboard-header-title" style={{ fontSize: '1.5rem' }}>
                                <FaCog style={{ color: 'var(--primary-color)' }} /> Configurações Gerais
                            </h1>
                            <p className="dashboard-header-desc">Base de Conhecimento, Usuários e Parâmetros do Sistema.</p>
                        </div>
                    </div>

                    {/* --- Navegação por Abas Superior --- */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '30px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                        {[
                            { id: 'regimento', label: 'Regimento', icon: <FaBook /> },
                            { id: 'lei_organica', label: 'Lei Orgânica', icon: <FaGavel /> },
                            { id: 'materias', label: 'Matérias Antigas', icon: <FaHistory /> },
                            { id: 'atas', label: 'Atas e Sessões', icon: <FaFileAlt /> },
                            { id: 'usuarios', label: 'Usuários', icon: <FaUserShield /> },
                            { id: 'comissoes', label: 'Comissões', icon: <FaUsers /> },
                            { id: 'layout', label: 'Identidade Visual', icon: <FaPalette /> },
                            { id: 'permissoes', label: 'Níveis de Acesso', icon: <FaLock /> },
                        ].map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => this.setState({ activeTab: item.id })}
                                style={{
                                    padding: '12px 20px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: activeTab === item.id ? '700' : '500',
                                    color: activeTab === item.id ? '#126B5E' : '#888',
                                    borderBottom: activeTab === item.id ? '3px solid #126B5E' : '3px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
                                }}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ animation: 'fadeIn 0.5s' }}>
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
                            <div style={{ padding: '20px 0' }}>
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