import React, { Component } from 'react';
import { FaUser, FaEdit, FaChartPie, FaSave, FaCamera, FaSpinner, FaSignOutAlt } from 'react-icons/fa';

// Imagens
import ProfileImage from '../../assets/vereador.jpg'; // Imagem do perfil do vereador
import MenuDashboard from '../../componets/menuAdmin.jsx'; // Certifique-se de que este caminho está correto
import { auth, db } from '../../firebaseConfig';
import { ref, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { signOut } from 'firebase/auth';

// Importações para os gráficos
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrar os componentes do Chart.js necessários
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement // Necessário para gráficos de pizza
);

class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'overview',
            user: null,
            materias: [],
            loading: true,
            camaraId: null,
            
            // Edit Form State
            editNome: '',
            editEmail: '',
            editCargo: '',
            editBio: '',
            editFoto: '',
            
            // Stats
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
        this.unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                this.fetchUserData(user);
            } else {
                this.props.history.push('/login');
            }
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    fetchUserData = async (authUser) => {
        try {
            // 1. Descobrir a câmara do usuário
            const userIndexRef = ref(db, `users_index/${authUser.uid}`);
            const indexSnapshot = await get(userIndexRef);
            
            let camaraId = 'camara-teste';
            if (indexSnapshot.exists()) {
                camaraId = indexSnapshot.val().camaraId;
            }

            // 2. Buscar dados do usuário
            const userRef = ref(db, `${camaraId}/users/${authUser.uid}`);
            const userSnapshot = await get(userRef);
            
            const userData = userSnapshot.exists() ? userSnapshot.val() : { nome: authUser.displayName, email: authUser.email };

            // 3. Buscar matérias do usuário
            const materiasRef = ref(db, `${camaraId}/materias`);
            const q = query(materiasRef, orderByChild('userId'), equalTo(authUser.uid));
            const materiasSnapshot = await get(q);
            
            const materias = [];
            if (materiasSnapshot.exists()) {
                materiasSnapshot.forEach(child => {
                    materias.push({ id: child.key, ...child.val() });
                });
            }

            // 4. Calcular Estatísticas
            const stats = this.calculateStats(materias);

            this.setState({
                user: { uid: authUser.uid, camaraId, ...userData },
                materias: materias.reverse(), // Mais recentes primeiro
                stats,
                camaraId,
                loading: false,
                // Pre-fill edit form
                editNome: userData.nome || '',
                editEmail: userData.email || authUser.email,
                editCargo: userData.cargo || 'Parlamentar', // Default se vazio
                editBio: userData.bio || '',
                editFoto: userData.foto || ''
            });

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            this.setState({ loading: false });
        }
    };

    calculateStats = (materias) => {
        const stats = {
            total: materias.length,
            aprovadas: 0,
            tramitacao: 0,
            arquivadas: 0,
            byType: {}
        };

        materias.forEach(m => {
            // Contagem por Status
            const status = (m.status || '').toLowerCase();
            if (status.includes('aprovado') || status.includes('sancionado') || status.includes('promulgado')) {
                stats.aprovadas++;
            } else if (status.includes('arquivado') || status.includes('rejeitado')) {
                stats.arquivadas++;
            } else {
                stats.tramitacao++;
            }

            // Contagem por Tipo
            const tipo = m.tipoMateria || 'Outros';
            stats.byType[tipo] = (stats.byType[tipo] || 0) + 1;
        });

        return stats;
    };

    renderOverview = () => {
        const { stats, materias, user } = this.state;
        
        // Dados para o gráfico de barras (similar ao da imagem de perfil)
        const barChartData = {
            labels: Object.keys(stats.byType),
            datasets: [
                {
                    label: 'Quantidade',
                    data: Object.values(stats.byType), 
                    backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#00BCD4'], 
                    borderColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#00BCD4'],
                    borderWidth: 1,
                },
            ],
        };

        const barChartOptions = {
            indexAxis: 'y', // Gráfico de barras horizontal
            responsive: true,
            height: 50,
            plugins: {
                legend: {
                    display: false, // Não mostrar a legenda se for um único dataset
                },
                title: {
                    display: false,
                    text: 'Produtividade por Tipo de Matéria',
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        };

        // Dados para o gráfico de pizza (similar ao da imagem de perfil)
        const pieChartData = {
            labels: ['Aprovadas', 'Em Tramitação', 'Arquivadas'],
            datasets: [
                {
                    data: [stats.aprovadas, stats.tramitacao, stats.arquivadas],
                    backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
                    borderColor: ['#fff', '#fff', '#fff'],
                    borderWidth: 2,
                },
            ],
        };

        const pieChartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right', // Legenda à direita
                    labels: {
                        boxWidth: 20,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + '%'; // Exibe como porcentagem
                            }
                            return label;
                        }
                    }
                }
            },
        };

        return (
            <>
                {/* Seções de Legislatura e Exercício Atual */}
                <div className='profile-data-cards-container'>
                    <div className='profile-data-card'>
                        <h3>Resumo da Atuação</h3>
                        <div className='progress-item'>
                            <p>Proposições Totais: <span>{stats.total}</span></p>
                            <div className='progress-bar-container'>
                                <div className='progress-bar-fill' style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className='progress-item'>
                            <p>Projetos Aprovados: <span>{stats.aprovadas} ({stats.total > 0 ? ((stats.aprovadas / stats.total) * 100).toFixed(1) : 0}%)</span></p>
                            <div className='progress-bar-container'>
                                <div className='progress-bar-fill' style={{ width: `${stats.total > 0 ? (stats.aprovadas / stats.total) * 100 : 0}%`, backgroundColor: '#4CAF50' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className='profile-data-card'>
                        <h3>Status das Matérias</h3>
                        <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                            <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                    </div>
                </div>

                {/* Seção de Gráficos Detalhados */}
                <div className='profile-section-header'>
                    <h3>Produtividade por Tipo</h3>
                </div>
                <div className='charts-container'>
                    <div className='chart-card' style={{ flex: 1 }}>
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Seção de Matérias Recentes */}
                <div className='profile-section-header'>
                    <h3>Últimas Matérias</h3>
                </div>
                <div className='matters-list-container'>
                    {materias.length > 0 ? materias.slice(0, 5).map(materia => (
                        <div className='matter-item' key={materia.id}>
                            <div className='matter-title-date'>
                                <p className='matter-type'>{materia.tipoMateria} - {materia.numero}</p>
                                <p className='matter-description'>{materia.ementa}</p>
                            </div>
                            <div className='matter-status-button'>
                                <span className='matter-date'>{materia.dataApresenta}</span>
                                <button className='matter-view-button' onClick={() => this.props.history.push('/materia-detalhes', { materiaId: materia.id })}>Ver</button>
                            </div>
                        </div>
                    )) : <p style={{padding: '20px', textAlign: 'center', color: '#666'}}>Nenhuma matéria cadastrada.</p>}
                </div>
            </>
        );
    };

    renderEditProfile = () => {
        const { editNome, editCargo, editBio, editFoto, loading } = this.state;
        
        return (
            <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    <div>
                        <label className="label-form" style={{display: 'block', marginBottom: '8px'}}>Foto de Perfil (URL)</label>
                        <input 
                            type="text" 
                            className="modal-input" 
                            value={editFoto} 
                            onChange={(e) => this.setState({ editFoto: e.target.value })} 
                            placeholder="https://exemplo.com/foto.jpg"
                        />
                        {editFoto && <img src={editFoto} alt="Preview" style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px'}} />}
                    </div>
                    <div>
                        <label className="label-form" style={{display: 'block', marginBottom: '8px'}}>Nome Completo</label>
                        <input 
                            type="text" 
                            className="modal-input" 
                            value={editNome} 
                            onChange={(e) => this.setState({ editNome: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="label-form" style={{display: 'block', marginBottom: '8px'}}>Cargo / Função</label>
                        <input 
                            type="text" 
                            className="modal-input" 
                            value={editCargo} 
                            onChange={(e) => this.setState({ editCargo: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="label-form" style={{display: 'block', marginBottom: '8px'}}>Biografia Resumida</label>
                        <textarea 
                            rows="4"
                            className="modal-textarea" 
                            value={editBio} 
                            onChange={(e) => this.setState({ editBio: e.target.value })} 
                            placeholder="Fale um pouco sobre sua trajetória..."
                        ></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button className="btn-primary" onClick={this.handleUpdateProfile} disabled={loading}>
                            <FaSave /> Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    handleUpdateProfile = async () => {
        const { camaraId, user, editNome, editCargo, editBio, editFoto } = this.state;
        const userRef = ref(db, `${camaraId}/users/${user.uid}`);
        
        try {
            await update(userRef, {
                nome: editNome,
                cargo: editCargo,
                bio: editBio,
                foto: editFoto
            });
            alert('Perfil atualizado com sucesso!');
            this.fetchUserData(user); // Recarrega os dados
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao atualizar perfil.");
        }
    };

    handleLogout = async () => {
        await signOut(auth);
        this.props.history.push('/login');
    };

    render() {
        const { user, loading, activeTab } = this.state;

        if (loading) {
            return <div className='App-header' style={{justifyContent: 'center'}}><FaSpinner className="animate-spin" size={40} color="#126B5E" /></div>;
        }

        return (
            <div className='profile-page-wrapper'> {/* Contêiner principal para a página */}
                <MenuDashboard /> {/* Barra lateral de navegação */}

                <div className='profile-main-content'> {/* Conteúdo principal da página */}
                    
                    {/* Abas de Navegação */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', width: '93%' }}>
                        <button 
                            onClick={() => this.setState({ activeTab: 'overview' })}
                            style={{ 
                                padding: '15px 25px', 
                                background: 'none', 
                                border: 'none', 
                                borderBottom: activeTab === 'overview' ? '3px solid #126B5E' : '3px solid transparent',
                                color: activeTab === 'overview' ? '#126B5E' : '#666',
                                fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '1rem'
                            }}
                        >
                            <FaChartPie /> Visão Geral
                        </button>
                        <button 
                            onClick={() => this.setState({ activeTab: 'edit' })}
                            style={{ 
                                padding: '15px 25px', 
                                background: 'none', 
                                border: 'none', 
                                borderBottom: activeTab === 'edit' ? '3px solid #126B5E' : '3px solid transparent',
                                color: activeTab === 'edit' ? '#126B5E' : '#666',
                                fontWeight: activeTab === 'edit' ? 'bold' : 'normal',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '1rem'
                            }}
                        >
                            <FaEdit /> Editar Perfil
                        </button>
                        <button 
                            onClick={this.handleLogout}
                            style={{ 
                                padding: '15px 25px', 
                                background: 'none', 
                                border: 'none', 
                                marginLeft: 'auto',
                                color: '#d32f2f',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <FaSignOutAlt /> Sair
                        </button>
                    </div>

                    {/* Header do Perfil com Imagem e Nome */}
                    <div className='profile-header-card'>
                        <div className='profile-header-info'>
                            <img className='profile-header-img' src={user.foto || ProfileImage} alt='Imagem de Perfil' onError={(e) => e.target.src = ProfileImage} />
                            <div className='profile-header-text'>
                                <h2 className='profile-header-name'>{user.nome}</h2> {/* Nome do vereador */}
                                <p className='profile-header-details'>{user.cargo || user.tipo}</p> {/* Cargo/Detalhes */}
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Dinâmico Baseado na Aba */}
                    {activeTab === 'overview' ? this.renderOverview() : this.renderEditProfile()}
                </div>
            </div>
        );
    }
}

export default Perfil;