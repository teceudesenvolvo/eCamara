import React, { Component } from 'react';



//Imagens


// Icones

// Components
import TopBar from '../../componets/topBarSearch'


//mudança de páginas

class Mais extends Component {
  render() {
    return (

      <div className='App-header MenuPage' >
        <div className='header-home'>
          <TopBar />
        </div>
        <div className='Mais-content'>
          <div className='Mais-item'>
            <a href='/consultas' className='Mais-icon' >
              <span className='Mais-item-title'>Processos</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/publicacoes' className='Mais-icon' >
              <span className='Mais-item-title'>Publicações</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/impulgnacoes' className='Mais-icon' >
              <span className='Mais-item-title'>Impulgnações</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/esclarecimentos' className='Mais-icon' >
              <span className='Mais-item-title'>Esclarecimentos</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href='/recursos' className='Mais-icon' >
              <span className='Mais-item-title'>Recursos</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href='/perfil' className='Mais-icon' >
              <span className='Mais-item-title'>Minha Conta</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/avalie' className='Mais-icon' >
              <span className='Mais-item-title'>Avalie</span>
            </a>
          </div>
        </div>




      </div>
    );
  }
}

export default Mais;