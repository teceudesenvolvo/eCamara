import React, { Component } from 'react';
import { FaArrowLeft, FaFilePdf, FaHistory, FaCheckCircle, FaClock, FaUserTie, FaCalendarAlt, FaPrint, FaExchangeAlt, FaDownload, FaShareAlt } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuDashboard.jsx';

class MateriaDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            materia: null,
            loading: true
        };
    }

    componentDidMount() {
        // Simulação de busca de dados baseada no ID recebido (via state ou params)
        // Na versão final, isso seria um this.props.match.params.id e uma chamada API
        const { state } = this.props.location || {};
        const materiaId = state ? state.materiaId : 1;

        // Dados Mockados para visualização
        setTimeout(() => {
            this.setState({
                loading: false,
                materia: {
                    id: materiaId,
                    titulo: 'DISPÕE SOBRE A OBRIGATORIEDADE DE INSTALAÇÃO DE CÂMERAS DE SEGURANÇA EM ESCOLAS MUNICIPAIS E DÁ OUTRAS PROVIDÊNCIAS.',
                    tipo: 'Projeto de Lei',
                    numero: '12/2024',
                    autor: 'Vereador Teste',
                    dataApresentacao: '20/02/2024',
                    status: 'Em Tramitação',
                    regime: 'Urgência',
                    ementa: 'Estabelece normas de segurança para monitoramento escolar visando a proteção de alunos e servidores.',
                    textoCompleto: 'Art. 1º Fica obrigatória a instalação de câmeras...',
                    historico: [
                        { data: '25/02/2024', status: 'Encaminhado às Comissões', descricao: 'Matéria enviada para a Comissão de Constituição e Justiça (CCJ).', icon: <FaExchangeAlt /> },
                        { data: '21/02/2024', status: 'Leitura em Plenário', descricao: 'Matéria lida no expediente da 15ª Sessão Ordinária.', icon: <FaClock /> },
                        { data: '20/02/2024', status: 'Protocolado', descricao: 'Matéria protocolada digitalmente sob nº 2024/00012.', icon: <FaCheckCircle /> }
                    ]
                }
            });
        }, 500);
    }

    render() {
        const { materia, loading } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <p>Carregando detalhes da matéria...</p>
                </div>
            );
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content" style={{ marginLeft: '85px', width: '100%', padding: '40px', boxSizing: 'border-box', minHeight: '100vh' }}>
                    
                    {/* Navegação de Voltar */}
                    <div style={{ marginBottom: '20px' }}>
                        <button 
                            onClick={() => this.props.history.goBack()}
                            style={{ background: 'none', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.target.style.color = '#126B5E'}
                            onMouseOut={(e) => e.target.style.color = '#666'}
                        >
                            <FaArrowLeft /> Voltar para Matérias
                        </button>
                    </div>

                    {/* Cabeçalho Principal Moderno */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '30px', borderLeft: '5px solid #126B5E' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                                    <span style={{ background: '#e0f2f1', color: '#126B5E', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {materia.tipo} nº {materia.numero}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>|</span>
                                    <span style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaCalendarAlt size={14} /> {materia.dataApresenta}
                                    </span>
                                </div>
                                <h1 style={{ color: '#2c3e50', margin: '0 0 15px 0', fontSize: '1.8rem', lineHeight: '1.4', fontWeight: '700' }}>
                                    {materia.titulo}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                                            <FaUserTie size={14} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Autor</p>
                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#333' }}>{materia.autor}</p>
                                        </div>
                                     </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                                <span style={{ 
                                    padding: '8px 20px', 
                                    borderRadius: '30px', 
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    background: materia.status === 'Sancionado' ? '#e8f5e9' : '#fff8e1',
                                    color: materia.status === 'Sancionado' ? '#2e7d32' : '#f57c00',
                                    border: materia.status === 'Sancionado' ? '1px solid #c8e6c9' : '1px solid #ffe0b2',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}>
                                    {materia.status}
                                </span>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#888' }}>Regime de Tramitação</p>
                                    <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{materia.regime}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                        
                        {/* Coluna Esquerda: Detalhes e Documentos */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            
                            {/* Card de Resumo e Texto */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#126B5E', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#126B5E', borderRadius: '2px', display: 'block' }}></span>
                                    Resumo da Matéria
                                </h3>
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ccc' }}>
                                    <p style={{ margin: 0, lineHeight: '1.6', color: '#444', fontSize: '1.05rem', fontStyle: 'italic' }}>"{materia.ementa}"</p>
                                </div>
                                
                                <div style={{ marginTop: '25px' }}>
                                    <h4 style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>Texto Inicial</h4>
                                    <p style={{ color: '#666', lineHeight: '1.6' }}>
                                        {materia.textoCompleto}
                                        <span style={{ color: '#126B5E', cursor: 'pointer', fontWeight: '600', marginLeft: '5px' }}>Ler completo</span>
                                    </p>
                                </div>
                            </div>

                            {/* Card de Documentos */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#126B5E', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#126B5E', borderRadius: '2px', display: 'block' }}></span>
                                    Documentos Oficiais
                                </h3>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
                                         onMouseOver={(e) => e.currentTarget.style.borderColor = '#126B5E'}
                                         onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: '#ffebee', color: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                <FaFilePdf />
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#333' }}>Projeto Original</p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>PDF Assinado • 2.4 MB</p>
                                            </div>
                                        </div>
                                        <div style={{ color: '#666' }}><FaDownload /></div>
                                    </div>

                                    <div style={{ flex: 1, minWidth: '200px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
                                         onMouseOver={(e) => e.currentTarget.style.borderColor = '#126B5E'}
                                         onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: '#e3f2fd', color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                <FaPrint />
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#333' }}>Versão Impressão</p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Sem marcas • A4</p>
                                            </div>
                                        </div>
                                        <div style={{ color: '#666' }}><FaShareAlt /></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coluna Direita: Tramitação */}
                        <div>
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'sticky', top: '20px' }}>
                                <h3 style={{ margin: '0 0 25px 0', color: '#126B5E', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaHistory /> Linha do Tempo
                                </h3>
                                <div style={{ position: 'relative', paddingLeft: '10px' }}>
                                    {materia.historico.map((step, index) => (
                                        <div key={index} style={{ position: 'relative', paddingBottom: '30px', paddingLeft: '25px' }}>
                                            {/* Vertical Line */}
                                            {index !== materia.historico.length - 1 && (
                                                <div style={{ position: 'absolute', left: '0', top: '24px', bottom: '0', width: '2px', background: '#e0e0e0' }}></div>
                                            )}
                                            
                                            {/* Dot/Icon */}
                                            <div style={{ 
                                                position: 'absolute', left: '-11px', top: '0',
                                                width: '24px', height: '24px', borderRadius: '50%', 
                                                background: index === 0 ? '#126B5E' : '#fff', 
                                                border: index === 0 ? 'none' : '2px solid #e0e0e0',
                                                color: index === 0 ? 'white' : '#ccc',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                zIndex: 2,
                                                fontSize: '0.7rem'
                                            }}>
                                                {index === 0 ? <FaClock /> : <FaCheckCircle />}
                                            </div>

                                            {/* Content */}
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: index === 0 ? '#126B5E' : '#333', fontSize: '0.95rem' }}>{step.status}</p>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaCalendarAlt size={10} /> {step.data}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: '1.4', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                                                    {step.descricao}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default MateriaDetails;