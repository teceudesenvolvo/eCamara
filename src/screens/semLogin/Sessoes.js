import React, { Component } from 'react';


//Imagens

// Icones

// Components
import ListSessoes from '../../componets/List_sessoes';


//mudança de páginas

class Minhas_Compras extends Component {

  render() {
    return (

      <div className='App-header' >
        <div className='minhasCompras'>
          <ListSessoes />
        </div>

      </div>
    );
  }
}

export default Minhas_Compras;