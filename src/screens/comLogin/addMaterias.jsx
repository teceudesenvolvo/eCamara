import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FaMagic } from 'react-icons/fa';

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

            file: null, // Para upload de arquivo
            pdfData: null, // Dados do PDF em Base64

            // Para Assinatura Digital
            isSigned: false, // Booleano para controlar se o documento está assinado

            // Controle do preview PDF
            showPdfPopup: false, // Estado para controlar a visibilidade do popup do PDF

            // Estado da IA
            aiPrompt: '',
            isGenerating: false,
        };
    }

    // Gerar PDF na montagem do componente e sempre que o estado do formulário muda
    componentDidMount() {
        this.handleGeneratePDF(); // Gera o PDF inicial
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

    // Função para gerar conteúdo com IA (Simulada)
    handleGenerateAI = () => {
        const { aiPrompt } = this.state;
        if (!aiPrompt.trim()) {
            alert("Por favor, descreva a matéria para a IA gerar a minuta.");
            return;
        }

        this.setState({ isGenerating: true });

        // Simulação de delay de rede/processamento da IA
        setTimeout(() => {
            // Aqui entraria a chamada real para a API (OpenAI, etc.)
            // Gerando dados fictícios baseados no prompt para demonstração
            const generatedData = {
                tipoMateria: 'Projeto de Lei Legislativo',
                ano: new Date().getFullYear().toString(),
                numero: Math.floor(Math.random() * 1000) + '/2026',
                dataApresenta: new Date().toISOString().split('T')[0],
                protocolo: Date.now().toString().slice(-8),
                tipoApresentacao: 'Escrita',
                tipoAutor: 'Parlamentar',
                autor: 'Vereador Usuário', // Em produção, viria do contexto do usuário logado
                apelido: aiPrompt.split(' ').slice(0, 3).join(' '),
                prazo: '45',
                materiaPolemica: 'Não',
                objeto: 'Dispõe sobre ' + aiPrompt,
                regTramita: 'Ordinária',
                status: 'Sim',
                titulo: ('Projeto de Lei: ' + aiPrompt).toUpperCase(),
                ementa: `Institui diretrizes e normas sobre ${aiPrompt} no âmbito do município, visando o bem-estar social e o desenvolvimento local.`,
                indexacao: `legislação, municipal, ${aiPrompt.split(' ')[0]}, inovação`,
                observacao: 'Minuta gerada automaticamente por Inteligência Artificial (Camara AI). Requer revisão técnica.'
            };

            this.setState({ ...generatedData, isGenerating: false }, () => {
                this.handleGeneratePDF(); // Regenera o PDF com os novos dados
            });
        }, 2000);
    };

    handleGeneratePDF = () => {
        // Desestruturar todos os dados do estado
        const {
            tipoMateria, ano, numero, dataApresenta, protocolo, tipoApresentacao, tipoAutor, autor, apelido,
            prazo, materiaPolemica, objeto, regTramita, status, dataPrazo, publicacao, isComplementar, tipoMateriaExt,
            numeroMateriaExt, anoMateriaExt, dataMateriaExt, titulo, ementa, indexacao, observacao, isSigned
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
                }
            }
        };

        // Geração do PDF
        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data });
        });
    };

    render() {
        const { pdfData, isSigned, showPdfPopup } = this.state;

        return (
            <div className='App-header'>
                <MenuDashboard />
                <div className='conteinar-Add-Products'>
                    <div style={{ width: '100%' }}>
                        {/* Seção de IA */}
                        <div className="ai-generation-card full-screen-ai">
                            <h3><FaMagic /> Assistente de Redação IA</h3>
                            <div className="chat-interface-container">
                                <p>Descreva a matéria que deseja protocolar (ex: "Criar um projeto de lei para incentivo ao esporte nas escolas") e nossa IA preencherá a minuta inicial para você.</p>
                                <textarea 
                                    className="ai-textarea chat-textarea-expanded"
                                    placeholder="Digite aqui sua ideia para a IA..."
                                    value={this.state.aiPrompt}
                                    onChange={(e) => this.setState({ aiPrompt: e.target.value })}
                                />
                                <div className="ai-button-wrapper">
                                    <button 
                                        type="button" 
                                        className="btn-ai-generate"
                                        onClick={this.handleGenerateAI}
                                        disabled={this.state.isGenerating}
                                    >
                                        {this.state.isGenerating ? 'Gerando Minuta...' : 'Gerar Matéria com IA'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {pdfData && (
                            <div className="generated-actions">
                                {isSigned ? (
                                    <p style={{ color: 'green', fontSize: '12px', margin: '10px' }}>Documento Assinado Digitalmente por Blu Legis</p>
                                ) : (
                                    <button className='btn-assinar' type="button" onClick={this.handleSignDocument}>
                                        Assinar Documento
                                    </button>
                                )}
                                
                                <button type="button" className='btn-visualizar-pdf' onClick={this.openPdfPopup}>
                                    Visualizar PDF
                                </button>
                                
                                <button type="button" onClick={() => this.props.history.push('/materias-dash')} className="btn-protocolar">
                                    Protocolar Matéria
                                </button>
                            </div>
                        )}
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
            </div>
        );
    }
}

export default AddProducts;