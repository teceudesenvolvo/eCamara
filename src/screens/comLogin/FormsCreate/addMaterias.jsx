import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FaMagic, FaPaperPlane, FaFileAlt, FaCheckCircle, FaEdit, FaSpinner, FaPaperclip, FaTrash } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import MenuDashboard from '../../../componets/menuAdmin.jsx'; // Certifique-se de que este caminho está correto
import { sendMessageToAIPrivate } from '../../../aiService';
import { auth, db } from '../../../firebaseConfig';
import { ref, get, push } from "firebase/database";

pdfMake.vfs = pdfFonts.vfs;

class AddProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Identificação Básica
            tipoMateria: '',
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
            regTramita: '',
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
            loadingConfig: true,
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

            const snapshot = await get(
                ref(db, `${camaraId}/dados-config`)
            );

            const dados = snapshot.exists() ? snapshot.val() : {};

            const baseConhecimento = dados["base-conhecimento"] || {};
            const layoutConfig = dados.layout || {};
            const homeConfig = dados.home || {};
            const footerConfig = dados.footer || {};

            this.setState(
                {
                    baseConhecimento,
                    layoutConfig,
                    homeConfig,
                    footerConfig,
                    loadingConfig: false
                    // O logoBase64 será definido após a busca
                },
                this.handleGeneratePDF
            );

        } catch (error) {

            console.error("Erro ao buscar configurações:", error);

            this.setState({
                loadingConfig: false
            });

        }

        // Busca e converte o logo após a configuração inicial ser carregada
        const layoutData = this.state.layoutConfig;
        if (layoutData.logoLight) {
            this.setState({ logoBase64: await this.getBase64(layoutData.logoLight) });
        }

    };

    // Função auxiliar para converter imagem URL em Base64, agora como método de classe
    getBase64 = async (url) => {
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
        try {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const userIndexRef = ref(db, `users_index/${user.uid}`);
                    const snapshot = await get(userIndexRef);
                    const camaraId = snapshot.exists() ? snapshot.val().camaraId : this.props.match.params.camaraId;

                    this.setState({ camaraId }, () => {
                        this.fetchInitialData();
                        this.scrollToBottom();
                    });
                }
            });
        } catch (error) {
            console.error("Erro no componentDidMount:", error);
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

    confirmSignature = () => {
        // Simulação de validação de senha (ex: '123456')
        if (this.state.passwordInput === '123456') {
            this.setState({ isSigned: true, showPasswordModal: false }, () => {
                this.handleProtocolar(); // Chama o protocolo após assinar
            });
        } else {
            this.setState({ passwordError: 'Senha incorreta. Tente novamente.' });
        }
    };

    // Função para gerar conteúdo com IA (Real)
    handleSendMessage = async () => {
        const { currentInput, messages, chatStep, objeto, tipoMateria, fileName } = this.state;
        if (!currentInput.trim()) return;

        if (!auth.currentUser) {
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
            const { regimentoText, materiasText, leiOrganicaText, atasText } = this.state.baseConhecimento;

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
                
                IMPORTANTE: Formate a resposta utilizando tags HTML para garantir a formatação correta no editor:
                - Envolva cada parágrafo em tags <p>.
                - Use <strong> para negrito em títulos e destaques.
                - Adicione espaçamento adequado entre as seções.
                
                Estrutura:
                1. Título (em caixa alta e negrito).
                2. Ementa (resumo do que trata a lei).
                3. Texto da lei articulado (Art. 1º, Art. 2º, etc) em parágrafos separados.
                4. Justificativa formal ao final.`;
                nextStep = 3;
            }

            // Chamada real à API
            const response = await sendMessageToAIPrivate(prompt);

            if (chatStep === 2) {
                const isRefusal = response.includes("BLOQUEIO:");

                if (isRefusal) {
                    aiResponseText = response;
                    nextStep = 2; // Mantém no passo 2 para o usuário tentar novamente
                } else {
                    aiResponseText = `Perfeito! Validei o regimento e a base de dados. Estou gerando a minuta da matéria. Abrindo o editor...`;
                    shouldOpenEditor = true;                    
                    try {
                        const jsonMatch = response.match(/\{[\s\S]*\}/);
                        if (!jsonMatch) throw new Error("Nenhum JSON válido encontrado na resposta da IA.");
                        
                        const generatedData = JSON.parse(jsonMatch[0]);
                        
                        nextStateUpdates = {
                            ...nextStateUpdates,
                            titulo: (`${this.state.tipoMateria || 'Matéria'} sobre ${this.state.objeto}`).toUpperCase(),
                            ementa: generatedData.ementa || `Dispõe sobre ${this.state.objeto} e dá outras providências.`,
                            indexacao: generatedData.indexacao || '',
                            observacao: generatedData.observacao || '',
                            textoMateria: generatedData.textoMateria || '<p>Erro ao gerar o texto da matéria.</p>',
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

            // Se a geração da minuta foi um sucesso, abre o editor após um breve delay
            if (shouldOpenEditor) {
                setTimeout(() => {
                    this.setState({ showEditor: true });
                }, 1500); // Delay para o usuário ler a mensagem "Abrindo o editor..."
            }

        } catch (error) {
            console.error("Erro ao processar IA:", error);
            this.setState(prevState => ({
                messages: [...prevState.messages, { id: Date.now() + 1, sender: 'ai', text: error.message || "Desculpe, não consegui processar sua solicitação." }],
                isGenerating: false
            }));
        }
    };

    handleProtocolar = async () => {
        // Simula a geração de protocolo e envio para o presidente
        const newProtocol = `${new Date().getFullYear()}/${Math.floor(Math.random() * 100000)}`;

        // Prepara os dados para salvar no Firestore
        const materiaData = {
            userId: auth.currentUser?.uid,
            userEmail: auth.currentUser?.email,
            protocolo: newProtocol,
            status: 'Aguardando Parecer',
            createdAt: new Date().toISOString(),

            // Identificação
            tipoMateria: this.state.tipoMateria,
            ano: this.state.ano,
            numero: this.state.numero,
            dataApresenta: this.state.dataApresenta,
            tipoApresentacao: this.state.tipoApresentacao,
            tipoAutor: this.state.tipoAutor,
            autor: this.state.autor,

            // Detalhes
            apelido: this.state.apelido,
            prazo: this.state.prazo,
            materiaPolemica: this.state.materiaPolemica,
            objeto: this.state.objeto,
            regTramita: this.state.regTramita,
            dataPrazo: this.state.dataPrazo,
            publicacao: this.state.publicacao,
            isComplementar: this.state.isComplementar,

            // Conteúdo
            titulo: this.state.titulo,
            ementa: this.state.ementa,
            indexacao: this.state.indexacao,
            observacao: this.state.observacao,
            textoMateria: this.state.textoMateria,

            // Histórico do Chat com a IA
            chatHistory: this.state.messages
        };
        materiaData.pdfBase64 = this.state.pdfData;
        materiaData.anexoBase64 = this.state.fileBase64;
        materiaData.anexoNome = this.state.fileName;

        try {
             const camaraId  = this.props.match.params.camaraId;
             if (!camaraId) throw new Error('camaraId não definida na URL');

            if (auth.currentUser) {
                materiaData.camaraId = this.props.match.params.camaraId;
                const materiasRef = ref(db, `${this.props.match.params.camaraId}/materias`);
                await push(materiasRef, materiaData);
            }

            this.setState({
                protocolGenerated: newProtocol,
                protocolo: newProtocol,
                status: 'Aguardando Parecer'
            }, () => {
                this.handleGeneratePDF(); // Atualiza PDF com o protocolo
                alert(`Documento Assinado Digitalmente e Protocolado!\nProtocolo: ${newProtocol}\nStatus: Enviado para Parecer da Presidência.`);
                this.props.history.push('/admin/materias-dash/' + this.props.match.params.camaraId); // Redireciona para o dashboard de matérias
            });
        } catch (error) {
            console.error("Erro ao salvar matéria no Firebase:", error);
            alert("Erro ao protocolar matéria. Tente novamente.");
        }
    };

    handleGeneratePDF = () => {
        // Desestruturar todos os dados do estado
        const {
            tipoMateria, ano, numero, dataApresenta, protocolo, tipoApresentacao, tipoAutor, autor, apelido, camaraId,
            prazo, materiaPolemica, objeto, regTramita, status, dataPrazo, publicacao, isComplementar, tipoMateriaExt, footerConfig,
            numeroMateriaExt, anoMateriaExt, dataMateriaExt, titulo, ementa, indexacao, observacao, textoMateria, isSigned,
            logoBase64, signatureBase64
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
                {
                    text: `\n\nAssinado Digitalmente via Camara AI em: ${new Date().toLocaleString()}`,
                    alignment: 'center',
                    style: 'digitalSignatureInfo'
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
                    marginTop: 5,
                    italics: true
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
                    lineHeight: 1.3
                }
            }
        };

        // Geração do PDF
        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data });
        });
    };

    render() {
        const { pdfData, isSigned, showPdfPopup, showPasswordModal, passwordInput, passwordError, loadingConfig } = this.state;

        // Renderização Condicional: Chat ou Editor
        if (loadingConfig) {
            return (
                <div className='App-header' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <FaSpinner className="animate-spin" size={40} color="#126B5E" />
                </div>
            );
        }

        if (!this.state.showEditor) { // Se não estiver no editor, mostra o chat
            return (
                <div className='App-header'>
                    <MenuDashboard />
                    <div className='conteinar-Add-Products'>
                        <div style={{ width: '100%' }}>
                            {/* Chat de IA */}
                            <div className="ai-generation-card full-screen-ai">
                                <div className="ai-generation-header">
                                    <h3> Criar Matéria Legislativa</h3>
                                    <p> Assistente de Redação IA</p>
                                </div>
                                <div className="chat-interface-container" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div className="chat-messages" ref={this.chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                        {this.state.messages.map(msg => (
                                            <div key={msg.id} className={`message ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`}>
                                                <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.text }} />
                                            </div>
                                        ))}
                                        {this.state.isGenerating && (
                                            <div className="message message-ai">
                                                <div className="message-bubble">
                                                    <em>Digitando...</em>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={this.messagesEndRef} />
                                    </div>

                                    <div className="chat-input-area" style={{ borderTop: '1px solid #eee', padding: '15px', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                                        {this.state.fileName && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 15px', backgroundColor: '#e0f2f1', borderRadius: '10px', marginBottom: '10px', fontSize: '0.85rem', color: '#126B5E', alignSelf: 'flex-start' }}>
                                                <span>📎 {this.state.fileName}</span>
                                                <FaTrash
                                                    style={{ cursor: 'pointer', color: '#d32f2f' }}
                                                    onClick={() => this.setState({ file: null, fileBase64: null, fileName: '' })}
                                                />
                                            </div>
                                        )}
                                        <div className="search-box-wrapper-chat">
                                            <input
                                                type="file"
                                                id="file-attachment"
                                                style={{ display: 'none' }}
                                                onChange={this.handleFileChange}
                                            />
                                            <label htmlFor="file-attachment" className="smart-search-btn-chat" style={{ position: 'static', transform: 'none', marginRight: '10px', display: 'flex', backgroundColor: '#f0f2f5', color: '#555' }}>
                                                <FaPaperclip />
                                            </label>
                                            <input
                                                type="text"
                                                className="smart-search-input-chat"
                                                placeholder="Digite sua mensagem..."
                                                value={this.state.currentInput}
                                                onChange={(e) => this.setState({ currentInput: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && this.handleSendMessage()}
                                            />
                                            <button className="smart-search-btn-chat" onClick={this.handleSendMessage} disabled={this.state.isGenerating}>
                                                <FaPaperPlane />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // View do Editor
        return (
            <div className='App-header'>
                <MenuDashboard />
                <div className='conteinar-Add-Products'>
                    <div className="editor-container">
                        <div className="editor-header">
                            <h2><FaEdit /> Editor de Matéria</h2>
                            <button className="btn-back-chat" onClick={() => this.setState({ showEditor: false })}>Voltar ao Chat</button>
                        </div>

                        <div className="editor-split-view">
                            {/* Barra Lateral Esquerda - Formulário */}
                            <div className="editor-sidebar">
                                <h3>Detalhes da Matéria</h3>
                                <div className="editor-fields-column">
                                    <div className="editor-field">
                                        <label>Matéria (Tipo)</label>
                                        <input type="text" name="tipoMateria" value={this.state.tipoMateria} onChange={this.handleInputChange} />
                                    </div>
                                    <div className="editor-field">
                                        <label>Autor</label>
                                        <input type="text" name="autor" value={this.state.autor} onChange={this.handleInputChange} />
                                    </div>
                                    <div className="editor-field">
                                        <label>Apresentação</label>
                                        <select name="tipoApresentacao" value={this.state.tipoApresentacao} onChange={this.handleInputChange}>
                                            <option value="Escrita">Escrita</option>
                                            <option value="Oral">Oral</option>
                                        </select>
                                    </div>
                                    <div className="editor-field">
                                        <label>Tramitação</label>
                                        <select name="regTramita" value={this.state.regTramita} onChange={this.handleInputChange}>
                                            <option value="Ordinária">Ordinária</option>
                                            <option value="Urgência">Urgência</option>
                                            <option value="Especial">Especial</option>
                                        </select>
                                    </div>
                                    <div className="editor-field">
                                        <label>Exercício</label>
                                        <input type="number" name="ano" value={this.state.ano} onChange={this.handleInputChange} />
                                    </div>
                                </div>

                                <div className="editor-actions">
                                    {this.state.protocolGenerated ? (
                                        <div className="protocol-success">
                                            <FaCheckCircle /> Protocolo Gerado: {this.state.protocolGenerated}
                                            <p>Enviado para Parecer da Presidência.</p>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={this.openPasswordModal} className="btn-protocolar-final">
                                            Aprovar e Gerar Protocolo
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Área Principal Direita - Editor A4 */}
                            <div className="editor-main">
                                <div style={{ marginBottom: '15px', alignSelf: 'flex-end' }}>
                                    <button
                                        onClick={this.openPdfPopup}
                                        className="btn-secondary"
                                    >
                                        Visualizar PDF
                                    </button>
                                </div>
                                {/* Removida a simulação de página A4 que limitava a altura.
                                    O editor agora ocupa o espaço disponível, permitindo rolagem para conteúdo longo. */}
                                <ReactQuill
                                    theme="snow"
                                    value={this.state.textoMateria}
                                    onChange={this.handleEditorChange}
                                    modules={this.modules}
                                    formats={this.formats}
                                    className="full-page-quill-editor" // Classe para garantir que o editor preencha o contêiner
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popup de Preview do PDF */}
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

                {/* Modal de Senha para Assinatura */}
                {showPasswordModal && (
                    <div className="pdf-popup-overlay">
                        <div className="pdf-popup-content" style={{ maxWidth: '400px', height: 'auto', padding: '30px', textAlign: 'center' }}>
                            <h3>Assinatura Digital</h3>
                            <p style={{ marginBottom: '20px' }}>Digite sua senha para assinar e protocolar o documento.</p>

                            <input
                                type="password"
                                className="smart-search-input-chat"
                                style={{ width: '100%', marginBottom: '10px', border: '1px solid #ccc' }}
                                placeholder="Sua senha (ex: 123456)"
                                value={passwordInput}
                                onChange={this.handlePasswordChange}
                            />

                            {passwordError && <p style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{passwordError}</p>}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                                <button className="btn-back-chat" onClick={this.closePasswordModal} style={{ backgroundColor: '#ccc', color: '#333' }}>Cancelar</button>
                                <button className="btn-protocolar-final" onClick={this.confirmSignature}>Assinar Documento</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default AddProducts;