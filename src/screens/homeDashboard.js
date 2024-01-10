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
                            <div>
                                <div>
                                    <p>Agendamentos de hoje</p>
                                    <h1>15<span>Acompanhamento</span></h1>
                                    <p>R$ 1.250,65</p>
                                </div>
                                <div>
                                    <p>Tiket médio hoje</p>
                                    <h1>R$ 65,00</h1>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <p>Agendamentos de Maio</p>
                                    <h1>458<span>Acompanhamento</span></h1>
                                    <p>R$ 27.758,65</p>
                                </div>
                                <div>
                                    <p>Tiket médio Maio</p>
                                    <h1>R$ 85,00</h1>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <p>Visitas ao seus anuncios</p>
                                    <h1>10<span>Acompanhamento</span></h1>
                                    <p>Visitas ao anuncios</p>
                                </div>
                                <div>
                                    <p>Cliques no anuncio</p>
                                    <h1>2</h1>
                                </div>
                            </div>
                        </div>

                    </div>



                    <div className='HomeDesktopCarrosel'>
                        <SlideFeacures />
                    </div>
                </div>


            </div>
        );
    }
}

export default homeDashboard;