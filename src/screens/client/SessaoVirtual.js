import React, { Component } from 'react';
import ReactPlayer from 'react-player';

//Imagens


// Icones


// Components
import HistoricoSessao from '../../componets/HistoricoSessao';

//mudança de páginas

class categorias extends Component {
  render() {
    return (

      <div className='App-header' >

        <div className='agendarConsulta'>

          <div className='section-header-sessao-virtual'>
            <div className='videoPlayerTramissao'>
              <ReactPlayer url='https://www.youtube.com/watch?v=KBWvFODawj0' />
            </div>
            
            <HistoricoSessao />

          </div>
        </div>
      </div>
    );
  }
}

export default categorias;