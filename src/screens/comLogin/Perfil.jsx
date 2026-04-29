import React, { Component } from 'react';
import { FaUsers, FaUser, FaCalendarAlt, FaEdit, FaChartPie, FaSave, FaCamera, FaSpinner, FaSignOutAlt, FaTrophy, FaBriefcase, FaFileSignature, FaEnvelope, FaFolder, FaStickyNote, FaApple, FaFilePdf, FaFileAlt, FaFileWord } from 'react-icons/fa';

import ProfileImage from '../../assets/vereador.jpg'; // Imagem padrão para perfil
import MenuDashboard from '../../componets/menuAdmin.jsx';

import api from '../../services/api.js';

import { Bar, Pie } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

class Perfil extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'overview',
            user: null,
            materias: [],
            comissoesUsuario: [],
            sessoesParticipadas: [],
            loading: true,

            editNome: '',
            editCargo: '',
            editBio: '',
            editFoto: '',
            avatarFile: null,

            stats: {
                total: 0,
                aprovadas: 0,
                tramitacao: 0,
                arquivadas: 0,
                byType: {}
            }
        };
    }

    componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const userAuth = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!token || !userAuth.id) {
            this.props.history.push(`/login/${this.props.match.params.camaraId}`);
            return;
        }

        this.fetchProfileData(userAuth.id);
    }

    fetchProfileData = async (userId) => {
        try {
            const camaraId = this.props.match.params.camaraId;

            // Busca os dados do usuário, matérias, comissões e sessões via API
            const [userResponse, materiasResponse, comissoesResponse, sessoesResponse] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/legislative-matters/${camaraId}`),
                api.get(`/commissions/${camaraId}`),
                api.get(`/sessions/${camaraId}`)
            ]);

            // Extração robusta de dados lidando com diferentes padrões de API
            const userData = Array.isArray(userResponse.data) ? userResponse.data[0] : (userResponse.data || {});
            
            const rawMaterias = materiasResponse.data;
            const allMaterias = (Array.isArray(rawMaterias) ? rawMaterias : (rawMaterias?.matters || rawMaterias?.materias || Object.values(rawMaterias || {})))
                .filter(m => m).map(m => ({ ...m, id: m.id || m._id }));

            const rawComissoes = comissoesResponse.data;
            const allComissoes = (Array.isArray(rawComissoes) ? rawComissoes : (rawComissoes?.commissions || rawComissoes?.comissoes || Object.values(rawComissoes || {})))
                .filter(c => c).map(c => ({ ...c, id: c.id || c._id }));

            const rawSessoes = sessoesResponse.data;
            const allSessoes = (Array.isArray(rawSessoes) ? rawSessoes : (rawSessoes?.sessions || rawSessoes?.sessoes || Object.values(rawSessoes || {})))
                .filter(s => s).map(s => ({ ...s, id: s.id || s._id }));

            // Processa Matérias do Usuário
            let materias = allMaterias.filter(m => (m.userId || m.authorId) === userId);
            materias.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // Processa Comissões (onde o usuário é membro)
            let comissoesUsuario = allComissoes.filter(com => {
                if (com.membros) {
                    const membrosList = Array.isArray(com.membros) ? com.membros : Object.values(com.membros);
                    return membrosList.some(m => (m.id || m.uid) === userId);
                }
                return false;
            });

            // Processa Sessões (onde o usuário registrou presença)
            let sessoesParticipadas = allSessoes.filter(sessao => {
                if (sessao.presenca) {
                    return Object.keys(sessao.presenca).includes(userId);
                }
                return false;
            });

            // Helper para data (DD/MM/YYYY ou ISO)
            const parseDate = (d) => {
                if (!d) return new Date(0);
                if (typeof d === 'string' && d.includes('/')) {
                    const [day, month, year] = d.split('/');
                    return new Date(year, month - 1, day);
                }
                return new Date(d);
            };

            sessoesParticipadas.sort((a, b) => {
                return parseDate(b.data) - parseDate(a.data);
            });

            const stats = this.calculateStats(materias);

            this.setState({
                user: userData,
                editNome: userData.name || userData.nome || '',
                editCargo: userData.role || userData.cargo || '',
                editBio: userData.bio || '',
                editFoto: userData.foto,
                materias,
                comissoesUsuario,
                sessoesParticipadas,
                stats,
                loading: false
            });

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            this.setState({ loading: false });
        }
    }

    calculateStats = (materias) => {

        const stats = {
            total: materias.length,
            aprovadas: 0,
            tramitacao: 0,
            arquivadas: 0,
            byType: {}
        };

        materias.forEach(m => {

            const status = (m.status || '').toLowerCase();

            if (status.includes('aprovado') || status.includes('sancionado') || status.includes('promulgado')) {
                stats.aprovadas++;
            } else if (status.includes('arquivado') || status.includes('rejeitado')) {
                stats.arquivadas++;
            } else {
                stats.tramitacao++;
            }

            const tipo = m.tipoMateria || 'Outros';

            stats.byType[tipo] = (stats.byType[tipo] || 0) + 1;

        });

        return stats;

    };

    handleLogout = async () => {
        localStorage.removeItem('@CamaraAI:token');
        localStorage.removeItem('@CamaraAI:user');
        this.props.history.push(`/login/${this.props.match.params.camaraId}`);
    };

    handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Armazena o arquivo real e cria uma URL de preview local (sem Base64 permanente)
            this.setState({
                avatarFile: file,
                editFoto: URL.createObjectURL(file) // Preview temporário
            });
        }
    };
    handleSaveProfile = async () => {
        const { user, editNome, editBio, avatarFile } = this.state;
        const camaraId = this.props.match.params.camaraId;

        if (!user) return;

        this.setState({ loading: true });

        try {
            const formData = new FormData();
            formData.append('name', editNome);
            formData.append('bio', editBio);

            if (avatarFile) {
                // O backend (Multer) espera a chave 'avatar' no multipart/form-data.
                // Mantemos 'avatar' aqui para compatibilidade com a rota PATCH /users/:id,
                // mesmo que o campo final no banco de dados seja salvo como 'foto'.
                formData.append('avatar', avatarFile, avatarFile.name);
            }

            const response = await api.patch(`/users/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedFoto = response.data?.foto || this.state.editFoto;

            this.setState(prevState => ({
                user: {
                    ...prevState.user,
                    name: editNome,
                    bio: editBio,
                    foto: updatedFoto
                },
                editFoto: updatedFoto,
                avatarFile: null,
                loading: false
            }));

            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao salvar alterações.");
            this.setState({ loading: false });
        }
    };
    renderOverview = () => {
        const { materias, comissoesUsuario, sessoesParticipadas } = this.state;
        
        return (
            <>
                    {/* Cartão de Matérias (Antigo Mail) */}
                    <div className='profile-widget-card' style={{ gridColumn: 'span 2', width: '90%', marginLeft: '10%' }}>
                        <div className='widget-header'>
                            <div className='widget-icon-wrapper' style={{ backgroundColor: '#fff3e0', color: '#FF740F' }}>
                                <FaFileAlt />
                            </div>
                            <h3 className='widget-title'>Proposições</h3>
                        </div>
                        <p className='widget-summary'>Recentes • {materias.length} matérias protocoladas</p>
                        <ul className='widget-list'>
                            {materias.slice(0, 3).map(m => (
                                <li key={m.id} className='widget-list-item' onClick={() => this.props.history.push(`/admin/materia-detalhes/${this.props.match.params.camaraId}?materiaId=${m.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className='item-details'>
                                        <p className='item-title'>{m.tipoMateria} {m.numero}</p>
                                        <p className='item-subtitle' style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.ementa || m.titulo}</p>
                                    </div>
                                    <span className='item-date'>{m.dataApresenta}</span>
                                </li>
                            ))}
                            {materias.length === 0 && <p style={{ color: '#86868b', fontSize: '0.9rem' }}>Nenhuma matéria protocolada.</p>}
                        </ul>
                    </div>

                    {/* Cartão de Comissões (Antigo Drive) */}
                    <div className='profile-widget-card' style={{ gridColumn: 'span 2', width: '90%', marginLeft: '10%' }}>
                        <div className='widget-header'>
                            <div className='widget-icon-wrapper' style={{ backgroundColor: '#e3f2fd', color: '#2196F3' }}>
                                <FaUsers />
                            </div>
                            <h3 className='widget-title'>Comissões</h3>
                        </div>
                        <p className='widget-summary'>Membro em {comissoesUsuario.length} comissões</p>
                        <ul className='widget-list'>
                            {comissoesUsuario.slice(0, 3).map(c => (
                                <li key={c.id} className='widget-list-item'>
                                    <div className='item-icon' style={{ color: '#126B5E' }}>
                                        <FaFolder />
                                    </div>
                                    <div className='item-details'>
                                        <p className='item-title'>{c.nome}</p>
                                        <p className='item-subtitle'>Membro Ativo</p>
                                    </div>
                                </li>
                            ))}
                            {comissoesUsuario.length === 0 && <p style={{ color: '#86868b', fontSize: '0.9rem' }}>Não vinculado a comissões.</p>}
                        </ul>
                    </div>

                    {/* Cartão de Sessões (Antigo Notas) */}
                    <div className='profile-widget-card' style={{ gridColumn: 'span 3' }}>
                        <div className='widget-header'>
                            <div className='widget-icon-wrapper' style={{ backgroundColor: '#fffde7', color: '#FFD700' }}>
                                <FaCalendarAlt />
                            </div>
                            <h3 className='widget-title'>Sessões</h3>
                        </div>
                        <ul className='widget-list'>
                            {sessoesParticipadas.slice(0, 4).map(s => (
                                <li key={s.id} className='widget-list-item'>
                                    <div className='item-details'>
                                        <p className='item-title' style={{ fontSize: '0.85rem' }}>{(s.tipo || 'Sessão').split('da')[0]}</p>
                                    </div>
                                    <span className='item-date' style={{ fontSize: '0.75rem' }}>{s.data}</span>
                                </li>
                            ))}
                            {sessoesParticipadas.length === 0 && <p style={{ color: '#86868b', fontSize: '0.9rem' }}>Sem histórico de presença.</p>}
                        </ul>
                    </div>
            </>
        );
    };
    renderEditProfile = () => {
        const { editNome, editCargo, editBio, editFoto, loading } = this.state;
        return (
            <div className="dashboard-card" style={{ gridColumn: 'span 2', width: '90%', marginLeft: '10%', height: '95%' }}>
                <div style={{ display: 'grid', gap: '30px' }}>
                    <div>
                        <label className="label-form" style={{ fontWeight: 700, marginBottom: '15px', display: 'block' }}>Foto de Perfil</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                <img
                                    src={editFoto || ProfileImage}
                                    alt="Preview"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid #ddd'
                                    }}
                                />
                                <label htmlFor="profile-upload" style={{
                                    position: 'absolute', bottom: '0', right: '0',
                                    background: '#126B5E', color: 'white', borderRadius: '50%',
                                    width: '30px', height: '30px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}>
                                    <FaCamera size={14} />
                                </label>
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={this.handleImageChange}
                                />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>Clique na câmera para alterar a foto.</span>
                        </div>
                    </div>

                    <div>

                        <label className="label-form" style={{ fontWeight: 700 }}>Nome Completo</label>

                        <input
                            type="text"
                            className="modal-input"
                            value={editNome}
                            onChange={(e) => this.setState({ editNome: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label-form" style={{ fontWeight: 700 }}>Biografia</label>

                        <textarea
                            rows="4"
                            className="modal-textarea"
                            value={editBio}
                            onChange={(e) => this.setState({ editBio: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                        <button className="btn-primary" disabled={loading} onClick={this.handleSaveProfile}>
                            <FaSave /> Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    render() {
        const { loading, user, activeTab } = this.state;
        if (loading) {
            return (
                <div className='App-header' style={{ justifyContent: 'center' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }
        return (
            <div className='profile-page-wrapper'>
                <MenuDashboard />
                <div className='profile-main-content'>
                    {/* Grid principal para os widgets */}
                    <div className='profile-grid-widgets' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        
                        {/* Cartão de Perfil (Esquerda Superior) - Agora contém a navegação */}
                        <div className='profile-widget-card' style={{ gridColumn: 'span 1', gridRow: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                            <div style={{ position: 'relative', marginBottom: '25px' }}>
                                <img
                                    className='profile-header-img'
                                    src={user?.foto || ProfileImage}
                                    alt='Imagem de Perfil'
                                    onError={(e) => e.target.src = ProfileImage}
                                    style={{ width: '150px', height: '150px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                                />
                                <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#00ff2a', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: '2px solid #fff' }}>
                                    <FaUser />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 5px 0', color: '#1d1d1f' }}>{user?.name || user?.nome || 'Usuário'}</h2>
                            <p style={{ fontSize: '0.95rem', color: '#86868b', margin: '0 0 15px 0' }}>{user?.email || 'email@example.com'}</p>
                            <span style={{ background: '#e0e0e0', color: '#555', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '30px' }}>{user?.role || user?.tipo || 'Cargo não informado'}</span>

                            {/* Navegação entre abas integrada ao card */}
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '10px', 
                                width: '100%',
                                marginTop: 'auto'
                            }}>
                                <button 
                                    onClick={() => this.setState({ activeTab: 'overview' })}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '14px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: activeTab === 'overview' ? '#126B5E' : 'rgba(0,0,0,0.03)',
                                        color: activeTab === 'overview' ? '#fff' : '#86868b',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaChartPie /> Visão Geral
                                </button>

                                <button 
                                    onClick={() => this.setState({ activeTab: 'edit' })}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '14px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: activeTab === 'edit' ? '#126B5E' : 'rgba(0,0,0,0.03)',
                                        color: activeTab === 'edit' ? '#fff' : '#86868b',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaEdit /> Editar Perfil
                                </button>

                                <button
                                    onClick={this.handleLogout}
                                    style={{ 
                                        marginTop: '10px',
                                        padding: '12px 20px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#d32f2f',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <FaSignOutAlt /> Sair
                                </button>
                            </div>
                        </div>

                        {activeTab === 'overview'
                            ? this.renderOverview()
                            : this.renderEditProfile()
                        }
                    </div>
                </div>
            </div>
        );
    }
}
export default Perfil;