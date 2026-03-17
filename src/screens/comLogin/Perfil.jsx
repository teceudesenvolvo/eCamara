import React, { Component } from 'react';
import { FaUser, FaEdit, FaChartPie, FaSave, FaCamera, FaSpinner, FaSignOutAlt } from 'react-icons/fa';

import ProfileImage from '../../assets/vereador.jpg';
import MenuDashboard from '../../componets/menuAdmin.jsx';

import { auth, db } from '../../firebaseConfig';
import { ref, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { signOut } from 'firebase/auth';

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
            loading: true,

            editNome: '',
            editCargo: '',
            editBio: '',
            editFoto: '',

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
        auth.onAuthStateChanged(async (userAuth) => {

            if (!userAuth) {
                this.props.history.push(`/login/${this.props.match.params.camaraId}`);
                return;
            }

            try {

                const camaraId = this.props.match.params.camaraId;

                const userRef = ref(db, `${camaraId}/users/${userAuth.uid}`);

                const snapshot = await get(userRef);

                let userData = {
                    nome: userAuth.displayName,
                    email: userAuth.email
                };

                if (snapshot.exists()) {
                    userData = snapshot.val();
                }

                const materiasRef = ref(db, `${camaraId}/materias`);
                const q = query(materiasRef, orderByChild('userId'), equalTo(userAuth.uid));

                const materiasSnap = await get(q);

                let materias = [];

                if (materiasSnap.exists()) {
                    materiasSnap.forEach(item => {
                        materias.push({
                            id: item.key,
                            ...item.val()
                        });
                    });
                }

                const stats = this.calculateStats(materias);

                this.setState({
                    user: {
                        uid: userAuth.uid,
                        ...userData
                    },
                    editNome: userData.nome || '',
                    editCargo: userData.cargo || '',
                    editBio: userData.bio || '',
                    editFoto: userData.foto || '',
                    materias,
                    stats,
                    loading: false
                });

            } catch (error) {

                console.error("Erro ao carregar perfil:", error);

                this.setState({ loading: false });

            }

        });
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

        await signOut(auth);

        this.props.history.push(`/login/${this.props.match.params.camaraId}`);

    };

    handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({ editFoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    handleSaveProfile = async () => {
        const { user, editNome, editCargo, editBio, editFoto } = this.state;
        const camaraId = this.props.match.params.camaraId;

        if (!user) return;

        this.setState({ loading: true });

        try {
            const userRef = ref(db, `${camaraId}/users/${user.uid}`);
            await update(userRef, {
                nome: editNome,
                cargo: editCargo,
                bio: editBio,
                foto: editFoto
            });

            // Atualiza o objeto user no estado para refletir na UI imediatamente
            this.setState(prevState => ({
                user: {
                    ...prevState.user,
                    nome: editNome,
                    cargo: editCargo,
                    bio: editBio,
                    foto: editFoto
                },
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

        const { stats, materias } = this.state;

        const barChartData = {
            labels: Object.keys(stats.byType),
            datasets: [
                {
                    label: 'Quantidade',
                    data: Object.values(stats.byType),
                    backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#00BCD4'],
                    borderWidth: 1
                }
            ]
        };

        const pieChartData = {
            labels: ['Aprovadas', 'Em Tramitação', 'Arquivadas'],
            datasets: [
                {
                    data: [stats.aprovadas, stats.tramitacao, stats.arquivadas],
                    backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
                }
            ]
        };

        return (
            <>
                <div className='profile-data-cards-container'>
                    <div className='profile-section-header'>
                        <h3>Últimas Matérias</h3>
                    </div>

                    <div className='matters-list-container'>

                        {materias.length > 0 ?

                            materias.slice(0, 5).map(materia => (

                                <div className='matter-item' key={materia.id}>

                                    <div className='matter-title-date'>
                                        <p className='matter-type'>{materia.tipoMateria} - {materia.numero}</p>
                                        <p className='matter-description'>{materia.ementa}</p>
                                    </div>

                                    <div className='matter-status-button'>

                                        <span className='matter-date'>{materia.dataApresenta}</span>

                                        <button
                                            className='matter-view-button'
                                            onClick={() =>
                                                this.props.history.push(`/admin/materia-detalhes/${this.props.match.params.camaraId}`, { materiaId: materia.id })
                                            }
                                        >
                                            Ver
                                        </button>

                                    </div>

                                </div>

                            ))

                            :

                            <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                Nenhuma matéria cadastrada.
                            </p>

                        }

                    </div>

                    <div className='profile-data-card'>
                        <h3>Resumo da Atuação</h3>

                        <div className='progress-item'>
                            <p>Proposições Totais: <span>{stats.total}</span></p>

                            <div className='progress-bar-container'>
                                <div className='progress-bar-fill' style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className='progress-item'>
                            <p>Projetos Aprovados:
                                <span>
                                    {stats.aprovadas}
                                    ({stats.total > 0 ? ((stats.aprovadas / stats.total) * 100).toFixed(1) : 0}%)
                                </span>
                            </p>

                            <div className='progress-bar-container'>
                                <div
                                    className='progress-bar-fill'
                                    style={{
                                        width: `${stats.total > 0 ? (stats.aprovadas / stats.total) * 100 : 0}%`,
                                        backgroundColor: '#4CAF50'
                                    }}
                                ></div>
                            </div>

                        </div>

                    </div>

                    <div className='profile-data-card'>
                        <h3>Status das Matérias</h3>

                        <div style={{ height: '200px' }}>
                            <Pie data={pieChartData} />
                        </div>

                    </div>

                </div>

                <div className='profile-section-header'>
                    <h3>Produtividade por Tipo</h3>
                </div>

                <div className='charts-container'>
                    <div className='chart-card' style={{ flex: 1 }}>
                        <Bar data={barChartData} />
                    </div>
                </div>



            </>
        );

    };

    renderEditProfile = () => {

        const { editNome, editCargo, editBio, editFoto, loading } = this.state;

        return (

            <div className="dashboard-card" style={{ margin: '0 auto', width: '90%' }}>

                <div style={{ display: 'grid', gap: '20px' }}>

                    <div>

                        <label className="label-form">Foto de Perfil</label>

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

                        <label className="label-form">Nome Completo</label>

                        <input
                            type="text"
                            className="modal-input"
                            value={editNome}
                            onChange={(e) => this.setState({ editNome: e.target.value })}
                        />

                    </div>

                    <div>

                        <label className="label-form">Cargo</label>

                        <input
                            type="text"
                            className="modal-input"
                            value={editCargo}
                            onChange={(e) => this.setState({ editCargo: e.target.value })}
                        />

                    </div>

                    <div>

                        <label className="label-form">Biografia</label>

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



                    <div className='profile-header-card'>

                        <div className='profile-header-info'>

                            <img
                                className='profile-header-img'
                                src={user?.foto}
                                alt='Imagem de Perfil'
                                onError={(e) => e.target.src = ProfileImage}
                            />

                            <div>

                                <h2>{user?.nome}</h2>
                                <p>{user?.tipo}</p>

                            </div>

                        </div>

                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', width: '93%' }}>

                        <button onClick={() => this.setState({ activeTab: 'overview' })}>
                            <FaChartPie /> Visão Geral
                        </button>

                        <button onClick={() => this.setState({ activeTab: 'edit' })}>
                            <FaEdit /> Editar Perfil
                        </button>

                        <button
                            onClick={this.handleLogout}
                            style={{ marginLeft: 'auto', color: '#d32f2f' }}
                        >
                            <FaSignOutAlt /> Sair
                        </button>

                    </div>

                    {activeTab === 'overview'
                        ? this.renderOverview()
                        : this.renderEditProfile()
                    }

                </div>

            </div>

        );

    }

}

export default Perfil;