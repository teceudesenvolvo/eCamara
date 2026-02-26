import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FaMagic, FaPaperPlane, FaFileAlt, FaCheckCircle, FaEdit } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Importando imagem
import camera from '../../assets/Camera.png';
import logo from '../../assets/logo.png';
import signature from '../../assets/assinatura-teste-1.png'; // Imagem da assinatura

import MenuDashboard from '../../componets/menuDashboard.jsx'; // Certifique-se de que este caminho está correto

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
            pdfData: null, // Dados do PDF em Base64

            // Para Assinatura Digital
            isSigned: false, // Booleano para controlar se o documento está assinado

            // Controle do preview PDF
            showPdfPopup: false, // Estado para controlar a visibilidade do popup do PDF

            // Estado da IA
            messages: [
                { id: 1, sender: 'ai', text: 'Olá! Sou a IA da Câmara. Para começarmos, qual é o tema ou assunto principal da matéria que você deseja criar?' }
            ],
            currentInput: '',
            isGenerating: false,
            chatStep: 0, // 0: Tema, 1: Tipo, 2: Detalhes
            showEditor: false, // Controla a exibição do editor
            protocolGenerated: null, // Armazena o protocolo gerado
            showPasswordModal: false, // Modal de senha
            passwordInput: '',
            passwordError: ''
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

    // Gerar PDF na montagem do componente e sempre que o estado do formulário muda
    componentDidMount() {
        this.handleGeneratePDF(); // Gera o PDF inicial
        this.scrollToBottom();
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
        this.setState({ file: e.target.files[0] }, () => {
            this.handleGeneratePDF(); // Gera PDF após o arquivo ser selecionado
        });
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

    // Função para gerar conteúdo com IA (Simulada)
    handleSendMessage = () => {
        const { currentInput, messages, chatStep } = this.state;
        if (!currentInput.trim()) return;

        const userMessage = { id: Date.now(), sender: 'user', text: currentInput };
        
        this.setState({
            messages: [...this.state.messages, userMessage],
            currentInput: '',
            isGenerating: true
        });

        // Simulação de delay de rede/processamento da IA
        setTimeout(() => {
            // Aqui entraria a chamada real para a API (OpenAI, etc.)
            let aiResponseText = '';
            let nextStep = chatStep;
            let nextStateUpdates = {};

            if (chatStep === 0) {
                // Usuário informou o Tema
                aiResponseText = `Entendido. O tema é "${userMessage.text}". Qual é o tipo desta matéria? (Ex: Projeto de Lei, Indicação, Requerimento, Moção)`;
                nextStep = 1;
                nextStateUpdates = { objeto: userMessage.text }; 
            } else if (chatStep === 1) {
                // Usuário informou o Tipo
                aiResponseText = `Certo, será um(a) ${userMessage.text}. Há algum detalhe específico ou justificativa que devo incluir no texto?`;
                nextStep = 2;
                nextStateUpdates = { tipoMateria: userMessage.text };
            } else if (chatStep === 2) {
                // Usuário informou Detalhes. Gerar.
                aiResponseText = `Perfeito! Estou gerando a minuta da matéria com base nas suas informações. Abrindo o editor...`;
                nextStep = 3;
                
                // Gerando dados fictícios baseados no chat
                const generatedData = {
                    tipoMateria: this.state.tipoMateria || 'Projeto de Lei',
                    ano: new Date().getFullYear().toString(),
                    numero: Math.floor(Math.random() * 1000) + '/2026',
                    dataApresenta: new Date().toISOString().split('T')[0],
                    protocolo: '', // Ainda não protocolado
                    tipoApresentacao: 'Escrita',
                    tipoAutor: 'Parlamentar',
                    autor: 'Vereador Usuário', // Mock
                    regTramita: 'Ordinária',
                    status: 'Em Elaboração',
                    titulo: (`${this.state.tipoMateria || 'Matéria'} sobre ${this.state.objeto}`).toUpperCase(),
                    ementa: `Dispõe sobre ${this.state.objeto} e dá outras providências.`,
                    textoMateria: `PROJETO DE LEI Nº ____/${new Date().getFullYear()}\n\n` +
                        `Súmula: Dispõe sobre ${this.state.objeto}.\n\n` +
                        `A CÂMARA MUNICIPAL APROVA:\n\n` +
                        `Art. 1º Fica estabelecido que ${this.state.objeto}, com a finalidade de atender aos interesses da coletividade.\n\n` +
                        `Art. 2º ${userMessage.text} \n\n` + 
                        `Art. 3º As despesas decorrentes da execução desta Lei correrão por conta das dotações orçamentárias próprias.\n\n` +
                        `Art. 4º Esta Lei entra em vigor na data de sua publicação.\n\n` +
                        `JUSTIFICATIVA\n\n` +
                        `A presente proposição tem por objetivo ${userMessage.text}. Trata-se de medida relevante para o município.\n\n` +
                        `Sala das Sessões, ${new Date().toLocaleDateString('pt-BR')}.`,
                    showEditor: true,
                    isGenerating: false
                };

                setTimeout(() => {
                    this.setState(generatedData);
                }, 1500);
            }

            this.setState(prevState => ({
                messages: [...prevState.messages, { id: Date.now() + 1, sender: 'ai', text: aiResponseText }],
                isGenerating: chatStep === 2 ? true : false, // Mantém loading se for gerar
                chatStep: nextStep,
                ...nextStateUpdates
            }));

        }, 1000);
    };

    handleProtocolar = () => {
        // Simula a geração de protocolo e envio para o presidente
        const newProtocol = `${new Date().getFullYear()}/${Math.floor(Math.random() * 100000)}`;
        
        this.setState({ 
            protocolGenerated: newProtocol,
            protocolo: newProtocol,
            status: 'Aguardando Parecer'
        }, () => {
            this.handleGeneratePDF(); // Atualiza PDF com o protocolo
            alert(`Documento Assinado Digitalmente e Protocolado!\nProtocolo: ${newProtocol}\nStatus: Enviado para Parecer da Presidência.`);
            this.props.history.push('/materias-dash');
        });
    };

    handleGeneratePDF = () => {
        // Desestruturar todos os dados do estado
        const {
            tipoMateria, ano, numero, dataApresenta, protocolo, tipoApresentacao, tipoAutor, autor, apelido,
            prazo, materiaPolemica, objeto, regTramita, status, dataPrazo, publicacao, isComplementar, tipoMateriaExt,
            numeroMateriaExt, anoMateriaExt, dataMateriaExt, titulo, ementa, indexacao, observacao, textoMateria, isSigned
        } = this.state;

        // Conteúdo base do PDF
        const docContent = [
            {
                image: logo, // Logo da Câmara
                width: 80,
                alignment: 'center'
            },
            {
                text: 'Câmara Municipal de Teste',
                alignment: 'center',
                style: 'timbrado'
            },
            {
                text: `Protocolo: ${protocolo || 'Não informado'}`, // Adiciona fallback
                alignment: 'center'
            },
            {
                text: titulo || 'Título da Matéria', // Adiciona fallback
                style: 'header',
                alignment: 'center'
            },
            {
                text: 'Identificação da Matéria',
                alignment: 'center',
                style: 'subheader'
            },
            { text: '\n' }, // Espaçamento

            // Identificação Básica
            { text: [{ text: 'Tipo de Matéria: ', bold: true }, tipoMateria || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Ano: ', bold: true }, ano || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Número: ', bold: true }, numero || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Data da Apresentação: ', bold: true }, dataApresenta || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Tipo de Apresentação: ', bold: true }, tipoApresentacao || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Autor: ', bold: true }, `${tipoAutor || ''} ${autor || 'Não informado'}`.trim()], style: 'infoText' },
            { text: '\n' },

            // Outras Informações
            {
                text: 'Outras Informações',
                alignment: 'center',
                style: 'subheader'
            },
            { text: '\n' },
            { text: [{ text: 'Apelido: ', bold: true }, apelido || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Prazo: ', bold: true }, `${prazo || 'Não informado'} dias`], style: 'infoText' },
            { text: [{ text: 'Matéria Polêmica: ', bold: true }, materiaPolemica || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Objeto: ', bold: true }, objeto || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Regime de Tramitação: ', bold: true }, regTramita || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Situação: ', bold: true }, status || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Fim do Prazo: ', bold: true }, dataPrazo || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'Publicação: ', bold: true }, publicacao || 'Não informado'], style: 'infoText' },
            { text: [{ text: 'É Complementar: ', bold: true }, isComplementar || 'Não informado'], style: 'infoText' },
            { text: '\n' },

            // Origem Externa (apenas se houver dados)
            (tipoMateriaExt || numeroMateriaExt || anoMateriaExt || dataMateriaExt) && {
                text: 'Origem Externa',
                alignment: 'center',
                style: 'subheader'
            },
            (tipoMateriaExt || numeroMateriaExt || anoMateriaExt || dataMateriaExt) && { text: '\n' },
            tipoMateriaExt && { text: [{ text: 'Tipo Matéria Externa: ', bold: true }, tipoMateriaExt], style: 'infoText' },
            numeroMateriaExt && { text: [{ text: 'Número Matéria Externa: ', bold: true }, numeroMateriaExt], style: 'infoText' },
            anoMateriaExt && { text: [{ text: 'Ano Matéria Externa: ', bold: true }, anoMateriaExt], style: 'infoText' },
            dataMateriaExt && { text: [{ text: 'Data Matéria Externa: ', bold: true }, dataMateriaExt], style: 'infoText' },
            (tipoMateriaExt || numeroMateriaExt || anoMateriaExt || dataMateriaExt) && { text: '\n' },

            // Dados Textuais
            {
                text: 'Dados Textuais',
                alignment: 'center',
                style: 'subheader'
            },
            { text: '\n' },
            { text: [{ text: 'Ementa: ', bold: true }, ementa || 'Não informado'], style: 'descricoes' },
            { text: [{ text: 'Indexação: ', bold: true }, indexacao || 'Não informado'], style: 'descricoes' },
            { text: [{ text: 'Observação: ', bold: true }, observacao || 'Não informado'], style: 'descricoes' },

            // Minuta da Lei (Se houver)
            textoMateria && { text: '\n\n' },
            textoMateria && { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            textoMateria && { text: '\nMINUTA DO PROJETO (Gerada por IA)', style: 'subheader', alignment: 'center' },
            textoMateria && { text: this.stripHtml(textoMateria), style: 'textoLei' },
        ].filter(Boolean); // Filtra elementos falsy (como os blocos de Origem Externa vazios)

        // Adiciona a assinatura digital se isSigned for true
        if (isSigned) {
            docContent.push(
                {
                    text: '\n\n' // Espaço antes da assinatura
                },
                {
                    image: signature, // Imagem da assinatura
                    width: 150,
                    alignment: 'center',
                    style: 'assinatura'
                },
                {
                    text: '___________________________________________________',
                    alignment: 'center',
                    style: 'underline'
                },
                {
                    text: autor || 'Autor não informado', // Nome do autor abaixo da assinatura
                    alignment: 'center',
                    style: 'small'
                },
                {
                    text: `Assinado Digitalmente em: ${new Date().toLocaleString()}, Blu Legis`,
                    alignment: 'center',
                    style: 'digitalSignatureInfo'
                }
            );
        }

        const docDefinition = {
            content: docContent,
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
                textoLei: {
                    fontSize: 11,
                    alignment: 'justify',
                    lineHeight: 1.5,
                    marginTop: 15
                }
            }
        };

        // Geração do PDF
        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data });
        });
    };

    render() {
        const { pdfData, isSigned, showPdfPopup, showPasswordModal, passwordInput, passwordError } = this.state;

        // Renderização Condicional: Chat ou Editor
        if (!this.state.showEditor) {
            return (
                <div className='App-header'>
                    <MenuDashboard />
                    <div className='conteinar-Add-Products'>
                        <div style={{ width: '100%' }}>
                            {/* Chat de IA */}
                            <div className="ai-generation-card full-screen-ai">
                            <h3><FaMagic /> Assistente de Redação IA</h3>
                            <div className="chat-interface-container" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div className="chat-messages" ref={this.chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                    {this.state.messages.map(msg => (
                                        <div key={msg.id} className={`message ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`}>
                                            <div className="message-bubble">
                                                {msg.text}
                                            </div>
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
                                
                                <div className="chat-input-area" style={{ borderTop: '1px solid #eee', padding: '15px', backgroundColor: 'white' }}>
                                    <div className="search-box-wrapper-chat">
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
                                <div className="editor-text-area-wrapper">
                                    <div className="a4-page">
                                        <div className="a4-header">
                                            <img src={logo} alt="Brasão" className="a4-logo" />
                                            <div className="a4-header-text">
                                                <h3>Câmara Municipal</h3>
                                                <p>Estado do Ceará</p>
                                            </div>
                                        </div>
                                        <div className="a4-content">
                                            <ReactQuill 
                                                theme="snow"
                                                value={this.state.textoMateria} 
                                                onChange={this.handleEditorChange} 
                                                modules={this.modules}
                                                formats={this.formats}
                                                className="quill-editor-a4"
                                            />
                                        </div>
                                        <div className="a4-footer">
                                            <p>Rua XV de Novembro, 55 - Centro - Blumenau/SC</p>
                                        </div>
                                    </div>
                                </div>
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