import React, { Component } from 'react';
import { FaUsers, FaFileAlt, FaCheck, FaTimes, FaPlus, FaCalendarCheck } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import { db } from '../../firebaseConfig';
import { ref, get, onValue, update, push, set } from 'firebase/database';

class ComissaoDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comissao: null,
            materias: [],
            reunioes: [],
            loading: true,
            camaraId: this.props.match.params.camaraId, // Será atualizado
            comissaoId: null,
            activeTab: 'pautas',
            // State for meeting creation modal
            showReuniaoModal: false,
            novaReuniaoData: '',
            novaReuniaoTipo: 'Presencial',
            novaReuniaoLocal: '',
            novaReuniaoPauta: '',
            novaReuniaoMaterias: [] // Novo estado para as matérias selecionadas
        };
    }

    componentDidMount() {
        const { state } = this.props.location || {};
        const comissaoId = state ? state.comissaoId : null;

        console.log("Comissão ID recebido via props.location.state:", comissaoId);
        this.setState({ comissaoId }); // Atualiza o estado com o comissaoId recebido

        if (!comissaoId) {
            this.setState({ loading: false, error: "ID da comissão não fornecido." });
            return;
        }

        const camaraId = this.props.match.params.camaraId;

        this.setState({ camaraId, comissaoId }, () => {
            this.fetchComissaoDetails();
        });
    }

    fetchComissaoDetails = async () => {
        const { camaraId, comissaoId } = this.state;
        this.setState({ loading: true }); // Set loading to true before fetching
        const comissaoRef = ref(db, `${this.props.match.params.camaraId}/comissoes/${comissaoId}`);
        console.log(comissaoRef);
        console.log("camaraId:", camaraId, "comissaoId:", comissaoId);
        
        try {
            const snapshot = await get(comissaoRef);
            console.log(snapshot.exists());
            if (snapshot.exists()) {
                this.setState({ comissao: { id: snapshot.key, ...snapshot.val() } }, () => {                    this.fetchReunioes();
                    this.fetchMaterias();
                });
            } else {
                this.setState({ loading: false, error: "Comissão não encontrada." });
                console.log("Comissão encontrada:", this.state.comissao);
                console.log(snapshot.exists());
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da comissão:", error); 
            this.setState({ loading: false, error: "Erro ao buscar detalhes da comissão." }); // Handle error
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
        },  (error) => {
            console.error("Erro ao buscar matérias da comissão:", error);
            this.setState({ loading: false, error: "Erro ao buscar matérias da comissão." }); // Handle error
        });
    };

    fetchReunioes = () => {
        const { camaraId, comissaoId } = this.state;
        if (!comissaoId) return;

        const reunioesRef = ref(db, `${camaraId}/comissoes/${comissaoId}/reunioes`);
        onValue(reunioesRef, (snapshot) => {
            const reunioesList = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    reunioesList.push({ id: child.key, ...child.val() });
                });
            }
            // Ordena por data, da mais recente para a mais antiga
            reunioesList.sort((a, b) => new Date(b.data) - new Date(a.data));
            this.setState({ reunioes: reunioesList });
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

    // --- Meeting Modal Methods ---

    handleOpenReuniaoModal = () => {
        this.setState({ showReuniaoModal: true });
    };

    handleCloseReuniaoModal = () => {
        this.setState({ 
            showReuniaoModal: false, 
            novaReuniaoData: '', 
            novaReuniaoTipo: 'Presencial', 
            novaReuniaoLocal: '', 
            novaReuniaoPauta: '' ,
            novaReuniaoMaterias: [],
        });
    };

    handleMateriaSelect = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        this.setState({ novaReuniaoMaterias: selectedIds });
    };

    handleCreateReuniao = async () => {
        const { camaraId, comissaoId, novaReuniaoData, novaReuniaoTipo, novaReuniaoLocal, novaReuniaoPauta, materias, novaReuniaoMaterias } = this.state;

        if (!novaReuniaoData) {
            alert("Por favor, preencha a data da reunião.");
            return;
        }

        if (novaReuniaoMaterias.length === 0 && !novaReuniaoPauta) {
            alert("A reunião deve ter pelo menos uma matéria selecionada ou um tópico na pauta.");
            return;
        }

        const pautasSelecionadas = materias.filter(m => novaReuniaoMaterias.includes(m.id));
        const pautaMateriasTexto = pautasSelecionadas.map((m, index) => `${index + 1}. ${m.tipoMateria} ${m.numero}: ${m.titulo}`).join('\n');
        
        let pautaFinal = '';
        if (pautaMateriasTexto) {
            pautaFinal += `Matérias para Deliberação:\n${pautaMateriasTexto}`;
        }
        if (novaReuniaoPauta) {
            pautaFinal += `${pautaFinal ? '\n\n' : ''}Outros Tópicos:\n${novaReuniaoPauta}`;
        }

        const reunioesRef = ref(db, `${camaraId}/comissoes/${comissaoId}/reunioes`);
        const newReuniaoRef = push(reunioesRef);

        let reuniaoData = {
            data: novaReuniaoData,
            tipo: novaReuniaoTipo,
            pauta: pautaFinal,
            materiasPautadas: pautasSelecionadas.map(m => ({ id: m.id, titulo: m.titulo, numero: m.numero })),
            status: 'Agendada',
            createdAt: new Date().toISOString(),
        };

        if (novaReuniaoTipo === 'Virtual') {
            const roomName = `eCamara-${camaraId}-${comissaoId}-${newReuniaoRef.key}`;
            reuniaoData.url = `https://meet.jit.si/${roomName}`;
        } else {
            reuniaoData.local = novaReuniaoLocal || 'A definir';
        }

        try {
            await set(newReuniaoRef, reuniaoData);
            alert('Reunião criada com sucesso!');
            this.handleCloseReuniaoModal();
        } catch (error) {
            console.error("Erro ao criar reunião:", error);
            alert('Erro ao criar reunião.');
        }
    };

    render() {
        const { comissao, materias, reunioes, loading, error, activeTab, showReuniaoModal, novaReuniaoData, novaReuniaoTipo, novaReuniaoLocal, novaReuniaoPauta, novaReuniaoMaterias } = this.state;

        

        if (loading) {
            return <div className='App-header' style={{justifyContent: 'center'}}>Carregando detalhes da comissão...</div>;
        }

        if (error) {
            return <div className='App-header' style={{justifyContent: 'center'}}>{error}</div>;
        }
        
        console.log("Comissão:", comissao);
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
                        <button className="btn-primary" style={{ width: 'auto' }} onClick={this.handleOpenReuniaoModal}>
                            <FaPlus /> Criar Reunião
                        </button>
                    </div>

                    {/* Abas de Navegação */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
                        <button onClick={() => this.setState({ activeTab: 'pautas' })} className={`tab-button ${activeTab === 'pautas' ? 'active' : ''}`} style={{ padding: '10px 20px', background: activeTab === 'pautas' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'pautas' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaFileAlt /> Pautas para Deliberação
                        </button>
                        <button onClick={() => this.setState({ activeTab: 'reunioes' })} className={`tab-button ${activeTab === 'reunioes' ? 'active' : ''}`} style={{ padding: '10px 20px', background: activeTab === 'reunioes' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'reunioes' ? '3px solid #126B5E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCalendarCheck /> Reuniões Agendadas
                        </button>
                    </div>

                    {/* Conteúdo da Aba Ativa */}
                    {activeTab === 'pautas' && (
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
                    )}

                    {activeTab === 'reunioes' && (
                        <div className="dashboard-card">
                            <h3 style={{ margin: '0 0 20px 0', color: '#126B5E' }}>Reuniões Agendadas</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {reunioes.length > 0 ? reunioes.map(reuniao => (
                                    <div key={reuniao.id} className="list-item">
                                        <div className="list-item-content">
                                            <div className="list-item-header">
                                                <span className="tag tag-primary">{new Date(reuniao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className={`tag ${reuniao.status === 'Agendada' ? 'tag-warning' : 'tag-success'}`}>{reuniao.status}</span>
                                            </div>
                                            <h3 className="list-item-title">{reuniao.tipo}</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>
                                                <strong>Pauta:</strong><br />{reuniao.pauta}
                                            </p>
                                            {reuniao.tipo === 'Virtual' && reuniao.url ? (
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => this.props.history.push(`/admin/reuniao-virtual/${this.props.match.params.camaraId}/${comissao.id}/${reuniao.id}`)}
                                                    style={{ width: 'auto', marginTop: '10px', padding: '8px 15px' }}>
                                                    Entrar na Reunião
                                                </button>
                                            ) : reuniao.local && (
                                                <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0 0 0' }}>Local: {reuniao.local}</p>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhuma reunião agendada para esta comissão.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Modal para Criar Reunião */}
                    {showReuniaoModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '500px' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0 }}>Agendar Nova Reunião</h2>
                                    <button onClick={this.handleCloseReuniaoModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                                </div>
                                
                                <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                                    <div>
                                        <label className="label-form">Data e Hora</label>
                                        <input 
                                            type="datetime-local" 
                                            className="modal-input" 
                                            value={novaReuniaoData}
                                            onChange={(e) => this.setState({ novaReuniaoData: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-form">Tipo de Reunião</label>
                                        <select 
                                            className="modal-input" 
                                            value={novaReuniaoTipo}
                                            onChange={(e) => this.setState({ novaReuniaoTipo: e.target.value })}
                                        >
                                            <option value="Presencial">Presencial</option>
                                            <option value="Virtual">Virtual (Jitsi)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-form">Matérias para Pauta</label>
                                        <select 
                                            multiple
                                            className="modal-input" 
                                            style={{ height: '150px' }}
                                            value={novaReuniaoMaterias}
                                            onChange={this.handleMateriaSelect}
                                        >
                                            {materias.length > 0 ? materias.map(materia => (
                                                <option key={materia.id} value={materia.id}>
                                                    {materia.tipoMateria} {materia.numero} - {materia.titulo}
                                                </option>
                                            )) : (
                                                <option disabled>Nenhuma matéria pendente nesta comissão</option>
                                            )}
                                        </select>
                                    </div>
                                    {novaReuniaoTipo === 'Presencial' && (
                                        <div>
                                            <label className="label-form">Local</label>
                                            <input 
                                                type="text" 
                                                className="modal-input" 
                                                placeholder="Ex: Plenário da Câmara"
                                                value={novaReuniaoLocal}
                                                onChange={(e) => this.setState({ novaReuniaoLocal: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="label-form">Outros Tópicos da Pauta</label>
                                        <textarea rows="3" className="modal-textarea" placeholder="Descreva outros tópicos a serem discutidos..." value={novaReuniaoPauta} onChange={(e) => this.setState({ novaReuniaoPauta: e.target.value })} />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={this.handleCloseReuniaoModal}>Cancelar</button>
                                    <button className="btn-primary" onClick={this.handleCreateReuniao}>Agendar Reunião</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ComissaoDetails;