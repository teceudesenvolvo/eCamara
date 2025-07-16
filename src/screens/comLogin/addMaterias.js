import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Importando imagem
import camera from '../../assets/Camera.png';
import logo from '../../assets/logo.png';
import signature from '../../assets/assinatura-teste-1.png'; // Imagem da assinatura

import MenuDashboard from '../../componets/menuDashboard'; // Certifique-se de que este caminho está correto

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
                    <div>
                        <form>
                            <h1>Adicionar Matéria</h1>
                            <p>Identificação Básica</p>
                            <select
                                className='conteinar-Add-Products-select'
                                name="tipoMateria"
                                value={this.state.tipoMateria}
                                onChange={this.handleInputChange}
                            >
                                <option value="">Tipo de Materia</option>
                                <option value="Projeto de Lei Legislativo">Projeto de Lei Legislativo</option>
                                <option value="Proj. Lei Legislativo Substitutivo">Proj. Lei Legislativo Substitutivo</option>
                                <option value="Proj. Lei Complementar Legislativo">Proj. Lei Complementar Legislativo</option>
                                <option value="Projeto de Decreto Legislativo">Projeto de Decreto Legislativo</option>
                                <option value="Projeto de Lei Executivo Substitutivo">Projeto de Lei Executivo Substitutivo</option>
                                <option value="Projeto de Lei Complementar Executivo">Projeto de Lei Complementar Executivo</option>
                                <option value="Razões do Veto">Razões do Veto</option>
                                <option value="Requerimento Urgência">Requerimento Urgência</option>
                                <option value="Projeto de Emenda">Projeto de Emenda</option>
                                <option value="Pedido de Prorrogação">Pedido de Prorrogação</option>
                                <option value="Emenda">Emenda</option>
                                <option value="Parecer">Parecer</option>
                                <option value="Projeto de Resolução">Projeto de Resolução</option>
                                <option value="Requerimento">Requerimento</option>
                                <option value="Moção">Moção</option>
                            </select>
                            <input type='number' name="ano" placeholder="Ano da Materia" value={this.state.ano} onChange={this.handleInputChange} />
                            <input type="text" name="numero" placeholder="Número da Matéria" value={this.state.numero} onChange={this.handleInputChange} />
                            <br /><label className='labelform-materia'>Data da Apresentação</label><br />
                            <input type="date" name="dataApresenta" placeholder='Data da Apresentação' value={this.state.dataApresenta} onChange={this.handleInputChange} />
                            <input type='text' name="protocolo" placeholder="Protocolo da Matéria" value={this.state.protocolo} onChange={this.handleInputChange} />


                            <select name="tipoApresentacao" className="conteinar-Add-Products-select" value={this.state.tipoApresentacao} onChange={this.handleInputChange}>
                                <option value="">Tipo de Apresentação</option>
                                <option value="Oral">Oral</option>
                                <option value="Escrita">Escrita</option>
                            </select>

                            <select name="tipoAutor" className="conteinar-Add-Products-select" value={this.state.tipoAutor} onChange={this.handleInputChange}>
                                <option value="">Tipo de Autor</option>
                                <option value="Bancada">Bancada</option>
                                <option value="Bloco Parlamentar">Bloco Parlamentar</option>
                                <option value="Comissão">Comissão</option>
                                <option value="Externo">Externo</option>
                                <option value="Frente Parlamentar">Frente Parlamentar</option>
                                <option value="Mesa Diretora">Mesa Diretora</option>
                                <option value="Órgão">Órgão</option>
                                <option value="Parlamentar">Parlamentar</option>
                            </select>
                            <input type='text' name="autor" placeholder="Autor" value={this.state.autor} onChange={this.handleInputChange} />

                            <br /><label className='labelform-materia'>Texto Original</label><br />
                            <input type="file" onChange={this.handleFileChange} />

                            <p>Outras Informações</p>
                            <input type='text' name="apelido" placeholder="Apelido" value={this.state.apelido} onChange={this.handleInputChange} />
                            <input type='number' name="prazo" placeholder="Dias de Prazo" value={this.state.prazo} onChange={this.handleInputChange} />

                            <select className='conteinar-Add-Products-select' name="materiaPolemica" value={this.state.materiaPolemica} onChange={this.handleInputChange} >
                                <option value="">Matéria polêmica?</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                            <input type='text' name="objeto" placeholder="Objeto" value={this.state.objeto} onChange={this.handleInputChange} />

                            <select name="regTramita" className="conteinar-Add-Products-select" value={this.state.regTramita} onChange={this.handleInputChange}>
                                <option value="">Regime de Tramitação</option>
                                <option value="Ordinária">Ordinária</option>
                                <option value="Urgência">Urgência</option>
                                <option value="Prioridade">Prioridade</option>
                                <option value="Especial - Veto">Especial - Veto</option>
                                <option value="Especial - Leis Orçamentárias">Especial - Leis orçamentárias</option>
                            </select>

                            <select name="status" className="conteinar-Add-Products-select" value={this.state.status} onChange={this.handleInputChange}>
                                <option value="">Em Tramitação?</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>

                            <br /><label className='labelform-materia'>Data Fim do Prazo</label><br />
                            <input type='date' name="dataPrazo" placeholder="Data Fim do Prazo" value={this.state.dataPrazo} onChange={this.handleInputChange} />
                            <br /><label className='labelform-materia'>Data da Publicação</label><br />
                            <input type='date' name="publicacao" placeholder="Data da Publicação" value={this.state.publicacao} onChange={this.handleInputChange} />


                            <select className='conteinar-Add-Products-select' name="isComplementar" value={this.state.isComplementar} onChange={this.handleInputChange}>
                                <option value="">É Complementar?</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>

                            <p>Origem Externa</p>
                            <select name="tipoMateriaExt" className="conteinar-Add-Products-select" value={this.state.tipoMateriaExt} onChange={this.handleInputChange}>
                                <option value="">Tipo Matéria Externa</option>
                                <option value="Parecer Prévio do Tribunal de Contas">Parecer Prévio do Tribunal de Contas</option>
                                <option value="Veto">Veto</option>
                                <option value="Projeto de Emenda à Lei Orgânica">Projeto de Emenda à Lei Orgânica</option>
                                <option value="Projeto de Lei Complementar">Projeto de Lei Complementar</option>
                                <option value="Projeto de Lei Ordinária">Projeto de Lei Ordinária</option>
                                <option value="Projeto de Decreto Legislativo">Projeto de Decreto Legislativo</option>
                                <option value="Projeto de Resolução">Projeto de Resolução</option>
                                <option value="Indicação">Indicação</option>
                                <option value="Moção">Moção</option>
                                <option value="Requerimento">Requerimento</option>
                                <option value="Recurso">Recurso</option>
                                <option value="Requerimento de Urgência Especial">Requerimento de Urgência Especial</option>
                                <option value="Requerimento de CPI">Requerimento de CPI</option>
                            </select>

                            <input type='number' name="numeroMateriaExt" placeholder="Numero da Materia Externa" value={this.state.numeroMateriaExt} onChange={this.handleInputChange} />
                            <input type='number' name="anoMateriaExt" placeholder="Ano da Materia Externa" value={this.state.anoMateriaExt} onChange={this.handleInputChange} />
                            <br /><label className='labelform-materia'>Data da Materia</label><br />
                            <input type='date' name="dataMateriaExt" placeholder="Data Materia Externa" value={this.state.dataMateriaExt} onChange={this.handleInputChange} />


                            <p>Dados Textuais</p>
                            <input type="text" name="titulo" placeholder="Titulo" value={this.state.titulo} onChange={this.handleInputChange} />
                            <textarea name="ementa" placeholder="Ementa" value={this.state.ementa} onChange={this.handleInputChange} />
                            <textarea name="indexacao" placeholder="Indexação" value={this.state.indexacao} onChange={this.handleInputChange} />
                            <textarea name="observacao" placeholder="Observação" value={this.state.observacao} onChange={this.handleInputChange} />

                        </form>
                        {isSigned ? (
                            <p style={{ color: 'green', fontSize: '12px' }}>Documento Assinado Digitalmente por Blu Legis</p>
                        ) : (
                            <>
                                <button className='btn-assinar' type="button" onClick={this.handleSignDocument}>
                                    Assinar Documento
                                </button>
                            </>
                        )}
                        {/* Novo botão para visualizar PDF, dentro do fluxo do formulário */}
                        {pdfData && (
                            <button type="button" className='btn-visualizar-pdf' onClick={this.openPdfPopup} style={{ marginTop: '20px' }}>
                                Visualizar PDF
                            </button>
                        )}
                        {/* Botão "Gerar Protocolo" que navega para /materias-dash */}
                        <button type="button" onClick={() => this.props.history.push('/materias-dash')} style={{ marginTop: '20px', marginRight: '10px' }}>
                            Protocolar Matéria
                        </button>

                    </div>
                    {/* O botão flutuante "Visualizar PDF" permanece fixo no canto da tela */}
                    {pdfData ? (
                        <button type="button" onClick={this.openPdfPopup} className="preview-pdf-button-fixed">
                            Visualizar PDF
                        </button>
                    ) : (
                        <div className='addImg'> {/* Mantém a div addImg para a imagem da câmera quando o PDF não é gerado */}
                            <img src={camera} alt="Câmera" />
                            <p>Preencha o formulário para gerar o PDF.</p>
                        </div>
                    )}
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
