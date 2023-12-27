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

class NotDashboard extends Component {
    render() {
        return (

            <div className='App-header' >
                <MenuDashboard />
                <div className='header-Dach'>

                </div>
                <div className='conteinar-list-Products'>
                    
                    <div className='conteinar-list-Products-div'>
                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>

                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>
                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>
                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>
                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>
                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>
                        <div className='conteinar-list-items'>
                            <div>
                                <h1 className='Serviço-order-h1'>Nome do Cliente</h1>
                                <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                            </div>
                            <div className='not-Status'>
                                <h5 className='Serviço-order-h1'>No horário</h5>
                                
                            </div>

                        </div>





                    </div>
                    <div className='Serviço-order'>
                        <div className='header-order'>
                            <dvi className='header-Dach-div-'>
                                <div >
                                    <p>Nome da Empresa</p>

                                    <p><FaStar color='#FF7A00' /> 4,9</p>
                                </div>

                                <img src={Ellipse} alt={Ellipse} ></img>
                            </dvi>

                        </div>

                        <h1 className='Serviço-order-h1'>Serviço: <span className='Serviço-order-span'>#00001</span></h1>
                        <h1 className='Serviço-order-h2'>Agendado às 12:10</h1>
                        <div className='order'>
                            <h2>Cliente:</h2>
                            <p>Nome do Cliente</p>
                            <h2>Serviço:</h2>
                            <p>Lavagem Completa</p>
                            <h2>Tamanho carro:</h2>
                            <p>Hatch</p>
                            <h2>Valor:</h2>
                            <p>R$ 60,00</p>
                            <h2>Forma de pagamento:</h2>
                            <p>Cartão de Debito</p>
                            <h2>Status</h2>
                            <p>Agendado</p>
                        </div>
                        <button type="submit" name="order" value="order" >Concluído</button>

                    </div>

                </div>


            </div>
        );
    }
}

export default NotDashboard;