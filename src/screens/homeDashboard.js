import React, { Component } from 'react';



//Imagens
import Ellipse from '../assets/Ellipse.png';
// Icones
import {
    FaStar,

} from 'react-icons/fa';

// Components
import MenuDashboard from '../componets/menuDashboard';


//mudança de páginas

class homeDashboard extends Component {
    render() {
        return (

            <div className='App-header' >
                <MenuDashboard />
                <div className='Home-Dach'>
                    <div className='header-Dach'>
                        <dvi className='header-Dach-div'>
                            <h1>Acompanhamento</h1>
                            <p>tempo real</p>
                        </dvi>

                        <dvi className='header-Dach-div-'>
                            <div >
                                <p>Nome da Empresa</p>

                                <p><FaStar color='#FF7A00' /> 4,9</p>
                            </div>

                            <img src={Ellipse} alt={Ellipse} ></img>
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





                </div>


            </div>
        );
    }
}

export default homeDashboard;