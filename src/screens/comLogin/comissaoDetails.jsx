import React, { Component } from 'react';
import { FaUsers, FaFileAlt, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import { db } from '../../firebaseConfig';
import { ref, get, onValue, update } from 'firebase/database';

class ComissaoDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comissao: null,
            materias: [],
            loading: true,
            camaraId: 'camara-teste', // Será atualizado
            comissaoId: null,
        };
    }

    componentDidMount() {
        const { state } = this.props.location || {};
        const comissaoId = state ? state.comissaoId : null;

        if (!comissaoId) {
            this.setState({ loading: false, error: "ID da comissão não fornecido." });
            return;
        }

        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const camaraId = pathParts.length > 1 ? pathParts[1] : 'camara-teste';

        this.setState({ camaraId, comissaoId }, () => {
            this.fetchComissaoDetails();
        });
    }

    fetchComissaoDetails = async () => {
        const { camaraId, comissaoId } = this.state;
        const comissaoRef = ref(db, `${camaraId}/comissoes/${comissaoId}`);
        try {
            const snapshot = await get(comissaoRef);
            if (snapshot.exists()) {
                this.setState({ comissao: { id: snapshot.key, ...snapshot.val() } }, () => {
                    this.fetchMaterias(); // Chama o fetch de matérias após ter os detalhes da comissão
                });
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da comissão:", error);
        }
    };

    fetchMaterias = () => {
        const { camaraId, comissao } = this.state;
        if (!comissao) return;

        const materiasRef = ref(db, `${camaraId}/materias`);
        onValue(materiasRef, (snapshot) => {
            const allMaterias = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    allMaterias.push({ id: child.key, ...child.val() });
                });
            }
            // Filtra matérias destinadas a esta comissão
            const materiasDaComissao = allMaterias.filter(m => m.status === `Encaminhado à ${comissao.nome}`);
            this.setState({ materias: materiasDaComissao, loading: false });
        });
    };

    handleUpdateMateriaStatus = async (materiaId, newStatus) => {
        const { camaraId } = this.state;
        const materiaRef = ref(db, `${camaraId}/materias/${materiaId}`);
        try {
            await update(materiaRef, { status: newStatus });
            alert(`Matéria atualizada para: ${newStatus}`);
        } catch (error) {
            console.error("Erro ao atualizar status da matéria:", error);
        }
    };

    render() {
        const { comissao, materias, loading, error } = this.state;

        if (loading) {
            return <div className='App-header' style={{justifyContent: 'center'}}>Carregando detalhes da comissão...</div>;
        }

        if (error) {
            return <div className='App-header' style={{justifyContent: 'center'}}>{error}</div>;
        }

        if (!comissao) {
            return <div className='App-header' style={{justifyContent: 'center'}}>Comissão não encontrada.</div>;
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <div>
                            <h1 className="dashboard-header-title"><FaUsers /> {comissao.nome}</h1>
                            <p className="dashboard-header-desc">{comissao.descricao}</p>
                        </div>
                        <button className="btn-primary" style={{ width: 'auto' }}>
                            <FaPlus /> Criar Reunião
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h3 style={{ margin: '0 0 20px 0', color: '#126B5E' }}>Pautas para Deliberação</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {materias.length > 0 ? materias.map(materia => (
                                <div key={materia.id} className="list-item">
                                    <div className="list-item-content">
                                        <div className="list-item-header">
                                            <span className="tag tag-primary">{materia.tipoMateria} {materia.numero}</span>
                                        </div>
                                        <h3 className="list-item-title">{materia.titulo}</h3>
                                        <p style={{fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0'}}>Autor: {materia.autor}</p>
                                    </div>
                                    <div className="list-item-actions">
                                        <button 
                                            className="btn-danger" 
                                            onClick={() => this.handleUpdateMateriaStatus(materia.id, 'Rejeitado na Comissão')}
                                        >
                                            <FaTimes /> Rejeitar
                                        </button>
                                        <button 
                                            className="btn-success" 
                                            onClick={() => this.handleUpdateMateriaStatus(materia.id, 'Aprovado na Comissão')}
                                        >
                                            <FaCheck /> Aprovar Parecer
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhuma pauta pendente para esta comissão.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ComissaoDetails;