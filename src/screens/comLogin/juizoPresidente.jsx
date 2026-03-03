import React, { Component } from 'react';
import { FaBalanceScale, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaArchive, FaPaperPlane, FaFileAlt, FaGavel, FaMagic } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';

class JuizoPresidente extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            selectedMateria: null,
            despachoText: '',
            isGeneratingDespacho: false,
            selectedComissao: '',
            comissoesDisponiveis: [
                'Comissão de Constituição, Justiça e Redação (CCJ)',
                'Comissão de Finanças e Orçamento',
                'Comissão de Obras e Serviços Públicos',
                'Comissão de Educação, Saúde e Assistência'
            ],
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
                { 
                    id: 4, 
                    tipo: 'Requerimento', 
                    numero: '100/2024', 
                    ementa: 'Requer voto de pesar pelo falecimento de cidadão ilustre.', 
                    autor: 'Ver. Maria', 
                    data: '23/02/2024', 
                    status: 'Aguardando Despacho da Presidência', 
                    urgencia: false, 
                    parecer: 'Regular.', 
                    decisaoParecer: 'favoravel' 
                },
                { 
                    id: 5, 
                    tipo: 'Projeto de Lei', 
                    numero: '05/2024', 
                    ementa: 'Institui o dia do ciclista no município.', 
                    autor: 'Ver. Pedro', 
                    data: '10/01/2024', 
                    status: 'Aprovado na Comissão', 
                    urgencia: false, 
                    parecer: 'Aprovado pela Comissão de Constituição e Justiça.', 
                    decisaoParecer: 'favoravel' 
                }
            ]
        };
    }

    handleOpenModal = (materia) => {
        this.setState({ showModal: true, selectedMateria: materia, despachoText: '', selectedComissao: '', isGeneratingDespacho: false });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, selectedMateria: null });
    };

    handleSubmitDespacho = (novoStatus) => {
        const { selectedMateria, materias, selectedComissao } = this.state;
        
        let statusFinal = novoStatus;

        if (novoStatus === 'Encaminhado às Comissões') {
            if (!selectedComissao) {
                alert("Por favor, selecione uma comissão para encaminhar a matéria.");
                return;
            }
            statusFinal = `Encaminhado à ${selectedComissao}`;
        }

        const updatedMaterias = materias.map(m => 
            m.id === selectedMateria.id ? { ...m, status: statusFinal } : m
        );

        this.setState({ 
            materias: updatedMaterias, 
            showModal: false,
            selectedMateria: null 
        });
        
        alert(`Despacho realizado com sucesso! Novo status: ${statusFinal}`);
    };

    handleGenerateDespachoWithAI = async () => {
        const { selectedMateria, selectedComissao } = this.state;
        if (!selectedMateria) return;

        this.setState({ isGeneratingDespacho: true, despachoText: '' });

        let promptContext = '';
        if (selectedComissao) {
            promptContext = `A intenção é encaminhar para a comissão: ${selectedComissao}.`;
        } else {
            promptContext = `A intenção é realizar um despacho de admissibilidade padrão.`;
        }

        const prompt = `Atue como o Presidente da Câmara Municipal. Redija um despacho de admissibilidade formal e técnico para a seguinte matéria:
        - Tipo: ${selectedMateria.tipo}
        - Número: ${selectedMateria.numero}
        - Ementa: "${selectedMateria.ementa}"
        - Parecer da Procuradoria: "${selectedMateria.parecer}" (${selectedMateria.decisaoParecer})
        
        Contexto da decisão: ${promptContext}

        O texto deve ser direto, formal e autorizar o trâmite ou arquivamento conforme o parecer. Não use markdown.`;

        const response = await this.callGeminiAPI(prompt);
        this.setState({ despachoText: response, isGeneratingDespacho: false });
    };

    // Função para chamar a API do Gemini
    async callGeminiAPI(prompt) {
        const API_KEY = 'AIzaSyDdvxyaBpOK098zGU8fq5dI6p_SeRARDvU';
        const MODEL_NAME = 'gemini-2.5-flash';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Erro retornado pela API Gemini:", data.error);
                if (data.error.code === 404) {
                    return `Erro: O modelo ${MODEL_NAME} não está disponível.`;
                }
                return `Erro na IA: ${data.error.message}`;
            }

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            
            return "Não foi possível gerar uma resposta válida.";
        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            return "Desculpe, não consegui processar sua solicitação no momento.";
        }
    }

    renderActionButtons = () => {
        const { selectedMateria } = this.state;
        if (!selectedMateria) return null;

        // Regra 3: Matéria aprovada na comissão -> Enviar para Plenário
        if (selectedMateria.status === 'Aprovado na Comissão') {
            return (
                <button 
                    onClick={() => this.handleSubmitDespacho('Enviado para Plenário')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#126B5E', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <FaPaperPlane /> Enviar para Plenário
                </button>
            );
        }

        // Regra 2: Requerimento -> Despachar ou Enviar para Plenário
        if (selectedMateria.tipo === 'Requerimento') {
            return (
                <>
                    <button 
                        onClick={() => this.handleSubmitDespacho('Despachado')}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4CAF50', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <FaCheckCircle /> Despachar
                    </button>
                    <button 
                        onClick={() => this.handleSubmitDespacho('Enviado para Plenário')}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#126B5E', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <FaPaperPlane /> Enviar para Plenário
                    </button>
                </>
            );
        }

        // Regra 1 (Geral): Arquivar ou Enviar para Comissão
        return (
            <>
                <button 
                    onClick={() => this.handleSubmitDespacho('Arquivado')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#d32f2f', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <FaArchive /> Arquivar
                </button>
                <button 
                    onClick={() => this.handleSubmitDespacho('Encaminhado às Comissões')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#126B5E', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <FaPaperPlane /> Enviar para Comissão
                </button>
            </>
        );
    };

    render() {
        const { materias, showModal, selectedMateria } = this.state;

        // Filtra matérias aguardando despacho inicial OU que retornaram das comissões
        const materiasPendentes = materias.filter(m => 
            m.status === 'Aguardando Despacho da Presidência' || 
            m.status === 'Aprovado na Comissão'
        );

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

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Destino (Comissão)</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '1rem', color: '#333' }}
                                        value={this.state.selectedComissao}
                                        onChange={(e) => this.setState({ selectedComissao: e.target.value })}
                                    >
                                        <option value="">Selecione uma comissão...</option>
                                        {this.state.comissoesDisponiveis.map((comissao, index) => (
                                            <option key={index} value={comissao}>{comissao}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#555' }}>Texto do Despacho (Opcional)</label>
                                        <button 
                                            onClick={this.handleGenerateDespachoWithAI}
                                            disabled={this.state.isGeneratingDespacho}
                                            style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #126B5E', background: 'white', color: '#126B5E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaMagic /> {this.state.isGeneratingDespacho ? 'Gerando...' : 'Sugerir com IA'}
                                        </button>
                                    </div>
                                    <textarea 
                                        rows="4" 
                                        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', backgroundColor: this.state.isGeneratingDespacho ? '#f5f5f5' : '#fff' }}
                                        placeholder={this.state.isGeneratingDespacho ? "Aguarde, a IA está redigindo o despacho..." : "Ex: Encaminhe-se às comissões competentes para análise..."}
                                        value={this.state.despachoText}
                                        onChange={(e) => this.setState({ despachoText: e.target.value })}
                                        readOnly={this.state.isGeneratingDespacho}
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
                                        {this.renderActionButtons()}
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