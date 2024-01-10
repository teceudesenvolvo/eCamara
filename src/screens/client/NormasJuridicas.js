import React, { Component } from 'react';

//Imagens


// Icones


// Components
import EsclarecimentosList from '../../componets/esclarecimentoList';

//mudança de páginas

class categorias extends Component {
    render() {
        return (

            <div className='App-header' >
            
            <div className='favoritos agendarConsulta'>
            <h1>Normas Juridicas</h1>
              <EsclarecimentosList/> 
            </div>
          </div>
        );
    }
}

export default categorias;