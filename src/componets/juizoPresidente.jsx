import React, { Component } from 'react';
import { FaBalanceScale, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaArchive, FaPaperPlane, FaFileAlt, FaGavel } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';

class JuizoPresidente extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            selectedMateria: null,
            despachoText: '',
            materias: [
                { 
                    id: 1, 
                    tipo: 'Projeto de Lei', 
                    numero: '12/2024', 
                    ementa: 'Dispõe sobre a obrigatoriedade de instalação de câmeras de segurança em escolas municipais.', 
                    autor: 'Ver. Teste', 
                    data: '20/02/2024', 
                    status: 'Aguardando Despacho da Presidência', 
                    urgencia: true, 
                    parecer: 'O projeto apresenta conformidade com a Lei Orgânica Municipal e a Constituição Federal. Não há vício de iniciativa. Opina-se pela constitucionalidade e legalidade.', 
                    decisaoParecer: 'favoravel' 
                },
                { 
                    id: 2, 
                    tipo: 'Projeto de Lei Complementar', 
                    numero: '03/2024', 
                    ementa: 'Altera o Código Tributário Municipal para instituir nova taxa de serviço.', 
                    autor: 'Poder Executivo', 
                    data: '18/02/2024', 
                    status: 'Aguardando Despacho da Presidência', 
                    urgencia: false, 
                    parecer: 'A matéria, por criar despesa sem indicar a fonte de custeio e invadir competência do executivo, apresenta vício de iniciativa. Opina-se pela inconstitucionalidade.', 
                    decisaoParecer: 'contrario' 
                },
                 { 
                    id: 3, 
                    tipo: 'Indicação', 
                    numero: '45/2024', 
                    ementa: 'Solicita pavimentação da Rua XV de Novembro.', 
                    autor: 'Ver. João', 
                    data: '21/02/2024', 
                    status: 'Encaminhado às Comissões', 
                    urgencia: false, 
                    parecer: 'Matéria de competência do executivo, segue como indicação. Legal.', 
                    decisaoParecer: 'favoravel' 
                },
            ]
        };
    }

    handleOpenModal = (materia) => {
        this.setState({ showModal: true, selectedMateria: materia, despachoText: '' });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedMateria: null });
    };

    handleSubmitDespacho = (novoStatus) => {
        const { selectedMateria, materias } = this.state;
        
        const updatedMaterias = materias.map(m => 
            m.id === selectedMateria.id ? { ...m, status: novoStatus } : m
        );

        this.setState({ 
            materias: updatedMaterias, 
            showModal: false,
            selectedMateria: null 
        });
        
        alert(`Despacho realizado com sucesso! Novo status: ${novoStatus}`);
    };

    render() {
        const { materias, showModal, selectedMateria } = this.state;

        const materiasPendentes = materias.filter(m => m.status === 'Aguardando Despacho da Presidência');

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content" style={{ marginLeft: '85px', width: '100%', padding: '40px', boxSizing: 'border-box', minHeight: '100vh' }}>
                    
                    {/* Header */}
                    <div style={{ marginBottom: '40px', textAlign: 'left' }}>
                        <h1 style={{ color: '#126B5E', margin: 0, fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaBalanceScale /> Juízo de Admissibilidade
                        </h1>
                        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Despachos da Presidência sobre a tramitação das matérias.</p>
                    </div>

                    {/* Lista de Matérias Pendentes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {materiasPendentes.length > 0 ? materiasPendentes.map((materia) => (
                            <div key={materia.id} style={{ 
                                background: 'white', 
                                padding: '25px', 
                                borderRadius: '12px', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: materia.decisaoParecer === 'contrario' ? '4px solid #d32f2f' : '4px solid #4CAF50'
                            }}>
                                <div style={{ flex: 1, marginRight: '20px', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#126B5E', background: '#e0f2f1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {materia.tipo} {materia.numero}
                                        </span>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: materia.decisaoParecer === 'contrario' ? '#d32f2f' : '#2e7d32', 
                                            background: materia.decisaoParecer === 'contrario' ? '#ffebee' : '#e8f5e9', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.8rem', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '5px' 
                                        }}>
                                            {materia.decisaoParecer === 'contrario' ? <FaTimesCircle size={12} /> : <FaCheckCircle size={12} />}
                                            Parecer {materia.decisaoParecer}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.1rem', lineHeight: '1.4' }}>{materia.ementa}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#666' }}>
                                        <span><strong>Autor:</strong> {materia.autor}</span>
                                        <span style={{ color: '#ccc' }}>|</span>
                                        <span><strong>Data:</strong> {materia.data}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <button 
                                        onClick={() => this.handleOpenModal(materia)}
                                        style={{ background: '#126B5E', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FaGavel /> Despachar
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#888' }}>
                                <FaCheckCircle size={40} style={{ marginBottom: '15px', color: '#126B5E' }} />
                                <h3 style={{margin: 0}}>Nenhuma matéria aguardando seu despacho.</h3>
                            </div>
                        )}
                    </div>

                    {/* Modal de Despacho */}
                    {showModal && selectedMateria && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                <h2 style={{ marginTop: 0, color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                                    Despacho da Presidência
                                </h2>
                                <div style={{ marginBottom: '20px' }}>
                                    <p><strong>Matéria:</strong> {selectedMateria.tipo} {selectedMateria.numero}</p>
                                    <p><strong>Ementa:</strong> {selectedMateria.ementa}</p>
                                </div>
                                
                                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: `4px solid ${selectedMateria.decisaoParecer === 'contrario' ? '#d32f2f' : '#4CAF50'}` }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><FaFileAlt /> Parecer da Procuradoria</h4>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>"{selectedMateria.parecer}"</p>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Texto do Despacho (Opcional)</label>
                                    <textarea 
                                        rows="4" 
                                        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                                        placeholder="Ex: Encaminhe-se às comissões competentes para análise..."
                                        value={this.state.despachoText}
                                        onChange={(e) => this.setState({ despachoText: e.target.value })}
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                    <button 
                                        onClick={this.handleCloseModal}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', color: '#666' }}
                                    >
                                        Cancelar
                                    </button>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => this.handleSubmitDespacho('Arquivado por Inconstitucionalidade')}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d32f2f', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <FaArchive /> Arquivar
                                        </button>
                                        <button 
                                            onClick={() => this.handleSubmitDespacho('Encaminhado às Comissões')}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#126B5E', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <FaPaperPlane /> Encaminhar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default JuizoPresidente;