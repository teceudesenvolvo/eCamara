import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowLeft,
    FaFilePdf,
    FaCalendarAlt,
    FaUser,
    FaFileSignature,
    FaGavel,
    FaInfoCircle,
    FaUsers,
    FaTimes,
    FaSpinner,
    FaFileAlt,
    FaBalanceScale
} from 'react-icons/fa';

import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

import api from '../../services/api.js';

class MateriaDetalhesPublico extends Component {

    constructor(props) {
        super(props);

        this.state = {
            materia: null,
            loading: true,

            camaraId: this.props.match.params.camaraId,
            materiaId: this.props.match.params.materiaId,

            showPdfPopup: false,
            pdfData: null,

            // Modals
            showTechnicalDetailsModal: false,
            showSubscribersModal: false,
            showTextoModal: false,
        };
    }

    componentDidMount() {
        this.fetchMateriaDetails();
    }

    fetchMateriaDetails = async () => {
        const { materiaId } = this.state;
        try {
            const response = await api.get(`/legislative-matter-detail/${materiaId}`);
            const data = response.data || {};
            let subscricoes = data.subscricoes || [];
            if (subscricoes && !Array.isArray(subscricoes)) {
                subscricoes = Object.values(subscricoes);
            }
            const normalizedSubscricoes = subscricoes.map(sub => ({
                ...sub,
                foto: sub.foto || sub.avatar || sub.photoURL || 'https://via.placeholder.com/100'
            }));
            const materia = {
                ...data,
                subscricoes: normalizedSubscricoes,
                pdfUrl: data.pdfUrl || data.anexoUrl,
                apelido: data.apelido || '-',
                prazo: data.prazo || '-',
                protocolo: data.protocolo || '-',
                indexacao: data.indexacao || '-',
                observacao: data.observacao || '-',
                objeto: data.objeto || '-',
                materiaPolemica: data.materiaPolemica ? 'Sim' : 'Não',
                isComplementar: data.isComplementar ? 'Sim' : 'Não',
                publicacao: data.publicacao ? 'Sim' : 'Não',
            };
            this.setState({
                materia,
                loading: false
            });
        } catch (error) {
            console.error(error);
            this.setState({
                loading: false
            });
        }
    };

    decodeHtml = (html) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    openPdf = (url) => {
        if (!url) {
            alert('PDF não disponível.');
            return;
        }
        this.setState({
            showPdfPopup: true,
            pdfData: url
        });
    };

    closePdfPopup = () => {
        this.setState({
            showPdfPopup: false,
            pdfData: null
        });
    };

    openTechnicalDetailsModal = () => this.setState({ showTechnicalDetailsModal: true });
    closeTechnicalDetailsModal = () => this.setState({ showTechnicalDetailsModal: false });
    openSubscribersModal = () => this.setState({ showSubscribersModal: true });
    closeSubscribersModal = () => this.setState({ showSubscribersModal: false });

    renderStatusChip = (status) => {
        if (!status) return null;
        let color = 'default';
        if (
            status.includes('Aprovado') ||
            status.includes('Sancionado')
        ) {
            color = 'success';
        }
        if (
            status.includes('Rejeitado') ||
            status.includes('Arquivado')
        ) {
            color = 'error';
        }
        if (
            status.includes('Tramitando') ||
            status.includes('Pendente')
        ) {
            color = 'warning';
        }
        return (
            <Chip
                label={status}
                color={color}
                size='small'
                sx={{
                    fontWeight: 700,
                    height: '26px'
                }}
            />
        );
    };

    render() {
        const {
            materia,
            loading,
            showPdfPopup,
            pdfData,
            showTechnicalDetailsModal,
            showSubscribersModal,
            showTextoModal
        } = this.state;
        if (loading) {
            return (
                <div
                    className='App-header-modern'
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <FaSpinner
                        className='animate-spin'
                        size={36}
                        color='#126B5E'
                    />
                </div>
            );
        }
        if (!materia) {
            return (
                <div
                    className='App-header-modern'
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '15px'
                    }}
                >
                    <p>Matéria não encontrada.</p>
                    <Link
                        to={`/materias/${this.state.camaraId}`}
                        className='btn-apple-pill btn-apple-pill-full'
                        style={{ textDecoration: 'none' }}
                    >
                        Voltar
                    </Link>
                </div>
            );
        }

        const numeroFormatted =
            (materia.numero && String(materia.numero).includes('/'))
                ? materia.numero
                : `${materia.numero || ''}/${materia.ano || ''}`;

        const dataApresentacao =
            materia.dataApresenta ||
            (
                materia.createdAt
                    ? new Date(materia.createdAt).toLocaleDateString('pt-BR')
                    : '-'
            );
        return (
            <div className='App-header-modern'>
                <div
                    className='home-content-wrapper'
                    style={{
                        maxWidth: '1450px',
                        margin: '0 auto',
                        padding: '12px',
                        minHeight: '100vh'
                    }}
                >
                    {/* VOLTAR */}
                    <div style={{ marginBottom: '10px' }}>
                        
                    </div>

                    {/* GRID PRINCIPAL */}
                    <div className='materia-grid-layout'>
                        {/* ESQUERDA */}
                        <div
                            className='materia-left-column'
                        >
                            {/* HEADER */}
                            <div
                                className='glass-card-clean materia-header-card'
                            >
                                <div>
                                    <div
                                        className='materia-header-chips'
                                    >
                                        <Chip
                                            label={`${materia.tipoMateria || 'Matéria'} Nº ${numeroFormatted}`}
                                            size='small'
                                        />

                                        {this.renderStatusChip(materia.status)}
                                        {
                                            materia.materiaPolemica === 'Sim' && (
                                                <Chip
                                                    label='Polêmica'
                                                    size='small'
                                                    color='warning'
                                                />
                                            )
                                        }
                                        {
                                            materia.isComplementar === 'Sim' && (
                                                <Chip
                                                    label='Complementar'
                                                    size='small'
                                                    color='primary'
                                                />
                                            )
                                        }
                                    </div>
                                    <h1 className='materia-title'>
                                        {materia.titulo || 'Sem título'}
                                    </h1>
                                    <div className='materia-object-section'
                                >
                                    <div>
                                        <div className='mini-info-label'>
                                            Objeto
                                        </div>

                                        <div className='mini-info-value'>
                                            {materia.objeto}
                                        </div>
                                    </div>
                                </div>
                                </div>

                                {/* INFO GRID */}
                                <div className='materia-info-grid'
                                >
                                    <div>
                                        <div className='mini-info-label'>
                                            Autor
                                        </div>

                                        <div className='mini-info-value'>
                                            <FaUser color='#126B5E' />
                                            {materia.autor || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='mini-info-label'>
                                            Apresentação
                                        </div>

                                        <div className='mini-info-value'>
                                            <FaCalendarAlt color='#126B5E' />
                                            {dataApresentacao}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='mini-info-label'>
                                            Protocolo
                                        </div>

                                        <div className='mini-info-value'>
                                            <FaFileSignature color='#126B5E' />
                                            {materia.protocolo}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='mini-info-label'>
                                            Tramitação
                                        </div>

                                        <div className='mini-info-value'>
                                            <FaBalanceScale color='#126B5E' />
                                            {materia.regTramita || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EMENTA */}
                            <div
                                className='glass-card-clean materia-ementa-card'
                            >
                                <div
                                    className='materia-section-title-wrapper'
                                >
                                    <FaFileAlt color='#126B5E' />
                                    <h3 className='materia-section-title'>
                                        Ementa
                                    </h3>
                                </div>
                                <div
                                    className='materia-ementa-content'
                                >
                                    {materia.ementa || 'Sem ementa cadastrada.'}
                                </div>
                            </div>
                        </div>

                        {/* DIREITA */}
                        <div className='materia-right-column'
                        >
                            {/* INFO EXTRA */}
                            {/* AÇÕES */}
                            <div
                                className='glass-card-clean materia-actions-card'
                            >
                                <div
                                    className='materia-action-buttons-group'
                                >
                                    {
                                        materia.pdfUrl && (
                                            <button
                                                className='btn-apple-pill btn-apple-pill-full'
                                                onClick={() => this.openPdf(materia.pdfUrl)}
                                            >
                                                <FaFilePdf />
                                                Documento Oficial
                                            </button>
                                        )
                                    }

                                    {
                                        materia.parecerPdfUrl && (
                                            <button
                                                className='btn-apple-pill btn-apple-pill-full'
                                                onClick={() => this.openPdf(materia.parecerPdfUrl)}
                                                style={{ background: '#FFF3E0', color: '#E65100' }}
                                            >
                                                <FaGavel />
                                                Parecer Jurídico
                                            </button>
                                        )
                                    }

                                    {
                                        materia.textoMateria && (
                                            <button
                                                className='btn-apple-pill btn-apple-pill-full'
                                                onClick={() => this.setState({ showTextoModal: true })}
                                            >
                                                <FaFileAlt />
                                                Texto Integral
                                            </button>
                                        )
                                    }

                                    {
                                        materia.subscricoes?.length > 0 && (
                                            <button
                                                className='btn-apple-pill btn-apple-pill-full'
                                                onClick={() => this.setState({ showSubscribersModal: true })}
                                            >
                                                <FaUsers />
                                                Subscrições
                                            </button>
                                        )
                                    }

                                    <button
                                        className='btn-apple-pill btn-apple-pill-full'
                                        onClick={() => this.setState({ showTechnicalDetailsModal: true })}
                                    >
                                        <FaInfoCircle />
                                        Informações Técnicas
                                    </button>

                                </div>

                            </div>
                        </div> {/* Fecha materia-right-column */}
                    </div> {/* Fecha materia-grid-layout */}

                    {/* FOOTER */}

                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '18px',
                            color: '#888',
                            fontSize: '0.8rem'
                        }}
                    >
                        Documento digital gerado pela plataforma Camara AI.
                    </div>

                </div>

                {/* PDF */}

                <Modal
                    open={showPdfPopup}
                    onClose={this.closePdfPopup}
                >
                    <Box
                        className='pdf-modal-box'
                    >
                        <div
                            className='pdf-modal-header'
                        >
                            <strong>Documento PDF</strong>
                            <button
                                onClick={this.closePdfPopup}
                                className='modal-close-button'
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <iframe
                            title='PDF'
                            src={pdfData}
                            width='100%'
                            height='100%'
                            className='pdf-modal-iframe'
                        />
                    </Box>
                </Modal>

                {/* TEXTO */}
                <Modal
                    open={showTextoModal}
                    onClose={() => this.setState({ showTextoModal: false })}
                >
                    <Box
                        className='text-modal-box'
                    >
                        <div
                            className='modal-header-clean'
                        >
                            <h3 style={{ margin: 0 }}>
                                Texto Integral
                            </h3>
                            <button
                                onClick={() => this.setState({ showTextoModal: false })}
                                className='modal-close-button'
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div
                            className='text-modal-content'
                            dangerouslySetInnerHTML={{
                                __html: this.decodeHtml(materia.textoMateria)
                            }}
                        />
                    </Box>
                </Modal>

                {/* SUBSCRIÇÕES */}
                <Modal
                    open={showSubscribersModal}
                    onClose={() => this.setState({ showSubscribersModal: false })}
                >
                    <Box
                        className='subscribers-modal-box'
                    >
                        <div
                            className='modal-header-clean'
                        >
                            <h3 style={{ margin: 0 }}>
                                Subscrições
                            </h3>
                            <button
                                onClick={() => this.setState({ showSubscribersModal: false })}
                                className='modal-close-button'
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div
                            className='subscribers-grid'
                        >
                            {
                                materia.subscricoes.map((sub, index) => (
                                    <div
                                        key={index}
                                        className='subscriber-card'
                                    >
                                        <img
                                            src={sub.foto}
                                            alt='avatar'
                                            className='subscriber-image'
                                        />
                                        <div
                                            className='subscriber-name'
                                        >
                                            {sub.nome || sub.name || '-'}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </Box>
                </Modal>

                {/* DETALHES */}
                <Modal
                    open={showTechnicalDetailsModal}
                    onClose={() => this.setState({ showTechnicalDetailsModal: false })}
                >
                    <Box
                        className='technical-details-modal-box'
                    >
                        <div
                            className='modal-header-clean'
                        >
                            <h3 style={{ margin: 0 }}>
                                Informações Técnicas
                            </h3>
                            <button
                                onClick={() => this.setState({ showTechnicalDetailsModal: false })}
                                className='modal-close-button'
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div
                            className='technical-details-grid'
                        >
                            <div>
                                <div className='mini-info-label'>
                                    ID Externo
                                </div>

                                <div className='mini-info-value'>
                                    {materia.externalId || '-'}
                                </div>
                            </div>
                            <div>
                                <div className='mini-info-label'>
                                    Apelido
                                </div>

                                <div className='mini-info-value'>
                                    {materia.apelido}
                                </div>
                            </div>
                            <div>
                                <div className='mini-info-label'>
                                    Indexação
                                </div>

                                <div className='mini-info-value'>
                                    {materia.indexacao}
                                </div>
                            </div>
                            <div>
                                <div className='mini-info-label'>
                                    Observação
                                </div>

                                <div className='mini-info-value'>
                                    {materia.observacao}
                                </div>
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>
        );
    }
}

export default MateriaDetalhesPublico;
