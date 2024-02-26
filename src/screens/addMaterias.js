import React, { Component } from 'react';



//Imagens
import camera from '../assets/Camera.png';
// Icones


// Components
import MenuDashboard from '../componets/menuDashboard';


//mudança de páginas

class addProducts extends Component {
    render() {
        return (

            <div className='App-header' >
                <MenuDashboard />
                <div className='conteinar-Add-Products'>
                    <div>
                        <form>
                            
                        <h1>Adicionar Matéria</h1>
                        <input type="text" placeholder="Titulo" className='conteinar-Add-Products-select' />
                        <input type="text" placeholder="Ementa" className='conteinar-Add-Products-select' />
                        <select placeholder='Tipo de Materia' className='conteinar-Add-Products-select'>
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

                        <select className='conteinar-Add-Products-select'>
                            <option>Tipo de Apresentação</option>
                        </select>
                        
                        <select className='conteinar-Add-Products-select'>
                            <option>Materia polêmica?</option>
                            <option>Sim</option>
                            <option>Não</option>
                        </select>
                        
                        <select className='conteinar-Add-Products-select'>
                            <option>É Complementar?</option>
                            <option>Sim</option>
                            <option>Não</option>
                        </select>

                        
                        <input type="file" className='conteinar-Add-Products-select' />


                        </form>

                        <button type="submit" name="Add" value="Add" className='btnProtocolar' >Protocolar</button>
                    </div>
                    <div className='addImg'>

                        <div>
                            <img src={camera} alt={camera}></img>
                        </div>

                    </div>

                </div>

            </div>
        );
    }
}

export default addProducts;