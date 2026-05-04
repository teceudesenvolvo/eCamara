import React, { Component } from 'react';
import { FaCalendarAlt, FaPlus, FaList, FaCheckCircle, FaFileSignature, FaPrint, FaTrash, FaFileAlt, FaMagic, FaVideo, FaLink, FaPencilAlt, FaTimes, FaSearch, FaEye, FaArrowLeft, FaInfoCircle, FaGavel, FaExclamationTriangle, FaFilePdf } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import { Box, Typography, Button } from '@mui/material';
import 'react-quill/dist/quill.snow.css';

class GerenciarSessao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeLibraryTab: 'materias' // 'materias' ou 'urgencias'
        };
    }

    // Configuração do Editor Profissional
    quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'align'
    ];

    render() {
        const {
            sessao,
            materiasDisponiveis,
            documentosAcessoriosDisponiveis,
            editalText,
            isGeneratingEdital,
            isFinalizing,
            roteiroPdfUrl,
            isEditingUrl,
            editedTransmissaoUrl,
            materiaSearchTerm,
            isSignedEdital,
            handleOpenSignEdital,
            handleViewEditalPDF,
            editalHorario,
            editalBaseLegal,
            editalOficio,
            viewingMateriaForDetail,
            handleCloseDetails,
            handleOpenSessao,
            handleFinalizeSessao,
            handleGenerateEditalWithAI,
            handleUrlInputChange,
            handleSaveUrl,
            handleAddItem,
            handleRemoveItem,
            handleAddAcessorio,
            creationStep,
            setParentState // Para atualizar o estado do componente pai
        } = this.props;

        const { activeLibraryTab } = this.state;

        if (!sessao) return null;

        // Lógica de filtragem unificada
        const getFilteredItems = () => {
            const term = String(materiaSearchTerm || '').toLowerCase();
            if (activeLibraryTab === 'materias') {
                return materiasDisponiveis.filter(m =>
                    m.titulo?.toLowerCase().includes(term) ||
                    String(m.numero || '').toLowerCase().includes(term) ||
                    m.autor?.toLowerCase().includes(term)
                );
            }
            return documentosAcessoriosDisponiveis.filter(d =>
                d.titulo?.toLowerCase().includes(term) ||
                d.autorNome?.toLowerCase().includes(term)
            );
        };

        const filteredItems = getFilteredItems();

        return (
            <div style={{ animation: 'fadeIn 0.3s' }}>
                {!creationStep && (
                    <div className="dashboard-header" style={{ marginBottom: '30px' }}>
                        <button onClick={handleCloseDetails} className="btn-back">
                            <FaArrowLeft /> Voltar para Lista
                        </button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {sessao.status !== 'Aberta' && (
                                <button onClick={handleOpenSessao} className="btn-success">
                                    <FaVideo /> Abrir Sessão
                                </button>
                            )}
                            <button onClick={handleFinalizeSessao} disabled={isFinalizing} className="btn-primary">
                                <FaCheckCircle /> {isFinalizing ? 'Gerando...' : 'Finalizar Sessão'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="dashboard-card" style={{ borderLeft: '6px solid var(--primary-color)', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '17px', margin: 0, color: '#126B5E' }}>{sessao.tipo}</h2>
                            <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#666' }}>
                                <FaCalendarAlt /> Data: {sessao.data} | Formato: {sessao.formato || 'Presencial'} | 
                                Legislatura: {sessao.legislatura}ª | Status: <strong>{sessao.status}</strong>
                            </p>
                        </div>
                        {roteiroPdfUrl && (
                            <button onClick={() => window.open(roteiroPdfUrl)} className="btn-success">Ver Roteiro Gerado</button>
                        )}
                    </div>
                </div>

                {(!creationStep || creationStep === 1) && <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px', alignItems: 'start' }}>
                    {/* Inclusão de Matérias */}
                    <div className="dashboard-card" style={{ padding: '30px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => this.setState({ activeLibraryTab: 'materias' })}
                                    style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeLibraryTab === 'materias' ? 'var(--primary-color)' : '#f0f2f5', color: activeLibraryTab === 'materias' ? '#fff' : '#666' }}
                                >
                                    Matérias <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({materiasDisponiveis.length})</span>
                                </button>
                                <button 
                                    onClick={() => this.setState({ activeLibraryTab: 'urgencias' })}
                                    style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeLibraryTab === 'urgencias' ? '#e65100' : '#f0f2f5', color: activeLibraryTab === 'urgencias' ? '#fff' : '#666' }}
                                >
                                    Urgências <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({documentosAcessoriosDisponiveis.length})</span>
                                </button>
                            </div>
                        </div>

                        <div className="search-input-wrapper" style={{ marginBottom: '25px' }}>
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder={`Buscar em ${activeLibraryTab === 'materias' ? 'matérias' : 'urgências'}...`}
                                value={materiaSearchTerm}
                                onChange={(e) => setParentState({ materiaSearchTerm: e.target.value })}
                                style={{ background: '#f8f9fa' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
                            {filteredItems.length > 0 ? filteredItems.map(item => {
                                const isIncluded = sessao.itens?.some(i => String(i.id) === String(item.id));
                                return (
                                    <div key={item.id} className="list-item" style={{ margin: 0, padding: '15px 20px', border: '1px solid #eee', opacity: isIncluded ? 0.6 : 1, background: isIncluded ? '#f9f9f9' : '#fff' }}>
                                        <div style={{ textAlign: 'left', flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                <span className="tag tag-primary" style={{ fontSize: '0.7rem' }}>{item.tipoMateria || 'Requerimento'} {item.numero || ''}</span>
                                                {activeLibraryTab === 'urgencias' && <span className="tag tag-danger" style={{ fontSize: '0.65rem' }}><FaExclamationTriangle /> Urgência</span>}
                                            </div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: '#333' }}>{item.titulo}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Por: <strong>{item.autor || item.autorNome}</strong></p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                            {activeLibraryTab === 'materias' && (
                                                <>
                                                    <button onClick={() => setParentState({ viewingMateriaForDetail: item })} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }} title="Visualizar Detalhes">
                                                        <FaEye />
                                                    </button>
                                                    {item.pdfBase64 && (
                                                        <button 
                                                            onClick={() => setParentState({ pdfData: `data:application/pdf;base64,${item.pdfBase64}`, showPdfModal: true })} 
                                                            className="btn-secondary" 
                                                            style={{ padding: '8px', borderRadius: '8px', color: '#d32f2f' }} 
                                                            title="Visualizar PDF"
                                                        >
                                                            <FaFilePdf />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button 
                                                onClick={() => activeLibraryTab === 'materias' ? handleAddItem(item.id) : handleAddAcessorio(item.id)} 
                                                disabled={isIncluded}
                                                className={isIncluded ? "btn-secondary" : "btn-primary"}
                                                style={{ padding: '8px 15px', fontSize: '0.85rem', width: 'auto' }}
                                            >
                                                {isIncluded ? 'Na Pauta' : <><FaPlus /> Incluir</>}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                    <FaInfoCircle size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>Nenhum item disponível nesta categoria.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ordem do Dia */}
                    <div className="dashboard-card" style={{ padding: '30px', borderRadius: '24px' }}>
                        <h3 style={{ textAlign: 'left', color: '#126B5E', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaList /> Ordem do Dia
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                            {(sessao.matters || sessao.itens)?.length > 0 ? (sessao.matters || sessao.itens).map((item, idx) => {
                                const itemId = item.id || `item-${idx}`;
                                return (
                                <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '12px', background: '#fff' }}>
                                    <div style={{ textAlign: 'left', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '900', color: 'var(--primary-color)', fontSize: '1.1rem' }}>{idx + 1}º</span>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#333' }}>{item.titulo}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{item.autor}</div>
                                        </div>
                                    </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {item.pdfBase64 && (
                                                <button 
                                                    onClick={() => setParentState({ pdfData: `data:application/pdf;base64,${item.pdfBase64}`, showPdfModal: true })}
                                                    style={{ background: '#f0f2f5', border: 'none', color: '#d32f2f', cursor: 'pointer', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                                    title="Visualizar PDF"
                                                >
                                                    <FaFilePdf size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => handleRemoveItem(item.id)} style={{ background: '#fff5f5', border: 'none', color: '#d32f2f', cursor: 'pointer', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remover da Pauta">
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                </div>
                            ); }) : (
                                <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #eee', borderRadius: '16px' }}>
                                    <p style={{ color: '#bbb', margin: 0 }}>Use o botão incluir para montar a pauta da sessão.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>}

                {/* Edital de Convocação - Full Width & Professional Editor */}
                {(!creationStep || creationStep === 2 || creationStep === 3) && <div className="dashboard-card" style={{ padding: '30px', borderRadius: '24px', marginTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaFileAlt /> Edital de Convocação
                        </h3>
                            {/* Mostrar Visualizar PDF se já estiver assinado ou se estiver na etapa de assinatura */}
                            {(isSignedEdital || sessao.editalPdfUrl || sessao.editalPath || creationStep === 3) && (
                                <button 
                                    onClick={handleViewEditalPDF} 
                                    className="btn-secondary" 
                                    style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    disabled={!editalText && !sessao.editalPdfUrl && !sessao.editalPath}
                                >
                                    <FaFilePdf color="#d32f2f" /> Visualizar PDF
                                </button>
                            )}
                            
                            {/* Mostrar Assinar apenas na etapa 3 */}
                            {creationStep === 3 && !isSignedEdital && !sessao.editalPdfUrl && (
                                <button 
                                    onClick={handleOpenSignEdital} 
                                    className="btn-primary" 
                                    style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '12px', background: '#FF740F' }}
                                    disabled={!editalText}
                                >
                                    <FaFileSignature /> Assinar Edital
                                </button>
                            )}
                            
                            {/* Para visualização normal (fora do wizard) */}
                            {!creationStep && !isSignedEdital && !sessao.editalPdfUrl && (
                                <button 
                                    onClick={handleOpenSignEdital} 
                                    className="btn-primary" 
                                    style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '12px', background: '#FF740F' }}
                                    disabled={!editalText}
                                >
                                    <FaFileSignature /> Assinar Edital
                                </button>
                            )}
                        </div>

                    {sessao.editalPdfUrl || isSignedEdital ? (


                        <Box sx={{ 
                            p: 4, 
                            textAlign: 'center', 
                            background: '#f0fdf4', 
                            borderRadius: '16px', 
                            border: '1px solid #bbf7d0',
                            animation: 'fadeIn 0.3s'
                        }}>
                            <FaCheckCircle size={40} color="#2e7d32" style={{ marginBottom: '15px' }} />
                            <h4 style={{ color: '#166534', margin: '0 0 5px 0', fontSize: '1.1rem' }}>Edital Oficializado</h4>
                            <p style={{ color: '#15803d', margin: 0, fontSize: '0.9rem' }}>
                                O edital desta sessão já foi assinado digitalmente.
                            </p>
                        </Box>
                    ) : (
                        <Box sx={{ animation: 'fadeIn 0.3s' }}>
                            {/* Parâmetros Adicionais para a IA - Apenas na etapa 2 ou se não for wizard */}
                            {(!creationStep || creationStep === 2) && (
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>Horário da Sessão</label>
                                        <input type="text" className="modal-input" value={editalHorario} onChange={(e) => setParentState({ editalHorario: e.target.value })} placeholder="Ex: 09h45" style={{ height: '40px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>Base Legal (Lei Orgânica / RI)</label>
                                        <input type="text" className="modal-input" value={editalBaseLegal} onChange={(e) => setParentState({ editalBaseLegal: e.target.value })} placeholder="Ex: Art. 25 Lei Orgânica..." style={{ height: '40px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>Ofício de Referência (Opcional)</label>
                                        <input type="text" className="modal-input" value={editalOficio} onChange={(e) => setParentState({ editalOficio: e.target.value })} placeholder="Ex: Ofício nº 17/2025/GAB" style={{ height: '40px' }} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                        <button 
                                            onClick={handleGenerateEditalWithAI} 
                                            disabled={isGeneratingEdital} 
                                            className="btn-primary" 
                                            style={{ width: '100%', justifyContent: 'center', height: '45px', background: '#126B5E' }}
                                        >
                                            <FaMagic /> {isGeneratingEdital ? 'IA Redigindo...' : 'Gerar Edital de Convocação com IA'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
                                <ReactQuill
                                    theme="snow"
                                    value={editalText}
                                    onChange={(content) => setParentState({ editalText: content })}
                                    modules={this.quillModules}
                                    formats={this.quillFormats}
                                    style={{ height: '300px', marginBottom: '50px' }}
                                    placeholder="Redija o edital ou use a IA para gerar uma base..."
                                    readOnly={creationStep === 3} // Trava edição na etapa de assinatura
                                />
                            </div>
                        </Box>
                    )}
                </div>}


                {creationStep === 4 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, py: 8, animation: 'fadeIn 0.5s' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(46, 125, 50, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaCheckCircle size={40} color="#2e7d32" />
                        </div>
                        <Typography variant="h6" color="textSecondary" sx={{ mb: 2, textAlign: 'center', maxWidth: '500px' }}>
                            O edital foi assinado e a pauta está montada. <br/>Deseja abrir a sessão para participação agora ou apenas agendá-la?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large" 
                                onClick={handleOpenSessao}
                                startIcon={<FaVideo />}
                                sx={{ borderRadius: '16px', py: 2, px: 4, fontWeight: 'bold', textTransform: 'none' }}
                            >
                                Abrir Sessão Agora
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="large" 
                                onClick={handleFinalizeSessao}
                                disabled={isFinalizing}
                                startIcon={<FaMagic />}
                                sx={{ borderRadius: '16px', py: 2, px: 4, fontWeight: 'bold', textTransform: 'none', backgroundColor: '#126B5E' }}
                            >
                                {isFinalizing ? 'Gerando...' : 'Gerar Roteiro e Agendar'}
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Popup de Detalhes da Matéria */}
                {viewingMateriaForDetail && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '700px' }}>
                            <div className="modal-header">
                                <h2 style={{ margin: 0 }}>{viewingMateriaForDetail.tipoMateria} {viewingMateriaForDetail.numero}</h2>
                                <button onClick={() => setParentState({ viewingMateriaForDetail: null })} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <p style={{ margin: '0 0 10px 0' }}><strong>Autor:</strong> {viewingMateriaForDetail.autor}</p>
                                    <p style={{ margin: 0 }}><strong>Ementa:</strong> {viewingMateriaForDetail.ementa}</p>
                                </div>
                                <h4 style={{ color: '#126B5E', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Texto da Proposição</h4>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', fontSize: '0.95rem', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: viewingMateriaForDetail.textoMateria }} />
                            </div>
                            <div className="modal-footer">
                                {viewingMateriaForDetail.pdfBase64 && (
                                    <button 
                                        onClick={() => setParentState({ pdfData: `data:application/pdf;base64,${viewingMateriaForDetail.pdfBase64}`, showPdfModal: true })} 
                                        className="btn-secondary"
                                        style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FaFilePdf color="#d32f2f" /> Visualizar PDF Original
                                    </button>
                                )}
                                <button onClick={() => setParentState({ viewingMateriaForDetail: null })} className="btn-secondary">Fechar</button>
                                <button onClick={() => { handleAddItem(viewingMateriaForDetail.id); setParentState({ viewingMateriaForDetail: null }); }} className="btn-primary">Adicionar à Pauta</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default GerenciarSessao;