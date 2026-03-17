import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaCalendarAlt, FaUser, FaFileSignature } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';

// Material UI
import Chip from '@mui/material/Chip';

// Firebase
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';

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
        const { camaraId, materiaId } = this.state;
        try {
            const materiaRef = ref(db, `${camaraId}/materias/`);
            const snapshot = await get(materiaRef);

            if (snapshot.exists()) {
                this.setState({ materia: snapshot.val(), loading: false });
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

    render() {
        const { materia, loading, camaraId } = this.state;

        if (loading) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

        if (!materia) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <p>Matéria não encontrada.</p>
                    <Link to={`/materias/`} className="btn-secondary">Voltar</Link>
                </div>
            );
        }

        return (
            <div className='App-header'>
                <div className='openai-section' style={{ marginTop: '40px', maxWidth: '1000px' }}>
                    
                    {/* Botão Voltar */}
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <Link to={`/materias/`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>
                            <FaArrowLeft /> Voltar para Lista
                        </Link>
                    </div>

                    {/* Cabeçalho da Matéria */}
                    <div className="dashboard-card" style={{ borderLeft: '5px solid #126B5E' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: '#888', fontWeight: 'bold' }}>
                                    {materia.tipoMateria} nº {materia.numero}/{materia.ano}
                                </span>
                                <h1 style={{ margin: '10px 0', fontSize: '1.8rem', color: '#333' }}>{materia.titulo || 'Sem Título'}</h1>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    <Chip label={materia.status || 'Tramitando'} color="primary" variant="outlined" />
                                    <Chip label={materia.regTramita || 'Ordinária'} variant="outlined" />
                                </div>
                            </div>
                            
                            {materia.pdfBase64 && (
                                <div>
                                    <button onClick={this.openPdf} className="btn-primary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                    <strong>{materia.autor}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555' }}>
                                <FaCalendarAlt style={{ color: '#126B5E' }} />
                                <div>
                                    <small style={{ display: 'block', color: '#999' }}>Data Apresentação</small>
                                    <strong>{materia.dataApresenta || new Date(materia.createdAt).toLocaleDateString()}</strong>
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
                    <div className="dashboard-card" style={{ marginTop: '20px' }}>
                        <h3 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Ementa</h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', fontStyle: 'italic', background: '#f9f9f9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ccc' }}>
                            "{materia.ementa}"
                        </p>

                        {materia.textoMateria && (
                            <>
                                <h3 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px' }}>Texto Integral</h3>
                                <div 
                                    className="texto-lei-content"
                                    style={{ textAlign: 'justify', lineHeight: '1.8', color: '#333' }}
                                    dangerouslySetInnerHTML={{ __html: materia.textoMateria }} 
                                />
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
