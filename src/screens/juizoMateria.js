import React, { Component } from 'react';



//Imagens
import Ellipse from '../assets/Ellipse.png';


// Icones
import {
    FaStar,
    FaPlus

} from 'react-icons/fa';

// Components
import MenuDashboard from '../componets/menuDashboard';


//mudança de páginas

class ServicosDashboard extends Component {
    render() {
        return (

            <div className='App-header' >
                <MenuDashboard />
                <div className='Home-Dach'>
                    <div className='header-Dach'>
                        <dvi className='header-Dach-div'>
                            <h1>Serviços</h1>
                            <a href='addProducts'><FaPlus  />Adicionar Novo</a>
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
                                    <p>Lavagem Completa Carro </p>
                                    <h1>R$ 60,00</h1>
                                    <p>Total de Vendas: 53</p>
                                </div>
                                <div>
                                    <img alt='car' src='https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg' />
                                </div>

                            </div>
                            <div>
                                <div>
                                    <p>Lavagem Completa Carro </p>
                                    <h1>R$ 60,00</h1>
                                    <p>Total de Vendas: 53</p>
                                </div>
                                <div>
                                    <img alt='car' src='https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg' />
                                </div>

                            </div>
                            <div>
                                <div>
                                    <p>Lavagem Completa Carro </p>
                                    <h1>R$ 60,00</h1>
                                    <p>Total de Vendas: 53</p>
                                </div>
                                <div>
                                    <img alt='car' src='https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg' />
                                </div>

                            </div>
                            <div>
                                <div>
                                    <p>Lavagem Completa Carro </p>
                                    <h1>R$ 60,00</h1>
                                    <p>Total de Vendas: 53</p>
                                </div>
                                <div>
                                    <img alt='car' src='https://autolider-ok6fhsopc-felipe00007.vercel.app/img/limpeza.jpg' />
                                </div>

                            </div>
                        </div>
                    </div>



                </div>


            </div>
        );
    }
}

export default ServicosDashboard;