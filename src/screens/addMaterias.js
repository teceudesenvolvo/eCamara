import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Importando imagem
import camera from '../assets/Camera.png';
import logo from '../assets/logo.png'
import signature from '../assets/assinatura-teste-1.png'

import MenuDashboard from '../componets/menuDashboard'

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
            prazo: 'em',
            materiaPolemica: '',
            objeto: '',
            regTramita: '',
            status: '',
            dataPrazo:'',
            publicacao:'',
            isComplementar: '',
            
            // Origem Externa
            tipoMateriaExt:'',
            numeroMateriaExt: '',
            anoMateriaExt: '',
            dataMateriaExt: '',
            
            // Dados Textuais
            titulo: '',
            ementa: '',
            indexacao: '',
            observacao: '',

            file: null,
            pdfData: null
        };
    }


    handleFileChange = (e) => {
        this.setState({ file: e.target.files[0] });
    };

    handleGeneratePDF = () => {
        const { tipoMateria, ano, numero, dataApresenta, protocolo, tipoApresentacao, tipoAutor, autor, apelido,
            prazo, materiaPolemica, objeto, regTramita, status, dataPrazo, publicacao, isComplementar, tipoMateriaExt,
            numeroMateriaExt, anoMateriaExt, dataMateriaExt, titulo, ementa, indexacao, observacao
         } = this.state;

        const docDefinition = {
            content: [
                {
                    image: logo,
                    width: 80,
                    alignment: 'center'
                },
                {
                    text: 'Câmara Municipal de Teste',
                    alignment: 'center',
                    style: 'timbrado'
                },
                {
                    text: `Protocolo: ${protocolo}`,
                    alignment: 'center'
                },
                {
                    text: titulo,
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: 'Identificação da Materia',
                    alignment: 'center',
                    style: 'timbrado'
                },
                
                {
                    text: [
                        { text: 'Tipo de Materia: ', bold: true },
                        { text:  tipoMateria },
                    ], style: 'descricoes'
                },
                { text: 'Ano: ' + ano },
                { text: 'Numero: ' + numero },
                { text: 'Data: ' + dataApresenta },
                { text: 'Apresentação: ' + tipoApresentacao },
                { text: 'Materia Polêmica: ' + materiaPolemica },
                { text: 'Materia Complementar: ' + isComplementar },
                { text: 'Autor: ' + tipoAutor + " " + autor },

                {
                    text: 'Informações Complementares',
                    alignment: 'center',
                    style: 'timbrado'
                },
                { text: 'Apelido: ' + apelido },
                { text: 'Prazo: ' + prazo + ' dias' },
                { text: 'Matéria Polêmica: ' + materiaPolemica },
                { text: 'objeto: ' + objeto },
                { text: 'Regime de Tramitação: ' + regTramita },
                { text: 'Situação' + status },
                { text: 'Fim do Prazo: ' + dataPrazo },
                { text: 'Publicação: ' + publicacao },
                { text: 'Matéria Complementar: ' + isComplementar },
                
                // Origem Externa
                { text: tipoMateriaExt },
                { text: numeroMateriaExt },
                { text: anoMateriaExt },
                { text: dataMateriaExt },


                
                { text: 'Ementa: ' + ementa, style: 'descricoes' },
                { text: 'Indexação: ' + indexacao, style: 'descricoes' },
                { text: 'Observação: ' + observacao, style: 'descricoes' },
                {
                    image: signature,
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
                    text: autor,
                    alignment: 'center',
                    style: 'small'
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    marginBottom: 20,
                    marginTop: 20,
                },
                subheader: {
                    fontSize: 15,
                    bold: true
                },
                descricoes: {
                    marginTop: 20,
                },
                timbrado: {
                    fontSize: 12,
                    bold: true,
                    marginBottom: 20
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                },
                assinatura: {
                    marginTop: 50
                },
                underline: {
                    marginTop: -20
                }
            }
        };


        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data });
        });


    };

    componentDidMount = () => {
        this.handleGeneratePDF();
        setInterval(this.handleGeneratePDF, 30000);
    }




    render() {
        const { pdfData } = this.state;
        console.log(pdfData)

        return (
            <div className='App-header' >
                <MenuDashboard />
                <div className='conteinar-Add-Products'>
                    <div>
                        <form>
                            <h1>Adicionar Matéria</h1>
                            <p>Identificação Básica</p>
                            <select placeholder='Tipo de Materia' className='conteinar-Add-Products-select' onChange={(event) => this.setState({ tipoMateria: event.target.value })} onFocus={this.handleGeneratePDF}>
                                <option>Tipo de Materia</option>
                                <option>Projeto de Lei Legislativo</option>
                                <option>Proj. Lei Legislativo Substitutivo</option>
                                <option>Proj. Lei Complementar Legislativo</option>
                                <option>Projeto de Decreto Legislativo</option>
                                <option>Projeto de Lei Executivo Substitutivo</option>
                                <option>Projeto de Lei Complementar Executivo</option>
                                <option>Razões do Veto</option>
                                <option>Requerimento Urgência</option>
                                <option>Projeto de Emenda</option>
                                <option>Pedido de Prorrogação</option>
                                <option>Emenda</option>
                                <option>Parecer</option>
                                <option>Projeto de Resolução</option>
                                <option>Requerimento</option>
                                <option>Moção</option>
                            </select>
                            <input type='number' name="ano" placeholder="Ano da Materia" onChange={(event) => { this.setState({ ano: event.target.value }) }} onFocus={this.handleGeneratePDF} />
                            <input type="text" name="numero" placeholder="Número da Matéria" onChange={(event) => { this.setState({ numero: event.target.value }) }} onFocus={this.handleGeneratePDF}/>
                            <br/><label className='labelform-materia'>Data da Apresentação</label><br/>
                            <input type="date" name="dataApresentação" placeholder='Data da Apresentação' onChange={(event) => { this.setState({ dataApresenta: event.target.value }) }}  />
                            {/* <input type='text' name="protocolo" placeholder="Protocolo da Matéria" onChange={(event) => { this.setState({ protocolo: event.target.value }) }}  /> */}

                            <select name="tipo_apresentacao" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoApresentacao: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Tipo de Apresentação</option> 
                                <option value="Oral">Oral</option> 
                                <option value="Escrita">Escrita</option>
                            </select>     

                            <select name="tipo_autor" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoAutor: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Tipo de Autor</option> 
                                <option value="Bancada">Bancada</option> 
                                <option value="Bloco Parlamentar">Bloco Parlamentar</option> 
                                <option value="Comissão">Comissão</option> 
                                <option value="Externo">Externo</option> 
                                <option value="Frente Parlamentar">Frente Parlamentar</option> 
                                <option value="Mesa Diretora">Mesa Diretora</option> 
                                <option value="Órgão">Órgão</option> 
                                <option value="Parlamentar">Parlamentar</option>
                            </select>     
                            <input type='text' name="autor" placeholder="Autor" onChange={(event) => { this.setState({ autor: event.target.value }) }} onFocus={this.handleGeneratePDF} />     

                            <br/><label className='labelform-materia'>Texto Original</label><br/>
                            <input type="file" onChange={this.handleFileChange} onFocus={this.handleGeneratePDF} />
                            
                            <p>Outras Informações</p>
                            <input type='text' name="Apelido" placeholder="Apelido" onChange={(event) => { this.setState({ apelido: event.target.value }) }} onFocus={this.handleGeneratePDF} />     
                            <input type='number' name="Dias de Prazo" placeholder="Dias de Prazo" onChange={(event) => { this.setState({ prazo: event.target.value }) }}  onFocus={this.handleGeneratePDF}/>     

                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ materiaPolemica: event.target.value })} onFocus={this.handleGeneratePDF} >
                                <option value="">Materia polêmica?</option>
                                <option value="sim">Sim</option>
                                <option value="não">Não</option>
                            </select>
                            <input type='text' name="Objeto" placeholder="Objeto" onChange={(event) => { this.setState({ objeto: event.target.value }) }} onFocus={this.handleGeneratePDF} />     
                            
                            <select name="regime_tramitacao" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ regTramita: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Regime de Tramitação</option> 
                                <option value="Ordinária">Ordinária</option> 
                                <option value="Urgência">Urgência</option> 
                                <option value="Prioridade">Prioridade</option> 
                                <option value="Veto">Especial - Veto</option> 
                                <option value="Leis Orçamentárias">Especial - Leis orçamentárias</option>
                            </select>

                            <select name="em_tramitacao" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ status: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="">Em Tramitação?</option> 
                                <option value="sim">Sim</option> 
                                <option value="não">Não</option>
                            </select>
                            
                            <br/><label className='labelform-materia'>Data Fim do Prazo</label><br/>
                            <input type='date' name="Data Fim Prazo" placeholder="Data Fim do Prazo" onChange={(event) => { this.setState({ dataPrazo: event.target.value }) }}  />     
                            <br/><label className='labelform-materia'>Data da Publicação</label><br/>
                            <input type='date' name="Data Publicação" placeholder="Data da Publicação" onChange={(event) => { this.setState({ publicacao: event.target.value }) }}  />     


                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ isComplementar: event.target.value })} onFocus={this.handleGeneratePDF}>
                                <option value="">É Complementar?</option>
                                <option value="sim">Sim</option>
                                <option value="não">Não</option>
                            </select>

                            <p>Origem Externa</p>
                            <select name="tipo_origem_externa" class="conteinar-Add-Products-select"  onChange={(event) => this.setState({ tipoMateriaExt: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Tipo Materia Externa</option> 
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
                            
                            <input type='number' name="Numero da Materia" placeholder="Numero da Materia Externa" onChange={(event) => { this.setState({ numeroMateriaExt: event.target.value }) }} onFocus={this.handleGeneratePDF} />     
                            <input type='number' name="ano" placeholder="Ano da Materia Externa" onChange={(event) => { this.setState({ anoMateriaExt: event.target.value }) }} onFocus={this.handleGeneratePDF} />
                            <br/><label className='labelform-materia'>Data da Materia</label><br/>
                            <input type='date' name="Data Materia" placeholder="Data Materia Externa" onChange={(event) => { this.setState({ apelido: event.target.value }) }} onFocus={this.handleGeneratePDF} />     

                            

                            <p>Dados Textuais</p>
                            <input type="text" name="titulo" placeholder="Titulo" onChange={(event) => { this.setState({ titulo: event.target.value }) }} onFocus={this.handleGeneratePDF} />
                            <textarea name="ementa" placeholder="Ementa" onChange={(event) => this.setState({ ementa: event.target.value })} onFocus={this.handleGeneratePDF} />
                            <textarea name="Indexação" placeholder="Indexação" onChange={(event) => this.setState({ indexacao: event.target.value })} onFocus={this.handleGeneratePDF} />
                            <textarea name="Observação" placeholder="Observação" onChange={(event) => this.setState({ observacao: event.target.value })} onFocus={this.handleGeneratePDF} />

                            


                           
                        </form>
                        <button type="button" onClick={this.handleGeneratePDF}>Protocolar Materia</button>
                    </div>
                    <div className='addImg'>
                        {pdfData && (
                            <iframe
                                title="Preview PDF"
                                src={`data:application/pdf;base64,${pdfData}`}
                                width="600"
                                height="800"
                                frameBorder="0"
                                className='addImg'
                            />
                        )}
                        {!pdfData && (
                            <div>
                                <img src={camera} alt={camera} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default AddProducts;
