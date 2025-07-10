import React from 'react';



//Imagens
import Logo from '../../assets/logoLaranga.png';
// Icones
import {

  FaSistrix,


} from "react-icons/fa";

// Components




//mudança de páginas










export default function Pesquisar() {






  return (

    <div className='App-header' >



      {/* Search */}
      <div className='header-home'>
        <a href='/' className="logoDesktop" >
          <img src={Logo} alt="logomarca e-list" />
        </a>
        <div className='inputPesquisar' >
          <p className='pPesquisar'  >Pesquisar</p>

          <FaSistrix className='PesquisarLogo' />
        </div>




      </div>


    </div>
  );

};