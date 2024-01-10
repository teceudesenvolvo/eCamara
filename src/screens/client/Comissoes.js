import React, { Component } from 'react';

//Imagens


// Icones


// Components
import RecursosList from '../../componets/recursosList';

//mudança de páginas

class categorias extends Component {
    render() {
        return (

            <div className='App-header' >
            <div className='favoritos agendarConsulta'>
            <h1>Recursos</h1>
              <RecursosList/> 
            </div>
          </div>
        );
    }
}

export default categorias;