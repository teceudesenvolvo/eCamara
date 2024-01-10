import React, { Component } from 'react';

//Imagens

// Icones

// Components
import PubliList from '../../componets/publiList';

//mudança de páginas

class Exames extends Component {
  render() {
    return (

      <div className='App-header' >
        
        <div className='favoritos agendarConsulta'>
        <h1>Relatórios</h1>
          <PubliList/> 
        </div>
      </div>
    );
  }
}

export default Exames;