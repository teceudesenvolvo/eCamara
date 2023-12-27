import React, { Component } from 'react';

//Imagens


// Icones


// Components
import TopBar from '../../componets/topBarSearch'

import EsclarecimentosList from '../../componets/esclarecimentoList';

//mudança de páginas

class categorias extends Component {
    render() {
        return (

            <div className='App-header' >
            <div className='header-home'>
              <TopBar />
            </div>
            <div className='favoritos agendarConsulta'>
            <h1>Esclarecimentos</h1>
              <EsclarecimentosList/> 
            </div>
          </div>
        );
    }
}

export default categorias;