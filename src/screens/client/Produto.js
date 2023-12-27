import React from 'react';


//Imagens
import utiliderImg from '../../assets/utilider.png';
// Icones
import {
  FaStar,
  FaHome,
  FaShoppingCart
} from 'react-icons/fa';

// Components

import SlideFotoProduct from '../../componets/slideFotoProduct';

import SlideFeacures from '../../componets/slideFeactures';

//mudança de páginas


import Checkbox from '@mui/material/Checkbox';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };






export default function Produto() {



  return (

    <div className='App-header' >
      <div className='Produto-container'>
        <div className='utilider-header'>
        <a href='/'  ><FaHome className='utilider-icon'/></a> 
          <img className='utilider-img'
            alt='logo marca utilider'
            onClick={
              () => {
                window.location.href = "/utilider"
              }
            }
            src={utiliderImg}></img>
            <a href='/carrinho'  >< FaShoppingCart className='utilider-icon' /></a> 
        </div>

        <p className='textoDestaquesUtilider'>Produto</p>
        <h1 className='Produto-titleUtilider'>BATERIA ALFACELL</h1>
        <div className='productId'>
          <SlideFotoProduct></SlideFotoProduct>

        </div>

        <div className='desc-productUtilider' >
         
          
          <div className='desc-title'>
            <div>
            <h1 className='servico-descUtilider'>Descrição do produto </h1>
            </div>
            <div>
              <Checkbox sx={{ color: '#000' }} {...label} icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
              <Checkbox
                sx={{ color: '#000' }}
                {...label}
                icon={<BookmarkBorderIcon />}
                checkedIcon={<BookmarkIcon />}
              />
            </div>

          </div>
          <p className='txtProductUtilider'>
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
          </p>
            {/* Carrosel */}
            <p className='textoDestaques'>Quem viu este, também comprou</p>
          <SlideFeacures></SlideFeacures>
        
        </div>
        
        <div className='price-buttomUtilider' >
          <div >
            <h5 >R$ 60,00</h5>
            <h5 > <FaStar color='#FF7A00' /> 4,9</h5>
          </div>

          <input onClick={
            () => {
              window.location.href = "/carrinho"
              // this.setState({id: aviso.id}, () => {
              // (this.props.clickButton(this.state))
              //   }
            }
          } type='button' value="Comprar" />
        </div>


      </div>
     

    </div>
  );

};