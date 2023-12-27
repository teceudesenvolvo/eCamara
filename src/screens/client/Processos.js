import React, { Component } from 'react';


//Imagens

// Icones

// Components
import TopBar from '../../componets/topBarSearch'
import ProductsList from '../../componets/List_processos';


//mudança de páginas

class Minhas_Compras extends Component {

  render() {
    return (

      <div className='App-header' >
        <div className='header-home'>
          <TopBar />
        </div>
        <div className='minhasCompras'>
          <form className='formLogin agendarConsulta'>

            <h1>Filtrar:</h1>
            <input type='text' name="Especialidade" placeholder='Unidade Gestora' className='inputLogin'/>
            <input type='text' name="Especialidade" placeholder='Modalidade' className='inputLogin'/>
            <input type='text' name="Especialidade" placeholder='Nº Edital' className='inputLogin'/>
            <input type='text' name="Especialidade" placeholder='Objeto' className='inputLogin'/>
            <input type='text' name="Especialidade" placeholder='Abertura da Licitação' className='inputLogin'/>
            <input type='text' name="Especialidade" placeholder='Situação' className='inputLogin'/>
            {/* <button className='buttonLogin'>Agendar</button> */}
            <h1>Minhas Consultas:</h1>
          </form>
          <ProductsList />
        </div>

      </div>
    );
  }
}

export default Minhas_Compras;