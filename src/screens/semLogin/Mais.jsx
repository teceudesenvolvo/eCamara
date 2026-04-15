import React, { Component } from 'react';



//Imagens


// Icones

// Components


//mudança de páginas

class Mais extends Component {
  render() {
    const camaraId = this.props.match.params.camaraId || '';
    
    return (

      <div className='App-header MenuPage' >
        <div className='Mais-content'>
          <div className='Mais-item'>
            <a href={`/sessoes/${camaraId}`} className='Mais-icon' >
              <span className='Mais-item-title'>Sessões</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href={`/relatorios/${camaraId}`} className='Mais-icon' >
              <span className='Mais-item-title'>Relatórios</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href={`/sessao-virtual/${camaraId}`} className='Mais-icon' >
              <span className='Mais-item-title'>Sessão Virtual</span>
            </a>
          </div>
          <div className='Mais-item'>
            <a href={`/normas/${camaraId}`} className='Mais-icon' >
              <span className='Mais-item-title'>Normas Juridicas</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href={`/comissoes/${camaraId}`} className='Mais-icon' >
              <span className='Mais-item-title'>Comissões</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href={`/materias/${camaraId}`} className='Mais-icon' >
              <span className='Mais-item-title'>Matérias</span>
            </a> 
          </div>
          <div className='Mais-item'>
            <a href={`/ajuda`} className='Mais-icon' >
              <span className='Mais-item-title'>Ajuda</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default Mais;