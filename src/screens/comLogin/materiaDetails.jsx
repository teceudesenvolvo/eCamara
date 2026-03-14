import React, { Component } from 'react';
import { FaArrowLeft, FaFilePdf, FaHistory, FaCheckCircle, FaClock, FaUserTie, FaCalendarAlt, FaPrint, FaExchangeAlt, FaDownload, FaShareAlt, FaGavel } from 'react-icons/fa';
import MenuDashboard from '../../componets/menuAdmin.jsx';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';

class MateriaDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            materia: null,
            loading: true
        };
    }

    async componentDidMount() {
        const { state } = this.props.location || {};
        const materiaId = state ? state.materiaId : null;

        if (!materiaId) {
            this.setState({ loading: false });
            return;
        }

        try {
            const materiaRef = ref(db, `camara-teste/materias/${materiaId}`);
            const snapshot = await get(materiaRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Constrói o histórico com base nos eventos registrados na matéria
                const historico = [];

                // 1. Protocolo (Criação)
                if (data.createdAt) {
                    historico.push({
                        data: new Date(data.createdAt).toLocaleDateString('pt-BR'),
                        status: 'Protocolado',
                        descricao: `Matéria protocolada digitalmente sob nº ${data.protocolo || 'S/N'}.`,
                        icon: <FaCheckCircle />
                    });
                }

                // 2. Parecer Jurídico (se houver)
                if (data.parecerDate) {
                    historico.unshift({
                        data: new Date(data.parecerDate).toLocaleDateString('pt-BR'),
                        status: data.decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário',
                        descricao: `Parecer emitido pela Procuradoria: ${data.parecer ? this.stripHtml(data.parecer).substring(0, 100) + '...' : ''}`,
                        icon: <FaExchangeAlt />
                    });
                }

                // 3. Despacho da Presidência (se houver)
                if (data.despachoDate) {
                    historico.unshift({
                        data: new Date(data.despachoDate).toLocaleDateString('pt-BR'),
                        status: data.status, // O status atual geralmente reflete a última ação
                        descricao: `Despacho da Presidência: ${data.despachoPresidente || ''}`,
                        icon: <FaGavel />
                    });
                }

                const materia = {
                    id: materiaId,
                    titulo: data.titulo || 'SEM TÍTULO',
                    tipo: data.tipoMateria || 'Matéria',
                    numero: data.numero || 'S/N',
                    autor: data.autor || 'Desconhecido',
                    dataApresenta: data.dataApresenta || 'Data não informada',
                    status: data.status || 'Em Tramitação',
                    regime: data.regTramita || 'Ordinária',
                    ementa: data.ementa || '',
                    textoCompleto: data.textoMateria || '',
                    pdfBase64: data.pdfBase64,
                    historico: historico
                };

                this.setState({ materia, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da matéria:", error);
            this.setState({ loading: false });
        }
    }

    stripHtml = (html) => {
        if (!html) return "";
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    downloadPDF = () => {
        const { materia } = this.state;
        if (materia && materia.pdfBase64) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${materia.pdfBase64}`;
            link.download = `Materia_${materia.numero ? materia.numero.replace('/', '-') : 'doc'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("PDF não disponível para esta matéria.");
        }
    };

    render() {
        const { materia, loading } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <p>Carregando detalhes da matéria...</p>
                </div>
            );
        }

        if (!materia) {
            return (
                <div className='App-header' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
                    <p>Matéria não encontrada.</p>
                    <button onClick={() => this.props.history.goBack()} className="btn-back">Voltar</button>
                </div>
            );
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">
                    
                    {/* Cabeçalho Principal Moderno */}
                    <div className="dashboard-card" style={{ marginBottom: '30px', borderLeft: '5px solid #126B5E' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                                    <span className="tag tag-primary">
                                        {materia.tipo} nº {materia.numero}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>|</span>
                                    <span style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaCalendarAlt size={14} /> {materia.dataApresenta}
                                    </span>
                                </div>
                                <h1 style={{ color: '#2c3e50', margin: '0 0 15px 0', fontSize: '1.5rem', lineHeight: '1.4', fontWeight: '700' }}>
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
                            <div className="dashboard-card">
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
                                        {this.stripHtml(materia.textoCompleto).substring(0, 400)}...
                                        <span style={{ color: '#126B5E', cursor: 'pointer', fontWeight: '600', marginLeft: '5px' }}>Ler completo</span>
                                    </p>
                                </div>
                            </div>

                            {/* Card de Documentos */}
                            <div className="dashboard-card">
                                <h3 style={{ margin: '0 0 20px 0', color: '#126B5E', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#126B5E', borderRadius: '2px', display: 'block' }}></span>
                                    Documentos Oficiais
                                </h3>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
                                         onMouseOver={(e) => e.currentTarget.style.borderColor = '#126B5E'}
                                         onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                         onClick={this.downloadPDF}
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
                            <div className="dashboard-card" style={{ position: 'sticky', top: '20px' }}>
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