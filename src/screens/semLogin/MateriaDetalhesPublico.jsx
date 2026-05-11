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
                        to='/materias'
                        className='btn-apple-pill'
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

                <style>
                    {`
                        .materia-grid-layout{
                            display:grid;
                            grid-template-columns: 2fr 1fr;
                            gap:12px;
                            align-items:start;
                            width: 93%;
                            margin: 0 auto;
                        }

                        .glass-card-clean{
                            background:#fff;
                            border-radius:16px;
                            border:1px solid rgba(0,0,0,0.06);
                            box-shadow:0 2px 10px rgba(0,0,0,0.03);
                        }

                        .mini-info-label{
                            font-size:0.72rem;
                            color:#888;
                            margin-bottom:2px;
                            text-align:left;
                        }

                        .mini-info-value{
                            font-size:0.92rem;
                            font-weight:600;
                            color:#222;
                            display:flex;
                            align-items:center;
                            gap:6px;
                        }

                        @media(max-width: 900px){

                            .materia-grid-layout{
                                grid-template-columns:1fr !important;
                            }

                            .materia-right-column{
                                position:relative !important;
                                top:unset !important;
                            }

                        }
                    `}
                </style>

                <div
                    className='home-content-wrapper'
                    style={{
                        maxWidth: '1450px',
                        margin: '0 auto',
                        padding: '12px',
                        minHeight: '100vh',
                    }}
                >

                    {/* VOLTAR */}

                    <div style={{ marginBottom: '10px' }}>

                       

                    </div>

                    {/* GRID PRINCIPAL */}

                    <div className='materia-grid-layout'>

                        {/* ESQUERDA */}

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                minWidth: 0
                            }}
                        >

                            {/* HEADER */}

                            <div
                                className='glass-card-clean'
                                style={{
                                    padding: '14px',
                                    borderLeft: '4px solid #126B5E',
                                    minHeight: '220px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                            >

                                <div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            flexWrap: 'wrap',
                                            marginBottom: '10px'
                                        }}
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

                                    <h1
                                        style={{
                                            margin: 0,
                                            fontSize: '1.45rem',
                                            lineHeight: '1.4',
                                            color: '#222'
                                        }}
                                    >
                                        {materia.titulo || 'Sem título'}
                                    </h1>

                                </div>

                                {/* INFO GRID */}

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '12px',
                                        marginTop: '18px'
                                    }}
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
                                className='glass-card-clean'
                                style={{
                                    padding: '14px',
                                    flex: 1
                                }}
                            >

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '10px'
                                    }}
                                >

                                    <FaFileAlt color='#126B5E' />

                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Ementa
                                    </h3>

                                </div>

                                <div
                                    style={{
                                        background: '#f8f9fb',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        lineHeight: '1.45',
                                        color: '#444',
                                        fontSize: '0.95rem',
                                        borderLeft: '4px solid #ddd'
                                    }}
                                >
                                    {materia.ementa || 'Sem ementa cadastrada.'}
                                </div>

                            </div>

                        </div>

                        {/* DIREITA */}

                        <div
                            className='materia-right-column'
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                position: 'sticky',
                                top: '10px',
                                height: 'fit-content'
                            }}
                        >

                            {/* INFO EXTRA */}

                            <div
                                className='glass-card-clean'
                                style={{
                                    padding: '14px'
                                }}
                            >

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}
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

                            {/* AÇÕES */}

                            <div
                                className='glass-card-clean'
                                style={{
                                    padding: '24px',
                                    marginTop: '12px'
                                }}
                            >

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}
                                >

                                    {
                                        materia.pdfUrl && (
                                            <button
                                                className='btn-apple-pill'
                                                onClick={() => this.openPdf(materia.pdfUrl)}
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <FaFilePdf />
                                                Documento Oficial
                                            </button>
                                        )
                                    }

                                    {
                                        materia.parecerPdfUrl && (
                                            <button
                                                className='btn-apple-pill'
                                                onClick={() => this.openPdf(materia.parecerPdfUrl)}
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    background: '#FFF3E0',
                                                    color: '#E65100'
                                                }}
                                            >
                                                <FaGavel />
                                                Parecer Jurídico
                                            </button>
                                        )
                                    }

                                    {
                                        materia.textoMateria && (
                                            <button
                                                className='btn-apple-pill'
                                                onClick={() => this.setState({ showTextoModal: true })}
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <FaFileAlt />
                                                Texto Integral
                                            </button>
                                        )
                                    }

                                    {
                                        materia.subscricoes?.length > 0 && (
                                            <button
                                                className='btn-apple-pill'
                                                onClick={() => this.setState({ showSubscribersModal: true })}
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <FaUsers />
                                                Subscrições
                                            </button>
                                        )
                                    }

                                    <button
                                        className='btn-apple-pill'
                                        onClick={() => this.setState({ showTechnicalDetailsModal: true })}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <FaInfoCircle />
                                        Informações Técnicas
                                    </button>

                                </div>

                            </div>

                            

                            </div>

                        </div>

                    </div>

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
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '96%',
                            height: '96%',
                            bgcolor: '#fff',
                            borderRadius: '14px',
                            overflow: 'hidden'
                        }}
                    >

                        <div
                            style={{
                                height: '55px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 15px',
                                borderBottom: '1px solid #eee'
                            }}
                        >

                            <strong>Documento PDF</strong>

                            <button
                                onClick={this.closePdfPopup}
                                style={{
                                    border: 0,
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaTimes size={20} />
                            </button>

                        </div>

                        <iframe
                            title='PDF'
                            src={pdfData}
                            width='100%'
                            height='100%'
                            style={{ border: 0 }}
                        />

                    </Box>

                </Modal>

                {/* TEXTO */}

                <Modal
                    open={showTextoModal}
                    onClose={() => this.setState({ showTextoModal: false })}
                >

                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: {
                                xs: '96%',
                                md: '80%'
                            },
                            maxHeight: '90vh',
                            overflow: 'auto',
                            bgcolor: '#fff',
                            borderRadius: '16px',
                            p: 2
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}
                        >

                            <h3 style={{ margin: 0 }}>
                                Texto Integral
                            </h3>

                            <button
                                onClick={() => this.setState({ showTextoModal: false })}
                                style={{
                                    border: 0,
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div
                            style={{
                                lineHeight: '1.8',
                                color: '#333',
                                fontSize: '0.95rem',
                                textAlign: 'justify'
                            }}
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
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: {
                                xs: '95%',
                                md: '650px'
                            },
                            bgcolor: '#fff',
                            borderRadius: '16px',
                            p: 2
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '18px'
                            }}
                        >

                            <h3 style={{ margin: 0 }}>
                                Subscrições
                            </h3>

                            <button
                                onClick={() => this.setState({ showSubscribersModal: false })}
                                style={{
                                    border: 0,
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '12px'
                            }}
                        >

                            {
                                materia.subscricoes.map((sub, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid #eee',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            textAlign: 'center'
                                        }}
                                    >

                                        <img
                                            src={sub.foto}
                                            alt='avatar'
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />

                                        <div
                                            style={{
                                                marginTop: '10px',
                                                fontWeight: 700
                                            }}
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
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: {
                                xs: '95%',
                                md: '720px'
                            },
                            maxHeight: '90vh',
                            overflow: 'auto',
                            bgcolor: '#fff',
                            borderRadius: '16px',
                            p: 2
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}
                        >

                            <h3 style={{ margin: 0 }}>
                                Informações Técnicas
                            </h3>

                            <button
                                onClick={() => this.setState({ showTechnicalDetailsModal: false })}
                                style={{
                                    border: 0,
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '14px'
                            }}
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
