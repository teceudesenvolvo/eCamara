import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaCalendarAlt, FaUser, FaFileSignature, FaGavel } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';

// Material UI
import Chip from '@mui/material/Chip';

// Firebase
import api from '../../services/api.js';

class MateriaDetalhesPublico extends Component {
    constructor(props) {
        super(props);
        this.state = {
            materia: null,
            loading: true,
            camaraId: this.props.match.params.camaraId,
            materiaId: this.props.match.params.materiaId,
        };
    }

    componentDidMount() {
        this.fetchMateriaDetails();
    }

    fetchMateriaDetails = async () => {
        const { materiaId } = this.state;
        try {
            const response = await api.get(`/legislative-matter-detail/${materiaId}`);
            if (response.data) {
                this.setState({ materia: response.data, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da matéria:", error);
            this.setState({ loading: false });
        }
    };

    openPdf = () => {
        const { materia } = this.state;
        if (materia && materia.pdfBase64) {
            const pdfWindow = window.open("");
            pdfWindow.document.write(
                `<iframe width='100%' height='100%' src='data:application/pdf;base64,${materia.pdfBase64}'></iframe>`
            );
        } else {
            alert("PDF não disponível.");
        }
    };

    decodeHtml = (html) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    render() {
        const { materia, loading, camaraId } = this.state;

        if (loading) {
            return (
                <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

        if (!materia) {
            return (
                <div className='App-header-modern' style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#555' }}>Matéria não encontrada.</p>
                    <Link to={`/materias/`} className="btn-apple-pill" style={{ textDecoration: 'none' }}>Voltar</Link>
                </div>
            );
        }

        const numeroFormatted = (materia.numero && String(materia.numero).includes('/')) ? materia.numero : `${materia.numero || ''}/${materia.ano || ''}`;
        const dataApresentacao = materia.dataApresenta || (materia.createdAt ? new Date(materia.createdAt).toLocaleDateString('pt-BR') : '-');

        return (
            <div className='App-header-modern'>
                <div className='home-content-wrapper' style={{ marginTop: '40px', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
                    
                    
                    {/* Cabeçalho da Matéria */}
                    <div className="glass-card" style={{ borderLeft: '5px solid #126B5E', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: '#888', fontWeight: 'bold' }}>
                                    {materia.tipoMateria} nº {numeroFormatted}
                                </span>
                                <h1 style={{ margin: '10px 0', fontSize: '1.8rem', color: '#333' }}>{materia.titulo || 'Sem Título'}</h1>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    <Chip label={materia.status || 'Tramitando'} color="primary" variant="outlined" />
                                    <Chip label={materia.regTramita || 'Ordinária'} variant="outlined" />
                                </div>
                            </div>
                            
                            {materia.pdfBase64 && (
                                <div>
                                    <button onClick={this.openPdf} className="btn-apple-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaFilePdf /> Visualizar Documento Oficial
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555' }}>
                                <FaUser style={{ color: '#126B5E' }} />
                                <div>
                                    <small style={{ display: 'block', color: '#999' }}>Autor</small>
                                    <strong>{materia.autor || materia.tipoAutor || 'Desconhecido'}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555' }}>
                                <FaCalendarAlt style={{ color: '#126B5E' }} />
                                <div>
                                    <small style={{ display: 'block', color: '#999' }}>Data Apresentação</small>
                                    <strong>{dataApresentacao}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555' }}>
                                <FaFileSignature style={{ color: '#126B5E' }} />
                                <div>
                                    <small style={{ display: 'block', color: '#999' }}>Protocolo</small>
                                    <strong>{materia.protocolo || '-'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="glass-card" style={{ marginTop: '20px', padding: '30px' }}>
                        <h3 style={{ color: '#1a1a1a', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px', marginBottom: '20px', fontWeight: 700 }}>Ementa</h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', fontStyle: 'italic', background: '#f9f9f9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ccc' }}>
                            "{materia.ementa}"
                        </p>

                        {materia.textoMateria && (
                            <>
                                <h3 style={{ color: '#1a1a1a', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px', marginBottom: '20px', marginTop: '40px', fontWeight: 700 }}>Texto Integral</h3>
                                <div 
                                    className="texto-lei-content"
                                    style={{ textAlign: 'justify', lineHeight: '1.8', color: '#333' }}
                                    dangerouslySetInnerHTML={{ __html: this.decodeHtml(materia.textoMateria) }} 
                                />
                            </>
                        )}

                        {materia.parecer && (
                            <>
                                <h3 style={{ color: '#FF740F', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaGavel /> Parecer Jurídico
                                </h3>
                                
                                <div style={{ background: '#fff8e1', padding: '20px', borderRadius: '8px', border: '1px solid #ffe0b2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#e65100' }}>
                                            {materia.parecerDate ? new Date(materia.parecerDate).toLocaleDateString('pt-BR') : 'Data não informada'}
                                        </span>
                                        {materia.decisao && (
                                            <Chip 
                                                label={materia.decisao.toUpperCase()} 
                                                style={{ backgroundColor: materia.decisao === 'favoravel' ? '#4caf50' : '#f44336', color: 'white', fontWeight: 'bold' }} 
                                                size="small"
                                            />
                                        )}
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#555', fontSize: '0.95rem' }}>
                                        {materia.parecer.replace(/\*\*/g, '')}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Rodapé da Matéria */}
                    <div style={{ textAlign: 'center', marginTop: '40px', color: '#888', fontSize: '0.9rem' }}>
                        <p>Documento digital gerado pela plataforma Camara AI.</p>
                    </div>

                </div>
            </div>
        );
    }
}

export default MateriaDetalhesPublico;
