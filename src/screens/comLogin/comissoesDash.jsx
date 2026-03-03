import React, { Component } from 'react';
import { FaUsers, FaPlus, FaTimes, FaUserPlus } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';
import ProfileImage from '../../assets/vereador.jpg'; // Reusing for member avatar

class ComissoesDash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            newComissaoName: '',
            newComissaoDesc: '',
            comissoes: [
                { 
                    id: 1, 
                    nome: 'Comissão de Constituição, Justiça e Redação (CCJ)', 
                    descricao: 'Analisa a constitucionalidade e legalidade das matérias.',
                    membros: [
                        { id: 1, nome: 'Diogo Queiroz', cargo: 'Presidente', avatar: ProfileImage },
                        { id: 2, nome: 'Vereador Teste', cargo: 'Relator', avatar: ProfileImage },
                        { id: 3, nome: 'Ver. Maria', cargo: 'Membro', avatar: ProfileImage },
                    ] 
                },
                { 
                    id: 2, 
                    nome: 'Comissão de Finanças e Orçamento', 
                    descricao: 'Responsável pela análise de matérias de impacto financeiro e orçamentário.',
                    membros: [
                        { id: 4, nome: 'Ver. João', cargo: 'Presidente', avatar: ProfileImage },
                        { id: 5, nome: 'Vereador Teste', cargo: 'Membro', avatar: ProfileImage },
                    ]
                },
            ]
        };
    }

    handleOpenModal = () => this.setState({ showModal: true, newComissaoName: '', newComissaoDesc: '' });
    handleCloseModal = () => this.setState({ showModal: false });

    handleCreateComissao = () => {
        const { newComissaoName, newComissaoDesc, comissoes } = this.state;
        if (!newComissaoName.trim()) {
            alert('O nome da comissão é obrigatório.');
            return;
        }

        const newComissao = {
            id: Date.now(),
            nome: newComissaoName,
            descricao: newComissaoDesc,
            membros: []
        };

        this.setState({
            comissoes: [...comissoes, newComissao],
            showModal: false
        });
    };

    render() {
        const { comissoes, showModal, newComissaoName, newComissaoDesc } = this.state;

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    
                    {/* Header */}
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title">
                                <FaUsers /> Gestão de Comissões
                            </h1>
                            <p className="dashboard-header-desc">Crie e gerencie as comissões permanentes e temporárias da câmara.</p>
                        </div>
                        <button 
                            onClick={this.handleOpenModal}
                            className="btn-primary" 
                            style={{ width: 'auto' }}
                        >
                            <FaPlus /> Nova Comissão
                        </button>
                    </div>

                    {/* Grid de Comissões */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
                        {comissoes.map(comissao => (
                            <div key={comissao.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '25px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#126B5E', fontSize: '1.2rem' }}>{comissao.nome}</h3>
                                    <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{comissao.descricao}</p>
                                    
                                    <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '1rem', borderTop: '1px solid #eee', paddingTop: '15px' }}>Membros</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {comissao.membros.length > 0 ? comissao.membros.map(membro => (
                                            <div key={membro.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={membro.avatar} alt={membro.nome} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{membro.nome}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{membro.cargo}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>Nenhum membro adicionado.</p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '15px 25px', background: '#fafafa', borderTop: '1px solid #eee' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#126B5E', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaUserPlus /> Gerenciar Membros
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Modal de Criação */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '500px' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0 }}>Criar Nova Comissão</h2>
                                    <button onClick={this.handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}><FaTimes /></button>
                                </div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Nome da Comissão</label>
                                    <input 
                                        type="text"
                                        value={newComissaoName}
                                        onChange={(e) => this.setState({ newComissaoName: e.target.value })}
                                        className="modal-input"
                                        placeholder="Ex: Comissão de Educação e Cultura"
                                    />
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Descrição</label>
                                    <textarea 
                                        rows="4"
                                        value={newComissaoDesc}
                                        onChange={(e) => this.setState({ newComissaoDesc: e.target.value })}
                                        className="modal-textarea"
                                        placeholder="Descreva brevemente a finalidade da comissão..."
                                    ></textarea>
                                </div>

                                <div className="modal-footer">
                                    <button 
                                        onClick={this.handleCloseModal}
                                        className="btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={this.handleCreateComissao}
                                        className="btn-primary"
                                    >
                                        Criar Comissão
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ComissoesDash;