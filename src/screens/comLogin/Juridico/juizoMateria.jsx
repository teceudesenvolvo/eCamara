import React, { Component } from 'react';
import { FaGavel, FaSearch, FaTimes, FaCheckCircle, FaBalanceScale, FaTimesCircle, FaExclamationTriangle, FaPenFancy, FaMagic, FaFileAlt, FaEye, FaSpinner, FaHistory, FaUserTie, FaCalendarAlt, FaExchangeAlt, FaRobot, FaPaperPlane, FaEdit } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MenuDashboard from '../../../componets/menuAdmin.jsx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from '../../../assets/logo.png';
import LogoIcon from '../../../assets/logo-camaraai-icon.png';
import { generateParecer, sendMessageToAIPrivate } from '../../../aiService';
import api from '../../../services/api';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
    TextField
} from '@mui/material';

pdfMake.vfs = pdfFonts.vfs;

class JuizoMateria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            filterStatus: 'Todos',
            filterType: 'Todos',
            filterYear: 'Todos',
            selectedMateria: null,
            decisao: 'favoravel',
            analiseConstitucional: '',
            analiseTecnica: '',
            analiseLocal: '',
            parecerText: '',
            logoBase64: null,
            camaraAILogoBase64: null,
            isGeneratingParecer: false,
            materias: [],
            loading: true,
            camaraId: this.props.match.params.camaraId,
            homeConfig: {},
            councilName: '',
            baseConhecimento: {},
            footerConfig: {},
            viewingMateria: null,
            showDetailModal: false,
            showPdfPopup: false,
            pdfData: null,
            // Estado da IA
            showAiChat: false,
            messages: [
                { id: 1, sender: 'ai', text: 'Olá! Sou o Assistente Jurídico do e-Câmara. <br/>Estou pronto para ajudar na análise técnica e redação do seu parecer. Qual ponto deseja analisar primeiro?' }
            ],
            currentInput: '',
            isGenerating: false,
        };
        this.messagesEndRef = React.createRef();
        this.chatContainerRef = React.createRef();
    }

    modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'align'
    ];

    componentDidMount() {

        const camaraId = this.props.match.params.camaraId;

        this.setState({ camaraId });
        this.fetchConfigsAndLogo();
        this.fetchMaterias(camaraId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.messages.length !== this.state.messages.length) {
            this.scrollToBottom();
        }
    }

    fetchMaterias = async (camaraId) => {
        this.setState({ loading: true });
        try {
            const response = await api.get(`/legislative-matters/${camaraId}`);
            const materias = response.data || [];
            
            // Ordenar por mais recentes
            materias.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.setState({ materias, loading: false });
        } catch (error) {
            console.error("Erro ao buscar matérias para parecer:", error);
            this.setState({ loading: false });
        }
    };

    fetchConfigsAndLogo = async () => {
        const { camaraId } = this.state;
        try {
            const response = await api.get(`/councils/${camaraId}`);
            // Extração robusta dos dados da câmara lidando com possíveis retornos em array
            const councilData = Array.isArray(response.data) ? response.data[0] : (response.data || {});
            const councilName = councilData.name || ''; // Usa o nome institucional
            const configData = councilData.config || councilData.dadosConfig || {};

            let logoB64 = null;
            if (configData.layout?.logoLight) {
                logoB64 = await this.getBase64(configData.layout.logoLight);
            } else {
                logoB64 = await this.getBase64(logo);
            }

            // Carrega a logo da CâmaraAI para o bloco de assinatura
            const camaraAILogoB64 = await this.getBase64(LogoIcon);

            this.setState({
                logoBase64: logoB64,
                camaraAILogoBase64: camaraAILogoB64,
                homeConfig: configData.home || {},
                councilName,
                footerConfig: configData.footer || {},
                baseConhecimento: configData["base-conhecimento"] || {},
            });
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        }
    };

    scrollToBottom = () => {
        if (this.chatContainerRef.current) {
            this.chatContainerRef.current.scrollTop = this.chatContainerRef.current.scrollHeight;
        }
    }

    toggleAiChat = () => {
        this.setState({ showAiChat: !this.state.showAiChat });
    };

    handleOpenParecer = (materia) => {
        this.setState({ 
            selectedMateria: materia, 
            parecerText: '', 
            decisao: 'favoravel',
            analiseConstitucional: '',
            analiseTecnica: '',
            analiseLocal: ''
        });
    };

    // Processa o HTML do editor para criar parágrafos formatados no PDF
    processHtmlToPdfMake = (html) => {
        if (!html) return [{ text: "Não foi fornecida fundamentação.", style: 'bodyText' }];
        const paragraphs = html.split(/<\/p>/gi);

        return paragraphs.map(p => {
            let text = p.replace(/<br\s*\/?>/gi, '\n');
            text = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            if (!text) return null;
            return {
                text: text,
                style: 'bodyText'
            };
        }).filter(Boolean);
    };

    handleSendMessage = async () => {
        const { currentInput, messages, selectedMateria, baseConhecimento, camaraId } = this.state;
        if (!currentInput.trim() || !selectedMateria) return;

        const userMessage = { id: Date.now(), sender: 'user', text: currentInput };
        this.setState({
            messages: [...messages, userMessage],
            currentInput: '',
            isGenerating: true
        });

        try {
            const { regimentoText, leiOrganicaText } = baseConhecimento;

            const prompt = `Atue como um Consultor Jurídico Sênior de Direito Municipal.
            
            CONTEXTO DA MATÉRIA EM ANÁLISE:
            - Tipo: ${selectedMateria.tipoMateria}
            - Número: ${selectedMateria.numero}
            - Decisão Alvo: ${this.state.decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário'}
            - Ementa: "${selectedMateria.ementa}"
            - Autor: ${selectedMateria.autor}

            CONHECIMENTO TÉCNICO:
            - Regimento Interno: ${regimentoText ? regimentoText.substring(0, 3000) : 'Seguir normas padrão'}
            - Lei Orgânica: ${leiOrganicaText ? leiOrganicaText.substring(0, 3000) : 'Seguir normas padrão'}

            TAREFA:
            Responda à seguinte solicitação do procurador: "${currentInput}".
            Use linguagem jurídica formal, cite artigos se o contexto permitir e foque na constitucionalidade e legalidade.
            Ao sugerir trechos de redação, utilize a decisão alvo como base e use parágrafos HTML (<p>).`;

            const response = await sendMessageToAIPrivate(prompt, camaraId);

            this.setState(prevState => ({
                messages: [...prevState.messages, { id: Date.now() + 1, sender: 'ai', text: response }],
                isGenerating: false
            }));

        } catch (error) {
            console.error("Erro no chat IA Jurídico:", error);
            this.setState(prevState => ({
                messages: [...prevState.messages, { id: Date.now() + 1, sender: 'ai', text: "Desculpe, ocorreu um erro ao processar sua análise jurídica." }],
                isGenerating: false
            }));
        }
    };

    handleGenerateParecerWithAI = async () => {
        const { selectedMateria, camaraId, baseConhecimento, analiseConstitucional, analiseTecnica, analiseLocal } = this.state;
        if (!selectedMateria) return;

        this.setState({ isGeneratingParecer: true, parecerText: '' });

        const { regimentoText, leiOrganicaText } = baseConhecimento;

        const prompt = `Atue como um Procurador Jurídico experiente da Câmara Municipal. Elabore um parecer técnico-jurídico completo sobre o(a) ${selectedMateria.tipoMateria} nº ${selectedMateria.numero}.
        
        SUA CONCLUSÃO DEVE SER: ${this.state.decisao === 'favoravel' ? 'CONSTITUCIONALIDADE E LEGALIDADE (Favorável)' : 'INCONSTITUCIONALIDADE E ILEGALIDADE (Contrário)'}.
        
        ORIENTAÇÕES ESPECÍFICAS DO PROCURADOR PARA ESTE PARECER:
        - Foco em Constitucionalidade/Legalidade: ${analiseConstitucional || 'Análise geral de competência e iniciativa.'}
        - Observações de Técnica Legislativa: ${analiseTecnica || 'Verificar conformidade com a LC 95/98.'}
        - Notas sobre Legislação Local/Mérito: ${analiseLocal || 'Analisar compatibilidade com a Lei Orgânica Municipal.'}

        BASE LEGAL LOCAL:
        - Regimento Interno: ${regimentoText ? regimentoText.substring(0, 2000) : 'Seguir normas padrão'}
        - Lei Orgânica: ${leiOrganicaText ? leiOrganicaText.substring(0, 2000) : 'Seguir normas padrão'}

        DADOS DA MATÉRIA:
        - Autor: ${selectedMateria.autor}
        - Ementa: "${selectedMateria.ementa}"

        O parecer DEVE conter:
        1. ANÁLISE DA COMPETÊNCIA (Se a matéria é de interesse local).
        2. ANÁLISE DO VÍCIO DE INICIATIVA (Se o proponente tem poder para tal).
        3. TÉCNICA LEGISLATIVA (Conformidade com a LC 95/98).
        4. CONCLUSÃO FUNDAMENTADA.
        
        IMPORTANTE: A argumentação jurídica deve sustentar obrigatoriamente a decisão informada (${this.state.decisao}).
        Responda em formato HTML utilizando as tags <p>, <strong> e <br> para uma fundamentação técnica profissional.`;

        try {
            const response = await sendMessageToAIPrivate(prompt, camaraId);
            
            // Adiciona ao chat também para o usuário poder ajustar
            const aiMessage = { 
                id: Date.now(), 
                sender: 'ai', 
                text: 'Gerei uma minuta completa do parecer baseada na legislação local. O texto já foi aplicado ao formulário para sua revisão.' 
            };

            this.setState({ 
                parecerText: response, 
                isGeneratingParecer: false,
                messages: [...this.state.messages, aiMessage]
            });
        } catch (error) {
            console.error("Erro na IA:", error);
            this.setState({ parecerText: "Erro ao gerar parecer. Tente novamente.", isGeneratingParecer: false });
        }
    };

    handleViewDetail = (materia) => {
        this.setState({ viewingMateria: materia, showDetailModal: true });
    };

    handleCloseDetail = () => {
        this.setState({ viewingMateria: null, showDetailModal: false });
    };

    handleCloseParecer = () => {
        this.setState({ selectedMateria: null });
    };

    closePdfPopup = () => {
        this.setState({ showPdfPopup: false, pdfData: null });
    };

    getBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return null;
        }
    };

    // Gera o blob do PDF do parecer para uso local ou upload
    generateParecerPDFBlob = (materia, parecerText, decisao, signatureMetadata) => {
        return new Promise((resolve) => {
            const docDefinition = this.getDocDefinition(materia, parecerText, decisao, signatureMetadata);
            pdfMake.createPdf(docDefinition).getBlob((blob) => {
                resolve(blob);
            });
        });
    };

    // Gera Base64 localmente (apenas para visualização no popup)
    generateParecerPDFBase64 = (materia, parecerText, decisao, signatureMetadata) => {
        return new Promise((resolve) => {
            const docDefinition = this.getDocDefinition(materia, parecerText, decisao, signatureMetadata);
            pdfMake.createPdf(docDefinition).getBase64((data) => {
                resolve(data);
            });
        });
    };

    handleSubmitParecer = async (decisao) => {
        const { selectedMateria, parecerText, camaraId } = this.state;
        if (!selectedMateria) return;

        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        // Coleta de dados de segurança (IP)
        const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => ({ json: () => ({ ip: '0.0.0.0' }) }));
        const ipData = await ipRes.json();

        const signatureMetadata = {
            nome: user.name || 'Procurador',
            email: user.email,
            timestamp: new Date().toISOString(),
            ip: ipData.ip,
            hash: btoa((parecerText || '').substring(0, 50)) // Hash simplificado para o verificador
        };

        // Gerar blob para upload e Base64 para preview local
        const [pdfBlob, pdfBase64] = await Promise.all([
            this.generateParecerPDFBlob(selectedMateria, parecerText, decisao, signatureMetadata),
            this.generateParecerPDFBase64(selectedMateria, parecerText, decisao, signatureMetadata)
        ]);

        // Upload do PDF para o Supabase via endpoint genérico
        let parecerPdfUrl = null;
        try {
            const formData = new FormData();
            formData.append('file', pdfBlob, `parecer_${selectedMateria.protocolo || selectedMateria.id}.pdf`);
            formData.append('slug', camaraId);
            formData.append('userId', user.id || 'anonymous');
            formData.append('ref', `parecer_${selectedMateria.id}`);
            const uploadResponse = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            parecerPdfUrl = uploadResponse.data.url;
            console.log('[Upload] Parecer PDF URL:', parecerPdfUrl);
        } catch (uploadError) {
            console.warn('[Upload] Falha no upload do parecer. Continuando sem URL:', uploadError);
        }

        const newStatus = decisao === 'favoravel' ? 'Parecer Favorável' : 'Parecer Contrário';
        const parecerUpdateData = {
            status: newStatus,
            parecer: parecerText || "Não foi fornecida fundamentação.",
            decisao: decisao,
            parecerDate: new Date().toISOString(),
            parecerPdfUrl: parecerPdfUrl, // Salva URL, não Base64
            parecerSignatureMetadata: signatureMetadata
        };

        try {
            await api.patch(`/legislative-matters/id/${selectedMateria.id}`, parecerUpdateData);
            this.setState(prevState => ({
                materias: prevState.materias.map(m => m.id === selectedMateria.id ? { ...m, ...parecerUpdateData } : m),
                pdfData: pdfBase64, // Preview local
                showPdfPopup: true,
                selectedMateria: null
            }));
        } catch (error) {
            console.error("Erro ao salvar parecer:", error);
            alert("Ocorreu um erro ao salvar o parecer. Tente novamente.");
        }
    };

    getDocDefinition = (materia, parecerText, decisao, signatureMetadata = null) => {
        const { logoBase64, homeConfig, footerConfig, camaraId, councilName, camaraAILogoBase64 } = this.state;
        const dataAtual = new Date().toLocaleDateString('pt-BR');

        const cityName = homeConfig.cidade || councilName || camaraId;
        const footerText = `📍 ${footerConfig.address || ''} | 📞 ${footerConfig.phone || ''}\n📧 ${footerConfig.email || ''}\n${footerConfig.copyright || ''}`;

        return {
            content: [
                logoBase64 ? { 
                    image: logoBase64, 
                    width: 70, 
                    absolutePosition: { x: 480, y: 35 } 
                } : null,
                { text: councilName || homeConfig.titulo || 'Câmara Municipal', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
                { text: 'Procuradoria Jurídica', style: 'subheader', alignment: 'center', marginBottom: 30 },

                { text: 'PARECER JURÍDICO', style: 'title', alignment: 'center' },

                {
                    style: 'infoBox',
                    table: {
                        widths: ['*'],
                        body: [
                            [[
                                { text: `Matéria: ${materia.tipo} nº ${materia.numero}`, style: 'infoText' },
                                { text: `Ementa: ${materia.ementa}`, style: 'infoText' },
                                { text: `Autor: ${materia.autor}`, style: 'infoText' },
                            ]]
                        ]
                    },
                    layout: {
                        hLineWidth: () => 1, vLineWidth: () => 1,
                        hLineColor: () => '#ccc', vLineColor: () => '#ccc',
                    }
                },

                { text: 'I - RELATÓRIO', style: 'sectionHeader' },
                { text: `Trata-se de análise jurídica do ${materia.tipo} nº ${materia.numero}, de autoria do(a) ${materia.autor}, que visa a dispor sobre "${materia.ementa}". A matéria foi encaminhada a esta Procuradoria para verificação de sua constitucionalidade e legalidade.`, style: 'bodyText' },

                { text: 'II - ANÁLISE JURÍDICA', style: 'sectionHeader' },
                { stack: this.processHtmlToPdfMake(parecerText), marginTop: 5, marginBottom: 10 },

                { text: 'III - CONCLUSÃO', style: 'sectionHeader' },
                { text: ['Diante do exposto, esta Procuradoria Jurídica opina pela ', { text: decisao === 'favoravel' ? 'CONSTITUCIONALIDADE e LEGALIDADE' : 'INCONSTITUCIONALIDADE e ILEGALIDADE', bold: true }, ' da proposição, nos termos da análise apresentada.'], style: 'bodyText' },

                { text: `\n\n${cityName}, ${dataAtual}.`, style: 'bodyText', alignment: 'right' },

                { text: '\n\n\n\n________________________________', style: 'signature', alignment: 'center' },
                { text: 'Procurador Jurídico', style: 'signatureName', alignment: 'center' },
                { text: 'OAB/XX 123.456', style: 'signatureOAB', alignment: 'center' },

                // 🔥 🔐 ASSINATURA DIGITAL (SEM CAIXA)
                signatureMetadata && {
                    columns: [
                        camaraAILogoBase64
                            ? {
                                image: camaraAILogoBase64,
                                width: 50
                            }
                            : { text: '' },

                        {
                            width: '*',
                            stack: [
                                {
                                    text: 'Documento assinado digitalmente',
                                    style: 'signatureHeader'
                                },
                                {
                                    text: (signatureMetadata.nome || '').toUpperCase(),
                                    style: 'signatureName'
                                },
                                {
                                    text: `Data: ${new Date(signatureMetadata.timestamp).toLocaleString('pt-BR')}`,
                                    style: 'signatureDetail'
                                },
                                {
                                    text: `IP: ${signatureMetadata.ip}`,
                                    style: 'signatureDetail'
                                },
                                {
                                    text: 'Assinado via CâmaraAI',
                                    style: 'signatureAI'
                                },
                                {
                                    text: `Verifique em: https://verificador.camaraai.com/${signatureMetadata.hash}`,
                                    link: `https://verificador.camaraai.com/${signatureMetadata.hash}`,
                                    style: 'signatureLink'
                                }
                            ]
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 20, 0, 10]
                }
            ].filter(Boolean),
            footer: (currentPage, pageCount) => ({
                stack: [
                    { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: '#ccc' }] },
                    { text: footerText, style: 'footerStyle', alignment: 'center', margin: [0, 5, 0, 0] },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 40, 0] }
                ]
            }),
            styles: {
                header: { fontSize: 14, bold: true, color: '#333' },
                subheader: { fontSize: 13, color: '#126B5E', marginTop: 10 },
                title: { fontSize: 14, bold: true, marginBottom: 20 },
                infoBox: { margin: [0, 0, 0, 20] },
                infoText: { fontSize: 10, margin: [5, 2, 5, 2] },
                sectionHeader: { fontSize: 12, bold: true, marginTop: 15, marginBottom: 5 },
                bodyText: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 },
                signature: { fontSize: 11 },
                signatureOAB: { fontSize: 10, color: '#555' },
                footerStyle: { fontSize: 8, color: '#777', lineHeight: 1.3 },
                signatureHeader: {
                    fontSize: 8,
                    bold: true,
                    color: '#666'
                },
                signatureName: {
                    fontSize: 10,
                    bold: true,
                    color: '#000'
                },
                signatureDetail: {
                    fontSize: 8,
                    color: '#444'
                },
                signatureAI: {
                    fontSize: 8,
                    italics: true,
                    color: '#126B5E'
                },
                signatureLink: {
                    fontSize: 7,
                    color: '#0066cc'
                }
            }
        };
    };

    openParecerPDF = (materia, parecerText, decisao) => {
        const docDefinition = this.getDocDefinition(materia, parecerText, decisao);
        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data, showPdfPopup: true });
        });
    };


    render() {
        const { searchTerm, filterStatus, filterType, filterYear, materias, selectedMateria, isGeneratingParecer, parecerText, loading, showDetailModal, viewingMateria, showPdfPopup, pdfData, showAiChat, messages, currentInput, isGenerating } = this.state;

        // Filtros
        const filteredMaterias = materias.filter(m => {
            const matchesSearch =
                (m.titulo && m.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.numero && m.numero.includes(searchTerm)) ||
                (m.autor && m.autor.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === 'Todos' || (m.status && m.status.includes(filterStatus));
            const matchesType = filterType === 'Todos' || m.tipoMateria === filterType;
            const matchesYear = filterYear === 'Todos' || m.ano === filterYear;

            return matchesSearch && matchesStatus && matchesType && matchesYear;
        });

        // Extrair anos únicos para o filtro
        const years = [...new Set(materias.map(m => m.ano))].filter(Boolean).sort((a, b) => b - a);

        // Contadores para os Cards de Stats
        const countAguardando = materias.filter(m => m.status && m.status.includes('Aguardando Parecer')).length;
        const countParecerEmitido = materias.filter(m => m.decisao || (m.status && m.status.includes('Parecer') && !m.status.includes('Aguardando'))).length;
        const countVotadas = materias.filter(m => m.status === 'votada' || m.status === 'Sancionado' || m.status === 'Despachado' || m.status === 'Arquivado').length;

        if (loading && materias.length === 0) {
            return <div className='App-header' style={{ justifyContent: 'center' }}><FaSpinner className="animate-spin" size={40} color="#126B5E" /></div>;
        }

        return (
            <div className='App-header' style={{ alignItems: 'flex-start', flexDirection: 'row', background: '#f0f2f5' }}>
                <MenuDashboard />

                <div className="dashboard-content">

                    {selectedMateria ? (
                        // --- PÁGINA DE PARECER (Substitui o Modal) ---
                        <div className="dashboard-card" style={{ width: '95%', transition: '0.3s', margin: '0 auto' }}>
                            <div className="dashboard-header" style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaGavel /> Emitir Parecer Jurídico
                                    </h2>
                                    <p style={{ color: '#666', margin: '5px 0 0 0' }}>Análise de constitucionalidade e legalidade.</p>
                                </div>
                                <button onClick={this.handleCloseParecer} className="btn-secondary">
                                    Cancelar
                                </button>
                            </div>

                            {/* Detalhes da Matéria */}
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #126B5E' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Matéria</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{selectedMateria.tipoMateria} {selectedMateria.numero}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Autor</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{selectedMateria.autor}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Ementa</p>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#444' }}>"{selectedMateria.ementa}"</p>
                                </div>
                            </div>

                            {/* Formulário de Parecer Otimizado */}
                            <Grid container spacing={4}>
                                {/* Coluna de Parâmetros e Decisão */}
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ p: 3, borderRadius: '16px', border: '1px solid #eef2f6', backgroundColor: '#fff' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FaBalanceScale color="#126B5E" /> Parâmetros do Parecer
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Conclusão do Parecer</InputLabel>
                                                <Select
                                                    value={this.state.decisao}
                                                    onChange={(e) => this.setState({ decisao: e.target.value })}
                                                    label="Conclusão do Parecer"
                                                    sx={{ borderRadius: '10px' }}
                                                >
                                                    <MenuItem value="favoravel">Parecer Favorável</MenuItem>
                                                    <MenuItem value="contrario">Parecer Contrário</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                label="Pontos de Constitucionalidade"
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={this.state.analiseConstitucional}
                                                onChange={(e) => this.setState({ analiseConstitucional: e.target.value })}
                                                placeholder="Ex: Vício de iniciativa, invasão de competência..."
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />

                                            <TextField
                                                label="Notas de Técnica Legislativa"
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={this.state.analiseTecnica}
                                                onChange={(e) => this.setState({ analiseTecnica: e.target.value })}
                                                placeholder="Ex: Erro na numeração, ementa imprecisa..."
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />

                                            <TextField
                                                label="Legislação Local / Mérito"
                                                fullWidth
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={this.state.analiseLocal}
                                                onChange={(e) => this.setState({ analiseLocal: e.target.value })}
                                                placeholder="Ex: Contraria o Art. X da Lei Orgânica..."
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />

                                            <Divider sx={{ my: 1 }} />

                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 1.5 }}>Assistência Inteligente</Typography>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={isGeneratingParecer ? <CircularProgress size={20} color="inherit" /> : <FaMagic />}
                                                    onClick={this.handleGenerateParecerWithAI}
                                                    disabled={isGeneratingParecer}
                                                    sx={{ 
                                                        backgroundColor: '#126B5E', 
                                                        '&:hover': { backgroundColor: '#0e554a' },
                                                        borderRadius: '10px', 
                                                        textTransform: 'none',
                                                        py: 1
                                                    }}
                                                >
                                                    {isGeneratingParecer ? 'IA Redigindo...' : 'Gerar Minuta com IA'}
                                                </Button>
                                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#999', textAlign: 'center' }}>
                                                    A IA baseará a redação na conclusão selecionada acima.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Coluna de Redação Textual */}
                                <Grid item xs={12} md={8}>
                                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>Fundamentação Técnica e Jurídica</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => this.openParecerPDF(selectedMateria, parecerText, this.state.decisao)}
                                                className="btn-secondary"
                                                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                                            >
                                                <FaEye /> Preview PDF
                                            </button>
                                            <button
                                                onClick={() => this.handleViewDetail(selectedMateria)}
                                                className="btn-secondary"
                                                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                                            >
                                                <FaFileAlt /> Ver Original
                                            </button>
                                        </div>
                                    </div>
                                    <Box sx={{ border: '1px solid #d1d9e0', borderRadius: '12px', overflow: 'hidden', backgroundColor: isGeneratingParecer ? '#f8f9fa' : '#fff' }}>
                                        <ReactQuill
                                            theme="snow"
                                            value={parecerText}
                                            onChange={(content) => this.setState({ parecerText: content })}
                                            modules={this.modules}
                                            formats={this.formats}
                                            placeholder={isGeneratingParecer ? "Aguarde, a IA está elaborando uma sugestão de parecer..." : "Escreva ou gere a fundamentação jurídica do seu parecer..."}
                                            readOnly={isGeneratingParecer}
                                            style={{ height: '500px' }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Ações */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid #eee', pt: 3, mt: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => this.handleSubmitParecer(this.state.decisao)}
                                    disabled={!parecerText || isGeneratingParecer}
                                    sx={{ 
                                        backgroundColor: this.state.decisao === 'favoravel' ? '#2e7d32' : '#d32f2f',
                                        '&:hover': { backgroundColor: this.state.decisao === 'favoravel' ? '#1b5e20' : '#c62828' },
                                        borderRadius: '10px',
                                        px: 6,
                                        py: 1.5,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    startIcon={<FaCheckCircle />}
                                >
                                    Protocolar Parecer {this.state.decisao === 'favoravel' ? 'Favorável' : 'Contrário'}
                                </Button>
                            </Box>
                        </div>
                    ) : (
                        // --- LISTAGEM DE MATÉRIAS ---
                        <>
                            {/* Header */}
                            <div className="dashboard-header">
                                <div>
                                    <h1 className="dashboard-header-title">
                                        <FaGavel style={{ color: 'var(--primary-color)' }} /> Triagem e Pareceres
                                    </h1>
                                <p className="dashboard-header-desc">Gestão jurídica e legislativa das matérias em tramitação.</p>
                                </div>

                            </div>

                            {/* Stats Cards */}
                            <div className="dashboard-grid-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Aguardando Parecer</p>
                                        <h3 style={{ margin: '2px 0 0 0', color: '#f57c00', fontSize: '1.4rem' }}>{countAguardando}</h3>
                                    </div>
                                    <div style={{ width: '40px', height: '30px' }}>
                                        <svg width="40" height="30" viewBox="0 0 60 40">
                                            <rect x="0" y="20" width="8" height="20" fill="#f57c00" opacity="0.3" rx="2" />
                                            <rect x="12" y="10" width="8" height="30" fill="#f57c00" opacity="0.5" rx="2" />
                                            <rect x="24" y="25" width="8" height="15" fill="#f57c00" opacity="0.7" rx="2" />
                                            <rect x="36" y="5" width="8" height="35" fill="#f57c00" rx="2" />
                                            <rect x="48" y="15" width="8" height="25" fill="#f57c00" opacity="0.6" rx="2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Pareceres Emitidos</p>
                                        <h3 style={{ margin: '2px 0 0 0', color: '#126B5E', fontSize: '1.4rem' }}>{countParecerEmitido}</h3>
                                    </div>
                                    <div style={{ width: '40px', height: '30px' }}>
                                        <svg width="40" height="30" viewBox="0 0 60 40">
                                            <rect x="0" y="5" width="8" height="35" fill="#126B5E" opacity="0.3" rx="2" />
                                            <rect x="12" y="15" width="8" height="25" fill="#126B5E" opacity="0.5" rx="2" />
                                            <rect x="24" y="10" width="8" height="30" fill="#126B5E" opacity="0.7" rx="2" />
                                            <rect x="36" y="20" width="8" height="20" fill="#126B5E" rx="2" />
                                            <rect x="48" y="8" width="8" height="32" fill="#126B5E" opacity="0.6" rx="2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '15px' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>Matérias Votadas</p>
                                        <h3 style={{ margin: '2px 0 0 0', color: '#2e7d32', fontSize: '1.4rem' }}>{countVotadas}</h3>
                                    </div>
                                    <div style={{ width: '40px', height: '30px' }}>
                                        <svg width="40" height="30" viewBox="0 0 60 40">
                                            <path d="M0 35 L12 25 L24 30 L36 10 L48 20 L60 5" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Filtros e Busca Otimizados */}
                            <div className="dashboard-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '25px' }}>
                                <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                                        <FaSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por número, ementa ou autor..."
                                            value={searchTerm}
                                            onChange={(e) => this.setState({ searchTerm: e.target.value })}
                                            className="search-input"
                                            style={{ width: '100%', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', height: '45px' }}
                                        onClick={() => this.setState({ searchTerm: '', filterStatus: 'Todos', filterType: 'Todos', filterYear: 'Todos' })}
                                    >
                                        <FaTimes /> Limpar Filtros
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo de Matéria</label>
                                        <select
                                            value={filterType}
                                            onChange={(e) => this.setState({ filterType: e.target.value })}
                                            className="filter-select"
                                            style={{ width: '100%', margin: 0 }}
                                        >
                                            <option value="Todos">Todos os Tipos</option>
                                            <option value="requerimento">Requerimento</option>
                                            <option value="projeto de lei">Projeto de Lei</option>
                                            <option value="indicacao">Indicação</option>
                                            <option value="mocao">Moção</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status do Processo</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => this.setState({ filterStatus: e.target.value })}
                                            className="filter-select"
                                            style={{ width: '100%', margin: 0 }}
                                        >
                                            <option value="Todos">Todos os Status</option>
                                            <option value="Aguardando Parecer">Aguardando Parecer</option>
                                            <option value="Em Análise">Em Análise</option>
                                            <option value="Parecer Favorável">Parecer Favorável</option>
                                            <option value="Parecer Contrário">Parecer Contrário</option>
                                            <option value="votada">Votadas</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ano / Exercício</label>
                                        <select
                                            value={filterYear}
                                            onChange={(e) => this.setState({ filterYear: e.target.value })}
                                            className="filter-select"
                                            style={{ width: '100%', margin: 0 }}
                                        >
                                            <option value="Todos">Todos os Anos</option>
                                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Grid de Matérias (3 por linha) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                                {filteredMaterias.map((materia) => (
                                    <div key={materia.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderLeft: (materia.decisao === 'contrario') ? '5px solid #d32f2f' : (materia.decisao === 'favoravel' ? '5px solid #2e7d32' : '5px solid #f57c00') }}>
                                        <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#126B5E' }}>
                                                    <FaFileAlt size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.0rem' }}>{materia.tipoMateria} {materia.numero}</h3>
                                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Protocolo: {materia.protocolo}</span>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: materia.status === 'Aguardando Parecer' ? '#fff3e0' : (materia.decisao === 'favoravel' ? '#e8f5e9' : (materia.decisao === 'contrario' ? '#ffebee' : '#f5f5f5')),
                                                color: materia.status === 'Aguardando Parecer' ? '#ef6c00' : (materia.decisao === 'favoravel' ? '#2e7d32' : (materia.decisao === 'contrario' ? '#d32f2f' : '#666'))
                                            }}>
                                                {materia.status}
                                            </span>
                                        </div>

                                        <div style={{ padding: '20px', flex: 1 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                                    <FaUserTie style={{ color: '#aaa' }} />
                                                    <span><strong>Autor:</strong> {materia.autor}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '0.95rem' }}>
                                                    <FaCalendarAlt style={{ color: '#aaa' }} />
                                                    <span><strong>Apresentação:</strong> {materia.dataApresenta || 'Não informada'}</span>
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        <strong>Ementa:</strong> {materia.ementa}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ flex: 1, color: '#666', fontSize: '0.85rem' }}
                                                onClick={() => this.handleViewDetail(materia)}
                                            >
                                                <FaEye /> Ver Tudo
                                            </button>
                                            {materia.parecerDate ? (
                                                <button
                                                    className="btn-primary" 
                                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                                    onClick={() => this.openParecerPDF(materia, materia.parecer, materia.decisao)}
                                                >
                                                    <FaFileAlt /> Visualizar
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                                    onClick={() => this.handleOpenParecer(materia)}
                                                >
                                                    <FaPenFancy /> Analisar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- POPUP DE VISUALIZAÇÃO DA MATÉRIA --- */}
                    {showDetailModal && viewingMateria && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                                <div className="modal-header">
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{viewingMateria.titulo}</h2>
                                    <button onClick={this.handleCloseDetail} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
                                </div>
                                <div style={{ overflowY: 'auto', paddingRight: '15px', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                        <p style={{ margin: 0 }}><strong>Tipo:</strong> {viewingMateria.tipoMateria}</p>
                                        <p style={{ margin: 0 }}><strong>Número:</strong> {viewingMateria.numero}</p>
                                        <p style={{ margin: 0 }}><strong>Autor:</strong> {viewingMateria.autor}</p>
                                        <p style={{ margin: 0 }}><strong>Protocolo:</strong> {viewingMateria.protocolo}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Ementa</h4>
                                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px', lineHeight: '1.5' }}>{viewingMateria.ementa}</p>

                                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Texto da Proposição</h4>
                                        <div
                                            className="materia-content-view"
                                            style={{ lineHeight: '1.6', color: '#333', fontSize: '1rem' }}
                                            dangerouslySetInnerHTML={{ __html: viewingMateria.textoMateria }}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <button className="btn-secondary" onClick={this.handleCloseDetail}>Fechar Visualização</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- POPUP DE PREVIEW DO PDF --- */}
                    {showPdfPopup && pdfData && (
                        <div className="pdf-popup-overlay">
                            <div className="pdf-popup-content">
                                <button className="pdf-popup-close-button" onClick={this.closePdfPopup}>
                                    X
                                </button>
                                <iframe
                                    title="Preview PDF"
                                    src={`data:application/pdf;base64,${pdfData}`}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                />
                            </div>
                        </div>
                    )}

                {/* Modal de Senha para Assinatura Jurídica */}
                {this.state.showPasswordModal && (
                    <div className="pdf-popup-overlay">
                        <Box sx={{
                            backgroundColor: 'white',
                            p: 5,
                            borderRadius: '32px',
                            maxWidth: '480px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}>
                            <Box sx={{
                                width: 60, height: 60, borderRadius: '50%',
                                backgroundColor: 'rgba(18, 107, 94, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                            }}>
                                <FaCheckCircle size={30} color="#126B5E" />
                            </Box>
                            <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#1a1a1a' }}>Assinatura Digital</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 4, px: 2 }}>
                                Para assinar juridicamente este parecer, confirme sua senha de acesso ao ecossistema e-Câmara.
                            </Typography>

                            <TextField
                                fullWidth
                                type="password"
                                label="Sua Senha"
                                variant="outlined"
                                value={this.state.passwordInput}
                                onChange={this.handlePasswordChange}
                                error={!!this.state.passwordError}
                                helperText={this.state.passwordError}
                                sx={{ mb: 4 }}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            />

                            <Box display="flex" gap={2}>
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    onClick={() => this.setState({ showPasswordModal: false })} 
                                    sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={this.confirmSignature} 
                                    sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600, backgroundColor: '#126B5E', '&:hover': { backgroundColor: '#0e554a' } }}
                                >
                                    Confirmar Assinatura
                                </Button>
                            </Box>
                        </Box>
                    </div>
                )}

                {/* Janela de Chat AI (Widget Flutuante) */}
                {selectedMateria && showAiChat && (
                    <div className="chat-popup-overlay" style={{ background: 'transparent', pointerEvents: 'none' }}>
                        <div className="chat-ai-container" style={{
                            position: 'fixed',
                            bottom: 110,
                            right: 30,
                            width: '50%',
                            maxWidth: '800px',
                            height: '80vh',
                            maxHeight: '85vh',
                            borderRadius: '24px',
                            boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
                            pointerEvents: 'auto',
                            zIndex: 5000,
                            border: '1px solid rgba(0,0,0,0.05)',
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <h2><FaRobot /> Assistente Jurídico</h2>
                                    <p>Analisando Regimento e Lei Orgânica</p>
                                </div>
                                <button className="back-button" onClick={this.toggleAiChat} style={{ left: 'auto', right: '20px' }}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="chat-messages" ref={this.chatContainerRef}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                                        <div className="message-icon">
                                            {msg.sender === 'ai' ? <FaRobot /> : <FaGavel />}
                                        </div>
                                        <div className="message-bubble">
                                            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                        </div>
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className="message message-ai">
                                        <div className="message-icon"><FaSpinner className="animate-spin" /></div>
                                        <div className="message-bubble">Analisando legalidade e fundamentando...</div>
                                    </div>
                                )}
                            </div>

                            <div className="chat-input-area" style={{ padding: '15px', flexDirection: 'column', gap: '10px' }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    startIcon={isGeneratingParecer ? <CircularProgress size={18} color="inherit" /> : <FaMagic />}
                                    onClick={this.handleGenerateParecerWithAI}
                                    disabled={isGeneratingParecer}
                                    sx={{ textTransform: 'none', borderRadius: '12px', backgroundColor: '#126B5E', mb: 1 }}
                                >
                                    {isGeneratingParecer ? 'Gerando Sugestão...' : 'Sugerir Parecer Completo'}
                                </Button>
                                <div className="search-box-wrapper-chat">
                                    <input
                                        type="text"
                                        className="smart-search-input-chat"
                                        placeholder="Tire dúvidas sobre ritos ou fundamentação..."
                                        value={currentInput}
                                        onChange={(e) => this.setState({ currentInput: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && this.handleSendMessage()}
                                        disabled={isGenerating}
                                        style={{ width: '100%' }}
                                    />
                                    <button className="smart-search-btn-chat" onClick={this.handleSendMessage} disabled={isGenerating}>
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                    {/* Botão Flutuante de Chat AI com Balão de Sugestão (como o de addMaterias) */}
                    {selectedMateria && (
                        <Box sx={{
                            position: 'fixed',
                            bottom: 30,
                            right: 30,
                            zIndex: 5001,
                            display: 'flex',
                            alignItems: 'center',
                            '@keyframes slideHint': {
                                '0%': { transform: 'translateX(0px)', opacity: 0.8 },
                                '50%': { transform: 'translateX(-5px)', opacity: 1 },
                                '100%': { transform: 'translateX(0px)', opacity: 0.8 }
                            }
                        }}>
                            {!showAiChat && (
                                <Box sx={{
                                    backgroundColor: 'white',
                                    color: '#333',
                                    px: 2,
                                    py: 1,
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    mr: 2,
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    position: 'relative',
                                    whiteSpace: 'nowrap',
                                    animation: 'slideHint 3s ease-in-out infinite',
                                    border: '1px solid #eee',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        right: '-8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        borderTop: '8px solid transparent',
                                        borderBottom: '8px solid transparent',
                                        borderLeft: '8px solid white',
                                    }
                                }}>
                                    Fundamentar com IA
                                </Box>
                            )}
                            <Button
                                variant="contained"
                                onClick={this.toggleAiChat}
                                sx={{
                                    width: 65,
                                    height: 65,
                                    borderRadius: '50%',
                                    minWidth: 0,
                                    p: 0,
                                    backgroundColor: '#FF740F',
                                    boxShadow: '0 8px 24px rgba(255, 116, 15, 0.4)',
                                    '&:hover': { 
                                        backgroundColor: '#e6680d', 
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 12px 30px rgba(255, 116, 15, 0.5)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                {showAiChat ? <FaTimes size={24} /> : <FaRobot size={30} />}
                            </Button>
                        </Box>
                    )}
                </div>
            </div>
        );
    }
}


export default JuizoMateria;