import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Importando imagem
import camera from '../assets/Camera.png';
import logo from '../assets/logo.png'

import MenuDashboard from '../componets/menuDashboard'

pdfMake.vfs = pdfFonts.pdfMake.vfs;

class AddProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            titulo: '',
            ementa: '',
            tipoMateria: '',
            tipoApresentacao: '',
            materiaPolemica: '',
            isComplementar: '',
            file: null,
            pdfData: null
        };
    }


    handleFileChange = (e) => {
        this.setState({ file: e.target.files[0] });
    };

    handleGeneratePDF = () => {
        const { titulo, ementa, tipoMateria, materiaPolemica, isComplementar } = this.state;

        const docDefinition = {
            content: [
                {
                    image: logo,
                    width: 150,
                    alignment: 'center'
                },
                {
                    text: 'Câmara Municipal de Teste',
                    alignment: 'center',
                    style: 'timbrado'
                },
                {
                    text: 'Protocolo: 2024/02/0003213124',
                    alignment: 'center'
                },
                {
                    text: titulo,
                    style: 'header',
                    alignment: 'center'
                },
                { text: ementa },
                {
                    text: [
                        { text: 'Tipo de Materia: ', bold: true },
                        { text:  tipoMateria },
                    ], style: 'descricoes'
                },
                { text: 'Materia Polêmica: ' + materiaPolemica, style: 'descricoes' },
                { text: 'Materia Complementar: ' + isComplementar, style: 'descricoes' },
                {
                    text: 'Autor: Prefeito Municipal',
                    style: 'descricoes'
                },
                {
                    text: 'Data: 00/00/0000',
                    style: 'descricoes'
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
                            <input type="text" name="titulo" placeholder="Titulo" onChange={(event) => { this.setState({ titulo: event.target.value }) }} />
                            <textarea name="ementa" placeholder="Ementa" onChange={(event) => this.setState({ ementa: event.target.value })} onFocus={this.handleGeneratePDF} />

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

                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ materiaPolemica: event.target.value })} onFocus={this.handleGeneratePDF} >
                                <option>Materia polêmica?</option>
                                <option>Sim</option>
                                <option>Não</option>
                            </select>

                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ isComplementar: event.target.value })} onFocus={this.handleGeneratePDF}>
                                <option>É Complementar?</option>
                                <option>Sim</option>
                                <option>Não</option>
                            </select>


                            <input type="file" onChange={this.handleFileChange} onFocus={this.handleGeneratePDF} />
                        </form>
                        <button type="button" onClick={this.handleGeneratePDF}>Protocolar Materia</button>
                    </div>
                    <div className='addImg'>
                        {pdfData && (
                            <iframe
                                title="Preview PDF"
                                src={`data:application/pdf;base64,${pdfData}`}
                                width="600"
                                height="400"
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
