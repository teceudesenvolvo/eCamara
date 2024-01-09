import React, { Component } from 'react';

//Imagens
import utiliderImg from '../../assets/utilider.png';
// Icones
import { 
    FaHome,
    FaShoppingCart
   
  } from "react-icons/fa";
// Components

//mudança de páginas


class pagamentoUtilider extends Component {
    render() {
        return (

            <div className='App-header' >
                <div className='utilider-container'>
                <div className='utilider-header'>
              <a href='/'  ><FaHome className='utilider-icon' /></a> 
                <img alt='logomarca' className='utilider-img' src={utiliderImg}></img>
                <a href='/carrinho'  ><FaShoppingCart className='utilider-icon' /></a> 
              </div>


                    <div className='utilider-Pag-Tilulo'>
                        <h3>Compra realizada!</h3>
                    </div>

                    <div className='utilider-Desc-Pag'>
                        <h5>Compra paga com</h5>
                        <p>Cartão de crédito - ViSA - 8888</p>
                    </div>

                    <div className='utilider-Desc-Produtos'>
                        <div className='utilider-Desc-Produtos-item'>
                            <h5>Produto</h5>
                            <p>Itens comprado 1</p>
                            <p>Itens comprado 2</p>
                            <h7>Total</h7>
                        </div>
                        <div className='utilider-Desc-Produtos-item'>
                           
                            <p>R$ 30,00</p>
                            <p>R$ 30,00</p>
                            <h7>R$ 60,00</h7>
                        </div>


                    </div>

                    <div className='utilider-Ir-minhasCompras'>
                        <a href="/Compras" >Ir para minhas compras</a>
                    </div>

                </div>
            </div>
        );
    }
}

export default pagamentoUtilider;