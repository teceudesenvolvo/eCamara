import React, { Component } from 'react';



//Imagens


// Icones

// Components


//mudança de páginas

class Mais extends Component {
  render() {
    return (

      <div className='App-header MenuPage' >
        <div className='Mais-content'>
          <div className='Mais-item'>
            <a href='/sessoes' className='Mais-icon' >
              <span className='Mais-item-title'>Sessões</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/relatorios' className='Mais-icon' >
              <span className='Mais-item-title'>Relatórios</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/sessao-virtual' className='Mais-icon' >
              <span className='Mais-item-title'>Sessão Virtual</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/normas' className='Mais-icon' >
              <span className='Mais-item-title'>Normas Juridicas</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href='/comissoes' className='Mais-icon' >
              <span className='Mais-item-title'>Comissões</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href='/materias' className='Mais-icon' >
              <span className='Mais-item-title'>Matérias</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href='/perfil' className='Mais-icon' >
              <span className='Mais-item-title'>Minha Conta</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href='/ajuda' className='Mais-icon' >
              <span className='Mais-item-title'>Ajuda</span>
            </a>
          </div>
        </div>




      </div>
    );
  }
}

export default Mais;