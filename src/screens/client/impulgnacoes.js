import React, { Component } from 'react';

//Imagens


// Icones


// Components
import TopBar from '../../componets/topBarSearch'

import ImpulgnacoesList from '../../componets/impugnacoesList';

//mudança de páginas

class categorias extends Component {
    render() {
        return (

            <div className='App-header' >
            <div className='header-home'>
              <TopBar />
            </div>
            <div className='favoritos agendarConsulta'>
            <h1>Impulgnações</h1>
              <ImpulgnacoesList/> 
            </div>
          </div>
        );
    }
}

export default categorias;