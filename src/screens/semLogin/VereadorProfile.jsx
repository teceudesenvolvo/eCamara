import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaUsers, FaGavel, FaSpinner, FaArrowLeft, FaInfoCircle, FaHome, FaVenusMars, FaHeart } from 'react-icons/fa';
import PageHeader from '../../componets/PageHeader.jsx';
import api from '../../services/api.js';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

class VereadorProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vereador: null,
            materias: [],
            comissoes: [],
            loading: true,
            camaraId: this.props.match.params.camaraId,
            vereadorId: this.props.match.params.vereadorId
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        const { camaraId, vereadorId } = this.state;
        
        try {
            // Fetch data from multiple endpoints via the new API
            const [userResponse, mattersResponse, comissoesResponse] = await Promise.all([
                api.get(`/users/${vereadorId}`),
                api.get(`/legislative-matters/${camaraId}`),
                api.get(`/commissions/${camaraId}`)
            ]);

            // 1. Councilman details
            const rawVereador = userResponse.data;
            if (!rawVereador) {
                this.setState({ loading: false });
                return;
            }

            // Normalização da imagem
            const vereador = { 
                ...rawVereador, 
                nome: rawVereador.name || rawVereador.nome || 'Parlamentar',
                foto: rawVereador.foto || rawVereador.avatar || rawVereador.photoURL || 'https://via.placeholder.com/150',
                bio: rawVereador.bio || '',
                email: rawVereador.email || '',
                phone: rawVereador.phone || '',
                gender: rawVereador.gender || '',
                maritalStatus: rawVereador.maritalStatus || '',
                address: rawVereador.address || '',
                number: rawVereador.number || '',
                neighborhood: rawVereador.neighborhood || '',
                city: rawVereador.city || '',
                state: rawVereador.state || '',
                zipCode: rawVereador.zipCode || '',
                complement: rawVereador.complement || '',
                createdAt: rawVereador.createdAt || ''
            };

            // 2. Legislative matters (filtered by councilman ID)
            const materias = (mattersResponse.data || [])
                .filter(m => m.userId === vereadorId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // 3. Commissions participation
            const comissoes = (comissoesResponse.data || [])
                .filter(com => {
                    if (com.membros) {
                        return Object.values(com.membros).some(m => (m.id || m.uid) === vereadorId);
                    }
                    return false;
                })
                .map(com => {
                    const memberInfo = Object.values(com.membros).find(m => (m.id || m.uid) === vereadorId);
                    return {
                        id: com.id,
                        nome: com.nome,
                        descricao: com.descricao,
                        cargo: memberInfo?.cargo || 'Membro'
                    };
                });

            this.setState({
                vereador,
                materias,
                comissoes,
                loading: false
            });

        } catch (error) {
            console.error("Erro ao carregar perfil do vereador:", error);
            this.setState({ loading: false });
        }
    }

    render() {
        const { vereador, materias, comissoes, loading, camaraId } = this.state;

        // Lógica para agrupar produtividade por mês do ano atual
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const currentYear = new Date().getFullYear();

        const projectsByMonth = materias.reduce((acc, m) => {
            const date = m.createdAt ? new Date(m.createdAt) : null;
            if (date && date.getFullYear() === currentYear) {
                const month = date.getMonth(); // 0-11
                acc[month] = (acc[month] || 0) + 1;
            }
            return acc;
        }, {});

        // Captura a cor primária do banco de dados (injetada no root pelo App.jsx)
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#126B5E';

        const chartData = {
            labels: monthNames,
            datasets: [
                {
                    label: 'Projetos',
                    data: monthNames.map((_, index) => projectsByMonth[index] || 0),
                    borderColor: primaryColor,
                    backgroundColor: primaryColor + '20', // Preenchimento suave
                    fill: true,
                    tension: 0.4, // Curva suave (Apple Style)
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: primaryColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    titleColor: '#1a1a1a',
                    bodyColor: '#1a1a1a',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 12,
                    displayColors: false,
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                    ticks: { 
                        stepSize: 1,
                        color: '#888',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: '#1a1a1a',
                        font: { size: 12, weight: '700' }
                    }
                }
            }
        };

        if (loading) {
            return (
                <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

        if (!vereador) {
            return (
                <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#555' }}>Vereador não encontrado.</p>
                    <Link to={`/home/${camaraId}`} className="btn-apple-pill" style={{ textDecoration: 'none' }}>Voltar ao Início</Link>
                </div>
            );
        }

        return (
            <div className='App-header-modern'>
                <div className='home-content-wrapper' style={{ gap: '30px' }}>
                  
                    <div className='sv-page-wrapper' style={{ padding: 0 }}>
                        {/* Hero Profile Card */}
                        <div className="glass-card" style={{ display: 'block', alignItems: 'center', gap: '30px', padding: '40px', flexWrap: 'wrap', marginBottom: '30px', borderLeft: `8px solid ${primaryColor}` }}>
                            <div className='sv-avatar-ring' style={{ width: '160px', height: '160px', border: 'none', background: 'rgba(255,255,255,0.5)', padding: '5px' }}>
                                <img 
                                    src={vereador.foto} 
                                    alt={vereador.nome} 
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} 
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '300px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', justifyContent: 'flex-end' }}>
                                    <h1 style={{ margin: 0, color: '#1a1a1a', fontWeight: 800, fontSize: '2.8rem', letterSpacing: '-0.03em' }}>{vereador.nome}</h1>
                                    <span className='sv-pill' style={{ background: primaryColor, color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{vereador.cargo || vereador.role || 'Vereador'}</span>
                                </div>
                                <p style={{ color: '#666', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 20px 0' }}>{vereador.partido || 'Sem Partido'}</p>
                                
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {vereador.email && <span className='sv-materia-meta' style={{ fontSize: '0.85rem' }}><FaEnvelope /> {vereador.email}</span>}
                                    {vereador.phone && <span className='sv-materia-meta' style={{ fontSize: '0.85rem' }}><FaPhone /> {vereador.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Produtividade */}
                        <div className="glass-card" style={{ padding: '35px', marginBottom: '40px', textAlign: 'left' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', fontWeight: 800, marginBottom: '30px', fontSize: '1.25rem' }}>
                                <FaGavel style={{ color: 'var(--primary-color)' }} /> Produtividade Legislativa em {currentYear}
                            </h3>
                            <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                                {materias.length > 0 ? (
                                    <Line data={chartData} options={chartOptions} />
                                ) : (
                                    <div style={{ width: '100%', textAlign: 'center', padding: '60px', color: '#888', fontStyle: 'italic' }}>
                                        Nenhum dado de produtividade disponível para este parlamentar.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                            
                            {/* Coluna Esquerda - Dados e Comissões */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                
                                {/* Biografia */}
                                {vereador.bio && (
                                    <div className="glass-card" style={{ padding: '30px' }}>
                                        <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a', fontWeight: 700 }}>
                                            <FaUser style={{ color: '#126B5E' }} /> Biografia
                                        </h3>
                                        <p style={{ margin: 0, color: '#444', lineHeight: '1.6', textAlign: 'justify', fontSize: '0.95rem' }}>
                                            {vereador.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Informações Detalhadas */}
                                <div className="glass-card" style={{ padding: '30px' }}>
                                    <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a', fontWeight: 700 }}>
                                        <FaInfoCircle style={{ color: '#126B5E' }} /> Dados & Localização
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {vereador.gender && <span className='sv-materia-meta' style={{ fontSize: '0.85rem' }}><FaVenusMars /> Gênero: {vereador.gender}</span>}
                                        {vereador.maritalStatus && <span className='sv-materia-meta' style={{ fontSize: '0.85rem' }}><FaHeart /> Estado Civil: {vereador.maritalStatus}</span>}
                                        {vereador.createdAt && <span className='sv-materia-meta' style={{ fontSize: '0.85rem' }}><FaCalendarAlt /> Membro desde: {new Date(vereador.createdAt).getFullYear()}</span>}
                                        
                                        <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '5px 0' }}></div>
                                        
                                        {(vereador.address || vereador.city) && (
                                            <span className='sv-materia-meta' style={{ fontSize: '0.85rem', alignItems: 'flex-start' }}>
                                                <FaHome style={{ marginTop: '3px', flexShrink: 0 }} /> 
                                                <span>
                                                    {vereador.address}{vereador.number ? `, ${vereador.number}` : ''} {vereador.complement ? `(${vereador.complement})` : ''}<br/>
                                                    {vereador.neighborhood ? `${vereador.neighborhood} - ` : ''}{vereador.city}/{vereador.state}<br/>
                                                    {vereador.zipCode ? `CEP: ${vereador.zipCode}` : ''}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '30px' }}>
                                <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a', fontWeight: 700 }}>
                                    <FaUsers style={{ color: '#126B5E' }} /> Comissões
                                </h3>
                                {comissoes.length > 0 ? (
                                    console.log("Comissões do vereador:", comissoes) ||
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {comissoes.map(comissao => (
                                            <div key={comissao.id} style={{ padding: '15px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 700, color: '#333', fontSize: '0.9rem' }}>{comissao.name || comissao.nome || 'Comissão sem nome' }</span>
                                                <span className="tag tag-primary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>{comissao.cargo}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#888', fontStyle: 'italic' }}>Não participa de comissões.</p>
                                )}
                                </div>
                            </div>

                            {/* Coluna Direita - Últimas Matérias */}
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a', fontWeight: 700 }}>
                                    <FaFileAlt style={{ color: '#126B5E' }} /> Produção Legislativa Recente
                                </h3>
                                {materias.length > 0 ? (
                                    <div className='sv-materias-list'>
                                        {materias.slice(0, 10).map(materia => (
                                            <div key={materia.id} className='sv-materia-card glass-card' style={{ background: 'rgba(255,255,255,0.4)' }} onClick={() => this.props.history.push(`/materia/${camaraId}/${materia.id}`)}>
                                                <div className='sv-materia-top'>
                                                    <div className='sv-materia-id'>
                                                        <FaFileAlt color='var(--primary-color)' />
                                                        <span>{materia.tipoMateria} {materia.numero}/{materia.ano}</span>
                                                    </div>
                                                    <span className={`sv-status-badge ${materia.status === 'Aprovado' ? 'sv-badge-ok' : 'sv-badge-neutral'}`}>
                                                        {materia.status || 'Tramitando'}
                                                    </span>
                                                </div>
                                                <p className='sv-materia-ementa'>{materia.ementa || materia.titulo}</p>
                                                <div className='sv-materia-meta'>
                                                    <FaCalendarAlt size={10} /> {new Date(materia.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='sv-empty-state'>Nenhuma matéria protocolada encontrada.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default VereadorProfile;
