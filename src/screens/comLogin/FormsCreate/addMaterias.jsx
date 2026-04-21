import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FaPaperPlane, FaFileAlt, FaCheckCircle, FaEdit, FaSpinner, FaPaperclip, FaTrash, FaInfoCircle, FaRobot, FaMagic, FaTimes, FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MenuDashboard from '../../../componets/menuAdmin.jsx'; // Certifique-se de que este caminho está correto
import { sendMessageToAIPrivate, analisarMateria } from '../../../aiService';
import api from '../../../services/api';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Tooltip,
    Alert
} from '@mui/material';

pdfMake.vfs = pdfFonts.vfs;

class AddProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Identificação Básica
            tipoMateria: '', // Será sugerido pela IA ou definido pelo usuário
            ano: '',
            numero: '',
            dataApresenta: '',
            protocolo: '',
            tipoApresentacao: '',
            tipoAutor: '',
            autor: '',

            // Outras Informações
            apelido: '',
            prazo: '',
            materiaPolemica: '',
            objeto: '',
            regTramita: 'Ordinária', // Padrão Ordinária
            status: '',
            dataPrazo: '',
            publicacao: '',
            isComplementar: '',

            // Origem Externa
            tipoMateriaExt: '',
            numeroMateriaExt: '',
            anoMateriaExt: '',
            dataMateriaExt: '',

            // Dados Textuais
            titulo: '',
            ementa: '',
            indexacao: '',
            observacao: '',
            textoMateria: '', // Texto completo da lei gerado pela IA

            file: null, // Para upload de arquivo
            fileBase64: null, // Conteúdo do anexo em Base64
            fileName: '', // Nome do arquivo anexo
            pdfData: null, // Dados do PDF em Base64

            // Para Assinatura Digital
            isSigned: false, // Booleano para controlar se o documento está assinado
            signatureMetadata: null, // Metadados da assinatura

            // Controle do preview PDF
            showPdfPopup: false, // Estado para controlar a visibilidade do popup do PDF

            // Estado da IA
            messages: [
                { id: 1, sender: 'ai', text: 'Olá! Sou a Inteligência Artificial da Câmara. <br/>Para começarmos, qual é o tema ou assunto principal da matéria que você deseja criar?' }
            ],
            currentInput: '',
            isGenerating: false,
            chatStep: 0, // 0: Tema, 1: Tipo, 2: Detalhes
            showEditor: false, // Controla a exibição do editor
            showAiChat: false, // Controla o modal de chat
            protocolGenerated: null, // Armazena o protocolo gerado
            showPasswordModal: false, // Modal de senha
            passwordInput: '',
            passwordError: '',
            logoBase64: null, // Logo da câmara para o PDF
            signatureBase64: null, // Assinatura para o PDF
            camaraId: this.props.match.params.camaraId, // Default, será atualizado
            baseConhecimento: {}, // Dados do Firebase para a IA
            homeConfig: {}, // Dados da home para o timbrado
            footerConfig: {}, // Dados do footer para o timbrado
            layoutConfig: {}, // Dados de layout para o timbrado (logo)
            aiTechnicalOpinion: '', // Novo estado para o parecer técnico da IA
            loadingConfig: true,
            vereadores: [], // Lista de vereadores para o select de autor
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



    fetchInitialData = async () => {
        const { camaraId } = this.state;
        this.setState({ loadingConfig: true });

        try {
            const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

            // Busca configurações e dados do perfil do usuário em paralelo
            const [configResponse, membersResponse] = await Promise.all([
                api.get(`/councils/${camaraId}`),
                api.get(`/users/council/${camaraId}`).catch(() => ({ data: [] }))
            ]);

            const configData = configResponse.data || {};
            const baseConhecimento = configData["base-conhecimento"] || {};
            const layoutConfig = configData.layout || {};
            const homeConfig = configData.home || {};
            const footerConfig = configData.footer || {};

            // Carrega lista de parlamentares
            const vereadores = membersResponse.data || [];

            // --- Lógica de Auto-preenchimento ---
            const currentYear = new Date().getFullYear().toString();
            const autorName = user.name || '';

            // Busca as matérias do usuário para definir o próximo número
            const materiasResponse = await api.get(`/legislative-matters/${camaraId}`);
            const allMaterias = materiasResponse.data || [];

            let count = 0;
            if (Array.isArray(allMaterias)) {
                allMaterias.forEach(materia => {
                    const authorId = materia.authorId || materia.userId;
                    if (authorId === user.id && materia.ano === currentYear) {
                        count++;
                    }
                });
            }
            const nextNumero = (count + 1).toString();

            // Logo conversion
            const logoBase64 = layoutConfig.logoLight ? await this.getBase64(layoutConfig.logoLight) : null;

            this.setState(
                {
                    baseConhecimento,
                    layoutConfig,
                    homeConfig,
                    footerConfig,
                    loadingConfig: false,
                    autor: autorName,
                    ano: currentYear,
                    numero: nextNumero,
                    logoBase64,
                    vereadores
                },
                this.handleGeneratePDF
            );
        } catch (error) {
            console.error("Erro ao buscar configurações:", error);
            this.setState({ loadingConfig: false });
        }
    };

    // Função auxiliar para converter imagem URL em Base64, agora como método de classe
    getBase64 = async (url) => { //
        if (!url) return null;
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting image to Base64:", error);
            return null;
        }
    }
    async componentDidMount() {
        const token = localStorage.getItem('@CamaraAI:token');
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (token && user.id) {
            this.setState({ camaraId: this.state.camaraId }, () => {
                this.fetchInitialData();
                this.scrollToBottom();
            });
        } else {
            this.props.history.push('/login/' + this.state.camaraId);
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        }, () => {
            // Callback para gerar PDF após o estado ser atualizado
            this.handleGeneratePDF();
        });
    };

    handleEditorChange = (content) => {
        this.setState({ textoMateria: content }, () => {
            this.handleGeneratePDF();
        });
    };

    stripHtml = (html) => {
        if (!html) return "";
        // Substitui parágrafos e quebras de linha por \n
        let text = html.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
        // Remove todas as outras tags HTML
        return text.replace(/<[^>]+>/g, '');
    };

    // Processa o HTML do editor para criar parágrafos formatados no PDF
    processHtmlToPdfMake = (html) => {
        if (!html) return [];
        // Divide por parágrafos para aplicar formatação individual
        const paragraphs = html.split(/<\/p>/gi);

        return paragraphs.map(p => {
            let text = p.replace(/<br\s*\/?>/gi, '\n');
            // Remove tags HTML restantes e decodifica entidades
            text = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

            if (!text) return null;

            return {
                text: text,
                style: 'textoLeiParagraph'
            };
        }).filter(Boolean);
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.messages.length !== this.state.messages.length) {
            this.scrollToBottom();
        }
    }

    scrollToBottom = () => {
        if (this.chatContainerRef.current) {
            this.chatContainerRef.current.scrollTop = this.chatContainerRef.current.scrollHeight;
        }
    }

    handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.setState({
                file: file,
                fileBase64: event.target.result,
                fileName: file.name
            }, () => {
                this.handleGeneratePDF();
            });
        };
        reader.readAsDataURL(file);
    };

    // Este método agora simplesmente define isSigned como true e regenera o PDF
    handleSignDocument = () => {
        this.setState({ isSigned: true }, () => {
            this.handleGeneratePDF(); // Gera PDF com a assinatura
        });
    };

    // Abre o popup do PDF
    openPdfPopup = () => {
        this.setState({ showPdfPopup: true });
    };

    toggleAiChat = () => {
        this.setState({ showAiChat: !this.state.showAiChat });
    };

    // Fecha o popup do PDF
    closePdfPopup = () => {
        this.setState({ showPdfPopup: false });
    };

    // Controle do Modal de Senha
    openPasswordModal = () => {
        this.setState({ showPasswordModal: true, passwordInput: '', passwordError: '' });
    };

    closePasswordModal = () => {
        this.setState({ showPasswordModal: false });
    };

    handlePasswordChange = (e) => {
        this.setState({ passwordInput: e.target.value });
    };

    generateHash = async (content) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    confirmSignature = async () => {
        const { passwordInput, textoMateria } = this.state;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        if (!user.email || !passwordInput) {
            this.setState({ passwordError: 'Senha necessária.' });
            return;
        }

        try {
            // No backend novo, poderíamos verificar a senha via /auth/login ou similar
            // Por enquanto, validamos que o usuário está autenticado e tem a senha preenchida
            // Em uma implementação real, o backend assinaria o documento

            this.setState({ passwordError: '' });

            // Coletar metadados
            const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => ({ json: () => ({ ip: '0.0.0.0' }) }));
            const ipData = await ipResponse.json();
            const ip = ipData.ip;
            const userAgent = navigator.userAgent;
            const timestamp = new Date().toISOString();
            const hash = await this.generateHash(textoMateria || '');

            const signatureMetadata = {
                nome: this.state.autor || user.name || 'Usuário',
                email: user.email,
                cpf: user.cpf || 'CPF não informado',
                timestamp: timestamp,
                ip: ip,
                userAgent: userAgent,
                documentHash: hash
            };

            this.setState({
                isSigned: true,
                signatureMetadata,
                showPasswordModal: false
            }, () => {
                this.handleProtocolar();
            });
        } catch (error) {
            console.error("Erro na assinatura:", error);
            this.setState({ passwordError: 'Ocorreu um erro ao processar a assinatura.' });
        }
    };

    // Função única para gerar Título, Ementa e Redação após validação
    generateFullMateriaWithAI = async () => {
        const { objeto, tipoMateria, baseConhecimento, camaraId } = this.state;

        if (!objeto) {
            alert("Por favor, descreva o Assunto primeiro para que a IA possa validar e sugerir o melhor formato.");
            return;
        }

        this.setState({ isGenerating: true, aiTechnicalOpinion: '' }); // Limpa parecer anterior

        try {
            const { regimentoText, materiasText } = baseConhecimento;

            // --- PASSO 1: VALIDAÇÃO TÉCNICA ESPECIALIZADA ---
            const technicalOpinion = await analisarMateria(objeto, `Considere que o tipo sugerido/selecionado é: ${tipoMateria || 'Não definido'}`);

            this.setState({
                aiTechnicalOpinion: technicalOpinion.analise,
                tipoMateria: tipoMateria // Mantém o tipo que já estava ou deixa o usuário escolher
            });

            if (!technicalOpinion.aprovado) {
                this.setState({ isGenerating: false });
                return;
            }

            // --- PASSO 2: GERAÇÃO DOS CAMPOS (Se aprovado na análise) ---
            const finalType = tipoMateria || 'Matéria';
            const titleResponse = await sendMessageToAIPrivate(`Sugira um título formal e em caixa alta para uma matéria legislativa do tipo "${finalType}" sobre o assunto "${objeto}". Responda APENAS o título sugerido.`, camaraId);

            const ementaResponse = await sendMessageToAIPrivate(`Escreva uma ementa legislativa (resumo formal) para uma matéria do tipo "${finalType}" sobre "${objeto}". Comece com verbos como "Dispõe sobre...", "Institui...", etc. Responda APENAS a ementa.`, camaraId);

            const textoResponse = await sendMessageToAIPrivate(`Atue como consultor legislativo. Escreva a minuta completa de um ${finalType} sobre o assunto "${objeto}".
                
                REGRAS:
                - Use estrutura de artigos (Art. 1º, Art. 2º...).
                - Formate com tags HTML (<p>, <strong>).
                - Inclua uma justificativa formal ao final.
                - Responda APENAS o HTML.`, camaraId);

            this.setState({
                titulo: titleResponse.trim(),
                ementa: ementaResponse.trim(),
                textoMateria: textoResponse.trim(),
                isGenerating: false,
                showEditor: true
            }, this.handleGeneratePDF);

        } catch (error) {
            console.error("Erro na geração completa via IA:", error);
            this.setState({ isGenerating: false });
            alert("Erro ao processar a inteligência artificial.");
        }
    };
    // ...
    // Função para gerar conteúdo com IA (Real)
    handleSendMessage = async () => {
        const { currentInput, messages, chatStep, objeto, tipoMateria, fileName, baseConhecimento, camaraId } = this.state;
        if (!currentInput.trim()) return;

        const token = localStorage.getItem('@CamaraAI:token');
        if (!token) {
            this.setState({
                messages: [...messages, { id: Date.now(), sender: 'user', text: currentInput }, { id: Date.now() + 1, sender: 'ai', text: "🔒 Você precisa estar autenticado para usar este recurso. Por favor, faça login no sistema." }],
                currentInput: ''
            });
            return;
        }

        const userMessage = { id: Date.now(), sender: 'user', text: currentInput };

        this.setState({
            messages: [...messages, userMessage],
            currentInput: '',
            isGenerating: true
        });

        try {
            let prompt = '';
            let nextStep = chatStep;
            let nextStateUpdates = {};
            let aiResponseText = '';
            let shouldOpenEditor = false;

            // --- CONTEXTO LEGISLATIVO (BUSCADO DO FIREBASE) ---
            const { regimentoText, materiasText } = baseConhecimento;

            const REGIMENTO_INTERNO_RESUMO = regimentoText || `REGRAS FUNDAMENTAIS DA CÂMARA:
            1. É vedado ao Vereador apresentar projetos que gerem despesa direta ao Executivo (Vício de Iniciativa), exceto se indicar a fonte de custeio.
            2. Matérias sobre trânsito e transporte são de competência privativa da União, cabendo ao município apenas legislar sobre circulação local.
            3. Denominação de ruas deve vir acompanhada de abaixo-assinado dos moradores e certidão de óbito do homenageado.
            4. Não são permitidas Moções de Repúdio sem prova documental do fato.
            5. A criação de datas comemorativas deve ter relevância social comprovada.
            `;

            const MATERIAS_ANTERIORES = materiasText || `LISTA DE MATÉRIAS JÁ APROVADAS (PARA VERIFICAR DUPLICIDADE):
            - Lei nº 1.234/2023: Institui a Semana da Saúde Mental nas escolas.
            - Lei nº 1.235/2023: Obriga a instalação de câmeras em creches municipais.
            - Lei nº 1.236/2024: Dispõe sobre a proibição de fogos de artifício com estampido.
            - Indicação 45/2024: Solicita pavimentação da Rua XV de Novembro.
            - Projeto de Lei 10/2024: Cria o programa "Adote uma Praça".
            `;
            // Outros contextos como Lei Orgânica e Atas podem ser adicionados ao prompt conforme necessário
            // -------------------------------------------------

            if (chatStep === 0) {
                // Passo 0: Usuário informa o Tema
                prompt = `Você é um assistente legislativo da Câmara Municipal. O usuário deseja criar uma nova matéria. O tema informado foi: "${currentInput}". Confirme que entendeu o tema e pergunte qual é o tipo da matéria (ex: Projeto de Lei, Requerimento, Indicação, Moção). Seja breve e cordial.`;
                nextStep = 1;
                nextStateUpdates = { objeto: currentInput };
            } else if (chatStep === 1) {
                // Passo 1: Usuário informa o Tipo
                prompt = `Estamos criando uma matéria legislativa sobre o tema "${objeto}". O usuário informou que o tipo da matéria é: "${currentInput}". Confirme o tipo e peça para o usuário fornecer os detalhes específicos, justificativa ou pontos principais que devem constar no texto da lei.`;
                nextStep = 2;
                nextStateUpdates = { tipoMateria: currentInput };
            } else if (chatStep === 2) {
                // Passo 2: Usuário informa Detalhes -> Gerar Minuta
                prompt = `Atue como um consultor legislativo especialista e rigoroso.
                
                CONTEXTO OBRIGATÓRIO:
                ${REGIMENTO_INTERNO_RESUMO}
                
                HISTÓRICO DE MATÉRIAS (EVITE DUPLICIDADE):
                ${MATERIAS_ANTERIORES}
                
                SUA TAREFA:
                Analise o pedido de um(a) ${tipoMateria} sobre o tema "${objeto}".
                Detalhes fornecidos: "${currentInput}".

                ${fileName ? `OBSERVAÇÃO: O usuário forneceu um documento de referência anexado: ${fileName}. Considere que você tem acesso aos metadados deste documento para fundamentação.` : ''}

                PASSO 1 - VALIDAÇÃO:
                - Verifique se este tema já existe na lista de matérias anteriores. Se for duplicado, inicie sua resposta OBRIGATORIAMENTE com a palavra "BLOQUEIO:" seguida da explicação.
                - Verifique se o tema viola o Regimento Interno (ex: vício de iniciativa). Se violar, inicie sua resposta OBRIGATORIAMENTE com a palavra "BLOQUEIO:" seguida da explicação.
                
                PASSO 2 - GERAÇÃO (Apenas se passou na validação):
                Se NÃO houver impedimentos, NÃO use a palavra "BLOQUEIO". Apenas escreva a minuta seguindo estritamente a estrutura padrão de lei municipal.
                
                IMPORTANTE: Responda EXCLUSIVAMENTE em formato JSON estruturado para que eu possa preencher o formulário automaticamente.
                
                Estrutura do JSON:
                {
                    "titulo": "TÍTULO EM CAIXA ALTA",
                    "ementa": "Ementa formal começando com verbo",
                    "textoMateria": "HTML com tags <p> e <strong> para a redação integral e justificativa",
                    "tipoMateria": "O tipo confirmado"
                }`;
                nextStep = 3;
            }

            // Chamada real à API com o slug da câmara
            const response = await sendMessageToAIPrivate(prompt, camaraId);

            if (chatStep === 2) {
                const isRefusal = response.includes("BLOQUEIO:");

                if (isRefusal) {
                    aiResponseText = response;
                    nextStep = 2; // Mantém no passo 2 para o usuário tentar novamente
                } else {
                    try {
                        const jsonMatch = response.match(/\{[\s\S]*\}/);
                        if (!jsonMatch) throw new Error("Nenhum JSON válido encontrado na resposta da IA.");

                        const generatedData = JSON.parse(jsonMatch[0]);
                        aiResponseText = `Perfeito! Validei o regimento e gerei a minuta técnica para você. Clique no botão abaixo para preencher o formulário automaticamente.`;
                        shouldOpenEditor = true;

                        nextStateUpdates = {
                            ...nextStateUpdates,
                            titulo: generatedData.titulo || (`${this.state.tipoMateria || 'Matéria'} sobre ${this.state.objeto}`).toUpperCase(),
                            ementa: generatedData.ementa || `Dispõe sobre ${this.state.objeto} e dá outras providências.`,
                            tipoMateria: generatedData.tipoMateria || this.state.tipoMateria,
                            indexacao: generatedData.indexacao || '',
                            observacao: generatedData.observacao || '',
                            textoMateria: generatedData.textoMateria || '<p>Erro ao gerar o texto da matéria.</p>'
                        };
                    } catch (e) {
                        console.error("Falha ao analisar JSON da IA:", e, "Resposta recebida:", response);
                        nextStateUpdates = {
                            ...nextStateUpdates,
                            textoMateria: response, // Usa a resposta bruta como fallback
                        };
                    }
                }
            } else {
                aiResponseText = response;
            }

            // Atualiza o estado do chat com a resposta da IA e para o indicador de "digitando"
            this.setState(prevState => ({
                messages: [...prevState.messages, { id: Date.now() + 1, sender: 'ai', text: aiResponseText }],
                isGenerating: false, // Resposta recebida, para de gerar
                chatStep: nextStep,
                ...nextStateUpdates
            }));

        } catch (error) {
            console.error("Erro ao processar IA:", error);
            this.setState(prevState => ({
                messages: [...prevState.messages, { id: Date.now() + 1, sender: 'ai', text: error.message || "Desculpe, não consegui processar sua solicitação." }],
                isGenerating: false
            }));
        }
    };

    handleProtocolar = async () => {
        const { camaraId } = this.state;
        const user = JSON.parse(localStorage.getItem('@CamaraAI:user') || '{}');

        // Simula a geração de protocolo
        const newProtocol = `${new Date().getFullYear()}/${Math.floor(Math.random() * 100000)}`;

        const materiaData = {
            userId: user.id,
            userEmail: user.email,
            protocolo: newProtocol,
            status: 'Aguardando Parecer Jurídico',
            createdAt: new Date().toISOString(),

            // Identificação
            tipoMateria: this.state.tipoMateria,
            ano: parseInt(this.state.ano) || new Date().getFullYear(),
            numero: parseInt(this.state.numero) || 0,
            dataApresenta: this.state.dataApresenta,
            tipoApresentacao: this.state.tipoApresentacao,
            tipoAutor: this.state.tipoAutor,
            autor: this.state.autor,

            // Detalhes
            apelido: this.state.apelido,
            prazo: this.state.prazo,
            materiaPolemica: this.state.materiaPolemica === 'Sim' || this.state.materiaPolemica === true,
            objeto: this.state.objeto,
            regTramita: this.state.regTramita,
            dataPrazo: this.state.dataPrazo,
            publicacao: Boolean(this.state.publicacao),
            isComplementar: this.state.isComplementar === 'Sim' || this.state.isComplementar === true,
            isSigned: this.state.isSigned,

            // Conteúdo
            titulo: this.state.titulo,
            ementa: this.state.ementa,
            indexacao: this.state.indexacao,
            observacao: this.state.observacao,
            textoMateria: this.state.textoMateria,

            signatureMetadata: this.state.signatureMetadata,
            chatHistory: this.state.messages,
            pdfBase64: this.state.pdfData,
            anexoBase64: this.state.fileBase64,
            anexoNome: this.state.fileName
        };

        try {
            await api.post(`/legislative-matters/${camaraId}`, materiaData);

            this.setState({
                protocolGenerated: newProtocol,
                protocolo: newProtocol,
                status: 'Aguardando Parecer Jurídico'
            }, () => {
                this.handleGeneratePDF();
                alert(`Documento Assinado Digitalmente e Protocolado!\nProtocolo: ${newProtocol}\nStatus: Enviado para Parecer da Presidência.`);
                this.props.history.push('/admin/materias-dash/' + camaraId);
            });
        } catch (error) {
            console.error("Erro ao salvar matéria:", error);
            alert("Erro ao protocolar matéria. Verifique sua conexão e tente novamente.");
        }
    };

    handleGeneratePDF = () => {
        // Desestruturar todos os dados do estado
        const {
            tipoMateria, ano, numero, dataApresenta, protocolo, tipoApresentacao, tipoAutor, autor, apelido, camaraId,
            prazo, materiaPolemica, objeto, regTramita, status, dataPrazo, publicacao, isComplementar, tipoMateriaExt, footerConfig,
            numeroMateriaExt, anoMateriaExt, dataMateriaExt, titulo, ementa, indexacao, observacao, textoMateria, isSigned,
            logoBase64, signatureBase64, signatureMetadata
        } = this.state;

        // Conteúdo base do PDF
        const docContent = [
            logoBase64 && {
                image: logoBase64, // Usa a versão Base64
                width: 80,
                alignment: 'right'
            },
            {
                text: this.state.homeConfig.titulo || `Câmara Municipal de ${camaraId}`,
                alignment: 'center',
                style: 'timbrado'
            },
            {
                text: `Protocolo: ${protocolo}`, // Adiciona fallback
                alignment: 'center'
            },
            {
                text: titulo, // Adiciona fallback
                style: 'header',
                alignment: 'center'
            },

            { text: '\n' }, // Espaçamento


            // Dados Textuais
            {
                text: 'Dados Textuais',
                alignment: 'center',
                style: 'subheader'
            },
            { text: '\n' },
            { text: [{ text: 'Ementa: ', bold: true }, ementa || 'Não informado'], style: 'descricoes' },

            // Minuta da Lei (Se houver)
            textoMateria && { text: '\n\n' },
            textoMateria && { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            textoMateria && { stack: this.processHtmlToPdfMake(textoMateria), marginTop: 15 },
        ].filter(Boolean); // Filtra elementos falsy (como os blocos de Origem Externa vazios)

        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        const cityName = this.state.homeConfig.cidade || camaraId.charAt(0).toUpperCase() + camaraId.slice(1);

        // Adiciona bloco de encerramento e assinatura
        docContent.push(
            { text: '\n\n\n' }, // Espaçador
            { text: `${cityName}, ${formattedDate}.`, alignment: 'center', style: 'infoText' },
            { text: '\n\n\n\n' }, // Espaçador para assinatura
            { text: '________________________________', alignment: 'center' },
            { text: this.state.autor || 'Vereador(a) Proponente', alignment: 'center', style: 'small', bold: true, margin: [0, 5, 0, 0] },
            { text: 'Vereador(a)', alignment: 'center', style: 'small' }
        );

        // Adiciona a assinatura digital se isSigned for true
        if (isSigned) {
            docContent.push(
                { text: '\n\n' },
                {
                    text: [
                        { text: 'ASSINATURA DIGITAL\n', bold: true, fontSize: 10 },
                        { text: `Assinado por: ${signatureMetadata?.nome} (${signatureMetadata?.email})\n`, fontSize: 8 },
                        { text: `Data/Hora: ${new Date(signatureMetadata?.timestamp).toLocaleString()}\n`, fontSize: 8 },
                        { text: `IP: ${signatureMetadata?.ip} | Hash: ${signatureMetadata?.documentHash?.substring(0, 20)}...`, fontSize: 8 }
                    ],
                    style: 'digitalSignatureInfo',
                    alignment: 'center'
                }
            );
        }

        const footerText = `📍 ${footerConfig.address || ''} | 📞 ${footerConfig.phone || ''}\n📧 ${footerConfig.email || ''}\n${footerConfig.copyright || ''}`;

        const docDefinition = {
            content: docContent,
            // Adiciona numeração de páginas no rodapé
            footer: (currentPage, pageCount) => ({
                stack: [
                    { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#ccc' }] },
                    { text: footerText, style: 'footerStyle', alignment: 'center', margin: [0, 5, 0, 0] },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', fontSize: 8, margin: [0, 2, 0, 0] }
                ]
            }),
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    marginBottom: 20,
                    marginTop: 20,
                    color: '#333'
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    marginTop: 15,
                    marginBottom: 10,
                    color: '#555'
                },
                infoText: { // Novo estilo para as informações em parágrafo
                    fontSize: 10,
                    marginBottom: 3,
                    color: '#444'
                },
                descricoes: { // Para Ementa, Indexação, Observação
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 10,
                    color: '#444'
                },
                timbrado: {
                    fontSize: 12,
                    bold: true,
                    marginBottom: 10,
                    color: '#777'
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 9,
                    color: '#666'
                },
                assinatura: {
                    marginTop: 30,
                    marginBottom: 0
                },
                underline: {
                    marginTop: -10,
                    color: '#333'
                },
                digitalSignatureInfo: {
                    fontSize: 8,
                    color: '#007bff',
                    marginTop: 10,
                    italics: true,
                    background: '#f0f8ff',
                    padding: 5,
                    borderRadius: 4
                },
                textoLeiParagraph: {
                    fontSize: 12,
                    alignment: 'justify',
                    lineHeight: 1.5,
                    marginBottom: 10, // Espaço entre parágrafos
                    leadingIndent: 30 // Identação da primeira linha (padrão legislativo)
                },
                footerStyle: {
                    fontSize: 8,
                    color: '#777',
                }
            }
        };

        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data });
        });
    };

    render() {
        const { pdfData, isSigned, showPdfPopup, showPasswordModal, passwordInput, passwordError, loadingConfig, isGenerating, aiTechnicalOpinion, showAiChat, messages, currentInput } = this.state;

        if (loadingConfig) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center', background: '#f4f7f6', minHeight: '100vh' }}>
                    <CircularProgress color="primary" />
                    <Typography ml={2} sx={{ color: '#126B5E', fontWeight: 500 }}>Carregando configurações...</Typography>
                </div>
            );
        }

        return (
            <div className='App-header' style={{ background: '#f4f7f6', minHeight: '100vh', alignItems: 'flex-start', flexDirection: 'row' }}>
                <MenuDashboard />

                <Box component="main" sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 5 },
                    ml: { xs: 0, md: '65px' }, // Ajustado para a largura do menu lateral
                    width: { xs: '100%', md: 'calc(100% - 65px)' },
                    maxWidth: '1400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box className="header-text" sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left', flex: '1 1 auto' }}>
                            <Typography variant="h4" sx={{ color: '#126B5E', fontWeight: 800, letterSpacing: '-0.02em', fontSize: "17px" }}>
                                Protocolar Nova Matéria
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ opacity: 0.8, fontSize: "13px" }}>
                                Preencha os campos abaixo. Utilize nossa IA para auxiliar na redação técnica.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<FaFileAlt />}
                                onClick={this.openPdfPopup}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    borderWidth: '2px',
                                    '&:hover': { borderWidth: '2px' }
                                }}
                            >
                                Visualizar PDF
                            </Button>
                            {!this.state.protocolGenerated && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<FaCheckCircle />}
                                    onClick={this.openPasswordModal}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '12px',
                                        px: 3,
                                        backgroundColor: '#126B5E',
                                        boxShadow: '0 8px 16px rgba(18, 107, 94, 0.2)',
                                        '&:hover': { backgroundColor: '#0e554a', boxShadow: '0 12px 20px rgba(18, 107, 94, 0.3)' }
                                    }}
                                >
                                    Assinar e Protocolar
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {this.state.protocolGenerated && (
                        <Alert
                            severity="success"
                            variant="filled"
                            sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">Protocolo Gerado com Sucesso: {this.state.protocolGenerated}</Typography>
                            A matéria foi enviada para análise da Presidência e seguirá o rito regimental.
                        </Alert>
                    )}

                    <Grid container spacing={4}>
                        {/* Coluna de Dados Técnicos */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#1a1a1a', fontWeight: 700 }}>
                                        <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: 'rgba(18, 107, 94, 0.1)', display: 'flex' }}>
                                            <FaInfoCircle size={18} color="#126B5E" />
                                        </Box>
                                        Dados de Identificação
                                    </Typography>

                                    <Box display="flex" flexDirection="column" gap={3} mt={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Autor</InputLabel>
                                            <Select
                                                name="autor"
                                                value={this.state.autor}
                                                onChange={this.handleInputChange}
                                                label="Autor"
                                                sx={{ borderRadius: '10px' }}
                                            >
                                                <MenuItem value=""><em>Selecione o Autor...</em></MenuItem>
                                                {this.state.vereadores.map((v) => (
                                                    <MenuItem key={v.id} value={v.nome || v.name}>
                                                        {v.nome || v.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Box display="flex" gap={2}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Ano/Exercício"
                                                name="ano"
                                                type="number"
                                                value={this.state.ano}
                                                onChange={this.handleInputChange}
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Número"
                                                name="numero"
                                                value={this.state.numero}
                                                onChange={this.handleInputChange}
                                                InputProps={{ sx: { borderRadius: '10px' } }}
                                            />
                                        </Box>

                                        <FormControl fullWidth size="small">
                                            <InputLabel>Regime de Tramitação</InputLabel>
                                            <Select
                                                name="regTramita"
                                                value={this.state.regTramita}
                                                onChange={this.handleInputChange}
                                                label="Regime de Tramitação"
                                                sx={{ borderRadius: '10px' }}
                                            >
                                                <MenuItem value="Ordinária">Ordinária</MenuItem>
                                                <MenuItem value="Urgência">Urgência</MenuItem>
                                                <MenuItem value="Especial">Especial</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Principal Assunto / Objeto"
                                            multiline
                                            rows={2}
                                            name="objeto"
                                            placeholder="Ex: Pavimentação da Rua X, Criação do Programa Y..."
                                            value={this.state.objeto}
                                            onChange={this.handleInputChange}
                                            helperText="A IA utilizará este campo como contexto para as gerações."
                                            InputProps={{ sx: { borderRadius: '10px' } }}
                                        />
                                    </Box>

                                    {/* Exibição do Parecer Técnico da IA */}
                                    {aiTechnicalOpinion && (
                                        <Alert
                                            severity={aiTechnicalOpinion.startsWith("BLOQUEIO:") ? "error" : "info"}
                                            variant="outlined"
                                            sx={{ borderRadius: '10px', mt: 2 }}
                                        >
                                            <Typography variant="body2" fontWeight="bold" textAlign={"left"}>Parecer Técnico da IA:</Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', marginTop: 1 }}>
                                                {aiTechnicalOpinion}
                                            </Typography>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Coluna de Conteúdo e Editor */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>

                                    {/* Botão Único de Geração */}
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            variant="contained"
                                            startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <FaRobot />}
                                            onClick={this.generateFullMateriaWithAI}
                                            disabled={isGenerating}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: '12px',
                                                py: 1.5,
                                                px: 4,
                                                backgroundColor: '#126B5E',
                                                boxShadow: '0 8px 16px rgba(18, 107, 94, 0.2)',
                                                '&:hover': { backgroundColor: '#0e554a', boxShadow: '0 12px 20px rgba(18, 107, 94, 0.3)' }
                                            }}
                                        >
                                            {isGenerating ? 'Validando e Gerando...' : 'Validar e Gerar Matéria Completa'}
                                        </Button>
                                    </Box>

                                    {/* Tipo de Matéria (Preenchido pela IA ou Manual) */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', mb: 1.5 }}>Tipo de Matéria</Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                name="tipoMateria"
                                                value={this.state.tipoMateria}
                                                onChange={this.handleInputChange}
                                                sx={{ borderRadius: '10px' }}
                                            >
                                                <MenuItem value="Projeto de Lei">Projeto de Lei</MenuItem>
                                                <MenuItem value="Indicação">Indicação</MenuItem>
                                                <MenuItem value="Requerimento">Requerimento</MenuItem>
                                                <MenuItem value="Moção">Moção</MenuItem>
                                                <MenuItem value="Projeto de Decreto Legislativo">Projeto de Decreto Legislativo</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    {/* Título com IA */}
                                    <Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>Título da Matéria</Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            name="titulo"
                                            value={this.state.titulo}
                                            onChange={this.handleInputChange}
                                            placeholder="Ex: PROJETO DE LEI Nº 123/2024..."
                                            InputProps={{ sx: { borderRadius: '10px' } }}
                                        />
                                    </Box>

                                    {/* Ementa com IA */}
                                    <Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>Ementa (Resumo Formal)</Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            rows={3}
                                            name="ementa"
                                            value={this.state.ementa}
                                            onChange={this.handleInputChange}
                                            placeholder="Dispõe sobre..."
                                            InputProps={{ sx: { borderRadius: '10px' } }}
                                        />
                                    </Box>

                                    {/* Texto Integral com Editor */}
                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>Minuta / Redação Integral</Typography>
                                        </Box>
                                        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
                                            <ReactQuill
                                                theme="snow"
                                                value={this.state.textoMateria}
                                                onChange={this.handleEditorChange}
                                                modules={this.modules}
                                                formats={this.formats}
                                                placeholder="Prepare o texto ou gere automaticamente..."
                                                style={{ height: '400px' }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Botão Flutuante de Chat AI com Balão de Sugestão */}
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
                            Crie a matéria com IA.
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
                            '&:hover': { backgroundColor: '#e6680d', transform: 'scale(1.05)' },
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {showAiChat ? <FaTimes size={24} /> : <FaRobot size={30} />}
                    </Button>
                </Box>

                {/* Janela de Chat AI (Widget no Canto Inferior Direito) */}
                {showAiChat && (
                    <div className="chat-popup-overlay" style={{ background: 'transparent', pointerEvents: 'none' }}>
                        <div className="chat-ai-container" style={{
                            position: 'fixed',
                            bottom: 110,
                            right: 30,
                            width: '420px',
                            maxWidth: '90vw',
                            height: '650px',
                            maxHeight: '75vh',
                            borderRadius: '24px',
                            boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
                            pointerEvents: 'auto',
                            margin: 0,
                            zIndex: 5000,
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <h2><FaRobot /> Assistente Legislativo</h2>
                                    <p>IA treinada com o seu Regimento Interno</p>
                                </div>
                                <button className="back-button" onClick={this.toggleAiChat} style={{ left: 'auto', right: '20px' }}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="chat-messages" ref={this.chatContainerRef}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                                        <div className="message-icon">
                                            {msg.sender === 'ai' ? <FaRobot /> : <FaEdit />}
                                        </div>
                                        <div className="message-bubble">
                                            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                            {msg.sender === 'ai' && this.state.chatStep === 3 && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<FaCheckCircle />}
                                                    onClick={() => this.setState({ showAiChat: false, showEditor: true }, this.handleGeneratePDF)}
                                                    sx={{ mt: 2, textTransform: 'none', borderRadius: '8px', backgroundColor: '#126B5E' }}
                                                >
                                                    Aplicar ao Formulário
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className="message message-ai">
                                        <div className="message-icon"><FaSpinner className="animate-spin" /></div>
                                        <div className="message-bubble">Analisando regimento e redigindo...</div>
                                    </div>
                                )}
                            </div>

                            <div className="chat-input-area" style={{ padding: '15px' }}>
                                <div className="search-box-wrapper-chat">
                                    <input
                                        type="text"
                                        className="smart-search-input-chat"
                                        placeholder="Digite aqui..."
                                        value={currentInput}
                                        onChange={(e) => this.setState({ currentInput: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && this.handleSendMessage()}
                                        disabled={isGenerating}
                                        style={{ width: '100%' }}
                                    />
                                    <button
                                        className="smart-search-btn-chat"
                                        onClick={this.handleSendMessage}
                                        disabled={isGenerating}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview PDF */}
                {showPdfPopup && pdfData && (
                    <div className="pdf-popup-overlay">
                        <Box sx={{
                            width: '94%',
                            height: '92%',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            position: 'relative'
                        }}>
                            <Button
                                onClick={this.closePdfPopup}
                                sx={{
                                    position: 'absolute',
                                    top: 15,
                                    right: 15,
                                    minWidth: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    zIndex: 10
                                }}
                            >
                                X
                            </Button>
                            <iframe
                                title="Preview PDF"
                                src={`data:application/pdf;base64,${pdfData}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                            />
                        </Box>
                    </div>
                )}

                {/* Assinatura Digital */}
                {showPasswordModal && (
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
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(18, 107, 94, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <FaCheckCircle size={30} color="#126B5E" />
                            </Box>
                            <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#1a1a1a' }}>Assinatura Digital</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 4, px: 2 }}>
                                Para assinar juridicamente este documento, confirme sua senha de acesso ao ecossistema e-Câmara.
                            </Typography>

                            <TextField
                                fullWidth
                                type="password"
                                label="Sua Senha"
                                variant="outlined"
                                value={passwordInput}
                                onChange={this.handlePasswordChange}
                                error={!!passwordError}
                                helperText={passwordError}
                                sx={{ mb: 4 }}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            />

                            <Box display="flex" gap={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={this.closePasswordModal}
                                    sx={{ borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={this.confirmSignature}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        backgroundColor: '#126B5E',
                                        '&:hover': { backgroundColor: '#0e554a' }
                                    }}
                                >
                                    Confirmar Assinatura
                                </Button>
                            </Box>
                        </Box>
                    </div>
                )}
            </div>
        );
    }
}

export default AddProducts;