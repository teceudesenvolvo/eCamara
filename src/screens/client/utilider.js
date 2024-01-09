import React, { Component } from 'react';



//Imagens
import utiliderImg from '../../assets/utilider.png';
// Icones
import { 
  FaHome,
  FaShoppingCart,
  // FaShoppingBag,
 
} from "react-icons/fa";
// Components
import ProductsUtilider from '../../componets/productsUtilider';

//mudança de páginas

class utilider extends Component{
  render(){  
    return (   

        <div className='App-header' >
            <div className='utilider-container'>
              <div className='utilider-header'>
              <a href='/'  ><FaHome className='utilider-icon' /></a> 
                <img alt='logomarca' className='utilider-img' src={utiliderImg}></img>
                <a href='/carrinho'  ><FaShoppingCart className='utilider-icon' /></a> 
              </div>

                <img alt='banner' className='utilider-banner' src='https://utilider.com/wp-content/uploads/2022/04/BALDE-PARA-CERVEJA-76L.jpg'  ></img>
                <ProductsUtilider></ProductsUtilider>
            </div>
        </div>
    );
  }
}

export default utilider;