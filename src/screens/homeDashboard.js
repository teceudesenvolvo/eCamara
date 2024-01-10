import React, { Component } from 'react';



//Imagens

// Icones
import {


} from 'react-icons/fa';

// Components
import SlideFeacures from '../componets/slideFeactures';


//mudança de páginas

class homeDashboard extends Component {
    render() {
        return (

            <div className='App-header' >
                <div className='Home-Dach'>
                    <div className='header-Dach'>
                        <dvi className='header-Dach-div'>
                            <h1>Balanço Legislativo</h1>
                        </dvi>




                    </div>
                    <div className='Conteiner-Home-Dach-list'>
                        <div className='Conteiner-Home-Dach'>
                            {/* Leis */}
                            <div className='balanco-legislativo-painel-item'>
                                <h1>Leis</h1>
                                <div>
                                    <div>
                                        <p>Sancionadas</p>
                                        <h2>234</h2>
                                    </div>
                                    <div>
                                        <p>Promulgadas</p>
                                        <h2>1739</h2>
                                    </div>
                                </div>
                            </div>


                            {/* Proposições */}
                            <div className='balanco-legislativo-painel-item'>
                                <h1>Proposições</h1>
                                <div>
                                    <div>
                                        <p>Projeto de Decreto Legislativo</p>
                                        <h2>458</h2>
                                        
                                    </div>
                                    
                                    <div>
                                        <p>Projetos de emenda à Lei Orgânica</p>
                                        <h2>458</h2>
                                        
                                    </div>
                                    
                                    <div>
                                        <p>Projetos de lei</p>
                                        <h2>458</h2>
                                        
                                    </div>
                                    
                                    <div>
                                        <p>Projetos de Resolução</p>
                                        <h2>458</h2>
                                        
                                    </div>

                                    <div>
                                        <p>Lei complementar</p>
                                        <h2>278</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Envios ao Executivo */}
                            <div className='balanco-legislativo-painel-item'>
                                <h1>Envios ao Executivo</h1>
                                <div>
                                    <div>
                                        <p>Requerimentos</p>
                                        <h2>10</h2>
                                        
                                    </div>
                                    <div>
                                        <p>Indicações</p>
                                        <h2>2</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Comissões */}
                            <div className='balanco-legislativo-painel-item'>
                                <h1>Comissões</h1>
                                <div>
                                    <div>
                                        <p>Permanentes</p>
                                        <h2>10</h2>
                                    </div>
                                    <div>
                                        <p>Temporárias</p>
                                        <h2>2</h2>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>


                    <dvi className='header-Dach-div'>
                        <h1>Nossos Parlamentares</h1>
                    </dvi>

                    <div className='HomeDesktopCarrosel'>
                        <SlideFeacures />
                    </div>
                </div>


            </div>
        );
    }
}

export default homeDashboard;