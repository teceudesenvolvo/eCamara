import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Importando imagem
import camera from '../assets/Camera.png';

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
        const { titulo, ementa, tipoMateria, tipoApresentacao, materiaPolemica, isComplementar } = this.state;
    
        const docDefinition = {
          content: [
            { text: 'Titulo: ' + titulo },
            { text: 'Ementa: ' + ementa },
            { text: 'Tipo de Materia: ' + tipoMateria },
            { text: 'Tipo de Apresentacao: ' + tipoApresentacao },
            { text: 'Materia polemica: ' + materiaPolemica },
            { text: 'É Complementar: ' + isComplementar }
          ]
        };
    
        pdfMake.createPdf(docDefinition).getBase64((data) => {
          this.setState({ pdfData: data });
        });
      };

    render() {
        const { pdfData } = this.state;
        console.log(pdfData)

        return (
            <div className='App-header' >
                <div className='conteinar-Add-Products'>
                    <div>
                        <form>
                            <h1>Adicionar Matéria</h1>
                            <input type="text" name="titulo" placeholder="Titulo" onChange={(event) => this.setState({ titulo: event.target.value })} />
                            <input type="text" name="ementa" placeholder="Ementa" onChange={(event) => this.setState({ ementa: event.target.value })} />

                            <select placeholder='Tipo de Materia' className='conteinar-Add-Products-select' onChange={(event) => this.setState({ tipoMateria: event.target.value })}>
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

                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ tipoApresentacao: event.target.value })}>
                                <option>Tipo de Apresentação</option>
                            </select>

                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ materiaPolemica: event.target.value })}>
                                <option>Materia polêmica?</option>
                                <option>Sim</option>
                                <option>Não</option>
                            </select>

                            <select className='conteinar-Add-Products-select' onChange={(event) => this.setState({ isComplementar: event.target.value })}>
                                <option>É Complementar?</option>
                                <option>Sim</option>
                                <option>Não</option>
                            </select>


                            <input type="file" onChange={this.handleFileChange} />
                        </form>
                        <button type="button" onClick={this.handleGeneratePDF}>Gerar PDF</button>
                    </div>
                    <div className='addImg'>
                        {pdfData && (
                            <iframe
                                title="Preview PDF"
                                src={`data:application/pdf;base64,${pdfData}`}
                                width="600"
                                height="400"
                                frameBorder="0"
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
