import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaUsers, FaGavel, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import PageHeader from '../../componets/PageHeader.jsx';
import api from '../../services/api.js';

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
            const vereador = userResponse.data;
            if (!vereador) {
                this.setState({ loading: false });
                return;
            }

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

        if (loading) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

        if (!vereador) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <p>Vereador não encontrado.</p>
                    <Link to={`/home/${camaraId}`} className="btn-secondary">Voltar ao Início</Link>
                </div>
            );
        }

        return (
            <div className='App-header'>
                <div className='openai-section' style={{ marginTop: '40px', maxWidth: '1200px' }}>
                    
                  

                    {/* Cartão de Perfil */}
                    <div className="card-profile-public" >
                        <p><img 
                            src={vereador.foto || 'https://via.placeholder.com/150'} 
                            alt={vereador.nome} 
                            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #126B5E', marginBottom: '20px' }} 
                        /></p>
                        <div className='text-profile'>
                        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>{vereador.nome}</h1>
                        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>Vereador(a)</p>
                        </div>
                       
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        
                        {/* Coluna Esquerda - Comissões e Estatísticas */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="dashboard-card">
                                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#126B5E' }}>
                                    <FaUsers /> Comissões
                                </h3>
                                {comissoes.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {comissoes.map(comissao => (
                                            <li key={comissao.id} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{comissao.nome}</span>
                                                <span className="tag tag-primary">{comissao.cargo}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic' }}>Não participa de comissões.</p>
                                )}
                            </div>

                            <div className="dashboard-card">
                                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#126B5E' }}>
                                    <FaGavel /> Atuação Legislativa
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                    <div>
                                        <h2 style={{ margin: 0, color: '#FF740F', fontSize: '2.5rem' }}>{materias.length}</h2>
                                        <p style={{ margin: 0, color: '#666' }}>Matérias</p>
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, color: '#126B5E', fontSize: '2.5rem' }}>{comissoes.length}</h2>
                                        <p style={{ margin: 0, color: '#666' }}>Comissões</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coluna Direita - Últimas Matérias */}
                        <div className="dashboard-card" style={{ flex: 2 }}>
                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#126B5E' }}>
                                <FaFileAlt /> Matérias Recentes
                            </h3>
                            {materias.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {materias.slice(0, 10).map(materia => (
                                        <div key={materia.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => this.props.history.push(`/materia/${camaraId}/${materia.id}`)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#126B5E', fontSize: '0.9rem' }}>{materia.tipoMateria} {materia.numero}/{materia.ano}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(materia.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ margin: 0, color: '#555', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {materia.ementa || materia.titulo}
                                            </p>
                                            <div style={{ marginTop: '10px' }}>
                                                <span className={`tag ${materia.status === 'Aprovado' ? 'tag-success' : 'tag-neutral'}`} style={{ display: 'inline-block' }}>
                                                    {materia.status || 'Tramitando'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nenhuma matéria encontrada.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default VereadorProfile;
