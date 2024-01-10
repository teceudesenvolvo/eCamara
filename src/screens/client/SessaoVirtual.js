import React, { Component } from 'react';

//Imagens


// Icones


// Components
import ImpulgnacoesList from '../../componets/impugnacoesList';

//mudança de páginas

class categorias extends Component {
    render() {
        return (

            <div className='App-header' >
            
            <div className='favoritos agendarConsulta'>
            <h1>Impulgnações</h1>
              <ImpulgnacoesList/> 
            </div>
          </div>
        );
    }
}

export default categorias;